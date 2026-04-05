# Prompts

This folder contains the exact prompts submitted to the AI assistant to generate or refine the user stories in `tickets/`.


| Prompt file                                 | User story produced                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `prompt_tickets_definition.md`              | US-001, US-002, US-003 — general-purpose enrichment prompt applied to each raw story              |
| `prompt_tickets_definition_security_jwt.md` | US-004 — context-specific prompt that defined the full JWT authentication user story from scratch |
| OpenSpec change `openspec/changes/archive/2026-04-05-change-password/` | US-005 — change-password API and Settings UI (archived proposal, design, tasks, delta specs; merged into `openspec/specs/`) |
| OpenSpec change `openspec/changes/archive/2026-04-05-authenticated-user-nav-items/` | US-006 — authenticated NavBar, `/profile` and `/candidates` placeholders (merged into `openspec/specs/authenticated-nav` and `auth-session-frontend`) |


These files are traceability artifacts for course evaluators. They are not consumed by any AI agent at runtime.