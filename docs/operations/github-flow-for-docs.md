---
title: "Operations: GitHub flow for documentation releases"
description: "Standardize how contributors branch, review, and publish documentation so the manifest and site stay healthy."
audience_levels: ["beginner", "intermediate"]
personas: ["non-technical", "PM", "developer", "admin"]
categories: ["operations"]
min_read_minutes: 10
last_reviewed: 2025-03-20
related: ["/docs/operations/env-and-healthcheck.md", "/docs/tutorials/production-hardening.md", "/docs/patterns/observability-context.md"]
search_keywords: ["github flow", "docs workflow", "manifest build", "review checklist", "release process"]
show_toc: true
---

## Summary
A consistent GitHub flow prevents broken manifests, missing frontmatter, and unreviewed AI guidance. This playbook walks contributors through branching, local validation, review expectations, and merge policies tailored to this repository.

### You’ll learn
- How to create branches, sync with `main`, and keep forks up to date.
- Which local commands to run before opening a pull request.
- How to structure PR descriptions with content status updates.
- What reviewers verify before approving documentation changes.
- How releases propagate to production after merge.

## Branching and sync checklist

1. **Create an issue** referencing the production plan task and label it with audience, category, and wave.
2. **Branch naming**: Use `docs/<area>/<short-topic>` (e.g., `docs/operations/healthcheck`).
3. **Sync often**: Before pushing, run `git fetch origin && git rebase origin/main` to avoid drift.
4. **Commit style**: Prefer conventional prefixes like `docs:` or `ops:` with a concise summary.

> Non-technical contributors using the GitHub web UI should still open a draft PR early so reviewers can guide structure.

## Local validation steps

Run these commands before you push:

```bash
npm install          # once per environment
npm run check:frontmatter
npm run build:manifest
```

Fix any reported issues—missing frontmatter, invalid YAML, or manifest build failures. Running the manifest locally ensures `manifest.json` stays in sync with newly added files and metadata.

## Pull request template
Every PR should answer four questions in the description:

1. **Scope**: Which tasks from `production-plan/plan.md` does this change advance? Include the updated status (e.g., `qa ready`).
2. **Summary**: Bullet list of key changes.
3. **Testing**: Commands run locally (include output snippets if relevant).
4. **Review asks**: Call out areas needing feedback (content accuracy, technical validation, tone).

Link related docs using `/docs/...` paths so reviewers can navigate context quickly.

## Review and approval criteria

- **Frontmatter**: Valid YAML, accurate `audience_levels`, `personas`, `categories`, and `last_reviewed` date.
- **Structure**: Summary paragraph plus “You’ll learn” section; clear headings; references to official sources.
- **Technical accuracy**: Code snippets tested or reasoned about; no client-side API keys; safe defaults.
- **Governance**: Check for privacy, safety, and bias callouts where relevant.
- **Manifest diff**: Ensure `manifest.json` updates match the new or changed files.

At least one reviewer with domain knowledge should approve before merge. For high-impact pages, involve both a subject matter expert and an editor.

## Merge and release flow

1. Squash merge into `main` once approvals and checks pass.
2. CI runs `npm run build:manifest` to refresh metadata; failures must be fixed before merge completes.
3. After merge, trigger the static site deployment (Vercel or similar). Confirm the admin dashboard shows the new manifest hash.
4. Update the production plan with the final status (`done` or `qa ready`).
5. Announce the change in the docs release channel with a short summary and links.

## Incident response for docs issues

- **Broken build**: Revert the offending commit or open a hotfix PR that restores manifest validity.
- **Incorrect guidance**: File a `priority` issue, assign an owner, and flag the page with a temporary notice if needed.
- **Security regression**: Rotate impacted secrets, update `/docs/providers/security-best-practices.md`, and document the lessons learned in the admin dashboard notes.

## References

- GitHub Docs. “About pull requests.” (2024). <https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests>
- GitHub Docs. “Managing branches in your repository.” (2024). <https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository>
- Vercel. “Deploy Hooks and automation.” (2024). <https://vercel.com/docs/deployments/deploy-hooks>
