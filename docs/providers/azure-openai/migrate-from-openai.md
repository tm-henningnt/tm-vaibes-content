---
title: "Migrate from OpenAI to Azure OpenAI"
description: "Map base URL, api-version, and deployment names; avoid common pitfalls."
audience_levels: ["intermediate"]
personas: ["developer"]
categories: ["providers", "how-to", "troubleshooting"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/providers/azure-openai/setup.md", "/docs/troubleshooting/provider-errors.md"]
search_keywords: ["azure openai migrate", "deployment vs model", "api-version", "base url"]
---

Key differences

- Base URL changes to your resource endpoint.
- You must include `api-version` on every request.
- You target a deployment name (your alias) rather than a raw model ID.

Node mapping

```diff
- const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
+ const client = new OpenAI({
+   apiKey: process.env.AZURE_OPENAI_API_KEY,
+   baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
+   defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION }
+ });

- model: 'gpt-4o-mini'
+ model: process.env.AZURE_OPENAI_DEPLOYMENT
```

Python mapping

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
    messages=[{"role": "user", "content": "Ping"}],
)
```

Common pitfalls

- 404 or 400: deployment name mismatch—use your deployment alias, not a raw model.
- 401: wrong key or region—keys are resource-specific.
- 429: capacity—apply retries and consider regional alternatives.

References

- Azure OpenAI docs (api-version, deployments, regions)

