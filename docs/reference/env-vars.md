---
title: "Reference: Environment Variables (.env.example)"
description: "Environment-specific values for identity, providers, data, and revalidation."
audience_levels: ["intermediate"]
personas: ["developer", "admin"]
categories: ["reference"]
tags: ["env", "secrets", "config"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

```
# Identity
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_TENANT_ID=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=

# Data
POSTGRES_URL=

# Docs repo
DOCS_RAW_BASE_URL=https://raw.githubusercontent.com/<org>/<repo>/<branch>
DOCS_BRANCH=main
DOCS_PATH=/docs

# ISR/Revalidation
ISR_TOKEN=
```
