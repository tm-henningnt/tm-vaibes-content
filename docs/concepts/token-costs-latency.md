---
title: Tokens, context windows, and latency
description: Understand tokens, context windows, streaming, and the cost–latency tradeoffs.
audience_levels: [beginner, intermediate]
personas: [PM, developer]
categories: [concepts]
min_read_minutes: 8
last_reviewed: 2025-10-08
tags: [tokens, latency, streaming, costs]
related: ["/docs/patterns/cost-controls.md", "/docs/evaluations/latency-cost-tradeoffs.md"]
search_keywords: ["tokens", "context window", "latency", "cost"]
show_toc: true
---

## Overview
Tokens drive cost and latency. Learn practical budgeting strategies.

## Quick heuristics
- Stream when possible; cap max tokens; truncate inputs; log token usage.
