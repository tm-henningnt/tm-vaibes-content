---
title: "Cross‑Provider Tool/Function Calling"
description: "Design schemas, ensure idempotency, and propagate errors consistently across providers."
audience_levels: ["intermediate", "advanced"]
personas: ["developer"]
categories: ["patterns"]
min_read_minutes: 10
last_reviewed: 2025-10-06
related: ["/docs/patterns/agentic/router-multi-tool.md", "/docs/patterns/workflows/batch-processing.md"]
search_keywords: ["function calling", "tools", "schema", "errors", "openai", "anthropic"]
---

Schema design

- Small, explicit JSON schemas; required vs optional; enums where possible.
- Include correlation/id fields when side effects happen.

Idempotency

- Use idempotency keys and safe PUT/POST patterns; make retries safe.

Errors

- Categorize: user (4xx), transient (429/5xx), permanent.
- Return structured errors to the model with codes and messages.

OpenAI example (tools)

```ts
const tools = [
  {
    type: 'function',
    function: {
      name: 'createTicket',
      description: 'Create a ticket',
      parameters: {
        type: 'object',
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title']
      }
    }
  }
];
```

Anthropic example (tools/messages)

```json
{
  "model": "claude-3-haiku-20240307",
  "tools": [{
    "name": "createTicket",
    "description": "Create a ticket",
    "input_schema": {
      "type": "object",
      "properties": { "title": { "type": "string" }, "body": { "type": "string" } },
      "required": ["title"]
    }
  }],
  "messages": [{ "role": "user", "content": "Open a bug titled 'Login fails'" }]
}
```

Execution loop

- Parse tool call, validate JSON, execute with timeout, and return result as JSON.
- Abort on consecutive tool errors; ask for clarification if inputs are missing.

End-to-end loop (sketch)

```ts
const completion = await client.chat.completions.create({ model, tools, messages });
const call = completion.choices?.[0]?.message?.tool_calls?.[0];
if (call) {
  const args = safeParse(call.function.arguments, schema);
  const result = await withTimeout(() => executeTool(call.function.name, args), 5000);
  messages.push({ role: 'tool', name: call.function.name, content: JSON.stringify(result) });
  const final = await client.chat.completions.create({ model, tools, messages });
  return final;
}
```

Security

- Validate and sanitize inputs before tool execution; reject unknown tools.
- Enforce per-tool timeouts and rate limits; log only metadata.
