---
title: "Reference: Revalidation API"
description: "Token-secured endpoint to refresh cached docs and manifest after GitHub updates."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["reference"]
tags: ["revalidation", "webhook", "cache"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## Endpoint
- `POST /api/revalidate` with header `x-isr-token: <token>`

## Behavior
- Triggers on-demand fetch; validates ETags and updates caches.
