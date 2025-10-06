---
title: "Tutorial: Observability End-to-End"
description: "Add logs, traces, and dashboards for AI routes with sampling and PII safeguards."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["tutorials", "operations"]
min_read_minutes: 12
last_reviewed: 2025-10-06
related: ["/docs/patterns/observability-context.md", "/docs/providers/security-best-practices.md"]
search_keywords: ["observability", "tracing", "dashboards", "sampling", "pii"]
---

Scope

- Instrument server routes: request_id, model/tool, tokens, latency, outcome.
- Trace across router → tool calls; sample at low rates.
- Build a dashboard: P50/P95, error rates, top routes.

PII guardrails

- Redact prompts/outputs; store only metadata unless policy allows.

