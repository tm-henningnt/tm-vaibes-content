---
title: "Deploy to Vercel (ISR Enabled)"
description: "Deploy the docs/app to Vercel with ISR and environment variables configured."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "admin"]
categories: ["operations", "how-to"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/operations/content-sync-deep-dive.md", "/docs/operations/performance-principles.md"]
search_keywords: ["vercel", "deploy", "isr", "environment variables"]
---

Steps

- Import repo into Vercel; select framework preset if applicable.
- Set environment variables (e.g., `OPENAI_API_KEY`, revalidation secret, provider keys).
- Enable ISR/on-demand revalidation routes as needed.

Build settings

- Node version: match local; install commands from `package.json`.
- Verify output targets and route handlers are included in deploy.

Domains

- Add custom domains; verify SSL; configure redirects if moving from another host.

