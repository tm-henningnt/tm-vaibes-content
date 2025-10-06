---
title: "Performance Principles"
description: "Keep pages responsive with caching, streaming, and smart fetch strategies."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "PM"]
categories: ["operations", "concepts"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/operations/caching-http-basics.md", "/docs/operations/deploy-vercel.md"]
search_keywords: ["performance", "streaming", "caching", "etag", "isr"]
---

Principles

- Aim for <~2s list renders; use pagination or virtualized lists.
- Stream AI outputs to improve perceived speed.
- Cache and revalidate content (ISR + on-demand revalidation).

Measure

- Track P50/P95 latency for pages and API routes; budget tokens.

