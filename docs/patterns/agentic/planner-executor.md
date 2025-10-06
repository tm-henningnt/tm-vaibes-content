---
title: "Pattern: Planner–Executor"
description: "A classic agent loop where a planner decides next steps and an executor performs them with tools."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "data-analyst"]
categories: ["patterns"]
tags: ["agent", "planner", "tools"]
min_read_minutes: 12
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## When to use
- Ambiguous tasks with decomposable steps
- Requires external tools, APIs, or retrieval

## Outline
1. Plan next step
2. Execute with tools
3. Reflect and repeat
