---
title: Try GenAI in 10 minutes
description: Spin up a safe server-side endpoint in Node or Python that calls OpenAI and returns a structured response.
audience_levels: [beginner]
personas: [non-technical, PM, developer]
categories: [quickstarts]
min_read_minutes: 10
last_reviewed: 2025-03-15
related: ["/docs/quickstarts/js-server-route.md", "/docs/quickstarts/python-fastapi.md", "/docs/concepts/what-is-genai.md"]
search_keywords: ["openai quickstart", "first ai app", "server-side api key", "node", "python"]
show_toc: true
---

## Summary
You can experience a production-friendly GenAI workflow in under ten minutes by keeping your API key on the server and returning structured JSON. This quickstart walks you through a minimal Node.js or Python endpoint, explains each parameter, and highlights the next steps for hardening. It is designed for new builders and PMs who want a tangible demo before diving deeper.

### You'll learn
- How to configure environment variables and keep API keys off the client.
- How to call the OpenAI Responses API with sensible defaults.
- How to log token usage, latency, and metadata for future monitoring.
- How to return JSON your UI—or teammate—can parse safely.
- How to extend the quickstart into the deeper server-route guides.

## Before you start
- **Create an OpenAI API key** from https://platform.openai.com/ and copy it once.<sup>1</sup>
- **Install runtime prerequisites**: Node.js 18+ and npm, or Python 3.9+ and `pip`.
- **Pick a port** that is free on your machine (defaults below work for most setups).

Set the API key securely in your shell:

```bash
# macOS/Linux
export OPENAI_API_KEY="sk-your-key"

# Windows PowerShell
$Env:OPENAI_API_KEY = "sk-your-key"
```

## Option A — Node.js single-file server
Create a new folder (e.g., `genai-demo`) and inside it run `npm init -y && npm install openai@^4`. Then create `server.mjs`:

```js
import http from "node:http";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/demo") {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: "Explain generative AI to a product manager in 3 bullet points.",
      max_output_tokens: 200,
      temperature: 0.3,
      metadata: { feature: "10min-quickstart" }
    });

    const usage = response.usage;
    const message = response.output_text ?? "No response";

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message,
        usage,
        timings: response.timings,
      })
    );
  } catch (error) {
    console.error("OpenAI call failed", error);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream failure" }));
  }
});

server.listen(8787, () => {
  console.log("Node server ready at http://localhost:8787/demo");
});
```

Run the server with `node server.mjs`, then `curl -X POST http://localhost:8787/demo`. You should see a JSON payload containing the assistant message, token usage, and optional timing metadata.

### How it works
- `model`: `gpt-4o-mini` keeps cost low while handling general chat use cases.<sup>1</sup>
- `max_output_tokens`: caps spend and latency; increase only if you need longer answers.
- `metadata`: key-value pairs surface in logs for debugging and analytics.
- Errors: returning `502` keeps client logs clean and distinguishes upstream issues from your server bugs.

## Option B — Python single-file server
In a clean directory run `python -m venv .venv && source .venv/bin/activate` (`.venv\Scripts\activate` on Windows) and `pip install openai`. Then create `server.py`:

```python
from __future__ import annotations

import json
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Dict

from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

INPUT_PRICE = 0.00015 / 1000
OUTPUT_PRICE = 0.00060 / 1000


def estimate_cost(usage: Dict[str, Any]) -> float:
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    return input_tokens * INPUT_PRICE + output_tokens * OUTPUT_PRICE


class DemoHandler(BaseHTTPRequestHandler):
    def do_POST(self) -> None:  # noqa: N802 (framework naming)
        if self.path != "/demo":
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input="Explain generative AI to a product manager in 3 bullet points.",
                max_output_tokens=200,
                temperature=0.3,
                metadata={"feature": "10min-quickstart"},
            )
        except Exception as error:  # Replace with narrower errors once in production.
            self.log_error("OpenAI call failed: %s", error)
            self.send_response(HTTPStatus.BAD_GATEWAY)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error":"Upstream failure"}')
            return

        usage = response.usage or {}
        payload = {
            "message": getattr(response, "output_text", "No response"),
            "usage": usage,
            "estimated_cost": round(estimate_cost(usage), 6),
        }

        body = json.dumps(payload).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    port = int(os.environ.get("PORT", "8788"))
    server = HTTPServer(("", port), DemoHandler)
    print(f"Python server ready at http://localhost:{port}/demo")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down…")
        server.server_close()


if __name__ == "__main__":
    main()
```

Run `python server.py` and send a request with `curl -X POST http://localhost:8788/demo`. The response includes an estimated USD cost based on OpenAI’s published GPT-4o mini pricing.

### Parameter tour
- `temperature=0.3`: keeps answers consistent enough for demos; raise the value for brainstorming.
- `metadata`: store feature flags or experiment IDs for observability tools.
- `estimated_cost`: demonstrates how to combine usage data with prices from [/docs/concepts/token-costs-latency.md](/docs/concepts/token-costs-latency.md).
- `HTTPStatus` codes: choose distinct status codes so clients can handle retries versus validation errors.

## Observability checklist
- Log `response.id`, `usage`, latency, and prompt hashes—but not raw user content—per your data retention policy.
- Capture failures separately from success logs for easier dashboards.
- Connect these endpoints to a tracing tool such as OpenTelemetry once you move beyond a demo; see [/docs/patterns/observability-context.md](/docs/patterns/observability-context.md).

## Next steps
- Harden server routes with streaming, retries, and structured validation in [/docs/quickstarts/js-server-route.md](/docs/quickstarts/js-server-route.md) and [/docs/quickstarts/python-fastapi.md](/docs/quickstarts/python-fastapi.md).
- Brush up on prompting strategies in [/docs/concepts/prompting-styles.md](/docs/concepts/prompting-styles.md).
- Learn safety basics before shipping prototypes in [/docs/concepts/safety-basics.md](/docs/concepts/safety-basics.md).

## References
1. OpenAI. “Pricing.” Accessed March 15, 2025. https://openai.com/pricing
2. OpenAI. “Responses API.” Accessed March 15, 2025. https://platform.openai.com/docs/guides/responses-api
3. Microsoft Learn. “Set and use environment variables on Windows.” Accessed March 15, 2025. https://learn.microsoft.com/windows/win32/procthread/environment-variables

