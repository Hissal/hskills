# Host command clashes for spec 7 names: #155

Ticket: [#155](https://github.com/Hissal/skill-collection/issues/155), spec [#83](https://github.com/Hissal/skill-collection/issues/83) (item 9, host names). Read 2026-11-06 on Linux.
Status: results for the owner's decision. **No clash found.** Nothing was renamed.

## Question

Does any user-invoked name in spec 7, plus `/pr`, equal a built-in command or bundled skill of a supported harness? Names: `/guide`, `/setup-project`, `/handoff`, `/retro`, `/wizard`, `/unslop`, `/context-audit`, `/session-report`, `/pr`. Harnesses: Claude Code, Codex, OpenCode, Cursor.

## Result

| Name | Claude Code | Codex | OpenCode | Cursor | Verdict |
| :- | :- | :- | :- | :- | :- |
| `guide` | free | free | free | free | clash-free |
| `setup-project` | free | free | free | free | clash-free |
| `handoff` | free | free | free | free | clash-free |
| `retro` | free | free | free | free | clash-free |
| `wizard` | free | free | free | free | clash-free |
| `unslop` | free | free | free | free | clash-free |
| `context-audit` | free | free | free | free | clash-free |
| `session-report` | free | free | free | free | clash-free |
| `pr` | free | free | free | free | clash-free |

**Plugin-prefixed names.** These skills ship in `collection-core` (`skills/core/.claude-plugin/plugin.json`, `skills/core/.codex-plugin/plugin.json`), so the effective names are `/collection-core:<name>` on Claude Code and `collection-core:<name>` on Codex. No harness has a built-in with a `collection-core:` prefix, so every prefixed name is clash-free. OpenCode and Cursor use the folder route, so only the short names apply. This assumes the final plugin name stays `collection-core`; the final effective names remain a build check under item 9.

**Near-misses, ruled out (not exact matches).** Claude Code `/init`, `/team-onboarding` (descriptions mention "guide"), `/setup-bedrock`, `/setup-vertex`, `/autofix-pr`, `/pr-comments` (removed in v2.1.91), `/code-review`, `/review`. Codex `/review`, `/skills`, `/presets`. OpenCode `review` (its description mentions "pr"). Cursor `/review`, `/review-bugbot`, `/review-security`, `/split-to-prs`, `/create-skill`.

## Method and sources

- **Claude Code 2.1.318.**
  - Live check: headless `claude -p --output-format stream-json --verbose`, run with a scratch `CLAUDE_CONFIG_DIR` (credentials only) in an empty git directory, so none of the machine's personal skills load. The init message lists 67 slash commands and 31 skills; none of the nine names is in either list. Commands that are not skills, such as `/help`, are in the first list, so it covers built-ins as well as bundled skills. A first run with the real config listed `guide`, `setup-project`, `handoff`, `retro`, `wizard` and `pr`; those came from personal skills on this machine, not from built-ins.
  - Docs: [Commands reference](https://code.claude.com/docs/en/commands), read 2026-11-06. No row for any of the nine names.
- **Codex 0.166.0.** The full built-in enum in [`codex-rs/tui/src/slash_command.rs` @ rust-v0.166.0](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/tui/src/slash_command.rs). Skills are invoked with `$name` or `/skills`, so skills do not enter the `/` namespace.
- **OpenCode 2.2.5.** Built-in commands `init` and `review` in [`packages/core/src/plugin/command.ts` @ v2.2.5](https://github.com/anomalyco/opencode/blob/9bbb8ce18c80f099e0e448775f59d965ead40a21/packages/core/src/plugin/command.ts); the TUI command list in the [TUI docs](https://opencode.ai/docs/tui/) and in the installed binary's strings (`/connect`, `/compact`, `/details`, `/editor`, `/exit`, `/export`, `/help`, `/init`, `/models`, `/new`, `/redo`, `/sessions`, `/share`, `/themes`, `/thinking`, `/undo`, `/update`). None matches.
- **Cursor.** Docs only: [CLI slash commands](https://cursor.com/docs/cli/reference/slash-commands) and the built-in skill list in [Skills](https://cursor.com/docs/context/skills) (`/automate`, `/autopilot`, `/canvas`, `/create-hook`, `/create-rule`, `/create-skill`, `/create-subagent`, `/cursor-blame`, `/loop`, `/migrate-to-skills`, `/review`, `/review-bugbot`, `/review-security`, `/sdk`, `/shell`, `/split-to-prs`, `/statusline`, `/update-cli-config`, `/update-cursor-settings`). Installed `cursor-agent 2026.10.22-27dcf5f` was present, but its slash menu is interactive and was not driven.

## Not tested

- The Cursor editor and the interactive slash menus of Cursor CLI, Codex and OpenCode. Their lists come from docs and source at the pinned versions.
- Claude Code surfaces other than the terminal (VS Code, JetBrains, desktop, web).
- Built-ins added in later releases. Re-run before release, since names can be taken at any time.
- Skills the machine's users install themselves (the personal-skill collisions above show this happens, but they are the owner's own and not host built-ins).

## Owner decision

No clash, so no rename is proposed. The same checks found one earlier clash, `code-review` on Claude Code, recorded on [#193](https://github.com/Hissal/skill-collection/issues/193#issuecomment-6550337296); it is outside this ticket.
