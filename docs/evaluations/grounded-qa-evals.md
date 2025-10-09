---
title: Grounded QA evaluations
description: Measure whether retrieval-augmented answers stay faithful to source documents and cite evidence correctly.
audience_levels: [intermediate, advanced]
personas: [developer, PM]
categories: [evaluations]
min_read_minutes: 12
last_reviewed: 2025-03-16
related:
  [
    "/docs/patterns/rag/basics.md",
    "/docs/patterns/rag/faq-rag.md",
    "/docs/evaluations/rubric-prompts.md",
    "/docs/safety/prompt-safety.md"
  ]
search_keywords:
  [
    "rag evaluation",
    "faithfulness score",
    "citation accuracy",
    "grounded qa",
    "retrieval eval"
  ]
show_toc: true
---

## Keep retrieval-augmented answers honest

Grounded QA evaluations verify that model responses stay within provided documents and cite sources accurately. Without them, even strong retrieval pipelines can hallucinate or misattribute facts. This guide details metrics, datasets, and automation patterns to validate faithfulness before shipping updates.

### You’ll learn
- How to define faithfulness, attribution, and completeness metrics for RAG systems
- How to build golden sets that combine user queries, source passages, and expected citations
- Techniques for grading answers with deterministic checks and rubric prompts
- How to automate evaluation jobs and interpret score deltas
- References to official provider guidance on grounded answering

## Define your metrics

| Metric | Question answered | Measurement approach |
| --- | --- | --- |
| Faithfulness | Does the answer only claim facts supported by retrieved passages? | Evaluator prompt that flags unsupported statements; optional entailment models | 
| Citation accuracy | Do citation markers map to passages containing the quoted fact? | Regex over citation tokens + passage validation | 
| Coverage / completeness | Does the answer address the core question using relevant context? | Rubric prompt or human review | 
| Conciseness | Is the answer appropriately scoped without filler? | Token count thresholds + evaluator comments |

Set minimum thresholds (e.g., faithfulness ≥ 4/5, citation accuracy ≥ 95%) aligned with your safety posture in `/docs/safety/overview.md`.

## Curate evaluation datasets

A grounded QA golden set typically includes:

```json
{
  "id": "faq-contracts-012",
  "question": "When can we terminate the supplier contract early?",
  "documents": [
    { "id": "doc-1", "title": "Termination clause", "text": "..." },
    { "id": "doc-2", "title": "Service-level appendix", "text": "..." }
  ],
  "expected_points": [
    {
      "fact": "Termination allowed with 30 days' notice for material breach.",
      "source_ids": ["doc-1"],
      "citation": "[1]"
    }
  ],
  "policy_risk": "medium"
}
```

Tips:

- Cover diverse document lengths and structures (FAQs, PDFs, tables).
- Include adversarial cases (missing facts, conflicting passages, prompt injections) to stress-test refusal logic.
- Store clean references to the canonical documents so you can rehydrate full text during evaluation.

## Grade faithfulness and citations

### Deterministic checks

1. **Citation resolver:** Map markers like `[1]` to the corresponding passages. Fail the answer if a marker is missing or references a passage without the claimed fact.
2. **Unsupported claim detector:** Use string matching or semantic search to ensure each sentence has overlap with retrieved documents. Flag sentences without matches for manual review.

### Rubric evaluator

Use a rubric prompt tailored to grounded QA:

```text
System: You score grounded answers.

Score 1-5 for:
- Faithfulness: Are all claims supported by the provided passages?
- Attribution: Are citations placed next to the supporting sentences?
- Completeness: Does the answer resolve the user question using the documents?

Return JSON with integer scores and a list of unsupported sentences (if any).
```

Combine rubric scores with deterministic checks. Require high agreement before declaring an answer safe.

## Automate the evaluation run

```python
from typing import List
from scorer import score_faithfulness, check_citations


def evaluate_batch(examples: List[dict], model_client):
    results = []
    for example in examples:
        answer = model_client.answer(question=example["question"], documents=example["documents"])
        citation_result = check_citations(answer, example["documents"])
        rubric = score_faithfulness(answer, example["documents"], example.get("expected_points", []))
        results.append({
            "id": example["id"],
            "faithfulness": rubric["faithfulness"],
            "attribution": rubric["attribution"],
            "completeness": rubric["completeness"],
            "unsupported": rubric["unsupported"],
            "citation_pass": citation_result["pass"]
        })
    return results
```

Store outputs with metadata (model version, retrieval index hash, embedding model) for regression analysis alongside `/docs/evaluations/offline-batch-evals.md`.

## Interpret results

- **Regression diffs:** Highlight examples where faithfulness dropped ≥1 point or citation accuracy failed. Link to retrieval traces for debugging.
- **Coverage gaps:** Identify unanswered sub-questions; add documents or adjust chunking strategies in `/docs/patterns/rag/basics.md`.
- **Safety implications:** Flag hallucinations or missing disclaimers for human review queues described in `/docs/safety/human-in-the-loop.md`.

## Production monitoring hooks

Augment offline evals with runtime signals:

- Log citation markers and retrieval doc IDs for every live response; sample daily for manual inspection.
- Track the rate of “unsupported” feedback from evaluator prompts during canary deployments.
- Collect user feedback on citation usefulness to refine rubrics.

## References

- OpenAI. “Improve RAG with evaluation and observability.” 2024. <https://platform.openai.com/docs/guides/retrieval>
- Google Cloud. “Evaluate retrieval-augmented generation pipelines.” 2024. <https://cloud.google.com/generative-ai-app-builder/docs/rag-evaluate>
- Anthropic. “Grounded generation best practices.” 2024. <https://docs.anthropic.com/en/docs/build-with-claude/grounding>
