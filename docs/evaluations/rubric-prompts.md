---
title: "Rubric Prompts"
description: "Design rubrics for correctness, helpfulness, tone, and safety; improve inter‑rater agreement."
audience_levels: ["intermediate"]
personas: ["developer", "PM"]
categories: ["evaluations", "how-to"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/patterns/agentic/reflection-self-heal.md", "/docs/evaluations/overview.md"]
search_keywords: ["rubric", "prompt", "scoring", "agreement"]
---

Structure

- Define criteria with 0–5 scales and concrete examples for each score.
- Keep language precise to reduce ambiguity.

Agreement

- Calibrate using a small shared set; compare scores and refine wording.

Output format

```json
{ "scores": { "correctness": 4, "helpfulness": 4, "safety": 5 }, "feedback": "Short actionable notes" }
```

