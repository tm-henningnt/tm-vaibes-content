---
title: "Tutorial: Cost Guardrails"
description: "Implement budgets and alerts across routes; add token caps, streaming, and summaries."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["tutorials"]
min_read_minutes: 12
last_reviewed: 2025-10-06
related: ["/docs/patterns/cost-controls.md", "/docs/evaluations/latency-cost-tradeoffs.md"]
search_keywords: ["budget", "alerts", "tokens", "streaming", "summaries"]
---

Budgets

- Per-route token ceilings and P95 latency targets.
- Abort and surface a friendly message when exceeding caps.

Alerts

- Emit metrics per route; alert on token/latency thresholds and 5xx spikes.

Controls

- Set `max_tokens`, truncate histories, summarize earlier turns, stream outputs.

