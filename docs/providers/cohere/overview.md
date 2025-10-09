---
title: Cohere overview
description: Integrate Cohere’s Command models, embeddings, and tool use features with secure authentication, streaming, and evaluation-ready prompts.
audience_levels: [intermediate]
personas: [developer, PM]
categories: [providers]
min_read_minutes: 10
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/compare-providers.md",
    "/docs/concepts/structured-outputs.md",
    "/docs/patterns/tools/function-calling.md",
    "/docs/examples/translation-qc.md"
  ]
search_keywords:
  [
    "cohere command r",
    "cohere api setup",
    "cohere embeddings",
    "cohere tool use",
    "command r plus"
  ]
show_toc: true
---

## Cohere at a glance
Cohere focuses on enterprise-ready language models with strong retrieval, grounding, and multilingual capabilities. The Command family powers chatbots, agents, and knowledge workflows, while Embed models support semantic search. This guide walks through authentication, model selection, and operational tips.

### You’ll learn
- How to create and secure Cohere API keys
- Differences between Command R, Command R+, and Embed models
- Node.js and Python snippets for chat, streaming, and tool calling
- How to use Connectors for grounded retrieval and manage safety settings
- Troubleshooting common errors related to quotas and schema validation

## Account setup

1. **Create a Cohere account** at [dashboard.cohere.com](https://dashboard.cohere.com/) and generate an API key. Store it as `COHERE_API_KEY`.
2. **Select a deployment region.** Cohere hosts in multiple regions; pick the one closest to your users and confirm data residency requirements.
3. **Install SDKs.**
   - Node.js: `npm install cohere-ai`.
   - Python: `pip install cohere`.
4. **Review limits.** Command models enforce RPM and TPM quotas. Monitor usage in the Cohere dashboard and request increases in advance.

## Model lineup

| Model | Context window | Best for | Notes |
| --- | --- | --- | --- |
| Command R+ | 128K tokens | Complex reasoning, tool workflows, multilingual chat | Supports tool calling, JSON mode, retrieval connectors. |
| Command R | 128K tokens | Customer support, summarization, knowledge search | Balanced latency and cost; strong at grounded responses. |
| Embed v3 | 1,024 dimensions | Search, clustering, reranking | Choose `english` or `multilingual` variants based on corpus. |

> **Tip:** Pair Command models with Cohere’s Connectors to ground outputs in enterprise data sources (Confluence, Slack, Salesforce).

## Node.js quickstart

```ts
import Cohere from "cohere-ai";
import { z } from "zod";

Cohere.init(process.env.COHERE_API_KEY!);

const AnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()).max(5),
});

export async function askCommand(prompt: string) {
  const response = await Cohere.chat({
    model: "command-r-plus",
    message: prompt,
    temperature: 0.2,
    response_format: { type: "json_object" },
    tools: [
      {
        name: "lookup_policy",
        description: "Fetch policy guidance by ID",
        input_schema: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    ],
    safety_settings: {
      enable_enhanced_moderation: true,
    },
  });

  const parsed = AnswerSchema.safeParse(JSON.parse(response.text));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
```

- `Cohere.chat` supports single-turn and multi-turn prompts; pass `conversation_id` to maintain history.
- Tool calls appear in `response.tool_calls`; respond with `Cohere.chat` messages including `tool_results`.
- Enhanced moderation adds Cohere Guardrails policies to filter unsafe content.

### Streaming responses

```ts
const stream = await Cohere.chatStream({
  model: "command-r",
  message: "Summarize the new product launch." ,
});

for await (const event of stream) {
  if (event.eventType === "text-generation") {
    process.stdout.write(event.text);
  }
}
```

## Python quickstart

```python
import os
import cohere
from pydantic import BaseModel, ValidationError

class Summary(BaseModel):
    bullets: list[str]

client = cohere.Client(os.environ["COHERE_API_KEY"])

def summarize_case(prompt: str) -> Summary:
    response = client.chat(
        model="command-r",
        message=prompt,
        temperature=0.3,
        response_format={"type": "json_object"},
        connectors=[
            {
                "id": "confluence",
                "source": "confluence",
                "auth": {"type": "oauth"},
                "options": {"spaceKeys": ["AI"]},
            }
        ],
    )

    try:
        return Summary.model_validate_json(response.text)
    except ValidationError as err:
        raise ValueError(f"Invalid JSON: {err}") from err
```

- Connectors let Command models fetch enterprise knowledge. Configure connectors in the Cohere dashboard before referencing them in code.
- Responses include `citations` and `documents` arrays when connectors supply evidence—log them for audit trails.

## Embeddings quickstart

```python
vectors = client.embed(
    texts=["Product roadmap", "FY25 forecast"],
    model="embed-english-v3.0",
)
```

- Normalize vectors before computing cosine similarity. Cohere also provides rerank endpoints for hybrid search.

## Operational best practices

- **Latency:** Command R averages ~1–2 s responses; Command R+ may take longer on complex tasks. Stream outputs or show typing indicators.
- **Safety:** Combine Cohere Guardrails with your own filters. Inspect `response.moderation` fields to see blocked categories.
- **Cost:** Track token usage via `response.meta.tokens`. Cache connector results to reduce repeated retrieval costs.
- **Observability:** Log `response.id` and `response.meta.requestId` for debugging with Cohere support.

## Troubleshooting

- **401 Unauthorized:** Check that the key is active and associated with the right organization. Keys are environment-specific.
- **429 Rate limited:** Apply retries with exponential backoff; contact support for quota increases.
- **400 Invalid request:** Usually indicates malformed JSON, unsupported connector IDs, or exceeding context length.
- **Tool call errors:** Ensure your tool results include the required fields defined in `input_schema`.

## Where to go next

- `/docs/providers/compare-providers.md` — evaluate Command models versus OpenAI GPT-4o and Anthropic Claude.
- `/docs/concepts/structured-outputs.md` — strengthen JSON validation for multi-provider responses.
- `/docs/patterns/tools/function-calling.md` — reusable tool orchestration patterns.
- `/docs/examples/translation-qc.md` — apply Cohere to localization QA.

## References

- Cohere. “Chat API reference.” 2024. <https://docs.cohere.com/docs/chat>
- Cohere. “Tool use and structured outputs.” 2024. <https://docs.cohere.com/docs/tool-use>
- Cohere. “Connectors overview.” 2024. <https://docs.cohere.com/docs/connectors>
- Cohere. “Embeddings API.” 2024. <https://docs.cohere.com/docs/embed>
