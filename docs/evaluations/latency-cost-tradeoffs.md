---
title: Latency–cost tradeoffs
description: Instrument GenAI systems to balance perceived speed with spend using model selection, streaming, caching, and batching.
audience_levels: [intermediate, advanced]
personas: [developer, PM, admin]
categories: [evaluations, patterns]
min_read_minutes: 11
last_reviewed: 2025-03-16
related:
  [
    "/docs/concepts/token-costs-latency.md",
    "/docs/patterns/cost-controls.md",
    "/docs/quickstarts/js-server-route.md",
    "/docs/evaluations/overview.md"
  ]
search_keywords:
  [
    "latency budgeting",
    "token cost",
    "streaming evaluation",
    "model benchmarking",
    "caching"
  ]
show_toc: true
---

## Optimize for speed without breaking the bank

Every GenAI feature trades off quality, latency, and cost. Teams that measure these levers can choose the smallest model, right streaming strategy, and smartest caching policy to hit SLAs. This playbook helps you instrument, evaluate, and iterate on latency–cost tradeoffs.

### You’ll learn
- How to collect latency and token metrics that reflect real user experience
- How to compare model families and settings against cost and quality targets
- Techniques for reducing spend through streaming, caching, truncation, and batching
- How to run experiments and interpret latency percentiles
- References to provider guidance on pricing and performance tuning

## Gather the right telemetry

Instrument both server and client layers.

- **Server metrics:** Record enqueue-to-response latency, token counts, retries, cache hits, and tool invocations. Emit histograms for P50/P95/P99.
- **Client metrics:** Measure time to first token and time to last token for streamed responses to capture perceived performance.
- **Cost tracking:** Multiply token usage by provider prices from `/docs/concepts/token-costs-latency.md`. Store in your warehouse for forecasting.

Example Node.js middleware:

```ts
import { histogram } from "@opentelemetry/api";

const latencyMs = histogram("genai.latency", { unit: "ms" });
const tokens = histogram("genai.tokens", { unit: "token" });

export async function withMetrics(handler) {
  return async function measured(req, res) {
    const start = performance.now();
    const response = await handler(req, res);
    const elapsed = performance.now() - start;
    latencyMs.record(elapsed, { route: req.path, model: response.model });
    if (response.usage) {
      tokens.record(response.usage.total_tokens, { route: req.path, model: response.model });
    }
    return response;
  };
}
```

## Evaluate model and parameter choices

Create a benchmark grid that compares candidate models, temperatures, and max token settings across quality and latency.

| Model | Avg latency (ms) | Cost / 1K tokens (USD) | Accuracy (rubric) | Notes |
| --- | --- | --- | --- | --- |
| GPT-4o mini | 1100 | 0.00075 | 4.2 | Strong baseline for drafting |
| GPT-4o | 2500 | 0.015 | 4.6 | Use selectively; consider caching |
| Claude 3 Haiku | 900 | 0.0008 | 4.0 | Fast for summaries |
| Claude 3 Sonnet | 1800 | 0.003 | 4.4 | Balanced speed/quality |

Sample data like the above in a shared dashboard so stakeholders see the tradeoffs. Update quarterly or after provider price changes.【F:docs/concepts/token-costs-latency.md†L14-L47】

## Pull the main levers

1. **Streaming:** Stream tokens to reduce time-to-first-byte. Evaluate with user studies to ensure streaming still feels responsive; combine with server-side caching to prevent thrashing.
2. **Prompt trimming:** Summarize or window conversation history. Use heuristics to drop low-signal turns or replace with short summaries.
3. **Caching:** Store deterministic outputs (e.g., policy explanations) keyed by prompt hash. Track hit rate and stale ratio; invalidate when inputs or policies change.
4. **Batching:** Use provider batch endpoints for asynchronous workloads. Measure queue time vs. per-request latency.
5. **Hybrid models:** Route low-risk tasks to cheaper models using classifiers or heuristics from `/docs/patterns/cost-controls.md`.

## Run experiments safely

Adopt a scientific workflow:

- **Baseline first.** Capture current latency, cost, and quality metrics before tuning.
- **Change one lever at a time.** For example, compare streaming on/off while holding model and prompt constant.
- **Use guardrail metrics.** Ensure accuracy and safety scores from `/docs/evaluations/overview.md` do not regress when optimizing cost.
- **Deploy canaries.** Route a small percentage of traffic through new settings before full rollout. Monitor cost per session and P95 latency continuously.

## Report and act

- Publish weekly charts showing latency percentiles, token spend, and cache effectiveness.
- Alert when P95 latency exceeds SLA or cost per session increases above budget.
- Automate rollbacks via feature flags if metrics regress.

## References

- OpenAI. “Pricing.” 2025. <https://openai.com/api/pricing>
- Anthropic. “Claude model pricing and performance guidance.” 2024. <https://docs.anthropic.com/en/docs/about-claude/models>
- Microsoft Learn. “Optimize cost and performance in Azure OpenAI.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/optimization>
- Google Cloud. “Streaming responses and latency tips.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/learn/streaming>
