# Context-audit layer rows

Build-time verification of the Claude Code and Codex rows in `skills/core/context-audit/LAYERS.md`, for [#141](https://github.com/Hissal/skill-collection/issues/141) under [#83, owner answer 8](https://github.com/Hissal/skill-collection/issues/83#issuecomment-6511240652): "Each row is verified against the harness's docs at build." Read 2026-11-06. Status: verified against documentation only; no session was run to observe loading. The OpenCode and Cursor rows were added for [#142](https://github.com/Hissal/skill-collection/issues/142), read the same day; see [OpenCode rows](#opencode-rows) and [Cursor rows](#cursor-rows).

## Sources

- **CC**: Claude Code docs, raw Markdown from `https://code.claude.com/docs/en/<page>.md`, fetched 2026-11-06. The pages are unversioned; the local binary was Claude Code 2.1.318. Pages: `memory`, `skills`, `hooks`, `output-styles`.
- **CX**: Codex docs, `https://developers.openai.com/codex/<page>.md` (now served from `learn.chatgpt.com`), fetched 2026-11-06. The local CLI was codex-cli 0.166.0. Pages: `skills`, `guides/agents-md`, `hooks`, `config-reference`, `rules`.
- **OC**: OpenCode docs, `https://opencode.ai/docs/<page>/`, fetched 2026-11-06 (page footers: "Last updated: Nov 6, 2026"; no version stated). Pages: `rules`, `config`, `skills`, `agents`, `commands`, `plugins`. No OpenCode binary was installed. The source at `anomalyco/opencode` dev HEAD [`885df74`](https://github.com/anomalyco/opencode/commit/885df74024b6b540b63bfd487014252227713ea7) is mid-move to a V2 layout (`packages/core/`), so the rows follow the docs, not that source.
- **CU**: Cursor docs, `https://cursor.com/docs/<page>`, fetched 2026-11-06 (no date or version on the pages; the skills page mentions Cursor 2.4). Pages: `context/rules` (also served at `/docs/rules`), `context/skills`, `agent/hooks`, `reference/third-party-hooks`, and the `llms.txt` index. No Cursor install was available. `/docs/context/memories` serves the Rules page, and no Memories page was found.
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

## OpenCode rows

| Row | Evidence |
|---|---|
| Configured when `~/.config/opencode/`, `opencode.json(c)` or `.opencode/` exists | [OC config](https://opencode.ai/docs/config/), "Locations" (global `~/.config/opencode/opencode.json`, project `opencode.json`, `.opencode` directories) |
| Global `~/.config/opencode/AGENTS.md`, else `~/.claude/CLAUDE.md`; the two env vars | [OC rules](https://opencode.ai/docs/rules/), "Global", "Precedence" ("`~/.config/opencode/AGENTS.md` takes precedence over `~/.claude/CLAUDE.md`") and "Claude Code Compatibility" |
| Project `AGENTS.md`, else `CLAUDE.md`, walking up from the cwd | OC rules, "Precedence" ("Local files by traversing up from the current directory"; "if you have both `AGENTS.md` and `CLAUDE.md`, only `AGENTS.md` is used") |
| `instructions` key: paths, globs, URLs; combined with `AGENTS.md`; config locations | OC rules, "Custom Instructions" ("All instruction files are combined with your `AGENTS.md` files"; remote URLs with a 5-second timeout); [OC config](https://opencode.ai/docs/config/), "Instructions", "Precedence order", "Per project" (up to the nearest Git directory) |
| Agent prompts from config `prompt` and agent Markdown bodies; replace-or-add not stated | [OC agents](https://opencode.ai/docs/agents/), "Prompt" and "Markdown". That the selected agent's prompt is always loaded is an inference from "custom system prompt" |
| Skill listing in the `skill` tool description; locations; walk to the git worktree; `deny` hides; `skill` tool off omits the list | [OC skills](https://opencode.ai/docs/skills/), "Place files", "Understand discovery", "Recognize tool description", "Configure permissions", "Disable the skill tool" |
| Skill body on a `skill` tool call | OC skills: "The agent loads a skill by calling the tool" |
| Commands on demand | [OC commands](https://opencode.ai/docs/commands/), overview: the prompt runs "when that command is executed" |
| Plugin output: `experimental.session.compacting` adds compaction context | [OC plugins](https://opencode.ai/docs/plugins/), the `experimental.session.compacting` example ("Inject additional context into the compaction prompt") and "Load order". No other context-adding hook is documented on that page |
| Subdirectory `AGENTS.md` not documented as on demand | OC rules: project rules "only apply when you are working in this directory or its sub-directories"; the monorepo advice is an `instructions` glob such as `packages/*/AGENTS.md`. The note in the table is the conservative reading |

## Cursor rows

| Row | Evidence |
|---|---|
| Rule types by frontmatter: `alwaysApply`, `globs`, `description`, manual | [CU rules](https://cursor.com/docs/context/rules), "Rule anatomy": "Always included"; "Auto-attached when a matching file is in context"; "Agent reads the description and pulls the rule in when relevant"; "Included only when you `@`-mention the rule". That the description itself sits in context is an inference from the agent reading it |
| `.mdc` only; plain `.md` ignored; folders allowed | CU rules, "Rule file structure": "A plain `.md` file in `.cursor/rules` is ignored by the rules system"; "Organize rules in folders" |
| `AGENTS.md` root and nested | CU rules, "AGENTS.md": root "as an alternative to `.cursor/rules`"; nested files "automatically applied when working with files in that directory or its children". The page does not say the root file is always loaded |
| User rules not readable | CU rules: "User Rules are global preferences defined in **Customize → Rules**"; "Used by Agent (Chat)". [CU skills](https://cursor.com/docs/context/skills): "User rules are also not migrated since they are not stored on the file system". The settings database comes from [#83 answer 8](https://github.com/Hissal/skill-collection/issues/83#issuecomment-6511240652) |
| Team rules | CU rules, "Team Rules": "included in the model context for Agent (Chat) across all repositories"; rules without a glob "apply to every conversation" |
| Legacy `.cursorrules` | Not mentioned on any current page read (searched for `.cursorrules`, "legacy", "deprecated"). The row is kept per #83 answer 8 and marked unverified |
| Skills: locations, Third-Party Imports, `disable-model-invocation`, `paths` | CU skills: locations list; "only included when explicitly invoked via `/skill-name`"; "only surfaced when the agent works with files that match". [CU third-party hooks](https://cursor.com/docs/reference/third-party-hooks): "Include Third-Party Plugins, Skills, and Other Configs", on by default |
| Hook output: `sessionStart`, `postToolUse`, `postToolUseFailure` `additional_context`; hook locations; Claude settings files | [CU hooks](https://cursor.com/docs/agent/hooks): "Additional context to add to the conversation's initial system context"; "Extra context injected into the conversation after the tool result"; enterprise, project and user `hooks.json` paths. CU third-party hooks: `.claude/settings.local.json`, `.claude/settings.json`, `~/.claude/settings.json`. No size cap is documented |

## Not covered

- Fixed harness text (system prompts, Codex's skills instructions block) is not user-written and has no row.
- MCP tool descriptions: Claude Code defers schemas to tool search ([loading mechanics](loading-mechanics.md)); no row was added, since the audit reads no MCP configuration (it can hold secrets).
- Codex memories (`features.memories`, off by default) were not verified and have no row.
- Cursor Memories: no current docs page was found, so there is no row. Whether Cursor reads `CLAUDE.md` is not documented ("Other Configs" under Third-Party Imports is not defined), so there is no row.
- OpenCode: whether an agent prompt replaces the base prompt, and whether `OPENCODE_DISABLE_CLAUDE_CODE` also stops the project `CLAUDE.md` fallback, are not documented. Plugin hooks beyond the documented compaction hook were not checked.
- Claude Code also ships `/doctor prompt-audit` (CC memory, "Audit your instruction files"), a host audit of instruction files. `context-audit` runs alongside it, per its guardrail.
