---
title: "Evaluations: Overview"
description: "Define goals, golden sets, and a taxonomy for measuring correctness, helpfulness, safety, latency, and cost."
audience_levels: ["intermediate"]
personas: ["developer", "PM", "admin"]
categories: ["evaluations", "concepts"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/evaluations/offline-batch-evals.md", "/docs/evaluations/rubric-prompts.md"]
search_keywords: ["evals", "golden set", "taxonomy", "metrics"]
---

Goals

- Catch regressions and measure progress.
- Align to business outcomes (accuracy, time saved, safety adherence).

Taxonomy

- Correctness, helpfulness, safety, latency, cost.

Golden sets

- Curate representative prompts and expected answers; include edge cases.

Roles

- Owner: defines goals and acceptance thresholds.
- Implementer: maintains harness and scoring logic.
- Reviewer: samples results and calibrates rubrics.

Review loop

- Run offline batches nightly; surface diffs; sample for human review.

Golden set format (example)

```json
[
  { "id": "faq-001", "prompt": "How do I rotate keys?", "expected": "...", "tags": ["security", "faq"] },
  { "id": "faq-002", "prompt": "What is RAG?", "expected": "...", "tags": ["concepts"] }
]
```
