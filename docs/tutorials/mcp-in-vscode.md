---
title: "Tutorial: MCP in VS Code"
description: "Use Model Context Protocol servers in VS Code to connect tools securely; common setup and pitfalls."
audience_levels: ["intermediate", "advanced"]
personas: ["developer"]
categories: ["tutorials"]
min_read_minutes: 12
last_reviewed: 2025-10-06
related: ["/docs/patterns/tools/function-calling.md"]
search_keywords: ["mcp", "model context protocol", "vscode", "tools"]
---

Setup

- Install the VS Code extension supporting MCP; configure server endpoints and auth.
- Provide per‑tool scopes and timeouts.

Verify

- Run a sample tool server; confirm handshake, list tools, and execute a no‑op.

Pitfalls

- CORS and localhost tunneling; missing scopes; mismatched schemas.

