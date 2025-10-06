---
title: "Example: A2A Coordination"
description: "Show two agents collaborating (planner → executor or QA → fixer) with a short transcript and outcomes."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["examples"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/patterns/a2a-agent-to-agent.md"]
search_keywords: ["multi-agent", "planner", "executor", "qa", "fixer"]
---

Contract

- Planner sends tasks with budgets; executor returns results with confidence.

Transcript (sketch)

- Planner: “Split into 3 steps and estimate time.”
- Executor: “Step 1 done (2m), Step 2 pending…”.

Outcomes

- Report total time, retries, and escalations.

