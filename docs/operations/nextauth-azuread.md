---
title: "NextAuth + Azure AD Setup"
description: "Wire up NextAuth with the Azure AD provider, configure callbacks, and map role claims."
audience_levels: ["intermediate"]
personas: ["developer"]
categories: ["operations", "how-to", "reference"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/operations/entra-sign-in-flow.md", "/docs/operations/entra-role-assignment.md"]
search_keywords: ["nextauth", "azure ad", "entra", "roles", "middleware"]
---

Environment

- `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

Config (App Router)

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!
    })
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // roles may come via `roles` or custom claim depending on app config
      const roles = (profile as any)?.roles || [];
      token.roles = roles;
      return token;
    },
    async session({ session, token }) {
      (session as any).roles = (token as any).roles || [];
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

Middleware example

```ts
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token)
  }
});

export const config = { matcher: ['/admin/:path*'] };
```

Troubleshooting

- Redirect URI mismatch: ensure callback URL matches in Entra and app config.
- Missing roles: confirm app roles are defined and assigned; claims mapping differs by tenant setup.

