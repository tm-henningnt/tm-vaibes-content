---
title: "Reference: Session Record Schema"
description: "A minimal schema for recording AI sessions with audit fields."
audience_levels: ["intermediate"]
personas: ["developer", "admin"]
categories: ["reference"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/tutorials/prisma-and-postgres-for-sessions.md", "/docs/providers/security-best-practices.md"]
search_keywords: ["session", "schema", "audit", "tokens", "latency"]
---

JSON shape (example)

```json
{
  "id": "uuid",
  "user_id": "string|hash",
  "created_at": "iso-datetime",
  "model": "string",
  "tokens_in": 0,
  "tokens_out": 0,
  "latency_ms": 0,
  "tool_calls": [
    { "name": "string", "ok": true, "latency_ms": 0 }
  ],
  "status": "ok|error",
  "error_code": "optional",
  "correlation_id": "string"
}
```

Notes

- Avoid storing raw prompts/outputs unless policy allows; prefer hashes and metadata.

PII and access

- If prompts/outputs must be stored, encrypt at rest and restrict access; define retention windows.
- Consider per-tenant data isolation if serving multiple orgs.
