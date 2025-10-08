---
title: "Example: Data quality QA assistant"
description: "Run read-only checks against databases and APIs, score issues, and surface false positives."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "data-analyst"]
categories: ["examples"]
min_read_minutes: 12
last_reviewed: 2025-02-14
related: ["/docs/concepts/structured-outputs.md", "/docs/patterns/tools/function-calling.md", "/docs/evaluations/tool-use-evals.md"]
search_keywords: ["data quality", "sql", "validation", "tool calling", "false positives"]
show_toc: true
---

## Why this pattern
Analytics teams want quick checks on newly landed data without granting write access. An AI data quality assistant can suggest targeted SQL probes, run read-only queries, and explain potential issues with confidence scores. It complements, not replaces, deterministic dbt tests by catching edge cases and unusual correlations.

### You’ll learn
- How to define safe tool interfaces for read-only SQL and metadata inspection.
- How to orchestrate hypothesis generation → query execution → analysis loops.
- How to log precision/recall for detected issues and manage false positives.
- How to extend checks to external APIs and schema registries.

## Prompt spec
- **Intent**: Diagnose anomalies in a dataset (missing values, outliers, referential gaps) using read-only tools.
- **Inputs**: Table schema, freshness metadata, known anomalies, tool descriptions, sampling limits.
- **Outputs**: JSON with `issues` (each containing severity, evidence query, impacted_rows, explanation), `metrics_checked`, and `next_steps`.
- **Constraints**: Only call whitelisted tools; enforce `LIMIT` clauses; include SQL comments referencing the originating prompt ID.
- **Risks**: Long-running queries, privacy leakage, hallucinated joins. Mitigate with guardrails that reject DDL/DML and force parameterized templates.
- **Eval hooks**: Track issue precision/recall using seeded anomalies; measure runtime and token consumption per check.

## Tool definitions

```ts
export const tools = [
  {
    name: "run_sql",
    description: "Execute read-only SQL with a 5,000 row cap.",
    input_schema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "SELECT query with LIMIT and no subqueries longer than 1,000 characters"
        },
        reason: { type: "string" }
      },
      required: ["sql", "reason"]
    },
    timeout_ms: 8000
  },
  {
    name: "get_column_stats",
    description: "Fetch precomputed null rates, min/max, and distinct counts.",
    input_schema: {
      type: "object",
      properties: {
        table: { type: "string" },
        column: { type: "string" }
      },
      required: ["table", "column"]
    },
    timeout_ms: 2000
  }
];
```

Guard the SQL runner with server-side checks (e.g., [pg-query-parser](https://github.com/pganalyze/pg_query)) to reject `INSERT`, `UPDATE`, or `DELETE` statements before execution.

## Node.js controller

```ts
import OpenAI from "openai";
import { createSqlTool, runToolCall, enforceReadOnly } from "./tools.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function diagnoseDataset(context) {
  const session = await client.responses.stream({
    model: "gpt-4.1-mini",
    input: buildMessages(context),
    tools,
    parallel_tool_calls: false,
    temperature: 0.1
  });

  const toolResults = [];
  for await (const event of session) {
    if (event.type === "response.output_text.delta") continue;
    if (event.type === "response.error") throw new Error(event.error.message);
    if (event.type === "response.tool_call") {
      const call = event;
      const tool = enforceReadOnly(call);
      const result = await runToolCall(tool, call);
      toolResults.push({
        name: call.name,
        args: call.arguments,
        result
      });
      await session.send({
        type: "tool_result",
        tool_call_id: call.id,
        output: JSON.stringify(result)
      });
    }
  }

  const final = session.final_response;
  const payload = JSON.parse(final.output_text);
  return { payload, toolResults };
}
```

## Python controller

```python
from typing import Dict, Any
import json
from openai import OpenAI

client = OpenAI()


def diagnose_dataset(context: Dict[str, Any]) -> Dict[str, Any]:
    response = client.responses.create(
        model="gpt-4.1-mini",
        input=build_messages(context),
        tools=TOOLS,
        parallel_tool_calls=False,
        temperature=0.1,
        max_output_tokens=600,
    )

    tool_results = []
    for item in response.output:
        if item.type == "tool_call_delta":
            continue
        if item.type == "tool_call":
            tool_name = item.tool_call.name
            args = item.tool_call.arguments
            result = run_tool(tool_name, args)
            tool_results.append({"name": tool_name, "args": args, "result": result})

    payload = json.loads(response.output[0].content[0].text)
    return {"payload": payload, "tool_results": tool_results}
```

Wrap `run_tool` with read-only enforcement similar to the Node version. Always log SQL text with hashed identifiers for auditing.

## Sample output

```json
{
  "issues": [
    {
      "id": "issue-001",
      "severity": "high",
      "pattern": "Null surge",
      "impacted_rows": 312,
      "evidence_query": "SELECT order_id FROM orders WHERE ship_date IS NULL LIMIT 200",
      "explanation": "Null rate jumped from 0.2% to 5.1% week-over-week.",
      "confidence": 0.82
    }
  ],
  "metrics_checked": [
    "orders.ship_date null rate",
    "orders total count"
  ],
  "next_steps": [
    "Escalate to fulfillment team",
    "Validate upstream ingestion job logs"
  ]
}
```

## Evaluation strategy
1. Seed synthetic anomalies (null spikes, duplicate IDs) using staging tables and ensure the assistant flags them.
2. Compute precision/recall of `issues` by comparing to labeled anomalies; target ≥0.7 precision to limit false escalations.
3. Track query runtime percentiles; abort runs above 6 seconds to keep analysts unblocked.
4. Log false-positive feedback from analysts and feed into prompt adjustments or tool heuristics.

## References
- [dbt Labs: Testing guide](https://docs.getdbt.com/docs/build/tests) — baseline deterministic checks to pair with LLM heuristics.【F:docs/examples/data-quality-qa.md†L176-L177】
- [OpenAI: Function calling](https://platform.openai.com/docs/guides/function-calling) — tool invocation patterns for reliable enforcement.【F:docs/examples/data-quality-qa.md†L177-L178】
- [PostgreSQL: GRANT reference](https://www.postgresql.org/docs/current/sql-grant.html) — configure read-only roles for tool execution.【F:docs/examples/data-quality-qa.md†L178-L179】

## Cross-links
- Tooling foundations: [/docs/patterns/tools/function-calling.md](/docs/patterns/tools/function-calling.md)
- Structured outputs: [/docs/concepts/structured-outputs.md](/docs/concepts/structured-outputs.md)
- Safety basics: [/docs/concepts/safety-basics.md](/docs/concepts/safety-basics.md)
- Evaluation templates: [/docs/evaluations/tool-use-evals.md](/docs/evaluations/tool-use-evals.md)
