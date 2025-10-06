---
title: "Anthropic: Overview and Setup"
description: "Configure Anthropic, auth headers, model notes, basic tool use, and common errors."
audience_levels: ["intermediate"]
personas: ["developer", "admin"]
categories: ["providers", "how-to", "reference"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/providers/compare-providers.md", "/docs/troubleshooting/provider-errors.md"]
search_keywords: ["anthropic", "claude", "auth header", "tool use", "safety"]
---

Authenticate

- Environment variable: `ANTHROPIC_API_KEY`
- Requests require `x-api-key` and `anthropic-version` headers.

Node minimal call (pseudo)

```ts
// Use Anthropic SDK or fetch
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY!,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-haiku-20240307',
    messages: [
      { role: 'user', content: 'Say hello in one sentence.' }
    ],
    max_tokens: 200
  })
});
```

Tool use basics

- Define functions/tools with clear, minimal JSON schema.
- Keep tools idempotent; include timeouts and descriptive errors.
- Return structured, predictable JSON for the model to consume.

Required parameters

- `max_tokens` is required for message completions; choose a conservative default (e.g., 200–300) and raise only as needed.
- `anthropic-version` header must be set to a supported version.

Streaming (sketch)

```ts
// Use fetch + ReadableStream or SDK streaming helpers to incrementally read tokens.
// Render partial text in UI; allow user to cancel to reduce spend.
```

Common errors

- 401: invalid or missing key.
- 429: rate limits—apply short, capped retries.
- 5xx: transient—retry with jitter; alert if persistent.

Safety levers

- Use clear system instructions that state allowed domains and refusal rules.
- Post‑process with output filters when correctness/safety matters.

References

- Anthropic official docs (API, models, tool use)
