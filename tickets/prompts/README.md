# Prompts

This folder contains the exact prompts submitted to the AI assistant to generate or refine the user stories in `tickets/`.


| Prompt file                                 | User story produced                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `prompt_tickets_definition.md`              | US-001, US-002, US-003 — general-purpose enrichment prompt applied to each raw story              |
| `prompt_tickets_definition_security_jwt.md` | US-004 — context-specific prompt that defined the full JWT authentication user story from scratch |
| OpenSpec change `openspec/changes/change-password/` | US-005 — change-password API and Settings UI (proposal, design, tasks, specs) |


These files are traceability artifacts for course evaluators. They are not consumed by any AI agent at runtime.