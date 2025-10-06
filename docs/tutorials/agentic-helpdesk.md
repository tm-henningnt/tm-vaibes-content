---
title: "Tutorial: Agentic Helpdesk"
description: "Build a helpdesk agent with tools (ticketing, search), plus a quick eval loop to verify outputs."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["tutorials"]
min_read_minutes: 15
last_reviewed: 2025-10-06
related: ["/docs/patterns/agentic/router-multi-tool.md", "/docs/patterns/tools/function-calling.md", "/docs/evaluations/tool-use-evals.md"]
search_keywords: ["helpdesk", "agent", "tools", "ticketing", "evals"]
---

What you’ll build

- A router agent that picks between `searchDocs` and `createTicket`, with basic evals for tool success.

Steps

- Define tools: names, descriptions, JSON schemas, timeouts.
- Route: classify intent and return a single tool call with args.
- Execute: validate args, call tool, return structured JSON to the model.
- Evaluate: sample runs, assert tool success and friendly responses.

Tool schema (OpenAI)

```ts
const tools = [
  {
    type: 'function',
    function: {
      name: 'searchDocs',
      description: 'Search product docs',
      parameters: {
        type: 'object',
        properties: { q: { type: 'string' } },
        required: ['q']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'createTicket',
      description: 'Create a helpdesk ticket',
      parameters: {
        type: 'object',
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title']
      }
    }
  }
];
```

Eval hook (pseudo)

```ts
function assertFriendly(result: string) { if (!/thank|glad|help/i.test(result)) throw new Error('tone'); }
function assertToolSuccess(meta: any) { if (!meta?.tool_ok) throw new Error('tool failed'); }
```

Next

- Add reflection loop for tougher tasks; see `/docs/patterns/agentic/reflection-self-heal.md`.

