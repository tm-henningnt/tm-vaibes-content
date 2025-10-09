---
title: "Operations: Admin dashboard for sync health"
description: "Build a lightweight dashboard that tracks documentation sync status, manifest hashes, and webhook freshness."
audience_levels: ["intermediate", "advanced"]
personas: ["admin", "developer"]
categories: ["operations"]
min_read_minutes: 11
last_reviewed: 2025-03-20
related: ["/docs/patterns/observability-context.md", "/docs/operations/env-and-healthcheck.md", "/docs/tutorials/observability-end-to-end.md"]
search_keywords: ["admin dashboard", "sync health", "manifest", "webhook", "staleness"]
show_toc: true
---

## Summary
Content-heavy AI apps need operators to verify that manifests, caches, and webhook deliveries stay fresh. This guide outlines a minimal admin dashboard that surfaces sync timestamps, manifest hashes, and revalidation events so teams can spot stale data before customers do.

### You’ll learn
- What telemetry to collect for documentation sync pipelines.
- How to design a dashboard layout with color-coded status and drilldowns.
- How to store and rotate manifest hashes for comparison.
- How to wire webhook history and revalidation logs into the UI.
- How to automate escalation when data falls behind SLA.

## Define the signals that matter
Track the minimum set of indicators that correlate with a stale or broken sync:

- **Manifest hash**: MD5/SHA of the generated manifest. Store the most recent value and compare with production.
- **Last build timestamp**: When `npm run build:manifest` last succeeded, both in CI and production.
- **Webhook deliveries**: Last successful GitHub webhook delivery ID, status, and latency.
- **Revalidation queue**: Pending on-demand ISR jobs and their age.
- **Error budget**: Count of failed sync attempts in the last 24 hours.

Persist these in a lightweight store (SQLite, Postgres, or Redis). Each record should include the environment (staging, production) and the Git SHA that triggered the build.(See /docs/tutorials/production-hardening.md for deployment hardening details.)

## Sketch the dashboard layout
Organize the dashboard into three panels:

1. **Current status banner**: Show manifest hash, build time, and a simple freshness indicator (green ≤30 minutes, yellow 30–120, red >120).
2. **Timeline of sync events**: Render the last 20 webhooks with status codes, latency, and an icon to retry (if authorized).
3. **Detail drawer**: When an operator clicks a row, show request headers (sanitized), revalidation payload, and the resulting cache purge decisions.

A Next.js App Router route handler can serve the JSON, while the client uses server components or React Query for incremental fetches. Protect the page behind admin-only auth (e.g., NextAuth with Entra roles).(Implementation reference: /docs/tutorials/nextjs-vercel-prisma-sqlite.md.)

## Store and compare manifest hashes
Calculate the manifest hash as part of the build pipeline:

```bash
npm run build:manifest
MANIFEST_HASH=$(shasum -a 256 manifest.json | cut -d' ' -f1)
node scripts/save-manifest-hash.cjs "$MANIFEST_HASH" "$GIT_SHA"
```

In your dashboard API route, fetch the latest production hash and compare with the deployed static asset:

```ts
import { getLatestHash } from "@/data/manifest";
import fs from "node:fs";
import crypto from "node:crypto";

export async function GET() {
  const latest = await getLatestHash("production");
  const local = crypto
    .createHash("sha256")
    .update(fs.readFileSync("./public/manifest.json"))
    .digest("hex");

  return Response.json({
    status: latest.hash === local ? "match" : "mismatch",
    production: latest,
    deployed: { hash: local, timestamp: new Date().toISOString() },
  });
}
```

Raise a warning in the UI if hashes diverge for more than one deployment cycle.

## Surface webhook and revalidation history
Create a database table for webhook deliveries with fields: `id`, `event`, `status`, `duration_ms`, `received_at`, `replay_url`, `environment`, `payload_digest`. Populate it from the webhook receiver that already validates GitHub signatures, following GitHub’s webhook troubleshooting guidance.(Cross-check the webhook receiver pattern in /docs/operations/env-and-healthcheck.md.)

Display the latest entries in a table with filters by status. Include a “Replay” button that calls the GitHub redelivery API when the operator confirms. Log every replay attempt with the acting user and result for audit purposes.

For on-demand ISR revalidation, track the routes invalidated, queue time, and outcome. Show averages and highlight routes that consistently take longer than expected, which might require caching adjustments.

## Automate alerts and escalation

- **SLA breach**: If the dashboard detects a manifest older than two hours, page the on-call rotation through your incident management tool.
- **Repeated webhook failures**: After three consecutive failures, raise a ticket automatically with payload details.
- **Manual overrides**: Provide a “Force revalidation” action that triggers a signed request to the site backend. Require two-person approval or a change ticket number for production use.
- **Audit log export**: Allow admins to download CSV logs to share with compliance teams during post-incident reviews.

## Implementation checklist

- [ ] Persist manifest hash, build timestamp, and triggering Git SHA per environment.
- [ ] Expose an authenticated API route returning the latest sync metrics.
- [ ] Render status banner, event timeline, and detail drawer with drilldowns.
- [ ] Record webhook delivery metadata and support safe replay.
- [ ] Configure alerts for stale manifests and repeated failures.

## References

- GitHub Docs. “Troubleshooting webhooks.” (2024). <https://docs.github.com/webhooks-and-events/webhooks/troubleshooting>
- Vercel. “On-demand ISR and revalidation.” (2024). <https://vercel.com/docs/incremental-static-regeneration#on-demand-revalidation>
- Microsoft Learn. “Monitor web app health with Azure Monitor.” (2024). <https://learn.microsoft.com/azure/azure-monitor/app/web-monitoring>
