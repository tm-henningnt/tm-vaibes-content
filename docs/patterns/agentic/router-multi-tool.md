---
title: "Router Agent: Multi‑Tool Selection"
description: "Design a router that selects among tools based on user intent, with guardrails and timeouts."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/patterns/tools/function-calling.md", "/docs/patterns/a2a-agent-to-agent.md", "/docs/patterns/observability-context.md"]
search_keywords: ["router agent", "tool selection", "multi tool", "guardrails", "timeouts"]
---

Concept

- A router agent classifies a request and chooses a tool or sub-agent.
- Keep a simple registry: name, description, JSON schema, and timeouts.

Registry example

```ts
type Tool = {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  timeoutMs: number;
  call: (args: any) => Promise<any>;
};

const tools: Tool[] = [
  { name: 'searchDocs', description: 'Search docs by keyword', schema: { q: 'string' }, timeoutMs: 3000, call: async ({ q }) => ({ hits: [] }) },
  { name: 'createTicket', description: 'Open an issue/ticket', schema: { title: 'string', body: 'string' }, timeoutMs: 5000, call: async (args) => ({ id: 123 }) }
];
```

Routing prompt

```text
Given a user request, pick ONE tool from the list and return JSON:
{ "tool": <name>, "args": { ... }, "rationale": "..." }
```

Guardrails

- Idempotent tools; validate inputs against schema before execution.
- Per-tool timeout and retries; whitelist tools per user/role.
- Log metadata (tool name, latency, outcome) with correlation IDs.

Failure modes

- No clear match → ask a clarifying question.
- Tool error → return user-friendly failure and optionally suggest alternatives.

End-to-end flow (sketch)

1) Classify intent and choose a tool name + args (JSON only; no execution).
2) Validate args against schema and user/role allow‑lists.
3) Execute tool with timeout and retries; return structured JSON.
4) Provide a user‑friendly answer summarizing the outcome (include references when applicable).

Role‑based allow‑lists

- Map user roles to permitted tools (e.g., `User` may call `searchDocs`, only `Admin` can call `createTicket`). Deny by default.
