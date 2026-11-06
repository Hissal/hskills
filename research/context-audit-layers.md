# Context-audit layer rows: Claude Code and Codex

Build-time verification of the Claude Code and Codex rows in `skills/core/context-audit/LAYERS.md`, for [#141](https://github.com/Hissal/skill-collection/issues/141) under [#83, owner answer 8](https://github.com/Hissal/skill-collection/issues/83#issuecomment-6511240652): "Each row is verified against the harness's docs at build." Read 2026-11-06. Status: verified against documentation only; no session was run to observe loading. The OpenCode and Cursor rows belong to [#142](https://github.com/Hissal/skill-collection/issues/142).

## Sources

- **CC**: Claude Code docs, raw Markdown from `https://code.claude.com/docs/en/<page>.md`, fetched 2026-11-06. The pages are unversioned; the local binary was Claude Code 2.1.318. Pages: `memory`, `skills`, `hooks`, `output-styles`.
- **CX**: Codex docs, `https://developers.openai.com/codex/<page>.md` (now served from `learn.chatgpt.com`), fetched 2026-11-06. The local CLI was codex-cli 0.166.0. Pages: `skills`, `guides/agents-md`, `hooks`, `config-reference`, `rules`.
- Earlier evidence: [loading mechanics](loading-mechanics.md) (read 2026-10-09, Claude Code 2.1.295, codex-cli 0.147.0). Every row below agrees with it unless noted.

## Claude Code rows

| Row | Evidence |
|---|---|
| Managed, user and project instructions; `CLAUDE.local.md`; cwd and every directory above, always | [CC memory](https://code.claude.com/docs/en/memory): the locations table and "How CLAUDE.md files load" ("CLAUDE.md and CLAUDE.local.md files in the directory hierarchy above the working directory are loaded at launch") |
| `AGENTS.md` only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists; the `claude-md-and-agents-md` setting | CC memory, "AGENTS.md" and "When Claude Code reads AGENTS.md" |
| `@` imports always, four hops | CC memory, "Import additional files" ("Imports ... don't reduce its context cost") |
| Subdirectory `CLAUDE.md` on demand | CC memory: "loads each one once Claude reads, writes, or edits another file in that subdirectory" |
| Rules always; `paths:` rules on demand; user rules | CC memory, "Organize rules with `.claude/rules/`", "Path-specific rules", "User-level rules" |
| Auto memory, first 200 lines or 25 KB of `MEMORY.md`; topic files on demand | CC memory, "Auto memory" (new since the loading-mechanics note) |
| Custom output style always | [CC output styles](https://code.claude.com/docs/en/output-styles): style locations and "Default means no output style is selected" |
| Skill listing always, 1,536 characters per skill; `disable-model-invocation: true` not listed | [CC skills](https://code.claude.com/docs/en/skills): frontmatter table and the invocation table ("Description not in context, full skill loads when invoked") |
| Nested skills on demand | CC skills, "Load skills in monorepos and subdirectories" |
| Skill body on invoke, then for the session | CC skills, "Skill content lifecycle" |
| Hook output: `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`, `PostModelSwitch` plain stdout; `additionalContext`; 10,000-character cap; hook locations | [CC hooks](https://code.claude.com/docs/en/hooks): exit code 0 behaviour, the output cap, the hook locations table, "Hooks in skills and agents" |

## Codex rows

| Row | Evidence |
|---|---|
| User `AGENTS.override.md` else `AGENTS.md`, first non-empty | [CX AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md), "How Codex discovers guidance", step 1 |
| Project files root to cwd, one per directory, `project_doc_max_bytes` 32 KiB | Same, steps 2 and 3 |
| Files below the cwd not loaded | Same: the walk runs from the project root down to the cwd only (inference from the documented walk) |
| `developer_instructions`, `model_instructions_file` | [CX config reference](https://developers.openai.com/codex/config-reference) |
| Skill catalog: name, description and path; 2% of the window or 8,000 characters; locations; `allow_implicit_invocation: false` | [CX skills](https://developers.openai.com/codex/skills) |
| Hook output: `SessionStart`, `UserPromptSubmit`, `SubagentStart` plain stdout as developer context; `additionalContext`; 2,500-token default; hook locations; trusted-project layer | [CX hooks](https://developers.openai.com/codex/hooks) |
| `.rules` files are not context | [CX rules](https://developers.openai.com/codex/rules) |

## Not covered

- Fixed harness text (system prompts, Codex's skills instructions block) is not user-written and has no row.
- MCP tool descriptions: Claude Code defers schemas to tool search ([loading mechanics](loading-mechanics.md)); no row was added, since the audit reads no MCP configuration (it can hold secrets).
- Codex memories (`features.memories`, off by default) were not verified and have no row.
- Claude Code also ships `/doctor prompt-audit` (CC memory, "Audit your instruction files"), a host audit of instruction files. `context-audit` runs alongside it, per its guardrail.
