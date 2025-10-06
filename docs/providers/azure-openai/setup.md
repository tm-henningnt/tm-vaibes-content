---
title: "Azure OpenAI: Setup and First Call"
description: "Create an Azure OpenAI resource and deployment, then call it from Node and Python."
audience_levels: ["beginner", "intermediate"]
personas: ["admin", "developer"]
categories: ["providers", "how-to"]
min_read_minutes: 10
last_reviewed: 2025-10-06
related: ["/docs/providers/azure-openai/migrate-from-openai.md", "/docs/providers/compare-providers.md"]
search_keywords: ["azure openai", "deployment", "api-version", "endpoint", "node", "python"]
---

Provision and deploy

- In Azure Portal: Create “Azure OpenAI” resource (region affects latency/availability).
- In the resource: create a model deployment (e.g., a 4o or o-series model).
- Collect values: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT`.

Env example

```bash
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=***
AZURE_OPENAI_API_VERSION=2024-06-01
AZURE_OPENAI_DEPLOYMENT=my-4o-mini
```

Node call

```ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION }
});

const out = await client.chat.completions.create({
  // For Azure, set model to your deployment name
  model: process.env.AZURE_OPENAI_DEPLOYMENT!,
  messages: [
    { role: 'system', content: 'You are concise and friendly.' },
    { role: 'user', content: 'Hello from Azure OpenAI!' }
  ]
});
```

Python call

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=f"{os.getenv('AZURE_OPENAI_ENDPOINT')}/openai/deployments/{os.getenv('AZURE_OPENAI_DEPLOYMENT')}",
    default_query={"api-version": os.getenv("AZURE_OPENAI_API_VERSION")}
)

out = client.chat.completions.create(
    model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
    messages=[
        {"role": "system", "content": "You are concise and friendly."},
        {"role": "user", "content": "Hello from Azure OpenAI!"}
    ]
)
```

Notes

- Azure uses “deployment name” instead of raw model IDs in requests.
- Always include `api-version`; check Azure docs for the latest supported version.
- Region selection impacts availability and latency.

Portal click‑path (high level)

- Azure Portal → Create Resource → AI + Machine Learning → Azure OpenAI → pick Subscription/Resource Group/Region.
- After creation: Go to your Azure OpenAI resource → Deployments → Create new deployment (choose base model, name your deployment).
- Keys & endpoint: Overview → Keys and Endpoint (copy endpoint and key).

Troubleshooting

- 404/400 on calls: the `model` parameter should be your deployment name, not the base model ID.
- 401/403: wrong key or region; keys are resource‑specific.
- 429: capacity or rate caps; retry with jitter and consider alternate regions.

References

- Microsoft Learn: Create Azure OpenAI resource and deployments
