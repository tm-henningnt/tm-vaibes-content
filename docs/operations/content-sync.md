---
title: "Operations: Content Synchronization"
description: "Branch/path selection, ETags and If-None-Match, and GitHub webhook revalidation."
audience_levels: ["intermediate", "advanced"]
personas: ["admin", "developer"]
categories: ["operations"]
tags: ["sync", "etag", "webhook"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## Checklist
- Use authenticated fetches for private previews.
- Cache with ETags; send `If-None-Match` to avoid redundant bytes.
- Expose token-secured revalidation endpoint.
- Persist manifest hash + fetch timestamp for admin health view.
