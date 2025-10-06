---
title: "Prompt Safety"
description: "Write prompts that minimize risk: scope clearly, avoid data leakage, and instruct models to refuse unsafe tasks."
audience_levels: ["intermediate"]
personas: ["developer", "PM"]
categories: ["safety", "how-to"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/safety/overview.md", "/docs/safety/output-filters.md"]
search_keywords: ["prompt safety", "guardrails", "refusal", "scope"]
---

Principles

- Scope: state allowed domains, audiences, and sources.
- Refusals: explicitly instruct “Decline unsafe requests per policy.”
- Data hygiene: don’t echo sensitive inputs back; summarize when needed.

Template

```text
System: You are a helpful assistant for [domain].
Only answer using approved sources. If a request is unsafe or outside scope, refuse and cite policy.
Avoid PII; do not include secrets. Keep answers brief and cite sources when applicable.
```

Examples

- Clarifier: “I can help with [safe alternative]. I cannot provide [unsafe item].”
- Grounding: “Based on the provided excerpt [1], … If not found, say ‘unknown.’”

