# Ledger: maintenance tooling (`getsentry/skills`, `agent-sh/agnix`, `openai/plugins` `plugin-eval`)

Ticket: [Ledger: maintenance tooling](https://github.com/Hissal/skill-collection/issues/30), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1). It is input for [What maintenance machinery does the collection carry?](https://github.com/Hissal/skill-collection/issues/17).

Sources, each read on 2026-10-10 from its own shallow clone outside the repo. The SHAs match the ones the ticket names, so no re-pin was needed.

| Source | Pin | Committed | Licence | Stars (`gh api`, 2026-10-10) |
|---|---|---|---|---|
| `getsentry/skills` | [`d18b7aa`][s-root] | 2026-09-29 | Apache-2.0 ([LICENSE][s-license]) | ~1.0k |
| `agent-sh/agnix` (release v0.57.0) | [`004b7ea`][a-root] | 2026-10-09 | MIT OR Apache-2.0 ([README][a-readme]) | ~450 |
| `openai/plugins`, `plugins/plugin-eval` only | [`0722921`][p-root] | 2026-10-08 | "MIT" in the plugin manifest ([plugin.json][p-manifest]); no `LICENSE` file at the repo root or in the plugin (`ls`) | ~7.4k (whole repo) |

Nothing from any source was installed or executed. Every source link below is pinned to those SHAs. Fork links and entry names refer to the [fork ledger](mattpocock-skills-unity.md).

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2) and [`research/lazy-loading.md`](../lazy-loading.md) (ticket #22). *Inference* marks a claim reasoned from the sources instead of read in them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured from each `SKILL.md` frontmatter by a script (one multi-line description was counted by hand). Tokens are estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics](../loading-mechanics.md) measured on fork descriptions and the other ledgers reused. This is an estimate (inference), not a `claude plugin details` measurement. Scripts, CI checks and convention docs cost 0 idle tokens.

## Overview

**What the sources are.**

- **`getsentry/skills`** is Sentry's internal skill plugin: 28 skills and 2 subagents shipped as one Claude Code plugin from the repo root, also installable through `npx skills` ([README][s-readme]). About a third is Sentry-internal (brand, blog, SR&ED, their Django API). The maintenance value is in three pieces: a skill security scanner, a skill-authoring workflow with a per-skill maintenance contract (`SPEC.md`, `SOURCES.md`, `EVAL.md`), and a written registration checklist.
- **`agent-sh/agnix`** is a Rust linter for agent configuration files: 455 rules in [`knowledge-base/rules.json`][a-rules-json] covering `SKILL.md`, `CLAUDE.md`, `AGENTS.md`, hooks, settings, plugin manifests and Codex config, with autofix, a GitHub Action, a pre-commit hook, an LSP and an MCP server. About 240 rules apply to the owner's two harnesses; the other ~215 cover tools the owner does not use (counted from `rules.json`).
- **`plugin-eval`** is a Node CLI plus five Codex skills that score a skill or plugin statically, explain its token budget in three tiers, and benchmark it with real `codex exec` runs ([README][p-readme]). It is the Codex-side peer of `claude plugin details` and `claude plugin eval`.

**What they ship** (counted from the trees):

| Part | Count | Where |
|---|---|---|
| `getsentry/skills` skills | 28, all model-invoked. `iterate-pr` is the only one that states its gate, and it states `disable-model-invocation: false` with a matching `agents/openai.yaml` (`allow_implicit_invocation: true`) | [`skills/`][s-skills] |
| `getsentry/skills` subagents | 2: `code-simplifier`, `senpai` | [`agents/`][s-agents] |
| `getsentry/skills` scripts | 7: `scan_skill.py`, `quick_validate.py`, 4 for `iterate-pr`, 1 for `gh-review-requests`. All use PEP 723 inline dependencies and are run with `uv run` | under each skill's `scripts/` |
| `getsentry/skills` CI | No `.github/` directory. A [`warden.toml`][s-warden] runs `skill-scanner` on pull requests touching `**/skills/**` | repo root |
| agnix rules | 455: skills 34, steering files 41, Claude hooks/settings/plugins/agents/output styles 99, Codex 65, version pinning 1, other tools 215 | [`rules.json`][a-rules-json], [`VALIDATION-RULES.md`][a-rules-md] |
| agnix delivery | CLI (npm, pip/uvx, cargo, Homebrew, release binaries), composite GitHub Action, pre-commit hook, LSP + 4 editor extensions, MCP server, WASM playground, 1 skill, 1 Claude plugin | [README][a-readme], [`action.yml`][a-action] |
| `plugin-eval` | 1 CLI (about 6.7k lines of JavaScript, no third-party imports), 5 skills, 6 reference docs, 1 test file | [`plugins/plugin-eval/`][p-root] |

**Idle cost if installed as published.** `getsentry/skills`: 28 descriptions, about 8,700 characters, about **3.5k tokens** as one plugin (single plugin skills cannot be turned off on Claude Code, [loading-mechanics](../loading-mechanics.md)). `plugin-eval`: 5 descriptions, about **560 tokens**, all implicitly invocable on Codex. agnix: 0 as a CLI or CI check; its one skill is about 76 tokens.

**Fit to the owner, in one line.** No source mentions Unity or C#. All three are tooling *about* skills, which is what #17 needs. agnix ships a Windows binary and tests its Action on `windows-latest`; the Sentry scripts are plain Python behind `uv`; `plugin-eval` is plain Node 20 but its benchmark and two of its checks have Windows doubts (entries 28 and 30).

**Standout candidates (proposed):**

- **agnix as the structural lint floor** (entries 1 to 4, 7): a maintained, evidence-linked rule set for exactly the files the collection is made of, runnable on Windows and in CI. It replaces most of the hand-written frontmatter lint other ledgers proposed adapting. It needs a config that silences the rules that fight a dual-harness collection (see [Disagreements](#agnix-rules-checked-against-loading-mechanics)).
- **A small custom check beside agnix** (entry 17): agnix does not know `agents/openai.yaml` exists, so the gate-parity lint the other ledgers ask for, the tripwire measurement and the collection's own invariants still need a script of the owner's own.
- **`skill-scanner`** (entry 12): the only security scan for third-party skills read so far. A deterministic scanner plus an agent pass that judges intent. Fits the vendoring flow as an intake gate.
- **`SPEC.md` + `SOURCES.md` per skill** (entry 14): a maintenance contract and a provenance table kept beside the skill and out of its runtime text. The cheapest answer read so far to "why does this skill say this, and where did it come from".
- **`plugin-eval`'s three-tier budget** (entry 29): trigger cost, invoke cost and deferred cost, with the Codex gate respected. The clearest model for measuring the map's tripwires, even if the tool itself is not adopted.
- **agnix's spec-drift and tool-release watchers** (entry 10): scheduled jobs that hash harness doc pages and poll harness releases, then open one issue per source. A model for knowing when `loading-mechanics.md` has gone stale.

**Biggest open questions:**

1. **Lint with agnix, with a home-grown script, or both?** agnix covers format validity; it cannot see gate parity, idle cost or collection invariants. The fork already has `scripts/check.mjs`. Running both means two tools and two configs; running only a script means re-deriving harness schemas by hand.
2. **Which agnix opinion rules stay on?** `CC-MEM-005/006/007`, `PE-*` and `AGM-002/004` judge wording ("weak constraint language", "negative without positive"). They may contradict the fork's `writing-for-agents`. Decide with the skill-writing theme.
3. **Does every collection skill get a `SPEC.md`/`SOURCES.md`, or only overrides and adapted skills?** The second is cheaper and is where provenance matters.
4. **Is a security scan worth running on the owner's own skills, or only at intake of third-party ones?**
5. **Where do behavioural evals run?** Three harnesses are now on the table: Anthropic's `claude -p` trigger eval and `claude plugin eval` (Claude), AXIS and `plugin-eval benchmark` (Codex). The owner is Claude-first, so the Codex-only ones are second choices.
6. **CI at all?** This repo has no workflows yet. Every CI proposal below assumes #17 decides to add a `check` workflow like the fork's.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Codex-only harnesses | AXIS configs set `"agent": "codex"` ([axis.config.json][s-axis-config]); `plugin-eval benchmark` rejects any runner but `codex-cli` ([benchmark.js][p-benchmark]); plugin targets need `.codex-plugin/plugin.json` ([target.js][p-target]) | The owner's first harness is Claude Code. These measure the second |
| No knowledge of `agents/openai.yaml` in agnix | Case-insensitive grep for `openai.yaml` and `allow_implicit_invocation` over the Rust sources and `knowledge-base/` returns nothing | The Claude/Codex gate-parity check must be written by hand |
| Rules that punish a shared skill tree | agnix `CX-SK-001` flags and can delete Claude-only frontmatter in `.agents/skills/` ([per_client_skill.rs][a-per-client]) | A collection that installs one file to both `.claude/skills` and `.agents/skills` must disable it |
| POSIX assumptions | AXIS scenarios copy the repo with `rsync` ([scenario][s-axis-scenario]); `getsentry/skills` uses git symlinks for `CLAUDE.md` and `.agents/skills`, which checked out as plain text files in this Windows clone | Needs porting, or `core.symlinks` plus Developer Mode |
| Repo-specific registration | Sentry's checklist edits their README table, `.claude/settings.json` and the allowlist inside `claude-settings-audit` ([AGENTS.md][s-agents-md]) | The shape transfers; the steps do not |
| House style in validators | `plugin-eval` warns on frontmatter keys outside its own list of nine and on any `README.md` inside a skill ([skill.js][p-skill-eval]); agnix `PE-*` rules encode prompt-writing opinions | Scores and warnings need filtering before they mean anything for this collection |

### Index: every candidate to its entry

| Entry | Source | Skills / mechanisms |
|---|---|---|
| 1 | agnix | CLI, `.agnix.toml`, autofix modes |
| 2 | agnix | skill rule families: `AS-*`, `CC-SK-*`, `CX-SK-001`, `XP-SK-001` |
| 3 | agnix | steering-file rule families: `CC-MEM-*`, `AGM-*`, `XP-*`, `PE-*`, `REF-*`, `XML-*` |
| 4 | agnix | Claude Code config families: `CC-HK-*`, `CC-SET-*`, `CC-PL-*`, `CC-AG-*`, `CC-OS-*` |
| 5 | agnix | Codex families: `CDX-*`, `CDX-CFG-*`, `CDX-AG-*`, `CDX-PL-*`, `CDX-APP-*`, `CDX-REQ-*` |
| 6 | agnix | other-tool families: Cursor, Copilot, Kiro, OpenCode, Cline, Gemini, Windsurf, Roo, Amp, MCP |
| 7 | agnix | CI action `agnix-ci`, pre-commit hook, SARIF |
| 8 | agnix | `agnix` skill, Claude plugin, MCP server, LSP and editor extensions |
| 9 | agnix | `rules.json` evidence metadata, `agnix explain`, `agnix eval`, `VER-001` |
| 10 | agnix | spec-drift sentinel and tool-release watch workflows |
| 11 | agnix | repo preflight (`scripts/preflight.sh`, count and copy sync checks) |
| 12 | getsentry | `skill-scanner`, `scan_skill.py`, `warden.toml` |
| 13 | getsentry | `skill-writer` |
| 14 | getsentry | `SPEC.md` / `SOURCES.md` / `EVAL.md` per-skill convention |
| 15 | getsentry | `quick_validate.py` |
| 16 | getsentry | AXIS evals (`evals/axis.config.json`, `evals/scenarios/`) |
| 17 | getsentry | registration checklist, root-plugin packaging, `.agents/skills` mirror, dual-gate rule |
| 18 | getsentry | `agents-md` |
| 19 | getsentry | `claude-settings-audit` |
| 20 | getsentry | `prompt-optimizer` |
| 21 | getsentry | `iterate-pr` |
| 22 | getsentry | `commit`, `create-branch`, `pr-writer` |
| 23 | getsentry | `code-review`, `find-bugs`, `code-simplifier` (skill and agent) |
| 24 | getsentry | `security-review`, `gha-security-review`, `secret-serialization` |
| 25 | getsentry | `doc-coauthoring` |
| 26 | getsentry | `django-access-review`, `django-perf-review` |
| 27 | getsentry | Sentry-internal: `blog-writing-guide`, `brand-guidelines`, `document-api-endpoint`, `gh-review-requests`, `pr-link-issue`, `presentation-creator`, `sred-project-organizer`, `sred-work-summary`, `triage-frontend-issues`, `typing-exclusion-worker`, `senpai` agent |
| 28 | plugin-eval | `analyze`: static skill and plugin checks, score and grade |
| 29 | plugin-eval | `explain-budget`: three-tier token budget, baselines |
| 30 | plugin-eval | `init-benchmark` / `benchmark` / `compare`, observed usage |
| 31 | plugin-eval | the five skills, metric packs and the plugin bundle |

### What #17 gets from this ledger

| #17 topic | Candidates here | Already proposed elsewhere (not restated) |
|---|---|---|
| Validation / CI checks | 1 to 5, 7, 11, 15, 17, 28 | fork `scripts/check.mjs` and `validate-plugin`; Addy entry 8; Anthropic entry 9 |
| Routing (trigger) evals | 13 (`description-optimization` query sets), 16 | Anthropic entry 7; superpowers entry 21; Addy entries 9 and 11 |
| Behavioural evals | 16, 30 | Anthropic entry 2; superpowers entry 18; Addy entry 10; pstack entry 33 |
| Tripwire measurement | 29 | `claude plugin details` ([loading-mechanics](../loading-mechanics.md)) |
| Provenance | 14 (`SOURCES.md`), 9 (evidence fields) | [`vendoring.md`](../vendoring.md) copy-with-provenance |
| Intake security | 12 | none |
| Versioning and release | 9 (`VER-001` pinning) | fork Changesets entry |
| Convention docs | 13, 14, 17 | fork `writing-for-agents`; superpowers entry 17; Anthropic entry 10 |
| Drift detection | 10 | [`vendoring.md`](../vendoring.md) drift script; fork upstream-sync runbook |

---

## agnix

Running it. **Windows**: `npm install -g agnix` (or `npx agnix .`) downloads a prebuilt `agnix-x86_64-pc-windows-msvc.zip` from GitHub releases in a `postinstall` script ([install.js][a-npm-install]); `uvx agnix .`, `pip install agnix` and `cargo install agnix-cli` are the alternatives ([README][a-readme]). The pipeline normalises CRLF before validating ([SPEC.md][a-spec]). **CI**: a composite action whose bash scripts detect `MINGW*`/`Windows_NT` ([download.sh][a-download]) and whose own test workflow runs on `ubuntu-latest`, `macos-latest` and `windows-latest` ([test-action.yml][a-test-action]). **Harness**: none needed. It is a plain CLI, so Claude Code and Codex are equal. None of this was run here.

### 1. agnix CLI, `.agnix.toml` and autofix modes

- **What it is.** `agnix <path>` walks a directory, classifies each file by path and name (`SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `plugin.json`, `.codex/config.toml` and so on) and reports rule violations as text, JSON, SARIF or GitHub annotations ([README][a-readme], [SPEC.md][a-spec]). [`.agnix.toml`][a-config] scopes it: `tools = ["claude-code", "codex"]`, category toggles, `disabled_rules`, per-rule severity, `[[overrides]]` that disable rules for path globs, inline `<!-- agnix-disable-next-line RULE -->` comments, `[files]` globs that treat extra files as memory files or exclude them, and `[tool_versions]` pins. `--fix` applies only fixes marked safe; `--fix-unsafe` applies all; `--dry-run --show-fixes` previews. Reads follow symlinks; autofix writes refuse them ([file_utils.rs][a-file-utils]).
- **Kind**: script (external CLI) + CI-eval.
- **Proposed address**: collection maintenance machinery (#17). Not installed into any session.
- **Why it could fit.** The collection is made of the files agnix validates, on the two harnesses it knows best. Its Claude Code rules are re-verified against the docs often (most `CC-*` rules carry `verified_on` dates in the week before the pin, [`rules.json`][a-rules-json]) and cite the Claude Code version that introduced a behaviour. That is schema knowledge the owner would otherwise maintain by hand. Zero idle context.
- **Why it might not.** A third-party binary fetched by an npm `postinstall` (pin the version). 455 rules is a lot of surface for one person; the default run will be noisy until configured. No user-defined rules were found in the README or configuration reference (grep), so the collection's own invariants cannot live in it. Rule churn: the changelog is 2,346 lines and the rule count already disagrees between the README (455) and [SPEC.md][a-spec] (443).
- **Copy / adapt / idea-only**: adopt as an external tool, with a committed `.agnix.toml`. Nothing is copied. Proposed starting config (inference from the rule text, not tested): `tools = ["claude-code", "codex"]`; disable `CX-SK-001` and `XP-SK-001`; disable or downgrade `CC-MEM-009` and `CDX-AG-004`; decide the opinion rules (open question 2); pin `[tool_versions]`.
- **Overlap**: fork `scripts/check.mjs` and `validate-plugin` (fork ledger); Addy entry 8 `skill-lint.js`; Anthropic entry 9 `quick_validate.py`; entries 15 and 28 here. agnix covers what all four check about frontmatter and more, and unlike Addy's and Anthropic's validators it accepts `disable-model-invocation`, `when_to_use` and `paths` ([skill/mod.rs][a-skill-mod]).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt as the format-validity layer of #17's check, version-pinned and configured, with the owner's own script (entry 17) for everything agnix cannot see.

### 2. Skill rule families: `AS-*` (14), `CC-SK-*` (18), `CX-SK-001`, `XP-SK-001`

- **What it is.** `AS-*` encodes the Agent Skills spec: frontmatter present and parseable, `name` format, description length (1,024 by spec, 1,536 for Claude Code skills, `AS-008`), no `<`/`>` in Codex descriptions (`AS-009`, taken from Codex's own validator), body under 500 lines (`AS-012`), references one level deep (`AS-013`), `name` matches the directory except for Claude Code skills (`AS-017`). `CC-SK-*` encodes Claude Code's schema: valid `model`, `context`, `agent`, `effort`, `shell` values; known tool names; boolean `disable-model-invocation` and `user-invocable`; unknown frontmatter fields (`CC-SK-017`); non-empty `paths` (`CC-SK-019`); hardcoded home paths such as `C:\Users\<name>\` in the skill or its scripts (`CC-SK-021`); reserved names `synced` and `anthropic-skills` (`CC-SK-022`); and `CC-SK-006`, which requires `disable-model-invocation: true` when the name contains `deploy|ship|publish|delete|drop`. `CX-SK-001` warns on any non-spec frontmatter field in `.agents/skills/`. `XP-SK-001` (low) notes client-specific fields anywhere ([`VALIDATION-RULES.md`][a-rules-md], [per_client_skill.rs][a-per-client]). The owning client is decided from the path: `.claude/skills` is Claude Code, `.agents/skills` is Codex, a bare `skills/` tree is "unknown" and gets the Claude rules unless `tools` excludes Claude.
- **Kind**: CI-eval (rule set).
- **Proposed address**: collection maintenance machinery (#17).
- **Why it could fit.** `CC-SK-021` catches the owner's most likely leak (absolute Windows paths in a published skill). `CC-SK-022` and `AS-009` are harness traps nobody would guess. `CC-SK-017` catches typos such as `disable_model_invocation`, which would silently turn a user-invoked skill into a model-invoked one and spend idle budget.
- **Why it might not.** `CX-SK-001` treats `disable-model-invocation`, `when_to_use`, `paths` and `argument-hint` as errors-to-fix in `.agents/skills/` and offers a safe autofix that deletes the line. `XP-SK-001` fires on every gated skill. `CC-SK-006` is a name heuristic, and its autofix adds the Claude flag without creating the Codex `agents/openai.yaml`, which manufactures the parity gap the collection wants to prevent. `AS-012` counts 500 lines; the fork's own size guidance may differ. No rule measures description tokens.
- **Copy / adapt / idea-only**: use via entry 1 with `CX-SK-001` and `XP-SK-001` disabled and `CC-SK-006` kept as a warning with its fix never applied. Never run `--fix` over an installed `.agents/skills` tree.
- **Overlap**: Addy entry 8, Anthropic entry 9, davidondrej entry 3 (dual gating), fork `agents/openai.yaml` entry. The "colon-space in unquoted descriptions" gotcha from davidondrej entry 6 is a YAML parse matter; whether `AS-016` catches it was not checked.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: enable, minus the three rules above.

### 3. Steering-file rule families: `CC-MEM-*` (13), `AGM-*` (6), `XP-*` (9), `PE-*` (6), `REF-*` (4), `XML-*` (3)

- **What it is.** Checks on `CLAUDE.md`, `.claude/rules/*.md` and `AGENTS.md`. Mechanical ones: `@import` targets exist, no cycles, depth at most 4 (`CC-MEM-001/002/003`); valid `paths` globs and no unknown keys in rules files (`CC-MEM-011/012`); `CLAUDE.md` under 200 lines (`CC-MEM-014`); a single `AGENTS.md` under 32,768 bytes (`XP-007`) and the whole root-to-leaf Codex chain under it (`XP-009`, a project-level check that models `AGENTS.override.md` shadowing); broken markdown links and missing or duplicate imports (`REF-*`); unbalanced XML tags (`XML-*`); conflicting build commands or tool constraints across `CLAUDE.md` and `AGENTS.md` (`XP-004/005`). Opinion ones: generic instructions (`CC-MEM-005`, `PE-005`), negatives without a positive (`CC-MEM-006`, `PE-006`), weak constraint language (`CC-MEM-007`, `PE-003`), critical content in the middle (`CC-MEM-008`, `PE-001`), README duplication over 40% (`CC-MEM-010`), over 1,500 tokens at chars/4 (`CC-MEM-009`), missing headers or project context (`AGM-002/004`) ([`VALIDATION-RULES.md`][a-rules-md]).
- **Kind**: CI-eval (rule set).
- **Proposed address**: collection maintenance machinery (#17), pointed at the one source file the core always-on text is copied from (decision #14).
- **Why it could fit.** The core always-on text lives in two copies (user-scope `CLAUDE.md` and `AGENTS.md`). `XP-004/005` are the only checks read so far that compare the two for contradictions. `XP-009` implements the Codex chain cap the owner would otherwise only meet as silent truncation. `REF-002` covers the dead-link check several ledgers ask for.
- **Why it might not.** The opinion rules encode one research reading ("paper"-sourced, verified 2026-02) and several autofix by deleting or rewriting lines. `CC-MEM-009`'s 1,500-token limit is three times the owner's 500-token core tripwire, so it never fires where it matters, and it recommends `@import`, which saves nothing (see Disagreements). `XP-006` wants precedence documented in prose, which costs always-on tokens.
- **Copy / adapt / idea-only**: use via entry 1. Keep the mechanical rules. Put the opinion rules to the skill-writing theme before enabling.
- **Overlap**: fork `writing-for-agents` (negation, pruning, leading words) covers the same ground as the opinion rules by judgement, not regex; Addy entry 15 and superpowers entry 22 (repo conventions).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: enable `CC-MEM-001/002/003/011/012/014`, `XP-004/005/007/009`, `REF-*`, `XML-*`; leave `PE-*`, `CC-MEM-005` to `010`, `AGM-002/004` and `XP-006` off until the owner has compared them with `writing-for-agents`.

### 4. Claude Code config families: `CC-HK-*` (26), `CC-SET-*` (32), `CC-PL-*` (17), `CC-AG-*` (18), `CC-OS-*` (6)

- **What it is.** Hooks: 33 valid event names including `UserPromptExpansion` and `PostModelSwitch` (`CC-HK-001`), required fields per hook type, script file exists (`CC-HK-008`), dangerous command patterns (`CC-HK-009`), timeout advice per event (`CC-HK-010`), `once` only works in skill frontmatter (`CC-HK-014`), matcher on events that ignore it, such as `UserPromptSubmit` (`CC-HK-018`). Settings: type and value checks on 32 keys, plus "ineffective in project scope" findings such as `pluginConfigs` being ignored in project settings since Claude Code 2.1.207 (`CC-SET-015`). Plugins: manifest location, semver, component paths, kebab-case name, unknown manifest fields, and `CC-PL-015`, which knows that a manifest `skills` field *adds* to the default `skills/` scan while `commands` and `agents` *replace* theirs. Agents: frontmatter fields, tool names, referenced skills exist (`CC-AG-005`). Output styles: frontmatter and empty body ([`VALIDATION-RULES.md`][a-rules-md]).
- **Kind**: CI-eval (rule set).
- **Proposed address**: collection maintenance machinery (#17).
- **Why it could fit.** Decision #14 puts a command guard hook in core and allows silent-unless-qualified pack hooks. `CC-HK-008`, `-001`, `-014` and `-018` are exactly the silent failure modes of a hand-written hook config. If packs ship as plugins, `CC-PL-*` duplicates and extends `claude plugin validate`. `CC-SET-015` is a fact the pack-install design should know.
- **Why it might not.** `CC-SET-*` mostly checks keys the collection will never set. `CC-HK-010` asks for an explicit timeout on every hook, which is advice, not an error. `CC-HK-009` pattern-matches `rm -rf` in hook commands, and a command guard's own pattern file or tests may trip it (inference).
- **Copy / adapt / idea-only**: use via entry 1. Exclude the guard's test fixtures with `[files].exclude`.
- **Overlap**: fork `validate-plugin` (runs `claude plugin validate`, the harness's own check; agnix does not replace it, it runs without the CLI installed); davidondrej entry 2 (the guard and its harness, which agnix does not test behaviourally).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: enable `CC-HK-*` and `CC-PL-*`; leave `CC-SET-*`, `CC-AG-*`, `CC-OS-*` at defaults and silence only what proves noisy.

### 5. Codex families: `CDX-*` (7), `CDX-CFG-*` (30), `CDX-AG-*` (7), `CDX-PL-*` (16), `CDX-APP-*` (3), `CDX-REQ-*` (2)

- **What it is.** `.codex/config.toml` validation: parse errors, enum values for approval, sandbox, reasoning and personality keys, unknown keys (`CDX-004`, `CDX-CFG-006`), `project_doc_max_bytes` at most 65,536 (`CDX-005`), hardcoded secrets (`CDX-CFG-010`), `skills` must be a table (`CDX-APP-002`). `AGENTS.md` for Codex: empty, secrets, generic guidance, missing file references, contradictions with `config.toml`, and a 100,000-byte size limit (`CDX-AG-004`). Plugins: `.codex-plugin/plugin.json` location, name characters, `./`-prefixed component paths, default-prompt limits (`CDX-PL-*`). `AGENTS.override.md` should not be committed (`CDX-003`) ([`VALIDATION-RULES.md`][a-rules-md]). The last commit at the pin is "accept Codex 0.162.0 config keys", so the family tracks Codex releases.
- **Kind**: CI-eval (rule set).
- **Proposed address**: collection maintenance machinery (#17), second priority (Codex is the owner's second harness).
- **Why it could fit.** If a pack is enabled per project through `.codex/config.toml` ([loading-mechanics §3](../loading-mechanics.md)), unknown-key and type checks on that file catch typos that would silently leave the pack off. `CDX-PL-008/009` encode Codex UI limits not written anywhere in the owner's research.
- **Why it might not.** Nothing here checks skills, the Codex gate, or Codex hooks. A plugin's `.claude-plugin/plugin.json` is validated only by the Claude rules; agnix has no rule saying Codex also reads it (file-type detection maps only `.codex-plugin/` to Codex, [detection.rs][a-detection]). The owner's Codex config lives at user scope, outside the repo. `CDX-AG-004`'s 100,000 bytes contradicts the 32 KiB cap (see Disagreements).
- **Copy / adapt / idea-only**: use via entry 1 only where the collection commits Codex files.
- **Overlap**: none in other ledgers; unity-workflow entry D10 ships its own installer and validator for `openai.yaml`, which agnix lacks.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: enable with `CDX-AG-004` off; expect little signal until the collection commits a `.codex/config.toml` or a `.codex-plugin/`.

### 6. Other-tool families (about 215 rules)

- **What it is.** Rules for Cursor (21), Copilot (26), Kiro (56), OpenCode (48), Cline (10), Gemini CLI (11), Windsurf (5), Roo Code (7), Amp (5) and MCP tool definitions (26) ([`rules.json`][a-rules-json]).
- **Kind**: CI-eval (rule set).
- **Proposed address**: none.
- **Why it could fit.** The map lists other agents as a future consideration only. The MCP rules would matter if the collection ever ships an `.mcp.json`.
- **Why it might not.** None of these tools is installed. `tools = ["claude-code", "codex"]` scopes them out.
- **Copy / adapt / idea-only**: not used.
- **Overlap**: none.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject (scoped out by config); revisit MCP rules only if an MCP config enters the collection.

### 7. CI action `agnix-ci`, pre-commit hook and SARIF

- **What it is.** A composite GitHub Action ([`action.yml`][a-action]): inputs `path`, `strict`, `target`, `config`, `format` (text, json, sarif), `version` (default `latest`), `build-from-source`, `fail-on-error`; outputs `result`, `errors`, `warnings`, `sarif-file`. It downloads a release binary with the workflow token and runs it. The repo also ships a [`.pre-commit-hooks.yaml`][a-precommit] and `--format github` annotations.
- **Kind**: CI-eval.
- **Proposed address**: collection maintenance machinery (#17): one step in a `check` workflow, here and optionally in the fork.
- **Why it could fit.** One step, no Rust or Node setup, works on any runner OS. Errors and warnings as outputs allow a soft start (`fail-on-error: false`) while the config settles.
- **Why it might not.** `version: latest` means a new agnix release can turn the build red with no change in the repo; pin it. The action reference `agent-sh/agnix@v0` is a moving tag; pin to a SHA (the source's own workflows pin every action to a SHA). A second-party action with the workflow token is a supply-chain surface; `gha-security-review` (entry 24) is the matching review.
- **Copy / adapt / idea-only**: adopt as a pinned step. Alternative with less trust: `npx agnix@<version> .` or `uvx agnix==<version> .` in a plain step.
- **Overlap**: fork Check workflow (pins the Claude Code CLI version the same way); superpowers entry 23 (pre-commit hygiene).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt-adapted: SHA-pinned action, pinned `version`, committed `.agnix.toml`, warnings non-fatal at first.

### 8. `agnix` skill, Claude plugin, MCP server, LSP and editor extensions

- **What it is.** A [`skills/agnix/SKILL.md`][a-skill] that tells the agent to run the CLI (description quotes "lint agent configs", "validate skills"); a [`plugin/`][a-plugin] with a command, an agent and the same skill; an `agnix-mcp` server crate; an LSP with VS Code, JetBrains, Neovim and Zed extensions ([README][a-readme]).
- **Kind**: skill + manifest-packaging.
- **Proposed address**: none in sessions. The JetBrains extension is an owner-side editor choice (the owner's Codex config enables a Rider plugin, [loading-mechanics §6](../loading-mechanics.md)).
- **Why it could fit.** Live diagnostics while editing a `SKILL.md` are faster feedback than CI.
- **Why it might not.** A model-invoked skill that wraps one CLI command spends about 76 idle tokens to save typing `agnix .`. The MCP server adds tool names to every session.
- **Copy / adapt / idea-only**: idea-only. If the owner wants the agent to lint after editing skills, one line in the repo's own `AGENTS.md` ("run `agnix .` before finishing skill edits") does it without a skill.
- **Overlap**: fork `writing-for-agents` (the skill that should point at the lint).
- **Idle context cost**: ~76 tokens if the skill were installed model-invoked; 0 as proposed.
- **Recommendation (proposed)**: reject the skill, plugin and MCP server; editor extension is the owner's call outside the blueprint.

### 9. Rule evidence metadata, `agnix explain`, `agnix eval`, version pinning (`VER-001`)

- **What it is.** Every rule in [`rules.json`][a-rules-json] carries `evidence` (`source_type`: spec, vendor_docs, vendor_code, paper or community; `source_urls`; `verified_on`; `applies_to` with a tool and an optional `version_range`; `normative_level`), `fix` safety, and a good and bad example. `agnix explain <RULE>` prints it. `agnix eval <manifest.yaml>` scores rules against labelled cases (file plus expected rule IDs) for precision and recall ([EVALUATION.md][a-eval]). `VER-001` asks projects to pin `[tool_versions]` so version-ranged rules resolve deterministically.
- **Kind**: convention doc (metadata schema) + CI-eval.
- **Proposed address**: idea-only for #17.
- **Why it could fit.** The owner's research already pins harness versions in prose ("Claude Code 2.1.295", [loading-mechanics](../loading-mechanics.md)). A `verified_on` date and a `version_range` per harness fact is the same idea made checkable: a fact older than N months or below the installed version is due for re-verification. The labelled-cases shape (file, expected findings, including "valid file triggers nothing") is the right shape for testing the owner's own check script.
- **Why it might not.** The collection has dozens of harness facts, not hundreds; a JSON schema for them is overhead.
- **Copy / adapt / idea-only**: idea-only. Take two habits: date-and-version stamp each harness fact the machinery depends on, and test any custom check with pass and fail fixtures.
- **Overlap**: [`vendoring.md`](../vendoring.md) provenance fields (source, SHA, licence); davidondrej entry 2 (block and allow cases for the guard).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; pin `[tool_versions]` in `.agnix.toml` if entry 1 is adopted.

### 10. Spec-drift sentinel and tool-release watch

- **What it is.** Two scheduled workflows. [`spec-drift.yml`][a-spec-drift] runs weekly, fetches the tracked specification and docs sources listed in `.github/spec-baselines.json`, compares content hashes and opens an issue when one changed; a manual run with `update_baselines` accepts the new hashes after review. [`tool-release-watch.yml`][a-release-watch] runs daily, polls release feeds for each tracked tool (GitHub releases, JSON endpoints, RSS, HTML), and opens or comments on one issue per tool, deduplicated by a `tool-release:<id>` label. Both need only `contents: read` and `issues: write`.
- **Kind**: CI-eval (scheduled drift detection).
- **Proposed address**: collection maintenance machinery (#17), under "how drift is detected".
- **Why it could fit.** The collection depends on two moving harnesses and on docs pages that are unversioned ([loading-mechanics, Sources](../loading-mechanics.md)). A weekly hash of the dozen `code.claude.com` and `developers.openai.com` pages that `loading-mechanics.md` cites, plus a watch on `anthropics/claude-code` and `openai/codex` releases, tells the owner when a decided mechanism may have changed. The same pattern covers #17's fork items: a scheduled job that counts how far the fork is behind `mattpocock/skills` and opens one issue past a threshold.
- **Why it might not.** Doc pages change for cosmetic reasons, so hash drift is noisy; agnix tiers its sources and reviews by hand. One more scheduled job to ignore. If agnix is adopted, its own releases already carry much of this signal for free (inference).
- **Copy / adapt / idea-only**: adapt the shape, not the scripts (they are bash and specific to agnix's baseline files). A single small script: list of URLs, stored hashes, `gh issue` on change, label-keyed dedup.
- **Overlap**: [`vendoring.md`](../vendoring.md) proposes a drift script per vendored skill (source SHA drift); the fork's upstream-sync runbook (manual cadence). This entry covers *harness* drift, which neither does.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adapt as a low-priority scheduled check; start with the fork-behind-upstream counter, which #17 already names as a tripwire input.

### 11. Repo preflight: count, copy and bookkeeping sync checks

- **What it is.** `scripts/preflight.sh` runs fast, compile-free checks first (formatting, rule bookkeeping, count tables, locale copies, instruction copies, schema copies) and a `--full` mode before pushing; missing tools fail the check instead of skipping it ([README][a-readme]). Supporting scripts such as `check-rule-counts.py` keep the rule totals quoted in docs equal to `rules.json`.
- **Kind**: script.
- **Proposed address**: idea-only for #17.
- **Why it could fit.** "Instruction copies" is the collection's own problem: the core always-on text is one source copied to `CLAUDE.md` and `AGENTS.md` (decision #14), and a check that the copies are byte-equal is the cheapest guard. "Counts quoted in docs match the data" maps to the tripwire figures.
- **Why it might not.** The scripts are specific to a Rust workspace. The source's own counts still drifted (455 vs 443, entry 1), so the check is not airtight.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `scripts/check.mjs` (same pattern: one fast script, one line per violation).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: fold "always-on copies are identical to their source" into the owner's check script (entry 17).

---

## getsentry/skills

Running its tooling. **Windows**: the scripts need `uv` and Python 3.9+ (`scan_skill.py`) or 3.12+ (`quick_validate.py`), with `pyyaml` fetched by `uv` on first run. `scan_skill.py` reads files as UTF-8 explicitly; `quick_validate.py` calls `read_text()` with no encoding, so on Windows it uses the locale code page unless `PYTHONUTF8=1` (inference from the code, not run). **CI**: the source runs the scanner through Warden (`warden.toml`); the source has no workflow files, so how Warden is installed is not visible. A plain workflow step running `uv run` works without it (inference). **Harness**: the skills are standard `SKILL.md` files; only `iterate-pr` ships a Codex `agents/openai.yaml`.

### 12. `skill-scanner` + `scan_skill.py` + `warden.toml`

- **What it is.** A security scan for agent skills ([SKILL.md][s-scanner]). [`scan_skill.py`][s-scan-script] (674 lines) emits JSON findings with severities: 16 prompt-injection regexes ("ignore previous instructions", role reassignment, system-prompt extraction); obfuscation (zero-width characters, right-to-left override, homoglyphs, Unicode tag characters, base64 blobs that decode to injection text); 13 secret patterns; 18 dangerous-script patterns (network calls, `~/.ssh` access, `eval`, writes to `.claude`, `settings.json`, `CLAUDE.md`, git hooks); and structural attacks: symlinks resolving outside the skill, hooks in frontmatter, `` !`command` `` load-time execution, bundled test files that a test runner would auto-execute, npm lifecycle scripts, text hidden in PNG metadata. It lists every URL against a trusted-domain set and reports description-to-body overlap. The skill then has the agent judge intent in eight phases, with a stated bias: "The biggest risk is flagging legitimate security skills as malicious", report only high-confidence findings, and end with "Safe to install / Install with caution / Do not install". [`warden.toml`][s-warden] runs it on pull requests touching `**/skills/**` and fails on `high`.
- **Kind**: skill + script + CI-eval.
- **Proposed address**: collection maintenance machinery (#17) as an intake gate in the vendoring flow. If kept as a skill: core user-invoked.
- **Why it could fit.** The collection borrows from many sources of uneven trust, and [`vendoring.md`](../vendoring.md) proposes copy-with-provenance but no safety check at intake or on drift. The structural list (frontmatter hooks, `` !`cmd` ``, auto-discovered test files, symlinks) names the ways a copied skill can run code without the model choosing to. The deterministic half runs in CI for free; the judgement half runs once per intake. Plain Python, no harness dependency.
- **Why it might not.** The script always exits 0, so a CI gate needs a wrapper that reads `finding_counts`. Regex scanning is noisy on exactly the skills the collection might take (guards, security review skills); the skill says so. The trusted-domain list is Sentry's (`docs.sentry.io`, Django docs). The dangerous-script patterns cover Python and shell idioms, not PowerShell or C# (grep of the pattern table). A personal collection reviewed by its one author gets less from scanning its own skills.
- **Copy / adapt / idea-only**: adapt. Copy the script (Apache-2.0: keep the licence and a change notice), swap the trusted domains, add a non-zero exit on high findings, and add PowerShell patterns if hooks are ported to it. Keep the skill's phases as the intake checklist; the 210-line skill body itself is optional.
- **Overlap**: none in other ledgers as a scanner. Adjacent: davidondrej entry 2 (runtime command guard, a different layer); agnix `CC-HK-009` and `CC-SK-007` (two regexes, far narrower); discovery-sweep pitch 7.
- **Idle context cost**: ~132 tokens if model-invoked; 0 as user-invoked or script-only.
- **Recommendation (proposed)**: adapt the script as the intake and drift scan in #17's vendoring procedure; keep the agent pass as a user-invoked step run when a new source is vendored.

### 13. `skill-writer`

- **What it is.** Sentry's "single canonical workflow for skill creation and improvement" ([SKILL.md][s-writer], 157 lines, 37 flat reference files). It is a router: every reference is listed with an "open when you need to..." reason. Steps: resolve target and choose "the simplest adequate execution shape" (inline, reference-backed, script-backed, router, subagent-fork, hook-backed, asset-template); synthesise from sources with provenance; iterate from positive and negative examples against working and holdout sets; author; optimise the description against should-trigger and should-not-trigger query sets ([description-optimization.md][s-desc-opt]); register and validate. Rules worth noting: "Before adding guidance, identify what existing rule, section, or file should be narrowed, replaced, or removed"; a post-change precision pass; provider-specific mechanics must be justified with portability notes; eval files stay out of runtime routing.
- **Kind**: skill + convention doc.
- **Proposed address**: idea-only. Its reusable rules belong in the fork's `writing-for-agents` or the collection's contributing notes.
- **Why it could fit.** "Name what you will remove before you add" and the holdout rule ("do not tune directly against holdout examples") are direct defences against skill bloat and overfitting, both idle-budget concerns. The should-trigger / should-not-trigger sets are the input any trigger eval needs. The "open when" routing table is the same shape as the lazy-loading router decided in #22.
- **Why it might not.** Heavy: 37 references and a multi-phase process for what the owner does by hand with `writing-for-agents`. Its description style ("trigger-rich", quoted phrases) pulls toward long descriptions; the source's own skills average about 125 tokens each, twice the fork's median ([loading-mechanics §6](../loading-mechanics.md)). Registration steps are Sentry's. The host already provides a `skill-creator`.
- **Copy / adapt / idea-only**: idea-only. Candidate lines for `writing-for-agents` or a contributing note: remove-before-add; keep should-trigger and should-not-trigger sets beside the skill; holdout cases; "open when" reasons on every reference.
- **Overlap**: fork `writing-for-agents`; Anthropic entry 1 (`skill-creator`) and entry 10; superpowers entry 17 (`writing-skills`); davidondrej entry 6. The "pushy descriptions" conflict the Anthropic ledger flagged applies here too.
- **Idle context cost**: ~152 tokens if model-invoked.
- **Recommendation (proposed)**: reject the skill; carry the four rules above into the skill-writing theme.

### 14. Per-skill `SPEC.md`, `SOURCES.md` and `EVAL.md`

- **What it is.** A convention: "Keep runtime instructions in `SKILL.md`; put intent, source/evidence model, evaluation, limitations, and maintenance rules in `SPEC.md`" ([AGENTS.md][s-agents-md]). The [template][s-spec-template] has Intent, Scope (in and out), Users And Trigger Context (including "Should not trigger for"), Runtime Contract, Source And Evidence Model, Reference Architecture, Validation, Known Limitations and Maintenance Notes. `SOURCES.md` holds a source inventory table (source, type, trust tier, retrieved date, confidence, contribution, usage constraints), numbered decisions with status and reason, gaps and a changelog ([agents-md/SOURCES.md][s-sources-example]). `EVAL.md` is the maintainer's playbook for that skill's evals. None of the three is linked from `SKILL.md`, so none is loaded at runtime. Seven of the 28 skills have a `SPEC.md` and four a `SOURCES.md` (tree listing), so the source applies it to new and materially changed skills only.
- **Kind**: convention doc.
- **Proposed address**: collection maintenance machinery (#17), under provenance and convention docs.
- **Why it could fit.** It answers three #17 needs with plain files: where a skill came from (`SOURCES.md` rows with retrieved dates), what it must keep doing (`SPEC.md` runtime contract and "should not trigger for"), and how to test it. The files sit beside the skill, cost zero context, and survive copying. For an override or fork override it is the natural place to record what was changed from the original and why. The should-not-trigger list is ready-made input for a trigger eval.
- **Why it might not.** Three more files per skill is real upkeep for one person; the source itself has not back-filled 21 skills. A `SOURCES.md` beside the skill is installed with it by any copy-based installer (wasted bytes, not context). It overlaps the lock-file provenance [`vendoring.md`](../vendoring.md) proposes, and two records of the same source can disagree.
- **Copy / adapt / idea-only**: adapt. Proposed minimum: one file per *adapted or overridden* skill, combining a trimmed `SPEC.md` (intent, should-trigger / should-not-trigger, what was changed from the source) with the `SOURCES.md` table, and the SHA pin living only in the vendoring lock file. Skills the owner writes from scratch get it only when they grow evals.
- **Overlap**: [`vendoring.md`](../vendoring.md) (Grill's `VENDORED.md` plus lock file); fork `research/` provenance entry; Addy entry 12 (rejected-changes ledger, the same "why is it like this" need); superpowers entry 7 (ruling log).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adapt as the provenance-and-contract file for adapted skills and overrides; decide its exact shape together with the vendoring lock file in #17.

### 15. `quick_validate.py`

- **What it is.** A 154-line structural validator ([script][s-quick-validate]): `SKILL.md` exists, frontmatter is a YAML mapping, `name` matches the directory, `description` is a non-empty string, every `references/`, `scripts/` or `assets/` path and every `SPEC.md`/`SOURCES.md` named in the body exists, and a warning over 20,000 characters. JSON output, exit 1 on failure. It deliberately does not allowlist frontmatter keys or judge quality ([SPEC.md][s-writer-spec], Known Limitations).
- **Kind**: script (CI-eval).
- **Proposed address**: idea-only.
- **Why it could fit.** The referenced-file check is the one thing it has that is cheap and valuable: a skill body that names `references/foo.md` which does not exist fails silently at runtime. Unlike Anthropic's and Addy's validators it does not reject the gating keys.
- **Why it might not.** agnix covers the frontmatter checks and broken markdown links (`REF-002`), though whether it catches a bare backticked path that is not a markdown link was not checked. The frontmatter regex expects LF line endings (`^---\n`), so a CRLF checkout fails "missing closing ---" (inference from the regex). No explicit encoding on read.
- **Copy / adapt / idea-only**: idea-only. Take the bare-path reference check into the owner's script if agnix does not cover it.
- **Overlap**: Anthropic entry 9 (same file name, different script); Addy entry 8; agnix entries 1 and 2; fork `check.mjs`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject the script; keep "every path a skill names must exist" as a check requirement for #17.

### 16. AXIS evals (`evals/axis.config.json`, `evals/scenarios/*.json`)

- **What it is.** Behavioural evals for two skills (`skill-writer`: 3 scenarios, `pr-writer`: 1) using `@netlify/axis`, described by the source as an MIT-licensed harness with a built-in Codex adapter that runs `codex exec --json` in a temp workspace with isolated `HOME` and `CODEX_HOME` ([EVAL.md][s-writer-eval]). A scenario is JSON: a `prompt`, weighted natural-language `judge` checks graded by an LLM over the transcript and workspace, `setup` steps and `artifacts` globs ([scenario][s-axis-scenario]). The playbook adds an adoption gate: no critical dimension regresses on holdout cases, at least one target dimension improves on the motivating case, compare against a stored baseline, and "Do not add custom `run-codex.*` scripts".
- **Kind**: CI-eval (on demand).
- **Proposed address**: idea-only for #17's behavioural evals.
- **Why it could fit.** The scenario format is small and readable: prompt, three or four weighted observable checks, artifacts. The adoption gate is a crisp rule for when a skill edit may land. Isolated `CODEX_HOME` solves the "installed copy competes with the candidate" problem the Anthropic ledger found in its trigger eval.
- **Why it might not.** Codex is the agent under test; the owner is Claude-first. AXIS itself was not read (claims about it come from `EVAL.md`), and whether it has a Claude Code adapter is unknown. Setup uses `rsync`, absent from a default Windows Git Bash. Each run is a real agent session with a 15-minute limit: slow and paid. The source has four scenarios across 28 skills, so even its authors use it sparingly.
- **Copy / adapt / idea-only**: idea-only. Take the scenario shape and the adoption gate; choose the runner in #17.
- **Overlap**: Anthropic entry 2 (with-skill vs baseline runs, Claude); Addy entries 10 and 11; superpowers entry 18 (pressure scenarios with subagents); pstack entry 33 (eval playbook); entry 30 here. Five ledgers now propose a behavioural eval; they differ mainly in runner.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only. Put "AXIS, if it supports Claude Code" on #17's runner comparison beside `claude plugin eval`; adopt the adoption gate wording whichever runner wins.

### 17. Registration checklist, packaging and the dual-gate rule

- **What it is.** [`AGENTS.md`][s-agents-md] (46 lines) holds a six-step registration checklist for a new skill: create `SKILL.md` and `SPEC.md`, add a row to the README table, add `Skill(sentry-skills:<name>)` to the repo's [`.claude/settings.json`][s-settings] allow list, add it to the allowlist inside `claude-settings-audit`, and "set Claude's `disable-model-invocation` in `SKILL.md` and Codex's `policy.allow_implicit_invocation` in `agents/openai.yaml` to matching behavior". Conventions: frontmatter on line 1, `name` equals directory, attribution comments after the closing `---`, scripts always via `uv run`, `SKILL.md` under 500 lines, "Do not create per-skill alias or symlink skills". Packaging: the repo root is the plugin (`.claude-plugin/plugin.json` with no component fields, `marketplace.json` with `"source": "./"`), `.agents/skills` is a symlink to `skills/`, and `CLAUDE.md` is a symlink to `AGENTS.md`. Nothing checks the checklist; it is prose for the agent.
- **Kind**: convention doc + manifest-packaging.
- **Proposed address**: idea-only; the checklist becomes rules in the owner's own check script (collection maintenance machinery, #17).
- **Why it could fit.** It is an independent third statement of the dual-gate rule (after the fork and davidondrej), which strengthens the case for making it a check. The checklist is the list of invariants a script should enforce: every skill appears in its manifest or index, every gated skill has a matching `openai.yaml`, every always-on copy equals its source, idle totals are under the tripwires. agnix cannot check any of these (entry 1).
- **Why it might not.** The root-as-plugin layout makes all 28 skills one all-or-nothing plugin (about 3.5k idle tokens), the opposite of the owner's install direction. Both symlinks arrived as plain text files in this Windows clone, and `CLAUDE.md` as a symlink is unnecessary on current Claude Code, which reads `AGENTS.md` when no `CLAUDE.md` exists ([loading-mechanics §1](../loading-mechanics.md)). A prose checklist is only as good as the agent following it: the README table is a hand-written paraphrase of each description, and nothing compares the two.
- **Copy / adapt / idea-only**: idea-only. Proposed custom-check rules for #17 (inference, combining this entry with decisions #14, #16 and #22): gate parity between `disable-model-invocation` and `allow_implicit_invocation`; no description promising model firing on a user-invoked skill; every skill listed in exactly one core or pack index; always-on copies identical to source; summed description tokens per layer against the tripwires; no `paths:` on a skill that ships inside a plugin (inert there, [lazy-loading](../lazy-loading.md)); the fork never references collection skills; count of fork overrides.
- **Overlap**: fork `scripts/check.mjs` (the vehicle), fork `agents/openai.yaml` entry and its *inference* that parity is unchecked; davidondrej entry 3; Addy entry 8's proposed parity rule; unity-workflow entry D10.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: write the checks above into one script modelled on the fork's `check.mjs`, run beside agnix. Reject the root-plugin and symlink packaging.

### 18. `agents-md`

- **What it is.** A skill for creating and maintaining `AGENTS.md`/`CLAUDE.md` ([SKILL.md][s-agents-md-skill], 96 lines): "Target under 60 lines; never exceed 100"; inspect commands and docs first; root file plus nested files only where a subtree differs; tables for commands; an External References table of exact repo-relative paths instead of copied content; "Do not restate linter, formatter, or typechecker config", "Do not list installed skills or plugins", "Do not include generic quality slogans"; verify every path and command exists. It has a `SPEC.md` and a `SOURCES.md` citing `agents.md` and the Codex AGENTS.md guide.
- **Kind**: skill.
- **Proposed address**: core user-invoked, or merged as a reference into the fork's `writing-for-agents`.
- **Why it could fit.** Decision #14 sets a 500-token tripwire on core always-on text and an admission gate; this skill is a written gate for project-level steering files, with the same instinct (pointers over copies, no slogans, no skill lists). The owner works across many repos, each needing a small `AGENTS.md`. Running it is occasional, so user-invoked costs nothing.
- **Why it might not.** It tells the agent to symlink `CLAUDE.md` to `AGENTS.md`, which is unnecessary on Claude Code 2.1.277+ and fragile on Windows. Its template adds a "Commit Attribution" section the owner's harness already handles. Examples are pnpm and web; the fork's setup skill already seeds agent docs (`docs/agents/*.md` in this repo).
- **Copy / adapt / idea-only**: adapt. Drop the symlink step and the attribution section, replace examples with Unity and .NET commands, and state the Claude fallback rule from loading-mechanics.
- **Overlap**: fork `writing-for-agents` (triggers on "AGENTS.md or CLAUDE.md" by description) and `setup-matt-pocock-skills`; host `init` skill; gamedev entry A20 (`migrating-agents-md-to-control-flow`); agnix entries 3 and 5, which lint the same file.
- **Idle context cost**: ~111 tokens if model-invoked; 0 user-invoked.
- **Recommendation (proposed)**: merge its rules (size target, pointer table, the three "do not" lines, verify paths) into `writing-for-agents` as a short steering-file section; do not add a separate skill.

### 19. `claude-settings-audit`

- **What it is.** A skill that detects a repo's stack from lock files and manifests and generates a `.claude/settings.json` allow list of read-only commands: a fixed baseline (`ls`, `git status`, `gh pr view` and so on) plus stack-specific version and list commands, WebFetch domains for detected frameworks, and Sentry's own skills ([SKILL.md][s-settings-audit], 320 lines).
- **Kind**: skill.
- **Proposed address**: none (reject); idea-only for the migration item on the map.
- **Why it could fit.** Fewer permission prompts on read-only commands is a real quality-of-life gain, and a per-stack table for Unity and .NET (`dotnet --version`, `dotnet list package`) would be new.
- **Why it might not.** The host already ships `fewer-permission-prompts`, which builds the allow list from the owner's actual transcripts instead of a guess. The tables cover Python, Node, Go, Rust, Ruby and Java, with no .NET or Unity rows (grep). The baseline uses POSIX commands; the owner's primary shell is PowerShell. It doubles as Sentry's skill allowlist, which is why registration touches it.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: host `fewer-permission-prompts` and `update-config` skills.
- **Idle context cost**: ~104 tokens if model-invoked.
- **Recommendation (proposed)**: reject.

### 20. `prompt-optimizer`

- **What it is.** A workflow for writing and tuning prompts "with evals" ([SKILL.md][s-prompt-opt], 123 lines, 4 references): capture the contract and success criteria first ("If success criteria or examples are missing, create a small eval set first"); inventory external context by exact path; baseline on a fixed eval slice; cluster failures by root cause; generate two to four candidates (minimal-diff repair, structure-first rewrite, examples-first); compare on the same cases; validate the winner on holdout; "Stop on plateau, oscillation, overfit, excessive cost, or non-prompt bottleneck". Failure modes listed include "editing before defining the eval target" and "retaining examples that no longer improve evals".
- **Kind**: skill.
- **Proposed address**: core user-invoked (agentic-workflow work), or idea-only for #17.
- **Why it could fit.** The owner builds agentic workflows, and a skill description or a hook's injected line is a prompt. The loop (baseline, cluster, small candidate set, holdout, stop rule) is the same discipline #17 needs for description edits, stated compactly. "Say so before rewriting when the bottleneck is not the prompt" is a useful guard.
- **Why it might not.** Without an eval runner it is advice. Model-family notes will age. It overlaps existing candidates closely.
- **Copy / adapt / idea-only**: adapt if taken: drop the model-family reference, keep the loop and stop rules.
- **Overlap**: Anthropic entry 11 (`prompt-audit`) and entry 12 (hill-climbing guides) and entry 8 (description optimiser); pstack entry 33 (hillclimb and eval playbooks); davidondrej entry 21 (`prompt-for-others`).
- **Idle context cost**: ~133 tokens if model-invoked; 0 user-invoked.
- **Recommendation (proposed)**: do not add a skill; let the eval theme pick one hill-climbing playbook among this, pstack's and Anthropic's, and take this one's stop rule and failure-mode list as tie-breakers.

### 21. `iterate-pr`

- **What it is.** A loop that fixes a pull request until "actionable CI passes and high/medium review feedback is addressed" ([SKILL.md][s-iterate], 146 lines, 4 Python scripts over `gh`). The scripts return JSON: checks with failure snippets and a summary that separates `actionable_pending` from `human_gate_pending`; feedback bucketed `high`, `medium`, `low`, `bot`, `resolved`; a monitor that ends on named markers (`ALL_CHECKS_PASSED`, `CHECKS_BLOCKED_BY_REVIEW_GATE`, `DRAFT_PR_WITH_NO_CHECKS`). Rules: fix high and medium, ask the user about low, state the cause before editing ("fails because X, affected by Y"), verify locally before pushing, never wait on human approval or mark a draft ready unprompted. It is the one skill with an explicit gate in both harness formats.
- **Kind**: skill + scripts.
- **Proposed address**: core user-invoked.
- **Why it could fit.** Once the collection and the fork have CI (#17), the owner will sit in exactly this loop. The pending-reason split (waiting on a machine vs waiting on a human) is the detail home-made loops get wrong. Scripts are plain Python over `gh`, so they should run on Windows with `uv` (inference; not run).
- **Why it might not.** It auto-commits and pushes in a loop, which should be the owner's explicit call, so it must be user-invoked; the source leaves it model-invoked. The bot list is Sentry's (sentry, warden, cursor, bugbot, seer, codeql). A solo developer gets little review feedback to bucket. pstack's PR machinery was proposed rejected for similar reasons.
- **Copy / adapt / idea-only**: adapt: flip both gates to user-invoked, trim the bot list, drop the reply-to-thread script unless wanted.
- **Overlap**: pstack entry 36 (Babysit, `watch-pr`, proposed rejected); fork `pr` and `implement`; host `loop` skill.
- **Idle context cost**: ~87 tokens as published (model-invoked); 0 user-invoked.
- **Recommendation (proposed)**: owner's call; if any PR-babysitting skill is wanted, this is the smallest well-specified one. Otherwise reject.

### 22. `commit`, `create-branch`, `pr-writer`

- **What it is.** Sentry's git conventions as three skills. [`commit`][s-commit]: `<type>(<scope>): <subject>` with types including Sentry's own `ref`, `meta`, `license`; branch off `main` first; no customer names or PII. [`create-branch`][s-branch]: `<type>/<short-description>`, non-interactive. [`pr-writer`][s-pr-writer]: the body is "a cover note for reviewers, not a changelog"; choose the minimum shape by change type; no default `Summary`/`Test Plan` sections; omit routine validation; create as draft. `pr-writer` has a `SPEC.md` and one AXIS scenario.
- **Kind**: skill.
- **Proposed address**: none (reject); `pr-writer`'s body rules are idea-only for the fork's `pr`.
- **Why it could fit.** `pr-writer`'s shape table (small change: one paragraph; contract change: affected surface plus migration) is sharper than a fixed template.
- **Why it might not.** The owner's commit, branch and PR title conventions already live in the owner's user-scope `CLAUDE.md` as Conventional Commits, and the fork has `pr`. Sentry's type list differs (`ref` vs `refactor`). `commit`'s description ("Use for every request to commit") is a model-invoked skill doing an always-on rule's job at ~55 idle tokens.
- **Copy / adapt / idea-only**: idea-only for `pr-writer`; reject the other two.
- **Overlap**: fork `pr`; the owner's user-scope `CLAUDE.md`; pstack entry 36; Addy entry 30 (`git-workflow-and-versioning`).
- **Idle context cost**: ~206 tokens for the three.
- **Recommendation (proposed)**: reject as skills; offer `pr-writer`'s "minimum useful shape" table to the fork's `pr` in its theme.

### 23. `code-review`, `find-bugs`, `code-simplifier` (skill and agent)

- **What it is.** [`code-review`][s-code-review]: a 103-line checklist "following Sentry engineering practices" (runtime errors, performance, Django ORM, test coverage, when to escalate). [`find-bugs`][s-find-bugs]: a five-phase review of the branch diff with an attack-surface map and a security checklist run for every file. [`code-simplifier`][s-simplifier]: a skill and a subagent, both adapted from Anthropic's `code-simplifier` plugin agent with an attribution comment; the standards it applies are web ones (ES modules, React props).
- **Kind**: skill + subagent.
- **Proposed address**: none (reject).
- **Why it could fit.** `find-bugs`' "list every changed file before proceeding, then check every item for every file" is a completeness device against skimmed reviews.
- **Why it might not.** The fork has `code-review` (two-axis, standards and spec) and the host has `code-review`, `simplify` and `security-review`. These three add Django and React assumptions and nothing for C#.
- **Copy / adapt / idea-only**: idea-only at most.
- **Overlap**: fork `code-review`; host `simplify`, `security-review`; Addy entries 20 and 21; superpowers entries 13 and 14; davidondrej entry 13. The review theme already has more candidates than it needs.
- **Idle context cost**: ~284 tokens for the three skills.
- **Recommendation (proposed)**: reject.

### 24. `security-review`, `gha-security-review`, `secret-serialization`

- **What it is.** Three security review skills. [`security-review`][s-sec-review]: report only high-confidence findings after tracing data flow; 22 files of per-language and per-vulnerability references derived from the OWASP Cheat Sheet Series under CC BY-SA 4.0 ([LICENSE][s-sec-license]), covering Python, JavaScript and Docker. [`gha-security-review`][s-gha]: GitHub Actions workflows reviewed against real exploit patterns (pwn requests, expression injection, credential theft, supply chain), threat model limited to an attacker without write access, "if you can't build the attack, don't report it"; it lists `CLAUDE.md` and `AGENTS.md` among "config files loaded by workflows". [`secret-serialization`][s-secret-ser]: credentials leaking through generated `repr`/`asdict`/`JSON.stringify` into logs and spans; Python and JavaScript only.
- **Kind**: skill.
- **Proposed address**: `gha-security-review` as a user-invoked maintenance aid (core user-invoked, or run once from a clone); the other two none.
- **Why it could fit.** If #17 adds workflows that run third-party actions or an agent in CI, `gha-security-review` is a focused one-time review of them, and it is language-neutral. The confidence rule ("report only what you can exploit") is a good review norm in general.
- **Why it might not.** `security-review` and `secret-serialization` have no C# or Unity material, and the host ships a `security-review` skill. The CC BY-SA references carry a share-alike obligation the collection would inherit. A private single-author repo has a thin Actions attack surface (no fork PRs to defend against).
- **Copy / adapt / idea-only**: `gha-security-review`: use from a clone when the first workflow is written, do not install. Others: reject.
- **Overlap**: host `security-review`; Addy entry 37 (`security-and-hardening`) and entry 19 (`ci-cd-and-automation`).
- **Idle context cost**: ~486 tokens for the three if model-invoked.
- **Recommendation (proposed)**: reject as installed skills; note `gha-security-review` as a one-off review to run when #17's CI lands.

### 25. `doc-coauthoring`

- **What it is.** A three-stage document workflow (context gathering, refinement, reader testing with a fresh agent) ([SKILL.md][s-doc-co], 380 lines). It appears to be Anthropic's skill of the same name: same title, stages and wording in the parts read (not diffed).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** Covered by the Anthropic ledger: Reader Testing as a cheap check on agent-facing docs.
- **Why it might not.** A copy of a skill already ledgered; the Anthropic ledger notes that skill ships no licence file, so this copy's Apache-2.0 status is unclear.
- **Copy / adapt / idea-only**: not taken from here.
- **Overlap**: Anthropic entry 18 (the original).
- **Idle context cost**: ~170 tokens if model-invoked.
- **Recommendation (proposed)**: reject here; decide under the Anthropic entry.

### 26. `django-access-review`, `django-perf-review`

- **What it is.** Two Django review skills: access control and IDOR ([SKILL.md][s-dj-access], 341 lines) and ORM performance, N+1 queries ([SKILL.md][s-dj-perf], 397 lines).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** Only if the owner's web apps were Django. Nothing in the map says so.
- **Why it might not.** Python and Django only.
- **Copy / adapt / idea-only**: not taken.
- **Overlap**: none.
- **Idle context cost**: ~219 tokens for the two.
- **Recommendation (proposed)**: reject.

### 27. Sentry-internal skills and the `senpai` agent

- **What it is.** Eleven pieces tied to Sentry's company, product or stack: `blog-writing-guide` and `brand-guidelines` (Sentry voice), `document-api-endpoint` (their drf-spectacular API), `gh-review-requests` (team review queue, one script), `pr-link-issue` (GitHub issue to Linear ticket), `presentation-creator` (Sentry-branded React slides), `sred-project-organizer` and `sred-work-summary` (Canadian SR&ED tax-credit paperwork in Notion), `triage-frontend-issues` (their `javascript` Sentry project), `typing-exclusion-worker` (their mypy exclusion list), and the [`senpai`][s-agents] onboarding subagent ([`skills/`][s-skills]).
- **Kind**: skill + subagent.
- **Proposed address**: none.
- **Why it could fit.** Two shapes are reusable as ideas: `typing-exclusion-worker` is a parallel-worker brief with a fixed completion summary (the fork's AFK briefs do the same job), and `triage-frontend-issues` shows a hard safety boundary written into the description ("only archives (never resolves)").
- **Why it might not.** Company-specific content throughout. `blog-writing-guide` alone is ~290 idle tokens, the largest description in the repo.
- **Copy / adapt / idea-only**: not taken.
- **Overlap**: none.
- **Idle context cost**: ~1.4k tokens for the ten skills.
- **Recommendation (proposed)**: reject all.

---

## openai/plugins: `plugin-eval`

Running it. **Windows**: Node 20 or later, no `npm install` needed (every import is `node:` or relative, grep). The package is `"private": true`, so it runs from a checkout as `node scripts/plugin-eval.js <command>` ([README][p-readme]). **CI**: the static commands (`analyze`, `explain-budget`, `measurement-plan`) are deterministic and local, so they suit a workflow step; `benchmark` needs a logged-in Codex CLI and is not a CI candidate. **Harness**: Codex only for plugin targets and for the benchmark; a bare skill directory can be analysed whatever harness it is for. Nothing was run here.

### 28. `analyze`: static skill and plugin checks, score and grade

- **What it is.** `plugin-eval analyze <path>` runs checks and emits a 0 to 100 score, a letter grade, a risk level and a "what to fix first" ordering, as JSON, markdown or HTML ([README][p-readme], [scoring.js][p-scoring]). Skill checks ([skill.js][p-skill-eval]): frontmatter parses; keys outside a list of nine (`name`, `description`, `license`, `allowed-tools`, `metadata`, `disable-model-invocation`, `user-invocable`, `context`, `agent`); hyphen-case name; description present, under 1,024 characters and with a clear trigger; `SKILL.md` over 500 lines (warning) or 800 (error); over 350 lines with no `references/`; relative links that do not resolve; `README.md`, `CHANGELOG.md` or `CONTRIBUTING.md` inside a skill. Plugin checks ([plugin.js][p-plugin-eval]): `.codex-plugin/plugin.json` present and valid, required and interface fields, name matches directory, component paths exist, default-prompt limits. It also has TypeScript, Python and coverage evaluators for code bundled with a plugin.
- **Kind**: script (CI-eval).
- **Proposed address**: idea-only for #17.
- **Why it could fit.** It accepts the Claude gating keys, unlike Anthropic's and Addy's validators. A single score with ranked fixes is easy to read at a glance.
- **Why it might not.** agnix checks the same structure with far more harness knowledge. A score invites optimising the number. The key list rejects `when_to_use`, `paths` and `argument-hint`, which the collection uses. Plugin analysis requires `.codex-plugin/plugin.json`; the owner's direction is one Claude-format manifest read by both harnesses ([loading-mechanics §3](../loading-mechanics.md)), which this would report as a missing manifest. On Windows the "no references" check tests `filePath.includes("/references/")` on paths built with `path.join`, so it would misfire for every long skill (inference from [skill.js][p-skill-eval] and [files.js][p-files]; not run).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: agnix entries 1 and 2; Addy entry 8; Anthropic entry 9; entry 15 here.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject the static evaluator in favour of agnix plus the owner's script.

### 29. `explain-budget`: three-tier token budget and baselines

- **What it is.** A static cost model ([budget.js][p-budget]) with three tiers per skill: **trigger cost** (name plus description, always loaded), **invoke cost** (the whole `SKILL.md`, loaded when the skill fires) and **deferred cost** (every other text file in the skill). It reads `agents/openai.yaml`, and when `policy.allow_implicit_invocation` is `false` the trigger cost is zero and the method is labelled `estimated-static-policy-aware`. For a plugin it sums implicit skills into the trigger tier, lists explicit-only skills separately, and adds the manifest description and default prompts. Each tier is banded good / moderate / heavy / excessive against baselines: per skill 48 / 92 / 150 trigger tokens and 220 / 480 / 900 invoke tokens; per plugin 120 / 260 / 420 trigger tokens ([baseline.js][p-baseline]). Tokens are `ceil(chars / 4)` ([tokens.js][p-tokens]). Observed usage from real runs can replace the estimate (entry 30).
- **Kind**: script (CI-eval) + convention (the cost model).
- **Proposed address**: collection maintenance machinery (#17): the tripwire measurement.
- **Why it could fit.** Decision #14 set tripwires (500 core always-on text, 1,000 core descriptions, 1,000 per pack) and #17's comments note that "something" must measure them, and that `claude plugin details` over-counts user-invoked skills and misses hook output. This model does the first half correctly: it zeroes gated skills. The three tiers also give a name to a cost the map does not yet track: what a skill costs once it fires (invoke) and what it can pull in (deferred). The per-skill "good" trigger band (48 tokens at chars/4, about 190 characters) is close to the fork's median description.
- **Why it might not.** It reads only the Codex gate. It works for the collection only because the gate-parity convention holds, so the parity check (entry 17) must run first. chars/4 under-counts against the 2.6 chars/token the owner measured on Claude ([loading-mechanics §6](../loading-mechanics.md)) by roughly a third. It ignores `when_to_use` (which Claude lists), always-on text, and hook output. Its plugin path needs a Codex manifest. The bands are OpenAI's defaults, not the owner's tripwires.
- **Copy / adapt / idea-only**: adapt as a small script of the owner's own (the logic is about 60 lines): per layer, sum name + `description` + `when_to_use` for skills where *neither* gate hides them, at 2.6 chars/token, add the byte size of the always-on source file, compare with the three tripwires, print one line per layer. MIT per the manifest, but with no licence file in the source, re-implementing is cleaner than copying.
- **Overlap**: `claude plugin details` and `/skill-doctor` ([loading-mechanics §3](../loading-mechanics.md)); the idle-cost method every ledger uses by hand; unity-workflow entry B7 (restatement budget).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt the model, re-implemented in the owner's check script with the owner's ratio and tripwires; record invoke cost as a second, informational figure.

### 30. `init-benchmark`, `benchmark`, `compare` and observed usage

- **What it is.** `init-benchmark` writes an editable `.plugin-eval/benchmark.json` with plain-language scenarios (`title`, `purpose`, `userInput`, `successChecklist`) and optional verifier commands. `benchmark` runs each scenario as a real `codex exec --json --ephemeral` session in a temp workspace with its own `CODEX_HOME` and a `workspace-write` sandbox, keeps raw logs under `.plugin-eval/runs/<timestamp>/`, and writes token usage as JSONL that `analyze --observed-usage` reads back. `compare before.json after.json` diffs two results. "There is no simulated dry-run mode" ([benchmark-harness.md][p-bench-doc], [benchmark.js][p-benchmark], [observed-usage.md][p-observed]).
- **Kind**: CI-eval (on demand).
- **Proposed address**: idea-only; a Codex-side option for #17's behavioural evals.
- **Why it could fit.** It is the only candidate that measures what a skill really costs in tokens on a real run, and it would be the natural Codex check that a collection skill works on the owner's second harness. Before/after comparison fits "does this edit make the skill better or just longer".
- **Why it might not.** Codex only. It measures usage and pass/fail by verifier command; it has no LLM judge and no with/without-skill baseline, so it says less about quality than Anthropic's loop or AXIS. On Windows it spawns `codex` without a shell ([benchmark.js][p-benchmark]), which fails for an npm-installed `codex.cmd` shim (inference; `PLUGIN_EVAL_CODEX_EXECUTABLE` can point at a real executable). Real sessions cost quota.
- **Copy / adapt / idea-only**: idea-only. Take "write measured usage back next to the estimate" and the human-editable scenario fields.
- **Overlap**: entry 16 (AXIS, also `codex exec` in an isolated home); Anthropic entry 2; Addy entries 10 and 11; pstack entry 9 (`benchmark-checklist`) and entry 33; superpowers entry 18.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only. Keep it as the Codex option on #17's runner comparison; do not adopt before a Claude-side runner is chosen.

### 31. The five skills, metric packs and the plugin bundle

- **What it is.** Five Codex skills that route chat requests to CLI commands: `plugin-eval` (umbrella router), `evaluate-skill`, `evaluate-plugin`, `improve-skill` (turns findings into a rewrite brief) and `metric-pack-designer` ([`skills/`][p-skills]). Each ships an `agents/openai.yaml`; none restricts implicit invocation. Metric packs are external commands declared in a manifest that emit extra schema-compatible checks ([metric-pack-manifest.md][p-metric-pack]). The plugin installs through a local Codex marketplace file, with symlink instructions for macOS and Linux ([README][p-readme]).
- **Kind**: skill + manifest-packaging.
- **Proposed address**: none.
- **Why it could fit.** A metric pack is an extension point where the owner's own checks (gate parity, tripwires) could plug in, if `plugin-eval` were the chosen front end.
- **Why it might not.** Five model-invoked descriptions (~560 idle tokens on Codex) that overlap each other by design ("evaluate this skill" appears in three). They exist to teach a beginner which command to run; the owner can type the command. Install instructions assume `ln -s`. The skills look for targets under `~/.codex/skills`, the deprecated Codex location ([loading-mechanics §2](../loading-mechanics.md)).
- **Copy / adapt / idea-only**: not taken.
- **Overlap**: host `skill-creator` ("measure skill performance"); agnix entry 8 (same pattern: a skill wrapping one CLI).
- **Idle context cost**: ~560 tokens (Codex) if the plugin were enabled.
- **Recommendation (proposed)**: reject the skills and the bundle.

---

## agnix rules checked against loading-mechanics

All Claude Code and Codex rule families were read in [`VALIDATION-RULES.md`][a-rules-md] and, where the text was ambiguous, in the Rust source. Rules that match [`loading-mechanics.md`](../loading-mechanics.md) are listed first so the disagreements can be weighed against them.

**Agreements (spot-checked):** `CC-MEM-003` import depth 4 hops; `CC-MEM-014` `CLAUDE.md` under 200 lines; `AS-008` Claude description cap 1,536 characters; `XP-007`/`XP-009` Codex 32,768-byte cap, cumulative over the chain, one file per directory, `AGENTS.override.md` first; `CC-HK-001` lists `UserPromptExpansion` and `PostModelSwitch`; `CC-HK-014` `once` only in skill-frontmatter hooks; `CC-SK-022` reserves `synced`; path detection treats `.agents/skills` as Codex and never as Claude Code; `CC-SK-017` accepts `when_to_use`, `paths`, `disable-model-invocation` and `user-invocable`.

**Disagreements and gaps:**

| Rule | What agnix says | What loading-mechanics says | Effect on the collection |
|---|---|---|---|
| `CX-SK-001` ([L604][a-rules-md], [per_client_skill.rs][a-per-client]) | A skill under `.agents/skills/` "SHOULD NOT use frontmatter fields unsupported by Codex CLI". Only six spec fields count as supported, so `disable-model-invocation`, `when_to_use`, `paths`, `argument-hint` are flagged, with a safe autofix that deletes the line | Codex *ignores* `disable-model-invocation`; the fork's skills carry it in the one file installed to both `.claude/skills` and `.agents/skills`, and it is harmless there (§1, §6) | **Real conflict.** Following the rule, or running `agnix --fix` over a shared or installed tree, strips the Claude gate and turns user-invoked skills into model-invoked ones on Claude Code. Disable the rule |
| `XP-SK-001` ([L3467][a-rules-md]) | Any client-specific frontmatter field is a portability warning | Dual gating is the documented, intended convention | Noise on every gated skill. Disable |
| `CC-SK-006` ([L251][a-rules-md]) | Skills named `deploy|ship|publish|delete|drop` MUST set `disable-model-invocation: true`; autofix adds it | Gating needs the Claude flag *and* `agents/openai.yaml` for Codex | Not wrong, but half a fix: the autofix creates a gate-parity gap. Keep as a warning, never auto-apply |
| `CC-MEM-009` ([L1229][a-rules-md]) | Over 1,500 tokens (chars/4): "Suggest using @imports" | Imports "are expanded at launch ... so imports organize text but save nothing" (§1) | The suggested fix does not reduce idle cost. The threshold is also 3x the owner's 500-token tripwire. Disable or ignore |
| `XP-007` fix text ([L3443][a-rules-md]) | Over 32,768 bytes: "split into multiple files using @import" | Codex has no documented `@import` (§4, itself an inference from docs silence) | The check agrees; the advice does not. Trim instead |
| `CDX-AG-004` ([L2732][a-rules-md]) | `AGENTS.md` SHOULD not exceed 100,000 bytes | Codex caps the concatenated chain at 32 KiB by default (§1) | Stale against both loading-mechanics and agnix's own `XP-007`. Disable |
| `AS-008` detail | Checks `description` length alone against 1,536 | The 1,536 cap applies to `description` plus `when_to_use` combined (§1) | Minor under-check; the owner's script should sum both |
| Gap: Codex gate | No rule reads `agents/openai.yaml` (grep) | `policy.allow_implicit_invocation: false` is the Codex gate (§1) | Gate parity must be checked elsewhere (entry 17) |
| Gap: Codex skill roots | Only `.agents/skills` maps to Codex ([per_client_skill.rs][a-per-client]) | Codex also reads `.codex/skills` and the deprecated `~/.codex/skills` (§2) | A skill there is treated as "unknown" and gets Claude rules. Irrelevant if the collection uses `.agents/skills` only |
| Gap: Claude-format plugins on Codex | Only `.codex-plugin/plugin.json` is a Codex plugin ([detection.rs][a-detection]); `CDX-PL-001` says a legacy manifest MUST live there | Codex also discovers `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (§3) | No false error (a `.claude-plugin` manifest gets Claude rules), but no Codex-side validation of the one-repo-serves-both layout |
| Gap: `paths:` in plugin skills | `CC-SK-019` only checks `paths` is non-empty | Plugin skills ignore `paths:` ([lazy-loading](../lazy-loading.md), ticket #22) | An inert `paths:` passes. Add to the owner's script |
| Gap: idle cost | No rule sums description tokens across skills | Idle context is the budget (§6) | Tripwires need entry 29 |

One new fact for the install design, not in loading-mechanics: `CC-SET-015` records that project-level `pluginConfigs` has been ignored since Claude Code 2.1.207 (source: the Claude Code release notes, not re-verified here).

## Summary of proposals

| Proposed | Entries |
|---|---|
| **Adopt as external tool (configured, pinned)** | 1, 2, 3, 4, 5 (agnix CLI and its Claude Code and Codex rule families), 7 (CI action) |
| **Adapt** | 12 (`skill-scanner` script as intake scan), 14 (`SPEC.md`/`SOURCES.md` for adapted skills and overrides), 10 (drift watchers, low priority), 29 (three-tier budget, re-implemented for the tripwires), 17 (checklist turned into the owner's check script) |
| **Merge into an existing skill or theme** | 13 (four authoring rules into the skill-writing theme), 18 (`agents-md` rules into `writing-for-agents`), 20 (stop rule into the eval theme), 22 (`pr-writer` shape table into fork `pr`) |
| **Idea-only** | 9, 11, 15, 16, 28, 30 |
| **Owner's call** | 21 (`iterate-pr`), 24 (`gha-security-review` as a one-off) |
| **Reject** | 6, 8, 19, 23, 25, 26, 27, 31; the rest of 22 and 24 |

## Not verified

- No tool was run. Every statement about agnix, `scan_skill.py`, `quick_validate.py`, AXIS and `plugin-eval` behaviour comes from reading source and docs. The proposed `.agnix.toml` is untested, and how noisy agnix is on this repo or the fork is unknown.
- AXIS (`@netlify/axis`) was not read; its licence, adapters and isolation are as `EVAL.md` describes them. Whether it can drive Claude Code is unknown.
- Warden (the runner behind `warden.toml`) was not read.
- Windows doubts marked *inference*: `quick_validate.py` encoding and CRLF handling, `plugin-eval`'s `/references/` check and `spawn("codex")`, `iterate-pr` scripts under `uv`.
- Whether agnix's directory walk follows a symlinked skills directory, and whether `REF-002` or `AS-013` catches a backticked path that is not a markdown link.
- `doc-coauthoring` was compared with Anthropic's by title and structure only.
- `openai/plugins` has no licence file at the pin; "MIT" is the manifest's claim.
- agnix's rule text cites Claude Code release notes for several version-ranged rules (`CC-SET-015`, `CC-SK-022`, `CC-PL-015`); those were not re-checked against the releases.

[s-root]: https://github.com/getsentry/skills/tree/d18b7aa8ba878354e5c348310230e652f7690f9c
[s-license]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/LICENSE
[s-readme]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/README.md
[s-agents-md]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/AGENTS.md
[s-skills]: https://github.com/getsentry/skills/tree/d18b7aa8ba878354e5c348310230e652f7690f9c/skills
[s-agents]: https://github.com/getsentry/skills/tree/d18b7aa8ba878354e5c348310230e652f7690f9c/agents
[s-warden]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/warden.toml
[s-settings]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/.claude/settings.json
[s-scanner]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-scanner/SKILL.md
[s-scan-script]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-scanner/scripts/scan_skill.py
[s-writer]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/SKILL.md
[s-writer-spec]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/SPEC.md
[s-writer-eval]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/EVAL.md
[s-desc-opt]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/references/description-optimization.md
[s-spec-template]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/references/spec-template.md
[s-sources-example]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/agents-md/SOURCES.md
[s-quick-validate]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/scripts/quick_validate.py
[s-axis-config]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/evals/axis.config.json
[s-axis-scenario]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/skill-writer/evals/scenarios/small-inline-workflow.json
[s-agents-md-skill]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/agents-md/SKILL.md
[s-settings-audit]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/claude-settings-audit/SKILL.md
[s-prompt-opt]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/prompt-optimizer/SKILL.md
[s-iterate]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/iterate-pr/SKILL.md
[s-commit]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/commit/SKILL.md
[s-branch]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/create-branch/SKILL.md
[s-pr-writer]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/pr-writer/SKILL.md
[s-code-review]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/code-review/SKILL.md
[s-find-bugs]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/find-bugs/SKILL.md
[s-simplifier]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/code-simplifier/SKILL.md
[s-sec-review]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/security-review/SKILL.md
[s-sec-license]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/security-review/LICENSE
[s-gha]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/gha-security-review/SKILL.md
[s-secret-ser]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/secret-serialization/SKILL.md
[s-doc-co]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/doc-coauthoring/SKILL.md
[s-dj-access]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/django-access-review/SKILL.md
[s-dj-perf]: https://github.com/getsentry/skills/blob/d18b7aa8ba878354e5c348310230e652f7690f9c/skills/django-perf-review/SKILL.md

[a-root]: https://github.com/agent-sh/agnix/tree/004b7ea143de549c13e89614fd73be0497abbdd0
[a-readme]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/README.md
[a-spec]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/SPEC.md
[a-action]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/action.yml
[a-precommit]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/.pre-commit-hooks.yaml
[a-config]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/docs/CONFIGURATION.md
[a-rules-json]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/knowledge-base/rules.json
[a-rules-md]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/knowledge-base/VALIDATION-RULES.md
[a-eval]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/knowledge-base/EVALUATION.md
[a-per-client]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/crates/agnix-core/src/rules/per_client_skill.rs#L34-L122
[a-skill-mod]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/crates/agnix-core/src/rules/skill/mod.rs#L280-L315
[a-detection]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/crates/agnix-core/src/file_types/detection.rs#L416-L436
[a-file-utils]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/crates/agnix-core/src/file_utils.rs
[a-npm-install]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/npm/install.js
[a-download]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/scripts/download.sh
[a-test-action]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/.github/workflows/test-action.yml
[a-spec-drift]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/.github/workflows/spec-drift.yml
[a-release-watch]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/.github/workflows/tool-release-watch.yml
[a-skill]: https://github.com/agent-sh/agnix/blob/004b7ea143de549c13e89614fd73be0497abbdd0/skills/agnix/SKILL.md
[a-plugin]: https://github.com/agent-sh/agnix/tree/004b7ea143de549c13e89614fd73be0497abbdd0/plugin

[p-root]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval
[p-readme]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/README.md
[p-manifest]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/.codex-plugin/plugin.json
[p-skills]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/skills
[p-skill-eval]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/evaluators/skill.js
[p-plugin-eval]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/evaluators/plugin.js
[p-scoring]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/core/scoring.js
[p-target]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/core/target.js
[p-budget]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/core/budget.js#L57-L124
[p-baseline]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/core/baseline.js#L9-L21
[p-tokens]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/lib/tokens.js
[p-files]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/lib/files.js
[p-benchmark]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/src/core/benchmark.js
[p-bench-doc]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/references/benchmark-harness.md
[p-observed]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/references/observed-usage.md
[p-metric-pack]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/plugin-eval/references/metric-pack-manifest.md
