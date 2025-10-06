---
title: "GitHub Flow for Docs"
description: "Branching, PR reviews, CI manifest build, merge, and release notes for this repo."
audience_levels: ["beginner", "intermediate"]
personas: ["all contributors"]
categories: ["operations", "how-to"]
min_read_minutes: 5
last_reviewed: 2025-10-06
related: ["/docs/operations/vscode-setup-and-extensions.md"]
search_keywords: ["github flow", "pull request", "protected branches", "ci"]
---

Workflow

- Create a feature branch per task (match Issue number/title).
- Open a PR with a concise description and page list.
- CI builds `manifest.json`; fix frontmatter errors if CI fails.
- Require 1–2 reviews; squash merge into `main`.

PR template (suggested bullets)

- What changed and why
- Files added/updated
- Screenshots (if visual)
- Cross-links added
- Checklist: frontmatter includes `title`; links resolve locally

Release notes

- Update `docs/release-notes.md` with a short summary and links to new/changed pages.

Tips

- Keep commits small and copy-friendly for reviewers.
- Cross-link related pages (2–4) before requesting review.
- If CI fails on missing `title`, see `tools/schemas/frontmatter.schema.json` for fields.
