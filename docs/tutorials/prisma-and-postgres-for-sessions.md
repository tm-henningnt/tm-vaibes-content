---
title: "Tutorial: Prisma + Postgres for Sessions"
description: "Model session storage with Prisma, run migrations, and support rollbacks."
audience_levels: ["intermediate"]
personas: ["developer"]
categories: ["tutorials"]
min_read_minutes: 12
last_reviewed: 2025-10-06
related: ["/docs/reference/session-record-schema.md"]
search_keywords: ["prisma", "postgres", "sessions", "migrations", "rollback"]
---

Schema

```prisma
model Session {
  id         String   @id @default(cuid())
  userId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  // minimal audit
  model      String
  tokensIn   Int
  tokensOut  Int
}
```

Commands

```bash
npx prisma init
npx prisma migrate dev --name init_sessions
npx prisma migrate deploy
```

Rollback

- Create a new migration to alter or drop fields; deploy with care in prod.

