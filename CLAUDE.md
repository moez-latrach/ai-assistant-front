# Claude Code Instructions

Before making any change to this project, read `AGENTS.md` at the repository root.

`AGENTS.md` is the primary source of project context and contains:

- project purpose and architecture;
- technology stack;
- frontend structure;
- important components and services;
- backend API integration;
- development conventions;
- build and test commands;
- current implementation state;
- rules for AI agents modifying the codebase.

## Rules

- Treat `AGENTS.md` as the source of truth for project-level instructions.
- Do not duplicate project documentation in this file.
- Inspect the relevant existing code before making changes.
- Follow the architecture and development rules defined in `AGENTS.md`.
- Preserve existing Angular conventions unless there is a clear reason to change them.
- Verify backend contracts before changing API calls or DTOs.
- Prefer small, testable changes.
- Run the appropriate tests/build after modifying code.
- If the code and `AGENTS.md` disagree, inspect the current implementation and report the discrepancy rather than silently assuming the documentation is correct.
