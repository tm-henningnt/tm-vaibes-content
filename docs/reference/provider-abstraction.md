---
title: "Reference: Provider Abstraction"
description: "A thin layer to unify retries, timeouts, and fallbacks across AI providers."
audience_levels: ["intermediate", "advanced"]
personas: ["developer"]
categories: ["reference"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/providers/compare-providers.md", "/docs/troubleshooting/provider-errors.md"]
search_keywords: ["abstraction", "provider", "retries", "timeouts", "fallbacks"]
---

Interface (TS)

```ts
export interface AIClient {
  chat(params: { messages: any[]; model?: string; maxTokens?: number; timeoutMs?: number }): Promise<{ text: string; tokensIn?: number; tokensOut?: number }>;
}
```

Implementation notes

- Add per-call timeout, retries with jitter, and optional fallback model.
- Normalize error objects with `code`, `status`, `retryable`.
- Capture tokens/latency for metrics.

Error normalization (example)

```ts
function normalize(err: any) {
  const status = err.status ?? err.response?.status ?? 500;
  const code = err.code ?? err.response?.data?.error?.code ?? 'UNKNOWN';
  const retryable = [429, 500, 502, 503, 504].includes(status);
  return { status, code, retryable, message: String(err.message || code) };
}
```

Fallbacks

- If a call fails or times out, optionally retry on a smaller model; record fallback usage in metrics.
