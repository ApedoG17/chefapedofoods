# Chef Apedo Foods — Project Docs

This `docs/` folder is the shared context for building the Chef Apedo Foods ordering website — meant to be dropped into the project repo before development (including AI-assisted/"vibe" coding) starts, so any contributor or coding agent has the full picture without re-deriving it.

**Read in this order if you're new to the project:**

1. `PRD.md` — what we're building and why (vision, users, features, business rules, user stories, MVP scope, acceptance criteria)
2. `ARCHITECTURE.md` — how it's built (data model, system flow, tech stack status)
3. `DESIGN_SYSTEM.md` — how it looks (colors, type, components, imagery, motion)
4. `COMPONENTS.md` — the locked reusable component library (meal card, option row, split-payment card, etc.), extracted from the high-fi core-transaction build
5. `RULES.md` — coding conventions to follow
6. `TASKS.md` — the actual build backlog, in order
7. `SECURITY.md` — payment/PII handling rules
8. `TESTING.md` — the test plan, including the golden path

`MEMORY.md` and `AGENTS.md` are written specifically for AI coding agents (e.g. Claude Code) working in this repo — `MEMORY.md` is a fast-context summary, `AGENTS.md` is operating instructions.

**Source of truth:** the full research-and-planning document (market research through Phase D UX/IA) lives outside this repo as the canonical business record. These docs are the distilled, dev-facing version of it — if the two ever disagree, the planning doc wins and these files should be updated to match.

**Status as of this doc set:** Phases A–D complete. Phase E in progress — high-fidelity UI for the core transaction is built and the component library (`COMPONENTS.md`) is locked; marketing pages, admin UI, and Phase F (development) have not started.
