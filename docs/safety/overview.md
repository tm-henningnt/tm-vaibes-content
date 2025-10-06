---
title: "Safety & Responsible AI: Overview"
description: "Define what we block, what we log, when we escalate, and how we mitigate abuse cases."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["safety", "concepts"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/safety/prompt-safety.md", "/docs/safety/output-filters.md", "/docs/safety/human-in-the-loop.md"]
search_keywords: ["safety", "responsible ai", "policy", "logging", "escalation"]
---

Policy pillars

- Prevent: scoped prompts, input validation, and least-privilege tools.
- Detect: output filters and anomaly signals (rate spikes, repeated failures).
- Respond: human escalation and remediation paths.

What we block

- Clearly prohibited: illegal content generation, explicit instructions for harm, PII exfiltration.
- Sensitive tasks require approval gates and audit trails.

What we log (metadata only)

- request_id, user role, model/tool name, tokens/latency, filter decisions.
- Redact prompts/outputs by default; store only if policy allows with retention controls.

Escalation

- Criteria: repeated filter hits, unusually high failure rates, or policy triggers.
- Route to an on-call/human reviewer with minimal context and reproduction steps.

