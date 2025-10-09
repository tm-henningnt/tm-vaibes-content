---
title: "Prompt spec template"
description: "Document intent, inputs, outputs, constraints, and evaluation hooks for reusable prompts."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "PM"]
categories: ["patterns"]
min_read_minutes: 10
last_reviewed: 2025-03-18
related:
  [
    "/docs/concepts/spec-vs-vibe-coding.md",
    "/docs/patterns/specs/tool-spec-template.md",
    "/docs/patterns/specs/eval-spec-template.md"
  ]
search_keywords:
  [
    "prompt spec",
    "template",
    "prompt design",
    "documentation",
    "rubric"
  ]
show_toc: true
---

## Why write a prompt spec?

Prompt specs make behavior explicit so teams can reuse, test, and govern prompts like software. They prevent ad-hoc “vibe coding,” clarify success metrics, and enable faster reviews across product, legal, and safety stakeholders. Pair this template with the alignment checklist in [/docs/concepts/spec-vs-vibe-coding.md](/docs/concepts/spec-vs-vibe-coding.md) to keep prompts auditable as they evolve.

## Recommended structure

| Section | Purpose | Questions to answer |
| --- | --- | --- |
| Overview | Context, business objective, owners | What task does the prompt solve? Who maintains it? |
| Inputs | Required/optional fields with type hints | What data does the caller supply? How is it validated? |
| Outputs | Expected schema or format | How do downstream systems parse the response? |
| Constraints | Guardrails, tone, policy rules | What must never happen? |
| Examples | At least 3 labeled examples | What does success/failure look like? |
| Evaluation hooks | Metrics and datasets | How do we test regressions? |
| Risks & mitigations | Known failure modes | How do we detect and handle them? |
| Change log | Version history | When did we last review or update? |

## Frontmatter block

Start every spec with a machine-readable header.

```yaml
id: prompt.kb-answering
owner: support-automation@company.com
created: 2025-02-17
last_reviewed: 2025-02-17
models: ["gpt-4o-mini", "claude-3-5-sonnet"]
linked_tools: ["search_docs"]
related_evals: ["evals.grounded-qa"]
```

## Intent and scope

Describe the task, audience, and boundaries. Include:

- **Goal statement:** e.g., “Generate grounded knowledge base answers with citations.”
- **In-scope content:** question answering from support articles, internal policies.
- **Out-of-scope content:** legal advice, pricing beyond published plans.
- **Success definition:** helpfulness score ≥4/5, faithfulness 100% on eval set.

## Inputs section

Document each input with type, validation, and sourcing.

```yaml
inputs:
  query:
    type: string
    required: true
    validation: len 10-600 chars; sanitized for PII
  user_role:
    type: enum["agent", "manager"]
    required: true
    usage: drives tone and escalation guidance
  retrieved_chunks:
    type: array<chunk>
    required: true
    validation: 1-8 items; each chunk includes id, source_url, content
```

Reference schemas from `/docs/patterns/specs/tool-spec-template.md` when prompts expect tool outputs.

## Output schema

Define expected JSON or Markdown layout so automated checks can parse responses.

```yaml
outputs:
  schema:
    type: object
    properties:
      answer: { type: string, minLength: 40, maxLength: 600 }
      citations: { type: array, items: { type: string, pattern: "^\\[[0-9]+\\]$" }, minItems: 1 }
      escalation:
        type: object
        properties:
          needed: { type: boolean }
          reason: { type: string }
    required: [answer, citations]
```

Specify formatting rules: headings allowed, bullet style, or Markdown restrictions.

## Prompt template body

Include the exact system prompt, user prompt skeleton, and formatting instructions. Use triple backticks to avoid accidental whitespace changes. Annotate variables (`{{query}}`, `{{#each retrieved_chunks}}`).

Provide at least three worked examples:

1. Successful answer with citations
2. Ambiguous query → respond with clarifying question
3. Unsupported topic → respond “unknown”

Each example should include input payload, model settings, and expected output.

## Evaluation hooks

Link to eval specs that measure accuracy, tone, or policy adherence.

```yaml
evaluations:
  - id: evals.grounded-qa
    metric: faithfulness
    threshold: 0.95
  - id: evals.tone-check
    metric: rubric_score
    threshold: 4.0
```

Schedule automated runs (nightly, pre-release) and note escalation paths when metrics fail.

## Risks and mitigations

Document known failure modes and countermeasures:

| Risk | Mitigation |
| --- | --- |
| Missing context leads to hallucination | Require ≥2 retrieved chunks or trigger fallback |
| Sensitive data leakage | Redact PII from inputs; enforce moderation on outputs |
| Tone drift | Include tone examples; evaluate with rubric |

## Change management

Track updates with timestamps, authors, and rationale. Example:

```markdown
### Changelog
- 2025-02-17 — v1.2 — Added escalation block, updated eval threshold (A. Rivera)
- 2025-01-05 — v1.1 — Tightened max answer length to 600 tokens (L. Chen)
```

Store the spec in version control. Require review from product, legal, and safety for major changes.

## References

- OpenAI. “Prompt engineering best practices.” 2024. <https://platform.openai.com/docs/guides/prompt-engineering>
- Anthropic. “Prompt engineering guidelines.” 2024. <https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering>
- Gov.UK. “Service manual: Writing user needs.” 2023. <https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs>
