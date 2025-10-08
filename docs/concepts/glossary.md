---
title: AI glossary
description: Concise definitions for common AI terms used throughout the hub.
audience_levels: [beginner]
personas: [non-technical, PM, developer, data-analyst]
categories: [concepts]
min_read_minutes: 9
last_reviewed: 2025-03-15
related: ["/docs/concepts/what-is-genai.md", "/docs/concepts/prompting-styles.md", "/docs/concepts/structured-outputs.md"]
search_keywords: ["glossary", "definitions", "ai terms", "genai"]
show_toc: true
---

## Summary
This glossary gives concise, plain-language explanations for the AI terms you will encounter across the learning hub. Each entry includes a short definition, why the concept matters, and where to learn more. Bookmark this page and link to it from onboarding materials or team wikis.

### You'll learn
- Definitions for foundational AI and machine learning terms.
- Why each concept matters in product and engineering contexts.
- Where to dive deeper with cross-links to other hub articles or official docs.

## How to use this glossary
- **Scan alphabetically** to clarify jargon as you read other guides.
- **Follow the “See also” links** to deepen your understanding of related concepts.
- **Share entries** with stakeholders to build a common vocabulary before launching AI projects.

## Terms A–C
- **Agent**: A system that can decide its next action autonomously using tools or memory. Often orchestrates multiple model calls; see [/docs/concepts/genai-vs-agentic.md](/docs/concepts/genai-vs-agentic.md) for comparisons.
- **Alignment**: Techniques that keep model outputs consistent with human intent and safety policies. Includes supervised fine-tuning and reinforcement learning from human feedback (RLHF).
- **API latency**: Time from sending a request to receiving the first meaningful token. Critical for user experience in chat and voice assistants.
- **Attention**: Mechanism in transformer models that weighs relationships between tokens to generate context-aware outputs.
- **Batch processing**: Handling multiple inputs together for efficiency; common in evaluations or bulk content generation workflows.
- **Chain-of-thought prompting**: Asking models to reason step-by-step; see [/docs/concepts/prompting-styles.md](/docs/concepts/prompting-styles.md).
- **Context window**: Maximum number of tokens a model can process in a single request. Manage long conversations with truncation or summarization.
- **Cost controls**: Techniques for limiting spend, such as token caps, routing, and caching; see [/docs/patterns/cost-controls.md](/docs/patterns/cost-controls.md).
- **Cumulative token count**: Total tokens exchanged in a conversation; track this to avoid exceeding context windows and budgets.

## Terms D–H
- **Data leakage**: Accidental exposure of sensitive information in prompts or model outputs. Mitigate with redaction and access controls.
- **Determinism**: Repeatability of model outputs; influenced by temperature and random seeds.
- **Embedding**: Vector representation of text or other media used for similarity search; core to retrieval-augmented generation (RAG).
- **Eval harness**: Automated suite that measures quality, safety, and latency across prompts or datasets.
- **Few-shot prompt**: Prompt that includes labeled examples to guide model behavior without fine-tuning.
- **Fine-tuning**: Updating model weights on task-specific data to improve performance.
- **Grounding**: Supplying authoritative data (search results, documents, APIs) so the model references real facts.
- **Hallucination**: Confident but incorrect output; reduce with grounding, validation, and evals.

## Terms I–P
- **Inference**: The act of generating outputs from a trained model. Includes both online (real-time) and batch scenarios.
- **Instruction prompt**: Direct request telling the model what to do, often paired with format constraints.
- **JSON schema**: Contract describing fields and types for structured outputs; helps validate model responses.
- **Latency budget**: Maximum response time tolerated by your experience; allocate slices to each step of the pipeline.
- **Model card**: Document describing a model’s capabilities, limitations, and ethical considerations.
- **Observation**: In agentic workflows, the response received after executing a tool call.
- **Prompt template**: Reusable scaffold containing instructions, variables, and guardrails for model calls.
- **Provisioned throughput**: Reserved capacity that guarantees latency and rate limits in managed services such as Azure OpenAI.<sup>1</sup>

## Terms Q–Z
- **Retrieval-Augmented Generation (RAG)**: Pattern that grounds model outputs using retrieved documents; see [/docs/patterns/rag/faq-rag.md](/docs/patterns/rag/faq-rag.md).
- **Safety filter**: Layer that blocks or flags harmful inputs/outputs before they reach users; learn the basics in [/docs/concepts/safety-basics.md](/docs/concepts/safety-basics.md).
- **Sampling**: Process of selecting the next token based on probabilities; controlled by temperature and top-p/top-k settings.
- **System prompt**: Hidden instructions that establish model persona, scope, and guardrails for the entire session.
- **Temperature**: Controls randomness in sampling; lower values yield deterministic outputs, higher values encourage exploration.
- **Tool call**: Structured request an agent sends to an external system to fetch data or take action.
- **Token**: Smallest unit processed by LLMs; see [/docs/concepts/token-costs-latency.md](/docs/concepts/token-costs-latency.md) for cost tradeoffs.
- **Trace**: Detailed log of prompts, responses, and tool calls used to debug and evaluate AI workflows.
- **Validation**: Checks that ensure outputs satisfy formatting, safety, or business rules before release.
- **Voice activity detection (VAD)**: Signal processing step that detects when to start or stop streaming audio in voice assistants.

## References
1. Microsoft Learn. “Provisioned throughput in Azure OpenAI Service.” Accessed March 15, 2025. https://learn.microsoft.com/azure/ai-services/openai/how-to/provisioned-throughput
2. Anthropic. “Responsible Scaling Policy.” Accessed March 15, 2025. https://www.anthropic.com/news/responsible-scaling-policy
3. OpenAI. “Safety best practices.” Accessed March 15, 2025. https://platform.openai.com/docs/guides/safety-best-practices

