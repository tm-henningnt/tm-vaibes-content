---
title: "Environment Variables and Health Checks"
description: "Map required environment variables and define expected health check outputs for non-prod and prod."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "admin"]
categories: ["operations", "reference"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/reference/env-vars.md", "/docs/operations/admin-dashboard.md"]
search_keywords: ["env vars", "healthcheck", "status endpoint", "liveness", "readiness"]
---

Required variables (examples)

- `OPENAI_API_KEY` – server-only
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_VERSION`, `AZURE_OPENAI_DEPLOYMENT` (if using Azure)
- Optional: `ANTHROPIC_API_KEY`

Health check guidance

- Liveness (`/healthz`): returns `{ ok: true }` when process is running.
- Readiness (`/readyz`): verifies access to required secrets and outbound network.
- Non-prod may include “expected” error codes and safe test probes.

Example (Next.js route)

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  const ok = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({ ok, ts: new Date().toISOString() }, { status: ok ? 200 : 500 });
}
```

Operations

- Document what “green” vs “stale” means in dashboards (e.g., content manifest age, last fetch time).
- Emit minimal metadata needed for on-call to triage without leaking secrets.

