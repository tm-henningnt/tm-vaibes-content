---
title: "Grounded QA Evaluations"
description: "Measure faithfulness and citation accuracy for RAG answers."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["evaluations"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/patterns/rag/basics.md", "/docs/patterns/rag/faq-rag.md"]
search_keywords: ["faithfulness", "citations", "rag eval", "grounded qa"]
---

Checks

- Faithfulness: does the answer claim facts not present in provided excerpts?
- Citation accuracy: do citation markers point to supporting excerpts?

Signals

- Penalize unsupported statements; reward precise quotes and correct references.

Reports

- List failing questions with answer snippets and missing sources for fast fixes.

