---
title: "Example: Meeting summarizer"
description: "Generate structured minutes, decisions, and action items with traceable context."
audience_levels: ["beginner", "intermediate"]
personas: ["PM", "developer", "data-analyst"]
categories: ["examples"]
min_read_minutes: 11
last_reviewed: 2025-02-14
related: ["/docs/concepts/structured-outputs.md", "/docs/examples/content-drafter.md", "/docs/evaluations/tool-use-evals.md"]
search_keywords: ["meeting", "summary", "actions", "owner", "transcript"]
show_toc: true
---

## Why this workflow matters
Meetings produce commitments that quickly vanish. A summarizer that emits structured JSON lets product managers sync action items into task trackers while keeping provenance. It works for board reviews, sprint planning, or customer calls where consistency is critical.

### You’ll learn
- How to structure meeting notes into summary, decisions, risks, and next steps.
- How to map transcripts to JSON using OpenAI or Anthropic models.
- How to capture citations and timestamps for transparency.
- How to evaluate recall and precision on action items.

## Prompt spec
- **Intent**: Convert a raw transcript (or notes) into structured minutes.
- **Inputs**: Transcript text, meeting metadata (title, date, attendees), required sections (decisions, risks, open questions).
- **Outputs**: JSON with `summary`, `decisions`, `actions`, `risks`, each array containing `source_excerpt` or timestamp references.
- **Constraints**: Limit to top three decisions and five actions; include `confidence` (0–1). When missing info, populate `notes` with clarification requests.
- **Risks**: Misattributed speakers, hallucinated tasks, date formatting errors. Mitigate with speaker normalization and validation on due dates.
- **Eval hooks**: Compare generated actions vs. human-curated list; compute precision/recall and lateness of due dates.

## JSON contract

```json
{
  "summary": "Top-line takeaways in ≤120 words.",
  "decisions": [
    { "statement": "Decision text", "owner": "Name", "timestamp": "00:12:14" }
  ],
  "actions": [
    {
      "task": "Action item",
      "owner": "Name",
      "due": "2025-02-21",
      "timestamp": "00:14:32",
      "confidence": 0.8
    }
  ],
  "risks": [
    { "description": "Risk text", "mitigation": "Mitigation", "timestamp": "00:18:04" }
  ],
  "notes": ["Request clarification from finance on budget delta."]
}
```

## Node.js implementation

```ts
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const MinutesSchema = z.object({
  summary: z.string().max(600),
  decisions: z
    .array(
      z.object({
        statement: z.string(),
        owner: z.string().optional(),
        timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/)
      })
    )
    .max(3),
  actions: z
    .array(
      z.object({
        task: z.string(),
        owner: z.string(),
        due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
        confidence: z.number().min(0).max(1)
      })
    )
    .max(5),
  risks: z
    .array(
      z.object({
        description: z.string(),
        mitigation: z.string().optional(),
        timestamp: z.string().regex(/^\d{2}:\d{2}:\d{2}$/)
      })
    )
    .max(5),
  notes: z.array(z.string()).max(5)
});

export async function summarizeMeeting(transcript: string, metadata: {
  title: string;
  date: string;
  attendees: string[];
}) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You create structured meeting minutes. Do not invent attendees. Cite timestamps in hh:mm:ss format."
      },
      {
        role: "user",
        content: `Meeting: ${metadata.title}\nDate: ${metadata.date}\nAttendees: ${metadata.attendees.join(", ")}\nTranscript:${transcript}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "meeting_minutes", schema: MinutesSchema.toJSON() }
    },
    temperature: 0.2,
    max_output_tokens: 900
  });

  const parsed = MinutesSchema.safeParse(JSON.parse(response.output_text));
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
```

## Python implementation

```python
from typing import List, Dict
from openai import OpenAI
from pydantic import BaseModel, Field

client = OpenAI()

class Decision(BaseModel):
    statement: str
    owner: str | None = None
    timestamp: str = Field(pattern=r"^\d{2}:\d{2}:\d{2}$")

class Action(BaseModel):
    task: str
    owner: str
    due: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    timestamp: str = Field(pattern=r"^\d{2}:\d{2}:\d{2}$")
    confidence: float = Field(ge=0, le=1)

class Risk(BaseModel):
    description: str
    mitigation: str | None = None
    timestamp: str = Field(pattern=r"^\d{2}:\d{2}:\d{2}$")

class Minutes(BaseModel):
    summary: str = Field(max_length=600)
    decisions: List[Decision] = Field(max_items=3, default_factory=list)
    actions: List[Action] = Field(max_items=5, default_factory=list)
    risks: List[Risk] = Field(max_items=5, default_factory=list)
    notes: List[str] = Field(max_items=5, default_factory=list)


def summarize(transcript: str, metadata: Dict[str, str]) -> Minutes:
    prompt = (
        "You are an operations chief of staff. Create structured minutes with timestamps.\n"
        f"Meeting: {metadata['title']} on {metadata['date']}\n"
        f"Attendees: {metadata['attendees']}\n"
        f"Transcript: {transcript}"
    )

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
        temperature=0.2,
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "minutes", "schema": Minutes.model_json_schema()},
        },
        max_output_tokens=900,
    )

    return Minutes.model_validate_json(response.output[0].content[0].text)
```

## Tooling integration
- Push parsed actions into task trackers (Jira, Linear) via webhook workers.
- Sync notes to a shared document and attach the raw transcript for reference.
- Store schema version and input metadata in your observability stack (e.g., Honeycomb, Datadog).

## Evaluation plan
1. Label 20 transcripts with gold summaries and actions.
2. Compute action item precision/recall; require ≥0.8 precision before automation.
3. Track average latency; budgets are typically ≤ 8 seconds for 10k-token transcripts (use streaming input chunks if slower).
4. Measure reviewer edits per action item to detect hallucinations or missing timestamps.

## References
- [OpenAI: Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) — enforce JSON with schema validation.【F:docs/examples/meeting-summarizer.md†L191-L192】
- [Anthropic: Tool use guide](https://docs.anthropic.com/en/docs/tool-use/overview) — configure Claude meeting assistants with structured outputs.【F:docs/examples/meeting-summarizer.md†L192-L193】
- [Microsoft 365: Meeting capture best practices](https://learn.microsoft.com/en-us/microsoftteams/best-practices-meetings) — human workflows to mirror in prompts.【F:docs/examples/meeting-summarizer.md†L193-L194】

## Cross-links
- Structured JSON patterns: [/docs/concepts/structured-outputs.md](/docs/concepts/structured-outputs.md)
- Content drafting: [/docs/examples/content-drafter.md](/docs/examples/content-drafter.md)
- Safety checklist: [/docs/concepts/safety-basics.md](/docs/concepts/safety-basics.md)
- Evaluation rubrics: [/docs/evaluations/rubric-prompts.md](/docs/evaluations/rubric-prompts.md)
