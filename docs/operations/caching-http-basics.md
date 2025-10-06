---
title: "HTTP Caching Basics"
description: "Understand strong/weak validators, ETag vs Last-Modified, and Cache-Control."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "PM"]
categories: ["operations", "concepts"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/operations/performance-principles.md", "/docs/operations/content-sync-deep-dive.md"]
search_keywords: ["etag", "last-modified", "cache-control", "conditional request"]
---

Validators

- Strong: exact content match; Weak: semantically equivalent.

ETag vs Last-Modified

- ETag is a server-chosen token; Last-Modified is a timestamp.
- Clients send `If-None-Match` or `If-Modified-Since`; servers can return `304 Not Modified`.

Cache-Control

- `max-age`, `s-maxage`, `stale-while-revalidate`; avoid `no-store` unless necessary.

