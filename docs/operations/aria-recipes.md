---
title: "ARIA Recipes: Tabs, Dialogs, Toasts"
description: "Practical ARIA patterns for common UI elements with focus management."
audience_levels: ["intermediate"]
personas: ["developer"]
categories: ["operations", "how-to"]
min_read_minutes: 8
last_reviewed: 2025-10-06
related: ["/docs/operations/accessibility.md"]
search_keywords: ["aria", "tabs", "dialog", "toast", "focus management"]
---

Tabs

- Use `role="tablist"`, `role="tab"`, `aria-controls`, and `aria-selected`.
- Arrow keys move focus between tabs; Enter/Space activates.

Dialogs

- Modal: trap focus; restore focus on close; `aria-modal="true"`.
- Provide labelled title via `aria-labelledby`.

Toasts

- `role="status"` or `role="alert"` depending on urgency; auto-dismiss with caution.

Reference

- WAI-ARIA Authoring Practices

