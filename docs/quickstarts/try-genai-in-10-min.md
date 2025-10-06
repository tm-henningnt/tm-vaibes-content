---
title: "Try GenAI in 10 Minutes"
description: "Zero-to-first result using OpenAI from a safe server endpoint in Node or Python."
audience_levels: ["beginner"]
personas: ["non-technical", "PM", "developer"]
categories: ["quickstarts", "how-to"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/quickstarts/js-server-route.md", "/docs/quickstarts/python-fastapi.md", "/docs/wizard/overview.md", "/docs/how-to/pick-your-path.md"]
search_keywords: ["openai quickstart", "first ai app", "server-side api key", "node", "python"]
---

What you’ll build

- A minimal, safe server endpoint that calls OpenAI and returns a helpful response to a simple prompt. No client-side keys.

Prerequisites

- An OpenAI account and API key
- Node 18+ or Python 3.9+

1) Set your API key safely

- On macOS/Linux: `export OPENAI_API_KEY=sk-...`
- On Windows (PowerShell): `$env:OPENAI_API_KEY = "sk-..."`

2) Quick path A: Node (single file)

- Create `server.mjs`:

```js
import http from 'node:http';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  try {
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise and friendly assistant.' },
        { role: 'user', content: 'In one paragraph, explain what GenAI is.' }
      ],
      max_tokens: 200
    });
    const text = result.choices?.[0]?.message?.content ?? 'No response';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ text }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request failed' }));
  }
});

server.listen(8787, () => console.log('Listening on http://localhost:8787'));
```

- Run: `node server.mjs`
- Visit: `http://localhost:8787`

2) Quick path B: Python (single file)

- Create `server.py`:

```python
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            result = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a concise and friendly assistant."},
                    {"role": "user", "content": "In one paragraph, explain what GenAI is."}
                ],
                max_tokens=200,
            )
            text = result.choices[0].message.content if result.choices else "No response"
            body = ("{" + f"\"text\": \"{text.replace('\\', '\\\\').replace('\"', '\\\"')}\"" + "}").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error":"Request failed"}')

HTTPServer(("", 8788), Handler).serve_forever()
```

- Run: `python server.py`
- Visit: `http://localhost:8788`

What’s next

- Safer server routes and retries: see `/docs/quickstarts/js-server-route.md` and `/docs/quickstarts/python-fastapi.md`.
- Pick your learning path: `/docs/how-to/pick-your-path.md`.
- Understand limits and models: `/docs/providers/openai/auth-models-limits.md`.

References

- OpenAI API reference (Models, Chat Completions)

