---
title: What is Generative AI?
description: Understand how generative models produce text, images, and code, what they do well, and when to reach for other techniques.
audience_levels: [beginner, intermediate, advanced]
personas: [non-technical, PM, developer, data-analyst]
categories: [concepts]
min_read_minutes: 12
last_reviewed: 2025-02-14
related:
  [
    "/docs/concepts/prompting-styles.md",
    "/docs/concepts/genai-vs-agentic.md",
    "/docs/concepts/safety-basics.md",
    "/docs/quickstarts/try-genai-in-10-min.md"
  ]
search_keywords:
  [
    "generative ai basics",
    "foundation models",
    "large language models",
    "diffusion models",
    "genai limitations"
  ]
show_toc: true
---

## Why generative AI matters

Generative AI (GenAI) systems learn patterns from vast datasets and then produce new content—text, code, images, audio, or video—that stays statistically close to their training data. They unlock natural-language interfaces, faster prototyping, and personalized experiences without bespoke rule engines. The tradeoff: models are probabilistic, so you must design guardrails and evaluations before putting them in front of customers.

### You’ll learn
- Core building blocks behind today’s foundation models
- Common capabilities and failure modes when working with LLMs
- How to reason about costs, latency, and quality tradeoffs
- When to combine GenAI with retrieval, tools, or deterministic logic
- Governance practices to keep experiments safe and measurable

## Foundations of generative models

Large language models (LLMs) and diffusion models dominate GenAI today. They share two ideas: pretraining on massive corpora and fine-tuning for downstream tasks.

- **Autoregressive transformers** predict the next token given prior context. Architectures like GPT-4o or Claude 3 pair multi-head attention with billions of parameters to capture linguistic patterns.
- **Diffusion models** generate images or audio by iteratively denoising random noise, guided by text or image conditioning prompts. OpenAI’s DALL·E and Stability AI’s Stable Diffusion are popular examples.
- **Fine-tuning and alignment** adapt pretrained models with supervised instructions, reinforcement learning from human feedback (RLHF), or constitutional techniques that encode policy rules.

> Mental model: treat GenAI as a probabilistic function `f(context) -> distribution over tokens`. You steer the distribution with prompts, examples, retrieval context, or tool outputs.

## Capabilities you can rely on

| Capability | What works well | Implementation tips |
| --- | --- | --- |
| Natural-language summarization | Condense long text, explain code, or generate meeting notes. | Provide role, audience, and length constraints; chunk long docs and merge summaries. |
| Structured drafting | Produce outlines, tables, JSON payloads, or marketing briefs. | Define explicit schemas; validate outputs before downstream use. |
| Reasoning over context | Answer questions from supplied documents or search results. | Keep context windows under provider limits; highlight critical facts. |
| Lightweight tool orchestration | Call calculators, calendars, or ticketing APIs via function calling. | Document tool contracts and add retries/timeouts; log payload metadata. |
| Multimodal interpretation | Some models interpret images, code blocks, or charts to provide narratives. | Redact sensitive data before upload; pair with human review for critical insights. |

Backstop every capability with monitoring—token usage, latency, quality scores, and incident reports—so you can catch regressions early.

## Limitations and failure modes

Generative models guess the most likely continuation, so they can introduce risks:

- **Hallucinations:** Confident-sounding but incorrect answers when the model lacks facts or misinterprets context. Mitigate with retrieval, citations, and automated evaluators.
- **Context sensitivity:** Outputs can swing based on prompt phrasing or order of examples. Version and regression-test prompts just like code.
- **Data leakage:** Customer inputs may get logged or used for future training if you skip enterprise opt-outs. Review provider policies and scrub PII.
- **Bias and safety gaps:** Models reflect their training data. Build red-team prompts, block disallowed topics, and maintain escalation paths.
- **Latency and cost variability:** Larger models cost more tokens and milliseconds. Measure 95th percentile latency, not just averages.

## Cost and latency at a glance

Use the smallest model that meets quality requirements. Track these levers:

- **Model size:** GPT-4o mini or Claude Haiku cost less and respond faster than flagship models, making them ideal for drafts or lightweight tooling.
- **Context window:** More context = more tokens. Trim prompts, summarize history, or use retrieval with short citations.
- **Streaming vs. batch:** Stream responses to improve perceived latency for chat UIs; use batch completions for offline processing.
- **Caching:** Cache deterministic prompts or store embeddings to avoid repeated calls.
- **Hybrid stacks:** Combine deterministic preprocessing (regex, SQL) with model calls to cut tokens and improve reliability.

## Choosing the right workflow

Start with the least complex approach and scale up only when metrics demand it.

1. **Single-shot prompt:** A well-crafted instruction plus context often solves focused tasks (e.g., draft an email). Evaluate accuracy with golden examples before shipping.
2. **Retrieval-augmented generation (RAG):** When knowledge must stay current or cite sources, index documents with embeddings and inject top matches into prompts.
3. **Tool use:** Use function calling for calculations, database lookups, or workflow triggers. Model outputs should include structured JSON with tool arguments and results.
4. **Agentic orchestration:** Introduce planners, memory, or multi-step loops only when single prompts hit reliability ceilings. Observe each step and enforce budgets.

## Quick look: calling a model

Below are minimal examples for OpenAI’s Responses API. They show the moving parts you must configure regardless of provider: model name, instructions, input messages, and safety settings.

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

response = client.responses.create(
    model="gpt-4o-mini",
    input=[
        {
            "role": "system",
            "content": "You draft concise product briefs with bullet points."
        },
        {
            "role": "user",
            "content": "Summarize the key value props of our analytics assistant for sales leaders."
        }
    ],
    temperature=0.7,
    max_output_tokens=400
)

print(response.output_text)
```

```ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.responses.create({
  model: "gpt-4o-mini",
  input: [
    { role: "system", content: "You write meeting recaps with decisions and owners." },
    { role: "user", content: "Summarize the attached transcript in under 200 words." }
  ],
  temperature: 0.6,
  max_output_tokens: 300
});

console.log(response.output_text);
```

Both snippets highlight where to tune tone, creativity, and token budgets. Wrap them in retries with exponential backoff, log token usage, and redact sensitive data before storing requests.

## Evaluation checklist

- Define success metrics: accuracy rubric, grounded citations, response time, customer satisfaction.
- Build a curated evaluation set (10–50 examples) with expected outputs or scoring criteria.
- Automate regression tests using provider batch APIs or open-source tools (e.g., Evals, LangSmith). Track deltas when models update.
- Monitor production traffic for drift: log prompt IDs, anonymized inputs, token counts, and moderation flags.
- Establish human review loops for high-impact tasks (financial advice, policy decisions, medical insights).

## When not to use generative AI

Skip or defer GenAI when:

- Regulatory requirements demand deterministic, audit-friendly outputs you can justify line-by-line.
- Latency budgets are tighter than ~150 ms end-to-end, making LLM calls impractical without heavy caching.
- Training data is scarce or sensitive, and contracts forbid sending it to third-party providers.
- Simple heuristics, SQL queries, or rule engines already meet stakeholder needs.

Pair GenAI with conventional automation: use scripts for structured updates, then generate narrative summaries or suggestions for humans to review.

## References

- OpenAI. “Introduction to the API.” 2024. <https://platform.openai.com/docs/overview>
- Anthropic. “Claude model card and usage guidance.” 2024. <https://docs.anthropic.com/en/docs/about-claude/models>
- Google. “Gemini API quickstart.” 2024. <https://ai.google.dev/gemini-api/docs/quickstart>
- Microsoft. “Responsible AI for Azure OpenAI.” 2024. <https://learn.microsoft.com/azure/ai-services/openai/concepts/responsible-ai-overview>
- NIST. “AI Risk Management Framework (AI RMF 1.0).” 2023. <https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf>
