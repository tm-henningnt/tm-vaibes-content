# Copilot Instructions

## Project snapshot
- This repo hosts public AI education content (concepts, quickstarts, evaluations, safety, patterns) surfaced by the learning hub; the app fetches markdown pages and the generated `manifest.json` over raw GitHub.
- Content lives under `docs/` with focused subfolders (concepts, evaluations, examples, quickstarts, patterns, providers, safety, tutorials). Non-educational site-management docs have been removed.
- The manifest at repo root is committed and consumed downstream; rebuilding it must stay deterministic to avoid noisy diffs.

## Authoring patterns
- Every markdown/MDX file requires rich frontmatter; see `tools/schemas/frontmatter.schema.json` for the authoritative shape.
- Allowed enum values: `audience_levels` → beginner/intermediate/advanced, `personas` → non-technical/PM/developer/data-analyst/admin.
- Provide at least one `categories` entry (first element becomes the manifest `category`); keep arrays for `tags`, `related`, `related_project_types`, and avoid duplicates.
- Use `primary_category` in frontmatter when you need to override the first category for manifest routing.
- `last_reviewed` stays in `YYYY-MM-DD`; the build converts it to `lastUpdated` (ISO string) in the manifest.
- Cross-link docs via `/docs/...` paths in `related` so the downstream site can hydrate navigation.

## Manifest workflow
- `tools/build-manifest.mjs` globs `docs/**/*.{md,mdx}`, parses frontmatter with `gray-matter`, and skips any file without a `title`.
- The builder derives `slug` from the doc path (no `/docs/` or extension), kebab-cases the frontmatter `primary_category` (or first `categories` entry) for the manifest `category`, and emits `sourcePath`/`sourceUrl` for every doc.
- Each entry includes consumer-required fields (`path`, `slug`, `category`, `title`, `description`, `lastUpdated`, `sourcePath`, `sourceUrl`) plus persona metadata and a deterministic `hash` derived from the doc list.
- Schema files under `tools/schemas/` must remain in sync with the builder; if you adjust manifest fields, update both the script and `manifest.schema.json`.
- When adding new metadata in frontmatter, extend the builder so it flows to the manifest (e.g., `related_project_types`).

## Local development
- Use Node 20+; install deps with `npm ci` before running scripts.
- `npm run build:manifest` regenerates `manifest.json` and prints the doc count + hash.
- `npm run lint:frontmatter` runs the builder in `--check` mode, suitable for CI and pre-PR validation.
- `npm run check:frontmatter` executes `tools/check-frontmatter.mjs` to catch duplicate or missing array metadata before PRs.
- CI mirrors this sequence (`lint:frontmatter`, `check:frontmatter`, `build:manifest`) on every pull request, so keep them green locally before pushing.
- Provide `.env` overrides when testing forks: `DOCS_REPO_RAW_BASE_URL` controls manifest `sourceUrl` prefixes; `DOCS_REPO_MANIFEST_PATH` changes the output location (see `.env.example`).
- Keep `manifest.json` committed when its hash changes, otherwise consumers will not pick up new docs.

## Writing checklist
- Mirror existing folder taxonomy to keep navigation stable; introduce new top-level dirs only with product sign-off.
- Ensure headings start with a single `#` (top-level title is provided by frontmatter) and use sentence-case section titles.
- Include `show_toc: true` in frontmatter for long-form guides that need in-page navigation, matching existing conventions.
- Validate links and code fences locally; remember the site reads these files directly via raw URLs without additional processing.
- Before opening a PR, run the manifest build, review the diff for unintended deletions, and note affected pages in your PR description.
