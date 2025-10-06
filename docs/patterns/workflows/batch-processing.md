---
title: "Batch Processing Workflows"
description: "Run offline batches with retries, cost caps, and resumability."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/evaluations/offline-batch-evals.md", "/docs/patterns/cost-controls.md"]
search_keywords: ["batch", "offline", "retries", "resume", "cost cap"]
---

Guidelines

- Use queues and workers; persist checkpoints (offset, last ID).
- Apply per-item retries with caps; skip permanently failing items and log.
- Enforce cost ceilings (tokens/time) and stop gracefully when exceeded.

Resumability

- Save progress every N items; on restart, continue from the last checkpoint.

Reports

- Produce a summary: total processed, successes, failures, retries, total tokens/cost estimate.

