---
title: "Example: Meeting Summarizer"
description: "Generate structured notes with action items and owners."
audience_levels: ["beginner", "intermediate"]
personas: ["PM", "developer"]
categories: ["examples"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/patterns/workflows/batch-processing.md"]
search_keywords: ["meeting", "summary", "actions", "owners"]
---

Output JSON

```json
{ "summary": "...", "actions": [{ "owner": "name", "task": "...", "due": "YYYY-MM-DD" }] }
```

Prompt tips

- Ask for bullets, explicit owners, and dates; cap to top 5 actions.

