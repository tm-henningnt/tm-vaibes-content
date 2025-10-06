---
title: "Operations: Backups & Retention"
description: "Soft-deletes, archival flags, and reporting policies for sessions."
audience_levels: ["intermediate"]
personas: ["admin", "developer"]
categories: ["operations"]
tags: ["retention", "archival", "soft-delete"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## Policy sketch
- Soft-delete hides from UI; archival freezes edits.
- Periodic export of session metadata for analytics.

## Rotation cadence
- Rotate backups daily; keep dailies for 14 days, weeklies for 8 weeks, monthlies for 12 months.
- Test restore quarterly from each tier; document RPO/RTO targets.

## Exports
- Export session metadata (not raw prompts/outputs) as CSV/Parquet.
- Include: id, timestamps, model, tokens, latency, status.
- Store in restricted bucket with lifecycle rules.
