---
title: Anthropic overview and setup
description: Configure Claude API access, pick the right model, and ship reliable Anthropic integrations with tool use and safety guardrails.
audience_levels: [beginner, intermediate]
personas: [developer, admin]
categories: [providers]
min_read_minutes: 12
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/compare-providers.md",
    "/docs/providers/security-best-practices.md",
    "/docs/patterns/tools/function-calling.md",
    "/docs/concepts/safety-basics.md"
  ]
search_keywords:
  [
    "anthropic setup",
    "claude api",
    "tool use",
    "anthropic streaming",
    "claude rate limits"
  ]
show_toc: true
---

## Anthropic at a glance
Anthropic’s Claude 3 family focuses on high-quality reasoning, tool use, and constitutional safety defaults. The API exposes text-only and multimodal models through a Messages endpoint that requires explicit headers for versioning and model capabilities. This guide walks through setup, core capabilities, and production readiness tips so you can ship Claude-backed features confidently.

### You’ll learn
- Required authentication headers, environment variables, and regional considerations for Claude APIs
- How to send your first request in Node.js and Python with streaming and JSON responses
- Key differences among Claude 3 Opus, Sonnet, and Haiku, including cost and latency tradeoffs
- How to define tool schemas, read tool call responses, and validate structured outputs
- Troubleshooting steps for rate limits, safety refusals, and schema validation errors

## Account setup and authentication

1. **Create an Anthropic account** and provision an API key from the [console](https://console.anthropic.com/). Keys are scoped per organization and should be stored as `ANTHROPIC_API_KEY` in your secrets manager.
2. **Pass required headers** on every request:
   - `x-api-key`: your secret key.
   - `anthropic-version`: current stable API version (for Claude 3, use `2023-06-01` unless the docs announce a newer one).
   - `content-type: application/json`.
3. **Choose a model deployment region.** Anthropic currently hosts in the US; if you need EU data residency, consider running through AWS Bedrock with Claude models instead.
4. **Plan for quotas.** Anthropic enforces RPM (requests per minute) and TPM (tokens per minute) limits per account tier. Submit a quota increase with observed usage before you launch high-traffic workloads.

> **Tip:** Store headers centrally (e.g., HTTP client middleware) to avoid subtle outages when rotating keys or bumping API versions.

## Node.js quickstart with streaming

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude() {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 400,
    temperature: 0.2,
    system: "You are a concise technical assistant.",
    messages: [
      { role: "user", content: "Summarize the Claude 3 family in bullet points." },
    ],
    stream: true,
  });

  let output = "";
  for await (const chunk of message) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      output += chunk.delta.text;
      process.stdout.write(chunk.delta.text);
    }
  }

  return output.trim();
}
```

- The SDK handles the `anthropic-version` header automatically.
- Streaming returns an async iterator; flush partial tokens to the client UI to reduce perceived latency.
- Use `max_tokens` to cap spend and enforce deterministic responses with `temperature: 0` when you need consistency.

## Python quickstart with JSON modes

```python
import os
from anthropic import Anthropic, APIError
from pydantic import BaseModel, ValidationError

class Summary(BaseModel):
    bullet_points: list[str]

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def summarize_requirements(prompt: str) -> Summary:
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=400,
            temperature=0,
            system="Return bullet_points as JSON.",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json"},
        )
    except APIError as err:
        raise RuntimeError(f"Anthropic request failed: {err}") from err

    data = response.content[0].text
    try:
        return Summary.model_validate_json(data)
    except ValidationError as err:
        raise ValueError(f"Invalid schema: {err}") from err
```

- Claude returns an array of content blocks; the SDK assembles text for you.
- When using `response_format`, validate with Pydantic (or Zod in Node) before trusting downstream consumers.

## Model portfolio and selection

| Model | Context window | Best for | Notes |
| --- | --- | --- | --- |
| Claude 3 Opus | 200K tokens | Complex reasoning, long documents, high-stakes analysis | Highest latency/cost; reserve for workflows that need accuracy above all else. |
| Claude 3.5 Sonnet | 200K tokens | Balanced reasoning, coding help, moderate latency | Strong coding/tool use performance; good default for production. |
| Claude 3 Haiku | 200K tokens | Customer support, lightweight summarization | Fastest and cheapest; pair with evals for accuracy-sensitive tasks. |

- **Vision and multimodal:** Sonnet and Opus accept images; send via the Messages API with `type: "image"` blocks referencing base64 data or hosted URLs.
- **Tool use:** All Claude 3 models support tool definitions with JSON schema-like metadata. Keep tool responses small (≤ 16 KB) to stay within context limits.

## Defining and handling tool calls

```ts
const tools = [
  {
    name: "lookup_product",
    description: "Fetch product details by SKU.",
    input_schema: {
      type: "object",
      properties: { sku: { type: "string" } },
      required: ["sku"],
    },
  },
];

const message = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 350,
  messages: [
    { role: "user", content: "Explain product SKU123 including availability." },
  ],
  tools,
});

if (message.stop_reason === "tool_use") {
  const call = message.content.find((block) => block.type === "tool_use");
  const payload = JSON.parse(call.input);
  const toolResult = await lookupProduct(payload.sku);

  const followUp = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 350,
    messages: [
      ...message.messages,
      {
        role: "tool",
        content: [{ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(toolResult) }],
      },
    ],
  });
}
```

- Respond to each `tool_use` block with a `tool` message referencing the `tool_use_id`.
- Enforce timeouts on real-world tools; retry or surface graceful fallbacks if the tool response is unavailable.

## Operational guardrails

- **Latency and retries:** Anthropic recommends exponential backoff with jitter on HTTP 429 and 5xx responses. Cap retries to avoid runaway loops and log the `request_id` header for support escalation.
- **Safety:** Claude may refuse prompts that violate policies. Capture refusal categories from the response metadata, then provide alternate flows (e.g., ask the user to rephrase or hand off to human review).
- **Monitoring:** Log input/output token counts (`usage.output_tokens`, `usage.input_tokens`) and add alerts when you approach quota ceilings.
- **Data privacy:** Strip PII and secrets from prompts before logging; apply encryption at rest for stored transcripts.

## Troubleshooting checklist

- [ ] `401 Unauthorized`: verify the key, ensure it matches the organization running the request.
- [ ] `400 Bad Request`: check that `max_tokens` is set and the JSON body is valid.
- [ ] `429 Rate Limit`: throttle client traffic, implement token-based budgets, and request higher quotas via support.
- [ ] Safety refusal: inspect `stop_reason` and adjust prompt context or escalate to a human reviewer.
- [ ] Tool loop: guard against recursive tool calls by enforcing max iterations.

## Where to go next

- `/docs/providers/compare-providers.md` — benchmark Claude against OpenAI, Gemini, and others.
- `/docs/providers/security-best-practices.md` — secure API keys and manage audit trails.
- `/docs/patterns/tools/function-calling.md` — design reusable tool schemas.
- `/docs/concepts/safety-basics.md` — safety mindset for early prototypes.

## References

- Anthropic. “API reference: Messages.” 2024. <https://docs.anthropic.com/en/api/messages>
- Anthropic. “Model capabilities and pricing.” 2024. <https://docs.anthropic.com/en/docs/about-claude/models>
- Anthropic. “Tool use guide.” 2024. <https://docs.anthropic.com/en/docs/tool-use>
- Anthropic. “Rate limits and quotas.” 2024. <https://docs.anthropic.com/en/docs/rate-limits>
