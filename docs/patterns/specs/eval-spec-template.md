---
title: "Evaluation spec template"
description: "Capture metrics, datasets, thresholds, and reviewer workflows so AI teams can run consistent evaluations."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns", "evaluations"]
min_read_minutes: 10
last_reviewed: 2025-02-17
related:
  [
    "/docs/evaluations/overview.md",
    "/docs/patterns/specs/prompt-spec-template.md",
    "/docs/patterns/rag/evals-hook.md"
  ]
search_keywords:
  [
    "evaluation spec",
    "metrics",
    "llm evals",
    "rubric",
    "dataset"
  ]
show_toc: true
---

## Why evaluation specs matter

Without a shared template, evaluation results become hard to reproduce and compare. Evaluation specs formalize the metrics, datasets, thresholds, and reviewer procedures so teams can assess prompts, tools, and models consistently over time.【F:docs/patterns/specs/eval-spec-template.md†L45-L118】

## Template overview

| Section | Description |
| --- | --- |
| Overview | Objective, owners, related prompts/tools |
| Metrics | Quantitative and qualitative metrics with formulas |
| Datasets | Sources, size, refresh cadence |
| Procedure | How to run the eval (automation + human steps) |
| Thresholds & alerts | Pass/fail criteria, escalation paths |
| Reporting | Dashboards, stakeholders, cadence |
| Change log | Version history |

## Example frontmatter

```yaml
id: evals.grounded-qa
owner: qa-leads@company.com
created: 2024-12-01
last_reviewed: 2025-02-17
related_prompts: ["prompt.kb-answering"]
related_tools: ["tool.search_docs"]
automation: ["langsmith", "custom-runner"]
```

## Metric definitions

Define each metric with formula, scoring scale, and desired direction.

```yaml
metrics:
  - name: faithfulness
    type: binary
    description: Claims supported by supplied citations
    scorer: llm
    model: gpt-4.1-mini
    target: ">=0.95"
  - name: citation_accuracy
    type: numeric
    description: Percent of citations that reference correct chunk
    scorer: script
    target: ">=0.9"
  - name: helpfulness
    type: ordinal
    description: Human rubric (1-5)
    scorer: human
    target: ">=4.0"
```

Include links to rubric descriptions when humans score outputs.

## Dataset catalog

```yaml
datasets:
  - id: ds.support-goldens
    source: curated
    size: 120
    segments: ["billing", "product", "security"]
    refresh_cadence: quarterly
    storage: s3://ai-datasets/rag/goldens.parquet
  - id: ds.live-sample
    source: sampled_production
    size: 200 per week
    retention: 30 days
    anonymization: hashed_user_ids, pii_redacted
```

Document labeling procedures, reviewer qualifications, and inter-rater agreement targets (e.g., Cohen’s κ ≥ 0.7).

## Execution procedure

1. Fetch the latest dataset snapshot (pin commit hash).
2. Run automated evaluators (LLM scorers, scripts) with fixed model versions.
3. Sample N outputs for human review; assign to reviewers with training status.
4. Aggregate results; compare to thresholds.
5. File tickets for regressions with links to traces.

Provide CLI commands or workflow files for automation (e.g., GitHub Actions, Airflow DAG).

## Thresholds and escalation

- Define pass criteria (e.g., faithfulness ≥0.95, helpfulness ≥4.0, latency P95 ≤ 4 s).
- Set warning bands (e.g., faithfulness 0.9–0.95 triggers yellow status).
- Document stakeholders to notify (product owner, incident channel) and required response times.
- Link to rollback steps or feature flags if thresholds fail.

## Reporting and storage

- Publish dashboards in BI tools (Looker, Power BI) with metric history and annotations.
- Store raw eval outputs (JSON/CSV) with retention policy.
- Maintain audit trails of who ran evaluations, when, and with which configuration.

## Change management

Keep a changelog for metric definitions, dataset revisions, and tooling updates.

```markdown
### Changelog
- 2025-02-17 — v1.3 — Added citation accuracy metric and weekly live sample (M. Gomez)
- 2025-01-10 — v1.2 — Switched faithfulness scorer to gpt-4.1-mini (S. Patel)
```

Require sign-off from QA lead and product owner before changing thresholds or replacing datasets.

## References

- OpenAI. “Evaluate LLM applications.” 2024. <https://platform.openai.com/docs/guides/evals>
- LangSmith. “Evaluation templates.” 2024. <https://docs.langchain.com/docs/evaluation/templates>
- Google Cloud. “Evaluate generative AI quality.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/evaluate/overview>
