---
title: "Tool spec template"
description: "Define tool contracts with schemas, idempotency rules, and operational guardrails for LLM orchestration."
audience_levels: ["intermediate", "advanced"]
personas: ["developer"]
categories: ["patterns"]
min_read_minutes: 11
last_reviewed: 2025-03-18
related:
  [
    "/docs/patterns/tools/function-calling.md",
    "/docs/patterns/specs/prompt-spec-template.md",
    "/docs/patterns/agentic/router-multi-tool.md"
  ]
search_keywords:
  [
    "tool spec",
    "function calling",
    "schema",
    "idempotency",
    "timeouts"
  ]
show_toc: true
---

## Purpose of a tool spec

Tool specs turn opaque API calls into auditable contracts. They describe inputs, outputs, side effects, retries, and failure handling so LLM agents can invoke tools safely. A well-structured spec prevents duplicate tickets, enforces least privilege, and accelerates reviews with legal and compliance teams.

## Anatomy of a tool spec

| Section | Description |
| --- | --- |
| Overview | Business goal, owner, environments |
| Request schema | JSON Schema or protobuf definition, including defaults |
| Response schema | Fields returned to the model and downstream services |
| Idempotency | How duplicate calls are handled (keys, detection) |
| Preconditions | Auth, feature flags, rate limits |
| Timeouts & retries | Execution budget, retry policy |
| Error taxonomy | Enumerated error codes with handling guidance |
| Observability | Logged fields, metrics, trace IDs |
| Security | Data classification, masking rules |
| Change log | Version history |

## Example frontmatter

```yaml
id: tool.create_ticket
owner: incident-response@company.com
environments:
  - prod
  - staging
sla_ms: 5000
allowed_roles: ["agent", "manager"]
linked_prompts: ["prompt.incident-triage"]
```

## Request schema

```yaml
request:
  type: object
  required: [summary, priority]
  properties:
    summary:
      type: string
      minLength: 20
      maxLength: 280
    priority:
      type: string
      enum: ["P1", "P2", "P3"]
    attachments:
      type: array
      items:
        type: object
        properties:
          url: { type: string, format: uri }
          description: { type: string }
      maxItems: 5
```

Include validation snippets for server-side enforcement (e.g., Zod schema, Pydantic model). Reference the same schema when registering tools with OpenAI or Anthropic to keep definitions synchronized, as shown in the planner/executor example in [/docs/patterns/agentic/router-multi-tool.md](/docs/patterns/agentic/router-multi-tool.md).

## Response schema

Specify what the tool returns to the agent and to downstream services.

```yaml
response:
  type: object
  required: [ticket_id, status]
  properties:
    ticket_id: { type: string }
    status: { type: string, enum: ["created", "pending_approval"] }
    url: { type: string, format: uri }
    follow_up:
      type: object
      properties:
        requires_human: { type: boolean }
        notes: { type: string }
```

Document masking rules for sensitive data (e.g., replace full URLs with IDs before returning to the LLM).

## Idempotency and retries

- Define the idempotency key (e.g., `correlation_id` from router). Reject duplicate requests within a time window.
- Clarify retry policy: max attempts, backoff, which errors are retryable (timeouts, HTTP 429) vs. fatal (validation failure).
- Provide examples of duplicate detection to reassure reviewers that side effects won’t multiply.

## Preconditions and authorization

- Required credentials or OAuth scopes
- Feature flags or rollout states
- Allowed customer segments or environments
- Rate limits (per minute/hour) and the response when exceeded

Document how the tool validates caller identity and surfaces permission errors to the model (e.g., `error_code: FORBIDDEN` with instructions to escalate).

## Error taxonomy

| Code | Meaning | Model guidance |
| --- | --- | --- |
| `VALIDATION_ERROR` | Payload failed schema checks | Ask user for corrected input |
| `DEPENDENCY_DOWN` | Downstream system unavailable | Suggest human escalation |
| `TIMEOUT` | Execution exceeded SLA | Retry once, then offer fallback |
| `PERMISSION_DENIED` | User lacks access | Provide escalation path |

Include HTTP status codes (if applicable) and logging expectations for each error.

## Observability and governance

- Required log fields: `request_id`, `tool_name`, `latency_ms`, `status`, `retry_count`.
- Metrics: success rate, P95 latency, request volume per workspace.
- Alerts: error rate >5% over 5 minutes triggers on-call.
- Audit: store copies of executed payloads (with PII masked) for 30 days.

## Change management

Maintain a changelog with version, date, author, and summary. Require sign-off from owners and security when schemas change or new side effects are introduced.

```markdown
### Changelog
- 2025-02-17 — v2.0 — Added attachments field; increased timeout to 5s (J. Patel)
- 2024-12-01 — v1.4 — Added permission guard for managers only (R. Singh)
```

## References

- OpenAI. “Function calling.” 2024. <https://platform.openai.com/docs/guides/function-calling>
- Anthropic. “Tool use.” 2024. <https://docs.anthropic.com/en/docs/tool-use>
- ServiceNow. “Incident Management best practices.” 2023. <https://www.servicenow.com/products/itsm/what-is-incident-management.html>
