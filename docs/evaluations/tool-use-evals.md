---
title: "Tool Use Evaluations"
description: "Measure success rate per tool, categorize timeouts/errors, and find flaky behaviors."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["evaluations"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/patterns/tools/function-calling.md", "/docs/patterns/agentic/router-multi-tool.md"]
search_keywords: ["tools", "function calling", "evals", "timeouts", "errors"]
---

Metrics

- Tool invocation rate, success rate, error taxonomy (validation, timeout, upstream), median latency.

Method

- Replay traces or synthetic prompts that require a specific tool; assert structured outputs.

Action

- Harden schemas, add timeouts/retries, and remove or fix flaky tools.

