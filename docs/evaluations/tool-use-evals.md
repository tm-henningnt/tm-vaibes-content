---
title: Tool-use evaluations
description: Measure function-calling success, latency, and safety when models invoke tools in workflows.
audience_levels: [intermediate, advanced]
personas: [developer, PM]
categories: [evaluations]
min_read_minutes: 10
last_reviewed: 2025-03-16
related:
  [
    "/docs/patterns/tools/function-calling.md",
    "/docs/patterns/agentic/router-multi-tool.md",
    "/docs/evaluations/overview.md",
    "/docs/safety/human-in-the-loop.md"
  ]
search_keywords:
  [
    "tool evals",
    "function calling",
    "success rate",
    "tool latency",
    "agent reliability"
  ]
show_toc: true
---

## Verify tool-enabled agents before production

LLM agents succeed or fail based on how reliably they choose and execute tools. Tool-use evaluations quantify success rates, error types, and latency so you can ship integrations confidently. This guide shows how to design datasets, metrics, and automation for tool-heavy workflows.

### You’ll learn
- How to categorize tool outcomes (success, validation error, timeout, escalation)
- How to design synthetic and replayed traces for evaluation
- How to score arguments and outputs using schemas and rubric prompts
- How to visualize tool performance and route issues to owners
- References for provider guidance on function calling and tool monitoring

## Map the tool surface area

List each tool with purpose, inputs, outputs, and risk level.

| Tool | Purpose | Required inputs | Failure severity |
| --- | --- | --- | --- |
| `lookup_invoice` | Retrieve billing details | `invoice_id` | Medium — incorrect data leads to bad summaries |
| `create_ticket` | File support ticket | `subject`, `body`, `priority` | High — duplicates or wrong priority hurt SLAs |
| `send_email` | Email customer | `to`, `subject`, `body` | Critical — misfires impact trust |

Use this inventory to prioritize evaluation coverage and escalation paths in `/docs/safety/human-in-the-loop.md`.

## Build evaluation datasets

Combine two sources:

1. **Trace replays:** Capture real conversations where the agent called tools. Redact sensitive data. Store each step `{tool_name, arguments, output, status}`.
2. **Synthetic scenarios:** Write prompts that require specific tools (e.g., “Refund invoice 1234”) and expected outputs. These cover edge cases and new features.

Label each example with the intended tool and expected argument schema.

## Define metrics

- **Invocation accuracy:** `% of steps where the correct tool was selected`.
- **Argument validity:** `% of tool calls that pass schema validation`. Use JSON schema validators from `/docs/concepts/structured-outputs.md`.
- **Execution success:** `% of tool calls that return expected status (e.g., `200 OK`).`
- **Latency:** Median and P95 time between tool request and response.
- **Escalations:** Count of cases routed to human reviewers, indicating unclear automation boundaries.

## Automate scoring

```python
from jsonschema import validate, ValidationError


def evaluate_tool_call(step, schema, expected_tool):
    result = {
        "tool_correct": step["tool_name"] == expected_tool,
        "arguments_valid": False,
        "execution_success": step["status"] == "success",
        "latency_ms": step.get("latency_ms", 0),
        "errors": []
    }
    try:
        validate(step["arguments"], schema)
        result["arguments_valid"] = True
    except ValidationError as exc:
        result["errors"].append(str(exc))
    if step.get("status") == "error":
        result["errors"].append(step.get("error_code", "unknown"))
    return result
```

Aggregate metrics per tool and per workflow. Flag tools with low success or high latency for targeted debugging.

## Include qualitative scoring

Add rubric prompts to assess whether the model justified tool use or summarized results clearly for the user. A sample rubric may score `decision_quality` (was the tool necessary?) and `explanation_quality` (did the assistant describe the result?).

## Visualize and act

- Build dashboards showing success rate trends per tool.
- Alert when validation errors or timeouts exceed thresholds.
- Open tickets or trigger feature flags when critical tools dip below agreed benchmarks.
- Pair low scores with human review workflows to spot unhandled corner cases.

## References

- OpenAI. “Function calling and tool use.” 2024. <https://platform.openai.com/docs/guides/function-calling>
- Anthropic. “Claude tool use best practices.” 2024. <https://docs.anthropic.com/en/docs/build-with-claude/tool-use>
- LangSmith. “Evaluate agents with tool traces.” 2024. <https://docs.langchain.com/docs/integrations/monitoring/langsmith/agent-evals>
