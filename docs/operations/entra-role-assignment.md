---
title: "Microsoft Entra Role Assignment"
description: "Assign application roles like User and Admin, and verify they flow to your app."
audience_levels: ["intermediate"]
personas: ["admin"]
categories: ["operations", "how-to"]
min_read_minutes: 5
last_reviewed: 2025-10-06
related: ["/docs/operations/entra-sign-in-flow.md", "/docs/operations/nextauth-azuread.md"]
search_keywords: ["entra roles", "app roles", "azure ad", "claims"]
---

Define roles

- In App registrations → Your app → App roles: add roles (e.g., `User`, `Admin`) with values and descriptions.
- Enable assignment required for users and groups as needed.

Assign roles

- Enterprise applications → Your app → Users and groups → Add user/group → select role.

Verify

- Sign in and inspect the ID token’s `roles` claim.
- In your app, map roles to permissions or UI flags.

Troubleshooting

- Missing `roles` claim → ensure roles are defined on the app and assigned to the user/group.
- Changes not visible → tokens may be cached; sign out and sign in again.
Beginner notes

- Roles are defined on the app registration, not in your code. After defining, you still need to assign them to users/groups via Enterprise applications.

FAQ

- Can I assign roles to groups? Yes—assign to Entra groups, then manage membership there.
- Where do roles appear in NextAuth? Typically in the ID token’s `roles` claim; map them in the JWT/session callbacks.
