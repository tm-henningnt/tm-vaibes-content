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

Common failures

- `ERR_MODULE_NOT_FOUND`: missing dependencies. Ensure `npm ci` step runs and lockfile is committed.
- Node mismatch: SDKs may require minimum Node versions; align `setup-node` with local.
- Frontmatter errors: our manifest build skips docs missing `title`; fix and rerun.

Local reproduction

- Run `npm ci && npm run build:manifest` locally to mirror CI. Compare Node versions (`node -v`).
