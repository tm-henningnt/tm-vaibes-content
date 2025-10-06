---
title: "Example: Data Quality QA"
description: "Use tool calls to read-only SQL/APIs to verify data checks; measure defects caught and false positives."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "data-analyst"]
categories: ["examples"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/patterns/tools/function-calling.md", "/docs/evaluations/tool-use-evals.md"]
search_keywords: ["data quality", "sql", "qa", "read-only", "tools"]
---

Checks

- Null rates, range bounds, referential integrity.

Tool schema

- `runQuery(sql: string)` returning rows and row count.

Metrics

- Defects found, false positives, time to triage.

