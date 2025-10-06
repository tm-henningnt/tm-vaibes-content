---
title: "Reflection Loop: Self‑Healing Outputs"
description: "Use rubric prompts to critique model outputs, retry within a budget, and converge on quality."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/evaluations/rubric-prompts.md", "/docs/patterns/cost-controls.md"]
search_keywords: ["reflection", "self critique", "retry budget", "rubric", "quality"]
---

Pattern

- Step 1: produce a draft.
- Step 2: critique against a rubric (correctness, completeness, safety, tone).
- Step 3: repair and stop when score ≥ threshold or budget exhausted.

Rubric example

```text
Score 0–5 for: correctness, completeness, clarity, safety. Give short feedback and an overall score.
```

Retry budget

- Cap attempts (e.g., 2–3) to bound latency/cost.
- Track improvement per iteration; abort if no score increase.

Notes

- Keep critiques short; avoid infinite loops.
- Persist scores for later analysis in evaluations.

