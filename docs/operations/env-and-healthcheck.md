---
title: "Operations: Environment variables and health checks"
description: "Map every environment variable, share safe defaults, and expose a dependable health check for AI services."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "admin"]
categories: ["operations"]
min_read_minutes: 12
last_reviewed: 2025-03-20
related: ["/docs/providers/security-best-practices.md", "/docs/patterns/observability-context.md", "/docs/tutorials/production-hardening.md"]
search_keywords: ["environment variables", ".env", "health check", "readiness", "liveness"]
show_toc: true
---

## Summary
A shared `.env` map and predictable health checks keep AI services reliable as they move from laptops to production. This guide shows how to document required variables, validate them on boot, and expose both liveness and readiness endpoints that surface model, dependency, and quota issues early.

### You’ll learn
- How to structure a `.env.example` file and document secrets without leaking values.
- How to validate configuration at startup with Node.js and Python helpers.
- How to design liveness vs. readiness health checks for AI backends.
- How to surface token usage, provider quotas, and dependency status in health responses.
- How to automate verification with CI and observability hooks.

## Build a trustworthy `.env.example`
Create a top-level `.env.example` that mirrors every required variable. Group entries by concern, describe expected formats, and note who owns each secret.

```ini
# Provider auth (owned by platform engineering)
OPENAI_API_KEY="sk-..."            # Server-side key; rotate monthly
ANTHROPIC_API_KEY="anthropic-..."  # Optional: only set when agent tools need Claude
AZURE_OPENAI_ENDPOINT="https://<resource>.openai.azure.com"
AZURE_OPENAI_API_KEY="<key>"
AZURE_OPENAI_DEPLOYMENT="gpt-4o"

# Application runtime
NODE_ENV="development"             # development | staging | production
APP_BASE_URL="http://localhost:3000"
LOG_LEVEL="info"                   # debug | info | warn | error
SESSION_TTL_MINUTES="60"

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT="https://otel-gateway.internal"
HEALTHCHECK_TOKEN="rotate-me"      # Shared secret for authenticated health probes
```

Document optional variables in a table so teammates know when to set them.

| Variable | Required? | Purpose | Default | Owner |
| --- | --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side API access | _none_ | Platform engineering |
| `AZURE_OPENAI_ENDPOINT` | No | Azure OpenAI deployments | _none_ | Cloud operations |
| `APP_BASE_URL` | Yes | Used in links and callbacks | `http://localhost:3000` | Feature team |
| `HEALTHCHECK_TOKEN` | Yes (prod) | Authenticates health endpoint | _none_ | SRE |

> **Tip:** Keep `.env.example` in sync by adding a manifest check in CI. The repository already includes `npm run check:frontmatter`; add a similar script that fails if required vars go missing.

## Validate configuration at startup
Fail fast when required values are absent or malformed. Use schema validation to catch issues before requests reach providers.

### Node.js example

```ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  APP_BASE_URL: z.string().url(),
  HEALTHCHECK_TOKEN: z.string().min(16),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export function loadEnv() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:", parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}
```

Call `loadEnv()` before instantiating provider clients. When deploying to Vercel or other managed hosts, store secrets with environment separation and enable required/optional flags where supported.(See /docs/providers/security-best-practices.md for rotation guidance.)

### Python example

```python
from pydantic import BaseSettings, HttpUrl, ValidationError

class Settings(BaseSettings):
    node_env: str
    openai_api_key: str
    app_base_url: HttpUrl
    healthcheck_token: str
    log_level: str = "info"

    class Config:
        env_file = ".env"
        env_prefix = ""

try:
    settings = Settings()
except ValidationError as exc:
    print("❌ Invalid environment configuration", exc)
    raise SystemExit(1)
```

Use runtime validation libraries so local developers get immediate feedback, and surface configuration errors in CI by running a smoke test that loads settings during build pipelines.

## Design layered health checks
Expose two endpoints:

- **Liveness (`/health/live`)**: Returns HTTP 200 when the process is running. Keep this lightweight—avoid provider calls.
- **Readiness (`/health/ready`)**: Confirms downstream dependencies (AI provider, vector store, database) are reachable and have healthy quotas. Fail the readiness probe if token usage exceeds a configured percentage or if latency spikes beyond threshold.

### Express implementation

```ts
import express from "express";
import { getQuotaStatus } from "./services/quota";

const router = express.Router();

router.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "ok", uptimeSeconds: process.uptime() });
});

router.get("/health/ready", async (req, res) => {
  const auth = req.get("Authorization");
  if (auth !== `Bearer ${process.env.HEALTHCHECK_TOKEN}`) {
    return res.status(401).json({ status: "unauthorized" });
  }

  const quota = await getQuotaStatus();
  if (!quota.ok) {
    return res.status(503).json({ status: "degraded", issues: quota.issues });
  }

  res.status(200).json({
    status: "ready",
    dependencies: quota.dependencies,
    updatedAt: new Date().toISOString(),
  });
});

export default router;
```

### FastAPI implementation

```python
from datetime import datetime
import time

from fastapi import APIRouter, Header, HTTPException

from .quota import quota_status

router = APIRouter()

@router.get("/health/live")
def live() -> dict:
    return {"status": "ok", "uptime_seconds": time.process_time()}

@router.get("/health/ready")
def ready(authorization: str = Header(...)) -> dict:
    expected = f"Bearer {settings.healthcheck_token}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")

    quota = quota_status()
    if not quota["ok"]:
        raise HTTPException(status_code=503, detail=quota)

    return {
        "status": "ready",
        "dependencies": quota["dependencies"],
        "updated_at": datetime.utcnow().isoformat(),
    }
```

> Protect readiness endpoints with a token or IP allow list to prevent attackers from inferring capacity limits. FastAPI’s dependency injection and security utilities help enforce this with minimal boilerplate.(Review /docs/quickstarts/python-fastapi.md for more FastAPI security patterns.)

## What to include in readiness probes
Track the signals that correlate with degraded responses:

- **Provider quotas**: Fetch current usage from OpenAI’s `/usage` APIs or Azure’s quota endpoints; set a fail threshold (e.g., >85% of rate limit).
- **Latency budgets**: Log rolling P95 latency for recent provider calls; fail if above SLA.
- **Vector or cache reachability**: Run a lightweight query against Redis, Postgres, or your embedding store.
- **Model freshness**: Include deployed model name/version so operators spot misconfigurations quickly.
- **Feature flags**: If you disable AI features, reflect that state so load balancers can drain traffic.

Surface results in JSON with clear fields, for example:

```json
{
  "status": "degraded",
  "dependencies": {
    "openai": { "status": "warn", "quotaRemaining": 12, "limit": 50 },
    "vector_store": { "status": "ok", "latencyMs": 42 }
  },
  "notes": ["OpenAI rate limit above 85%"],
  "updatedAt": "2025-03-20T09:40:00Z"
}
```

Feed this output into your observability stack (Grafana, Datadog, Azure Monitor) and set alerts on degradation states. Keep history so you can correlate readiness failures with incident timelines.(Deep dive: /docs/patterns/observability-context.md.)

## Automate checks in CI/CD

1. **Static verification**: Run a script in CI that loads environment schemas and ensures secrets exist in the deployment platform.
2. **Ephemeral readiness tests**: After deploying to staging, call `/health/ready` and fail the pipeline on non-200 responses.
3. **Runtime alerts**: Configure uptime monitors (e.g., Azure Monitor, Pingdom) with the readiness token to detect partial outages.
4. **Documentation sync**: Link to this page from onboarding checklists and PR templates so new services adopt the same pattern.

## Checklist for go-live

- [ ] `.env.example` documented and committed.
- [ ] Required variables validated at startup in Node.js and Python services.
- [ ] Liveness and readiness endpoints implemented with authentication.
- [ ] Readiness responses include quotas, latency, and dependency status.
- [ ] Health checks integrated with CI and observability alerts.

## References

- Next.js. “Building reliable health checks.” (2024). <https://nextjs.org/docs/app/building-your-application/routing/route-handlers#handling-health-checks>
- FastAPI. “Dependencies and Security.” (2025). <https://fastapi.tiangolo.com/tutorial/security/>
- Microsoft Learn. “Monitor Azure OpenAI usage and quotas.” (2024). <https://learn.microsoft.com/azure/ai-services/openai/how-to/monitor-usage>
- OpenAI. “Rate limits and monitoring.” (2024). <https://platform.openai.com/docs/guides/rate-limits>
