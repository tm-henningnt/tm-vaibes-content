---
title: "Content Sync Deep Dive (ISR, Revalidation, ETags)"
description: "How our site pulls new docs using ISR, on-demand revalidation, and HTTP validators."
audience_levels: ["intermediate", "advanced"]
personas: ["developer", "admin"]
categories: ["operations", "reference"]
min_read_minutes: 9
last_reviewed: 2025-10-06
related: ["/docs/operations/env-and-healthcheck.md", "/docs/operations/admin-dashboard.md", "/docs/troubleshooting/revalidation-failures.md"]
search_keywords: ["ISR", "revalidate", "ETag", "If-None-Match", "webhooks"]
---

Model

- Pages pre-render with fallback and revalidate periodically (ISR).
- GitHub webhook triggers on-demand revalidation for faster updates.
- Fetches use `If-None-Match` with ETags to avoid unnecessary downloads.

On-demand route (example)

```ts
// app/api/revalidate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    // Revalidate specific paths or a tag
    // await revalidatePath('/docs');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

Conditional fetch (ETag)

```ts
async function fetchWithETag(url: string, etag?: string) {
  const res = await fetch(url, { headers: etag ? { 'If-None-Match': etag } : {} });
  if (res.status === 304) return { changed: false };
  return { changed: true, etag: res.headers.get('ETag') ?? undefined, body: await res.text() };
}
```

Dashboard signals

- Last manifest hash and fetch timestamp.
- Stale threshold (e.g., >30m) → yellow; webhook failures → red.

