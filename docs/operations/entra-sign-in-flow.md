---
title: "Microsoft Entra Sign-In Flow"
description: "Click-path guide to enable sign-in with Microsoft Entra (Azure AD) including consent and role display."
audience_levels: ["beginner", "intermediate"]
personas: ["admin", "PM"]
categories: ["operations", "how-to"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/operations/entra-role-assignment.md", "/docs/operations/nextauth-azuread.md"]
search_keywords: ["entra", "azure ad", "sign-in", "consent", "login"]
---

Goal

- Enable “Sign in with Microsoft” and verify the account’s display name and role appear in-app.

Portal steps

- In Microsoft Entra admin center: App registrations → New registration → Name your app → Accounts in this organization.
- Redirect URIs: add your app callback (e.g., `https://yourapp.example.com/api/auth/callback/azure-ad` for NextAuth).
- Certificates & secrets: create a client secret; copy the value.
- Authentication: enable ID tokens.

Verify in app

- Test sign-in from a browser. On first run, consent prompts may appear depending on tenant policy.
- Confirm the app shows the user name/email. If using roles, ensure claims mapping is configured (see `/docs/operations/nextauth-azuread.md`).

Troubleshooting

- Redirect URI mismatch → update in both Entra and your app config.
- “Needs admin approval” → request tenant admin consent for the app.
Beginner checklist

- [ ] App registration created and correct tenant selected
- [ ] Redirect URI added exactly as used by your app
- [ ] Client secret created and stored securely
- [ ] ID tokens enabled
- [ ] Test user can sign in end-to-end

FAQ

- Can I use multiple redirect URIs? Yes—add separate URIs for local dev and production.
- Why do users see “admin approval required”? Your app requests permissions gated by tenant policy; an admin must approve.
