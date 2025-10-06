---
title: "Troubleshooting Auth Errors (Entra/NextAuth)"
description: "Decode redirect URI, consent, and audience errors when using Azure AD with NextAuth."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "admin"]
categories: ["troubleshooting", "how-to"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/operations/entra-sign-in-flow.md", "/docs/operations/nextauth-azuread.md"]
search_keywords: ["redirect uri", "consent", "audience", "azure ad", "entra", "nextauth"]
---

Common issues

- Redirect URI mismatch → ensure exact match in Entra and app.
- Needs admin approval → tenant policy requires admin consent; coordinate with admin.
- Invalid audience (aud) → verify the app’s client ID and tenant match the configuration.

Checks

- Confirm `NEXTAUTH_URL` and provider callback path.
- Ensure ID tokens are enabled in Entra app settings.
- If using roles, app roles must be defined and assigned.

