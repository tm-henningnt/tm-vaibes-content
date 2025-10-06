---
title: "OpenAI: Auth, Models, and Limits"
description: "Authenticate safely, map environment variables, and choose a sensible model for your use case."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "admin"]
categories: ["providers", "how-to", "reference"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/providers/security-best-practices.md", "/docs/quickstarts/js-server-route.md", "/docs/quickstarts/python-fastapi.md"]
search_keywords: ["openai auth", "model selection", "rate limits", "server-side keys"]
---

Authenticate safely

- Store your key in an environment variable; never ship it to the browser.
- Name: `OPENAI_API_KEY`. Rotate if leaked or shared broadly.

Node example

```ts
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const res = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are concise and helpful.' },
    { role: 'user', content: 'Summarize the benefits of server-side API calls.' }
  ]
});
```

Python example

```python
from openai import OpenAI
import os
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
res = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are concise and helpful."},
        {"role": "user", "content": "Summarize the benefits of server-side API calls."}
    ]
)
```

Model selection (guidelines)

- For cost-effective, general-purpose chat and small tools: try `gpt-4o-mini` (or similar small multimodal model).
- For more complex reasoning or tool orchestration: consider larger 4o or o-series models.
- For embeddings and RAG: use the recommended embeddings model from the provider docs.
- Always check current provider docs for latest models, capabilities, and token limits.

Limits and practical guardrails

- Add `max_tokens` and keep prompts compact to control latency and cost.
- Stream when building UIs to improve perceived performance.
- Handle 401/403/429/5xx with short retries and backoff. See `/docs/troubleshooting/provider-errors.md`.

References

- OpenAI API overview and model reference

