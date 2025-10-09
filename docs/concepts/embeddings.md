---
title: "Concepts: Embeddings fundamentals"
description: "Understand what embeddings are, how to choose dimensions and models, and how to normalize vectors for search and analytics."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "data-analyst", "PM"]
categories: ["concepts"]
min_read_minutes: 13
last_reviewed: 2025-03-20
related: ["/docs/patterns/rag/basics.md", "/docs/providers/compare-providers.md", "/docs/tutorials/rag-starter.md"]
search_keywords: ["embeddings", "vector search", "semantic search", "cosine similarity", "normalization"]
show_toc: true
---

## Summary
Embeddings convert text, images, or other signals into vectors so you can measure semantic similarity numerically. Choosing the right model, dimension size, and normalization strategy lets you power semantic search, clustering, personalization, and evaluation workflows.

### You’ll learn
- How embeddings represent meaning as vectors and why normalization matters.
- How to pick the right dimension size and model family for your use case.
- How to store and query embeddings efficiently with cosine or dot-product search.
- How to generate embeddings in Node.js and Python using OpenAI and Azure OpenAI.
- How to evaluate embedding quality with offline tests and ongoing monitoring.

## What embeddings are
An embedding is a dense vector (e.g., 1,536 floating-point numbers) where nearby vectors represent semantically related items. Models learn these representations by training on large corpora with contrastive objectives. Similarity metrics include:

- **Cosine similarity**: Measures the angle between vectors; ideal when vectors are normalized.
- **Dot product**: Sensitive to vector magnitude; useful for recommendation systems where magnitude encodes popularity.
- **Euclidean distance**: Less common for high-dimensional embeddings because distances concentrate.

Normalize embeddings (divide by their L2 norm) before using cosine similarity to avoid drift when vectors differ in scale.

## Choosing dimension size and models

| Provider | Model | Dimensions | Best for | Notes |
| --- | --- | --- | --- | --- |
| OpenAI | `text-embedding-3-large` | 3,072 | Precision-sensitive search, knowledge bases | Higher cost but strong multilingual coverage.<sup>1</sup> |
| OpenAI | `text-embedding-3-small` | 1,536 | General search, classification | Lower cost, good default.<sup>1</sup> |
| Azure OpenAI | Deployment of `text-embedding-3-large` | 3,072 | Enterprises needing Azure compliance | Requires Azure resource + deployment name.<sup>2</sup> |
| Cohere | `embed-multilingual-v3.0` | 1,024 | Multilingual retrieval and reranking | Supports more than 100 languages.<sup>3</sup> |
| Mistral | `mistral-embed` | 1,024 | Lightweight search, European hosting | Lower latency in EU regions.<sup>4</sup> |

Guidelines:

- **Dimension vs. cost**: Larger vectors improve accuracy but increase storage and query cost. Start with 1,024–1,536 dimensions and scale only if evaluation demands it.
- **Domain coverage**: Pick models trained on similar content (e.g., legal, code, multilingual).
- **Latency**: Provision regionally close deployments to minimize round trips.
- **Versioning**: Track model version in metadata so you can rebuild indexes during upgrades.

## Generating embeddings

### Node.js with OpenAI

```ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function embedTexts(texts: string[]) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => normalize(item.embedding));
}

function normalize(vector: number[]) {
  const norm = Math.hypot(...vector);
  return vector.map((value) => value / norm);
}
```

Batch multiple inputs when possible to reduce HTTP overhead. OpenAI currently supports up to 2,048 tokens per input for these models.<sup>1</sup>

### Python with Azure OpenAI

```python
import os

from openai import AzureOpenAI
import numpy as np

client = AzureOpenAI(
    azure_endpoint="https://<resource>.openai.azure.com",
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-02-15-preview",
)

def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=texts,
        dimensions=3072,
    )
    return [normalize(item.embedding) for item in response.data]


def normalize(vector: list[float]) -> list[float]:
    arr = np.array(vector)
    norm = np.linalg.norm(arr)
    return (arr / norm).tolist()
```

Azure OpenAI requires you to deploy the embedding model in the Azure portal and reference the deployment name as the `model` parameter.<sup>2</sup>

## Storing and querying embeddings

1. **Vector databases**: Use services like Azure AI Search, Pinecone, Milvus, or pgvector for scalable nearest-neighbor search.
2. **Index types**: Start with cosine similarity indexes; for large datasets, use approximate nearest neighbor (ANN) algorithms such as HNSW or IVF.
3. **Metadata**: Store document IDs, chunk text, and model version alongside vectors to support filtering and migrations.
4. **Chunking**: Split documents into 300–500 token chunks to balance context with retrieval accuracy.
5. **Caching**: Cache embeddings for frequently requested inputs to avoid duplicate compute.

## Evaluation and monitoring

- **Offline tests**: Build a labeled dataset of queries and relevant documents. Measure recall@k, MRR, and nDCG.
- **Drift detection**: Monitor similarity scores for recurring queries over time. Drops may indicate model updates or data drift.
- **A/B testing**: Compare embedding models by routing a percentage of traffic and measuring click-through or resolution metrics.
- **Rebuild cadence**: Re-embed corpora quarterly or when adding new languages or content types.
- **Safety**: Avoid storing personal data in raw text chunks; apply redaction before embedding sensitive fields.

## Checklist

- [ ] Select an embedding model aligned with language, cost, and latency requirements.
- [ ] Normalize vectors and record the model version and dimensions.
- [ ] Store embeddings with metadata in a vector-ready database.
- [ ] Evaluate recall/precision before rolling changes to production.
- [ ] Monitor drift and rebuild indexes on a defined cadence.

## References

1. OpenAI. “Embeddings API.” (2024). <https://platform.openai.com/docs/guides/embeddings>
2. Microsoft Learn. “Deploy and use Azure OpenAI embeddings.” (2024). <https://learn.microsoft.com/azure/ai-services/openai/how-to/embeddings>
3. Cohere. “Embed v3 models.” (2024). <https://docs.cohere.com/docs/embed>
4. Mistral AI. “Embeddings.” (2024). <https://docs.mistral.ai/platform/embeddings/>
