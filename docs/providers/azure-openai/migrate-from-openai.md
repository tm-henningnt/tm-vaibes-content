---
title: Migrate from OpenAI to Azure OpenAI
description: Map REST endpoints, deployments, authentication, and quotas so you can move workloads from OpenAI’s public API to Azure OpenAI with minimal regressions.
audience_levels: [intermediate]
personas: [developer, admin]
categories: [providers]
min_read_minutes: 11
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/azure-openai/setup.md",
    "/docs/providers/security-best-practices.md",
    "/docs/providers/compare-providers.md",
    "/docs/concepts/token-costs-latency.md"
  ]
search_keywords:
  [
    "azure openai migration",
    "deployment name",
    "api-version",
    "azure quotas",
    "openai compatibility"
  ]
show_toc: true
---

## Why migrate to Azure OpenAI?
Teams often move workloads from OpenAI’s public API to Azure OpenAI for enterprise compliance, network isolation, or regional availability. The APIs share similar request bodies, but Azure introduces new concepts—resource endpoints, deployment names, API versions, and Azure AD authentication options—that you must handle explicitly. This guide maps key differences and walks through a safe migration playbook.

### You’ll learn
- How Azure resource hierarchy changes your base URL, headers, and authentication
- How to translate OpenAI model IDs into Azure deployment names across SDKs
- Migration scripts for Node.js and Python, including streaming and response validation
- A regression test plan covering latency, cost, and content safety behavior
- Troubleshooting guidance for common HTTP errors and quota mismatches

## Concept mapping

| Concept | OpenAI public API | Azure OpenAI | Migration note |
| --- | --- | --- | --- |
| Endpoint | `https://api.openai.com/v1/...` | `https://<resource-name>.openai.azure.com/openai/deployments/<deployment>/...` | Replace base URL with your resource endpoint and include deployment path segment. |
| Authentication | Bearer key in `Authorization` header | API key header **or** Azure AD token | You can keep key-based auth initially; plan Azure AD for production RBAC. |
| Model selection | `model: "gpt-4o-mini"` | `model: "<deployment-name>"` | Deploy each model in Azure portal; reference the deployment alias. |
| Versioning | SDK defaults | Required `api-version` query parameter | Use a pinned version across all requests; upgrade deliberately. |
| Quotas | Global per account | Per deployment, per region | Monitor `x-ms-` headers for rate limit feedback; request capacity per region. |

## Configure environment variables

```bash
export AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT_CHAT="prod-gpt-4o"
export AZURE_OPENAI_API_KEY="<secret>"
export AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

- Maintain one deployment variable per workload (chat, embeddings, audio) to avoid collisions.
- `AZURE_OPENAI_API_VERSION` must match a published API version; preview versions change frequently.

## Node.js migration example

```ts
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_CHAT}`,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
});

const ChatSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()).max(5),
});

export async function migratePrompt(userPrompt: string) {
  const response = await client.responses.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT_CHAT!,
    input: [
      { role: "system", content: "Answer with JSON containing answer and citations." },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "chat_output", schema: ChatSchema },
    },
    temperature: 0.2,
    max_output_tokens: 400,
  });

  const parsed = ChatSchema.safeParse(JSON.parse(response.output_text));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
```

- Azure SDKs sometimes expect the API key in both the constructor and `api-key` header; include both for consistency.
- `responses.create` works with the 2024-08-01-preview version; for older API versions use `client.chat.completions.create`.
- The deployment name becomes the `model` value.

## Python migration example

```python
import os
from openai import OpenAI, APIStatusError
from pydantic import BaseModel, ValidationError

class ChatResult(BaseModel):
    answer: str
    citations: list[str]

client = OpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    base_url=f"{os.environ['AZURE_OPENAI_ENDPOINT']}/openai/deployments/{os.environ['AZURE_OPENAI_DEPLOYMENT_CHAT']}",
    default_query={"api-version": os.environ["AZURE_OPENAI_API_VERSION"]},
    default_headers={"api-key": os.environ["AZURE_OPENAI_API_KEY"]},
)

def migrate_prompt(prompt: str) -> ChatResult:
    try:
        response = client.responses.create(
            model=os.environ["AZURE_OPENAI_DEPLOYMENT_CHAT"],
            input=[
                {"role": "system", "content": "Use JSON with answer and citations."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            max_output_tokens=400,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "chat_output",
                    "schema": ChatResult.model_json_schema(),
                },
            },
        )
    except APIStatusError as err:
        raise RuntimeError(f"Azure OpenAI failed: {err.status_code} {err.response}") from err

    try:
        return ChatResult.model_validate_json(response.output[0].content[0].text)
    except (ValidationError, IndexError) as err:
        raise ValueError(f"Unexpected schema: {err}") from err
```

- For `chat.completions`, reference `response.choices[0].message`. For `responses`, use `response.output`.
- Azure returns `x-ms-request-id` headers; log them for support tickets.

## Regression testing

1. **Capture baseline metrics** from OpenAI: latency, token usage, refusal rates, rubric scores.
2. **Replay golden prompts** against Azure using the same temperature, max tokens, and system prompts.
3. **Compare outputs** with semantic diffing or evaluation prompts. Expect minor variation; set acceptable deltas.
4. **Load test** with planned concurrency to ensure you stay under per-deployment rate limits.
5. **Update incident playbooks** with Azure portal steps for monitoring, scaling, and quota increase requests.

## Troubleshooting

- **401 Unauthorized:** Confirm you are using the resource-level key, not the portal global key. Rotate keys via Azure portal > Keys and Endpoint.
- **404 Not Found:** Deployment name mismatch or wrong base URL path. Double-check the deployment ID and region.
- **429 Too Many Requests:** Inspect `retry-after` and `x-ms-ratelimit-remaining-requests`. Throttle traffic and request a quota increase.
- **502/503 Errors:** Azure region throttling. Implement retries with exponential backoff and consider a secondary region.
- **Model availability:** Not all OpenAI models are available in Azure. Review the [model matrix](https://learn.microsoft.com/azure/ai-services/openai/concepts/models) before migrating.

## Differences beyond the API

- **Networking:** Use Private Link or VNet integration to restrict API access to corporate networks.
- **Content filtering:** Azure applies content filters that may block outputs previously allowed on OpenAI. Capture and review filter reasons (`content_filter_results`).
- **Compliance:** Azure inherits Microsoft compliance certifications; align with your governance team on logging and retention.
- **Cost management:** Monitor Azure Cost Management and set budgets; pricing depends on the deployment region.

## Where to go next

- `/docs/providers/azure-openai/setup.md` — provisioning steps and Azure portal screenshots.
- `/docs/providers/security-best-practices.md` — secrets handling, key rotation, and RBAC.
- `/docs/providers/compare-providers.md` — feature matrix across major LLM providers.
- `/docs/concepts/token-costs-latency.md` — estimate spend and latency impacts post-migration.

## References

- Microsoft Learn. “Azure OpenAI Service REST API reference.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/reference>
- Microsoft Learn. “Deploy models in Azure OpenAI Service.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/deployment>
- Microsoft Learn. “Quota management for Azure OpenAI Service.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/quota>
- Microsoft Learn. “Azure OpenAI content filtering.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter>
