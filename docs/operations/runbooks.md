---
title: "Runbooks: Page Me When…"
description: "Operational runbooks for webhook failures, auth outages, and provider 5xx spikes."
audience_levels: ["intermediate", "advanced"]
personas: ["admin", "developer"]
categories: ["operations"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/troubleshooting/revalidation-failures.md", "/docs/troubleshooting/auth-errors.md", "/docs/troubleshooting/provider-errors.md"]
search_keywords: ["runbook", "outage", "webhook", "auth", "provider"]
---

Webhook failures

- Symptom: content stale; dashboard shows red webhook status.
- Actions: check GitHub deliveries → redeliver; rotate secret if 401; inspect app logs.

Auth outage

- Symptom: login failures or consent prompts for all users.
- Actions: verify Entra service health; check redirect URIs, client secrets, token lifetimes; rollback recent auth changes.

Provider 5xx spikes

- Symptom: elevated 5xx and retries; degraded UX.
- Actions: open circuit breaker; reduce concurrency; fallback to smaller model or cached responses; notify stakeholders.

