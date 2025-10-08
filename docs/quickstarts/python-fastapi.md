---
title: "Python FastAPI Endpoint for AI"
description: "Ship a minimal-yet-safe FastAPI endpoint that calls OpenAI, returns structured JSON, and includes retries, timeouts, and monitoring hooks."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "data-analyst"]
categories: ["quickstarts"]
min_read_minutes: 15
last_reviewed: 2025-05-05
related: ["/docs/quickstarts/try-genai-in-10-min.md", "/docs/quickstarts/js-server-route.md", "/docs/concepts/safety-basics.md"]
search_keywords: ["fastapi", "openai python", "structured outputs", "async timeout", "llm retries"]
show_toc: true
---

FastAPI is a great fit for lightweight AI endpoints because it pairs async I/O with modern validation and documentation tooling. In this quickstart you will scaffold a fully typed POST route that calls OpenAI’s Chat Completions API, times out stalled requests, and returns predictable JSON for downstream consumers.
Along the way you’ll wire retries, structured logging hints, and a pytest smoke test so the service is production-ready on day one.

**You’ll learn**

- How to model request and response payloads with Pydantic for strong typing.
- How to call the OpenAI Python SDK asynchronously with timeouts and exponential backoff.
- How to expose both buffered and streaming responses without leaking API keys.
- How to add observability hooks (logging, metrics) and guardrails (rate limiting, quotas).
- How to validate the endpoint with pytest and `httpx` before shipping.

## Project scaffolding

1. Create and activate a virtual environment, then install the required packages:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn[standard] openai httpx pytest python-dotenv
   ```
2. Add an `.env` file with `OPENAI_API_KEY=...` and load it via `python-dotenv` or your deployment platform’s secret manager.
3. Create `main.py` for the FastAPI app and `tests/test_chat.py` for the smoke test.
4. Review `/docs/quickstarts/js-server-route.md` to mirror the same server-only key handling patterns in JavaScript environments.

## Define schemas and the OpenAI client

Use Pydantic models to validate inputs and outputs. Keeping the client global avoids reconnecting on each request while letting you inject test doubles.

```python
# main.py
from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from openai import AsyncOpenAI, APIError
from pydantic import BaseModel, Field, constr

load_dotenv()
logger = logging.getLogger("ai-endpoint")
logger.setLevel(logging.INFO)

class ChatRequest(BaseModel):
    user_message: constr(strip_whitespace=True, min_length=1, max_length=2_000)
    conversation_id: Optional[str] = Field(
        default=None,
        description="Opaque identifier for grouping messages."
    )

class ChatUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatResponse(BaseModel):
    text: str
    model: str
    finish_reason: Literal["stop", "length", "content_filter", "tool_calls", "error"]
    usage: ChatUsage

@asynccontextmanager
def lifespan(app: FastAPI):
    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    app.state.openai_client = client
    try:
        yield
    finally:
        await client.close()

app = FastAPI(title="AI Chat Endpoint", lifespan=lifespan)

async def get_openai_client(request: Request) -> AsyncOpenAI:
    return request.app.state.openai_client
```

## Implement the chat route with retries

This handler validates the payload, applies a per-request timeout, retries transient provider errors, and returns structured JSON.

```python
RETRIABLE_STATUS_CODES = {429, 500, 502, 503, 504}
MAX_ATTEMPTS = 3
BACKOFF_BASE_MS = 300
REQUEST_TIMEOUT_SECONDS = 20

@app.post("/api/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def create_chat_completion(
    payload: ChatRequest,
    openai_client: AsyncOpenAI = Depends(get_openai_client)
) -> ChatResponse:
    attempt = 0
    last_error: Exception | None = None

    while attempt < MAX_ATTEMPTS:
        attempt += 1
        try:
            result = await asyncio.wait_for(
                openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a concise and friendly assistant."},
                        {"role": "user", "content": payload.user_message}
                    ],
                    max_tokens=400,
                    temperature=0.3,
                    timeout=REQUEST_TIMEOUT_SECONDS - 2
                ),
                timeout=REQUEST_TIMEOUT_SECONDS
            )

            choice = result.choices[0]
            usage = result.usage or {}
            logger.info(
                "chat_completion.success",
                extra={
                    "conversation_id": payload.conversation_id,
                    "model": result.model,
                    "prompt_tokens": usage.get("prompt_tokens"),
                    "completion_tokens": usage.get("completion_tokens"),
                    "total_tokens": usage.get("total_tokens"),
                    "attempt": attempt
                }
            )

            return ChatResponse(
                text=choice.message.content or "",
                model=result.model,
                finish_reason=choice.finish_reason or "stop",
                usage=ChatUsage(**usage)
            )
        except (APIError, asyncio.TimeoutError) as error:
            last_error = error
            status_code = getattr(error, "status_code", getattr(error, "status", None))
            should_retry = status_code in RETRIABLE_STATUS_CODES or isinstance(error, asyncio.TimeoutError)
            logger.warning(
                "chat_completion.retry",
                extra={"attempt": attempt, "status": status_code, "retry": should_retry}
            )
            if not should_retry or attempt >= MAX_ATTEMPTS:
                break
            await asyncio.sleep((BACKOFF_BASE_MS * attempt) / 1_000)
        except Exception as error:  # non-retriable issues
            last_error = error
            logger.exception("chat_completion.failure", extra={"attempt": attempt})
            break

    raise HTTPException(status_code=502, detail="Provider unavailable") from last_error
```

## Stream responses for faster feedback

FastAPI supports async generators. Convert the provider stream into chunks and send them as Server-Sent Events (SSE) or chunked plaintext while keeping the OpenAI key on the server.

```python
from sse_starlette.sse import EventSourceResponse

@app.post("/api/chat/stream")
async def stream_chat_completion(
    payload: ChatRequest,
    openai_client: AsyncOpenAI = Depends(get_openai_client)
) -> Response:
    stream = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        stream=True,
        messages=[
            {"role": "system", "content": "You are a concise and friendly assistant."},
            {"role": "user", "content": payload.user_message}
        ]
    )

    async def event_generator():
        async for event in stream:
            delta = event.choices[0].delta.content or ""
            yield {"event": "token", "data": delta}
        yield {"event": "done", "data": ""}

    return EventSourceResponse(event_generator())
```

On the client, consume `/api/chat/stream` via `EventSource` in the browser or `httpx.AsyncClient` in Python without ever touching the API key directly.

## Harden the service

- **Authentication and quotas.** Protect the endpoint with your existing auth (JWT, API key) and enforce per-user/request token budgets before calling OpenAI.
- **Input sanitization.** Reject prompts that exceed length or contain disallowed HTML/Markdown if you render output directly.
- **Observability.** Export metrics (latency, success rate, token counts) via Prometheus or OpenTelemetry, and include request IDs in logs for auditability.
- **Error budgets.** Implement circuit breakers using libraries like `aiobreaker` so persistent provider failures return quickly and fail open.
- **Data privacy.** Redact secrets from logs, and offer an opt-out flag for storing prompts in analytics systems.

## Test with pytest and httpx

Create a lightweight test that spins up the FastAPI app and mocks the OpenAI client so you can iterate without live tokens.

```python
# tests/test_chat.py
import pytest
from fastapi.testclient import TestClient

from main import app, ChatResponse

class DummyOpenAI:
    class _Completions:
        @staticmethod
        async def create(**_kwargs):
            class Choice:
                finish_reason = "stop"
                message = type("Msg", (), {"content": "Hello"})()

            usage = {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15}

            return type(
                "Result",
                (),
                {
                    "choices": [Choice()],
                    "usage": usage,
                    "model": "gpt-4o-mini"
                }
            )()

    class _Chat:
        completions = _Completions()

    chat = _Chat()

@pytest.fixture(autouse=True)
def inject_dummy(monkeypatch):
    monkeypatch.setattr(app.state, "openai_client", DummyOpenAI())
    yield

client = TestClient(app)

def test_chat_completion_success():
    response = client.post("/api/chat", json={"user_message": "Hi"})
    assert response.status_code == 200
    body = ChatResponse(**response.json())
    assert body.text == "Hello"
    assert body.usage.total_tokens == 15
```

Run the test suite and the development server:

```bash
pytest
uvicorn main:app --reload --port 8000
```

## Deployment notes

- Run the app behind a process manager (for example, `uvicorn --workers 2 --loop uvloop`) or containerize it with a health check that exercises `/api/chat`.
- Configure HTTPS termination (FastAPI behind a reverse proxy such as Nginx, Caddy, or Azure App Service).
- Use dependency injection to switch between live and mock OpenAI clients for staging environments.

## References

- FastAPI — [Path operation decorators](https://fastapi.tiangolo.com/tutorial/path-operation-decorators/)
- OpenAI — [Python SDK reference](https://platform.openai.com/docs/api-reference/chat/create)
- MDN — [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- Google Cloud — [Designing resilient systems with retries and backoff](https://cloud.google.com/architecture/best-practices-for-building-resilient-applications)
