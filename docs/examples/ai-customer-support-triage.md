---
title: "Example: AI Customer Support Triage"
description: "Router agent triages incoming messages with escalation rules and summaries."
audience_levels: ["intermediate"]
personas: ["PM", "developer"]
categories: ["examples"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/patterns/agentic/router-multi-tool.md"]
search_keywords: ["support", "triage", "router", "escalation"]
---

Flows

- Classify: bug, billing, feature, abuse.
- Route: canned reply, create ticket, or escalate to human.
- Summarize: short internal note with category and sentiment.

Guardrails

- Block unsafe content; redact PII from summaries.

