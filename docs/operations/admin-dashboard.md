---
title: "Admin Dashboard: Sync Health"
description: "Define green/stale thresholds and how to force content revalidation."
audience_levels: ["beginner", "intermediate"]
personas: ["admin"]
categories: ["operations", "reference"]
min_read_minutes: 4
last_reviewed: 2025-10-06
related: ["/docs/operations/content-sync-deep-dive.md", "/docs/troubleshooting/revalidation-failures.md"]
search_keywords: ["dashboard", "health", "manifest", "revalidation"]
---

Signals

- Manifest hash: last built content identifier.
- Last fetch: timestamp from content source (webhook or poll).
- Status: green (<30m), stale (>=30m), red (webhook errors or 5xx streak).

Actions

- Force revalidation: trigger the on-demand revalidate endpoint.
- Inspect webhook deliveries for recent failures or retries.

Notes

- Show only metadata; avoid rendering secrets or full payloads.

