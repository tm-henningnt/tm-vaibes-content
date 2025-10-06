---
title: "Troubleshooting Provider Errors"
description: "Decode 401/403/429/5xx responses and add robust retries and timeouts."
audience_levels: ["beginner", "intermediate"]
personas: ["developer"]
categories: ["troubleshooting", "how-to"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/providers/openai/auth-models-limits.md", "/docs/providers/security-best-practices.md"]
search_keywords: ["http 429", "rate limit", "openai error", "retry", "timeout"]
---

Common statuses

- 401/403: invalid key, wrong header, or insufficient permissions.
- 404/400: wrong endpoint or (Azure) deployment name mismatch.
- 429: rate limit—retry with short exponential backoff and jitter.
- 5xx: transient provider outage—retry with jitter; circuit-break if sustained.

Node retry skeleton

```ts
async function callWithRetries(fn, attempts = 3) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try { return await fn(); } catch (e) {
      last = e; await new Promise(r => setTimeout(r, 250 * i));
    }
  }
  throw last;
}
```

Python retry skeleton

```python
import time

def call_with_retries(fn, attempts=3):
  last = None
  for i in range(1, attempts+1):
    try:
      return fn()
    except Exception as e:
      last = e
      time.sleep(0.25 * i)
  raise last
```

Operational tips

- Add client-side timeouts to prevent requests from hanging indefinitely.
- Log metadata (status, request ID) rather than full prompts/outputs.
- Break glass: fall back to a smaller model or cached answer when upstream is unavailable.

