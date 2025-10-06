---
title: "Reference: Project Type Registry Schema"
description: "Fields and validation rules for the wizard's project type registry."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["reference"]
tags: ["schema", "registry", "wizard"]
min_read_minutes: 10
last_reviewed: 2025-10-06
related: []
search_keywords: []
show_toc: true
---

## Overview
The registry is versioned JSON with `published`, `visibility`, `intake`, `assistant`, `outputs`, and `defaults`.

```json
{
  "version": "2025.10.0",
  "types": [ /* ... */ ]
}
```
