---
title: "JS/TS Server Route: Safe Provider Calls"
description: "Implement a minimal server-only route that calls OpenAI safely with retries and no client-side keys."
audience_levels: ["beginner", "intermediate"]
personas: ["developer"]
categories: ["quickstarts", "how-to"]
min_read_minutes: 10
last_reviewed: 2025-10-06
related: ["/docs/quickstarts/try-genai-in-10-min.md", "/docs/providers/security-best-practices.md", "/docs/providers/openai/auth-models-limits.md"]
search_keywords: ["next.js api route", "express server", "openai node", "no client key", "rate limits"]
---

Overview

- Build a server route that proxies requests to OpenAI with your server-held key.
- Never put API keys in the browser or bundle.

Option A: Next.js App Router (recommended)

- File: `app/api/chat/route.ts`

```ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { userMessage } = await req.json();
  if (!userMessage || typeof userMessage !== 'string') {
    return NextResponse.json({ error: 'Missing userMessage' }, { status: 400 });
  }

  // Simple retry loop with capped attempts
  let attempt = 0, lastErr: unknown;
  while (attempt++ < 3) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise and friendly assistant.' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300
      });
      const text = completion.choices?.[0]?.message?.content ?? '';
      return NextResponse.json({ text });
    } catch (err) {
      lastErr = err;
      // 429/5xx backoff
      await new Promise(r => setTimeout(r, 300 * attempt));
    }
  }
  return NextResponse.json({ error: 'Upstream failed' }, { status: 502 });
}
```

Client call example

```ts
// strictly client-side: fetch your own server route
async function ask(question: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage: question })
  });
  if (!res.ok) throw new Error('Request failed');
  return (await res.json()).text as string;
}
```

Option B: Express

```ts
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { userMessage } = req.body ?? {};
  if (!userMessage) return res.status(400).json({ error: 'Missing userMessage' });
  try {
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a concise and friendly assistant.' },
        { role: 'user', content: userMessage }
      ]
    });
    res.json({ text: result.choices?.[0]?.message?.content ?? '' });
  } catch (e) {
    res.status(502).json({ error: 'Upstream failed' });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
```

Notes

- Do not ship `OPENAI_API_KEY` to the browser; keep it server-side.
- Add logging without including prompts/outputs if they contain sensitive data; prefer metadata.
- Handle 429 (rate limits) and provider transient 5xx with short backoff and caps.

References

- OpenAI Node SDK
---
