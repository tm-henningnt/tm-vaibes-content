---
title: "Azure OpenAI: Setup and First Call"
description: "Provision Azure OpenAI safely, deploy a model, and make your first call from Node.js and Python."
audience_levels: [beginner, intermediate]
personas: [admin, developer]
categories: [providers, quickstarts]
min_read_minutes: 15
last_reviewed: 2025-02-15
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

## Bring GPT-4o to your Azure tenant
Azure OpenAI gives you the same GPT-4o family available on OpenAI, but wrapped with Azure AD, regional residency, and private networking. The tradeoff is an extra deployment step before you can send requests. Follow the checklist below to go from subscription to working code in under an hour.

### You’ll learn
- Prerequisites for Azure OpenAI, including responsible AI approvals and regional availability.
- How to create an Azure OpenAI resource and deploy a model with the Portal or CLI.
- How to call the Azure endpoint from Node.js and Python, including setting `api-version` correctly.
- How to monitor quotas, scale with multiple deployments, and manage keys.
- How to secure traffic with virtual networks, private endpoints, and role-based access control (RBAC).

## Prerequisites
1. **Approved access**: Azure OpenAI requires application and approval; ensure your subscription is on the allow list.【F:docs/providers/azure-openai/setup.md†L29-L31】
2. **Azure subscription** with owner or contributor rights.
3. **Resource provider registration**: `az provider register --namespace Microsoft.CognitiveServices`.
4. **Responsible AI documentation**: Microsoft may request use-case descriptions and mitigation plans.
5. **Regional planning**: Check the [model availability matrix](https://learn.microsoft.com/azure/ai-services/openai/concepts/models) to align deployments with required regions.【F:docs/providers/azure-openai/setup.md†L31-L34】

## Step 1: Create the resource
Use the Azure Portal or CLI.

### Portal
1. Go to **Create a resource → Azure OpenAI**.
2. Pick subscription, resource group, region, and pricing tier (standard vs. global standard).
3. Enable **Managed identity** if you plan to call other Azure services from your deployment.
4. Disable public network access if you intend to use private endpoints.

### Azure CLI

```bash
az cognitiveservices account create \
  --name "$AZURE_OPENAI_RESOURCE" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --kind OpenAI \
  --sku S0 \
  --location eastus \
  --custom-domain "$AZURE_OPENAI_RESOURCE" \
  --yes
```

> The `--custom-domain` value becomes part of your endpoint URL (`https://<custom-domain>.openai.azure.com`).【F:docs/providers/azure-openai/setup.md†L44-L52】

## Step 2: Deploy a model
Every call targets a **deployment** (your alias), not the raw model name.

### Portal
1. Navigate to your Azure OpenAI resource.
2. Select **Deployments → Create**.
3. Choose a model (e.g., `gpt-4o-mini`), set capacity, and assign a deployment name (`prod-gpt4o-mini`).
4. Save. Provisioning takes a few seconds.

### Azure CLI (preview)

```bash
az cognitiveservices account deployment create \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$AZURE_OPENAI_RESOURCE" \
  --deployment-name prod-gpt4o-mini \
  --model-name gpt-4o-mini \
  --model-format OpenAI \
  --sku-name Standard \
  --capacity 50
```

> Increase `capacity` for higher tokens-per-minute budgets; Microsoft may cap values per subscription.【F:docs/providers/azure-openai/setup.md†L59-L70】

## Step 3: Generate keys or tokens
- In the Portal, under **Keys and Endpoint**, copy one of the two keys. Rotate keys regularly.
- For AAD integration, assign roles (`Cognitive Services OpenAI User`) to service principals and obtain an access token via `az account get-access-token --resource https://cognitiveservices.azure.com/`.

## Step 4: First call from Node.js

```ts
import fetch from "node-fetch";

const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION ?? "2024-07-01-preview"}`;

export async function summarize(text: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.AZURE_OPENAI_KEY ?? ""
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You summarize expense notes." },
        { role: "user", content: text }
      ],
      temperature: 0.3,
      max_tokens: 400
    })
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI error ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  return body.choices?.[0]?.message?.content ?? "";
}
```

Key points:
- Always pass the `api-version` query parameter—Azure often lags behind the public OpenAI version.
- Deployment name replaces the `model` field.
- Azure returns the same JSON shape as OpenAI’s `chat/completions`, so your adapters can stay consistent.

## Step 5: First call from Python

```python
import os
import requests

endpoint = f"{os.environ['AZURE_OPENAI_ENDPOINT']}/openai/deployments/{os.environ['AZURE_OPENAI_DEPLOYMENT']}/chat/completions"
params = {"api-version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-07-01-preview")}
headers = {
    "api-key": os.environ["AZURE_OPENAI_KEY"],
    "Content-Type": "application/json"
}
payload = {
    "messages": [
        {"role": "system", "content": "You extract action items."},
        {"role": "user", "content": "Follow up with Contoso legal about the redlines."}
    ],
    "temperature": 0.4,
    "max_tokens": 300
}

response = requests.post(endpoint, params=params, headers=headers, json=payload, timeout=30)
response.raise_for_status()
print(response.json()["choices"][0]["message"]["content"])
```

Key points:
- Use `timeout` to avoid hanging on network issues.
- Prefer `requests` + manual error handling in simple scripts; for production, wrap in retry decorators and structured logging.
- Azure also ships an [official Python SDK](https://learn.microsoft.com/azure/ai-services/openai/quickstart?tabs=python) if you want typed clients.【F:docs/providers/azure-openai/setup.md†L99-L110】

## Observability and limits
- **Quotas**: Token-per-minute (TPM) and requests-per-minute (RPM) are configured per deployment. Scale out by creating multiple deployments behind a load balancer or requesting quota increases via the Azure portal.【F:docs/providers/azure-openai/setup.md†L112-L114】
- **Metrics**: Enable diagnostic settings to stream logs to Azure Monitor, Log Analytics, or Event Hubs.
- **Cost control**: Tag resources and use Cost Management budgets. Azure bills per 1K tokens plus networking egress.
- **Data residency**: Data remains in the region where the resource is deployed, aligned with Microsoft’s compliance commitments.【F:docs/providers/azure-openai/setup.md†L114-L116】

## Securing the endpoint
- **Network**: Enable private endpoints or service endpoints to restrict inbound traffic to your virtual network.
- **RBAC**: Assign `Cognitive Services Contributor` for admins, `Cognitive Services OpenAI User` for callers. Avoid sharing account keys broadly.
- **Managed identity**: Use system-assigned managed identity for Azure Functions or App Service instead of storing keys.
- **Customer-managed keys (CMK)**: Bring your own key through Azure Key Vault for encryption at rest.

## Troubleshooting
- `403 Access denied`: The deployment or region is not enabled for your subscription. Confirm approval status and region availability.
- `429 Too many requests`: You hit the deployment quota. Add retries with jitter and consider multiple deployments.
- `400 DeploymentNotFound`: The deployment name in the URL doesn’t exist or is disabled.
- `503 ServiceUnavailable`: Region-wide throttling; fail over to another region if available.
- Portal error “Deployment capacity exceeded”: Lower the requested capacity or open a support ticket for quota increase.

## References
- Microsoft Learn. “What is Azure OpenAI Service?” <https://learn.microsoft.com/azure/ai-services/openai/overview>. Accessed 2025-02-15.【F:docs/providers/azure-openai/setup.md†L136-L137】
- Microsoft Learn. “Azure OpenAI Service quotas and limits.” <https://learn.microsoft.com/azure/ai-services/openai/quotas-limits>. Accessed 2025-02-15.【F:docs/providers/azure-openai/setup.md†L137-L138】
- Microsoft Learn. “Quickstart: Use Azure OpenAI Service with Python.” <https://learn.microsoft.com/azure/ai-services/openai/quickstart?tabs=python>. Accessed 2025-02-15.【F:docs/providers/azure-openai/setup.md†L138-L139】
- Microsoft Learn. “Models and availability for Azure OpenAI Service.” <https://learn.microsoft.com/azure/ai-services/openai/concepts/models>. Accessed 2025-02-15.【F:docs/providers/azure-openai/setup.md†L139-L140】
- Microsoft Learn. “Networking for Azure OpenAI Service.” <https://learn.microsoft.com/azure/ai-services/openai/how-to/networking>. Accessed 2025-02-15.【F:docs/providers/azure-openai/setup.md†L140-L141】

## Cross-links
- `/docs/providers/compare-providers.md`
- `/docs/providers/azure-openai/migrate-from-openai.md`
- `/docs/providers/security-best-practices.md`
- `/docs/quickstarts/js-server-route.md`
