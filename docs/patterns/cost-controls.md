---
title: "Cost Controls for AI Apps"
description: "Apply max tokens, streaming, truncation, caching hints, and retries to manage spend."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["patterns"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/evaluations/latency-cost-tradeoffs.md", "/docs/patterns/workflows/batch-processing.md"]
search_keywords: ["cost", "tokens", "streaming", "truncation", "cache"]
---

Controls

- Set `max_tokens` and concise prompts; prefer short answers by default.
- Use streaming UIs; early-cancel when user has enough.
- Truncate long histories; summarize earlier context.
- Cache frequent prompts or retrievals where feasible.
- Add backoff and cap retries to bound waste.

Monitoring

- Track tokens and latency by route; alert when thresholds exceeded.

