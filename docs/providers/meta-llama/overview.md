---
title: Meta Llama overview
description: Choose between the hosted Llama API and self-managed deployments, configure authentication, and ship tool-aware prompts with responsible-use guardrails.
audience_levels: [intermediate, advanced]
personas: [developer, admin]
categories: [providers]
min_read_minutes: 12
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/compare-providers.md",
    "/docs/concepts/safety-basics.md",
    "/docs/patterns/tools/function-calling.md",
    "/docs/patterns/cost-controls.md"
  ]
search_keywords:
  [
    "meta llama api",
    "llama 3 setup",
    "self host llama",
    "llama guard",
    "llama tool calling"
  ]
show_toc: true
---

## Llama at a glance
Meta’s Llama 3 family is available as a managed API from Meta and through partner clouds (AWS Bedrock, Azure, Snowflake) while remaining open for self-hosted inference. Models emphasize strong reasoning, multilingual support, and open licensing. This page covers the hosted Llama API, deployment options, and reliability practices.

### You’ll learn
- Where to obtain access tokens for the Llama API and partner platforms
- Differences among Llama 3.3 70B, 8B, and Guard models with context sizes and use cases
- How to call the Llama API from Node.js and Python with JSON and tool calling
- Operational considerations for self-hosting versus fully managed providers
- Troubleshooting tips for rate limits, unsupported parameters, and safety enforcement

## Access paths

1. **Meta Llama API (recommended to start).** Request access at [llama.meta.com](https://www.llama.com/llama-api/) and create a developer key. Requests hit `https://api.llama-api.com/v1/...` with Bearer authentication.
2. **Cloud partners.**
   - **AWS Bedrock:** Deploy Llama 3.1 and 3.2 models with IAM-managed auth.
   - **Microsoft Azure:** Access via Azure AI model catalog with managed networking.
   - **Snowflake Cortex, Hugging Face, Together AI:** Offer hosted inference with custom SDKs.
3. **Self-hosting.** Use open-source weights via the [Llama GitHub repository](https://github.com/meta-llama/llama3). Plan for GPU capacity (A100/H100 class) and compliance reviews if you modify weights.

> **Tip:** Even if you self-host, start by validating prompts on the hosted API to set a quality baseline before optimizing infrastructure.

## Model lineup

| Model | Parameters | Context window | Notes |
| --- | --- | --- | --- |
| Llama 3.3 70B Instruct | 70B | 128K tokens | Flagship reasoning/chat model with tool calling support. |
| Llama 3.1 8B Instruct | 8B | 128K tokens | Fast, cost-efficient; good for on-device or low-latency scenarios. |
| Llama Guard 3 | 8B | 8K tokens | Safety classifier to screen prompts and responses. |

- **Modalities:** Text-only. Pair with third-party vision models when you need multimodal support.
- **Licensing:** Commercial use allowed under the [Meta Llama 3 Community License](https://www.llama.com/docs/licensing/llama-community-license/); review redistribution terms when hosting yourself.

## Node.js quickstart

```ts
import fetch from "node-fetch";
import { z } from "zod";

const OutputSchema = z.object({
  answer: z.string(),
  follow_up: z.array(z.string()).max(3),
});

export async function askLlama(prompt: string) {
  const res = await fetch("https://api.llama-api.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: "Respond with JSON containing answer and follow_up." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`Llama API error: ${res.status} ${await res.text()}`);
  }

  const payload = await res.json();
  const text = payload.choices[0].message.content;
  const parsed = OutputSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
```

- The hosted API mirrors OpenAI’s Chat Completions format; reuse existing abstractions.
- `response_format` is optional but enforces JSON output when set to `json_object`.
- Capture `x-request-id` headers for Meta support tickets.

## Python quickstart with tool calling

```python
import os
import requests

API_URL = "https://api.llama-api.com/v1/chat/completions"
API_KEY = os.environ["LLAMA_API_KEY"]

def lookup_article(article_id: str) -> dict:
    # Replace with real lookup
    return {"id": article_id, "title": "Example", "url": "https://example.com"}

def ask_llama(prompt: str) -> str:
    body = {
        "model": "llama-3.1-8b-instruct",
        "messages": [
            {"role": "system", "content": "You can call tools when you need metadata."},
            {"role": "user", "content": prompt},
        ],
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "lookup_article",
                    "description": "Get citation metadata by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {"id": {"type": "string"}},
                        "required": ["id"],
                    },
                },
            }
        ],
    }

    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()

    choice = data["choices"][0]
    if choice["finish_reason"] == "tool_calls":
        call = choice["message"]["tool_calls"][0]
        args = call["function"]["arguments"]
        result = lookup_article(args["id"])

        follow_up = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.1-8b-instruct",
                "messages": body["messages"] + [
                    choice["message"],
                    {
                        "role": "tool",
                        "tool_call_id": call["id"],
                        "content": result,
                    },
                ],
            },
            timeout=30,
        )
        follow_up.raise_for_status()
        data = follow_up.json()
    return data["choices"][0]["message"]["content"]
```

- Meta returns tool calls via `finish_reason: "tool_calls"`. Respond with a `tool` role containing the original `tool_call_id`.
- The Python example uses `requests`; switch to `httpx` for async support.
- Always set timeouts when calling external tools to avoid hanging inference loops.

## Operational guardrails

- **Quotas:** The hosted API enforces requests-per-minute and tokens-per-minute limits per account. Monitor headers and request increases early.
- **Latency:** Llama 3.3 70B may exceed 5–8 seconds for complex prompts. Use the 8B model for real-time UX and escalate only when accuracy demands.
- **Safety:** Pair Llama Guard 3 before and after prompts to filter unsafe content. Meta provides reference [policies](https://www.llama.com/docs/safety/usage-policies/); enforce them in your system prompts.
- **Self-hosting:** Invest in observability (Prometheus + Grafana) and integrate automatic restarts for GPU node failures. Mirror Meta’s tokenizer (SentencePiece) to maintain compatibility.

## Troubleshooting

- **401 Unauthorized:** Ensure the Bearer token is current; tokens expire if unused for extended periods.
- **400 Bad Request:** Happens when messages exceed context or when tool schema is invalid. Validate JSON before sending.
- **429 Rate Limit:** Back off with jitter and queue requests. Long-running prompts count toward TPM limits.
- **Unsupported parameter:** The hosted API may lag behind OpenAI feature parity; remove unsupported fields like `seed` or `logprobs`.
- **Safety rejection:** Inspect response metadata; if the Guard model blocks content, rephrase prompts or escalate to human review.

## Where to go next

- `/docs/providers/compare-providers.md` — evaluate when Llama beats managed alternatives.
- `/docs/patterns/tools/function-calling.md` — design robust tool schemas for any provider.
- `/docs/concepts/safety-basics.md` — build layered safety reviews.
- `/docs/patterns/cost-controls.md` — enforce budgets across multi-provider deployments.

## References

- Meta. “Llama API quickstart.” 2024. <https://www.llama.com/docs/llama-api/getting-started>
- Meta. “Llama 3 model card.” 2024. <https://www.llama.com/docs/model-cards-and-safety/llama3>
- Meta. “Llama Guard 3: Safety classifier.” 2024. <https://www.llama.com/docs/model-cards-and-safety/llama-guard>
- Meta. “Usage policies for Llama.” 2024. <https://www.llama.com/docs/safety/usage-policies>
