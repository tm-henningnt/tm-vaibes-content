---
title: "Troubleshooting GitHub Actions (Manifest Build)"
description: "Fix failing manifest builds due to Node version mismatches, missing deps, or frontmatter errors."
audience_levels: ["beginner", "intermediate"]
personas: ["developer"]
categories: ["troubleshooting"]
min_read_minutes: 5
last_reviewed: 2025-10-06
related: ["/docs/operations/github-flow-for-docs.md"]
search_keywords: ["github actions", "ci", "node version", "dependencies", "frontmatter"]
---

Checklist

- Node version: align local and CI (see setup-node in workflow).
- Dependencies: run `npm ci` and rerun build locally.
- Frontmatter: ensure each doc has `title` and valid types.

Logs

- Inspect the Actions run logs for stack traces and missing packages.

Fix

- Update `actions/setup-node` version, cache key, or lockfile as needed; commit changes and re-run.

