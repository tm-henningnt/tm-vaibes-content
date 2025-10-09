---
title: Safety risk taxonomy
description: Classify GenAI risks by impact and likelihood, and map them to mitigations and owners.
audience_levels: [intermediate, advanced]
personas: [developer, PM, admin]
categories: [concepts, safety]
min_read_minutes: 11
last_reviewed: 2025-03-16
related:
  [
    "/docs/safety/overview.md",
    "/docs/safety/prompt-safety.md",
    "/docs/safety/output-filters.md",
    "/docs/evaluations/overview.md"
  ]
search_keywords:
  [
    "safety taxonomy",
    "risk matrix",
    "ai mitigation",
    "responsible ai",
    "impact likelihood"
  ]
show_toc: true
---

## Create a shared language for AI risk

A safety taxonomy helps teams prioritize mitigations by grouping risks into clear categories with owners and controls. Without it, discussions stall in vague terms (“hallucinations,” “compliance issues”). This page offers a reusable taxonomy, mitigation checklist, and governance hooks.

### You’ll learn
- Core risk categories to track across GenAI products
- How to score likelihood and impact to focus engineering effort
- Mitigation patterns linked to prompts, filters, tools, and human review
- How to keep the taxonomy updated as policies and regulations evolve
- References for industry risk frameworks

## Define risk categories

| Category | Description | Example scenarios | Primary mitigations |
| --- | --- | --- | --- |
| Hallucination / inaccuracy | Model invents facts or misinterprets context | Wrong policy guidance, incorrect financial summary | Retrieval grounding, evaluator prompts, human review |
| Safety & policy violations | Outputs disallowed content or instructions | Self-harm encouragement, instructions for malware | Prompt safety, moderation filters, escalation |
| Data privacy & leakage | Sensitive data exposed or stored improperly | PII echoed back, logs contain secrets | Input scrubbing, redaction, retention limits |
| Tool misuse | Agent triggers harmful or irreversible actions | Unauthorized ticket closures, sending wrong emails | Least-privilege tools, approval gates, audit logs |
| Bias & fairness | System treats groups unequally | Hiring assistant downranks candidates, tone differences | Diverse datasets, fairness audits, human oversight |
| Security & abuse | Attackers manipulate system or exfiltrate data | Prompt injection, credential stuffing via bots | Sanitization, rate limiting, anomaly detection |

Map each category to owners and existing controls. Include policy references from `/docs/safety/overview.md` for quick lookups.

## Score likelihood and impact

Use a simple 3×3 matrix to prioritize work.

| Likelihood \ Impact | Low | Medium | High |
| --- | --- | --- | --- |
| **Low** | Monitor | Monitor | Treat as medium |
| **Medium** | Mitigate | Prioritize | Escalate to leadership |
| **High** | Escalate | Escalate | Block launch |

Assign likelihood based on evaluation results, production telemetry, and historical incidents. Impact reflects user harm, regulatory exposure, or financial loss. Document scoring rationale for auditability.

## Link controls to the taxonomy

For each category, list preventive, detective, and responsive controls:

- **Preventive:** `/docs/safety/prompt-safety.md`, tool allow-lists, data minimization.
- **Detective:** `/docs/safety/output-filters.md`, anomaly detection dashboards, evaluation suites.
- **Responsive:** `/docs/safety/human-in-the-loop.md`, incident runbooks, rollback plans.

Track control coverage in a spreadsheet or GRC system. Highlight gaps (e.g., no fairness audit scheduled) and assign owners.

## Operationalize reviews

- Include taxonomy review in quarterly safety committees. Update categories when new policies or features emerge.
- Require risk assessments for every new GenAI feature. Populate a one-page summary with category scores, mitigations, and open tasks.
- Align taxonomy tags with evaluation datasets so failure reports automatically reference risk categories.

## References

- NIST. “AI Risk Management Framework.” 2023. <https://www.nist.gov/itl/ai-risk-management-framework>
- Microsoft. “Responsible AI standard.” 2023. <https://www.microsoft.com/ai/responsible-ai>
- Anthropic. “Responsible deployment guidance.” 2024. <https://docs.anthropic.com/en/docs/safety/responsible-deployment>
