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

Choose a model by task

- Brainstorming and rewriting: small 4o/mini models for speed and cost.
- Multi-step reasoning or tool orchestration: larger 4o/o series with tool support.
- RAG: pair chat model with the provider’s embeddings model; evaluate faithfulness.
- Long documents: check context window limits and stream to improve UX.

Limits and practical guardrails

- Add `max_tokens` and keep prompts compact to control latency and cost.
- Stream when building UIs to improve perceived performance.
- Handle 401/403/429/5xx with short retries and backoff. See `/docs/troubleshooting/provider-errors.md`.

Tokens in practice

- Tokens roughly map to subword pieces; long prompts or outputs increase cost and latency.
- Summarize or truncate early conversation turns to stay within budget.

Common pitfalls

Parameters primer

- temperature: 0.0–1.0. Lower = more deterministic. Start at 0.2–0.4 for consistent outputs; raise for brainstorming.
- top_p: nucleus sampling. Use either temperature or top_p, not both; default is fine for most tasks.
- presence_penalty: encourages new topics; frequency_penalty: penalizes repetition. Keep at 0 unless you see loops/repetition.
- max_tokens: upper bound on output length. Smaller values reduce cost and latency; raise only when you need longer answers.

Streaming vs one-shot

- Streaming improves perceived speed and lets users interrupt. Prefer streaming in UI routes and one-shot for back-end jobs.
- In streaming, render partial text and handle user cancellation to save cost.

Quickstart checklist

- [ ] Keep your key server-side only
- [ ] Start with a small model for most tasks; escalate selectively
- [ ] Set `max_tokens` and watch latency/tokens
- [ ] Add short retries with jitter (429/5xx)
- [ ] Stream in UI contexts; one-shot in batch jobs

FAQ

- Which model should I start with? For general chat and small tools, start with a cost‑effective 4o‑mini tier. If results lack depth, try a larger 4o variant.
- How do I reduce cost? Trim prompts, summarize conversation history, set `max_tokens`, stream early tokens, and cache repeated prompts.
- Are responses deterministic? Lower temperature improves determinism, but outputs can still vary. For strict determinism, pair prompts with automated checks.

- Missing API key or wrong environment: confirm server-only keys.
- Over-long prompts: trim boilerplate, move instructions to system role, and cache static context.
- Ignoring rate limits: add backoff and per-user quotas on your server routes.

References

- OpenAI API overview and model reference
