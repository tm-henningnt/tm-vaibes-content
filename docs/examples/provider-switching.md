---
title: Provider switching with a thin abstraction
description: Swap AI providers behind a small interface and avoid vendor lock-in.
audience_levels: [intermediate]
personas: [developer]
categories: [examples]
min_read_minutes: 9
last_reviewed: 2025-10-08
tags: [providers, abstraction]
related: ["/docs/providers/compare-providers.md"]
search_keywords: ["provider switch", "abstraction"]
show_toc: true
---

## Approach
- Define an interface; map request/response; manage errors and retries
