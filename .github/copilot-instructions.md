# Copilot Instructions

## Project snapshot
- This repo is the public documentation source for the AI Docs & Project Initiator Wizard; the app fetches markdown pages and the generated `manifest.json` over raw GitHub.
- Content lives under `docs/` with topic-focused subfolders (concepts, evaluations, how-to, patterns, providers, wizard, etc.) that align with the navigation surfaced by the wizard UI.
- The manifest at repo root is committed and consumed downstream; rebuilding it must stay deterministic to avoid noisy diffs.

## Authoring patterns
- Every markdown/MDX file requires rich frontmatter; see `tools/schemas/frontmatter.schema.json` for the authoritative shape.
- Allowed enum values: `audience_levels` → beginner/intermediate/advanced, `personas` → non-technical/PM/developer/data-analyst/admin.
- Provide at least one `categories` entry (first element becomes the manifest `category`); keep arrays for `tags`, `related`, and `related_project_types` even when a single value applies.
- `last_reviewed` stays in `YYYY-MM-DD`; the build converts it to `lastUpdated` (ISO string) in the manifest.
- Cross-link docs via `/docs/...` paths in `related` so the downstream site can hydrate navigation.
- Update `docs/release-notes.md` whenever a change materially affects readers.

## Manifest workflow
- `tools/build-manifest.mjs` globs `docs/**/*.{md,mdx}`, parses frontmatter with `gray-matter`, and skips any file without a `title`.
- The builder derives `slug` from the doc path (no `/docs/` or extension) and the manifest `category` from the first path segment.
- Each entry includes consumer-required fields (`path`, `slug`, `category`, `title`, `description`, `lastUpdated`) plus persona metadata and a deterministic `hash` derived from the doc list.
- Schema files under `tools/schemas/` must remain in sync with the builder; if you adjust manifest fields, update both the script and `manifest.schema.json`.
- When adding new metadata in frontmatter, extend the builder so it flows to the manifest (e.g., `related_project_types`).

## Local development
- Use Node 20+; install deps with `npm ci` before running scripts.
- `npm run build:manifest` regenerates `manifest.json` and prints the doc count + hash.
- `npm run lint:frontmatter` runs the builder in `--check` mode, suitable for CI and pre-PR validation.
- Keep `manifest.json` committed when its hash changes, otherwise consumers will not pick up new docs.

## Writing checklist
- Mirror existing folder taxonomy to keep navigation stable; introduce new top-level dirs only with product sign-off.
- Ensure headings start with a single `#` (top-level title is provided by frontmatter) and use sentence-case section titles.
- Include `show_toc: true` in frontmatter for long-form guides that need in-page navigation, matching existing conventions.
- Validate links and code fences locally; remember the site reads these files directly via raw URLs without additional processing.
- Before opening a PR, run the manifest build, review the diff for unintended deletions, and reference the affected pages in your description.
