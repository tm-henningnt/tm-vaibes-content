---
title: "Cost controls for AI apps"
description: "Apply token budgets, truncation, caching, and adaptive model selection to manage spend without sacrificing quality."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["patterns"]
min_read_minutes: 11
last_reviewed: 2025-02-17
related:
  [
    "/docs/evaluations/latency-cost-tradeoffs.md",
    "/docs/patterns/workflows/batch-processing.md",
    "/docs/patterns/observability-context.md"
  ]
search_keywords:
  [
    "cost",
    "tokens",
    "streaming",
    "truncation",
    "cache"
  ]
show_toc: true
---

## Cost levers to understand

Generative AI spend scales with token volume, model tier, and retry behavior. Track each lever separately so you can tune without compromising quality.【F:docs/patterns/cost-controls.md†L41-L118】

| Lever | What to monitor | Knobs |
| --- | --- | --- |
| Model tier | Quality vs. price per 1K tokens | Offer multiple tiers (`mini`, `standard`, `pro`) and pick dynamically |
| Prompt size | Input tokens per request | Summaries, truncation, retrieval filters |
| Output size | Completion tokens | Tight instructions, token caps, streaming cancelation |
| Retries | Attempts per request | Backoff policies, idempotency checks |
| Background jobs | Batch throughput | Cost ceilings, chunked scheduling |

## Baseline instrumentation

1. **Log tokens and cost per request** by route, model, and customer. Use provider dashboards (OpenAI Usage, Azure metrics) as a cross-check.
2. **Alert on anomalies:** e.g., >20% token spike day-over-day or cost per active user exceeding budget.
3. **Tag experiments:** Include prompt/model version in logs so you can attribute changes to releases.

## Prompt management

- Keep prompts concise. Move long instructions to shared system prompts referenced by ID.
- Summarize conversation history once it exceeds a threshold (e.g., 2K tokens) and store the summary alongside raw history.
- Use retrieval filters to narrow context (topic, geography, product tier) before embedding.
- Prefer JSON Schema responses instead of verbose prose for downstream systems.

## Adaptive model selection

| Scenario | Default | Upgrade to |
| --- | --- | --- |
| Drafting emails, internal notes | `gpt-4o-mini`, Claude Haiku | `gpt-4.1`, Claude Sonnet when humans flag low quality |
| Legal, policy answers | `gpt-4.1`, Claude Opus | Require human review; optionally escalate to premium tier |
| Bulk classification | `gpt-4o-mini`, Mistral Small | Distill to fine-tuned smaller models |

Implement a policy engine that checks task criticality, latency budget, and user tier before selecting the model. Cache the decision for the session to avoid oscillation.

## Streaming and early exits

- Stream completions to the client and allow users to stop generation once satisfied.
- Apply server-side cutoff when the answer contains required sections (e.g., all rubric items filled) by scanning streamed tokens.
- Use incremental rendering for chat UIs to keep perceived latency low and reduce abandonment.

## Caching patterns

- **Prompt-level cache:** Store responses for deterministic prompts (status summaries, policy blurbs) with hashed inputs. Invalidate on data updates.
- **Embedding cache:** Persist embeddings for repeated queries or canonical intents.
- **Retrieval cache:** Cache top `k` document IDs per query for a short TTL (5–30 minutes) to amortize vector search costs.
- **Batch cache:** Combine similar items into a batch request (OpenAI Batch API) when running nightly jobs.

## Retry and idempotency controls

- Only retry idempotent actions. Use correlation IDs so repeated tool calls don’t duplicate tickets.
- Apply exponential backoff with jitter and cap retries to 2–3 attempts.
- Fail fast on validation errors (schema mismatch) instead of retrying.
- Record retry reasons in logs to spot systemic issues (throttling vs. provider errors).

## Budget-aware workflows

```ts
async function withBudget(limitTokens: number, fn: () => Promise<LLMResult>) {
  const result = await fn();
  if (result.usage.total_tokens > limitTokens) {
    throw new Error("Budget exceeded");
  }
  return result;
}
```

Apply budget wrappers around long-running workflows (reflection loops, multi-step agents). Combine with the router pattern to downgrade models or shorten prompts when budgets run low.

## Batch jobs and forecasts

- Estimate batch cost upfront: `items * (prompt_tokens + completion_tokens) / 1000 * price`.
- Schedule large jobs during off-peak hours to leverage lower priority queues if offered by the provider.
- Break batches into resumable chunks (see `/docs/patterns/workflows/batch-processing.md`).
- Maintain a rolling 30-day forecast using historical usage and upcoming releases.

## Procurement and governance

- Set hard limits via provider dashboards (OpenAI hard usage limits, Azure budgets) and monitor spend per subscription.【F:docs/patterns/cost-controls.md†L120-L162】
- Create alerts that notify finance when usage nears 80% of monthly budget.
- Negotiate reserved capacity or committed spend discounts when volume justifies it.
- Document approval workflows for upgrading model tiers or raising quotas.

## References

- OpenAI. “Manage costs and usage.” 2024. <https://platform.openai.com/docs/guides/production-best-practices/managing-costs>
- Google Cloud. “Control costs for Generative AI on Vertex AI.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/pricing/control-costs>
- Microsoft Learn. “Plan and manage costs for Azure OpenAI Service.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/manage-costs>
