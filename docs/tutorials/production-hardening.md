---
title: "Tutorial: Production hardening"
description: "Implement retries, rate limits, backpressure, and circuit breakers for resilient AI services."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["tutorials", "operations"]
min_read_minutes: 18
last_reviewed: 2025-03-17
related: ["/docs/patterns/workflows/batch-processing.md", "/docs/tutorials/observability-end-to-end.md", "/docs/tutorials/cost-guardrails.md", "/docs/patterns/tools/function-calling.md"]
search_keywords: ["retries", "rate limits", "backpressure", "circuit breaker", "resilience", "slo"]
show_toc: true
---

## Summary
LLM and tool providers can throttle, error, or change behavior without notice. Production hardening wraps your AI workflow with retries, timeouts, backpressure, and health checks so end users see reliable experiences. This tutorial walks through building a resilience layer in Node.js and Python, designing circuit breakers, and validating everything with chaos tests.

### You’ll learn
- How to classify errors and choose retry vs. fail-fast strategies for model calls.
- How to build concurrency-aware rate limiting and backpressure to protect upstream providers.
- How to implement circuit breakers and health checks that avoid cascading failures.
- How to run chaos experiments that validate resilience before shipping.
- How to document SLOs and rollback plans for your AI surface.

## Reliability checklist

1. **Timeouts everywhere:** Client and server timeouts capped at the slowest acceptable user wait time.
2. **Retries with jitter:** Only for transient errors (429, 5xx). Cap attempts and budget tokens.
3. **Backpressure:** Queue depth monitors with shed-load logic to keep latency predictable.
4. **Circuit breakers:** Track failure ratios and short-circuit when dependencies are degraded.
5. **Health checks:** Synthetic probes that confirm prompts and tools still work.

Keep these principles visible in runbooks and onboarding docs.

## Step 1: Categorize provider errors

Create a matrix for your primary provider.

| Error type | Status codes | Strategy |
| --- | --- | --- |
| Throttling | 429, 503 | Retry with exponential backoff and jitter. Respect `Retry-After`. |
| Provider fault | 500–599 | Retry once, then fail fast. Capture payload for incident review. |
| Client error | 400, 404 | Do not retry; log and return actionable error to caller. |
| Policy violation | 403, moderation flags | Stop request, escalate to safety review. |

Use the matrix to implement error handlers in your client libraries.

## Step 2: Implement resilient clients

### Node.js client wrapper

```ts
// lib/openai-client.ts
import OpenAI from "openai";
import pRetry, { AbortError } from "p-retry";
import PQueue from "p-queue";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const queue = new PQueue({ concurrency: 5, interval: 1000, intervalCap: 60 });

async function callModel(payload: OpenAI.ResponsesCreateParams) {
  return queue.add(() =>
    pRetry(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          return await client.responses.create(payload, { signal: controller.signal });
        } catch (error) {
          if (error.status && [429, 500, 502, 503, 504].includes(error.status)) {
            throw error;
          }
          throw new AbortError(error as Error);
        } finally {
          clearTimeout(timeout);
        }
      },
      { retries: 2, randomize: true, minTimeout: 500, maxTimeout: 2500 },
    ),
  );
}

export { callModel };
```

### Python client wrapper

```python
# lib/openai_client.py
import asyncio
import os

import backoff
import openai
from openai import OpenAI

client = OpenAI()
SEM = asyncio.Semaphore(int(os.environ.get("OPENAI_MAX_CONCURRENCY", "5")))


@backoff.on_exception(
    backoff.expo,
    (asyncio.TimeoutError, openai.RateLimitError, openai.APIError),
    max_time=10,
    max_tries=3,
    jitter=None,
)
async def call_model(payload: dict) -> dict:
    async with SEM:
        try:
            return await asyncio.wait_for(asyncio.to_thread(client.responses.create, **payload), timeout=8)
        except openai.BadRequestError as exc:
            raise backoff.PermanentError(exc) from exc
```

Tune concurrency to stay within provider limits. For OpenAI Responses API, most enterprise accounts recommend <5 requests/sec without batching.<sup>1</sup>

## Step 3: Rate limiting and backpressure

Implement leaky-bucket rate limiting at the edge to protect the upstream provider.

```ts
// middleware/rate-limit.ts
import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({ points: 20, duration: 1, blockDuration: 2 });

export async function rateLimit(req, res, next) {
  try {
    await limiter.consume(req.ip ?? "anonymous");
    return next();
  } catch (error) {
    return res.status(429).json({ error: "too_many_requests" });
  }
}
```

Add queue depth monitoring to shed load.

```ts
// queue/backpressure.ts
import PQueue from "p-queue";

export const inferenceQueue = new PQueue({ concurrency: 4, timeout: 9000, throwOnTimeout: true });

export function assertBackpressure() {
  if (inferenceQueue.pending > 50) {
    throw Object.assign(new Error("queue_overflow"), { status: 503 });
  }
}
```

Call `assertBackpressure()` before enqueuing tasks and expose metrics for `pending` and `size`. In Python, use `asyncio.Queue` with `maxsize` and drop requests when full.

## Step 4: Circuit breakers

Use half-open circuit breakers to fail fast when provider health degrades.

```ts
// resilience/circuit-breaker.ts
import CircuitBreaker from "opossum";
import { callModel } from "../lib/openai-client.js";

const breaker = new CircuitBreaker(callModel, {
  timeout: 9000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
  rollingCountTimeout: 60000,
});

breaker.fallback(() => ({ error: "provider_unavailable" }));

export { breaker };
```

```python
# resilience/circuit_breaker.py
from datetime import datetime, timedelta
from typing import Any, Callable

class CircuitBreaker:
    def __init__(self, failure_threshold: int, recovery_timeout: int):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "closed"
        self.opened_at: datetime | None = None

    def allow(self) -> bool:
        if self.state == "open":
            if self.opened_at and datetime.utcnow() - self.opened_at > timedelta(seconds=self.recovery_timeout):
                self.state = "half-open"
                return True
            return False
        return True

    def record_success(self) -> None:
        self.failure_count = 0
        self.state = "closed"

    def record_failure(self) -> None:
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "open"
            self.opened_at = datetime.utcnow()
```

Wrap client calls with the breaker and emit metrics:

```python
breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=30)

async def safe_call(payload: dict) -> dict:
    if not breaker.allow():
        raise RuntimeError("circuit_open")
    try:
        response = await call_model(payload)
        breaker.record_success()
        return response
    except Exception as exc:  # noqa: BLE001
        breaker.record_failure()
        raise
```

Log when the circuit opens or closes. Alert on repeated open events.

## Step 5: Health checks and chaos tests

- **Synthetic probes:** Call the model hourly with a curated prompt and verify response shape, safety filters, and latency. Store results in `/docs/evaluations/latency-cost-tradeoffs.md` dashboards.
- **Chaos experiments:** Inject 429/5xx using feature flags or service mesh fault injection. Confirm retries, circuit breakers, and user fallbacks behave as expected.
- **Game days:** Simulate provider outages quarterly. Practice manual failover (e.g., switching to Anthropic via feature flag).

Record findings in runbooks with remediation steps.

## Step 6: SLOs and incident playbooks

Define objectives for each route:

- Availability ≥ 99.5% monthly.
- P95 latency ≤ 4 seconds.
- Error rate (non-policy) ≤ 2%.

Monitor SLOs with the telemetry stack from `/docs/tutorials/observability-end-to-end.md`. When SLOs breach, follow an incident playbook:

1. Confirm via dashboards and provider status pages.
2. Engage on-call engineer and comms channel.
3. Activate fallback prompts or provider failover.
4. Document timeline and corrective actions in a postmortem.

## References

- OpenAI. “Production best practices.” 2024. <https://platform.openai.com/docs/guides/production-best-practices>
- Google SRE. “Service Level Objectives.” 2023. <https://sre.google/sre-book/service-level-objectives/>
- AWS Builders Library. “Timeouts, retries, and backoff.” 2023. <https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/>
- Microsoft. “Design resilient applications.” 2024. <https://learn.microsoft.com/azure/architecture/guide/design-principles/resiliency>
