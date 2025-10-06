# AI Docs & Kickstarter Wizard – Public Docs

This repository contains public documentation for your GenAI & Agentic Programming guides and the **Project Initiator Wizard**. It is separate from the app code and is designed to be fetched via raw GitHub URLs with ISR/on-demand revalidation.

## Highlights
- Audience-aware pages with consistent frontmatter for client-side search.
- Generated `manifest.json` (see `tools/build-manifest.mjs`) used by your app for navigation and filtering.
- MD/MDX with tabs, callouts, and copyable code blocks.
- Ops playbooks aligned with Microsoft Entra ID, webhooks, and revalidation.

## Getting Started
1. **Install deps** (Node 20+):  
   ```bash
   npm ci
   ```
2. **Generate manifest locally** (writes `manifest.json` and prints hash):  
   ```bash
   npm run build:manifest
   ```
3. Commit and push. Your app can now fetch the docs manifest and pages.

> The CI workflow validates frontmatter and attempts to rebuild the manifest to ensure consistency.

## Structure
See `docs/index.md` for an audience landing, and `docs/wizard/overview.md` for the project initiator documentation.

## License
MIT. See `LICENSE`.
