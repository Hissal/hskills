# Ledger: Anthropic-authored marketplace plugins

Ticket: [Ledger: Anthropic-authored marketplace plugins](https://github.com/Hissal/skill-collection/issues/27), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `anthropics/claude-plugins-official`, folder `plugins/`, read at commit [`b8e53f1`][root] (committed 2026-10-09). The discovery sweep saw the repo at `ac996c0`; HEAD had moved, so every link is re-pinned to `b8e53f1`, which `git ls-remote` reported as HEAD on 2026-10-10. Read from a shallow clone outside this repo. Nothing from the source was installed or executed. Only `plugins/` is in scope; `external_plugins/` and the ~260 remote marketplace entries are third-party and were not read.

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) and, where that file is silent, from the Claude Code docs fetched as raw markdown on 2026-10-10 (`code.claude.com/docs/en/hooks.md`, `plugins-reference.md`, `plugins/components.md`, `plugins/code-intelligence.md`, `plugins/troubleshooting.md`, `tools-reference.md`). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured from the frontmatter of every `SKILL.md`, `agents/*.md` and `commands/*.md` by a script. Tokens are estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics §6](../loading-mechanics.md) measured and the other ledgers reuse. Skills with `disable-model-invocation: true` count as 0. This is an estimate (inference), not a `claude plugin details` measurement: none of these plugins is installed on the owner's machine (`~/.claude/plugins/installed_plugins.json`, read 2026-10-10). Hook cost is judged by reading each hook script, per the pitfall in [loading-mechanics §4](../loading-mechanics.md).

**Everything here is Claude-only.** These are Claude Code plugins: plugin hooks, `agents/`, `commands/`, `lspServers` and `${CLAUDE_PLUGIN_ROOT}` have no Codex counterpart in this source. A piece taken from here either is declared Claude-only on purpose or is rewritten as a plain skill or script.

## Overview

**What the source is.** The official Claude Code marketplace. Its README splits it into "`/plugins` - Internal plugins developed and maintained by Anthropic" and "`/external_plugins` - Third-party plugins from partners and the community" ([README][readme]). `marketplace.json` lists 315 entries; 39 point at `./plugins/…` ([marketplace.json][mp]). The folder holds 40 directories: the 39 listed plus `example-plugin`, the unlisted reference implementation. Every plugin ships an Apache-2.0 `LICENSE`, enforced by CI; `claude-security` is the one exception and is proprietary ([validate-licenses.yml][ci-lic]). `hookify`'s README says "MIT License" ([L340][hk-readme]) while its `LICENSE` file is Apache-2.0.

**What it ships** (counted from the tree at `b8e53f1`):

| Part | Count | Notes |
|---|---|---|
| Plugin folders | 40 | 39 in the marketplace + `example-plugin` |
| LSP plugins | 12 | Each is a `README.md` + `LICENSE` only; the server config sits inline in `marketplace.json` with `"strict": false` (entry 1) |
| Skills | 27 `SKILL.md` | 2 set `disable-model-invocation: true` (`math-proof:solo`, `math-proof:siege`); none in the in-depth six does |
| Agents | 36 | Agent descriptions are listed like skill descriptions ([loading-mechanics §1](../loading-mechanics.md)) and cannot be flagged user-invoked |
| Commands | 32 | Legacy `commands/*.md`; `cwc-makers:maker-setup` is the only one with `disable-model-invocation: true` |
| Plugins with hooks | 7 | `hookify`, `security-guidance`, `ralph-loop`, `explanatory-output-style`, `learning-output-style`, `claude-security`, `code-modernization` |
| Marketplace CI | 9 workflows | LLM policy scan, frontmatter validation, nightly SHA bumps, licence check (entry 2) |

**Idle cost.** All 39 listed plugins together come to about **11.2k tokens** of descriptions (estimate). Two plugins are a quarter of that each:

| Plugin | Idle descriptions (est.) | Always-on hook output | In depth? |
|---|---|---|---|
| `plugin-dev` | ~2,570 (3 agents ~1,360; 7 skills ~1,170; 1 command ~40) | none | yes |
| `pr-review-toolkit` | ~2,440 (6 agents ~2,420; `code-simplifier` alone ~880) | none | yes |
| `hookify` | ~325 (agent ~150, 4 commands ~100, skill ~80) | 0 tokens with no rules; 4 unmatched hooks spawn Python on every tool call, prompt and stop | yes |
| `claude-md-management` | ~160 (skill ~135, command ~25) | none | yes |
| `session-report` | ~65 | none | yes |
| `csharp-lsp` | 0 descriptions | no hook; diagnostics are pushed into context after each `.cs` edit, and the `LSP` tool becomes active (cost not measured) | yes |
| `code-modernization` | ~1,430 | telemetry hooks on 5 events | no |
| `claude-security` | ~925 | 4 hook events, mostly gated by `if:` | no |
| `security-guidance` | 0 | SessionStart builds a venv; an LLM review runs on every Stop | no |
| `explanatory-` / `learning-output-style` | 0 | SessionStart injects ~1.3k / ~3.3k chars every session | no |

For scale: the core tripwire for model-invoked descriptions is 1,000 tokens ([always-on decision](https://github.com/Hissal/skill-collection/issues/14)). `plugin-dev` or `pr-review-toolkit` alone is ~2.5 times that, and a plugin's single skills and agents cannot be switched off ([loading-mechanics §3](../loading-mechanics.md)). Idle context from outside the collection does not count against the tripwires, but the same decision says "nothing stays enabled at user scope unless the owner uses it".

**Fit to the owner, in one line.** Nothing here mentions Unity. One plugin is C#-specific (`csharp-lsp`). The rest is harness tooling (hooks, CLAUDE.md, plugins, review agents) whose examples are JavaScript/TypeScript and whose scripts are bash + `jq` or `python3`. On the owner's machine `jq` is not installed and `python3` resolves to the `WindowsApps` alias (`which`, 2026-10-10).

**Standout candidates (proposed):**

- **`csharp-lsp`** (entry 14): the only piece that is install-as-is and aimed at the owner's stack. It adds compiler diagnostics after edits and symbol navigation, with no description cost. It answers the open LSP questions in the [dotnet-skills ledger](dotnet-skills.md) (entry 13 there). Unity fit is unproven.
- **`session-report`** (entry 5): a zero-dependency Node script that turns `~/.claude/projects` transcripts into per-skill, per-subagent and per-prompt token figures. It measures *use*, not idle cost, which is exactly the evidence the "unused things get switched off" rule and the gating ticket lack.
- **`hookify`'s design, not its code** (entries 3-4): rules as small markdown files read by one generic hook, hot-reloaded, plus a command that mines the conversation for corrections. The shipped engine has several defects found by reading it and fails two of the five hook gates.
- **Marketplace policy prompt** (entry 2): Anthropic's own review checklist for hooks ("runs on every session/prompt/tool-call unconditionally, or is it gated"). It is nearly the owner's hook gate written by the harness vendor, and a ready scan prompt for vendored pieces.
- **`silent-failure-hunter`'s checklist** (entry 9) and the **confidence threshold** in `code-reviewer` (entry 8): two small, portable ideas for the fork's `code-review`.

**Biggest open questions:**

1. **Does `csharp-ls` behave in a Unity project?** It needs a solution or project file, and Unity's are generated by the IDE package. Nothing here answers it; it needs a sandbox trial (entry 14).
2. **Is a rules-as-data hook wanted at all?** The always-on decision admits single-purpose guards through the hook gate. A generic rule engine is a different shape: one always-running hook, many small rules. It trades per-rule tests for convenience (entry 3).
3. **Where does usage measurement live?** `session-report`, `receipts`, karanb192's `context-hogs`/`cache-tax` ([hook-collections](hook-collections.md) entries 12-13) and the harness's own `/skill-doctor` overlap. One theme should pick one (entry 5).
4. **Review agents or review skills?** `pr-review-toolkit` splits review into six always-listed agents. The fork's `code-review` spawns sub-agents from one skill. Adding axes to the fork skill costs no idle tokens; installing the plugin costs ~2.4k (entry 8).
5. **Two more Anthropic voices on descriptions.** `plugin-dev` demands third-person descriptions that enumerate quoted trigger phrases; newer agents in the same repo move their examples out of the description into the body. This adds to the conflict the [anthropic-skills ledger](anthropic-skills.md) raised (entry 11).

### Already covered elsewhere (skipped here)

| Piece | Covered by |
|---|---|
| `skill-creator` (the plugin wraps the same skill: `SKILL.md`, `agents/`, `eval-viewer/`, `scripts/run_eval.py`, `run_loop.py`, `quick_validate.py` …) | [anthropic-skills ledger](anthropic-skills.md) entries 1-10. The two copies were not diffed |
| `frontend-design` (same skill name and purpose) | [anthropic-skills ledger](anthropic-skills.md) entry 16 |
| `strict: false` + explicit `skills` path lists, "skill-bundle plugins" ([README L60-L88][readme-bundle]) | [anthropic-skills ledger](anthropic-skills.md) entry 23; [`vendoring.md`](../vendoring.md) |
| `superpowers` (third-party entry in this marketplace; installed and disabled on the owner's machine) | [superpowers ledger](superpowers.md) |
| caveman, karpathy-skills, vibe-wise | [installed-plugins ledger](installed-plugins.md). None lives in `plugins/` |
| How hooks cost context, plugin enablement per project | [loading-mechanics](../loading-mechanics.md) §3-§4 |

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Claude-only packaging | Plugin hooks, `agents/`, `commands/`, `lspServers`, `${CLAUDE_PLUGIN_ROOT}` throughout | Nothing reaches Codex unless rewritten as a skill or a plain script |
| All-or-nothing plugins | "Plugin skills are not affected by `skillOverrides`" ([loading-mechanics §3](../loading-mechanics.md)) | Installing `plugin-dev` for one skill pays for all ten descriptions |
| Agent descriptions carry `<example>` blocks | `plugin-dev` agents ~1,150 chars each; `pr-review-toolkit:code-simplifier` 2,265 chars ([agent][prt-simp]) | Large idle cost for pieces that are only useful on request |
| bash + `jq` / `python3` | `hookify` hooks call `python3` ([hooks.json][hk-hooks]); `ralph-loop` and `plugin-dev`'s hook scripts use `jq` | Owner's machine: no `jq`; `python3` is the Store alias. Hooks would error or need porting |
| Bash tool only | `hookify` maps only `Bash`, `Edit`, `Write`, `MultiEdit` ([pretooluse.py L38-L41][hk-pre]) | Misses the `PowerShell` tool, the same gap the [hook-collections ledger](hook-collections.md) flagged |
| Anthropic-internal residue | `silent-failure-hunter` names `logForDebugging`, `logError (Sentry)`, `logEvent (Statsig)`, `constants/errorIds.ts` ([L123-L128][prt-sfh]) | Review agents assume a TypeScript codebase that is not the owner's |
| Stale against current docs | `validate-hook-schema.sh` knows 9 hook events ([L41][pd-vhs]); `skill-reviewer` calls `when_to_use` "deprecated" ([L57][pd-reviewer]); `claude-md-improver` uses `.claude.local.md` ([L28][cmd-skill]) where the docs name `CLAUDE.local.md` | The authoring plugins lag the harness; the docs win |

### Index: every plugin to its entry

| Entry | Plugins / mechanisms |
|---|---|
| 1 | marketplace manifest conventions (manifest-only entries, `renames`, immutable names, SHA-pinned externals) |
| 2 | marketplace CI: policy scan prompt, frontmatter validator, SHA bump, licence check |
| 3 | `hookify`: rule engine and its four hooks |
| 4 | `hookify`: `/hookify`, `conversation-analyzer`, `writing-rules`, `list` / `configure` / `help` |
| 5 | `session-report` |
| 6 | `claude-md-management`: `claude-md-improver` |
| 7 | `claude-md-management`: `/revise-claude-md` |
| 8 | `pr-review-toolkit`: packaging, `/review-pr`, `code-reviewer`, `code-simplifier` |
| 9 | `pr-review-toolkit`: `silent-failure-hunter` |
| 10 | `pr-review-toolkit`: `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer` |
| 11 | `plugin-dev`: seven skills |
| 12 | `plugin-dev`: hook scripts and the `.local.md` settings pattern |
| 13 | `plugin-dev`: three agents and `/create-plugin` |
| 14 | `csharp-lsp` |
| 15 | `clangd-lsp`, `gopls-lsp`, `jdtls-lsp`, `kotlin-lsp`, `lua-lsp`, `php-lsp`, `pyright-lsp`, `ruby-lsp`, `rust-analyzer-lsp`, `swift-lsp`, `typescript-lsp` |
| 16 | `security-guidance` |
| 17 | `explanatory-output-style`, `learning-output-style` |
| 18 | `ralph-loop` |
| 19 | `code-review`, `code-simplifier` |
| 20 | `feature-dev` |
| 21 | `commit-commands` |
| 22 | `claude-code-setup` |
| 23 | `skill-creator`, `frontend-design`, `mcp-server-dev`, `agent-sdk-dev`, `mcp-tunnels` |
| 24 | `claude-security`, `code-modernization` |
| 25 | `receipts`, `playground`, `project-artifact` |
| 26 | `math-olympiad`, `math-proof`, `cwc-makers` |
| 27 | `example-plugin` |

Entries 3-14 were read in full. Entries 15-27 were read at the level of manifest, descriptions, `hooks.json` and README, with hook scripts skimmed; each says so where it matters.

---

## Mechanisms

### 1. Marketplace manifest conventions

- **What it is.** Four conventions visible in [`marketplace.json`][mp] and the [README][readme]. (a) **Manifest-only entries**: the 12 LSP plugins have no `plugin.json`; the entry itself carries `"strict": false` and an inline `lspServers` map, and the folder holds only a README and a licence ([`csharp-lsp` entry, L1211-L1229][mp-csharp]). The docs confirm: with no `plugin.json`, "the entry is the manifest, regardless of `strict`" (`plugins-reference.md`). (b) **Immutable names plus a `renames` map**: "The `name` field in a marketplace entry is an **immutable slug**"; a rename goes in a top-level `renames` map so "existing installs auto-migrate" ([README][readme]). (c) **SHA-pinned external sources**: 98 entries use a `git-subdir` source with `ref` and `sha`. (d) **Local relative sources** for the in-repo plugins (`"source": "./plugins/hookify"`).
- **Kind**: manifest-packaging.
- **Proposed address**: idea-only input to the install ticket (#18).
- **Why it could fit.** If packs ship as plugins, (b) is a rule worth adopting from day one: a pack's slug is what `enabledPlugins` keys on in every project, so renaming a pack breaks each project's opt-in. (a) shows the cheapest possible plugin: a marketplace entry with no files, enough to ship one LSP config or one hook.
- **Why it might not.** The owner's install direction is individual skill files per project, with plugins only for what must be reachable everywhere (map Notes). Manifest-only entries are Claude-only; Codex's handling of `strict: false` is still unchecked ([anthropic-skills ledger](anthropic-skills.md) entry 23).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [anthropic-skills ledger](anthropic-skills.md) entry 23 (path-listed plugin slices); [`vendoring.md`](../vendoring.md) (SHA-pinned `git-subdir` entries for unmodified plugins); fork "Plugin and marketplace manifests" ([fork ledger](mattpocock-skills-unity.md)).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: carry "pack slugs are immutable; use `renames` if one must change" and "a manifest-only entry can ship a single LSP or hook config" into #18.

### 2. Marketplace CI: policy scan, frontmatter validation, SHA bumps, licence check

- **What it is.** Nine workflows under [`.github/`][ci]. The notable ones: **Scan Plugins** runs an LLM reviewer over each changed plugin with [`policy/prompt.md`][ci-policy] and a JSON verdict schema ([`schema.json`][ci-schema]) whose required fields include `has_broad_scope_hooks`, `has_undisclosed_telemetry`, `description_matches_behavior`, `may_download_additional_software`. The prompt tells the reviewer to "Read the WHOLE shipped payload, not only the loaded surface", to list every hook and "**read the source file** the hook points at", and sets `has_broad_scope_hooks=true` when "A `UserPromptSubmit`, `PreToolUse`, or `PostToolUse` hook runs without a project-relevance gate" ([L73-L109][ci-policy-hooks]). **Validate Frontmatter** parses agent, skill and command frontmatter and requires `name` + `description` ([`validate-frontmatter.ts`][ci-fm]); it pre-quotes values containing YAML special characters so glob patterns parse. **Bump Plugin SHAs** runs nightly: for each external entry whose upstream moved, it validates at the new SHA with `claude plugin validate` and opens one PR per plugin ([`bump-plugin-shas.yml`][ci-bump]). **Validate Licenses** checks every plugin ships an Apache-2.0 `LICENSE` ([`validate-licenses.yml`][ci-lic]).
- **Kind**: CI-eval + convention doc.
- **Proposed address**: idea-only input to the maintenance ticket (#17).
- **Why it could fit.** The policy prompt is a ready, vendor-written review checklist for anything the owner vendors or installs. Its hook section lines up with the owner's hook gate: "gated to projects relevant to the plugin's stated purpose" is gate 1 (prints nothing when it doesn't apply) seen from the privacy side. The one-PR-per-moved-pin sweep is the shape upstream-drift detection needs: a failing bump stays isolated.
- **Why it might not.** The scan and validate jobs call composite actions in another repo (`anthropics/claude-plugins-community`, pinned by SHA) that were not read. The prompt is written for a public directory ("handles user data responsibly"), so half of it (telemetry disclosure, AUP) is irrelevant to a personal collection. An LLM verdict is not a deterministic check.
- **Copy / adapt / idea-only**: adapt the prompt's Part 2 as a short checklist; idea-only for the rest. The workflows can't be copied because their working parts live in the unread external actions.
- **Overlap**: Sentry's `skill-scanner` and agnix's validity rules ([maintenance-tooling ledger](maintenance-tooling.md) entries 12 and 2-4); fork `scripts/check.mjs` and `validate-plugin` ([fork ledger](mattpocock-skills-unity.md)); [`vendoring.md`](../vendoring.md) on drift.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: add the prompt's hook questions (unconditional or gated; network calls; data read beyond purpose; does the description disclose it) to the vendoring review step, next to Sentry's scanner. Note the per-pin bump PR as one option for drift detection in #17.

---

## Plugins read in depth

### 3. `hookify`: the rule engine and its four hooks

- **What it is.** One generic Python engine wired to four events with **no matcher**: `PreToolUse`, `PostToolUse`, `Stop`, `UserPromptSubmit`, each `python3 "${CLAUDE_PLUGIN_ROOT}/hooks/<event>.py"` with a 10-second timeout ([`hooks.json`][hk-hooks]). On each firing it globs `.claude/hookify.*.local.md` relative to the working directory ([`config_loader.py` L210][hk-loader-glob]), parses a hand-written YAML subset, and matches `conditions` (field + operator + pattern; operators `regex_match`, `contains`, `equals`, `not_contains`, `starts_with`, `ends_with`) against the hook input ([`rule_engine.py`][hk-engine]). A rule is a markdown file: frontmatter `name`, `enabled`, `event` (`bash` / `file` / `stop` / `prompt` / `all`), `pattern` or `conditions`, `action` (`warn` / `block`), and a body that is the message ([examples][hk-examples]). Rules are re-read on every firing, so edits apply at once. Errors are swallowed: every script ends "ALWAYS exit 0 - never block operations due to hook errors" ([`pretooluse.py` L60-L62][hk-pre]). With no matching rule the script prints `{}`.
- **Kind**: hook + script.
- **Proposed address**: idea-only. As shipped it could only be *project* always-on (rules live in the project's `.claude/`); there is no user-scope rule folder, so it cannot be core.
- **Why it could fit.** The shape is attractive for a one-person collection: a new guard is a 10-line markdown file, not a new script and a settings edit. `enabled: false` is a per-rule switch. It is silent when nothing matches, which is the vibe-wise pattern the always-on decision chose. Rule files double as a readable list of "things the agent got wrong here", which is the evidence the text gate asks for.
- **Why it might not.** Measured against the [hook gate](https://github.com/Hissal/skill-collection/issues/14):

  | Gate | Result | Evidence |
  |---|---|---|
  | 1. Prints nothing when it doesn't apply | Pass in the healthy state: `{}` adds no context. Fail when broken: an import error prints a `systemMessage` on every firing ([`pretooluse.py` L20-L24][hk-pre]) | code |
  | 2. No per-turn reinforcement | Pass by itself. It still spawns a Python process twice per tool call and once per prompt and stop, on every tool, because no hook has a matcher | [`hooks.json`][hk-hooks] |
  | 3. Fails open | Pass by design | `sys.exit(0)` in `finally` |
  | 4. Ships block and allow test cases | **Fail.** No tests; only `__main__` smoke prints. The README lists "Hook testing utilities" under "Future Enhancements" ([L330-L336][hk-readme]) | tree |
  | 5. Both harnesses, or Claude-only on purpose | **Claude-only.** And inside Claude it covers `Bash`, `Edit`, `Write`, `MultiEdit` only; a `PowerShell` tool call matches no `bash` rule ([L38-L41][hk-pre]) | code |

  Defects found by reading the code against the hooks docs (*inference*: none was run):
  - **Warnings may never reach the model.** A `warn` match returns only `{"systemMessage": …}` ([`rule_engine.py` L86-L91][hk-engine-warn]). The docs define `systemMessage` as a "Warning message shown to the user". The README claims "Claude sees the message".
  - **A block carries no reason for the model.** A `PreToolUse` block returns `permissionDecision: "deny"` with the message in `systemMessage` and no `permissionDecisionReason` ([L72-L79][hk-engine-block]); the docs say the reason is what is "shown to Claude" on deny. The same deny object is emitted for `PostToolUse`, where it is not a decision field.
  - **`prompt` rules cannot match.** The engine reads `input_data.get('user_prompt')` ([L226-L228][hk-engine-fields]); the documented `UserPromptSubmit` input field is `prompt`. A simple `pattern:` on a `prompt` or `stop` rule is mapped to a field named `content` ([`config_loader.py` L60-L67][hk-loader-field]), which the engine only resolves for `Write`/`Edit`.
  - **Rules leak across events.** For any tool that is not Bash or an edit tool the event filter is `None`, so *every* enabled rule is evaluated, `stop` rules included ([`pretooluse.py` L37-L44][hk-pre]). The shipped `require-tests-run` example (`event: stop`, `field: transcript`, `not_contains`) would then deny `Read`, `Grep` or `Agent` calls. Its pattern `npm test|pytest|cargo test` is also tested as one literal substring, not as alternatives ([example][hk-ex-stop], [`rule_engine.py` L172-L173][hk-engine]).
  - **Windows.** Rule files are opened without an encoding ([`config_loader.py` L251][hk-loader-open]); every shipped example has emoji, which fails to decode under the default Windows code page unless UTF-8 mode is on, and a failed rule is skipped with a message on stderr only. `python3` on the owner's machine is the `WindowsApps` alias; a sibling plugin's wrapper documents that this alias "fails the probe" under Git Bash and falls back to `python` and `py -3` ([`sg-python.sh`][sg-python]), which `hookify` does not do.
- **Copy / adapt / idea-only**: idea-only. It can't be copied directly: it fails gates 4 and 5, misses the PowerShell tool, has no user-scope rules, and the defects above mean a port is a rewrite. What transfers is the *design*: patterns as data files beside one tested engine, a per-rule `enabled` flag, hot reload, fail-open.
- **Overlap**: the core command guard ([davidondrej ledger](davidondrej-skills.md) entry 2), which already keeps patterns in a data file *and* ships a block/allow harness; karanb192's single-purpose guards and their test conventions ([hook-collections ledger](hook-collections.md) entries 1-6, 10), which that ledger proposes as house style; gstack's `careful` / `freeze` ([gstack ledger](gstack.md) entry 6); `tdd-guard` ([hook-collections](hook-collections.md) entry 30).
- **Idle context cost**: 0 for the hooks. Whole plugin ~325 tokens of descriptions (entry 4). Runtime cost is process spawns, not tokens.
- **Recommendation (proposed)**: do not install. Take two ideas into #17 and the guard's design: "rules are data files, the engine is the tested part" and "each rule file has an `enabled` flag". If the owner wants a generic rule hook later, it is a write-new with tests, not this code.

### 4. `hookify`: `/hookify`, `conversation-analyzer`, `writing-rules`, `list` / `configure` / `help`

- **What it is.** The authoring side. [`/hookify`][hk-cmd] with arguments turns an instruction into a rule file; with none it launches a sub-agent that reads the current conversation for "Explicit requests to avoid something", "Corrections or reversions", "Frustrated reactions" and "Repeated issues" ([L29-L58][hk-cmd]), then asks the user which findings to turn into rules, whether each should warn or block, and which patterns to use ([L62-L80][hk-cmd]). [`conversation-analyzer`][hk-agent] is the agent form of that scan. [`writing-rules`][hk-skill] (374 lines) documents the rule format. `list`, `configure` and `help` manage rule files.
- **Kind**: skill + agent + commands.
- **Proposed address**: idea-only; the mining step would be **core user-invoked** if written new.
- **Why it could fit.** The no-argument mode is a mechanical version of gate 2 of the always-on *text* gate ("the agent was seen getting it wrong without the line"): it finds the observed failures in the transcript and hands the decision to the user per finding. That matches "no blind picks". The agent's frontmatter also shows a cheaper description style: one sentence, then "See 'When to invoke' in the agent body" ([L3][hk-agent]), with the examples moved into the body.
- **Why it might not.** Its only output is a hookify rule. A correction is more often fixed by a skill-description edit or a steering-file line than by a regex (the always-on decision fixed its one observed miss in a description). It scans only the current conversation. The owner already has `retro` in the fork.
- **Copy / adapt / idea-only**: idea-only. Copying would bind the output to the engine in entry 3.
- **Overlap**: fork `retro` and `writing-for-agents` ([fork ledger](mattpocock-skills-unity.md)); `/revise-claude-md` (entry 7); pstack's `correct` ([pstack ledger](pstack.md)); gstack's learnings store ([gstack ledger](gstack.md) entry 9).
- **Idle context cost**: ~325 tokens as published (agent ~150, four commands ~100, `writing-rules` ~80). 0 if rewritten as one user-invoked skill.
- **Recommendation (proposed)**: reject the pieces. Offer one idea to the fork's `retro`: scan the session for corrections and, for each, let the owner choose the fix vehicle (skill description, steering-file line through the text gate, or guard rule through the hook gate).

### 5. `session-report`

- **What it is.** One skill ([`SKILL.md`][sr-skill], 42 lines) plus [`analyze-sessions.mjs`][sr-script] (875 lines, Node standard library only: `fs`, `os`, `path`, `readline`) and an HTML [template][sr-template]. The script walks `~/.claude/projects/**.jsonl` (or `--dir`), with `--since 7d|24h|ISO`, `--top N`, `--cache-break N`, `--json` ([L38-L50][sr-flags]). It reports tokens split into uncached input, cache creation, cache read and output; per project; per **subagent type**; per **skill** (invocation counts from `Skill` tool calls and typed `/commands`, and tokens attributed to the turns that follow, [L287-L292][sr-skilldetect], [L451][sr-slash]); **cache breaks** (any request with more than 100k uncached input tokens, [L386-L389][sr-cachebreak]); and the most expensive prompts including the subagents they spawned. Its header documents transcript quirks it corrects for: one response split over several entries sharing a `requestId` ("We dedupe by requestId … to avoid 3-10x overcounting") and resumed sessions replaying history ([L14-L28][sr-notes]). The skill then has the agent paste the JSON into the template and write 3-5 findings "as a **% of total tokens**" ([L27-L31][sr-skill]). It makes no network call and writes nothing itself; the HTML template loads a Google Font when opened ([L7-L9][sr-template]).
- **Kind**: skill + script.
- **Proposed address**: **core user-invoked** (maintenance tooling), Claude-only on purpose.
- **Why it could fit.** It measures what the map's budget rules need and nothing else here does:
  - *Use per skill.* The "nothing stays enabled at user scope unless the owner uses it" principle needs invocation counts. The [installed-plugins ledger](installed-plugins.md) got them by hand-grepping transcripts; this script does the same with deduplication.
  - *Cost per workflow.* Tokens per skill and average tokens per subagent type say which workflows are actually expensive, which is the input #15 asks for before deciding what to gate.
  - *Cache breaks.* A large uncached request marks a session where the prefix changed, e.g. toggling plugins mid-session.
  It has no dependencies beyond Node, which the owner has. It is one folder with no plugin wiring, so it can be lifted out whole.
- **Why it might not.** It does **not** measure idle description cost; that is `claude plugin details` and `/skill-doctor` ([loading-mechanics §3](../loading-mechanics.md)). Per-skill token attribution is a heuristic: tokens after a skill fires are charged to it until the next plain human message. Codex sessions are invisible to it. The skill's steps use `/tmp`, `cp` and `date`, which resolve in Git Bash but not for the Read tool on Windows (*inference*). As a plugin it is model-invoked (~65 tokens) and can't be flagged otherwise. The transcript format is undocumented ("discovered empirically"), so the script can break on a harness update.
- **Copy / adapt / idea-only**: two workable routes. **Install as-is** from the marketplace, keeping it disabled except when measuring (unmodified plugins go through marketplaces, [`vendoring.md`](../vendoring.md)). Or **copy with provenance** (Apache-2.0: keep `LICENSE` and note changes), add `disable-model-invocation: true`, and replace the `/tmp` steps with a path that works on Windows. Copying is the only way to make it user-invoked.
- **Overlap**: `receipts` (entry 25), which mines the same transcripts for a spend-justification report; karanb192's `context-hogs`, `cache-tax` and `dead-rules-audit` ([hook-collections ledger](hook-collections.md) entries 11-13) and diet103's activation telemetry (entry 24 there); `caveman-stats` ([installed-plugins ledger](installed-plugins.md)); openai plugin-eval's `explain-budget` and observed usage ([maintenance-tooling ledger](maintenance-tooling.md) entries 29-30); the harness's `/skill-doctor`.
- **Idle context cost**: ~65 tokens as a plugin; 0 as a user-invoked copy.
- **Recommendation (proposed)**: adopt as the collection's usage-measurement tool, as a copy with provenance set to user-invoked; decide in the maintenance theme (#17) against the overlapping candidates. Its per-skill use counts feed tripwire reviews and its per-workflow costs feed #15. It has no bearing on #14: it is not always-on.

### 6. `claude-md-management`: `claude-md-improver`

- **What it is.** A model-invoked skill ([`SKILL.md`][cmd-skill], 179 lines, three reference files) that finds every `CLAUDE.md`, scores each out of 100 on six criteria (Commands/workflows 20, Architecture clarity 20, Non-obvious patterns 15, Conciseness 15, Currency 15, Actionability 15; [rubric][cmd-rubric]), prints a "Quality Report" with letter grades, and only then proposes diffs: "**ALWAYS output the quality report BEFORE making any updates**" ([L59][cmd-skill]), "ask user for confirmation before updating" ([L97][cmd-skill]). [`update-guidelines.md`][cmd-guidelines] lists what to add (discovered commands, gotchas, configuration quirks) and what not to (obvious code facts, generic best practice, one-off fixes); its opening line is "The context window is precious - every line must earn its place" ([L5][cmd-guidelines]). [`templates.md`][cmd-templates] gives section templates by project type.
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** Its *currency* check is the useful part: commands in a steering file that no longer run, file references that moved. Nothing in the collection audits that today. The report-before-edit and diff-with-reason flow suits "ledgers propose, the owner decides".
- **Why it might not.** The rubric rewards coverage. 40 of 100 points go to documenting commands and architecture, so a deliberately small file scores badly and the skill proposes additions. That pulls against the owner's 500-token tripwire and the three-part text gate, where a line needs an observed failure. It knows only `CLAUDE.md`: no `AGENTS.md`, no `.claude/rules/`, no Codex. It names `.claude.local.md` ([L28][cmd-skill]) where the harness reads `CLAUDE.local.md` ([loading-mechanics §1](../loading-mechanics.md)), and tells the user about a "`#` key shortcut" ([L157][cmd-skill]) that could not be confirmed in the current docs. Discovery uses `find`. Its "Templates" sections are the generic content the fork's `writing-for-agents` tells authors to avoid.
- **Copy / adapt / idea-only**: idea-only. It can't be copied directly because its scoring would push the owner's steering files the wrong way.
- **Overlap**: agnix's steering-file rules (`CC-MEM-*`, `AGM-*`) and Sentry's `agents-md` ([maintenance-tooling ledger](maintenance-tooling.md) entries 3 and 18); karanb192's `instructions-audit` ([hook-collections ledger](hook-collections.md) entry 9); fork `writing-for-agents` and `setup-matt-pocock-skills` ([fork ledger](mattpocock-skills-unity.md)).
- **Idle context cost**: ~135 tokens (338-char description); plugin ~160 with the command.
- **Recommendation (proposed)**: do not install. Carry one check into #17: "every command and path named in a steering file still exists" (a currency check), and the "what not to add" list as supporting text for the text gate.

### 7. `claude-md-management`: `/revise-claude-md`

- **What it is.** A 54-line command ([`revise-claude-md.md`][cmd-revise]): reflect on "What context was missing that would have helped Claude work more effectively?", find the steering files, draft additions as "one line per concept" because "CLAUDE.md is part of the prompt, so brevity matters" ([L29-L36][cmd-revise]), show each as a diff with a one-line "Why", and "Only edit files they approve" ([L52-L54][cmd-revise]).
- **Kind**: skill (command form).
- **Proposed address**: **core user-invoked** if adapted; otherwise idea-only.
- **Why it could fit.** It is small, costs nothing idle when user-invoked, and already has the right shape: session evidence in, one-line candidates out, the owner approves each. Adding the owner's three text-gate questions as the filter would make it the routine that feeds the 500-token file.
- **Why it might not.** As written it has no gate: anything "that would help future sessions" qualifies, which is how steering files grow. It writes project files only and knows nothing of the collection's single source file for user-scope steering text. The fork's `retro` covers session reflection.
- **Copy / adapt / idea-only**: adapt (it is ~30 lines of prose; Apache-2.0). Change: target the collection's steering source file and project `CLAUDE.md`/`AGENTS.md`; add the text gate ("applies in nearly every session; a failure was observed; no skill or hook could carry it") as a required column; offer "put it in a skill description instead" as an outcome; drop `find`.
- **Overlap**: fork `retro`, `handoff` ([fork ledger](mattpocock-skills-unity.md)); entry 4 (`/hookify` mining); gstack `learn` ([gstack ledger](gstack.md) entry 9); vibe-wise's "Proposed additions" table ([installed-plugins ledger](installed-plugins.md)).
- **Idle context cost**: ~25 tokens as a plugin command; 0 user-invoked.
- **Recommendation (proposed)**: owner's call between adapting it as a small core user-invoked skill and folding its diff-with-why step into the fork's `retro`. Decide with entry 4.

### 8. `pr-review-toolkit`: packaging, `/review-pr`, `code-reviewer`, `code-simplifier`

- **What it is.** Six review agents and one command. [`/review-pr`][prt-cmd] picks which agents apply from the diff ("**If test files changed**: pr-test-analyzer … **If types added/modified**: type-design-analyzer", [L37-L43][prt-cmd]), runs them one at a time by default or in parallel on request, and merges the reports into Critical / Important / Suggestions / Strengths. [`code-reviewer`][prt-cr] (model `opus`) checks the diff against "explicit project rules (typically in CLAUDE.md or equivalent)" and bugs, scores each issue 0-100 and says "**Only report issues with confidence ≥ 80**" ([L41][prt-cr]). [`code-simplifier`][prt-simp] has the same body as the standalone `code-simplifier` plugin (entry 19) with a 2,265-character description.
- **Kind**: skill (agents + command).
- **Proposed address**: idea-only for the fork's `code-review` (core model-invoked today).
- **Why it could fit.** Two ideas are portable and cheap: selecting review aspects from what the diff contains, and a stated confidence threshold so a review reports few, sure findings. The owner uses `code-review` heavily (110 `pr` and 82 `code-review` invocations in surviving transcripts, [installed-plugins ledger](installed-plugins.md)), so a small improvement there pays back.
- **Why it might not.** Installed, the plugin costs ~2,440 idle tokens for six always-listed agents, and agents cannot be made user-invoked. Several descriptions tell the model to run the agent "proactively", which is the unrequested spend the map wants gated. The fork's `code-review` already runs two axes (Standards and Spec) in parallel sub-agents, and the harness bundles `/code-review`, `/simplify` and `/security-review`. `code-reviewer` and `code-simplifier` pin `model: opus`.
- **Copy / adapt / idea-only**: idea-only. Installing can't be trimmed to the useful agents ([loading-mechanics §3](../loading-mechanics.md)).
- **Overlap**: fork `code-review` ([fork ledger](mattpocock-skills-unity.md)); Sentry `code-review`, `find-bugs`, `code-simplifier` ([maintenance-tooling ledger](maintenance-tooling.md) entry 23); davidondrej's review trio ([davidondrej ledger](davidondrej-skills.md) entry 13); dotnet's test-review skills ([dotnet-skills ledger](dotnet-skills.md)); gstack `test-audit` ([gstack ledger](gstack.md) entry 14); entry 19 here.
- **Idle context cost**: ~2,440 tokens as published (estimate). 0 for ideas merged into an existing skill.
- **Recommendation (proposed)**: reject installing. Offer "report only findings at or above a stated confidence" and "choose axes from the diff" to the review theme as edits to the fork's `code-review`.

### 9. `pr-review-toolkit`: `silent-failure-hunter`

- **What it is.** A 130-line agent ([`silent-failure-hunter.md`][prt-sfh]) that audits error handling in a diff. Its checklist: locate every try/catch, error callback, fallback and default-on-failure; for each ask about logging quality, user feedback, catch specificity ("List every type of unexpected error that could be hidden by this catch block"), fallback behaviour ("Is this a fallback to a mock, stub, or fake implementation outside of test code?") and propagation; then look for "Empty catch blocks", "Catch blocks that only log and continue", "Returning null/undefined/default values on error without logging", "Using optional chaining (?.) to silently skip operations that might fail" ([L80-L86][prt-sfh-hidden]). Output per issue: location, severity, hidden errors, user impact, fix, example.
- **Kind**: skill (agent).
- **Proposed address**: idea-only; if adapted, a reference file under the fork's `code-review` or `diagnosing-bugs` (no idle cost).
- **Why it could fit.** Swallowed errors are a real failure class in agent-written code, and the checklist is language-neutral enough to restate for C#: empty `catch`, `catch (Exception)` that logs and continues, defaults returned on failure, `?.` chains. *Inference*: in Unity the `?.` item needs its own wording, because null-conditional access on `UnityEngine.Object` bypasses Unity's overloaded null check; the fork's Unity skills would own that line.
- **Why it might not.** The agent is written for Anthropic's own TypeScript codebase: "logForDebugging (user-facing), logError (Sentry), logEvent (Statsig)", "Error IDs should come from constants/errorIds.ts" ([L123-L128][prt-sfh]). Its stance is absolute ("zero tolerance", "Call out every instance … no matter how minor"), which fights the confidence threshold in entry 8 and produces noise in game code where a guarded fallback is often intended. The description is 1,428 characters (~555 tokens).
- **Copy / adapt / idea-only**: adapt the checklist only (about 15 lines, Apache-2.0). Change: C# and Unity wording, drop the Sentry/Statsig/error-ID lines, replace "every instance" with the review's confidence rule.
- **Overlap**: fork `code-review`, `diagnosing-bugs` ([fork ledger](mattpocock-skills-unity.md)); dotnet `csharp-refactoring` and the test-review skills ([dotnet-skills ledger](dotnet-skills.md)); the "never weaken tests" candidate one-liner the always-on decision did not admit (this agent's L128 says the same: "Tests should not be fixed by disabling them").
- **Idle context cost**: ~555 tokens as published; 0 as a reference file.
- **Recommendation (proposed)**: adapt the checklist as an optional "error handling" axis or reference in the fork's `code-review`. Decide in the review theme.

### 10. `pr-review-toolkit`: `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer`

- **What it is.** Three narrower review agents. [`pr-test-analyzer`][prt-test]: "behavioral coverage rather than line coverage", rate each suggested test 1-10 by what it would catch ([rating guide L51-L56][prt-test]), flag tests "too tightly coupled to implementation". [`type-design-analyzer`][prt-type]: list a type's invariants, then rate four things 1-10: Encapsulation, Invariant Expression, Invariant Usefulness, Invariant Enforcement ([L32-L54][prt-type]); principles include "Types should make illegal states unrepresentable". [`comment-analyzer`][prt-comment]: check each comment's claims against the code, prefer "why" over "what", flag comments likely to rot; advisory only ("Do not modify code or comments directly").
- **Kind**: skill (agents).
- **Proposed address**: idea-only.
- **Why it could fit.** The four type ratings are a compact vocabulary for reviewing a C# library's public types. The test agent's "rate by the regression it prevents" is a usable rule against coverage-chasing.
- **Why it might not.** Each overlaps something the owner already has: `codebase-design` (deep modules, seams) for types, `tdd` and `unity-testing` for tests. `comment-analyzer` presumes a codebase with many doc comments. Together they are ~610 idle tokens.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `codebase-design`, `tdd`, `unity-testing`, `code-review` ([fork ledger](mattpocock-skills-unity.md)); dotnet's merged test-review candidate and `testability-obstacle` ([dotnet-skills ledger](dotnet-skills.md)); gstack `test-audit` with its "test value bar" ([gstack ledger](gstack.md) entry 14).
- **Idle context cost**: ~200 + ~215 + ~195 tokens as published.
- **Recommendation (proposed)**: reject as pieces. Offer the four invariant questions to `codebase-design` and "rate a missing test by the bug it would catch" to the test-review theme, both as one-line additions.

### 11. `plugin-dev`: seven skills

- **What it is.** `hook-development`, `skill-development`, `plugin-structure`, `plugin-settings`, `command-development`, `agent-development`, `mcp-integration`: seven model-invoked reference skills, each a 400-900-line `SKILL.md` with `references/` and `examples/` (60 files, ~550 KB in the plugin; [README][pd-readme]). [`skill-development`][pd-skilldev] restates the older skill-creator guide and adds firm style rules: descriptions "must use third person" in the form "This skill should be used when the user asks to "create X", "configure Y"..." ([L382-L395][pd-skilldev-third]), bodies in imperative form, "1,500-2,000 words ideal, <5k max", metadata "Always in context (~100 words)" ([L79-L83][pd-skilldev-pd]). It ships the superseded guide as `references/skill-creator-original.md`.
- **Kind**: skill (reference docs).
- **Proposed address**: none in the collection. At most a plugin installed disabled at user scope and enabled only in this repo (the pack mechanism in [loading-mechanics §3](../loading-mechanics.md)), Claude-only.
- **Why it could fit.** The owner builds hooks and possibly plugins for this collection; `hook-development` and `plugin-structure` are worked examples in one place.
- **Why it might not.** ~1,170 idle tokens for the skills, ~2,570 for the plugin, and no way to take one skill. It trails the docs: its hook validator knows 9 events where the hooks reference documents many more (`UserPromptExpansion`, `PostToolUseFailure`, `PreModelSwitch`, `Setup`, `StopFailure` …), and its agent reviewer calls `when_to_use` deprecated while the skills docs list it ([loading-mechanics §1](../loading-mechanics.md)). The official docs are the primary source and the owner's global instructions already say to quote them from raw markdown. Its description rule (enumerate quoted trigger phrases) yields 290-525-character descriptions, against the fork's `writing-for-agents` and the idle budget. The same repo contradicts it: `hookify`'s and `pr-review-toolkit`'s newer agents use one short sentence and move scenarios into a "When to invoke" body section ([hookify agent L3][hk-agent]).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `skill-creator` and its authoring conventions ([anthropic-skills ledger](anthropic-skills.md) entries 1 and 10, including the "pushy descriptions" open question); fork `writing-for-agents`; davidondrej `effective-agent-skills` ([davidondrej ledger](davidondrej-skills.md) entry 6); Sentry `skill-writer` ([maintenance-tooling ledger](maintenance-tooling.md) entry 13); dotnet's four authoring rules ([dotnet-skills ledger](dotnet-skills.md)).
- **Idle context cost**: ~1,170 tokens for the seven skills (117-207 each).
- **Recommendation (proposed)**: reject for the collection. Record for the skill-writing theme that "trigger examples belong in the body, not the description" now has first-party examples on the owner's side of the description debate.

### 12. `plugin-dev`: hook scripts and the `.local.md` settings pattern

- **What it is.** Two reusable mechanisms inside the plugin. (a) Three bash scripts under [`hook-development/scripts/`][pd-scripts]: `validate-hook-schema.sh` (JSON shape, event names, hook types, timeouts, hard-coded paths), `test-hook.sh` (run one hook script against a sample input JSON with the plugin environment variables set, time it, check the exit code and that stdout is JSON; `--create-sample <event>` writes a sample input) and `hook-linter.sh` (greps a hook script for a shebang, `set -euo pipefail`, stdin reading, `jq` use, unquoted variables, explicit `exit 0`/`exit 2`, stderr for errors). (b) The [`plugin-settings`][pd-settings] skill documents the convention `hookify` and `ralph-loop` use: per-project state in `.claude/<plugin-name>.local.md`, YAML frontmatter for settings and a markdown body for free text, gitignored, read by hooks with `sed`/`grep`, with "if the file doesn't exist, exit 0" as the quick path.
- **Kind**: script (test harness) + convention doc.
- **Proposed address**: idea-only inputs to #17 (hook tests) and #18 (how a project opts in).
- **Why it could fit.** (a) Hook gate 4 needs block and allow cases; `test-hook.sh` is the minimal runner shape: payload file in, exit code and JSON out. (b) The `.local.md` file is a concrete opt-in marker for the "hook that stays silent unless the repo qualifies" the always-on decision chose for packs: absent file, silent hook.
- **Why it might not.** The scripts need bash and `jq` (not on the owner's machine) and encode stale rules (9 events; only `command`/`prompt` hook types). The linter's checks are bash-specific, while the owner's guard is headed for a PowerShell-aware port. The davidondrej and karanb192 harnesses are richer and already proposed. A `.local.md` marker is per-machine and gitignored, so a pack hook that keys on it does not travel with the repo; keying on repo content (a `ProjectSettings/` folder for Unity) needs no marker at all.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `test-guard.sh` ([davidondrej ledger](davidondrej-skills.md) entry 2); karanb192's guard conventions and test machinery ([hook-collections ledger](hook-collections.md) entry 10); agnix `CC-HK-*` rules ([maintenance-tooling ledger](maintenance-tooling.md) entry 4); vibe-wise's `.vibe-wise/profile.md` opt-in ([installed-plugins ledger](installed-plugins.md)).
- **Idle context cost**: n/a for the scripts; `plugin-settings` ~160 tokens as a skill.
- **Recommendation (proposed)**: nothing to copy. Note for #18 that both of Anthropic's own stateful plugins key their hooks on a project-local file and exit silently without it, which supports the silent-unless-qualified pattern; prefer repo content over a marker file where the repo can be recognised.

### 13. `plugin-dev`: `agent-creator`, `plugin-validator`, `skill-reviewer`, `/create-plugin`

- **What it is.** Three agents and an eight-phase scaffolding command. [`plugin-validator`][pd-validator] checks manifest, layout, frontmatter and hook JSON by reading files. [`skill-reviewer`][pd-reviewer] reviews a skill against the rules in entry 11 (third-person description with trigger phrases, 50-500 characters, body 1,000-3,000 words, progressive disclosure). `agent-creator` generates agent files. Each agent's description embeds three or four `<example>` dialogues (~1,150 characters each).
- **Kind**: skill (agents + command).
- **Proposed address**: none.
- **Why it could fit.** A reviewer for skills is something #17 wants.
- **Why it might not.** ~1,360 idle tokens for three agents the owner would call a few times a year. `claude plugin validate` and agnix cover validation deterministically. `skill-reviewer` enforces the description style the fork rejects and a stale field note ([L57][pd-reviewer]).
- **Copy / adapt / idea-only**: reject.
- **Overlap**: `claude plugin validate`; agnix `CC-PL-*`, `CC-AG-*`, `CC-SK-*` ([maintenance-tooling ledger](maintenance-tooling.md) entries 2 and 4); fork `validate-plugin` ([fork ledger](mattpocock-skills-unity.md)); `skill-creator`'s grader ([anthropic-skills ledger](anthropic-skills.md) entry 3).
- **Idle context cost**: ~450 + ~460 + ~450 for the agents, ~40 for the command.
- **Recommendation (proposed)**: reject.

### 14. `csharp-lsp`

- **What it is.** A manifest-only plugin: the marketplace entry declares one language server, command `csharp-ls` for `.cs` files, with no arguments, no `startupTimeout` and `"strict": false` ([marketplace.json L1211-L1229][mp-csharp]); the folder holds a 25-line [README][cs-readme] and a licence. The binary is not shipped: "`dotnet tool install --global csharp-ls`", "Requirements: .NET SDK 6.0 or later" ([L10-L21][cs-readme]). `csharp-ls` is the community Roslyn-based server `razzmatazz/csharp-language-server`. What the harness does with it, from the docs: Claude Code "takes the language server's configuration from the plugin, and you install the server binary yourself"; "After each file edit, it automatically reports type errors and warnings so Claude can fix issues without a separate build step"; and the `LSP` tool gains go-to-definition, find-references, type info, file and workspace symbols, implementations and call hierarchies (`tools-reference.md`, "LSP tool behavior"). "The language server starts the first time Claude edits a file with one of the plugin's extensions" (`plugins/code-intelligence.md`). The tool "is read-only".
- **Kind**: manifest-packaging (LSP declaration).
- **Proposed address**: **C# pack**, installed at user scope disabled and enabled per project. It has no always-on / model-invoked / user-invoked form: it is a tool surface plus automatic diagnostics. Claude-only on purpose.
- **Why it could fit.** C# is the owner's main language. Diagnostics after an edit replace a build round-trip, which in Unity means an editor recompile. Find-references and rename-by-binding are the top of the tool ladder that dotnet's `csharp-refactoring` asks for ([dotnet-skills ledger](dotnet-skills.md) entry on `csharp-refactoring`). It costs no description tokens. Unlike the `dotnet` plugin's Roslyn declaration, which runs `dnx roslyn-language-server --yes --prerelease` at start ([dotnet-skills ledger](dotnet-skills.md) entry 13), nothing is downloaded by the harness here: the owner installs and updates the binary. The owner has the .NET SDK 10.0.201 and `~/.dotnet/tools` on `PATH`; `csharp-ls` itself is not installed (`which`, 2026-10-10).
- **Why it might not.**
  - **Unity is untested.** A Roslyn server needs a solution or project file. Unity generates `.sln`/`.csproj` through its IDE package, so they can be missing or stale, and *inference*: stale project files give false "type not found" diagnostics pushed into context after every edit. The docs warn generally that servers "index the whole project" and offer only "Disable the plugin" for memory problems (`plugins/troubleshooting.md`).
  - **Diagnostics cost context.** They are pushed after each edit; the per-server `diagnostics: false` switch exists (`plugins-reference.md`, `lspServers`) but the official entry does not expose it, so turning it off means the owner's own manifest entry.
  - **No startup timeout** is set, where `jdtls-lsp` and `kotlin-lsp` set 120000 ms and dotnet's Roslyn entry uses a 120-second warm-up. Whether a large solution loads in time was not tested.
  - The README's ".NET SDK 6.0 or later" was not checked against the current `csharp-ls` release.
  - The owner already has an IDE route (a `rider` MCP server is configured; it failed to connect in this session too).
  - Codex gets nothing. "In cloud sessions, Claude Code doesn't start plugin language servers."
- **Copy / adapt / idea-only**: install as-is. If Unity needs different settings (`args`, `workspaceFolder`, `startupTimeout`, `diagnostics`), the adaptation is a ~10-line manifest-only entry of the owner's own (entry 1), not a fork.
- **Overlap**: the Roslyn LSP declaration in dotnet's `dotnet` plugin ([dotnet-skills ledger](dotnet-skills.md) entry 13). Both claim `.cs`; with both enabled "the first registered handles those files and the other isn't used" (`plugins/components.md`). The [unity-baseline](../unity-baseline.md) and the fork ship no language server. `unity-verification` (fork) covers compile checks through the editor.
- **Idle context cost**: 0 description tokens. The `LSP` tool definition and the per-edit diagnostics were not measured.
- **Recommendation (proposed)**: trial as-is in a C# library repo first, then in the Unity sandbox with generated project files; adopt for the C# pack only if the Unity trial gives true diagnostics. This also settles two "not checked" points in the dotnet ledger: Claude Code does launch plugin `lspServers` entries by command name from `PATH`, and the cost is per-edit diagnostics rather than idle text.

---

## Other Anthropic-authored plugins

These entries are shorter by the ticket's brief. Unless an entry says otherwise, each was read at the level of manifest, frontmatter, `hooks.json` and README.

### 15. The other eleven LSP plugins

- **What it is.** `clangd-lsp`, `gopls-lsp`, `jdtls-lsp`, `kotlin-lsp`, `lua-lsp`, `php-lsp`, `pyright-lsp`, `ruby-lsp`, `rust-analyzer-lsp`, `swift-lsp`, `typescript-lsp`: the same manifest-only shape as entry 14, each naming one server binary the user installs ([marketplace.json][mp]).
- **Kind**: manifest-packaging (LSP declaration).
- **Proposed address**: `typescript-lsp` only, as a **web pack** companion enabled per project; the rest none.
- **Why it could fit.** Web apps are the owner's third kind of work; `typescript-lsp` gives the same diagnostics-after-edit benefit there (`typescript-language-server --stdio` for `.ts`/`.tsx`/`.js`/`.jsx` and module variants).
- **Why it might not.** A web pack is not decided (map, "Web pack sources"). The other ten languages are outside the owner's stack. `lua-lsp` would matter only for a Lua-scripted game project.
- **Copy / adapt / idea-only**: install as-is, if at all.
- **Overlap**: none in the other ledgers.
- **Idle context cost**: 0 description tokens each; per-edit diagnostics as in entry 14.
- **Recommendation (proposed)**: defer `typescript-lsp` to the web-pack decision; reject the other ten as out of stack.

### 16. `security-guidance`

- **What it is.** Three layers of security review driven entirely by hooks ([README][sg-readme], [`hooks.json`][sg-hooks]): regex "pattern warnings" on `Edit`/`Write` for ~25 dangerous patterns; an LLM review of the turn's diff on every `Stop` ("the newest Opus by default"); and an agentic reviewer on `git commit` / `git push` (matched with `if: "Bash(git commit:*)"` and similar, run with `asyncRewake`). A `SessionStart` hook with a 180-second timeout makes sure the Agent SDK is importable and otherwise "creates a venv at ~/.claude/security/agent-sdk-venv and installs the SDK there" ([`ensure_agent_sdk.py`][sg-ensure]). A `UserPromptSubmit` hook runs on every prompt to capture a git baseline with `git stash create`. A kill switch and per-layer switches are environment variables. It ships tests (over 100 test functions) and a wrapper, [`sg-python.sh`][sg-python], that probes `python3`, then `python`, then `py -3` because "On Windows + Git Bash, `python3` typically resolves to the Microsoft Store stub".
- **Kind**: hook.
- **Proposed address**: none for core. At most a **web pack** hook, enabled per project.
- **Why it could fit.** Its vulnerability classes (injection, XSS, SSRF, IDOR, hard-coded secrets) are web classes; in a web-app repo an automatic diff review is real value. The Python-probe wrapper and the `if:`-narrowed, `asyncRewake` hooks are good hook-engineering patterns for the owner's own hooks on Windows.
- **Why it might not.** Against the hook gate it is the opposite of silent: it acts on every prompt and every stop, makes model calls the owner pays for at each stop, and installs software at session start. For Unity and C# library work its patterns (`yaml.load`, `torch.load`, `innerHTML`) rarely apply. Hook scripts were skimmed, not read in full (the main script is ~2,300 lines).
- **Copy / adapt / idea-only**: install as-is or not at all; idea-only for the wrapper.
- **Overlap**: the harness's bundled `/security-review`; Sentry `security-review` ([maintenance-tooling ledger](maintenance-tooling.md) entry 24); karanb192 `protect-secrets` ([hook-collections ledger](hook-collections.md) entry 4); `claude-security` (entry 24).
- **Idle context cost**: 0 descriptions. Output cost is per finding; API cost is per stop (not measured).
- **Recommendation (proposed)**: reject for core and the Unity pack; park for the web-pack decision. Carry the `python3` → `python` → `py -3` probe into the notes for any Python hook the collection ships on Windows.

### 17. `explanatory-output-style`, `learning-output-style`

- **What it is.** Each is one `SessionStart` hook with no matcher that prints a fixed `additionalContext` block: ~1.3k characters of "explanatory mode" instructions, or ~3.3k characters of "learning mode" instructions asking the user to write code at decision points ([explanatory][eos-hook], [learning][los-hook]). The manifests say they mimic "the deprecated Explanatory output style" and "the unshipped Learning output style".
- **Kind**: hook (static injection).
- **Proposed address**: none.
- **Why it could fit.** A two-file template for turning static text into session context.
- **Why it might not.** The always-on decision lists "SessionStart injection of static text" under **Not used**. With no matcher the hook also fires on resume, clear and compact (*inference* from [loading-mechanics §4](../loading-mechanics.md)), roughly 400 and 1,000 tokens each time (estimate). vibe-wise's `learn`, already installed, does the learning job opt-in and silent by default ([installed-plugins ledger](installed-plugins.md)).
- **Copy / adapt / idea-only**: reject.
- **Overlap**: caveman's SessionStart ruleset and vibe-wise ([installed-plugins ledger](installed-plugins.md)); superpowers' bootstrap ([superpowers ledger](superpowers.md)).
- **Idle context cost**: 0 descriptions; ~400 / ~1,000 tokens of hook output per session start (estimate).
- **Recommendation (proposed)**: reject both; they are the pattern the always-on decision ruled out.

### 18. `ralph-loop`

- **What it is.** A `Stop` hook that turns one session into a loop ([README][rl-readme], [`stop-hook.sh`][rl-hook]). `/ralph-loop "<prompt>" --completion-promise "DONE" --max-iterations N` writes `.claude/ralph-loop.local.md`; while that file exists the hook blocks each stop and feeds the same prompt back, until the last assistant message contains `<promise>DONE</promise>` or the iteration cap is hit. The hook is silent when the state file is absent. It needs bash, `jq` and `perl`; the README notes it "requires Git for Windows".
- **Kind**: hook + commands.
- **Proposed address**: idea-only; if ever wanted, **core user-invoked**.
- **Why it could fit.** It is the smallest working "keep going until a stated condition" loop, and it follows the silent-unless-state-file pattern.
- **Why it might not.** The stop condition is a string the model prints, which is the reward-hacking risk davidondrej's `goal-loop` contract exists to forbid ("verifiable stop condition", [davidondrej ledger](davidondrej-skills.md) entry 10). The harness now bundles `/loop`. `jq` is not on the owner's machine.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `goal-loop` ([davidondrej ledger](davidondrej-skills.md) entry 10); fork `implement`, `loop-me` ([fork ledger](mattpocock-skills-unity.md)); the bundled `/loop`.
- **Idle context cost**: ~55 tokens (three commands).
- **Recommendation (proposed)**: reject; keep "loop state in a project-local file, hook silent without it" as one more instance of the pattern in entry 12.

### 19. `code-review`, `code-simplifier`

- **What it is.** [`code-review`][cr-cmd] is one command that reviews a GitHub PR: a Haiku agent checks eligibility, five parallel Sonnet agents review from different angles (CLAUDE.md compliance, shallow bug scan, git blame and history, comments on earlier PRs touching the same files, in-code comments), then **a separate Haiku agent scores each finding 0-100** against a verbatim rubric and anything under 80 is dropped before the result is posted with `gh pr comment`. [`code-simplifier`][cs-agent] is one `opus` agent that simplifies recently changed code; its standards are JavaScript ones ("Use ES modules", "Prefer `function` keyword over arrow functions", "React component patterns").
- **Kind**: skill (command; agent).
- **Proposed address**: idea-only for the fork's `code-review`.
- **Why it could fit.** Scoring findings in a *separate* pass, by an agent that did not raise them, is a stronger filter than self-rated confidence (entry 8). "Read earlier PRs that touched these files for comments that still apply" is a review angle the fork does not have.
- **Why it might not.** The command posts to the PR on its own, hard-codes model tiers, and its ten-plus sub-agents make it an expensive workflow that is model-invocable as published (`disable-model-invocation: false`). `code-simplifier`'s rules are for TypeScript/React. The harness bundles `/code-review` and `/simplify`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `code-review`; entry 8; davidondrej `total-review` ("Agreement alone does not prove an issue is real", [davidondrej ledger](davidondrej-skills.md) entry 13); Addy's `doubt-driven-development` ([addy ledger](addy-agent-skills.md)); Sentry `code-simplifier` ([maintenance-tooling ledger](maintenance-tooling.md) entry 23).
- **Idle context cost**: ~15 and ~70 tokens.
- **Recommendation (proposed)**: reject both plugins; offer "independent scoring pass, drop below a threshold" to the review theme together with entry 8.

### 20. `feature-dev`

- **What it is.** One command, `/feature-dev`, in seven phases (Discovery, Codebase Exploration, Clarifying Questions, Architecture Design, Implementation, Quality Review, Summary) with three `sonnet` agents: `code-explorer`, `code-architect`, `code-reviewer` ([command][fd-cmd]). Notable rule: "When launching agents, ask them to return lists of the most important files to read. After agents complete, read those files".
- **Kind**: skill (command + agents).
- **Proposed address**: none.
- **Why it could fit.** "Sub-agents return a reading list, the main agent reads the files itself" is a cheap way to keep exploration from being lost in a summary.
- **Why it might not.** It is a whole feature workflow that competes with the fork's grill → spec → tickets → implement chain, the same objection the [superpowers ledger](superpowers.md) raised for its chain.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `to-spec`, `to-tickets`, `implement`, `grilling` ([fork ledger](mattpocock-skills-unity.md)); superpowers' brainstorm → plan → execute ([superpowers ledger](superpowers.md)).
- **Idle context cost**: ~295 tokens.
- **Recommendation (proposed)**: reject; note the reading-list rule for sub-agent prompt templates.

### 21. `commit-commands`

- **What it is.** Three commands: `/commit`, `/commit-push-pr`, `/clean_gone` ([commit][cc-commit]). They inject `git status`, `git diff HEAD` and the recent log as inline shell output and restrict tools with `allowed-tools: Bash(git add:*), …`. They state no commit-message convention.
- **Kind**: skill (commands).
- **Proposed address**: none.
- **Why it could fit.** `/clean_gone` (delete local branches whose remote is gone, with their worktrees) is a tidy utility. Pre-injected context plus a narrow tool allow-list is a good shape for small user-invoked skills.
- **Why it might not.** The owner's naming convention lives in the core always-on text and the fork's `pr` skill covers PR bodies; these commands know neither.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `pr` ([fork ledger](mattpocock-skills-unity.md)); Sentry `commit`, `create-branch`, `pr-writer` ([maintenance-tooling ledger](maintenance-tooling.md) entry 22); davidondrej `git-worktree` ([davidondrej ledger](davidondrej-skills.md) entry 14).
- **Idle context cost**: ~90 tokens.
- **Recommendation (proposed)**: reject.

### 22. `claude-code-setup`

- **What it is.** One read-only skill, [`claude-automation-recommender`][ccs-skill], that inspects a repo and recommends "1-2 of each type" of automation (hooks, subagents, skills, plugins, MCP servers) from reference lists and web search. "It does NOT create or modify any files."
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** A per-repo "which pack pieces apply here" pass is a real need once packs exist.
- **Why it might not.** It recommends from the public ecosystem, not from the owner's catalog, which is the "blind pick" the map rules out. The fork's `setup-matt-pocock-skills` is the owner's per-repo setup step.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `setup-matt-pocock-skills`, `ask-matt` ([fork ledger](mattpocock-skills-unity.md)); the router question in #15.
- **Idle context cost**: ~140 tokens.
- **Recommendation (proposed)**: reject; note "recommend at most one or two per category" as a restraint rule for any future router.

### 23. `skill-creator`, `frontend-design`, `mcp-server-dev`, `agent-sdk-dev`, `mcp-tunnels`

- **What it is.** `skill-creator` and `frontend-design` wrap skills the [anthropic-skills ledger](anthropic-skills.md) already covers (entries 1-10 and 16), so they are skipped here; `skill-creator` also reaches the owner through the host's synced skills. `mcp-server-dev` is three skills (`build-mcp-server`, `build-mcp-app`, `build-mcpb`) on designing MCP servers. `agent-sdk-dev` is a `/new-sdk-app` command plus two verifier agents for the Claude Agent SDK. `mcp-tunnels` is one command that drives a Docker Compose quickstart for an Anthropic MCP tunnel.
- **Kind**: skill.
- **Proposed address**: none in core. `mcp-server-dev` and `agent-sdk-dev` are possible per-project installs for an agentic-workflows project.
- **Why it could fit.** Agentic workflows are the owner's fourth kind of work; these are first-party and current.
- **Why it might not.** ~530 and ~250 idle tokens for work that is occasional. `mcp-server-dev` overlaps `mcp-builder`; the host already supplies `claude-api`.
- **Copy / adapt / idea-only**: install as-is per project when such a project exists.
- **Overlap**: `mcp-builder`, `claude-api`, `skill-creator`, `frontend-design` ([anthropic-skills ledger](anthropic-skills.md) entries 14, 13, 1, 16).
- **Idle context cost**: `skill-creator` ~130, `frontend-design` ~85, `mcp-server-dev` ~530, `agent-sdk-dev` ~250, `mcp-tunnels` ~55.
- **Recommendation (proposed)**: nothing for the catalog. Install `mcp-server-dev` or `agent-sdk-dev` in a project that needs one, never at user scope.

### 24. `claude-security`, `code-modernization`

- **What it is.** Two large product-style plugins. `claude-security` (46 files, proprietary licence): a tiered vulnerability scan with nine agents that challenge findings and draft patches. `code-modernization` (107 files): a `/modernize` family of 13 commands and 8 agents for legacy-code migration, with a TypeScript hook module that draws panes and maps. Both register hooks that report usage counts: `code-modernization` runs `telemetry.sh` on `UserPromptSubmit`, `Stop`, `SessionStart`, `PostToolUseFailure` and `StopFailure` ([`hooks.json`][cm-hooks]), documented with opt-outs in its README; `claude-security`'s hooks are narrowed with `if:` to its own scripts, `git push` and `gh pr create` ([`hooks.json`][csec-hooks]).
- **Kind**: skill + hook.
- **Proposed address**: none.
- **Why it could fit.** `claude-security`'s "every finding challenged before it is reported" is the same independent-verification idea as entry 19. `code-modernization`'s "independent proof that the new code behaves like the old" is relevant in principle to a Unity version or render-pipeline migration.
- **Why it might not.** ~925 and ~1,430 idle tokens; unmatched telemetry hooks on every prompt and stop; legacy-estate and web-vulnerability focus. Neither was read beyond manifest, hooks and README.
- **Copy / adapt / idea-only**: reject.
- **Overlap**: `security-guidance` (entry 16); Addy's `deprecation-and-migration` ([addy ledger](addy-agent-skills.md)); dotnet's upgrade skills ([dotnet-skills ledger](dotnet-skills.md)).
- **Idle context cost**: ~925 and ~1,430 tokens.
- **Recommendation (proposed)**: reject both.

### 25. `receipts`, `playground`, `project-artifact`

- **What it is.** `receipts`: a skill that mines the same local transcripts as `session-report`, cross-references git history, and writes "a personal Claude Code usage & impact report … for justifying Claude Code usage/spend to a manager". `playground`: builds single-file interactive HTML explorers with controls, a live preview and a copyable prompt. `project-artifact`: publishes a tabbed project status page through the Artifact tool to claude.ai.
- **Kind**: skill.
- **Proposed address**: none; `playground` is an idea for the fork's `prototype`.
- **Why it could fit.** `playground`'s "controls → live preview → copy out a prompt" is a neat way to let the owner tune a parameter visually and hand the result back to the agent.
- **Why it might not.** `receipts` answers a question a solo developer does not have (justifying spend to a manager). `project-artifact` needs claude.ai artifacts and is team-facing. The fork's `prototype` and `unity-prototyping` already cover throwaway prototypes, and Unity prototypes belong in the engine.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `session-report` (entry 5); fork `prototype`, `unity-prototyping` ([fork ledger](mattpocock-skills-unity.md)); `web-artifacts-builder` ([anthropic-skills ledger](anthropic-skills.md) entry 17).
- **Idle context cost**: ~235, ~110, ~355 tokens.
- **Recommendation (proposed)**: reject all three; mention `playground`'s copy-out-a-prompt loop when the prototype theme meets.

### 26. `math-olympiad`, `math-proof`, `cwc-makers`

- **What it is.** Two mathematics plugins (competition problems with adversarial verifiers; long proof attempts with judge and worker sub-agents) and an onboarding plugin for a hardware kit. `math-proof` is the only plugin here whose skills are user-invoked: both set `disable-model-invocation: true` plus `allowed-tools` and `disallowed-tools` ([`solo`][mp-solo]).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** They don't, as content. `math-proof` is a first-party example of an expensive workflow published as user-invoked, which is the map's rule.
- **Why it might not.** Out of the owner's stack.
- **Copy / adapt / idea-only**: reject.
- **Overlap**: none.
- **Idle context cost**: ~275, ~315 (agents only), ~295 tokens.
- **Recommendation (proposed)**: reject.

### 27. `example-plugin`

- **What it is.** The unlisted reference plugin: one legacy command, the same command again as `skills/example-command/SKILL.md` ("functionally identical to the legacy `commands/example-command.md` format — both are loaded the same way; only the file layout differs", [SKILL.md][ex-skill]), one model-invoked skill and an `.mcp.json`.
- **Kind**: manifest-packaging (template).
- **Proposed address**: idea-only.
- **Why it could fit.** It states in first-party words that `commands/` is the legacy layout and `skills/<name>/SKILL.md` the current one, which matters when reading every other plugin here: their 32 commands are old-format user-facing skills.
- **Why it might not.** Nothing beyond what the docs say.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [loading-mechanics](../loading-mechanics.md); fork "Plugin and marketplace manifests".
- **Idle context cost**: n/a (not installable from the marketplace).
- **Recommendation (proposed)**: none; reference only.

---

## Summary of proposals

| Proposal | Entries | Address |
|---|---|---|
| Install as-is, on trial | 14 (`csharp-lsp`: C# library repo first, then the Unity sandbox) | C# pack, enabled per project, Claude-only |
| Adopt as a copy with provenance | 5 (`session-report`, set to user-invoked, Windows paths fixed) | core user-invoked |
| Adapt (small) | 9 (silent-failure checklist into fork `code-review`); 2 (policy prompt's hook questions into the vendoring review) | fork `code-review` reference; #17 |
| Owner's call | 7 (`/revise-claude-md` as its own skill or folded into `retro`); 15 (`typescript-lsp`, with the web pack); 23 (`mcp-server-dev`, `agent-sdk-dev` per project) | core user-invoked; web pack; per project |
| Idea-only | 1, 3, 4, 6, 8, 10, 11, 12, 18, 19, 20, 21, 22, 25, 27 | inputs to #15, #17, #18, the review theme, the skill-writing theme |
| Reject | 13, 16 (for core and Unity), 17, 24, 26, and every plugin above as an installed plugin unless listed in the first two rows | — |

**What this means for the tickets it feeds (proposed, not decided):**

- **#14 (always-on, decided).** Nothing here asks to reopen it. `hookify` fails hook gates 4 and 5; the output-style plugins are the static SessionStart injection the decision ruled out; `security-guidance` is the opposite of silent. One confirmation: Anthropic's own stateful plugins (`hookify`, `ralph-loop`) use the silent-unless-qualified pattern, and its marketplace policy flags hooks that lack a project-relevance gate.
- **#15 (gating).** `hookify`'s `prompt` rules look like a ready prompt-match suggestion hook, but they cannot match as written and they emit a user-facing `systemMessage`, not context. They are no shortcut. `session-report` supplies the missing evidence for what counts as expensive: tokens per skill and per subagent type. `math-proof` shows the first-party way to publish an expensive workflow: `disable-model-invocation: true`.
- **#17 (maintenance).** Candidates: `session-report` as the usage-measurement tool; the marketplace policy prompt as a review checklist for vendored hooks; a steering-file currency check (entry 6); "rules as data files beside a tested engine" for guards; per-pin bump PRs for drift.
- **#18 (install).** `csharp-lsp` needs the pack mechanism (user-scope install, per-project enable) and a binary installed outside the harness. Pack slugs should be treated as immutable (entry 1). A manifest-only marketplace entry is enough to ship an LSP config.

## Not covered and limits

- **Nothing was run.** Every statement about `hookify`'s behaviour comes from reading its code against the hooks docs. The defects in entry 3 are inferences until a sandbox test confirms them.
- **No `claude plugin details` figures.** None of these plugins is installed, so all token figures are the 2.6 chars/token estimate. Whether long agent descriptions are truncated in the listing was not checked.
- **`csharp-ls` itself was not read or installed.** Its current .NET requirement, its behaviour without a solution file and its behaviour on Unity-generated projects are unverified. The token cost of the `LSP` tool definition and of pushed diagnostics is unmeasured.
- **Entries 15-27 were read shallowly**: manifests, frontmatter, `hooks.json`, READMEs. `security-guidance`'s main hook script, `claude-security` and `code-modernization` were not read in full. `receipts`, `playground`, `project-artifact`, the math plugins and `cwc-makers` were read at description level only.
- **The composite actions** the marketplace CI calls (`anthropics/claude-plugins-community`) were not read, so entry 2 describes the workflow files and the prompt, not the scanner.
- **The plugin `skill-creator` was not diffed** against `anthropics/skills` at the SHA the anthropic-skills ledger used.
- **`external_plugins/` and remote marketplace entries** are out of scope.
- **Codex**: no check was made of whether any of these plugins load in Codex. They are treated as Claude-only because of what they are built from.
- The `#` shortcut that `claude-md-improver` recommends could not be confirmed or refuted from the docs pages fetched.

[root]: https://github.com/anthropics/claude-plugins-official/tree/b8e53f1c05dff3b6d751297f6527990ffc81c2f4
[readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/README.md
[readme-bundle]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/README.md#L60-L88
[mp]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.claude-plugin/marketplace.json
[mp-csharp]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.claude-plugin/marketplace.json#L1211-L1229
[ci]: https://github.com/anthropics/claude-plugins-official/tree/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github
[ci-policy]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/policy/prompt.md
[ci-policy-hooks]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/policy/prompt.md#L73-L109
[ci-schema]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/policy/schema.json
[ci-fm]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/scripts/validate-frontmatter.ts
[ci-bump]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/workflows/bump-plugin-shas.yml
[ci-lic]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/.github/workflows/validate-licenses.yml
[hk-readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/README.md
[hk-hooks]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/hooks/hooks.json
[hk-pre]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/hooks/pretooluse.py
[hk-loader-glob]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/config_loader.py#L210
[hk-loader-field]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/config_loader.py#L60-L67
[hk-loader-open]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/config_loader.py#L251
[hk-engine]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/rule_engine.py
[hk-engine-warn]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/rule_engine.py#L86-L91
[hk-engine-block]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/rule_engine.py#L72-L79
[hk-engine-fields]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/core/rule_engine.py#L226-L228
[hk-examples]: https://github.com/anthropics/claude-plugins-official/tree/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/examples
[hk-ex-stop]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/examples/require-tests-stop.local.md
[hk-cmd]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/commands/hookify.md
[hk-agent]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/agents/conversation-analyzer.md
[hk-skill]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/hookify/skills/writing-rules/SKILL.md
[sr-skill]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/SKILL.md
[sr-script]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs
[sr-flags]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs#L38-L50
[sr-skilldetect]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs#L287-L292
[sr-slash]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs#L451
[sr-cachebreak]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs#L386-L389
[sr-notes]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/analyze-sessions.mjs#L14-L28
[sr-template]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/session-report/skills/session-report/template.html
[cmd-skill]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-md-management/skills/claude-md-improver/SKILL.md
[cmd-rubric]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-md-management/skills/claude-md-improver/references/quality-criteria.md
[cmd-guidelines]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-md-management/skills/claude-md-improver/references/update-guidelines.md
[cmd-templates]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-md-management/skills/claude-md-improver/references/templates.md
[cmd-revise]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-md-management/commands/revise-claude-md.md
[prt-cmd]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/commands/review-pr.md
[prt-cr]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/code-reviewer.md
[prt-simp]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/code-simplifier.md
[prt-sfh]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/silent-failure-hunter.md
[prt-sfh-hidden]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/silent-failure-hunter.md#L80-L86
[prt-test]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/pr-test-analyzer.md
[prt-type]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/type-design-analyzer.md
[prt-comment]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/pr-review-toolkit/agents/comment-analyzer.md
[pd-readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/README.md
[pd-skilldev]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/skill-development/SKILL.md
[pd-skilldev-third]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/skill-development/SKILL.md#L382-L395
[pd-skilldev-pd]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/skill-development/SKILL.md#L79-L83
[pd-scripts]: https://github.com/anthropics/claude-plugins-official/tree/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/hook-development/scripts
[pd-vhs]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/hook-development/scripts/validate-hook-schema.sh#L41
[pd-settings]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/skills/plugin-settings/SKILL.md
[pd-validator]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/agents/plugin-validator.md
[pd-reviewer]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/plugin-dev/agents/skill-reviewer.md
[cs-readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/csharp-lsp/README.md
[sg-readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/security-guidance/README.md
[sg-hooks]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/security-guidance/hooks/hooks.json
[sg-ensure]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/security-guidance/hooks/ensure_agent_sdk.py
[sg-python]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/security-guidance/hooks/sg-python.sh
[eos-hook]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/explanatory-output-style/hooks-handlers/session-start.sh
[los-hook]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/learning-output-style/hooks-handlers/session-start.sh
[rl-readme]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/ralph-loop/README.md
[rl-hook]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/ralph-loop/hooks/stop-hook.sh
[cr-cmd]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/code-review/commands/code-review.md
[cs-agent]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/code-simplifier/agents/code-simplifier.md
[fd-cmd]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/feature-dev/commands/feature-dev.md
[cc-commit]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/commit-commands/commands/commit.md
[ccs-skill]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-code-setup/skills/claude-automation-recommender/SKILL.md
[cm-hooks]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/code-modernization/hooks/hooks.json
[csec-hooks]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/claude-security/hooks/hooks.json
[mp-solo]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/math-proof/skills/solo/SKILL.md
[ex-skill]: https://github.com/anthropics/claude-plugins-official/blob/b8e53f1c05dff3b6d751297f6527990ffc81c2f4/plugins/example-plugin/skills/example-command/SKILL.md
