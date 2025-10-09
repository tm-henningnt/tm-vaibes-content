---
title: "Azure OpenAI: Setup and First Call"
description: "Provision Azure OpenAI safely, deploy a model, and make your first call from Node.js and Python."
audience_levels: [beginner, intermediate]
personas: [admin, developer]
categories: [providers, quickstarts]
min_read_minutes: 15
last_reviewed: 2025-02-14
related:
  - "/docs/providers/azure-openai/migrate-from-openai.md"
  - "/docs/providers/compare-providers.md"
  - "/docs/providers/security-best-practices.md"
search_keywords:
  - "azure openai setup"
  - "deployment name"
  - "api-version"
  - "azure cli"
show_toc: true
---

## Overview
Azure OpenAI wraps the OpenAI model family inside Azure’s security, compliance, and billing controls. This tutorial covers provisioning the service, deploying a model, and calling it from both Node.js and Python using the official OpenAI SDK with Azure overrides.

### You’ll learn
- Azure prerequisites and resource creation steps for OpenAI deployments
- How to deploy a model and capture endpoint, key, and `api-version` values
- Environment variable conventions that keep infrastructure and CI/CD consistent
- Sample Node.js and Python code that targets Azure deployments with retries and streaming
- Troubleshooting guidance for common errors like 401, 404, and 429 responses

## Prerequisites
- Azure subscription with access to the Azure OpenAI Service (request via the [Azure OpenAI application form](https://aka.ms/oai/access)).
- Contributor or Owner role on the target resource group.
- Azure CLI (`az`) installed locally and logged in (`az login`).

## Step 1. Provision the resource
### Portal workflow
1. Sign in to the [Azure Portal](https://portal.azure.com/).
2. Create Resource → AI + Machine Learning → **Azure OpenAI**.
3. Choose subscription, resource group, region, and pricing tier.
4. Review + create. Deployment takes a few minutes.

### CLI equivalent
```bash
az group create --name openai-rg --location eastus
az cognitiveservices account create \
  --name my-openai-resource \
  --resource-group openai-rg \
  --kind OpenAI \
  --sku s0 \
  --location eastus \
  --yes
```

> **Tip:** Regions control which models are available. Check the [regional availability matrix](https://learn.microsoft.com/azure/ai-services/openai/concepts/models#model-summary-table-and-region-availability) before provisioning.

## Step 2. Deploy a model
1. Open the Azure OpenAI resource → **Deployments** → **Create new deployment**.
2. Select a base model (e.g., `gpt-4o-mini`) and assign a deployment name such as `gpt4o-mini-prod`.
3. Set tokens-per-minute and requests-per-minute quotas appropriate for your workload.
4. Save. Note the deployment name; you reference it as the `model` parameter when calling the API.

You can also script deployments:

```bash
az cognitiveservices account deployment create \
  --name my-openai-resource \
  --resource-group openai-rg \
  --deployment-name gpt4o-mini-prod \
  --model-name gpt-4o-mini \
  --model-version "2024-05-13" \
  --model-format OpenAI \
  --sku-name standard \
  --capacity 1
```

## Step 3. Capture credentials
Retrieve endpoint and keys via the portal (Keys & Endpoint tab) or CLI:

```bash
az cognitiveservices account keys list \
  --name my-openai-resource \
  --resource-group openai-rg
```

Record these values in your secret manager:

```bash
AZURE_OPENAI_ENDPOINT=https://my-openai-resource.openai.azure.com
AZURE_OPENAI_API_KEY=<primary-or-secondary-key>
AZURE_OPENAI_API_VERSION=2024-06-01
AZURE_OPENAI_DEPLOYMENT=gpt4o-mini-prod
```

> **Governance reminder:** Use separate deployments for dev/staging/prod and assign role-based access (RBAC) so only automation accounts can rotate keys.

## Step 4. Call the deployment
Both examples below use the official OpenAI SDK with Azure-specific overrides for `baseURL` and `defaultQuery`.

### Node.js (TypeScript)
```ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'OpenAI-Project': process.env.OPENAI_PROJECT ?? '' }
});

export async function generateSummary(topic: string) {
  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT!,
    messages: [
      { role: 'system', content: 'You respond with two concise bullet points.' },
      { role: 'user', content: `Summarize the latest updates about ${topic}.` }
    ],
    max_tokens: 320,
    temperature: 0.2,
    stream: true
  });

  for await (const chunk of response) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
}
```

### Python
```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    base_url=f"{os.environ['AZURE_OPENAI_ENDPOINT']}/openai/deployments/{os.environ['AZURE_OPENAI_DEPLOYMENT']}",
    default_query={"api-version": os.environ["AZURE_OPENAI_API_VERSION"]}
)

def generate_summary(topic: str) -> str:
    completion = client.chat.completions.create(
        model=os.environ["AZURE_OPENAI_DEPLOYMENT"],
        messages=[
            {"role": "system", "content": "You respond with two concise bullet points."},
            {"role": "user", "content": f"Summarize the latest updates about {topic}."}
        ],
        max_tokens=320,
        temperature=0.2
    )
    return completion.choices[0].message.content or ""
```

## Observability and governance
- **Networking**: Restrict ingress using Private Link or Virtual Network integration. Combine with Azure Firewall to limit egress destinations.
- **Monitoring**: Enable diagnostic settings to stream logs and metrics to Azure Monitor or Log Analytics. Track latency, rate limit counters, and token usage per deployment.
- **Key management**: Rotate primary/secondary keys via automation (`az cognitiveservices account keys regenerate`) and update secrets programmatically.
- **Cost controls**: Use Azure Cost Management budgets or Azure Monitor alerts when token usage exceeds thresholds.

## Troubleshooting
Issue | Likely cause | Fix
--- | --- | ---
`401 Unauthorized` | Wrong key, key disabled, or calling region mismatch | Regenerate the key, verify region, and update environment variables.
`404 Not Found` | Deployment name missing or incorrect in the URL | Confirm deployment exists and matches `AZURE_OPENAI_DEPLOYMENT` exactly.
`429 Too Many Requests` | Exceeded TPS or tokens-per-minute quota | Lower concurrency, add exponential backoff, or request quota increase via Azure support.
`503 Service Unavailable` | Regional capacity or maintenance | Implement retries with jitter and consider deploying in a secondary region.

## Next steps
- Wire this deployment into your backend route (see `/docs/quickstarts/js-server-route.md`).
- Compare features and tooling differences across providers in `/docs/providers/compare-providers.md`.
- Plan a migration from OpenAI’s public API with `/docs/providers/azure-openai/migrate-from-openai.md`.

## References
- Microsoft Learn. “Create an Azure OpenAI resource and deploy a model.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource>
- Microsoft Learn. “Azure OpenAI Service quotas and limits.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/quotas-limits>
- Microsoft Learn. “Secure Azure OpenAI with virtual networks.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/private-network>
- OpenAI. “Azure OpenAI Service integration in the OpenAI SDK.” 2024. <https://platform.openai.com/docs/guides/azure>
