---
title: Mistral overview
description: Connect to Mistral’s hosted API, choose the right model, and deploy lightweight, high-performance LLM workflows with tool use, streaming, and guardrails.
audience_levels: [intermediate]
personas: [developer, data-analyst]
categories: [providers]
min_read_minutes: 11
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/compare-providers.md",
    "/docs/patterns/tools/function-calling.md",
    "/docs/patterns/cost-controls.md",
    "/docs/examples/provider-switching.md"
  ]
search_keywords:
  [
    "mistral api",
    "mistral large",
    "mistral tool use",
    "mistral streaming",
    "mistral setup"
  ]
show_toc: true
---

## Mistral AI at a glance
Mistral offers compact, efficient models hosted in the EU with a developer-friendly API. Their lineup includes general-purpose instruction models, tool-aware “Large” models, and specialist options for code and reasoning. This page covers setup, model selection, and operational best practices when integrating Mistral into your stack.

### You’ll learn
- How to obtain and secure Mistral API keys
- Differences among Mistral Small, Mistral Large, and Codestral models
- Node.js and Python examples for chat, streaming, and tool calling
- Guidelines for latency, cost management, and safe deployment
- Troubleshooting strategies for rate limits and schema errors

## Account setup

1. **Create an account** at [Mistral AI](https://auth.mistral.ai/login) and generate an API key. Store it as `MISTRAL_API_KEY` in your secrets manager.
2. **Review regions and compliance.** Requests route through EU-based infrastructure; confirm data residency requirements align with your governance policies.
3. **Install SDKs.**
   - Node.js: `npm install @mistralai/mistralai`.
   - Python: `pip install mistralai`.
4. **Plan quotas.** Mistral enforces TPM and RPM ceilings. Track usage in the developer console and request increases ahead of launches.

## Model portfolio

| Model | Context window | Best for | Notes |
| --- | --- | --- | --- |
| `mistral-large-latest` | 32K tokens | Tool use, reasoning, multilingual support | Supports function calling, JSON output, and retrieval tasks. |
| `mistral-small-latest` | 32K tokens | Customer support, classification, summarization | Lower latency and cost; strong baseline for chatbots. |
| `codestral-latest` | 32K tokens | Code completion, refactoring, test generation | Optimized for code tasks; use with repo context and evals. |
| `ministral-8b-latest` | 8K tokens | On-device or latency-sensitive flows | Lightweight inference with modest reasoning ability. |

> **Tip:** Start with `mistral-small-latest` for prototypes; upgrade specific prompts to `mistral-large-latest` when evals justify the cost.

## Node.js quickstart with tool calling

```ts
import { MistralClient } from "@mistralai/mistralai";
import { z } from "zod";

const client = new MistralClient({ apiKey: process.env.MISTRAL_API_KEY! });

const SummarySchema = z.object({
  summary: z.string(),
  action_items: z.array(z.string()).max(5),
});

export async function summarizeNotes(prompt: string) {
  const response = await client.chat({
    model: "mistral-large-latest",
    messages: [
      { role: "system", content: "Return JSON with summary and action_items." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
    tools: [
      {
        type: "function",
        function: {
          name: "lookup_owner",
          description: "Return account owner by ID",
          parameters: {
            type: "object",
            properties: { id: { type: "string" } },
            required: ["id"],
          },
        },
      },
    ],
  });

  const content = response.choices[0].message.content;
  const parsed = SummarySchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
```

- The SDK exposes `chat` for multi-turn exchanges; use `responses.create` if you prefer OpenAI-compatible semantics.
- Function calls appear in `response.choices[0].message.tool_calls`; respond with `role: "tool"` messages referencing the `id`.
- `response_format` enforces JSON responses when paired with schema validation.

### Streaming tokens

```ts
for await (const chunk of client.chatStream({
  model: "mistral-small-latest",
  messages: [{ role: "user", content: "Draft a three-sentence update." }],
})) {
  process.stdout.write(chunk.data);
}
```

- Streaming reduces perceived latency for chat UIs; flush data to the client incrementally.

## Python quickstart

```python
import os
from mistralai import Client, MistralException
from pydantic import BaseModel, ValidationError

class Response(BaseModel):
    rationale: str
    next_steps: list[str]

client = Client(api_key=os.environ["MISTRAL_API_KEY"])

def generate_plan(prompt: str) -> Response:
    try:
        completion = client.chat(
            model="mistral-large-latest",
            messages=[
                {"role": "system", "content": "Return JSON with rationale and next_steps."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
    except MistralException as err:
        raise RuntimeError(f"Mistral API error: {err}") from err

    text = completion.choices[0].message["content"]
    try:
        return Response.model_validate_json(text)
    except ValidationError as err:
        raise ValueError(f"Invalid schema: {err}") from err
```

- The Python client mirrors the REST API; handle `MistralException` for network and policy errors.
- Use `client.responses.stream` for streaming tokens if you need partial output.

## Operational guidance

- **Latency:** `mistral-small-latest` typically responds in <1 s for short prompts; `mistral-large-latest` can take 3–6 s. Instrument latency metrics and set budgets by endpoint.
- **Cost:** Pricing is per input and output token. Cache prompts or use retrieval to reduce context size. Switch to the `light` tier (`ministral-8b`) for low-cost experimentation.
- **Safety:** Apply the [Mistral usage guidelines](https://docs.mistral.ai/platform/guardrails/) and capture refusal categories when the API declines a request.
- **Observability:** Log `response.id` and `usage` token counts for tracing. Add alerts when error rates exceed thresholds.

## Troubleshooting

- **401 Unauthorized:** Key missing or rotated; verify environment variables and rotate via the Mistral console.
- **400 Bad Request:** Often indicates malformed JSON or unsupported parameters. Validate request bodies before sending.
- **404 Model not found:** Ensure the `model` string matches a deployed version (`-latest` suffix required).
- **429 Rate limit:** Slow down requests and enable exponential backoff with jitter. Consider batching low-priority tasks overnight.
- **Safety refusal:** Inspect `response.choices[0].finish_reason`; when `safety`, adjust prompts or escalate to humans.

## Where to go next

- `/docs/providers/compare-providers.md` — contrast Mistral with OpenAI and Anthropic on latency and pricing.
- `/docs/patterns/tools/function-calling.md` — shared design patterns for tool-aware prompting.
- `/docs/patterns/cost-controls.md` — enforce usage budgets across providers.
- `/docs/examples/provider-switching.md` — dynamically route traffic between providers based on SLAs.

## References

- Mistral AI. “Quickstart guide.” 2024. <https://docs.mistral.ai/getting-started/quickstart>
- Mistral AI. “Models catalog.” 2024. <https://docs.mistral.ai/models/overview>
- Mistral AI. “Function calling.” 2024. <https://docs.mistral.ai/guides/function-calling>
- Mistral AI. “Safety and guardrails.” 2024. <https://docs.mistral.ai/platform/guardrails>
