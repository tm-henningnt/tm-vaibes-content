---
title: "Observability for AI Context"
description: "Log the right metadata (not raw prompts) with correlation IDs and PII avoidance."
audience_levels: ["intermediate"]
personas: ["developer", "PM"]
categories: ["patterns", "operations"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/operations/observability.md", "/docs/providers/security-best-practices.md"]
search_keywords: ["observability", "metadata", "pii", "correlation id", "logs"]
---

Log minimal metadata

- request_id, user_id/hash, tool/model name, tokens in/out, latency, status.
- Avoid storing raw prompts/outputs unless policy allows with retention.

Trace

- Correlate user request → router → tool calls → response.
- Sample at a low rate for high-traffic endpoints.

PII avoidance

- Redact obvious PII fields; prefer hashed identifiers.

Examples

- Log: `{ request_id, route: '/api/chat', model: 'gpt-4o-mini', ms: 812, tokens_in: 120, tokens_out: 180, status: 200 }`
- Trace: user request → router → tool:createTicket → provider call; sample 1–5% on high-traffic routes.

Dashboards

- P50/P95 latency, error rates by route, tokens per request, top tools/models by usage.
