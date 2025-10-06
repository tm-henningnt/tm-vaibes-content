---
title: "Security Best Practices for AI Providers"
description: "Handle keys, proxies, rotation, and logging safely across environments."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["providers", "operations", "safety"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/providers/openai/auth-models-limits.md", "/docs/operations/env-and-healthcheck.md", "/docs/troubleshooting/provider-errors.md"]
search_keywords: ["api key handling", "secrets", "key rotation", "proxy", "redaction"]
---

Keys and storage

- Store provider keys in environment variables or a secrets manager; never commit to source control.
- Limit blast radius with per-env keys and least-privilege access.

Server-only usage

- Call providers from server-side routes/services; never expose keys to browsers or mobile clients.
- If untrusted clients must call, front them with your own proxy enforcing quotas and input validation.

Rotation and auditing

- Rotate keys on a cadence (e.g., 60–90 days) and on leak suspicion.
- Keep minimal audit logs of rotations and usage without storing raw prompts/outputs (metadata only).

Logging and PII

- Redact sensitive fields; prefer correlation IDs to link events.
- Avoid storing full prompts/outputs unless you have explicit consent and retention policies.

Network and retries

- Apply exponential backoff with jitter for 429/5xx; cap attempts to bound cost/latency.
- Timebox outbound requests (client timeouts) and use circuit breakers under sustained failures.

Secrets management

- Options: Azure Key Vault, AWS Secrets Manager, HashiCorp Vault.
- Inject at runtime; do not write secrets to disk on hosts or containers.

References

- OpenAI security guidance; Azure Key Vault docs

