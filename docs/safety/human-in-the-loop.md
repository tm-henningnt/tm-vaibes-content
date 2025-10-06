---
title: "Human-in-the-Loop"
description: "Introduce approval gates for sensitive actions and define reviewer workflows."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM", "admin"]
categories: ["safety", "operations"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/safety/overview.md", "/docs/safety/output-filters.md"]
search_keywords: ["human in the loop", "approval", "review", "gate"]
---

Where to gate

- Irreversible actions (deletes, sends), external communications, PII handling, policy gray areas.

Flow

- Draft → filter → queue → human review (approve, edit, reject) → execute or archive.

Reviewer UX

- Show minimal context, decision buttons, and clear accountability (who approved, when).

Metrics

- Measure approval rate, time-to-approve, and post-approval incidents.

