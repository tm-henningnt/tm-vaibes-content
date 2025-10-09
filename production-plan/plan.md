# AI Learning Hub — Content Production Plan (copy‑friendly)

A structured, copy‑pastable plan that grows this repo into a comprehensive, multi‑audience AI handbook. Organized into waves; every task lists purpose, audience, success criteria, and pointers. Scope is education only: concepts, providers/models, patterns, evaluations, safety, quickstarts, tutorials, examples.

---

## Production roadmap (high level)

* Wave 0 (done): Seed core scaffolding and manifest pipeline.
* Wave 1 (2–3 weeks): Foundations & Onboarding (AI 101, glossary, core quickstarts).
* Wave 2 (3–4 weeks): Providers & Models (OpenAI, Azure OpenAI, Anthropic, Google Gemini, Meta Llama, Mistral, Cohere).
* Wave 3 (3–4 weeks): Patterns & RAG (prompting styles, tool use, agentic patterns, workflows).
* Wave 4 (2–3 weeks): Evaluations & Safety (metrics, offline evals, rubric prompts, guardrails).
* Wave 5 (ongoing): Tutorials, Use cases, Examples (end‑to‑end builds across domains).

> Create a GitHub Issue per task with labels: `docs`, `audience:<beginner|intermediate|advanced>`, `category:<concepts|quickstarts|tutorials|patterns|providers|evaluations|safety|examples>`, `wave:<1|2|3|4|5>`.

---

## Status legend

• [ ] pending • [~] in progress • [x] done

---

## Frontmatter rules (apply to every page)

```yaml
---
audience_levels: [beginner|intermediate|advanced]
personas: [non-technical, PM, developer, data-analyst, admin]
categories: [concepts|quickstarts|tutorials|patterns|providers|evaluations|safety|examples]
min_read_minutes: <int>
last_reviewed: YYYY-MM-DD
related: ["/path/one.md", "/path/two.md"]
search_keywords: ["term one", "term two", "term three"]
show_toc: true
---
```

Keep arrays deduped; include at least one category; use `primary_category` if you need a canonical route; convert `last_reviewed` to ISO `lastUpdated` in the manifest.

---

## Wave 1 — Foundations & Onboarding (17 tasks)

1. [qa ready] /docs/concepts/what-is-genai.md
   - Purpose: Define Generative AI, capabilities/limits, and mental models.
   - Audience: beginner → advanced.
   - Success: readers can articulate strengths/limits and when to avoid LLMs.
   - Pointers: OpenAI “How it works”, Anthropic “Constitutional AI”.

2. [qa ready] /docs/concepts/genai-vs-agentic.md (expand)
   - Purpose: Single‑shot vs multi‑step agentic systems; when agents help.
   - Audience: all.
   - Success: clear comparison table; decision checklist.

3. [qa ready] /docs/concepts/prompting-styles.md
   - Purpose: Instruction, few‑shot, chain‑of‑thought, self‑ask, critique/repair.
   - Audience: all.
   - Success: side‑by‑side examples with pros/cons and failure modes.

4. [qa ready] /docs/concepts/token-costs-latency.md
   - Purpose: Tokens, context windows, streaming; cost vs speed tradeoffs.
   - Audience: beginner → intermediate.
   - Success: readers estimate cost/latency; choose streaming appropriately.

5. [qa ready] /docs/concepts/glossary.md
   - Purpose: Definitions for core terms (prompt, context window, RAG, tool, grounding, eval).
   - Audience: beginner.
   - Success: cross‑linked to all pages.

6. [qa ready] /docs/quickstarts/try-genai-in-10-min.md (expand)
   - Purpose: Zero‑to‑first result; Node and Python single‑file.
   - Audience: beginner; non‑technical, PM, developer.
   - Success: runnable snippet + explanation of each parameter.

7. [qa ready] /docs/quickstarts/js-server-route.md (expand)
   - Purpose: Safe server route with retries/timeouts and streaming.
   - Audience: beginner → intermediate developers.
   - Success: working POST route; no client‑side keys; error handling template.

8. [qa ready] /docs/quickstarts/python-fastapi.md (expand)
   - Purpose: Minimal FastAPI endpoint for chat/tools; typed responses.
   - Audience: developer, data‑analyst.
   - Success: endpoint returns structured JSON with metadata.

9. [qa ready] /docs/concepts/safety-basics.md
   - Purpose: Intro to safety risks (jailbreaks, data leakage, toxicity).
   - Audience: all.
   - Success: simple “safety checklist” for early prototypes.

10. [qa ready] /docs/concepts/structured-outputs.md
    - Purpose: JSON outputs, schemas, validation; pros/cons by provider.
    - Audience: intermediate.
    - Success: examples with OpenAI/Anthropic tools.

11. [qa ready] /docs/examples/content-drafter.md (expand)
    - Purpose: A simple writing assistant; rubric for quality.
    - Audience: beginner → intermediate.
    - Success: readers adapt the template to their tone/voice.

12. [qa ready] /docs/examples/meeting-summarizer.md (expand)
    - Purpose: Structured minutes + action items; summarization patterns.
    - Audience: all.
    - Success: JSON schema for outputs; action extraction tips.

13. [qa ready] /docs/examples/data-quality-qa.md (expand)
    - Purpose: Read‑only tool calls to check datasets; precision/recall tradeoffs.
    - Audience: data‑analyst, developer.
    - Success: canned checks; false‑positive mitigation.

14. [qa ready] /docs/concepts/ethics-responsible-ai.md
    - Purpose: Human oversight, disclosure, bias and fairness at a high level.
    - Audience: all.
    - Success: practical “do/don’t” list + links to deeper safety pages.

15. [qa ready] /docs/concepts/agents-vs-automation.md
    - Purpose: When classic automation beats agents; cost/latency boundaries.
    - Audience: PM, developer.
    - Success: decision tree and examples.

16. [qa ready] /docs/concepts/ai-landscape-ml-expert-rpa.md
    - Purpose: Place GenAI among ML, expert systems, and RPA; strengths/limits.
    - Audience: beginner → intermediate.
    - Success: readers can contrast approaches and pick the right tool.

17. [qa ready] /docs/concepts/spec-vs-vibe-coding.md
    - Purpose: Compare “vibe coding” with spec-driven development; introduce spec‑kit‑style artifacts.
    - Audience: developer, PM.
    - Success: readers adopt lightweight specs before coding with LLMs.

---

## Wave 2 — Providers & Models (18 tasks)

16. [qa ready] /docs/providers/compare-providers.md (expand)
    - Purpose: Capabilities matrix (modalities, context, tools, rate limits, pricing).
    - Audience: PM, developer, admin.
    - Success: updated table with quick recommendations by use case.

17. [qa ready] /docs/providers/openai/auth-models-limits.md (expand)
    - Purpose: Model lineup (o3, gpt‑4o‑mini, gpt‑4.1), tokens, vision/audio, tools.
    - Success: selection guidance by latency/cost and quality bands.

18. [qa ready] /docs/providers/anthropic/overview.md (expand)
    - Purpose: Claude models; tool use; safety settings.

19. [qa ready] /docs/providers/azure-openai/setup.md (expand)
    - Purpose: Azure specifics; deployment vs model; region/capacity notes.

20. [qa ready] /docs/providers/azure-openai/migrate-from-openai.md (expand)
    - Purpose: Mapping of parameters; common pitfalls and fixes.

21. [qa ready] /docs/providers/gemini/overview.md
    - Purpose: Google Gemini models; API basics; multimodal examples.
    - Audience: developer.
    - Success: text+image prompt and function‑call sample.

22. [qa ready] /docs/providers/meta-llama/overview.md
    - Purpose: Meta Llama model families; when to consider open weights.
    - Success: request examples via selected hosts (e.g., together.ai/Fireworks).

23. [qa ready] /docs/providers/mistral/overview.md
    - Purpose: Mistral models; pricing and strengths.

24. [qa ready] /docs/providers/cohere/overview.md
    - Purpose: Command/Rerank models; embeddings quality notes.

25. [qa ready] /docs/concepts/embeddings.md
    - Purpose: What embeddings are; search vs clustering vs reranking.
    - Success: readers pick dimensions/models; normalize vectors.

26. [qa ready] /docs/concepts/multimodal-fundamentals.md
    - Purpose: Vision, audio, doc understanding; constraints and safety.

27. [qa ready] /docs/concepts/caching-and-retries.md
    - Purpose: Response caching basics; idempotency; retry budgets.

28. [qa ready] /docs/examples/provider-switching.md
    - Purpose: Swap providers behind a thin abstraction; pitfalls.

33. [ ] /docs/examples/toolformer-style-extraction.md
    - Purpose: Use tools to extract structured data from messy inputs.

---

## Wave 3 — Patterns & RAG (19 tasks)

34. [ ] /docs/patterns/prompting/recipes.md
    - Purpose: Reusable prompts: brainstorming, critique, plan‑then‑write, review.

35. [ ] /docs/patterns/tools/function-calling.md (expand)
    - Purpose: Cross‑provider tool calling; schema design; error propagation.

36. [ ] /docs/patterns/agentic/planner-executor.md (expand)
    - Purpose: Decompose → plan → execute; memory and context updates.

37. [ ] /docs/patterns/agentic/router-multi-tool.md (expand)
    - Purpose: Tool routing; fallback; timeouts and budget caps.

38. [ ] /docs/patterns/agentic/reflection-self-heal.md (expand)
    - Purpose: Critique/repair loops; rubric prompts; stop conditions.

39. [ ] /docs/patterns/rag/basics.md (expand)
    - Purpose: Chunking, indexing, citations; failure modes; latency budgets.

40. [ ] /docs/patterns/rag/hybrid-ranking.md
    - Purpose: Sparse+dense retrieval; reranking; query rewriting.

41. [ ] /docs/patterns/rag/evals-hook.md
    - Purpose: Wire evals into RAG loop; accuracy dashboards.

42. [ ] /docs/patterns/workflows/batch-processing.md (expand)
    - Purpose: Offline jobs; retries; cost caps.

43. [ ] /docs/patterns/cost-controls.md (expand)
    - Purpose: Truncation, streaming, cache, sampling; practical defaults.

44. [ ] /docs/patterns/observability-context.md (expand)
    - Purpose: What to log; IDs; redaction; privacy notes.

45. [ ] /docs/patterns/specs/prompt-spec-template.md
    - Purpose: A lightweight prompt spec format (intent, inputs/outputs, constraints, eval hooks, risks).
    - Audience: developer, PM.
    - Success: reproducible prompt artifacts that plug into evals.

46. [ ] /docs/patterns/specs/tool-spec-template.md
    - Purpose: Tool contract template (schema, idempotency, timeout/retry behavior, errors).
    - Audience: developer.
    - Success: coherent, testable tool definitions across providers.

47. [ ] /docs/patterns/specs/eval-spec-template.md
    - Purpose: Evaluation spec (metrics, datasets, thresholds, review cadence).
    - Audience: developer, PM.
    - Success: teams can run the same evals and compare results apples‑to‑apples.

---

## Wave 4 — Evaluations & Safety (12 tasks)

45. [ ] /docs/evaluations/overview.md (expand)
46. [ ] /docs/evaluations/rubric-prompts.md (expand)
47. [ ] /docs/evaluations/grounded-qa-evals.md (expand)
48. [ ] /docs/evaluations/latency-cost-tradeoffs.md (expand)
49. [ ] /docs/evaluations/tool-use-evals.md (expand)
50. [ ] /docs/evaluations/offline-batch-evals.md (expand)
51. [ ] /docs/evaluations/data-platform-benchmarks.md (expand with methodology)
52. [ ] /docs/safety/overview.md (expand)
53. [ ] /docs/safety/prompt-safety.md (expand)
54. [ ] /docs/safety/output-filters.md (expand)
55. [ ] /docs/safety/human-in-the-loop.md (expand)
56. [ ] /docs/concepts/safety-taxonomy.md
    - Purpose: Taxonomy of risk categories; mapping to mitigations.

---

## Wave 5 — Tutorials & Examples (20 tasks)

57. [ ] /docs/tutorials/agentic-helpdesk.md (expand)
58. [ ] /docs/tutorials/rag-starter.md (expand)
59. [ ] /docs/tutorials/cost-guardrails.md (expand)
60. [ ] /docs/tutorials/observability-end-to-end.md (expand)
61. [ ] /docs/tutorials/production-hardening.md (expand)
62. [qa ready] /docs/examples/ai-customer-support-triage.md (expand)
63. [qa ready] /docs/examples/a2a-coordination.md (expand)
64. [ ] /docs/tutorials/chatgpt-business/overview.md
    - Purpose: Onboarding to ChatGPT Business: workspaces, shared conversations, privacy controls, file uploads, GPT Store access.
    - Audience: non-technical, PM, developer.
    - Success: users configure workspace settings and share a tutorial conversation responsibly.
65. [qa ready] /docs/tutorials/chatgpt-business/canvas-python-starters.md
    - Purpose: Use ChatGPT Canvas to scaffold small Python projects (CLI utility, data cleaner, scraper).
    - Audience: beginner → intermediate.
    - Success: create a runnable venv project with tests inside Canvas, export to local repo.
66. [qa ready] /docs/tutorials/chatgpt-business/canvas-nodejs-starters.md
    - Purpose: Use ChatGPT Canvas to scaffold Node.js/TypeScript small projects (CLI, API client, cron worker).
    - Audience: beginner → intermediate.
    - Success: build a Node project with tsconfig/eslint/jest and run locally.
67. [qa ready] /docs/tutorials/chatgpt-business/code-assist-copiloting.md
    - Purpose: Effective prompting for code assistance (diffs, patches, refactors, debugging) in ChatGPT.
    - Audience: developer.
    - Success: readers drive iterative code changes with clear prompts and guardrails.
68. [qa ready] /docs/tutorials/chatgpt-business/data-analysis-and-files.md
    - Purpose: Use file uploads, charts, and data analysis features safely (PII caveats) within ChatGPT.
    - Audience: PM, data-analyst, developer.
    - Success: analyze a CSV, generate a chart, and summarize insights with correctness checks.
69. [qa ready] /docs/tutorials/chatgpt-business/custom-gpts-and-policies.md
    - Purpose: Create and govern custom GPTs for teams: instructions, actions, and safe sharing.
    - Audience: developer, PM.
    - Success: publish a custom GPT with a narrow scope and clear usage notes.
70. [qa ready] /docs/tutorials/chatgpt-business/canvas-mini-apps.md
    - Purpose: Build a mini app in Canvas that calls provider APIs (mocked locally), then export to Next.js/Python.
    - Audience: developer.
    - Success: working minimal app exported from Canvas and run locally.
71. [qa ready] /docs/tutorials/nextjs-vercel-prisma-sqlite.md
    - Purpose: Build a Next.js App Router app with Prisma and SQLite; deploy to Vercel.
    - Audience: developer.
    - Success: local dev with SQLite, Prisma migrations, Vercel deployment with env setup.
72. [qa ready] /docs/tutorials/python-fastapi-sqlite-ai-service.md
    - Purpose: Python FastAPI service that calls an AI provider, persists sessions in SQLite, and exposes a minimal API.
    - Audience: developer, data‑analyst.
    - Success: local SQLite DB, migrations, retry/backoff, structured JSON responses.
73. [qa ready] /docs/tutorials/dbt-llm-assistant.md
    - Purpose: Use LLMs to scaffold dbt models/tests/docs with human review gates.
    - Audience: data‑analyst, developer.
    - Success: create a model + tests, generate docs, and review diffs safely.
74. [qa ready] /docs/tutorials/sql-agent-patterns.md
    - Purpose: SQL‑aware agents: schema grounding, read‑only constraints, and safe execution.
    - Audience: developer, data‑analyst.
    - Success: execute parameterized queries with guardrails and result summaries.
75. [qa ready] /docs/tutorials/analytics-assistants-qlik-powerbi.md
    - Purpose: Assist with chart/spec generation and narrative insights for Qlik Cloud and Power BI.
    - Audience: PM, data‑analyst.
    - Success: propose visuals from a dataset and produce a short narrative with caveats.
76. [qa ready] /docs/examples/finance-expense-audit.md
    - Purpose: Detect anomalies and route to human review.
77. [qa ready] /docs/examples/hr-candidate-screen.md
    - Purpose: Summarize resumes; extract skills; fairness caveats.
78. [qa ready] /docs/examples/it-knowledge-bot.md
    - Purpose: Retrieval over internal docs; citations.
79. [qa ready] /docs/examples/sales-email-drafter.md
    - Purpose: Persona‑aware outreach; compliance checkpoints.
80. [qa ready] /docs/examples/marketing-brief-generator.md
81. [qa ready] /docs/examples/legal-clause-extractor.md
82. [qa ready] /docs/examples/education-lesson-planner.md
83. [qa ready] /docs/examples/healthcare-intake-assistant.md (privacy notes)
84. [qa ready] /docs/examples/software-code-reviewer.md (LLM tips + static checks)
85. [qa ready] /docs/examples/data-science-notebook-helper.md
86. [qa ready] /docs/examples/translation-qc.md
87. [qa ready] /docs/examples/research-citation-checker.md

---

## Writer playbook

- Every article should offer value for all proficiency levels:
  - Beginner: plain‑language summary + small runnable/interactive example.
  - Intermediate: design tradeoffs, parameters, and failure modes.
  - Advanced: performance/cost levers, edge cases, and evaluation hooks.
- Cross‑link 2–4 related pages using `/docs/...` paths.
- Prefer structured outputs and include short References (official docs first).
- Keep `audience_levels` and `personas` accurate; update `last_reviewed`.
- Stack emphasis for code samples and tutorials:
    - Prefer Node.js/TypeScript and Next.js (App Router) for web/app scenarios.
    - Prefer Python for data, scripting, and service backends.
    - When showing provider usage, include one Node and one Python example whenever feasible.
    - For lightweight ideation or scaffolding, demonstrate ChatGPT Canvas and provide export steps to a local repo.
    - Use VS Code as the default IDE and highlight GitHub Copilot (and Codex-style prompting) for code assistance.
    - For web apps, prefer deployment on Vercel with Prisma ORM; for local/dev apps, prefer SQLite where possible.
    - When relevant, add data engineering and analytics angles (SQL patterns, dbt workflows, Qlik Cloud/Power BI consumers) and call out ML handoffs.

### Style, structure, and review rules

- Writing style
    - Prefer clear, direct prose. Short paragraphs. Use active voice.
    - Start pages with a 2–3 sentence summary and a “You’ll learn” bullet list (3–5 items).
    - Use sentence‑case headings. One H1 in frontmatter title; start content with H2.
    - Show decisions and tradeoffs; avoid hype. Link to sources for claims.
- Bullets vs prose
    - Use bullets for checklists, tradeoffs, and step recipes; use prose for explanations and context.
    - Keep bullets parallel and concise; max ~7 per list.
- Diagrams (Mermaid)
    - Include sequence diagrams for flows (agentic patterns, RAG pipelines, tool calls) and state diagrams for lifecycles.
    - Place diagrams after a short explanation and before code. Keep them small and labeled.
- Code examples
    - Prefer complete, runnable snippets; include minimal setup and a brief “try it” section.
    - Show both Node and Python where feasible; otherwise pick the stack that best fits the task.
    - Annotate tricky lines with comments; show error handling, timeouts, retries, and schema validation.
    - For structured outputs, include expected JSON examples and simple validators.
- Spec‑driven workflow (spec‑kit inspired)
    - Before coding, draft a prompt spec (intent, inputs/outputs, constraints, risks, eval hooks).
    - Draft tool specs (idempotency, schema, timeouts, error codes) and wire them to prompts.
    - Define eval specs (datasets, metrics, thresholds) and connect them to CI/nightly jobs.
- Review checklist (per PR)
    - Frontmatter complete and valid; arrays deduped; `last_reviewed` updated.
    - Links valid and within scope; no ops/admin/site‑management content.
    - Examples run locally; commands tested; sensitive data scrubbed.
    - References present; at least one provider‑official doc linked.

---

## Source pointers (authoritative)

- OpenAI Platform docs (API overview & reference)
- Anthropic (Claude) docs
- Azure OpenAI (Microsoft Learn)
- Google Gemini docs
- Meta Llama model cards and hosting providers
- Mistral docs
- Cohere docs
- MDN (HTTP, caching, JSON)
- Responsible AI & safety pages from providers
