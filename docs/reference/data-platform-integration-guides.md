---
title: "Reference: Data Platform Integration Guides"
description: "Index of integration notes for Microsoft Fabric, Snowflake, Databricks, and Qlik Cloud."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "data-analyst", "admin"]
categories: ["reference"]
min_read_minutes: 5
last_reviewed: 2025-10-06
related: ["/docs/evaluations/data-platform-benchmarks.md"]
search_keywords: ["fabric", "snowflake", "databricks", "qlik", "integration"]
---

Platforms

- Microsoft Fabric: OneLake/Lakehouse access patterns.
- Snowflake: Warehouses, Snowpark; read-only roles.
- Databricks: Unity Catalog, cluster policies.
- Qlik Cloud: data connections and app publishing.

Notes

- Prefer read-only credentials for evals and demos; log only metadata.

Connection tips

- Fabric: use service principals with scoped Lakehouse permissions.
- Snowflake: create least-privilege roles; warehouse sizing affects latency/cost.
- Databricks: enforce Unity Catalog access controls; prefer cluster policies.
- Qlik Cloud: manage connections via spaces; restrict app publish permissions.
