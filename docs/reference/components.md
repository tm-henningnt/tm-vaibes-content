---
title: "Reference: MDX Components"
description: "Available MDX components (Tabs, Callout, CodeBlock) and usage snippets."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "PM"]
categories: ["reference"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/operations/vscode-setup-and-extensions.md"]
search_keywords: ["mdx", "components", "tabs", "callout", "codeblock"]
---

Tabs

```mdx
<Tabs items={["Node", "Python"]}>
  <Tab>Node content</Tab>
  <Tab>Python content</Tab>
</Tabs>
```

Callout

```mdx
<Callout type="info">Keep API keys server-side.</Callout>
```

CodeBlock

```mdx
<CodeBlock lang="ts">console.log('hello')</CodeBlock>
```

