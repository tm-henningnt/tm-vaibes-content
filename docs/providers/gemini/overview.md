---
title: Google Gemini overview
description: Understand Gemini model capabilities, authentication, multimodal workflows, and structured output patterns so you can ship production-ready integrations on Google AI Studio or Vertex AI.
audience_levels: [beginner, intermediate, advanced]
personas: [developer, PM, data-analyst]
categories: [providers]
min_read_minutes: 13
last_reviewed: 2025-02-17
related:
  [
    "/docs/providers/compare-providers.md",
    "/docs/patterns/rag/basics.md",
    "/docs/concepts/structured-outputs.md",
    "/docs/tutorials/analytics-assistants-qlik-powerbi.md"
  ]
search_keywords:
  [
    "google gemini setup",
    "gemini function calling",
    "gemini multimodal",
    "google ai studio api",
    "vertex ai vs gemini"
  ]
show_toc: true
---

## Gemini at a glance
Gemini is Google DeepMind’s multimodal model family supporting text, image, and video inputs with strong reasoning capabilities. You can access Gemini via Google AI Studio (serverless API key) or Vertex AI (Google Cloud project with IAM). The API exposes flexible prompting modes, tool calling, and native safety settings. This page summarizes model options, setup steps, and production guardrails.

### You’ll learn
- How to provision API keys in Google AI Studio or enable Vertex AI for enterprise workloads
- Differences among Gemini 1.5 Pro, 1.5 Flash, and 2.0 Flash, including context windows and pricing
- How to stream responses and call functions from Node.js and Python SDKs
- How to send multimodal prompts and structured output requests safely
- Troubleshooting tips for quota limits, blocked content, and SDK mismatches

## Account setup

1. **Choose an access path.** Use [Google AI Studio](https://makersuite.google.com/app/apikey) for rapid prototyping with API keys, or enable Gemini in [Vertex AI](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini) for enterprise features (VPC networking, IAM, monitoring).
2. **Create credentials.**
   - AI Studio: generate an API key and restrict it by HTTP referrer or IP.
   - Vertex AI: create a service account with the `Vertex AI User` role and use Application Default Credentials or workload identity.
3. **Install SDKs.**
   - Node.js: `npm install @google/generative-ai`.
   - Python: `pip install google-generativeai` or use the Vertex AI Python client for managed endpoints.
4. **Review quotas.** Each key has per-minute request and token limits; request higher quotas via the Google Cloud console.

## Model catalog

| Model | Context window | Modality | Best for | Notes |
| --- | --- | --- | --- | --- |
| Gemini 2.0 Flash | 1M tokens (input), ~8K tokens (output) | Text, image, code | Fast generation with tool calling and JSON mode | Great default for chat apps; low latency. |
| Gemini 1.5 Pro | 2M tokens (input) | Text, image, audio, video | Complex reasoning, long documents, multimodal synthesis | Higher latency and cost; supports explicit function calling. |
| Gemini 1.5 Flash | 1M tokens (input) | Text, image | Lightweight summarization, UI assistants, real-time streaming | Cost-effective; slightly reduced reasoning compared with Pro. |

> **Tip:** Use Flash for interactive UX and escalate to Pro when accuracy or context length demands it.

## Node.js quickstart

```ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const client = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY! });
const model = client.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,
    maxOutputTokens: 512,
  },
  systemInstruction: "Return concise JSON with answer and supporting sources.",
  toolConfig: {
    functionDeclarations: [
      {
        name: "lookup_article",
        description: "Return citation metadata by ID",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
          },
          required: ["id"],
        },
      },
    ],
  },
});

export async function runGemini(prompt: string) {
  const response = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: prompt }] },
    ],
    tools: model.toolConfig?.functionDeclarations,
  });

  if (response.response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
    const call = response.response.candidates[0].content.parts[0].functionCall;
    // call.name === "lookup_article"; call.args contains JSON string
  }

  return response.response.text();
}
```

- `responseMimeType: "application/json"` tells Gemini to emit JSON without Markdown wrappers.
- Tool calls appear as `functionCall` parts; respond with `functionResponse` parts to continue the conversation.
- Use `generateContentStream` for low-latency streaming tokens.

## Python quickstart with multimodal input

```python
import os
import google.generativeai as genai
from pydantic import BaseModel, ValidationError

class Summary(BaseModel):
    headline: str
    key_points: list[str]

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config={
        "temperature": 0.2,
        "max_output_tokens": 512,
        "response_mime_type": "application/json",
    },
)

def summarize_slide(text: str, image_bytes: bytes) -> Summary:
    response = model.generate_content([
        {"role": "user", "parts": [
            {"text": text},
            {"inline_data": {"mime_type": "image/png", "data": image_bytes}},
        ]}
    ])

    payload = response.text
    try:
        return Summary.model_validate_json(payload)
    except ValidationError as err:
        raise ValueError(f"Invalid JSON: {err}") from err
```

- Gemini accepts inline base64 images via `inline_data` or remote URLs via `file_data`.
- The SDK returns raw text; use `response.parts` when you need tool call metadata.
- Vertex AI’s Python client (`google-cloud-aiplatform`) uses similar parameters but with region-specific endpoints.

## Function calling workflow

```ts
const toolResponse = await model.generateContent({
  contents: [
    { role: "user", parts: [{ text: "Find the latest SOC 2 report for product ABC" }] },
  ],
  tools: model.toolConfig?.functionDeclarations,
});

const call = toolResponse.response.candidates?.[0]?.content?.parts?.find(
  (part) => part.functionCall,
)?.functionCall;

if (call) {
  const args = call.args as { id: string };
  const result = await fetchCitation(args.id);

  const followUp = await model.generateContent({
    contents: [
      ...toolResponse.response.candidates![0].content.parts,
      {
        role: "tool",
        parts: [{
          functionResponse: {
            name: call.name!,
            response: { citations: result },
          },
        }],
      },
    ],
  });
}
```

- Keep tool responses short; Gemini enforces a 64 KB limit on JSON payloads.
- When running on Vertex AI, tool definitions live inside the `tools` array on each request.

## Safety and compliance

- **Safety settings:** Configure categories (harassment, hate, self-harm) with thresholds per request. Lower thresholds yield more aggressive blocking.
- **Data governance:** AI Studio requests may be used to improve Google services unless you opt out; Vertex AI honors enterprise data residency and retention controls.
- **Logging:** Record `response.candidates[0].safetyRatings` for analytics and incident review.

## Troubleshooting

- **403 Forbidden:** Ensure the API key is allowed for the requested model and region. Vertex AI requires the `generativelanguage.models.generate` permission.
- **429 Resource exhausted:** Reduce request frequency or batch prompts. Check quotas in the Google Cloud console.
- **InvalidArgument:** Occurs when prompts exceed the context window or when JSON is malformed. Trim input, compress images, or split workflows.
- **Blocked outputs:** Inspect `safetyRatings` to understand which policy triggered the block; adjust prompts or escalate to human review.

## Where to go next

- `/docs/providers/compare-providers.md` — evaluate Gemini against OpenAI and Claude.
- `/docs/patterns/rag/basics.md` — pair Gemini with retrieval for grounded responses.
- `/docs/concepts/structured-outputs.md` — design validators for JSON outputs.
- `/docs/tutorials/analytics-assistants-qlik-powerbi.md` — apply Gemini to business intelligence scenarios.

## References

- Google AI Studio. “Gemini API quickstart.” 2024. <https://ai.google.dev/gemini-api/docs/quickstart>
- Google AI Studio. “Function calling with the Gemini API.” 2024. <https://ai.google.dev/gemini-api/docs/function-calling>
- Google Cloud. “Gemini model reference.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini>
- Google Cloud. “Safety guidance for Gemini.” 2024. <https://cloud.google.com/vertex-ai/docs/generative-ai/models/safety>
