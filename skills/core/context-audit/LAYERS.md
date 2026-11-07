# Context layers per harness

One table per harness: each layer, where it lives, and whether it is always loaded (in context from session start) or on demand (loaded when something reaches it). Measurement, classification and the diff do not depend on the harness, so a new harness is one more table. `~` is the user's home directory; "the repo" is the project root; "cwd" is the directory the session starts in.

## Claude Code

Configured when `~/.claude/` exists, or the repo has a `CLAUDE.md`, `CLAUDE.local.md` or `.claude/` folder.

| Layer | Location | Loaded |
|---|---|---|
| Managed instructions | `/etc/claude-code/CLAUDE.md` (Linux, WSL); `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS); `C:\Program Files\ClaudeCode\CLAUDE.md` (Windows) | Always |
| User instructions | `~/.claude/CLAUDE.md` | Always |
| User rules | `~/.claude/rules/**/*.md` | Always; a rule with `paths:` frontmatter on demand, when the agent works with a matching file |
| Project instructions | `CLAUDE.md`, `.claude/CLAUDE.md` and `CLAUDE.local.md` in the cwd and every directory above it | Always |
| Project `AGENTS.md` | `AGENTS.md` in the cwd and above | Always, in place of `CLAUDE.md`, only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the cwd or above; also always when a `CLAUDE.md` imports it, or the user's Project instructions setting is `claude-md-and-agents-md`; otherwise not loaded |
| Imports | `@path` lines in any instruction file above, up to four hops | Always, with the file that imports them |
| Subdirectory instructions | `CLAUDE.md` and `CLAUDE.local.md` below the cwd | On demand, once the agent reads or edits a file in that directory |
| Project rules | `.claude/rules/**/*.md` | Always; a rule with `paths:` frontmatter on demand, when the agent works with a matching file |
| Auto memory | `~/.claude/projects/<project>/memory/MEMORY.md` | Always, its first 200 lines or 25 KB, whichever is less; the other files in that folder on demand |
| Output style | The selected style in `~/.claude/output-styles/` or `.claude/output-styles/` | Always, when a custom style is selected |
| Skill listing | `description` and `when_to_use` of each skill in `~/.claude/skills/`, `.claude/skills/` (cwd and above), enabled plugins | Always, cut at 1,536 characters per skill; a skill with `disable-model-invocation: true` is not listed |
| Nested skills | `.claude/skills/` below the cwd | On demand, once the agent works in that directory |
| Skill bodies | Each skill's `SKILL.md` body and its reference files | On demand: the body when the skill is invoked, then for the rest of the session; references when the body points at them |
| Hook output | Hooks in `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`, managed settings, plugin `hooks/hooks.json`, skill frontmatter | `SessionStart` output always; `UserPromptSubmit`, `UserPromptExpansion` and `PostModelSwitch` plain stdout, and `additionalContext` from any event, on demand each time the hook fires. Each value is cut at 10,000 characters. Measure the text the hook script prints, not the hook definition |

## Codex

Configured when `~/.codex/` (or `$CODEX_HOME`) exists, or the repo has a `.codex/` or `.agents/` folder.

| Layer | Location | Loaded |
|---|---|---|
| User instructions | `$CODEX_HOME/AGENTS.override.md`, else `$CODEX_HOME/AGENTS.md` (`$CODEX_HOME` defaults to `~/.codex`) | Always; only the first non-empty one |
| Project instructions | One file per directory from the repo root down to the cwd: `AGENTS.override.md`, else `AGENTS.md`, else a name in `project_doc_fallback_filenames` | Always, concatenated root first; loading stops once the total reaches `project_doc_max_bytes` (32 KiB by default), so measure where the cut falls |
| Instructions below the cwd | `AGENTS.md` files in directories below the cwd | Not loaded in this session; report them as reached only from a session started there |
| Config instructions | `developer_instructions` and `model_instructions_file` in `~/.codex/config.toml` or `.codex/config.toml` | Always; `model_instructions_file` replaces the built-in instructions |
| Skill catalog | Name, description and path of each skill in `.agents/skills/` (cwd up to the repo root), `~/.agents/skills/`, `/etc/codex/skills/`, enabled plugins | Always, within 2% of the context window (8,000 characters when the window is unknown); a skill whose `agents/openai.yaml` sets `allow_implicit_invocation: false` is not listed |
| Skill bodies | Each skill's `SKILL.md` body and its reference files | On demand, when the skill is selected or its body points at a reference |
| Hook output | Hooks in `~/.codex/hooks.json`, `[hooks]` in `~/.codex/config.toml`, `.codex/hooks.json`, `[hooks]` in `.codex/config.toml` (trusted projects only), plugin hooks | `SessionStart` plain stdout always; `UserPromptSubmit` and `SubagentStart` plain stdout, and `additionalContext` from any event, on demand each time the hook fires (2,500 tokens per handler unless `additionalContextLimit` is set). Measure the text the hook script prints |
| Command rules | `.rules` files in `~/.codex/rules/` and `.codex/rules/` | Not context: they decide which commands run, so they are not audited as instructions |

## OpenCode

Configured when `~/.config/opencode/` exists, or the repo has an `opencode.json`, `opencode.jsonc` or `.opencode/` folder.

| Layer | Location | Loaded |
|---|---|---|
| Global instructions | `~/.config/opencode/AGENTS.md`, else `~/.claude/CLAUDE.md` (unless `OPENCODE_DISABLE_CLAUDE_CODE` or `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT` is set) | Always; only the first that exists |
| Project instructions | `AGENTS.md`, else `CLAUDE.md`, found by walking up from the cwd | Always; when both exist only `AGENTS.md` is used |
| Config instructions | Paths and globs in the `instructions` key of `~/.config/opencode/opencode.json`, a project `opencode.json` (cwd up to the git root), the file named by `OPENCODE_CONFIG`, or managed config (`/etc/opencode/` on Linux) | Always, added to the `AGENTS.md` files. A URL entry is fetched at load: list it with the file that names it, and do not fetch it |
| Agent prompts | `prompt` of an agent in any config file above; the body of `.opencode/agents/*.md` or `~/.config/opencode/agents/*.md` | Always for the selected agent; a subagent's prompt when it runs. The docs do not say whether it replaces the base prompt or adds to it |
| Skill listing | `name` and `description` of each skill in `.opencode/skills/`, `.claude/skills/`, `.agents/skills/` (cwd up to the git worktree), `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/` | Always, in the `skill` tool description; a skill whose permission is `deny`, or every skill for an agent with the `skill` tool off, is not listed |
| Skill bodies | Each skill's `SKILL.md` body and its reference files | On demand, when the agent calls the `skill` tool or the body points at a reference |
| Commands | `.opencode/commands/*.md`, `~/.config/opencode/commands/*.md`, `command` in config | On demand, the template when the user runs the command |
| Plugin output | Plugins in `.opencode/plugins/`, `~/.config/opencode/plugins/` and the `plugin` config key | On demand, when a hook adds context (the documented one is `experimental.session.compacting`, at compaction). Measure the text the hook adds, not the plugin code |

Subdirectory `AGENTS.md` files are not documented as loaded on demand: report one as reached only through an `instructions` glob or a pointer.

## Cursor

Configured when `~/.cursor/` exists, or the repo has a `.cursor/` folder or a `.cursorrules` file.

| Layer | Location | Loaded |
|---|---|---|
| User rules | Cursor settings (Customize → Rules), held in Cursor's settings database, not a file | Always, in Agent (Chat). Not readable: report the layer as not read and tell the user to check it in Customize → Rules |
| Team rules | The Cursor team dashboard (Team and Enterprise plans) | Always; a rule with a glob on demand, when a matching file is in context. Not readable from the repo: report it as not read, to check in the dashboard |
| Always-apply rules | `.cursor/rules/**/*.mdc` with `alwaysApply: true` | Always |
| Glob-scoped rules | `.cursor/rules/**/*.mdc` with `alwaysApply: false` and `globs` | On demand, when a matching file is in context |
| Description-picked rules | `.cursor/rules/**/*.mdc` with `alwaysApply: false`, a `description` and no `globs` | The description always; the rule on demand, when the agent judges it relevant |
| Manual rules | `.cursor/rules/**/*.mdc` with no `alwaysApply`, `description` or `globs` | On demand, only when the user `@`-mentions it. A plain `.md` file in `.cursor/rules` is ignored: report it as not loaded |
| Project `AGENTS.md` | `AGENTS.md` in the repo root | Always (the docs offer it as an alternative to `.cursor/rules`; they do not state the loading, so say so) |
| Nested `AGENTS.md` | `AGENTS.md` in a subdirectory | On demand, when the agent works with files in that directory or below |
| Legacy `.cursorrules` | `.cursorrules` in the repo root | Current docs no longer mention it: report it as legacy, its loading unverified, and propose moving it into `.cursor/rules` |
| Skill listing | Skills in `.agents/skills/`, `.cursor/skills/`, `~/.agents/skills/`, `~/.cursor/skills/`, and with Third-Party Imports on (the default) `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/`, `~/.codex/skills/` | Always, the skills presented to the agent; a skill with `disable-model-invocation: true` is not presented, and one with `paths` only when the agent works with a matching file |
| Skill bodies | Each skill's `SKILL.md` body and its reference files | On demand, when the agent uses the skill or the user runs `/skill-name` |
| Hook output | `.cursor/hooks.json`, `~/.cursor/hooks.json`, enterprise `hooks.json` (`/etc/cursor/`, `/Library/Application Support/Cursor/`, `C:\ProgramData\Cursor\`), and with Third-Party Imports on `.claude/settings.json`, `.claude/settings.local.json`, `~/.claude/settings.json` | `sessionStart` `additional_context` always; `postToolUse` and `postToolUseFailure` `additional_context` on demand each time the hook fires. Measure the text the hook script prints |
