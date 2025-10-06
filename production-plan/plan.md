# AI Docs – Content Production Plan (copy‑friendly)

A structured, copy‑pastable plan your junior writers can execute. Organized into waves; each task has purpose, audience, success criteria, and pointers.

---

## Production roadmap (high level)

* **Wave 0 (done):** Seed 12 pages scaffolded.
* **Wave 1 (2–3 weeks):** Onboarding paths, Providers, Operations, Troubleshooting & FAQ.
* **Wave 2 (3–5 weeks):** Patterns, Evaluations, Safety, Accessibility & Performance.
* **Wave 3 (ongoing):** Tutorials/deep dives, Case studies, Advanced reference.

> Create a GitHub Issue per task with labels: `docs`, `audience:<X>`, `category:<concepts|how-to|tutorials|patterns|providers|operations|troubleshooting|faq|evaluations|safety>`, `wave:<1|2|3>`.

---

Status legend

- [x] done • [ ] pending • [~] in progress

## Main tools / platform focus (Not exclusive)

> These reflect the company toolset and inform where our docs go deeper. We still link to alternatives when helpful.

* **OpenAI:** ChatGPT, APIs (server-side only).
* **Microsoft developer stack:** VS Code, GitHub, VS Code extensions.
* **MCP & A2A:** Model Context Protocol servers and agent‑to‑agent patterns.
* **Data platforms:** Microsoft Fabric, Snowflake, Databricks, Qlik Cloud.
* **AI app deployments:** Vercel; **Data/ORM:** Prisma (for app projects that persist sessions).

**How this changes the plan**

* We add platform‑specific pages (setup, patterns, troubleshooting) and cross‑link them from generic guides.
* Each platform page includes: when to use it, minimal setup, gotchas, and links to the official docs.

---

## Frontmatter rules (apply to every page)

```yaml
---
audience_levels: [beginner|intermediate|advanced]
personas: [non-technical, PM, developer, data-analyst, admin]
categories: [concepts|how-to|tutorials|patterns|reference|providers|wizard|operations|troubleshooting|faq|evaluations|safety]
min_read_minutes: <int>
last_reviewed: YYYY-MM-DD
related: ["/path/one.md", "/path/two.md"]
search_keywords: ["term one", "term two", "term three"]
---
```

---

## Wave 1 — Core foundations (28 tasks)

### 1) Audience landing & quickstarts (4)

1. [x] **/docs/quickstarts/try-genai-in-10-min.md**
   **Purpose:** zero‑to‑first result for beginners.
   **Audience:** beginner; non‑technical, PM.
   **Success:** user runs a prompt end‑to‑end; understands limits; links to Wizard Overview.
   **Pointers:** OpenAI API overview & quickstart.

2. [x] **/docs/quickstarts/js-server-route.md**
   **Purpose:** JS/TS server route calling provider safely.
   **Audience:** beginner–intermediate; developer.
   **Success:** working POST route; “no client-side keys” callout; rate limit note.
   **Pointers:** OpenAI API reference; ISR docs (if showing results in page).

3. [x] **/docs/quickstarts/python-fastapi.md**
   **Purpose:** Minimal FastAPI endpoint for completions/tools.
   **Audience:** developer, data‑analyst.
   **Success:** FastAPI example with retries/timeouts; error handling template.
   **Pointers:** OpenAI Python library.

4. [x] **/docs/how-to/pick-your-path.md**
   **Purpose:** chooser page for paths (beginner/PM/dev).
   **Audience:** all.
   **Success:** clear tiles; 3 clicks to a useful result.
   **Pointers:** Link to your own quickstarts & concepts.

### 2) Providers (7)

5. [x] **/docs/providers/openai/auth-models-limits.md**
   **Purpose:** authenticate, select models, understand limits.
   **Audience:** developer, admin.
   **Success:** server‑only keys; env var mapping; model selection table.
   **Pointers:** OpenAI API overview & reference.

6. [x] **/docs/providers/anthropic/overview.md**
   **Purpose:** configure Anthropic; model notes; tool use basics.
   **Audience:** developer, admin.
   **Success:** auth header example; common errors; safety levers.
   **Pointers:** Anthropic official docs.

7. [x] **/docs/providers/azure-openai/setup.md**
   **Purpose:** Azure OpenAI resource + deployment setup.
   **Audience:** admin, developer.
   **Success:** portal click‑path; endpoint/key usage; region/latency notes.
   **Pointers:** Microsoft Learn (Create Azure OpenAI resource).

8. [x] **/docs/providers/azure-openai/migrate-from-openai.md**
   **Purpose:** map OpenAI patterns to Azure endpoints.
   **Audience:** developer.
   **Success:** base URL pattern; `api-version`; deployment name vs model; error cheatsheet.
   **Pointers:** Microsoft Learn Azure OpenAI.

9. [x] **/docs/providers/compare-providers.md**
   **Purpose:** neutral comparison of request patterns/tradeoffs.
   **Audience:** PM, developer, admin.
   **Success:** table of request/response shapes, limits, typical costs; links to official docs.
   **Pointers:** OpenAI, Anthropic, Azure OpenAI docs.

10. [x] **/docs/providers/security-best-practices.md**
    **Purpose:** secure key handling, proxies, rotation.
    **Audience:** developer, admin.
    **Success:** server proxy patterns; least privilege; rotation cadence.
    **Pointers:** OpenAI guidance; optional Azure Key Vault link.

11. [x] **/docs/providers/openai/chatgpt-productivity.md**
    **Purpose:** safe & effective use of ChatGPT for ideation, code review, and doc drafting (no keys required).
    **Audience:** non‑technical, PM, developer.
    **Success:** task recipes (prompt templates), privacy caveats, when to switch to API‑based flows.
    **Pointers:** OpenAI ChatGPT help guides; company privacy policy.

### 3) Operations (8)

11. [x] **/docs/operations/entra-sign-in-flow.md**
    **Purpose:** click‑path sign‑in with screenshots.
    **Audience:** admin, PM.
    **Success:** sign‑in, consent, role display; no JSON editing.
    **Pointers:** Entra app registration quickstart; NextAuth Azure AD provider.

12. [x] **/docs/operations/entra-role-assignment.md**
    **Purpose:** assign `User`/`Admin` roles.
    **Audience:** admin.
    **Success:** portal steps + verification in app.
    **Pointers:** Entra app roles docs.

13. [x] **/docs/operations/nextauth-azuread.md**
    **Purpose:** wire NextAuth provider + middleware.
    **Audience:** developer.
    **Success:** provider config; callback URL; role claims mapping.
    **Pointers:** NextAuth Azure AD provider docs.

14. [x] **/docs/operations/content-sync-deep-dive.md**
    **Purpose:** ISR + on‑demand revalidation + ETags.
    **Audience:** developer, admin.
    **Success:** app‑router example; webhook payload; `If-None-Match` usage.
    **Pointers:** Vercel ISR; Next.js on‑demand; MDN `If‑None‑Match`; GitHub webhooks.

15. [x] **/docs/operations/env-and-healthcheck.md**
    **Purpose:** `.env.example` mapping + health check outputs.
    **Audience:** developer, admin.
    **Success:** table of vars; expected non‑prod error messages.

16. [x] **/docs/operations/admin-dashboard.md**
    **Purpose:** sync health (manifest hash + fetch timestamp).
    **Audience:** admin.
    **Success:** define green/stale; how to force revalidation.

17. [x] **/docs/operations/vscode-setup-and-extensions.md**
    **Purpose:** standardize VS Code setup (recommended settings + extensions).
    **Audience:** developer, PM (editing docs).
    **Success:** install steps, settings JSON snippet, recommended extensions (Markdown, YAML, frontmatter, spell‑check), how to preview MDX.
    **Pointers:** VS Code docs; Markdown/MDX extensions (link official marketplace pages).

18. [x] **/docs/operations/github-flow-for-docs.md**
    **Purpose:** PR workflow for this repo (branching, reviews, CI, release notes).
    **Audience:** all contributors.
    **Success:** step‑by‑step from fork/branch → PR → manifest CI → merge → live.
    **Pointers:** GitHub Docs (pull requests, required reviews); our CI workflow file reference.

### 4) Troubleshooting & FAQ (7)

17. [x] **/docs/troubleshooting/auth-errors.md**
    **Purpose:** decode Entra/NextAuth errors (redirect URI, consent, audience).
    **Pointers:** NextAuth Azure AD; Entra quickstart.

18. [x] **/docs/troubleshooting/provider-errors.md**
    **Purpose:** handle 401/429/5xx; retry/backoff; structured logs (metadata only).
    **Pointers:** OpenAI error reference.

19. [x] **/docs/troubleshooting/revalidation-failures.md**
    **Purpose:** inspect GitHub webhook delivery; redelivery; secrets.
    **Pointers:** GitHub webhooks overview + creating webhooks.

20. [x] **/docs/faq/wizard-vs-examples.md**
    **Purpose:** when to use Wizard vs hand‑coded examples; link to separate app docs.

21. [x] **/docs/faq/providers-and-costs.md**
    **Purpose:** cost basics; rate limits; when to switch providers.
    **Pointers:** OpenAI, Anthropic, Azure OpenAI docs.

22. [x] **/docs/faq/vscode-and-extensions.md**
    **Purpose:** common questions about VS Code settings, MDX preview, spell‑check, and markdown linting.
    **Audience:** all contributors.
    **Pointers:** VS Code docs; recommended extensions pages.

23. [x] **/docs/troubleshooting/github-actions-ci.md**
    **Purpose:** fix failing manifest builds in CI, Node version mismatches, missing deps.
    **Audience:** developer.
    **Pointers:** GitHub Actions docs; Node setup‑node action.

---

## Wave 2 — Patterns, Evaluations, Safety, Accessibility, Data Platforms (30 tasks)

### 5) Patterns (9)

22. **/docs/patterns/agentic/router-multi-tool.md**
    **Purpose:** router agent selects tools.
    **Success:** tool registry; guardrails; timeout strategy.
    **Pointers:** Tool/function calling patterns.

23. **/docs/patterns/agentic/reflection-self-heal.md**
    **Purpose:** reflection loop improves outputs.
    **Success:** rubric prompt + retry budget.

24. **/docs/patterns/rag/basics.md**
    **Purpose:** minimal RAG.
    **Success:** chunking, indexing, citations.
    **Pointers:** Embeddings & responses guidance.

25. **/docs/patterns/rag/faq-rag.md** *(expand seed with eval hook)*

26. **/docs/patterns/tools/function-calling.md**
    **Purpose:** cross‑provider tool/function calling.
    **Success:** schema design; idempotent tools; error propagation.
    **Pointers:** OpenAI tools; Anthropic tools.

27. **/docs/patterns/workflows/batch-processing.md** *(expand seed with retries & cost caps)*

28. **/docs/patterns/observability-context.md**
    **Purpose:** what to log (metadata only); correlation IDs; PII avoidance.
    **Pointers:** OpenTelemetry concepts (if adopted later).

29. **/docs/patterns/cost-controls.md**
    **Purpose:** max tokens; streaming; truncation; caching hints; retries.
    **Pointers:** API parameters & streaming guidance.

30. **/docs/patterns/a2a-agent-to-agent.md**
    **Purpose:** patterns for agent‑to‑agent collaboration (A2A): task handoff, negotiation, tool sharing.
    **Audience:** developer, PM.
    **Success:** sequence diagrams; message contracts; failure modes; escalation to human.

### 6) Evaluations (7)

30. **/docs/evaluations/overview.md**
    **Purpose:** goals, golden sets, human review.
    **Success:** taxonomy (correctness, helpfulness, safety, latency/cost).

31. **/docs/evaluations/offline-batch-evals.md**
    **Purpose:** nightly evals; diff reports.

32. **/docs/evaluations/rubric-prompts.md**
    **Purpose:** design rubric prompts; inter‑rater agreement.

33. **/docs/evaluations/grounded-qa-evals.md**
    **Purpose:** RAG faithfulness & citation accuracy.

34. **/docs/evaluations/latency-cost-tradeoffs.md** *(expand seed)*

35. **/docs/evaluations/tool-use-evals.md**
    **Purpose:** success rate per tool; timeout/error taxonomy.

36. **/docs/evaluations/data-platform-benchmarks.md**
    **Purpose:** measure end‑to‑end latency & cost when calls touch Fabric/Snowflake/Databricks (where applicable).
    **Success:** reproducible harness; dataset notes; report template.

### 7) Safety & Responsible AI (4)

36. **/docs/safety/overview.md**
    **Purpose:** what you block, log, escalate; abuse cases.

37. **/docs/safety/prompt-safety.md** *(expand seed with examples)*

38. **/docs/safety/output-filters.md** *(expand seed with classifier/rules examples)*

39. **/docs/safety/human-in-the-loop.md** *(expand seed with approval gates)*

### 8) Accessibility & Performance (5)

40. **/docs/operations/accessibility.md**
    **Purpose:** WCAG 2.2 & ARIA practices.
    **Success:** keyboard focus order; landmarks; contrast checklist.
    **Pointers:** WCAG 2.2 quick ref; WAI‑ARIA APG.

41. **/docs/operations/aria-recipes.md**
    **Purpose:** ARIA patterns for Tabs/Dialogs/Toasts.
    **Pointers:** WAI‑ARIA Authoring Practices.

42. **/docs/operations/performance-principles.md**
    **Purpose:** keep docs list <~2s; caching/streaming.
    **Pointers:** ISR docs; ETag `If‑None‑Match` conditioning.

43. **/docs/operations/caching-http-basics.md**
    **Purpose:** strong vs weak validators; ETag vs Last‑Modified; `Cache-Control`.
    **Pointers:** MDN HTTP caching primers.

44. **/docs/operations/deploy-vercel.md**
    **Purpose:** deploy static docs site (or app) to Vercel with ISR enabled; env var tips.
    **Audience:** developer, admin.
    **Success:** project import, build settings, environment setup, custom domains.
    **Pointers:** Vercel docs.

---

## Wave 3 — Tutorials, case studies, advanced reference (18 tasks)

### 9) Tutorials (7)

44. **/docs/tutorials/agentic-helpdesk.md** *(expand seed with tool schema & evals)*

45. **/docs/tutorials/rag-starter.md** *(expand seed with dataset curation & eval loop)*

46. **/docs/tutorials/cost-guardrails.md** *(expand seed with budgets + alerts)*

47. **/docs/tutorials/observability-end-to-end.md**
    **Purpose:** logs → traces → dashboards; sampling & PII guards.

48. **/docs/tutorials/production-hardening.md**
    **Purpose:** retries, rate limits, backpressure, circuit breakers.

49. **/docs/tutorials/mcp-in-vscode.md**
    **Purpose:** use MCP servers in VS Code to connect tools securely; examples and common pitfalls.
    **Audience:** developer.
    **Success:** install steps, configuration file samples, verify with a sample tool server.
    **Pointers:** Official MCP docs (link when available) and VS Code guides.

50. **/docs/tutorials/prisma-and-postgres-for-sessions.md**
    **Purpose:** (for app projects) schema modeling with Prisma for session storage; migrations & rollback.
    **Audience:** developer.
    **Success:** Prisma schema snippet, migration commands, rollback recipe.
    **Pointers:** Prisma Docs.

### 10) Case studies & examples (5)

49. **/docs/examples/content-drafter.md**
    **Purpose:** straight‑through generation with tone/voice controls; success: draft quality rubric.

50. **/docs/examples/meeting-summarizer.md**
    **Purpose:** structured notes + action items; success: action completion rate.

51. **/docs/examples/data-quality-qa.md**
    **Purpose:** tool calls to SQL/read‑only APIs; success: defects caught, false positives.

52. **/docs/examples/ai-customer-support-triage.md**
    **Purpose:** router agent with escalation rules.

53. **/docs/examples/a2a-coordination.md**
    **Purpose:** show two agents collaborating (planner ↔ executor or QA ↔ fixer) with a transcript and outcome metrics.

### 11) Advanced reference & governance (6)

53. **/docs/reference/session-record-schema.md** *(expand seed with audit fields)*

54. **/docs/reference/provider-abstraction.md** *(expand seed with retries/timeouts/fallbacks)*

55. **/docs/reference/components.md**
    **Purpose:** MDX components (Tabs, Callout, CodeBlock w/ copy); usage snippets.
    **Pointers:** MDX official docs.

56. **/docs/operations/backups-retention.md** *(expand seed with rotation cadences & exports)*

57. **/docs/operations/runbooks.md**
    **Purpose:** “Page me when…” (webhook failures; auth outage; provider 5xx spikes).

58. **/docs/reference/data-platform-integration-guides.md**
    **Purpose:** index page that links to Fabric, Snowflake, Databricks, Qlik Cloud pages.

---

## Writer playbook

* Use the frontmatter template above on every page.
* Outline first, get a fast review, then draft.
* Cross‑link 2–4 related pages.
* Screenshots → `/assets/images/...` with descriptive alt text.
* Shared code → `/assets/snippets/...` and embed via MDX.
* Add a short **References** section to each page; prefer official docs.

---

## Source pointers (authoritative)

* OpenAI Platform docs (API overview & reference)
* Anthropic docs (models & API)
* Azure OpenAI (Microsoft Learn)
* **VS Code**: official docs; Marketplace pages for extensions (Markdown, YAML, frontmatter, MDX preview)
* **GitHub**: PRs, protected branches, Actions (setup‑node)
* **Microsoft Entra**: app registration quickstart; role assignments
* **Vercel**: ISR / on‑demand revalidation; project deploy guides
* **Prisma**: schema, migrations, deploy checklists
* **Data platforms**: Microsoft Fabric (OneLake/Lakehouse), Snowflake (Warehouses/Snowpark), Databricks (Lakehouse/Unity Catalog), Qlik Cloud (data connections & app publishing)
* GitHub Webhooks (overview + creating webhooks)
* MDN HTTP caching (`If‑None‑Match`, `Cache-Control`)
* Accessibility: WCAG 2.2 quick ref; WAI‑ARIA APG
