---
title: ChatGPT Canvas Python starters
description: Scaffold small Python projects with ChatGPT Canvas, then export and run them locally with tests.
audience_levels: [beginner, intermediate]
personas: [developer, data-analyst, PM]
categories: [tutorials]
min_read_minutes: 18
last_reviewed: 2025-02-14
related: ["/docs/tutorials/chatgpt-business/overview.md", "/docs/tutorials/chatgpt-business/canvas-nodejs-starters.md", "/docs/quickstarts/python-fastapi.md"]
search_keywords: ["chatgpt canvas", "python starter", "scaffold project", "virtual environment", "pytest"]
show_toc: true
---

ChatGPT Canvas gives you a shared workspace to sketch a Python idea, iterate with AI, and download a ready-to-run project. This guide walks through three starter projects—a CLI utility, a data cleaner, and a simple web scraper—and shows how to review, export, and harden them for real use.

## You’ll learn
- Pick the right Canvas starter template and capture requirements with a prompt spec.
- Collaborate with ChatGPT on Python code while preserving reviews and guardrails.
- Export Canvas projects, set up virtual environments, and run tests locally.
- Add quality gates with linting, formatting, and lightweight evaluations before shipping.

## Prerequisites
- ChatGPT Business workspace with Canvas enabled.
- Python 3.10+ installed locally and access to a terminal.
- Basic familiarity with Git and virtual environments.
- A version control provider (GitHub, GitLab, or similar) for storing the exported project.

## Canvas workflow overview
1. Open ChatGPT → **Canvas** → **New workspace** → choose **Python project**.
2. Write a short plain-language brief. Lead with user goal, inputs, outputs, and constraints.
3. Ask ChatGPT to draft a project plan before generating files. Review the outline and confirm.
4. Generate code file-by-file, requesting docstrings, comments, and tests alongside implementations.
5. Use **Versions** in Canvas to checkpoint major changes and leave reviewer notes.
6. When satisfied, select **Export** → **Download zip** and move to local tooling for validation.

### Prompt spec template
Use this template inside Canvas to anchor requirements before the AI writes code. Update the bracketed text with concrete details.

```
# Intent
Build a [type of project] that helps [target user] accomplish [goal] within [time/cost constraints].

# Inputs
- [Input 1]
- [Input 2]

# Outputs
- [Primary output]
- [Secondary output or side effects]

# Constraints
- Must run on Python [version], use [libraries], and avoid [limitations].
- Include unit tests with pytest.

# Risks & mitigations
- Risk: [e.g., rate limits] → Mitigation: [backoff strategy].
- Risk: [e.g., scraping bans] → Mitigation: [robots.txt respect].

# Evaluation hooks
- Unit tests covering [critical path].
- Manual checklist: [e.g., CLI argument validation].
```

Refer to this spec throughout the session to keep the AI focused and to explain changes when you regenerate files.

## Starter 1: CLI utility for text templating

### Canvas steps
1. Provide a spec: “Create a CLI that personalizes email templates from a CSV of leads.”
2. Ask for a file plan (e.g., `cli.py`, `templates.py`, `tests/test_cli.py`).
3. Request argument parsing with `argparse`, input validation, and JSON logging.
4. Generate pytest cases covering happy path, missing files, and invalid columns.
5. Insert a **Review** comment reminding yourself to replace placeholder copy with approved messaging.

### Export and run locally
After exporting the zip:

```bash
mkdir lead-templater && cd lead-templater
unzip ~/Downloads/lead-templater.zip -d .
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
pytest
python -m lead_templater.cli --input data/leads.csv --template templates/email.md
```

Add a `pyproject.toml` (or extend the Canvas-generated one) with linting defaults:

```toml
[tool.black]
line-length = 100

[tool.ruff]
select = ["E", "F", "I"]
```

Commit the exported project to version control and open a pull request for peer review before sending any emails.

## Starter 2: Data cleaner notebook

### Canvas steps
1. Brief: “Clean survey results, standardize categorical responses, and flag incomplete records.”
2. Instruct Canvas to create a `notebooks/data_cleaning.ipynb` plus a `src/cleaning.py` module for reusable functions.
3. Ask for pandas profiling hooks, percentage-based quality checks, and CLI entry point `python -m cleaning report data/raw.csv`.
4. Request synthetic test data with `pytest` fixtures to lock in expectations.
5. Use Canvas **Comments** to note PII handling policies and anonymization steps before real data touches the notebook.

### Export and run locally

```bash
pip install pipx --user
pipx run hatch new data-cleaner
# Move Canvas files into the new project structure
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install jupyter pandas-profiling
pytest
jupyter notebook notebooks/data_cleaning.ipynb
```

Add a `data/README.md` describing data sources, retention policies, and delete schedules. Store only synthetic samples in the repo; keep sensitive data outside version control.

## Starter 3: Simple web scraper with rate limits

### Canvas steps
1. Brief: “Scrape product titles and prices from a partner site that provides an API fallback.”
2. Ask Canvas to include modules: `scraper.py`, `parsers.py`, `storage.py`, and tests.
3. Require `httpx` with 5-second timeouts, exponential backoff, and polite delays respecting `robots.txt`.
4. Include a tool spec section documenting HTTP status handling and JSON schema for API fallback responses.
5. Request a Mermaid sequence diagram showing `scheduler → scraper → parser → storage` flow for documentation.

### Export and run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install httpx[socks] tenacity rich
ruff check .
pytest -k "scraper"
python -m scraper --site-config configs/partner.yaml
```

Store API keys in `.env` files and load them with `python-dotenv`. Add integration smoke tests that hit a mocked server before contacting partner endpoints.

## Quality gates before shipping
- **Static analysis:** run `ruff`, `mypy`, and `bandit` for security checks. Capture results in your pull request.
- **Runtime validation:** create synthetic datasets or contract tests to cover rate limits and retries.
- **Documentation:** include `README.md`, quickstart instructions, and architecture notes exported from Canvas.
- **CI hook:** configure GitHub Actions (or similar) to run `pytest`, linting, and type checks on every push.
- **Change log:** track Canvas version IDs in `docs/canvas-session-log.md` to preserve context for auditors.

## When to graduate from Canvas
- You need multi-contributor workflows, branching, and protected main branches.
- Dependency management or environment setup is complex (C extensions, GPU workloads).
- You require fine-grained tests, code coverage, or specialized linters.
- Compliance or privacy rules demand local development and secrets scanning.

For those cases, move to a local IDE (VS Code) and use ChatGPT or GitHub Copilot inline for smaller diffs.

## References
- OpenAI. “Work in Canvas.” *OpenAI Help Center*, 2024. https://help.openai.com/en/articles/9125982-work-in-files.
- Python Packaging Authority. “Creating Virtual Environments.” *Python Packaging User Guide*, 2024. https://packaging.python.org/en/latest/tutorials/installing-packages/#creating-virtual-environments.
- OpenAI. “Export your work from Canvas.” *OpenAI Help Center*, 2024. https://help.openai.com/en/articles/9135958-export-your-work-from-canvas.
- Python Software Foundation. “pytest documentation.” *pytest docs*, 2024. https://docs.pytest.org/en/stable/.
