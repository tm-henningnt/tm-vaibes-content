---
title: "Python FastAPI Endpoint for AI"
description: "Minimal FastAPI endpoint calling OpenAI with timeouts and basic retries."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "data-analyst"]
categories: ["quickstarts", "how-to"]
min_read_minutes: 10
last_reviewed: 2025-10-06
related: ["/docs/quickstarts/try-genai-in-10-min.md", "/docs/providers/openai/auth-models-limits.md", "/docs/providers/security-best-practices.md"]
search_keywords: ["fastapi", "python openai", "retries", "timeout", "uvicorn"]
---

Overview

- Build a FastAPI route that safely calls OpenAI with a short timeout and basic retries.

Who this is for

- Python-first developers and data analysts who want a production-leaning minimal endpoint with sensible defaults.

Install

```bash
pip install fastapi uvicorn openai
```

Server

```python
import os
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AskRequest(BaseModel):
    user_message: str

@app.post("/api/chat")
async def chat(req: AskRequest):
    if not req.user_message:
        raise HTTPException(status_code=400, detail="Missing user_message")

    attempt = 0
    last_err = None
    while attempt < 3:
        attempt += 1
        try:
            # Per-call timeout using asyncio.wait_for
            result = await asyncio.wait_for(
                asyncio.to_thread(
                    client.chat.completions.create,
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are concise and friendly."},
                        {"role": "user", "content": req.user_message},
                    ],
                    max_tokens=300,
                ),
                timeout=10,  # seconds
            )
            text = result.choices[0].message.content if result.choices else ""
            return {"text": text}
        except Exception as e:
            last_err = e
            await asyncio.sleep(0.2 * attempt)
    raise HTTPException(status_code=502, detail="Upstream failed")

# Run: uvicorn main:app --reload --port 8000
```

Streaming option

- Prefer server-sent events (SSE) or chunked responses for better perceived speed. FastAPI supports async generators; ensure client cancels properly.

Test

```bash
curl -s http://localhost:8000/api/chat -H "Content-Type: application/json" -d '{"user_message":"Hello"}'
```

Notes

- Keep your `OPENAI_API_KEY` in environment variables, not code.
- Add request body validation and response schemas as needed.
- For production, prefer structured logging and redact prompt/outputs if sensitive.
- Use a process manager (e.g., uvicorn workers behind gunicorn) and set resource limits.

References

- FastAPI docs, OpenAI Python SDK
