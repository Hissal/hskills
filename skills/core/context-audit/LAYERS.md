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
