# Loading mechanics: how Claude Code and Codex load, scope and gate skills

Research for [#2](https://github.com/Hissal/skill-collection/issues/2), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Read 2026-10-09 against Claude Code 2.1.295 and codex-cli 0.147.0 on the owner's machine. Vocabulary follows `GLOSSARY.md`.

## Summary

- **Idle context, Claude Code.** An idle session carries: the skill listing (name plus `description` and `when_to_use` of every model-invoked skill, including plugin skills), every `CLAUDE.md` and imports up the tree (or `AGENTS.md` when there is no `CLAUDE.md`), unscoped `.claude/rules/` files, the output style, MCP tool *names*, and whatever SessionStart hooks print [CC-ctx, CC-mem, CC-hooks]. Hook *definitions* cost nothing. Only their output does.
- **`disable-model-invocation: true` really does keep a skill out of context.** The docs say so [CC-skills#control], and this session confirms it. The skill list given to this research agent contains exactly the 19 fork skills without the flag and none of the 24 with it (section 6). A user-invoked skill costs zero idle tokens on Claude Code.
- **Codex `policy.allow_implicit_invocation: false` also keeps a skill out of the prompt.** In the source, the catalog entry is marked `hidden_from_prompt()`, and the renderer keeps only `enabled && prompt_visible` entries [CX-src host.rs, catalog.rs, render_dedup.rs]. `$skill` still works [CX-skills]. Codex ignores the Claude-only `disable-model-invocation` frontmatter: the fork's `agents/openai.yaml` files carry the gate for Codex, and they currently match the Claude flag one-for-one.
- **Scopes.** Claude reads `~/.claude/skills` (personal), `.claude/skills` from the cwd up to the repo root (project), nested `.claude/skills` on demand, plugins, managed, and claude.ai-synced skills. Personal beats project on a name clash, and plugin skills are namespaced, so they never clash [CC-skills#where]. Claude does **not** read `~/.agents/skills`. Codex reads repo `.agents/skills` (cwd up to the repo root), project `.codex/skills`, `~/.agents/skills`, the deprecated `~/.codex/skills`, `/etc/codex/skills` and bundled system skills. On a name clash Codex keeps both [CX-skills, CX-src host_roots.rs].
- **Packs via plugins work on both harnesses.** Claude: install at user scope, set `false` in `~/.claude/settings.json`, and set `true` in a project's `.claude/settings.json` (or `.local.json`). Project beats user, key by key [CC-plugins-loading#enabled]. Codex: the same with `[plugins."x@m"] enabled = ...` in a trusted project's `.codex/config.toml` [CX-plugins-build]. Codex also reads `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`, so one marketplace repo can serve both [CX-src protocol.rs, marketplace.rs].
- **Single skills inside a plugin cannot be turned off on Claude.** `skillOverrides` ignores plugin skills. A `Skill(...)` deny rule blocks the call, but the docs never say it removes the description (inference: it stays). The only real lever is splitting the plugin [CC-skills#override, CC-measure]. Codex can: `[[skills.config]]` with a `path` or `name` and `enabled = false`, but only from **user** config or session flags. Project config is ignored for this key [CX-src skills_config.rs].
- **Per-project skill gating without plugins (Claude).** `skillOverrides` is valid in any settings file and has four states, `on`, `name-only`, `user-invocable-only` and `off` [CC-settings-ref#skilloverrides]. A project file could therefore silence or shrink user-scope skills. Whether a project value overrides a user value for the same skill key is not documented (inference: yes, like `enabledPlugins`; not tested).
- **Suggesting a user-invoked skill without loading it.** Possible on both harnesses. A `UserPromptSubmit` hook can pattern-match the prompt and inject a one-line suggestion through `additionalContext` or plain stdout. It costs nothing on turns where it prints nothing [CC-hooks#userpromptsubmit, CX-hooks#userpromptsubmit]. Claude also blocks a model attempt to fire a `disable-model-invocation` skill and steers the model to suggest `/name` instead [CC-skills#control]. On Claude, `skillOverrides: "name-only"` is a cheap middle ground: the model sees the name but not the description.
- **Costs.** By `claude plugin details`, a fork skill description averages about 60 tokens (range under 20 to about 150). The owner's 19 model-invoked fork skills cost about **1.6k tokens** per session in Claude, of which the 8 Unity skills are about 730. All 43 would cost about 2.6k. Codex adds a fixed skills-usage preamble of about 2.8k characters, roughly 700 tokens (inference: chars / 4), plus name, description and path per skill. Hidden costs to watch: `superpowers`' SessionStart hook injects a whole skill body (about 1.1k tokens) that `plugin details` labels "no model context cost".

## Sources (pinned)

- **CC-*:** Claude Code docs, raw markdown via `curl -sL https://code.claude.com/docs/en/<page>.md`, fetched 2026-10-09. Pages are unversioned, so the local binary version (2.1.295) is the pin. Pages used: `skills`, `plugins/loading`, `plugins/install`, `plugins/measure`, `plugins-reference`, `settings`, `settings-reference`, `permissions`, `hooks`, `memory`, `output-styles`, `context-window`.
- **CX-*:** Codex docs, `https://developers.openai.com/codex/<page>.md`, fetched 2026-10-09. Pages used: `skills`, `guides/agents-md`, `plugins`, `plugins/build`, `hooks`, `rules`, `config-reference`.
- **CX-src:** `openai/codex` @ [`36ae156`](https://github.com/openai/codex/tree/36ae1561b9324c93d5638b45eb19fe2cc070a581) (main, sparse shallow clone, 2026-10-09). The local CLI is 0.147.0. Main may run ahead of the release, so read source claims as "current main". Links below are relative to `https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/`.
- **F:** the fork, local `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515`.
- **Local:** `~/.claude/skills`, `~/.agents/skills`, `~/.agents/.skill-lock.json`, `~/.claude/settings.json`, `~/.codex/config.toml`, `~/.codex/AGENTS.md`, `~/.claude/plugins/cache` (read only), plus the output of `claude plugin list` and `claude plugin details` (read-only CLI). Nothing was installed or changed. A throwaway `--plugin-dir` copy of the fork's `SKILL.md` files was made in the session scratchpad and used only for measurement.

---

## 1. What enters context in an idle session

### Claude Code

| Item | In idle context? | Source |
| :- | :- | :- |
| Skill listing: name + `description` + `when_to_use` of each model-invoked skill (personal, project, plugin, synced, bundled) | Yes, every turn. The combined text per skill is capped at 1,536 chars (`skillListingMaxDescChars`). The whole listing has a budget of 1% of the context window (`skillListingBudgetFraction`, `SLASH_COMMAND_TOOL_CHAR_BUDGET`). On overflow, descriptions of the least-invoked skills are dropped first, and names always stay | [CC-skills#frontmatter, #skill-descriptions-are-cut-short](https://code.claude.com/docs/en/skills) |
| Skill with `disable-model-invocation: true` | **No.** "Description not in context, full skill loads when invoked." | [CC-skills#control-who-invokes-a-skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill); [CC-context-window](https://code.claude.com/docs/en/context-window): "They stay completely out of context until you invoke them with `/name`." |
| Skill with `user-invocable: false` | Yes. The description stays, and only the `/` menu entry is hidden | CC-skills#control |
| Skill body (`SKILL.md` content) | Only when invoked. After that it stays in the conversation. After compaction, up to 5k tokens per skill and 25k in total are re-attached | [CC-skills#skill-content-lifecycle](https://code.claude.com/docs/en/skills) |
| Plugin skills, agents, commands | Names and descriptions, the same as the listing above. `claude plugin details <name>` prints the "Always-on" figure | [CC-plugins/measure](https://code.claude.com/docs/en/plugins/measure) |
| `CLAUDE.md`, `CLAUDE.local.md` from cwd up to root, plus `~/.claude/CLAUDE.md` and managed | Yes, in full. `@imports` are expanded at launch, up to 4 hops deep, so imports organize text but save nothing. Subdirectory `CLAUDE.md` files load on demand. Block HTML comments are stripped | [CC-memory#how-claude-md-files-load, #import-additional-files](https://code.claude.com/docs/en/memory) |
| `AGENTS.md` | Read *instead of* `CLAUDE.md` only when no `CLAUDE.md`/`CLAUDE.local.md` exists from cwd upward. Requires v2.1.277+. `~/.claude/CLAUDE.md` and rules still load alongside it. Setting `claude-md-and-agents-md` loads both | [CC-memory#agents-md](https://code.claude.com/docs/en/memory#agents-md) |
| `.claude/rules/*.md` and `~/.claude/rules/*.md` without `paths:` | Yes, at launch | [CC-memory#organize-rules-with-claude/rules/](https://code.claude.com/docs/en/memory) |
| Rules with `paths:` frontmatter | Only when Claude touches matching files | CC-memory#path-specific-rules |
| Output style | Yes: style instructions sit in the system prompt (cached after the first request). A custom style drops the built-in coding instructions unless `keep-coding-instructions: true` | [CC-output-styles#how-output-styles-work](https://code.claude.com/docs/en/output-styles) |
| Hook definitions (settings, plugin, skill frontmatter) | **No.** `plugin details` labels them "harness-only — no model context cost" | CC-plugins/measure |
| Hook *output* | Only for `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion` and `PostModelSwitch` plain stdout, and for `additionalContext` on events that accept it. Each value is capped at 10,000 chars (beyond that, Claude gets a file path plus a 2,000-char preview). For other events, stdout goes to the debug log | [CC-hooks#exit-code-0, #add-context-for-claude](https://code.claude.com/docs/en/hooks) |
| MCP tools | Names only by default. Schemas are deferred to tool search | [CC-context-window](https://code.claude.com/docs/en/context-window) |

Note on the skill listing after `/compact`: it "is not re-injected after `/compact`. Only skills you actually invoked get preserved" [CC-context-window]. This is stated in the interactive timeline's text and could not be verified here.

### Codex

| Item | In idle context? | Source |
| :- | :- | :- |
| Skills catalog: name, description and file path of each enabled, implicitly invocable skill, plus a fixed "how to use skills" block | Yes. Budget: 2% of the context window, or 8,000 chars when the window is unknown. `skills.max_context_tokens` overrides it, capped at 10,000 tokens. Descriptions are shortened first. With many skills, some may be omitted with a warning | [CX-skills](https://developers.openai.com/codex/skills), [CX-config-reference](https://developers.openai.com/codex/config-reference) (`skills.max_context_tokens`) |
| Fixed preamble | The host-alias variant is 261 + 2,531 chars, about 700 tokens (inference: chars / 4). `skills.include_instructions = false` drops it | [CX-src `codex-rs/ext/skills/src/catalog_prompt.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/catalog_prompt.rs), [`codex-rs/config/src/skills_config.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/config/src/skills_config.rs) (`include_instructions`) |
| Skill with `agents/openai.yaml` `policy.allow_implicit_invocation: false` | **No.** The entry gets `.hidden_from_prompt()`. `is_model_visible()` is `enabled && prompt_visible`, and the prompt renderer filters on it. Explicit `$skill` still works | [`ext/skills/src/provider/host.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/provider/host.rs) L165-167; [`catalog.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/catalog.rs) L256-263; [`render_dedup.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/render_dedup.rs) L26-30; CX-skills ("Codex won't implicitly invoke the skill … explicit `$skill` invocation still works") |
| `disable-model-invocation` in `SKILL.md` frontmatter | **Ignored.** Codex's metadata loader reads only `interface`, `dependencies` and `policy` from `agents/openai.yaml`. No Rust source mentions `disable-model-invocation` | [`ext/skills/src/loader/metadata.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/loader/metadata.rs) L27-56 |
| `AGENTS.md` | Yes. `~/.codex/AGENTS.override.md` or `AGENTS.md`, then one file per directory from the project root down to the cwd (`AGENTS.override.md` > `AGENTS.md` > `project_doc_fallback_filenames`). Files are concatenated and capped at `project_doc_max_bytes` (32 KiB) | [CX-guides/agents-md](https://developers.openai.com/codex/guides/agents-md) |
| `developer_instructions`, `model_instructions_file`, `personality` | Always-on config keys: extra developer text, a full replacement of the built-in instructions, and a communication style | CX-config-reference |
| Hook output | `SessionStart`, `UserPromptSubmit` (and `SubagentStart` for subagents): plain stdout becomes developer context. Other events accept JSON `additionalContext`. Per-handler `additionalContextLimit` defaults to 2,500 tokens, after which output is saved to disk with a preview | [CX-hooks](https://developers.openai.com/codex/hooks) |
| `.rules` files (`~/.codex/rules/`, `<repo>/.codex/rules/`) | **Not context.** They are Starlark `prefix_rule`s that gate which commands run outside the sandbox. They are not instructions | [CX-rules](https://developers.openai.com/codex/rules) |

## 2. Scopes, locations, precedence and name collisions

### Claude Code ([CC-skills#where-skills-live](https://code.claude.com/docs/en/skills))

| Scope | Path | Reaches |
| :- | :- | :- |
| Enterprise | `.claude/skills/` in the managed settings dir | All users on the machine |
| Personal | `~/.claude/skills/<name>/SKILL.md` | Every project on this machine (not Cowork or cloud) |
| Project | `.claude/skills/` in the cwd and every parent up to the repo root | That repo |
| Nested | `<subdir>/.claude/skills/` | Loads once Claude touches a file there. Listed as `subdir:name` |
| `--add-dir` | `<dir>/.claude/skills/` | That session |
| Plugin | `<plugin>/skills/<name>/` | Wherever the plugin is enabled. Namespaced as `/plugin:name` |
| claude.ai account | `~/.claude/skills/synced/` (downloaded) | Sessions signed in with that account. Turn off with `syncClaudeAiSkills: false` |

- Symlinked skill folders are followed. A target linked from several locations loads once [CC-skills#where]. The owner's setup relies on this.
- A skill folder with `.claude-plugin/plugin.json` loads as plugin `<name>@skills-dir`. At project scope it needs workspace trust and loads only from the primary cwd [CC-skills#where; CC-plugins/loading#plugins-shared-through-a-repository].
- **Collisions:** enterprise > personal > project. A local skill replaces a bundled skill or built-in command of the same name (aliases excepted). A skill beats a `.claude/commands/` file. Root and nested skills both load. A plugin skill never collides, because it is namespaced. A synced skill loses its short name to any other command [CC-skills#resolve-skills-that-share-a-name].
- **Live reload:** edits under `~/.claude/skills`, the project `.claude/skills` and `--add-dir` skills are picked up mid-session. A newly created top-level dir needs `/reload-skills` [CC-skills#live-change-detection].
- Claude Code does **not** list `~/.agents/skills` or `.agents/skills` among its locations. The local consequence is that `find-skills` (installed by `vercel-labs/skills` into `~/.agents/skills` only, per `~/.agents/.skill-lock.json`) reaches Codex but not Claude.

### Codex ([CX-skills#where-codex-loads-local-skills](https://developers.openai.com/codex/skills); [CX-src `ext/skills/src/host_roots.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/host_roots.rs) L55-130)

| Scope | Path |
| :- | :- |
| REPO | `.agents/skills` in every directory from the cwd up to the project root (root markers configurable) |
| REPO (source only) | `<project>/.codex/skills` from the trusted project config layer. Undocumented on the docs page |
| USER | `~/.agents/skills`. Also the deprecated `$CODEX_HOME/skills` (`~/.codex/skills`), "kept for backward compatibility" |
| ADMIN | `/etc/codex/skills` (system config layer) |
| SYSTEM | Bundled skills, cached under the user config folder. Toggle with `skills.bundled.enabled` |
| Plugin | Plugin `skills/`, namespaced `plugin:skill` (inference from `render_dedup.rs` splitting names on `:`) |

- Symlinks are followed for user, repo and admin roots, and ignored for the system root [`loader/host.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/ext/skills/src/loader/host.rs) L165-166.
- **Collisions:** "If two skills share the same `name`, Codex doesn't merge them; both can appear in skill selectors" [CX-skills]. There is no precedence rule like Claude's. Duplicate roots are deduped by path only.
- Change detection is automatic, though a restart is sometimes needed [CX-skills].

## 3. Plugins: per-project enablement, single-skill control, marketplaces, updates

### Claude Code

- **Enable/disable keys.** `enabledPlugins` maps `name@marketplace` to a Boolean and is valid in any settings file. Six sources, lowest to highest: `--add-dir` (true only) < user < project < local < `--settings` flag < managed. The values "merge key by key" [CC-plugins/loading#find-where-a-plugin-is-enabled](https://code.claude.com/docs/en/plugins/loading). A user `false` overridden by a project `true` loads, and `/plugin` says so explicitly [ibid. #disabled-in-user-settings-but-still-loads]. **This is the pack mechanism:** install once at user scope disabled, and enable per project.
- **Install vs enable.** A project-only `true` does not fetch the plugin onto a machine where it isn't installed, unless the plugin uses a relative-path source inside the marketplace. Otherwise the Errors tab shows "enabled in project settings but isn't installed here" [ibid. #enabled-in-project-settings-but-not-installed]. Install scopes: user, project, local [CC-plugins/install#choose-an-install-scope](https://code.claude.com/docs/en/plugins/install).
- **Single skill inside a plugin: no supported switch.** "Plugin skills are not affected by `skillOverrides`. Manage those through `/plugin` instead" [CC-skills#override-skill-visibility-from-settings], and `/plugin` works per plugin. The maintainer-side advice is "Split a large plugin so users install only the components they need" [CC-plugins/measure#lower-the-always-on-figure]. A permission deny `Skill(plugin:skill)` blocks invocation [CC-skills#restrict-claude's-skill-access]. Nothing says it removes the description from the listing (inference: it doesn't, so the idle cost remains).
- **Marketplaces & updates.** `extraKnownMarketplaces` in settings plus `known_marketplaces.json`. The plugin version comes from manifest `version`, then the entry `version`, then the commit SHA (12 chars). Pinning `version` freezes users until it changes. Auto-update runs per marketplace (`autoUpdate`), after a random delay of up to 10 minutes, and the new code applies on `/reload-plugins` or the next launch [CC-plugins/loading#versions-and-updates, #when-auto-update-runs]. A relative-path plugin from a local-path marketplace loads its current files every session start, so it is "in place" [ibid.].
- **Cost tool.** `claude plugin details <name>` prints the always-on and per-component token estimates [CC-plugins/measure]. `/skill-doctor` reports per-skill cost and usage [CC-skills#find-unused-skills].

### Codex

- **Enable/disable keys.** `[plugins."name@marketplace"] enabled = true|false` is read from the effective merged config, and "trusted-project settings can override user, cloud-managed, and system defaults" [CX-config-reference `plugins.<plugin>.enabled`; CX-plugins/build#enable-or-disable-a-plugin-for-a-repo](https://developers.openai.com/codex/plugins/build). Project `.codex/config.toml` loads only in trusted projects. The same pack pattern applies.
- **Single skills:** `[[skills.config]]` with `path` (documented) or `name` (source only) and `enabled = false` [CX-skills#enable-or-disable-local-codex-skills]. Rules apply in layer order, but **only from the User layer and SessionFlags**. Project `.codex/config.toml` entries are skipped [CX-src `config/src/skills_config.rs` `skill_config_rules_from_stack`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/config/src/skills_config.rs). Inference: a path selector should work on a plugin skill's cached path too, which would make single-skill disabling inside plugins possible in Codex. Not tested.
- **Marketplaces:** `$REPO_ROOT/.agents/plugins/marketplace.json`, `~/.agents/plugins/marketplace.json`, and the legacy-compatible `$REPO_ROOT/.claude-plugin/marketplace.json` [CX-plugins/build]. The source discovery list is `.agents/plugins/marketplace.json`, `.agents/plugins/api_marketplace.json`, `.claude-plugin/marketplace.json` and `.cursor-plugin/marketplace.json` [CX-src `core-plugins/src/marketplace.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/core-plugins/src/marketplace.rs) L21-26. Plugin manifests are discovered at `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` [`exec-server-protocol/src/protocol.rs`](https://github.com/openai/codex/blob/36ae1561b9324c93d5638b45eb19fe2cc070a581/codex-rs/exec-server-protocol/src/protocol.rs) L51-55. **One Claude-format plugin repo can therefore serve both harnesses.** Local corroboration: `~/.codex/config.toml` already has `unity@unity-agent-plugin` and `vibe-language-learning@hissal` (Claude marketplaces) enabled.
- **Updates:** `codex plugin marketplace add|list|upgrade|remove`. Installs are cached at `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` (`local` for local plugins) [CX-plugins/build]. A new session is needed after install [CX-plugins].
- **Plugin hooks** load only after the user reviews and trusts them. Codex sets `CLAUDE_PLUGIN_ROOT` and `CLAUDE_PLUGIN_DATA` for compatibility [CX-hooks#plugin-bundled-hooks].

## 4. Always-on vehicles and their context cost

| Vehicle | Claude Code | Codex |
| :- | :- | :- |
| Steering file | `CLAUDE.md` chain plus imports, all loaded in full. Target under 200 lines [CC-memory] | `AGENTS.md` chain, 32 KiB cap, one file per directory. No documented `@import` (inference from docs silence) [CX-agents-md] |
| Modular rules | `.claude/rules/` and `~/.claude/rules/`. Unscoped files always load; `paths:`-scoped ones load on match. **Path-scoped rules are a zero-idle-cost always-on vehicle for packs** [CC-memory#path-specific-rules] | No equivalent. Codex `.rules` files are command-approval policy, not context [CX-rules] |
| Output style | System-prompt text, cached after the first request [CC-output-styles] | `personality` (none/friendly/pragmatic), `developer_instructions` [CX-config-reference] |
| SessionStart hook | Its stdout or `additionalContext` is paid once per session (and again on `compact` if matched). Under 10k chars inline [CC-hooks] | Plain stdout or `additionalContext` becomes developer context [CX-hooks#sessionstart] |
| UserPromptSubmit hook | Pays only when it prints, then on that turn's context [CC-hooks#userpromptsubmit] | Same. `matcher` is unused for this event [CX-hooks#userpromptsubmit] |
| UserPromptExpansion (Claude only) | Fires when a typed `/command` expands. Can block it or append `additionalContext` for that skill [CC-hooks] | — |
| PreToolUse / PostToolUse | Definitions are free. `additionalContext` is paid per firing [CC-hooks] | Same pattern. PreToolUse plain stdout is ignored [CX-hooks] |
| Stop | `decision: block` or `additionalContext` continues the conversation [CC-hooks] | Supported event [CX-hooks#stop] |
| Skill-scoped hooks (Claude only) | `hooks:` frontmatter registers on invoke and lasts for the rest of the session. `once: true` is supported [CC-hooks#hooks-in-skills-and-agents] | — |

**Pitfall, verified locally.** `superpowers` 6.4.1 declares a `SessionStart` hook (`startup|clear|compact`) whose script reads `skills/using-superpowers/SKILL.md` and emits it as `additionalContext` (`~/.claude/plugins/cache/claude-plugins-official/superpowers/6.4.1/hooks/session-start` L10-47). `claude plugin details superpowers` reports "Always-on ~840 tok" and the hook as "harness-only — no model context cost". The real idle cost is about 840 plus about 1.1k for the injected body, so roughly 2k tokens. When estimating any plugin with a SessionStart hook, read the hook script.

## 5. Suggesting a user-invoked skill without loading it

- **Claude, built in.** If the model tries to invoke a `disable-model-invocation` skill, "Claude Code blocks the call and instructs it not to reproduce the deploy steps another way, so expect Claude to suggest running `/deploy` yourself" [CC-skills#control-who-invokes-a-skill]. But the model only knows the skill exists if something mentions it, because the listing omits it.
- **Claude, permission by mention.** `/name` written after plain text in a user message doesn't run the skill. It "counts as your permission for that message", and Claude may then run it [CC-skills#where-you-write-the-skill's-name].
- **Router as always-on text.** A short `CLAUDE.md`/`AGENTS.md` section or rule naming user-invoked skills and when to suggest them. Cost is paid every session, roughly proportional to its length.
- **`skillOverrides: "name-only"` (Claude).** The model sees the name without the description [CC-settings-ref#skilloverrides]. The docs don't say whether the model may then invoke it on its own (inference: yes, because only `user-invocable-only` and `off` hide it). So this is a cheaper model-invoked mode, not a gate.
- **Hook router (both harnesses).** A `UserPromptSubmit` command hook matches keywords in `prompt` and prints one line such as "Consider suggesting `/to-spec` to the user". It costs zero tokens on non-matching turns and a few tokens on matches. It never loads the skill body [CC-hooks#userpromptsubmit; CX-hooks#userpromptsubmit]. On Claude, a `UserPromptExpansion` hook can also attach context when the user *does* type the skill [CC-hooks]. This is the only mechanism found that gives conditional, zero-idle-cost suggestions.
- **Codex:** `allow_implicit_invocation: false` skills are invisible to the model, the same as Claude. The model can still mention `$name` if told about it by `AGENTS.md` or a hook.

## 6. Token costs: typical description and the owner's setup

**Method.** The fork's 43 `SKILL.md` files (all symlinked into `~/.claude/skills`) were copied into a throwaway plugin dir and measured with `claude --plugin-dir ./forkskills plugin details forkskills`. Claude's own estimator counts name plus `description` plus `when_to_use`. Note that it counted the `disable-model-invocation` skills too (for example `ask-matt` ~40). Inference: the estimator doesn't apply the flag, so only the model-invoked rows below are real idle cost.

**Typical description:** median about 60 tokens. The range runs from under 20 (`pr`, 29 chars) to about 150 (`code-review`, 421 chars). This works out to roughly 2.6 chars per token including name overhead (4,123 description chars came to about 1,595 tokens across the 19 model-invoked skills).

**Owner's Claude setup today** (`~/.claude/skills`, frontmatter checked per skill):

| Group | Skills | Idle tokens (est.) |
| :- | :- | :- |
| Model-invoked, core-like | code-review ~150, codebase-design ~100, diagnosing-bugs ~60, domain-modeling ~60, grilling ~60, pr <20, prototype ~70, research ~90, tdd ~60, wizard ~120, writing-for-agents ~80 | ~865 |
| Model-invoked, Unity | unity ~70, unity-assemblies ~120, unity-code-lifecycle ~90, unity-debugging ~80, unity-prototyping ~90, unity-serialization ~90, unity-testing ~90, unity-verification ~100 | ~730 |
| `disable-model-invocation: true` (24 skills, incl. `unslop`) | ask-matt, chief-of-staff, claude-handoff, grill-me, grill-with-docs, handoff, implement, implement-spec, improve-codebase-architecture, loop-me, retro, setup-matt-pocock-skills, setup-ts-deep-modules, teach, to-questionnaire, to-spec, to-tickets, triage, unslop, wait-what, wayfinder, writing-beats, writing-fragments, writing-shape | 0 (would be ~1,090 if model-invoked) |
| Enabled plugins | `vibe-wise` ~108 (+ its SessionStart hook output, not measured); synced `cowork-plugin-management` ~259 | ~370+ |

**Live confirmation.** The skill list in this research agent's own system prompt contained exactly the 19 model-invoked fork skills and none of the 24 flagged ones. It also contained bundled and synced entries (`anthropic-skills:*`, `cowork-plugin-management:*` and others), which are outside the collection's control unless synced skills are turned off.

Implication for the map: moving the 8 Unity skills into a Unity pack saves about 730 tokens in every non-Unity session. All Claude plugins except `vibe-wise` are already disabled at user scope (`claude plugin list`).

**Owner's Codex setup today.** `~/.agents/skills` holds the same 43 fork symlinks plus `find-skills` (description 317 chars, Codex-only). Every fork skill's `agents/openai.yaml` sets `allow_implicit_invocation: false` exactly where `SKILL.md` sets `disable-model-invocation: true`. A script check found no mismatches. The visible set is therefore the same 19 plus `find-skills` plus bundled system skills. Rough Codex idle cost of the user skills: (4,123 + 317 chars of description + about 20 × 50 chars of name/path) / 4 ≈ 1.4k tokens, plus the ~700-token preamble. That is about **2k tokens** before plugin skills (inference: chars / 4. Codex has no `plugin details` equivalent that was checked). Unlike Claude, `~/.codex/config.toml` has many plugins **enabled** at user level, including `superpowers@openai-curated`, `unity@unity-agent-plugin`, `vibe-language-learning@hissal`, `rider@jetbrains-rider` and several OpenAI-bundled ones. Each adds its skill descriptions to every Codex session (not measured).

## 7. Open points (not verified here)

- Whether a project `skillOverrides` entry overrides a user-scope entry for the same skill key in Claude (object-key merge is documented for `enabledPlugins`, not for `skillOverrides`).
- Whether a Claude skill with `paths:` frontmatter is absent from the listing until a matching file is touched, or listed and merely restricted. The docs say only that it is "loaded automatically only when working with files matching".
- Whether a Codex `[[skills.config]]` path selector disables a plugin-bundled skill.
- Whether Codex source at `main` (`36ae156`) matches the installed 0.147.0 for the skill-visibility and `skills.config` layer rules.
