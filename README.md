# AI Learning Hub – Public Docs

This repository contains public documentation for GenAI & agentic programming concepts, quickstarts, evaluations, and safety guidance. It is separate from the app code and is designed to be fetched via raw GitHub URLs with ISR/on-demand revalidation.

## Highlights
- Audience-aware pages with consistent frontmatter for client-side search.
- Generated `manifest.json` (see `tools/build-manifest.mjs`) used by the app for navigation and filtering.
- MD/MDX with tabs, callouts, and copyable code blocks.
- Focused on educational content—no site-admin or wizard operation docs.

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

### Environment overrides (optional)

- `DOCS_REPO_RAW_BASE_URL`: customise the base URL used when generating `sourceUrl` entries.
- `DOCS_REPO_MANIFEST_PATH`: override the manifest output location. See `.env.example` for details.

## Structure
See `docs/index.md` for the audience landing page.

## License
MIT. See `LICENSE`.
