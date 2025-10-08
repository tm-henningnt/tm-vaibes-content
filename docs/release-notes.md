---
title: "Release Notes"
description: "Human-friendly changelog for doc updates that change outcomes for readers."
audience_levels: ["beginner", "intermediate", "advanced"]
personas: ["non-technical", "PM", "developer", "admin"]
categories: ["release-notes"]
tags: ["changelog"]
min_read_minutes: 3
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## 2025-10-08
- Manifest builder now emits `slug`, `category`, and ISO `lastUpdated` fields to match the consuming app's schema.
- Frontmatter schema enforces at least one category and allows `related_project_types` for downstream filtering.
- Added uniqueness + min item constraints for array metadata and support for optional `primary_category` overrides.
- Added `npm run check:frontmatter` helper to surface duplicate or missing array metadata across docs.
- GitHub Actions workflow now runs frontmatter lint + checks on every PR before rebuilding the manifest.
- Manifest schema v2025.10.1 adds `sourcePath`/`sourceUrl`, and the builder now emits both for every doc entry.
- Manifest generation supports `.env` overrides for `DOCS_REPO_RAW_BASE_URL` and `DOCS_REPO_MANIFEST_PATH` (see `.env.example`).

## 2025-10-06
- Initial scaffold with 12 core pages, schemas, and manifest builder.
