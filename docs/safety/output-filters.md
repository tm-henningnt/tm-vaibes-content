---
title: "Output Filters"
description: "Add classifier/rule-based filters to block or redact unsafe outputs before they reach users."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["safety", "operations"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/safety/overview.md", "/docs/safety/prompt-safety.md", "/docs/safety/human-in-the-loop.md"]
search_keywords: ["safety filter", "classifier", "rules", "redaction"]
---

Approach

- Multi-stage: light rules first (regex/keywords), then ML classifier for borderline cases.
- Redact or block; provide safe alternatives or next steps.

Rules examples

- Deny explicit instructions for harm; block raw secrets patterns (API keys), personal IDs.
- Redact phone/email if policy requires; allow masked versions for support use cases.

Classifier integration

- Route ambiguous outputs to a classifier; threshold → allow, redact, or escalate.
- Log the decision and category for auditing.

Pipeline (pseudo)

```ts
function filter(output) {
  if (ruleBlock(output)) return { action: 'block' };
  const score = classifierScore(output); // 0..1
  if (score > 0.9) return { action: 'block' };
  if (score > 0.7) return { action: 'redact', text: redact(output) };
  return { action: 'allow', text: output };
}
```

User messaging

- On block: provide a short reason and safe alternatives.
- On redact: indicate redactions occurred and how to proceed.
