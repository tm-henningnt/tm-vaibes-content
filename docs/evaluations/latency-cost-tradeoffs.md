---
title: "Latency–Cost Tradeoffs"
description: "Balance perceived speed with spend: model selection, streaming, caching, and truncation."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["evaluations", "patterns"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/patterns/cost-controls.md", "/docs/quickstarts/js-server-route.md"]
search_keywords: ["latency", "cost", "streaming", "model size", "cache"]
---

Levers

- Smaller models for simple tasks; escalate only when needed.
- Stream first tokens; prioritize concise outputs.
- Cache heavy retrievals and summaries.
- Trim conversation history; summarize earlier turns.

Measure

- Track P50/P95 latency and tokens per route; compare before/after changes.

