---
title: "RAG Basics"
description: "Minimal retrieval-augmented generation: chunking, indexing, and grounded citations."
audience_levels: ["intermediate"]
personas: ["developer", "data-analyst"]
categories: ["patterns"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/patterns/rag/faq-rag.md", "/docs/evaluations/grounded-qa-evals.md"]
search_keywords: ["rag", "chunking", "embeddings", "citations", "grounding"]
---

Steps

- Ingest and chunk (semantic or fixed size with overlaps).
- Embed chunks and store with IDs and source metadata.
- Retrieve top‑k by query embedding.
- Compose prompt: question + top chunks + citation markers.

Chunking tip

- Aim 200–400 tokens with ~10–20% overlap as a starting point; measure.

Prompt scaffold

```text
Answer using only the provided excerpts. Cite as [1], [2], ... Do not speculate; reply “unknown” if not found.

Excerpts:
[1] ...
[2] ...
```

Quality

- Evaluate faithfulness (no unsupported claims) and citation accuracy; see `/docs/evaluations/grounded-qa-evals.md`.

Embeddings (Node sketch)

```ts
// Pseudo-code: embed chunks and upsert to a vector store
const chunks = splitIntoChunks(text);
for (const c of chunks) {
  const vec = await openai.embeddings.create({ model: 'text-embedding-3-small', input: c.content });
  await upsert({ id: c.id, vector: vec.data[0].embedding, metadata: { source: c.source } });
}
```

Retrieval (Node sketch)

```ts
const vecQ = await openai.embeddings.create({ model: 'text-embedding-3-small', input: query });
const hits = await search(vecQ.data[0].embedding, { k: 6 });
```

Pitfalls

- Overlapping or redundant excerpts can drown the answer. Deduplicate and cap at top‑k.
- Long excerpts reduce the model’s capacity to reason. Prefer shorter, focused spans.
