---
title: ChatGPT Canvas Node.js starters
description: Use ChatGPT Canvas to scaffold Node.js and TypeScript projects, then export and run them with linting and tests.
audience_levels: [beginner, intermediate]
personas: [developer, PM]
categories: [tutorials]
min_read_minutes: 20
last_reviewed: 2025-02-14
related: ["/docs/tutorials/chatgpt-business/overview.md", "/docs/tutorials/chatgpt-business/canvas-python-starters.md", "/docs/quickstarts/js-server-route.md"]
search_keywords: ["chatgpt canvas", "nodejs starter", "typescript project", "jest", "eslint"]
show_toc: true
---

ChatGPT Canvas can act as a temporary IDE for Node.js teams who want to prototype quickly without bypassing review. This guide covers three practical starters—a CLI tool, an API client, and a scheduled worker—and explains how to export, install, and harden the generated TypeScript code.

## You’ll learn
- Frame requirements for Canvas so it scaffolds idiomatic Node.js and TypeScript code.
- Request build tooling, linting, and Jest tests alongside generated implementations.
- Export Canvas workspaces, install dependencies with pnpm or npm, and wire environment variables safely.
- Add resilience with retries, logging, and lightweight evaluations before production rollout.

## Prerequisites
- ChatGPT Business account with Canvas enabled.
- Node.js 20+ installed locally with npm or pnpm.
- Basic Git knowledge and access to a private repository.
- Familiarity with TypeScript configuration (`tsconfig.json`) and package scripts.

## Canvas workflow essentials
1. Start a new **Canvas → Node project** workspace.
2. Share a short spec covering user story, inputs/outputs, non-functional needs, and testing expectations.
3. Ask Canvas for a file manifest (`src/index.ts`, `src/lib/...`, `tests/...`, config files).
4. Generate code incrementally, requesting diffs rather than full rewrites to reduce merge conflicts.
5. Use Canvas **Versions** to capture major checkpoints, and add reviewer notes for future you or teammates.
6. Export the zip and continue iteration locally with your preferred editor and CI.

### Prompt spec template
Paste this structure as the first message in Canvas:

```
# Intent
Build a [TypeScript project type] that helps [user] achieve [goal] under [constraints].

# Interfaces
- CLI command(s): [names and flags]
- HTTP endpoints: [method + path]
- Scheduled job: [cron expression]

# Technical constraints
- Target Node.js [version], TypeScript strict mode ON.
- Use [preferred libraries] and avoid [disallowed libraries].
- Include ESLint + Prettier + Jest configs.

# Risks
- [e.g., rate-limited APIs] → plan backoff + circuit breaker.
- [e.g., secret leakage] → enforce env var validation.

# Evaluation hooks
- Jest tests for [critical path].
- Manual checklist: [logging, error reporting].
```

## Starter 1: CLI formatter

### Canvas steps
1. Prompt: “Create a CLI that reformats Markdown notes into meeting summaries.”
2. Request files: `src/cli.ts`, `src/formatter.ts`, `tests/cli.test.ts`, `tsconfig.json`, `.eslintrc.cjs`.
3. Ask for `commander` for argument parsing, `zod` for schema validation, and `pino` for logging.
4. Ensure Canvas wires `npm run build`, `npm run lint`, and `npm test` scripts.
5. Add a review note reminding you to replace sample Markdown with sanitized templates.

### Export and run locally

```bash
mkdir md-formatter && cd md-formatter
unzip ~/Downloads/md-formatter.zip -d .
corepack enable
pnpm install
pnpm lint
pnpm test
pnpm build
node dist/cli.js --input examples/notes.md --output dist/summary.md
```

Add `./scripts/pre-commit.sh` to run `pnpm lint && pnpm test` before every commit, and configure Husky or Lefthook once the project leaves Canvas.

## Starter 2: API client SDK

### Canvas steps
1. Prompt: “Generate a TypeScript SDK for the Contoso Issues API with retries and typed errors.”
2. Require the file plan: `src/client.ts`, `src/errors.ts`, `src/types.ts`, `tests/client.test.ts`.
3. Specify `undici` for HTTP requests, `retry` helper with exponential backoff, and `zod` for response parsing.
4. Ask for OpenAPI notes documenting endpoints, rate limits, and sample payloads in `/docs/contract.md`.
5. Include a Mermaid sequence diagram (`docs/sequence.md`) mapping `consumer → SDK → API` interactions.

### Export and run locally

```bash
corepack enable
pnpm install
pnpm test -- --runInBand
pnpm exec ts-node scripts/mock-server.ts  # if Canvas provided a stub
pnpm exec ts-node examples/list-issues.ts
```

Update `.env.example` with placeholders for API tokens, and use `dotenv-flow` or AWS Secrets Manager when deploying.

## Starter 3: Cron worker

### Canvas steps
1. Prompt: “Build a scheduled worker that ingests CSV reports nightly and upserts them into PostgreSQL.”
2. Request modules: `src/jobs/import-report.ts`, `src/db.ts`, `src/services/report-parser.ts`, plus `tests/jobs.test.ts`.
3. Require `bullmq` (or `node-cron`) for scheduling, `pg` for database access, and `zod` for schema enforcement.
4. Ask Canvas to scaffold a Dockerfile, `docker-compose.yml` with PostgreSQL, and GitHub Actions workflow for CI.
5. Capture operational runbook details in `/docs/runbook.md` (alerts, retry strategy, escalation path).

### Export and run locally

```bash
pnpm install
cp .env.example .env
pnpm exec docker compose up -d db
pnpm prisma migrate dev  # if Canvas generated Prisma models
pnpm test
pnpm exec ts-node src/jobs/import-report.ts --date $(date -I)
```

Tear down the stack with `pnpm exec docker compose down` after local testing, and sanitize any sample data before pushing.

## Hardening checklist
- **Type safety:** enforce `"strict": true` in `tsconfig.json` and block builds if it drops.
- **Static analysis:** run `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm exec depcheck` before merges.
- **Runtime checks:** add smoke tests or contract tests against mocked services before hitting production APIs.
- **Observability:** ask Canvas for structured logging, metrics exports, and error-handling middleware.
- **Governance:** track Canvas session IDs and export timestamps in `docs/canvas-session-log.md` for audit trails.

## When to move beyond Canvas
- The project needs multi-developer branching, complex code reviews, or trunk-based workflows.
- Tooling requires native extensions, long-running processes, or local secrets you cannot upload to Canvas.
- Compliance mandates infrastructure-as-code, security scanning, or dependency pinning outside Canvas.
- You plan to publish packages to npm and must enforce semantic versioning and release pipelines.

Switch to VS Code or your preferred IDE, keep Canvas for ideation or pair sessions, and rely on ChatGPT or GitHub Copilot inline for small diffs.

## References
- OpenAI. “Use ChatGPT Canvas.” *OpenAI Help Center*, 2024. https://help.openai.com/en/articles/9125982-work-in-files.
- OpenAI. “Export your work from Canvas.” *OpenAI Help Center*, 2024. https://help.openai.com/en/articles/9135958-export-your-work-from-canvas.
- Node.js Foundation. “Corepack.” *Node.js Documentation*, 2024. https://nodejs.org/docs/latest-v20.x/api/corepack.html.
- Microsoft. “TypeScript Handbook: TSConfig Reference.” *TypeScript Docs*, 2024. https://www.typescriptlang.org/tsconfig.
- Jest Core Team. “Getting Started.” *Jest Documentation*, 2024. https://jestjs.io/docs/getting-started.
