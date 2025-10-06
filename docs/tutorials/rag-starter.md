---
title: "Tutorial: RAG Starter"
description: "Create a minimal RAG system with dataset curation, chunking, retrieval, and an evaluation loop."
audience_levels: ["intermediate"]
personas: ["developer", "data-analyst"]
categories: ["tutorials"]
min_read_minutes: 14
last_reviewed: 2025-10-06
related: ["/docs/patterns/rag/basics.md", "/docs/evaluations/grounded-qa-evals.md"]
search_keywords: ["rag", "chunking", "embeddings", "retrieval", "eval loop"]
---

Steps

- Curate: pick 20–50 pages with clean headings; remove boilerplate.
- Chunk: 200–400 token windows with overlap; store source and anchors.
- Embed: choose provider embeddings; store vectors and metadata.
- Retrieve: top‑k cosine similarity; dedupe overlapping chunks.
- Prompt: append excerpts with citation markers.
- Evaluate: nightly batch—faithfulness and citation accuracy.

Query flow (pseudo)

```ts
const q = 'How do I rotate API keys?';
const hits = await searchEmbeddings(q, { k: 6 });
const prompt = composePrompt(q, hits);
const answer = await callModel(prompt);
```

Next

- Add hybrid retrieval (BM25 + vectors) and reranking; measure gains.

