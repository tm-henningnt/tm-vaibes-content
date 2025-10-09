---
title: ChatGPT Business overview for teams
description: Workspaces, sharing, privacy, and using ChatGPT effectively at work.
audience_levels: [beginner, intermediate]
personas: [non-technical, PM, developer]
categories: [tutorials]
min_read_minutes: 15
last_reviewed: 2025-03-17
related: ["/docs/tutorials/chatgpt-business/canvas-python-starters.md", "/docs/tutorials/chatgpt-business/data-analysis-and-files.md", "/docs/tutorials/chatgpt-business/custom-gpts-and-policies.md", "/docs/concepts/safety-basics.md"]
search_keywords: ["chatgpt business", "workspace", "privacy", "sharing", "governance"]
show_toc: true
---

## Summary
ChatGPT Business brings enterprise controls to the familiar ChatGPT interface. This guide walks administrators and team leads through setting up a workspace, configuring privacy controls, onboarding teammates, and using key productivity features responsibly. You’ll learn how to balance collaboration with guardrails, integrate file and Canvas workflows, and measure adoption without exposing sensitive information.

### You’ll learn
- How to create and configure a ChatGPT Business workspace with SSO, domains, and billing.
- How to manage sharing, conversation retention, and data controls aligned to company policy.
- How to introduce Canvas, file uploads, and GPT Store access safely for different roles.
- How to track usage, assign roles, and implement governance processes.
- How to connect ChatGPT Business workflows with local development or provider APIs.

## Step 1: Prepare your organization

1. **Confirm eligibility and licensing.** ChatGPT Business is available via OpenAI’s enterprise sales channel; review the pricing and compliance commitments in the [official FAQ](https://openai.com/chatgpt/business).
2. **Align stakeholders.** Loop in security, legal, procurement, and IT to define approved use cases, data classifications, and retention policies.
3. **Draft guardrails.** Document which data may enter ChatGPT (no PCI/PHI by default), when to escalate to human review, and how to report issues.
4. **Collect identity metadata.** Ensure you have verified domains and an identity provider (Azure AD, Okta, Google Workspace) ready for SSO.

## Step 2: Create and secure the workspace

1. **Sign in to the admin console.** Use an organization email, then visit the [ChatGPT admin portal](https://platform.openai.com/account/organization) to create a new workspace.
2. **Verify domains.** Add TXT records to prove domain ownership. This enables auto-provisioning and email-based invites.
3. **Configure SSO.** Follow the [SSO setup guide](https://platform.openai.com/docs/guides/sso) for your identity provider. Require SSO for all members and enforce MFA at the IdP level.
4. **Set data controls.** In the admin console:
   - Disable model training on workspace data if you require strict confidentiality.
   - Configure retention: choose 30-day default or shorter; allow opt-out for sensitive teams.
   - Enable conversation export restrictions unless legal/compliance approves.
5. **Assign roles.** At minimum designate two admins, workspace owners, and billing contacts. Developers or power users can be editors with GPT creation rights.

## Step 3: Onboard teams with safe defaults

### Workspace structure

- **Groups and permissions:** Mirror your organizational chart. Create groups for support, product, data, and compliance. Restrict GPT authoring to trained users.
- **Usage guidelines:** Publish a quickstart doc referencing `/docs/concepts/safety-basics.md` and `/docs/tutorials/chatgpt-business/custom-gpts-and-policies.md`.
- **Templates:** Seed the workspace with saved prompts (e.g., meeting minutes, customer reply) vetted by legal.

### Conversation hygiene

- Encourage users to summarize sensitive chats and delete raw PII immediately.
- Use the admin console to set default conversation retention to 30 days or less.
- Remind teams to avoid uploading regulated data unless cleared via policy.

## Step 4: Use Canvas and files responsibly

1. **Canvas projects:** Introduce Canvas as a shared workspace for code or analysis drafts. Pair it with `/docs/tutorials/chatgpt-business/canvas-python-starters.md` for reproducible exports.
2. **Version control:** After exporting Canvas projects, store them in your company Git provider. Require PR reviews before deploying AI-generated code.
3. **File uploads:** Limit supported file types (CSV, PPTX, PDF) and size thresholds. Remind users that files stay in the workspace; delete them after use.
4. **Data analysis mode:** Enable only for analysts who completed privacy training. Require outputs to cite sources and attach checksums for data integrity.
5. **GPT Store access:** Allow curated GPTs relevant to your domain. Block GPTs that request external credentials or unknown actions.

## Step 5: Governance and monitoring

- **Usage analytics:** Use the admin dashboard to monitor active seats, prompt volume, and Canvas usage. Export CSVs monthly to track adoption and ROI.
- **Audit trails:** Review conversation export logs, custom GPT publishing, and integration tokens. Enable alerts for unusual activity.
- **Incident response:** Establish a channel (e.g., #chatgpt-help) where users can report inappropriate content or suspected data leakage. Document triage steps.
- **Policy refresh:** Review guardrails quarterly. Update instructions, prompt templates, and GPT access as products evolve.

## Step 6: Connect to development workflows

- **Local exports:** Encourage developers to export Canvas outputs, run tests locally, and push to Git with clear commit messages.
- **API integrations:** When a team needs automation, bridge ChatGPT outputs to `/docs/tutorials/cost-guardrails.md` or `/docs/tutorials/production-hardening.md` patterns for reliable services.
- **Provider parity:** Share model availability and cost differences (OpenAI vs. Azure OpenAI) so teams choose the right environment for prototyping vs. production.

## Checklist for admins

- [ ] Workspace created with verified domains and SSO enforced.
- [ ] Data retention, model training, and export policies reviewed with legal/security.
- [ ] Groups, roles, and prompt templates configured for key teams.
- [ ] Canvas/file usage guidelines distributed; GPT Store curated.
- [ ] Monitoring and incident response processes in place.

## References

- OpenAI. “ChatGPT Business.” 2024. <https://openai.com/chatgpt/business>
- OpenAI. “Enterprise privacy FAQ.” 2024. <https://openai.com/enterprise-privacy>
- OpenAI. “Single sign-on guide.” 2024. <https://platform.openai.com/docs/guides/sso>
- Microsoft. “Data protection best practices for Copilot and ChatGPT.” 2024. <https://learn.microsoft.com/security/ai/data-protection-guidance>
