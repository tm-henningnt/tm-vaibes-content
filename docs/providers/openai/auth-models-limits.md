---
title: "OpenAI: Auth, Models, and Limits"
description: "Configure authentication safely, choose models intentionally, and stay within rate and token limits when using the OpenAI API."
audience_levels: [beginner, intermediate]
personas: [developer, admin]
categories: [providers, quickstarts]
min_read_minutes: 14
last_reviewed: 2025-02-15
related:
  - "/docs/providers/security-best-practices.md"
  - "/docs/quickstarts/js-server-route.md"
  - "/docs/quickstarts/python-fastapi.md"
search_keywords:
  - "openai auth"
  - "model selection"
  - "rate limits"
  - "api quotas"
show_toc: true
---

## Ship faster with the OpenAI API
The OpenAI platform exposes a unified `responses` API, streaming support, and a spectrum of models from lightweight GPT-4o mini to reasoning-heavy o3. Getting authentication, model selection, and limits right up front prevents downtime and surprise invoices.

### You’ll learn
- How to issue and rotate API keys or project keys securely.
- How to call the API from Node.js and Python using the official SDKs.
- How to compare models (GPT-4o, GPT-4o mini, GPT-4.1, o3) across cost, latency, and capabilities.
- How to monitor and stay within rate limits, including proactive retry logic.
- How to harden production usage with logging, evaluation, and key governance.

## Authentication and key hygiene
1. **Create a project** in the OpenAI dashboard and generate a project API key. Projects scope keys to resources and simplify revocation without rotating organization-wide secrets.【F:docs/providers/openai/auth-models-limits.md†L27-L29】
2. **Store keys in a secret manager** (Azure Key Vault, AWS Secrets Manager, Vault). Never commit keys to git; inject them via environment variables at runtime.
3. **Use per-environment keys** (dev/staging/prod) to isolate quota usage and reduce blast radius.
4. **Rotate on a schedule** (every 90 days or sooner) and immediately upon suspected compromise.
5. **Set least-privilege roles** for team members via the dashboard so only admins can create or revoke keys.【F:docs/providers/openai/auth-models-limits.md†L30-L33】

The official SDKs look for `OPENAI_API_KEY`. For serverless or browser contexts, proxy requests through a trusted backend to avoid exposing keys client side.

## Node.js request template

```ts
import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function draftResponse(prompt: string) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: [
      { role: "system", content: "You are a concise assistant." },
      { role: "user", content: prompt }
    ],
    max_output_tokens: 512,
    temperature: 0.6,
    response_format: { type: "text" }
  });

  return {
    text: response.output_text,
    tokens: response.usage?.total_tokens ?? 0
  };
}
```

Key points:
- Use environment variables for `OPENAI_MODEL` and temperature budgets.
- Cap `max_output_tokens` to control spend.
- Inspect `response.usage` for logging and alerting.

## Python request template

```python
from openai import OpenAI

client = OpenAI()

def classify_ticket(subject: str, body: str) -> dict:
    result = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {"role": "system", "content": "Classify helpdesk tickets with a JSON response."},
            {"role": "user", "content": f"Subject: {subject}\nBody: {body}"}
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "ticket_classification",
                "schema": {
                    "type": "object",
                    "properties": {
                        "category": {"type": "string"},
                        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                        "needs_human": {"type": "boolean"}
                    },
                    "required": ["category", "priority", "needs_human"]
                }
            }
        }
    )
    return result.output[0].content[0].text
```

Key points:
- The Python SDK automatically loads `OPENAI_API_KEY` from environment variables.
- JSON schema mode gives deterministic outputs for downstream systems.
- Log `result.usage.total_tokens` for dashboards and billing reports.【F:docs/providers/openai/auth-models-limits.md†L61-L74】

## Model selection cheat sheet

| Model | Context window | Best for | Typical latency | Cost signal (input/output per 1K tokens)* |
| --- | --- | --- | --- | --- |
| `gpt-4o-mini` | 128k | Fast chat, drafting, moderate reasoning | ~1–2s | ~$0.15 / $0.60 |
| `gpt-4o` | 128k | Multimodal reasoning, audio, vision | 3–6s | ~$5.00 / $15.00 |
| `gpt-4.1` | 128k | High accuracy text + tool use | 5–8s | ~$6.00 / $18.00 |
| `o3-mini` | 200k | Structured reasoning, planning | 6–12s | ~$15.00 / $45.00 |

\*Pricing varies by tier; confirm in the [pricing table](https://openai.com/api/pricing). Use smaller models for draft passes and reserve o3 for critical reasoning workloads.【F:docs/providers/openai/auth-models-limits.md†L78-L84】

## Rate limits and retries
- **Check your tier** in the dashboard to see requests per minute (RPM) and tokens per minute (TPM) per model.【F:docs/providers/openai/auth-models-limits.md†L86-L88】
- **Implement exponential backoff** (e.g., 200ms, 400ms, 800ms) when receiving `429` or `529` responses. Cap retries to keep latency predictable.
- **Batch lower-priority work** using job queues so interactive workloads are not throttled.
- **Track usage per key**—OpenAI returns `x-ratelimit-remaining` headers for the current window. Surface them in logs to spot saturation before errors appear.
- **Stream results** for long responses to reduce perceived latency and stay responsive to cancellation signals.

## Hardening production usage
- **Observability**: Log prompt, response IDs, token usage, model version, and latency. Mask or hash sensitive content before storage.
- **Evaluations**: Run nightly regression suites with holdout prompts, checking accuracy, toxicity, and latency budgets. Block deploys when metrics regress.
- **Safety**: Pair the [Moderation API](https://platform.openai.com/docs/guides/moderation/overview) or a third-party classifier with human review queues for flagged content.
- **Key governance**: Monitor key usage with anomaly detection—unexpected spikes may indicate leakage. Revoke unused keys monthly.
- **Fallbacks**: Define backups (cached answers, offline responses, different model) for outages or quota exhaustion.

## Troubleshooting common errors
- `401 Unauthorized`: Check bearer token header and ensure the key has not been revoked. Rotating to a fresh project key resolves most issues.
- `404 Not Found`: The model name is incorrect or not enabled for your account. Verify availability in the dashboard.
- `429 Rate limit exceeded`: Respect `Retry-After` headers. For heavy workloads, request higher quotas via support.
- `400 Bad request`: Usually schema issues in tool definitions or JSON mode. Validate with `jsonschema` or TypeScript types before sending.
- `503 Service unavailable`: Temporary outage—retry with jitter or switch to a fallback model.

## References
- OpenAI. “API Reference.” <https://platform.openai.com/docs/api-reference/introduction>. Accessed 2025-02-15.【F:docs/providers/openai/auth-models-limits.md†L114-L115】
- OpenAI. “Authentication.” <https://platform.openai.com/docs/api-reference/authentication>. Accessed 2025-02-15.【F:docs/providers/openai/auth-models-limits.md†L115-L116】
- OpenAI. “Rate Limits.” <https://platform.openai.com/docs/guides/rate-limits>. Accessed 2025-02-15.【F:docs/providers/openai/auth-models-limits.md†L116-L117】
- OpenAI. “Models.” <https://platform.openai.com/docs/models/overview>. Accessed 2025-02-15.【F:docs/providers/openai/auth-models-limits.md†L117-L118】
- OpenAI. “Pricing.” <https://openai.com/api/pricing>. Accessed 2025-02-15.【F:docs/providers/openai/auth-models-limits.md†L118-L119】

## Cross-links
- `/docs/providers/compare-providers.md`
- `/docs/quickstarts/js-server-route.md`
- `/docs/quickstarts/python-fastapi.md`
- `/docs/concepts/token-costs-latency.md`
