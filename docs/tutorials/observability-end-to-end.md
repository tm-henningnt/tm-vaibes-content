---
title: "Tutorial: Observability end-to-end"
description: "Add logs, traces, and dashboards for AI routes with sampling and PII safeguards."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["tutorials", "operations"]
min_read_minutes: 18
last_reviewed: 2025-03-17
related: ["/docs/patterns/observability-context.md", "/docs/tutorials/cost-guardrails.md", "/docs/evaluations/latency-cost-tradeoffs.md", "/docs/patterns/workflows/batch-processing.md"]
search_keywords: ["observability", "tracing", "dashboards", "sampling", "pii", "telemetry"]
show_toc: true
---

## Summary
AI applications require deep observability to understand quality, cost, and risk. This tutorial guides you through building an end-to-end telemetry stack: structured logs, traces, metrics, and dashboards tailored to model usage. You’ll capture the right metadata without leaking customer data, wire alerts for regressions, and empower product, safety, and finance stakeholders with reliable insights.

### You’ll learn
- How to design trace spans and log schemas for model calls, tool invocations, and retrieval steps.
- How to instrument Node.js and Python services with OpenTelemetry while redacting sensitive text.
- How to push metrics to dashboards that highlight latency, token usage, and safety signals.
- How to set sampling strategies that balance insight with privacy and storage costs.
- How to create runbooks and alerts that close the loop between incidents and improvements.

## Observability goals

Before instrumenting code, define the questions your stakeholders must answer:

- **Engineering:** Why did a specific request fail? Which dependencies caused latency spikes?
- **Product:** What topics drive the most usage? Are customers deflected or escalating to humans?
- **Safety:** Are disallowed prompts or outputs increasing? Which guardrails triggered?
- **Finance:** How do token costs track against budgets per tenant?

Use these questions to choose metrics and sampling strategies. Document them in your runbook so the team aligns on what “good” looks like.

## Step 1: Define telemetry schema

Create shared schema definitions so every service emits consistent fields.

| Signal | Key fields | Notes |
| --- | --- | --- |
| **Logs** | `trace_id`, `route`, `model`, `tool`, `tenant_id`, `input_truncated`, `output_truncated`, `error_code` | Do not store full prompts unless policy allows. |
| **Metrics** | `input_tokens`, `output_tokens`, `latency_ms`, `tool_count`, `safety_violations` | Emit histograms for latency and counters for counts. |
| **Traces** | Span names `ai.call`, `ai.tool`, `ai.retrieve` with attributes `model`, `provider`, `tenant_id`, `token_usage` | Nest spans under the user request span. |

Store schemas in a repo (JSON Schema or Protocol Buffers) so teams can generate client libraries.

## Step 2: Instrument Node.js services

Use OpenTelemetry SDK to create spans around model calls and add structured logs.

```ts
// telemetry/otel.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTLP_TRACE_ENDPOINT }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: process.env.OTLP_METRIC_ENDPOINT }),
    exportIntervalMillis: 15000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

```ts
// routes/chat.ts
import { trace, context } from "@opentelemetry/api";
import { performance } from "node:perf_hooks";
import pino from "pino";
import OpenAI from "openai";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
const tracer = trace.getTracer("ai-service");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chatRoute(req, res) {
  const start = performance.now();
  const span = tracer.startSpan("ai.call", {
    attributes: {
      "ai.route": "chat",
      "ai.model": "gpt-4o-mini",
      "ai.tenant_id": req.headers["x-tenant-id"] ?? "unknown",
    },
  });

  try {
    const response = await context.with(trace.setSpan(context.active(), span), () =>
      client.responses.create({
        model: "gpt-4o-mini",
        input: req.body.messages,
        max_output_tokens: 400,
        temperature: 0.4,
      }),
    );

    const latency = performance.now() - start;
    span.setAttributes({
      "ai.input_tokens": response.usage?.input_tokens ?? 0,
      "ai.output_tokens": response.usage?.output_tokens ?? 0,
      "ai.latency_ms": latency,
    });
    logger.info({
      trace_id: span.spanContext().traceId,
      route: "chat",
      model: "gpt-4o-mini",
      input_truncated: req.body.messages.slice(-2),
      output_truncated: response.output_text.slice(0, 200),
      usage: response.usage,
    });

    res.json({ reply: response.output_text, usage: response.usage });
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    logger.error({
      trace_id: span.spanContext().traceId,
      route: "chat",
      error_code: error.code ?? "unknown",
    });
    res.status(502).json({ error: "model_failed" });
  } finally {
    span.end();
  }
}
```

Use a log processor (Datadog, ELK, Honeycomb) to parse the JSON logs and enforce retention policies (e.g., 30 days). Mask PII by hashing email addresses and dropping entire payloads for high-risk tenants.

## Step 3: Instrument Python services

```python
# telemetry/otel.py
import os
from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, OTLPSpanExporter

resource = Resource.create({"service.name": "rag-api"})
tracer_provider = TracerProvider(resource=resource)
span_processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=os.environ["OTLP_TRACE_ENDPOINT"]))
tracer_provider.add_span_processor(span_processor)
trace.set_tracer_provider(tracer_provider)

meter_provider = MeterProvider(
    resource=resource,
    metric_readers=[
        PeriodicExportingMetricReader(OTLPMetricExporter(endpoint=os.environ["OTLP_METRIC_ENDPOINT"]), export_interval_millis=15000)
    ],
)
metrics.set_meter_provider(meter_provider)
```

```python
# routes/rag.py
import time

import os
import structlog
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI
from opentelemetry import trace
from opentelemetry.trace.status import Status, StatusCode

logger = structlog.get_logger()
tracer = trace.get_tracer("rag-api")
client = OpenAI()

router = APIRouter()


@router.post("/rag")
async def rag_route(request: Request):
    start = time.perf_counter()
    span = tracer.start_span(
        "ai.retrieve",
        attributes={
            "ai.route": "rag",
            "ai.tenant_id": request.headers.get("x-tenant-id", "unknown"),
        },
    )
    try:
        body = await request.json()
        question = body["question"]
        span.set_attribute("ai.query_length", len(question))

        # retrieval + generation
        response = client.responses.create(
            model="gpt-4o-mini",
            input=[{"role": "user", "content": question}],
            max_output_tokens=400,
        )

        latency_ms = (time.perf_counter() - start) * 1000
        span.set_attribute("ai.latency_ms", latency_ms)
        span.set_attribute("ai.output_tokens", response.usage.output_tokens)

        logger.info(
            "rag.success",
            trace_id=span.get_span_context().trace_id,
            latency_ms=latency_ms,
            input_truncated=question[:150],
            output_truncated=response.output_text[:200],
        )
        return {"answer": response.output_text, "usage": response.usage}
    except Exception as exc:  # noqa: BLE001
        span.record_exception(exc)
        span.set_status(Status(status_code=StatusCode.ERROR, description=str(exc)))
        logger.error("rag.failure", trace_id=span.get_span_context().trace_id, error=str(exc))
        raise HTTPException(status_code=502, detail="rag_failed") from exc
    finally:
        span.end()
```

Mask sensitive text by truncating to 150–200 characters and redacting email or account numbers with regex filters (`structlog.processors` or Pydantic validators).

## Step 4: Sampling strategy

- **Default sampling:** Capture 100% of errors and a small percentage (1–5%) of successful requests per tenant.
- **Dynamic sampling:** Increase sampling when latency or cost spikes beyond baseline. Use feature flags to tune without redeploying.
- **PII policies:** Maintain a blocklist of tenants or routes where logging is disabled. Store hashed user IDs for correlation without raw identifiers.
- **Retention:** Align with legal requirements (often 30–90 days). Purge logs that contain raw prompts quickly.

Implement sampling in middleware or your logging pipeline. For OpenTelemetry, configure a `ParentBasedTraceIdRatioBasedSampler` with separate ratios for success vs. errors.

## Step 5: Dashboards and alerts

Create dashboards that combine metrics, logs, and traces:

- **Latency & throughput:** P50/P95 latency, requests per minute, error rate by route.
- **Token usage:** Input vs. output tokens per model, total spend vs. budget from `/docs/tutorials/cost-guardrails.md`.
- **Quality signals:** Safety filter triggers, eval scores from `/docs/evaluations/latency-cost-tradeoffs.md`.
- **Top documents/tools:** Most retrieved sources, tool success rates from `/docs/tutorials/agentic-helpdesk.md`.

Alerts to configure:

- Latency P95 > target for 3 consecutive periods.
- Error rate > 5% or sudden spike in `budget_exceeded` responses.
- Safety violations or policy triggers above baseline.
- Missing telemetry (e.g., no traces from a region for 5 minutes).

Document runbooks that explain diagnosis steps: check provider status page, inspect recent deploys, review eval dashboards, and escalate to the on-call rotation.

## Step 6: Share insights across teams

- **Weekly reviews:** Send a snapshot of latency, cost, and safety metrics to engineering, product, and compliance stakeholders.
- **Quarterly audits:** Export traces/logs that show data handling compliance and share with security.
- **Feedback loop:** Feed incident learnings back into `/docs/patterns/observability-context.md` to refine schema and policies.

## References

- CNCF. “OpenTelemetry specification.” 2024. <https://opentelemetry.io/docs/specs/>
- Datadog. “Monitoring LLM applications.” 2024. <https://docs.datadoghq.com/llm_observability/>
- OpenAI. “Production best practices: logging and monitoring.” 2024. <https://platform.openai.com/docs/guides/production-best-practices/monitor-usage-and-costs>
- Microsoft. “Responsible logging for AI applications.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/how-to/responsible-use-guidelines>
