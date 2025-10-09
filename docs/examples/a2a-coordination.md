---
title: "Example: Agent-to-agent coordination"
description: "Orchestrate a planner and executor agent that collaborate on QA tasks with budgets, confidence scoring, and human handoffs."
audience_levels:
  - intermediate
  - advanced
personas:
  - developer
  - PM
categories:
  - examples
min_read_minutes: 13
last_reviewed: 2025-02-17
related:
  - /docs/patterns/agentic/planner-executor.md
  - /docs/patterns/agentic/reflection-self-heal.md
  - /docs/patterns/observability-context.md
  - /docs/concepts/agents-vs-automation.md
search_keywords:
  - multi-agent
  - planner executor
  - agent coordination
  - budgeted agents
  - self-heal loop
show_toc: true
---

## Summary
This example demonstrates two agents working together: a planner that breaks down quality assurance tasks and an executor that performs each step with structured outputs. The system enforces budgets, records confidence, and escalates to humans when scores fall below thresholds.

### You’ll learn
- How to define roles, contracts, and shared context for agent-to-agent collaboration
- How to exchange messages between planner and executor while enforcing cost and time budgets
- How to observe intermediate reasoning with traces and metrics
- How to evaluate success using acceptance tests and human review loops
- How to adapt the pattern for documentation review, code fixes, or customer email QA

## Scenario
You operate a content QA pipeline where marketing drafts must be checked for brand tone, compliance phrases, and broken links before publication. A planner agent decomposes the review into steps, and an executor agent handles each step, reporting metrics. If any step fails or confidence drops, the system sends the draft to a human editor.

## Roles and responsibilities

| Agent | Responsibilities | Inputs | Outputs |
| --- | --- | --- | --- |
| **Planner** | Analyze task brief, create ordered checklist, assign budgets, request retries. | Draft content, policy checklist, SLA budgets. | Plan JSON (steps, goals, max attempts, required confidence). |
| **Executor** | Execute individual steps, produce evidence, update status, raise blockers. | Step description, draft segment, remaining budget. | Execution JSON (status, confidence, notes, artifacts). |

Shared context includes request metadata (owner, due date), compliance lexicon, and analytics for runtime budgets.

## Interaction loop

```mermaid
sequenceDiagram
    participant Req as Request intake
    participant Plan as Planner agent
    participant Exec as Executor agent
    participant Log as Observability store
    participant Human as Editor on-call

    Req->>Plan: Draft + policy checklist
    Plan->>Log: Save plan (steps, budgets)
    loop Each step
        Plan->>Exec: Step payload + remaining budget
        Exec-->>Plan: Status + confidence + evidence
        Plan->>Log: Append transcript & metrics
        alt Confidence < threshold or status == "failed"
            Plan->>Human: Escalate with transcript
            break
        else Needs iteration
            Plan->>Exec: Refined instructions
        end
    end
    Plan->>Req: Final QA report
    Log-->>Human: Metrics dashboard
```

## Data contracts

### Plan schema

```json
{
  "plan_id": "uuid",
  "steps": [
    {
      "id": "tone-check",
      "goal": "Verify tone matches brand voice",
      "context": "Use /docs/brand/tone.md",
      "max_attempts": 2,
      "min_confidence": 0.7,
      "time_budget_sec": 45
    }
  ],
  "overall_budget": {
    "max_attempts": 6,
    "max_tokens": 6000,
    "time_budget_sec": 240
  }
}
```

### Execution schema

```json
{
  "step_id": "tone-check",
  "status": "passed|failed|blocked",
  "confidence": 0.82,
  "notes": "Tone matches style guide but lacks CTA.",
  "evidence": [
    { "type": "quote", "content": "Excerpt with adjustments" },
    { "type": "link", "content": "https://link-checker/report/123" }
  ],
  "tokens_used": 620,
  "elapsed_ms": 2800,
  "next_action": "continue|revise|escalate"
}
```

## Implementation sketch

### Planner (TypeScript)
```ts
import OpenAI from "openai";
import { v4 as uuid } from "uuid";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePlan(draft: string, checklist: string[]) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are a QA planner. Produce a JSON plan with steps, budgets, and confidence thresholds."
      },
      {
        role: "user",
        content: `Draft content:\\n${draft}\\n\\nChecklist:\\n${checklist.join("\\n")}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "qa_plan",
        schema: {
          type: "object",
          required: ["steps", "overall_budget"],
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "goal", "max_attempts", "min_confidence", "time_budget_sec"],
                properties: {
                  id: { type: "string" },
                  goal: { type: "string" },
                  context: { type: "string" },
                  max_attempts: { type: "integer", minimum: 1, maximum: 5 },
                  min_confidence: { type: "number", minimum: 0, maximum: 1 },
                  time_budget_sec: { type: "integer", minimum: 10, maximum: 600 }
                }
              }
            },
            overall_budget: {
              type: "object",
              required: ["max_attempts", "max_tokens", "time_budget_sec"],
              properties: {
                max_attempts: { type: "integer", minimum: 1, maximum: 10 },
                max_tokens: { type: "integer", minimum: 1000, maximum: 12000 },
                time_budget_sec: { type: "integer", minimum: 60, maximum: 900 }
              }
            }
          }
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Plan generation failed");
  const plan = JSON.parse(content);
  plan.plan_id = uuid();
  return { plan, usage: response.usage };
}
```

### Executor (Python)
```python
import json
import time
from typing import Any, Dict

from anthropic import Anthropic

client = Anthropic()

EXECUTION_SCHEMA = {
    "type": "object",
    "required": ["status", "confidence", "notes", "evidence", "next_action"],
    "properties": {
        "status": {"type": "string", "enum": ["passed", "failed", "blocked"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "notes": {"type": "string"},
        "evidence": {"type": "array", "items": {"type": "object"}},
        "next_action": {"type": "string", "enum": ["continue", "revise", "escalate"]},
        "tokens_used": {"type": "integer"},
        "elapsed_ms": {"type": "integer"},
    },
}


def execute_step(step: Dict[str, Any], draft: str) -> Dict[str, Any]:
    started = time.perf_counter()
    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_output_tokens=600,
        temperature=0.2,
        system="You are a QA executor. Follow the plan strictly and report JSON.",
        messages=[
            {
                "role": "user",
                "content": (
                    f"Step ID: {step['id']}\\nGoal: {step['goal']}\\nContext: {step.get('context', 'none')}\\n"
                    f"Remaining attempts: {step['max_attempts']}\\nDraft:\\n{draft}"
                ),
            }
        ],
        response_format={"type": "json_schema", "json_schema": {"name": "qa_execution", "schema": EXECUTION_SCHEMA}},
    )

    content = response.content[0]
    if content.type != "text":
        raise RuntimeError("Executor returned non-text content")

    payload = json.loads(content.text)
    payload["tokens_used"] = response.usage.output_tokens
    payload["elapsed_ms"] = int((time.perf_counter() - started) * 1000)
    payload["step_id"] = step["id"]
    return payload
```

## Metrics and observability

- **Budgets.** Track tokens, attempts, and elapsed time per step versus the plan. Alert when totals exceed budgets.
- **Confidence trends.** Chart confidence scores by step to spot regressions. Investigate low scores with `/docs/patterns/observability-context.md` traces.
- **Escalations.** Measure escalation rate and mean time to human response. Use this to adjust thresholds.
- **Agreement with humans.** Compare final QA report to editor decisions weekly to ensure the system remains trustworthy.

## Evaluation approach

1. **Dataset assembly.** Collect 100 historical drafts with human QA decisions (pass/fail reasons). Annotate expected steps and outcomes.
2. **Offline replay.** Run the planner/executor on the dataset, scoring step-level accuracy, plan completeness, and total cost.
3. **Rubric scoring.** Use `/docs/evaluations/rubric-prompts.md` to score clarity of the final QA report.
4. **Canary rollout.** Enable for low-risk content with human review. Compare throughput, error rates, and human overrides for two weeks.

## Extensions

- Add a **reflection agent** that reviews executor outputs and proposes improvements before finalizing.
- Integrate a **link checker tool** or fact checker as additional tool calls.
- Use `/docs/concepts/caching-and-retries.md` strategies to reuse evaluations for unchanged drafts.

## References

- Anthropic. “Build with Claude agentic workflows.” (2024). <https://docs.anthropic.com/en/docs/build-with-claude/agentic-workflows>
- LangChain. “Plan-and-execute agents.” (2023). <https://python.langchain.com/docs/modules/agents/agent_types/plan_and_execute>
- OpenAI. “Function calling and tool use.” (2024). <https://platform.openai.com/docs/guides/function-calling>
