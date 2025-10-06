---
title: "FAQ RAG Pattern"
description: "Build a FAQ-style RAG with a simple eval hook to keep answers grounded."
audience_levels: ["intermediate"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 7
last_reviewed: 2025-10-06
related: ["/docs/patterns/rag/basics.md", "/docs/evaluations/grounded-qa-evals.md", "/docs/evaluations/offline-batch-evals.md"]
search_keywords: ["faq rag", "grounded qa", "eval hook", "faithfulness"]
---

Approach

- Curate a small FAQ corpus; chunk per Q/A or heading.
- Embed questions and answers; prefer dense retrieval by question.
- Prompt enforces “only from excerpts” and returns citations.

Eval hook

- For each question, assert the answer includes at least one citation and no unsupported facts.
- Log failures into a queue for manual review/improvements.

