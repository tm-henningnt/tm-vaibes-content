---
title: "VS Code Setup and Extensions"
description: "Recommended VS Code settings and extensions for editing Markdown/MDX and frontmatter."
audience_levels: ["beginner", "intermediate"]
personas: ["developer", "PM"]
categories: ["operations", "how-to"]
min_read_minutes: 6
last_reviewed: 2025-10-06
related: ["/docs/faq/vscode-and-extensions.md", "/docs/reference/components.md"]
search_keywords: ["vscode", "markdown", "mdx", "frontmatter", "spell check"]
---

Extensions (recommend)

- Markdown All in One
- YAML
- Front Matter (frontmatter editor/validation)
- Code Spell Checker
- MDX (syntax highlighting/preview)

Settings

```json
{
  "editor.wordWrap": "on",
  "files.trimTrailingWhitespace": true,
  "editor.renderWhitespace": "selection",
  "markdown.validate.enabled": true,
  "[markdown]": { "editor.defaultFormatter": "yzhang.markdown-all-in-one" }
}
```

Tips

- Keep frontmatter consistent with our schema; include `title`.
- Use MDX components where needed (Tabs, Callout); see `/docs/reference/components.md`.
- Preview Markdown/MDX to catch layout issues before PR.

Install steps (quick)

- Press Ctrl/Cmd+Shift+X → search and install the listed extensions.
- Open Settings (JSON) and paste the snippet; adjust to taste.

Editing tips

- Use multi-cursor editing (Alt+Click) to update repeated frontmatter.
- Toggle word wrap (Alt+Z) for long lines.
- Run “Format Document” and spell-check before committing.
