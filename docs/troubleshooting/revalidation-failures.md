---
title: "Troubleshooting Revalidation Failures"
description: "Inspect GitHub webhook deliveries, secrets, and handler logic when on-demand revalidation fails."
audience_levels: ["intermediate"]
personas: ["developer", "admin"]
categories: ["troubleshooting", "how-to"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/operations/content-sync-deep-dive.md", "/docs/operations/admin-dashboard.md"]
search_keywords: ["webhook", "revalidate", "github delivery", "secret", "nextjs"]
---

Checklist

- Webhook secret matches between GitHub and your app.
- Delivery status is 2xx; inspect recent attempts and payloads.
- App route returns `{ ok: true }` on valid secret; logs metadata on failures.

Fixes

- 401: mismatch secret → rotate both ends.
- 404: route path wrong → confirm deploy includes the API route.
- 5xx: handler threw → add try/catch and structured error logs.

GitHub UI steps

- Repo → Settings → Webhooks → Select your webhook → Recent Deliveries → open a failing delivery and view Request/Response.
- Click “Redeliver” after fixing your app to verify the route succeeds.

Local verification

- `curl` your deployed revalidation route with the correct secret header and a minimal payload; expect `{ ok: true }`.
