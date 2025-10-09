---
title: Prompt safety
description: Write prompts that minimize risk by scoping behavior, enforcing refusals, and protecting sensitive data.
audience_levels: [intermediate]
personas: [developer, PM]
categories: [safety, how-to]
min_read_minutes: 10
last_reviewed: 2025-03-16
related:
  [
    "/docs/safety/overview.md",
    "/docs/safety/output-filters.md",
    "/docs/safety/human-in-the-loop.md",
    "/docs/concepts/safety-basics.md"
  ]
search_keywords:
  [
    "prompt guardrails",
    "refusal language",
    "prompt injection",
    "safety prompt",
    "policy scope"
  ]
show_toc: true
---

## Give models the safest possible starting point

Prompts act as the first line of defense. Well-scoped system messages and guardrails reduce the chances of unsafe outputs, data leakage, or tool misuse. This guide covers templates, refusal patterns, and testing tactics you can apply across products.

### You’ll learn
- How to structure system prompts that encode policy scope and tone
- Techniques to prevent prompt injection and data leakage
- How to design refusal and clarification patterns users can understand
- How to test prompts against safety checklists and adversarial inputs
- References for official safety guidance from major providers

## Structure your system prompt

A safe system prompt typically includes:

1. **Role and domain:** Define the assistant’s responsibilities and target audience.
2. **Source of truth:** Limit responses to approved documents or APIs.
3. **Refusal policy:** Describe disallowed topics and how to respond when they arise.
4. **Data handling rules:** Remind the model not to store or echo sensitive information.
5. **Output format:** Specify structured outputs when needed for logging and filters.

Example template:

```text
System: You are a support assistant for Acme Corp.
Only answer using the provided knowledge base excerpts. If the answer is missing, reply with “I don’t know” and offer to escalate.
Decline any request involving policy violations, personal data disclosure, or system access instructions.
Summaries must include citation markers like [1], [2] tied to provided excerpts.
Do not repeat passwords, tokens, or other secrets. Mask any sensitive data you notice.
```

## Protect against prompt injection

- Sanitize user-provided text before inserting into prompts (strip HTML, limit length, remove obvious override phrases).
- Wrap retrieved content in delimiters (`<context> ... </context>`) and remind the model to treat it as untrusted.
- Use evaluation harnesses to test jailbreak prompts sourced from public repositories or internal red teams.
- Combine with output filters to catch escaped instructions or leaked data.

## Design refusal and clarification flows

- **Refusal phrasing:** Keep it clear, non-judgmental, and actionable (e.g., “I’m sorry, but I can’t help with that request. I can help with…”).
- **Clarifications:** When the request is ambiguous, ask follow-up questions instead of guessing.
- **Escalation cues:** Offer safe alternatives like contacting a human expert or submitting a ticket.

Document these patterns in your customer support scripts so human agents stay consistent.

## Test and monitor prompts

- Run adversarial suites covering disallowed topics, data exfiltration attempts, and tool misuse scenarios. Automate these tests in `/docs/safety/output-filters.md` pipelines.
- Track refusal rates in production. Sudden drops may indicate prompt drift or new jailbreak patterns.
- Collaborate with the teams managing `/docs/safety/human-in-the-loop.md` to review questionable prompts and refine templates.

## References

- OpenAI. “Safety best practices for system prompts.” 2024. <https://platform.openai.com/docs/guides/safety-best-practices>
- Anthropic. “Prompting for responsible use.” 2024. <https://docs.anthropic.com/en/docs/build-with-claude/prompting-best-practices>
- Google Cloud. “Secure prompt design for Vertex AI.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/developer-guides/responsible-prompts>
