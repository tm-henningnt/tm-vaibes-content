---
title: "Offline Batch Evaluations"
description: "Run nightly evals with diff reports; store metrics to detect regressions."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["evaluations", "how-to"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/patterns/workflows/batch-processing.md", "/docs/evaluations/rubric-prompts.md"]
search_keywords: ["batch evals", "regressions", "diff report", "metrics"]
---

Recipe

- Build a harness to replay a golden set and capture outputs.
- Score with rubric prompts or deterministic checks where possible.
- Write diffs (score deltas, failures) to a report and notify owners.

Storage

- Keep raw metrics (scores, latencies, token counts) for trend lines.

Folder structure (example)

```
/evals
  /golden
    faq.json
  /runs
    2025-10-06.json
  report.md
```

Report template

```md
# Nightly Evals

- Correctness: +0.3 (avg 4.1) • Failures: 7/200
- Latency P95: 2.8s (+0.2s)
- Token avg: 420 → 380

Top regressions
- faq-017 …
```
