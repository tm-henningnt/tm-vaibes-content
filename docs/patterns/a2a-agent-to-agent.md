---
title: "Agent‑to‑Agent (A2A) Collaboration"
description: "Patterns for agents to hand off tasks, negotiate, and escalate to humans."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/patterns/agentic/router-multi-tool.md", "/docs/patterns/agentic/reflection-self-heal.md"]
search_keywords: ["a2a", "multi agent", "handoff", "negotiation", "escalation"]
---

Contracts

- Define message schema (intent, context, requested outputs).
- Include deadlines, budgets, and stop conditions.

Handoff

- Planner → Executor: planner decomposes; executor executes with tool calls; results fed back.

Failure

- Escalate to human when budget/time exhausted or confidence is low; include a concise failure report.

