# Ledger: dotnet/skills

Ticket: [Ledger: dotnet/skills](https://github.com/Hissal/skill-collection/issues/25), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `dotnet/skills`, read at commit [`1d40f95`][root] (committed 2026-10-09, `main` HEAD when read; 13 commits after the [`3d38ac3`](https://github.com/dotnet/skills/tree/3d38ac343faf65054f7e8d45ca06925273e867e2) the discovery sweep saw, none adding or removing a skill). Read on 2026-10-10 from a shallow clone outside this repo. Nothing from the source was installed or executed, so every statement about what a tool *does* comes from its README or source text, not from a run. Every source link below is pinned to that SHA. Fork references point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`, the SHA the other ledgers used.

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2) and [`research/lazy-loading.md`](../lazy-loading.md) (ticket #22). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured from each `SKILL.md` frontmatter by a script. Tokens are estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics](../loading-mechanics.md) measured on fork descriptions and the other ledgers reused. The chars/4 figure is given beside it where it matters. This is an estimate (inference), not a `claude plugin details` measurement.

**"SDK or Unity" legend.** Each skill entry says which of these holds:

- **SDK-only**: the skill's steps need the `dotnet` CLI, MSBuild project files, NuGet, or APIs newer than Unity ships.
- **Holds under Unity**: the guidance is about C# source or test code and stays true when Unity compiles it.
- **Partly**: the reasoning holds, the commands or some APIs don't.

The Unity side of every such verdict is *inference*. The one written anchor is the fork's `unity-assemblies/SKILL.md` L67: Unity compiles "C# 9 on Roslyn", without init-only setters, covariant returns or module initializers. That Unity projects have no hand-edited `.csproj`, no `dotnet build`/`dotnet test`, use an NUnit-based test framework, and lack .NET 7+ APIs is the owner's working knowledge and was not re-verified here. The source itself never mentions Unity: a whole-word, case-insensitive search for `unity` over every `.md`, `.yaml` and `.json` file returns zero hits.

## Overview

**What the source is.** The .NET team's official skills repo ("the .NET team's curated set of portable skills and host-specific custom agents", [README][readme]). MIT ([LICENSE][license], © .NET Foundation and Contributors). About 5.6k stars and 430 forks (`gh api repos/dotnet/skills`, 2026-10-10). Contributions need an issue first, CODEOWNERS with two FTE aliases or a team, and an eval per skill ([CONTRIBUTING][contributing]). The repo is as much an **evaluation platform** as a skill catalog: `eng/` and `tests/` hold far more files than `plugins/` (about 2,800 tracked files under `tests/` against about 370 under `plugins/`).

**What it ships** (counted from the tree at `1d40f95`):

| Part | Count | Where |
|---|---|---|
| `SKILL.md` files in total | 110, the number the sweep reported | whole tree |
| Published skills | **102**, in 17 plugin folders | [`plugins/`][plugins] |
| Model-invoked | 98 | no `disable-model-invocation` |
| Reference-only | 4 in `dotnet-test` set `disable-model-invocation: true` **and** `user-invocable: false`: `code-testing-agent`, `code-testing-extensions`, `filter-syntax`, `test-analysis-extensions`. Read by sibling skills, never listed | per-skill frontmatter |
| User-invoked | 0. No skill is gated to the human | — |
| Repo-development skills | 5 in [`.agents/skills/`][agents-skills] (`create-skill`, `create-skill-test`, `improve-skill-quality`, `create-custom-agent`, `authoring-github-workflows`) and 1 in `.github/skills/` (`agentic-workflows`). Not in any plugin | entries 10, 15 |
| Test fixtures | 2 `SKILL.md` under `eng/skill-validator/tests/fixtures/` | entry 3 |
| Marketplaces | 4, each listing **16** plugins: Claude ([`.claude-plugin/marketplace.json`][mp-claude]), Codex ([`.agents/plugins/marketplace.json`][mp-codex]), Cursor, Copilot (`.github/plugin/`). `dotnet-experimental` has manifests but is in none of the four, so it cannot be installed from a marketplace | entry 1 |
| Copilot custom agents | 16 `*.agent.md` in 5 plugins (10 in `dotnet-test`) | entry 14 |
| MCP server / LSP | 1 MCP server (`binlog`, in `dotnet-msbuild`); 1 LSP declaration (Roslyn, in `dotnet`) | entry 13 |
| Evals | 106 `eval.yaml` plus 1 `coexistence.eval.yaml` under [`tests/`][tests]; 5 are custom-agent evals | entries 4-6 |
| Tooling | `eng/skill-validator` (C#, 86 files), `eng/run-skill-evals.sh`, `eng/vally-adapter`, `eng/eval-quality`, `eng/dashboard`, `eng/skill-coverage`, `eng/codex`, `eng/version` | entries 2-9 |
| CI | 39 files in `.github/workflows/` | entries 6-9, 15 |
| Agentic workflows | 4 `gh aw` packages under [`agentic-workflows/`][aw] | entry 15 |

**Idle cost as published, per area plugin.** A marketplace install is per plugin, and Claude Code has no supported switch for a single skill inside a plugin ([loading-mechanics §3](../loading-mechanics.md)), so the plugin row is the real unit of cost.

| Plugin | Skills | Model-invoked | Description chars | ≈ tokens (2.6) | ≈ tokens (chars/4) | Entry |
|---|---|---|---|---|---|---|
| `dotnet` | 4 | 4 | 2,782 | **1,090** | 696 | 16-18 |
| `dotnet-advanced` | 4 | 4 | 1,797 | **711** | 449 | 19-22 |
| `dotnet-diag` | 7 | 7 | 3,759 | **1,481** | 940 | 23-25 |
| `dotnet-upgrade` | 6 | 6 | 4,344 | **1,701** | 1,086 | 26-28 |
| `dotnet11` | 1 | 1 | 799 | **312** | 200 | 28 |
| `dotnet-msbuild` | 18 | 18 | 12,006 | **4,708** | 3,002 | 29 |
| `dotnet-nuget` | 1 | 1 | 850 | **332** | 212 | 22 |
| `dotnet-test` | 23 | 19 | 12,503 | **4,904** | 3,126 | 30-34 |
| `dotnet-experimental` | 2 | 2 | 1,258 | **494** | 314 | 35 |
| `dotnet-test-migration` | 6 | 6 | 3,803 | **1,493** | 951 | 36 |
| `dotnet-aspnetcore` | 2 | 2 | 1,224 | **481** | 306 | 37 |
| `dotnet-blazor` | 10 | 10 | 6,468 | **2,538** | 1,617 | 37 |
| `dotnet-maui` | 8 | 8 | 6,066 | **2,373** | 1,516 | 37 |
| `dotnet-winforms` | 1 | 1 | 615 | **242** | 154 | 37 |
| `dotnet-data` | 2 | 2 | 996 | **393** | 249 | 37 |
| `dotnet-ai` | 1 | 1 | 892 | **348** | 223 | 37 |
| `dotnet-template-engine` | 6 | 6 | 4,744 | **1,855** | 1,186 | 37 |
| **All 17** | **102** | **98** | **64,906** | **≈25.5k** | ≈16.2k | |

Three things follow from the table.

1. **Descriptions are about four times the owner's.** The average model-invoked description is ~660 characters (~260 tokens); the owner's fork averages ~60 tokens ([loading-mechanics §6](../loading-mechanics.md)). The longest is 1,017 characters (`migrate-dotnet9-to-dotnet10`), under Claude's 1,536-character per-skill cut ([loading-mechanics §1](../loading-mechanics.md)), so nothing is truncated per skill.
2. **Every plugin with more than three skills crosses the pack tripwire on its own.** The decided tripwire is 1,000 tokens per pack as installed (ticket #14). `dotnet` alone is ~1,090; `dotnet-test` is ~4,900.
3. **The listing budget would bite.** Claude's whole skill listing has a budget of 1% of the context window, and on overflow the least-invoked skills lose their descriptions ([loading-mechanics §1](../loading-mechanics.md)). *Inference*: on a 200k window that is ~2,000 tokens, so `dotnet-test` or `dotnet-msbuild` alone would push descriptions out, including the owner's own. The source hit the same wall on Copilot CLI and documents it (entry 3).

**Fit to the owner, in one line.** Official, current, MIT, and by far the deepest C# material read so far, but written for SDK-style .NET on Copilot CLI: about 65 of the 102 skills are about MSBuild, test platforms, version migrations or app frameworks the owner's stack (Unity, then C# libraries) does not use, and none is written with Unity in mind.

**Standout candidates (proposed):**

- **`csharp-refactoring`** (entry 17): a behavior-preserving refactor gate with a "Do / Never" decision table (rename by bindings not text, keep external names seen by serialization and reflection, validate every `#if` branch and target framework). The reasoning holds under Unity; the commands don't.
- **`testability-obstacle`** (entry 31): pick the smallest seam for time, filesystem, HTTP and randomness; keep the public constructor surface; scoped `AsyncLocal<T>` overrides for static APIs. Sharp where the fork's `tdd` and `codebase-design` are general.
- **`test-anti-patterns`** with `assertion-quality` and `test-gap-analysis` (entry 30): static test review with a severity calibration section that tells the agent what *not* to flag. Polyglot, NUnit included, so it reads Unity tests too.
- **`analyzing-dotnet-performance`** (entry 23): ~50 allocation and async anti-patterns behind a signal-driven reference loader, with a "Common Pitfalls" table against over-flagging. About half of the patterns need APIs Unity lacks.
- **`migrate-nullable-references`** (entry 26): a "zero runtime behavior changes" nullable migration with three rollout strategies and a library breaking-change reference. The file-by-file strategy also works in Unity.
- **`microbenchmarking`** (entry 24): BenchmarkDotNet guidance built from observed model failures. SDK-only, a C# library pack piece.
- **The eval and validator machinery** (entries 3-7, 10): the strictest "does this skill earn its place" method read so far (baseline vs skilled, one vote per distinct stimulus, exact sign test, a 20% net-win floor, dormancy cases), and a distilled list of authoring rules each traced to a merged fix.
- **Repository overlays** (entry 11): a written convention for letting a vendored skill pick up repo-local rules without editing the skill. Directly relevant to the override question in ticket #16.

**Biggest open questions:**

1. **Does a C# library pack exist as its own pack, and what project shape does it serve?** The best candidates split into "C# source and tests, any compiler" (entries 17, 23, 30, 31) and "SDK-style .NET library" (entries 18-22, 24, 26-29, 32, 34). The first group could live in core or serve both packs; the second only makes sense in repos with a `.csproj`.
2. **Does the owner publish NuGet packages and build multi-project solutions?** That decides entries 22 (trusted publishing, Central Package Management), 27 (AOT/trimming compatibility) and 29 (18 MSBuild skills).
3. **Which test framework do the owner's C# libraries use?** The source's authoring skill is MSTest-only (`writing-mstest-tests`), and the migration plugin moves *toward* MSTest. The quality-audit skills are framework-neutral.
4. **Plugin or copies?** As a marketplace plugin the cost is all-or-nothing per plugin, the long descriptions come along, and `paths:` gating is unavailable to plugin skills (ticket #22). Copied as project skills, each can be shortened, gated with `paths: ["**/*.cs"]`, or read as a disabled leaf behind a router. [vendoring](../vendoring.md) proposed copy-with-provenance for adapted skills; the MIT notice must be carried.
5. **Is a Copilot-executed eval useful to an owner on Claude Code and Codex?** The whole eval stack runs skills through the GitHub Copilot SDK (entry 5). The *policy* transfers; the runner does not without a Copilot entitlement, and it would measure Copilot's skill activation, not Claude's or Codex's.
6. **Pushy descriptions.** Several descriptions open with `MUST USE`, `ALWAYS USE`, `MANDATORY` or `DO NOT INVOKE when`. The repo's evidence says this wording was tuned against activation evals (entry 10). The [anthropic-skills ledger](anthropic-skills.md) already flagged "pushy descriptions" against the fork's `writing-for-agents`; this source is the largest data point on that question.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Description length | Average ~660 chars; 98 model-invoked ([table above](#overview)) | Any copied skill needs a rewritten description to fit the owner's tripwires |
| `dotnet` CLI in every validation step | `dotnet build`, `dotnet test`, `dotnet --version`, `dotnet run file.cs` across the catalog; e.g. [`csharp-refactoring` L129-L133][s-refactoring] | Unity has no such loop; validation must be re-pointed at the fork's `unity-verification` |
| APIs newer than Unity ships | `TimeProvider`, `[GeneratedRegex]`, `SearchValues<T>`, `FrozenDictionary`, `LibraryImport`, `Vector128<T>`, `required` members | A skill that holds under Unity still needs its examples filtered (*inference*) |
| Sibling and plugin references | Skills name siblings as hand-offs ("use `dotnet-upgrade`", "route to `test-gap-analysis`"); six analysis skills read files inside the `test-analysis-extensions` skill folder | A single copied skill carries dangling hand-offs; the analysis skills need their extension folder copied too |
| Copilot tool names and agents | `INVOKES: shell (powershell or bash), edit, create, ask_user`; `skill` tool; `.agent.md` handoffs | Inert or misleading on Claude Code and Codex; the source's own README says the agents are Copilot-only ([README][readme]) |
| Version-pinned content | `migrate-dotnet8-to-dotnet9`, `system-text-json-net11`, MSTest v3→v4 | Rots on the release train; the source versions plugins weekly to cope (entry 2) |
| Runtime tool fetches | `dotnet dnx Microsoft.AITools.BinlogMcp --yes --prerelease`; `dnx roslyn-language-server --yes --prerelease` ([marketplace][mp-claude], [`lsp.json`][lsp]) | Enabling `dotnet` or `dotnet-msbuild` as a plugin makes the harness download and run prerelease tools (entry 13) |

### Index: every skill and mechanism to its entry

| Entry | Skills / mechanisms |
|---|---|
| 1 | four marketplaces, three plugin manifests per plugin |
| 2 | per-plugin versioning (`version.json`, `Sync-PluginVersions.ps1`, `/version-bump`, weekly sync) |
| 3 | `skill-validator check` (static analysis), menu budget, validator fixtures |
| 4 | `skill-validator evaluate` (A/B runs, pairwise judge, overfitting judge, baseline reuse) |
| 5 | `run-skill-evals.sh`, experiment files, `vally-adapter` and the verdict policy |
| 6 | eval-quality gate (`check_eval_quality.py`) |
| 7 | Skill Value / token dashboard, `Measure-SkillCoverage.ps1` |
| 8 | Codex plugin smoke test |
| 9 | reference scanner, `known-domains.txt`, `allowed-external-deps.txt`, PR malicious-code scan |
| 10 | authoring skills (`create-skill`, `create-skill-test`, `improve-skill-quality`, `create-custom-agent`, `authoring-github-workflows`), CONTRIBUTING "Quality bar", description-rating prompt |
| 11 | repository overlays (`OVERLAYS.md`) |
| 12 | reference-only skill pattern; `USE FOR / DO NOT USE FOR` description convention; `dotnet-experimental` staging plugin |
| 13 | Roslyn LSP declaration, `binlog` MCP server |
| 14 | 16 Copilot custom agents |
| 15 | agentic workflows, repo-ops workflows, `.github/skills/agentic-workflows`, coexistence experiments |
| 16 | `csharp-expert` |
| 17 | `csharp-refactoring` |
| 18 | `msbuild` (core entry skill), `setup-local-sdk` |
| 19 | `csharp-scripts` |
| 20 | `dotnet-pinvoke` |
| 21 | `vectorization` |
| 22 | `nuget-trusted-publishing`, `convert-to-cpm` |
| 23 | `analyzing-dotnet-performance` |
| 24 | `microbenchmarking` |
| 25 | `dotnet-trace-collect`, `dump-collect`, `clr-activation-debugging`, `android-tombstone-symbolication`, `apple-crash-symbolication` |
| 26 | `migrate-nullable-references` |
| 27 | `dotnet-aot-compat` |
| 28 | `migrate-dotnet8-to-dotnet9`, `migrate-dotnet9-to-dotnet10`, `migrate-dotnet10-to-dotnet11`, `thread-abort-migration`, `system-text-json-net11` |
| 29 | the 18 `dotnet-msbuild` skills |
| 30 | `test-anti-patterns`, `test-smell-detection`, `assertion-quality`, `test-gap-analysis`, `grade-tests`, `test-tagging`, `test-analysis-extensions` |
| 31 | `testability-obstacle`, `detect-static-dependencies`, `generate-testability-wrappers`, `migrate-static-to-wrapper` |
| 32 | `run-tests`, `platform-detection`, `filter-syntax`, `mtp-hot-reload`, `scaffold-dotnet-test-project`, `writing-mstest-tests` |
| 33 | `code-testing`, `code-testing-agent`, `code-testing-extensions` |
| 34 | `coverage-analysis`, `crap-score`, `find-untested-sources` |
| 35 | `exp-mock-usage-analysis`, `exp-test-maintainability` |
| 36 | the 6 `dotnet-test-migration` skills |
| 37 | app-framework and scaffolding plugins: `dotnet-aspnetcore` (2), `dotnet-blazor` (10), `dotnet-maui` (8), `dotnet-winforms` (1), `dotnet-data` (2), `dotnet-ai` (1), `dotnet-template-engine` (6) |

---

## Mechanisms

### 1. Four marketplaces and three manifests per plugin

- **What it is.** One repo serves four hosts. Marketplace manifests: Claude ([`.claude-plugin/marketplace.json`][mp-claude]), Codex ([`.agents/plugins/marketplace.json`][mp-codex]), Cursor (`.cursor-plugin/marketplace.json`) and Copilot (`.github/plugin/marketplace.json`), all named `dotnet-agent-skills` with the same 16 `plugins[].source` values. Each plugin then carries three manifests: root `plugin.json` (Copilot), `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`. The Codex one "must contain only components its runtime loads; do not copy `agents` or `lspServers` into it" ([CONTRIBUTING L55-L62][contributing-layout]), and Codex marketplace descriptions drop host-only claims (the `dotnet` plugin is "C# language server (LSP) integration … and high-level .NET development skills" for Claude but "Core C# and .NET development skills" for Codex). CONTRIBUTING calls the layout "a compatibility bridge, not the intended permanent Agent Plugins package format" ([L69-L74][contributing-layout]). Install is `/plugin marketplace add dotnet/skills` then `/plugin install <plugin>@dotnet-agent-skills`, or `codex plugin marketplace add dotnet/skills` ([README][readme]).
- **Kind**: manifest-packaging.
- **Proposed address**: idea-only input to the install-architecture ticket; also the vehicle if any plugin is taken unmodified.
- **Why it could fit.** It is a working, CI-checked example of the exact thing the map wants: one repo, plugins per domain, enabled per project, on Claude Code and Codex. The per-area split matches "pack = plugin enabled per project" ([loading-mechanics §3](../loading-mechanics.md)). The rule "keep names and sources identical across marketplaces, let descriptions differ per host" is a concrete convention to copy.
- **Why it might not.** Three manifests per plugin is duplication the source itself wants to remove. The owner's install direction prefers individual skill files in `.claude/skills/` and `.agents/skills/` over plugins for per-project material (map Notes), and plugin skills ignore `paths:` (ticket #22).
- **Copy / adapt / idea-only**: idea-only for the layout. Installing a source plugin unmodified through its marketplace is possible but brings the idle costs in the Overview table.
- **Overlap**: the fork's plugin and marketplace manifests and its `agents/openai.yaml` convention ([fork ledger](mattpocock-skills-unity.md)); [vendoring](../vendoring.md) ("marketplaces for unmodified plugins").
- **Idle context cost**: n/a for the manifests; per-plugin figures in the Overview.
- **Recommendation (proposed)**: carry the "same names and sources, host-specific descriptions, Codex manifest lists only what Codex loads" rules into the install ticket. Do not install any plugin whole (see the skill entries).

### 2. Per-plugin versioning

- **What it is.** Each plugin has a [`version.json`][version-json] declaring a major.minor base and `pathFilters` that exclude the three manifests and itself. A patch number is computed from content changes on `main` (Nerdbank.GitVersioning, pinned in `.config/dotnet-tools.json`) and stamped into all three manifests by [`eng/version/Sync-PluginVersions.ps1`][version-sync], either when a maintainer comments `/version-bump` on a PR or by a weekly sync PR. "Don't hand-edit the `version` field"; "Version-only changes do not trigger skill evaluations" ([CONTRIBUTING L88-L127][contributing-versioning]).
- **Kind**: script + CI.
- **Proposed address**: idea-only for the maintenance ticket (#17).
- **Why it could fit.** Claude resolves a plugin's version from the manifest `version` first, and a pinned version "freezes users until it changes" ([loading-mechanics §3](../loading-mechanics.md)). A content-derived patch number removes the "forgot to bump, nobody got the update" failure for any pack shipped as a plugin.
- **Why it might not.** A solo owner installing from a local-path marketplace loads current files each session anyway ([loading-mechanics §3](../loading-mechanics.md)), so there may be nothing to version. It needs the .NET SDK and `nbgv`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the fork's Changesets versioning and release workflow ([fork ledger](mattpocock-skills-unity.md)).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: reject the tooling; note "version derives from content, never hand-edited" as an option if packs ship as versioned plugins.

### 3. `skill-validator check`: static analysis and the menu budget

- **What it is.** The no-LLM half of [`eng/skill-validator`][validator] (C#, shipped nightly as AOT archives and a NuGet package on the `skill-validator-nightly` release, [README][validator-readme]). `check --plugin`, `--skills` or `--agents` validates, per the source ([`SkillProfiler.cs`][skill-profiler], [`PluginProfiler.cs`][plugin-profiler]):
  - name: 1-64 lowercase alphanumerics and hyphens, no leading, trailing or doubled hyphen, equal to the directory name;
  - description: 10-1,024 characters, and **no XML-like tag**, because "Claude rejects XML tags in descriptions";
  - `compatibility` ≤ 500 characters;
  - file references: no `..`, no repo-rooted path, at most one directory below `SKILL.md`; bundled assets ≤ 5 MB;
  - body size by `cl100k_base` BPE count: warn under 200 tokens, warn over 2,500, strong warn over 5,000, plus warnings for no headers, no code blocks, no numbered steps. The README ties the tiers to the SkillsBench paper ("Comprehensive" skills hurt by 2.9pp; "2-3 focused skills outperform 4+", [README L409-L447][validator-readme]);
  - plugin manifests: required fields, paths starting `./`, no `..`, the same MCP servers in all three manifests, Codex-incompatible shapes rejected;
  - a **per-plugin rendered menu budget of 15,000 characters**, counted over the rendered `<skill>` blocks and excluding `disable-model-invocation` skills. The source comment explains why: Copilot CLI lists skills alphabetically under a 15,000-character budget and "every skill past the cut-off collapses to a bare name with NO description … This is exactly why dotnet-test's `run-tests` and `test-*` skills stopped activating in plugin eval runs", and the cap had earlier been raised twice, which "masked the silent menu truncation instead of fixing it" ([`SkillProfiler.cs` L35-L72][skill-profiler]);
  - external references and dependencies (entry 9).
  It runs on every PR ([`skill-check.yml`][wf-skill-check]). `--json` gives machine-readable output; `--verbose` prints per-skill token counts.
- **Kind**: script (CLI) + CI-eval (the static tier).
- **Proposed address**: mechanism for the maintenance ticket (#17). No install address.
- **Why it could fit.** It is a ready, host-neutral lint with a JSON report, and `--skills <dir>` works on bare skill folders without a plugin manifest (per the README's flag table; not run). The menu-budget check is the same class of failure the owner's tripwires exist to catch, with a real incident behind it. The XML-tag and name rules are cheap wins for a Claude-and-Codex collection.
- **Why it might not.** The 15,000-character figure is Copilot CLI's limit, not Claude's (1% of the window, least-invoked dropped first) or Codex's (2% of the window, descriptions shortened first) ([loading-mechanics §1](../loading-mechanics.md)); the owner's tripwires are far lower than any of them. The "numbered workflow steps" and "code blocks" warnings would fire on the fork's principle-style skills. Running it means a downloaded binary or the .NET 10 SDK. The fork already has `scripts/check.mjs` and `validate-plugin`.
- **Copy / adapt / idea-only**: idea-only for most rules (re-implement the few wanted checks in the fork's existing `check.mjs`); or run the published binary as-is as an extra lint, which needs a sandbox trial first.
- **Overlap**: fork `scripts/check.mjs` and `validate-plugin` ([fork ledger](mattpocock-skills-unity.md)); Addy's `skill-lint.js` / `validate-skills.js` ([addy ledger](addy-agent-skills.md) entry 8); anthropic `quick_validate.py` ([anthropic-skills ledger](anthropic-skills.md) entry 9); superpowers lint scripts ([superpowers ledger](superpowers.md) entry 23).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: take the rule list as input to #17, in particular (a) a per-layer budget check computed over *rendered* listing text, set to the owner's tripwires, (b) "no XML-like tags in descriptions", (c) file references stay inside the skill folder. Owner's call whether to trial the binary itself.

### 4. `skill-validator evaluate`: A/B runs, pairwise judge, overfitting judge

- **What it is.** The LLM half of the validator ([README][validator-readme]). For each scenario it runs the agent without the skill (baseline) and with it, collects tokens, tool calls, time and errors, and has a judge compare the two outputs side by side, run twice with the order swapped; a flip counts as a tie. An improvement score weights quality at 0.70, task completion 0.15, and efficiency metrics 0.15 in total. Extras: `--baseline-out`/`--baseline-from` to reuse one baseline across skills, keyed by SHA-256 of prompt, fixtures and criteria; `--no-judge` then `rejudge` to split running from judging; an **overfitting judge** that classifies each rubric item as outcome, technique or vocabulary and scores 0-1 ("rewarding the agent for parroting the skill's specific phrasing", [README L480-L492][validator-readme]); a three-arm design of baseline, isolated skill, and whole plugin. The README marks its own bootstrap confidence intervals as "the legacy run-pooled report": the current gate is entry 5. Agents run through the GitHub Copilot SDK; the default model is `claude-opus-4.6`.
- **Kind**: CI-eval.
- **Proposed address**: idea-only for #17.
- **Why it could fit.** Three ideas are new against the ledgers so far: the **plugin arm** (does the skill still fire and help with all its siblings loaded?), the **overfitting classification** of an eval's own rubric, and **position-swapped pairwise judging**. All three are harness-neutral ideas.
- **Why it might not.** It is bound to the Copilot SDK and a GitHub token with Copilot access. The source has itself moved the gate to Vally (entry 5) and keeps this runner mainly for custom-agent evals. A solo owner with ~30 skills will not run a judged A/B matrix routinely (*inference*).
- **Copy / adapt / idea-only**: idea-only. Cannot be copied: the runner is a .NET app against the Copilot SDK.
- **Overlap**: anthropic skill-creator's with-skill vs baseline loop and its noise-floor rules ([anthropic-skills ledger](anthropic-skills.md) entries 2, 5); Addy's behavioural evals ([addy ledger](addy-agent-skills.md) entry 10); pstack eval playbook ([pstack ledger](pstack.md) entry 33).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: idea-only. Add "plugin arm" and "classify rubric items as outcome / technique / vocabulary" to whatever eval method #17 settles on.

### 5. `run-skill-evals.sh`, the experiment files and the verdict policy

- **What it is.** [`eng/run-skill-evals.sh`][run-evals] is the local entry point: `./eng/run-skill-evals.sh [plugin] [skill]`. It checks for Node 20+ and a GitHub token (falling back to `gh auth token`), runs one Vally experiment (`npx @microsoft/vally-cli`, pinned to 0.14.0 with `@github/copilot` 1.0.75 in `eng/evaluation-tools/package.json`), then [`eng/vally-adapter`][vally-adapter] splits the output per skill and writes `eval-results/<plugin>/<skill>/results.json`. The experiment file ([`dotnet-skills.experiment.yaml`][experiment]) defines two variants per eval, `baseline` (no skills) and `skilled` (exactly the skill under test), with the skill path derived from the eval's path. The adapter applies the repo's **decision rule** ([README policy summary][vally-readme]):
  - each *distinct stimulus* gets one vote; repeated runs collapse to a majority vote and count only as reliability evidence;
  - fewer than five preference-eligible stimuli is `underpowered`, "never a pass, never a regression";
  - pass needs p ≤ 0.05 on an exact one-sided sign test over non-tie votes **and** a net win of at least 20% over all stimuli;
  - `expect_activation: false` **dormancy** stimuli must stay inactive, and do not vote;
  - expected / observed / written results are reconciled and any mismatch fails closed; judge outages are retried per slot, never counted as losses.
  CI does not run evals automatically: a maintainer triggers `/evaluate` bound to a reviewed commit ([CONTRIBUTING L466-L468][contributing-ci]). The README lists its own debt: 48 evals still below the five-stimulus floor, no multiple-comparison correction ([L601-L627][vally-readme]). Three more experiment files test coexistence (entry 15).
- **Kind**: script + CI-eval.
- **Proposed address**: idea-only for #17.
- **Why it could fit.** The policy answers a question the map keeps asking, "does this piece earn its permanent cost?", with a rule strict enough to say *no*. "Count tasks, not repetitions" and the dormancy case ("should stay silent here") are directly usable when the owner writes trigger tests, on any runner. The path-derived experiment file is a neat way to keep one config for every skill.
- **Why it might not.** The executor is the Copilot SDK. Vally's docs are at `microsoft.github.io/vally` but CONTRIBUTING still carries a "Vally is not yet public" TODO (L429-L431); neither was checked. The script is bash, and five-plus distinct stimuli with fixtures per skill is a large authoring cost for a personal collection. Results would describe Copilot's activation behaviour, not Claude Code's or Codex's.
- **Copy / adapt / idea-only**: idea-only. The runner cannot be copied; the decision rule can be restated in a paragraph.
- **Overlap**: anthropic `claude -p` trigger eval and noise-floor rules ([anthropic-skills ledger](anthropic-skills.md) entries 2, 7), which run on the owner's actual harness; Addy's tiered evals and rejected-changes ledger ([addy ledger](addy-agent-skills.md) entries 9-12); superpowers skill-triggering tests ([superpowers ledger](superpowers.md) entries 18, 21).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: idea-only. Take the decision rule (distinct-stimulus votes, underpowered as a third verdict, dormancy cases, fail closed on missing results) as the *policy* layer over whichever runner #17 picks; the anthropic `claude -p` loop remains the more plausible runner for this owner.

### 6. Eval-quality gate (`check_eval_quality.py`)

- **What it is.** A deterministic Python linter for eval suites, with a self-test that proves each check still fires ([`eng/eval-quality/README.md`][eval-quality]). It blocks structural defects "first found only after an eval mysteriously lost to its own baseline or won every trial and still failed": a fixture missing on disk; a fixture present locally but **not in the git index** (a `.gitignore` rule `coverage*.xml` silently swallowed a committed fixture); fixtures whose declared numbers contradict their own payload, so the two arms read different inputs; duplicate stimulus names; underpowered sizing; deprecated keys. It is a "shrink-only ratchet": only suites touched by the change must meet current rules. It states its own limit: it "does not decide whether a scenario is necessary … or whether the scenario portfolio has product value", and pairs the gate with an 11-point author and reviewer checklist (natural non-cued prompt, golden acceptance, mutation rejection, a no-op restraint case). The README says 23 failing checks; [`AGENTS.md`][agents-md] and CONTRIBUTING say 22.
- **Kind**: script + CI-eval.
- **Proposed address**: idea-only for #17.
- **Why it could fit.** "Verify against the git index, not the working tree" and "the gate must have a self-test" are general lessons for any check the collection writes. The reviewer checklist is a compact statement of what makes a skill eval honest, in particular **mutation rejection** ("a realistic broken mutation must fail the grader") and **non-cued prompts** ("Do not name the target, quote its vocabulary, reveal the fix").
- **Why it might not.** Entirely specific to the Vally eval schema and this repo's fixtures. The owner has no eval suites yet.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: anthropic eval-audit guide ([anthropic-skills ledger](anthropic-skills.md) entry 12); the 22-vs-23 mismatch is the same doc-drift the [davidondrej ledger](davidondrej-skills.md) entry 3 found for gating parity.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: idea-only. Carry the shrink-only ratchet, the self-test rule and the index-not-working-tree rule into #17.

### 7. Skill Value and token dashboard; skill coverage

- **What it is.** A static dashboard published at `dotnet.github.io/skills` ([README][readme]: "token use, elapsed time, activation, and not-passed rates by plugin, skill, executor model, and judge model"), built from [`eng/dashboard/`][dashboard]: `generate-benchmark-data.ps1` turns eval results into JSON, [`skill-value.js`][skill-value] renders a per-skill view of baseline against treatment over the trailing 20 runs, and `token-usage.js` charts agent and judge tokens per run. The value view suppresses its plain-English verdict when a skill activated in under half the runs ("the treatment arm behaves like baseline and the delta is diluted", `ACTIVATION_MIN = 0.5`) and needs five paired observations before showing a number. Separately, [`Measure-SkillCoverage.ps1`][skill-coverage] extracts a skill's checklist items, pitfalls and workflow steps and cross-references them against its eval's graders and rubric: "code coverage for skill files". The live site was not opened; `generate-token-data.ps1` in the repo generates dummy data for development.
- **Kind**: script + CI-eval (reporting).
- **Proposed address**: idea-only for #17.
- **Why it could fit.** It reports the two numbers the owner's budget cares about, activation rate and token delta per skill, and its retirement rule is explicit: "A skill that is weak across model families, thinly used, and costing menu budget is a candidate for retirement, not indefinite polishing" ([CONTRIBUTING L599-L600][contributing-quality]). "Which of my skill's claims does any test check?" is a cheap, useful question for the fork's rule-heavy Unity skills.
- **Why it might not.** The dashboard measures tokens *spent during eval runs*, not idle description cost, so it does not answer the owner's idle-budget question (`claude plugin details` and `/skill-doctor` do, [loading-mechanics §3](../loading-mechanics.md)). It needs the whole eval pipeline behind it. Coverage by text matching is a rough proxy.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: anthropic eval viewer and `aggregate_benchmark.py` ([anthropic-skills ledger](anthropic-skills.md) entries 5, 6); Claude's own `/skill-doctor`.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: reject the dashboard; keep two ideas for #17: an activation-rate floor below which a skill's "value" is not reported, and a claims-to-tests coverage listing for skills that carry checklists.

### 8. Codex plugin smoke test

- **What it is.** [`eng/codex/codex-plugin-smoke.mjs`][codex-smoke], run by `codex-plugin-smoke.yml`. It pins a Codex CLI release (`0.154.0`), points `CODEX_HOME` at a scratch directory, and "without API credentials, verifies marketplace installation, skill discovery, MCP discovery, and direct MCP transport". It "does not cover authentication, model inference, prompt-based skill selection, or model-driven tool selection" ([CONTRIBUTING L148-L151][contributing-mcp]). The design reason is stated: use Codex itself "avoiding a brittle duplicate of Codex's evolving server parser" ([validator README][validator-readme]).
- **Kind**: CI-eval (install smoke test).
- **Proposed address**: idea-only for #17 and the install ticket.
- **Why it could fit.** The map requires the collection to be "usable from Codex", and the owner works in Claude Code first, so Codex breakage would go unnoticed (*inference*). A credential-free "does Codex install and list my skills" check with an isolated `CODEX_HOME` is exactly sized for that.
- **Why it might not.** Tied to plugin-marketplace installs; the owner's direction is skill files in `.agents/skills/`, where the equivalent check is simpler. A pinned CLI version needs bumping.
- **Copy / adapt / idea-only**: adapt the idea (isolated `CODEX_HOME`, install, list, assert the expected skill names). The script itself is specific to this marketplace and its MCP server.
- **Overlap**: fork `agents/openai.yaml` parity checks ([fork ledger](mattpocock-skills-unity.md)); the gating-parity lint proposed in the [davidondrej ledger](davidondrej-skills.md) entry 3; superpowers plugin tests ([superpowers ledger](superpowers.md) entry 21).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: adapt as a small Codex discovery smoke check in #17.

### 9. Reference scanner, allow-lists and the PR malicious-code scan

- **What it is.** Three supply-chain guards. (a) A reference scanner inside `skill-validator check` that fails CI on `http://` URLs, `<script>` tags without SRI, pipe-to-shell patterns (`curl … | bash`), and any URL whose domain is not in [`eng/known-domains.txt`][known-domains] (74 lines) ([CONTRIBUTING L500-L517][contributing-external]). (b) [`eng/allowed-external-deps.txt`][allowed-deps], an explicit list of every bundled script, `INVOKES` pattern, non-built-in tool reference and MCP server in the catalog, with the note "Once this file is empty and all checks pass, the checks can be promoted to hard errors". (c) A `gh aw` agent workflow, [`pr-malicious-scan.agent.md`][pr-scan], that statically scans diffs from untrusted contributors and "Never executes PR head code". Also: validator and eval workflow changes must come from a branch in the repo, never a fork ([CONTRIBUTING L614-L617][contributing]).
- **Kind**: CI-eval + convention doc.
- **Proposed address**: idea-only for #17 and for [vendoring](../vendoring.md).
- **Why it could fit.** The collection vendors skills from many sources under a "no blind picks" rule. A domain allow-list and a pipe-to-shell check are a mechanical first pass over vendored text, and the allowed-deps file is a compact inventory of "what in my skills runs code or reaches out".
- **Why it might not.** A solo owner reviews each vendored skill by hand already; an allow-list of 74 domains is maintenance. The discovery sweep already queued `skill-scanner` and `agnix` for this job (map, ticket #13).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the security checklist in `effective-agent-skills` ([davidondrej ledger](davidondrej-skills.md) entry 6); the maintenance-tooling ledger (pending, ticket #19).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: idea-only. Offer the four scanner rules and the "inventory every script and external tool a skill uses" file to the maintenance-tooling theme.

### 10. Authoring skills, the "Quality bar" and the description-rating prompt

- **What it is.** The repo's rules for writing skills, in three places.
  - CONTRIBUTING's **"What consistently separates a passing skill from a failing one"** ([L560-L600][contributing-quality]): "Every skill is scored head-to-head against the *same model with no skill loaded*, so the score is a **delta**." Rules: "Encode the decisions the model gets wrong; delete anything it already produces unaided"; prefer "when A, do B, never C, verify D" tables; "Scale output structure to input size"; add stop-conditions, then check for over-correction; tell the agent to discover paths instead of marking them required; "Require truthful validation reporting"; "Verify load-bearing API claims by compiling or probing, not by reading source". For activation: put "the user's own words" in the description (symptoms, error codes, quoted requests); "Partition against sibling skills on the real discriminator … and add the matching exclusion to both siblings"; re-read every "do not use for" clause, because "an exclusion can lock out the skill's own purpose".
  - [`improve-skill-quality`][s-improve] and its reference [`writing-for-baseline-delta.md`][s-baseline-delta], where **each rule cites the PR that taught it** (a skill "scored 0% improvement because it 'read as reference prose'"; an Inputs table row marked required made the agent ask for a file sitting in the working directory; a MAUI skill taught a property that does not compile). Its workflow is "classify before you rewrite": rule out fixture, harness, power and routing failures before touching skill text.
  - [`create-skill`][s-create-skill] ("Write the description — it is the router", "Write for delta over the baseline model"), [`create-skill-test`][s-create-test], `create-custom-agent`, `authoring-github-workflows`, and a Copilot prompt that rates every description 1-5 on what / when / when-not / capabilities ([`evaluate-skill-descriptions.prompt.md`][desc-prompt]).
- **Kind**: skills (repo-development, model-invoked in that repo) + convention doc.
- **Proposed address**: ideas into fork `writing-for-agents` (core model-invoked). No new skill.
- **Why it could fit.** This is the only authoring guidance read so far where the rules come with measured failures behind them. Several are directly checkable against the fork's skills: "delete what the model already produces unaided" matches the fork's own leanness; "don't mark discoverable inputs required" and "scale structure to input size" are cheap, specific edits. "Verify load-bearing API claims by compiling" is the rule the [Unity workflow ledger](unity-workflow-repos.md) needed for Nice-Wolf's known errors.
- **Why it might not.** The rules optimise a *pairwise judge's preference on Copilot*, which rewards longer descriptions with trigger phrases and exclusions, the opposite pull to the owner's idle budget. `create-skill` and `create-skill-test` are bound to this repo's layout, CODEOWNERS and Vally schema. Anthropic's skill-creator already reaches the owner through the host ([anthropic-skills ledger](anthropic-skills.md)).
- **Copy / adapt / idea-only**: idea-only. Merge selected rules; the skills cannot be copied because every step names this repo's paths and tools.
- **Overlap**: fork `writing-for-agents`; anthropic `skill-creator` and the "pushy descriptions" conflict ([anthropic-skills ledger](anthropic-skills.md) entries 1, 8, 10); `effective-agent-skills` ([davidondrej ledger](davidondrej-skills.md) entry 6); superpowers `writing-skills` ([superpowers ledger](superpowers.md) entry 17); Addy's description-phrasing finding ([addy ledger](addy-agent-skills.md) entry 11).
- **Idle context cost**: ~1,040 tokens for the five `.agents/skills/` as published (they are 222-970 characters each), paid only inside the source repo. 0 as merged ideas.
- **Recommendation (proposed)**: reject the skills; merge four rules into `writing-for-agents` in the skill-writing theme: baseline-delta ("delete what the model writes unaided"), paired exclusions between sibling skills, no "required" inputs the agent can discover, and compile-or-probe for load-bearing API claims. Decide the long-description question (Open question 6) in the same session.

### 11. Repository overlays

- **What it is.** A pilot convention in [`plugins/dotnet-test/OVERLAYS.md`][overlays], credited to Jeremy Kuhne's `agent-skills` repo. A portable skill declares `metadata: binding: optional-overlay` and `binding-revision: "1"` in its frontmatter. At the start of its workflow it checks one fixed path in the *repository being worked on*, `.agents/skill-overlays/<plugin>/<skill>.md`. The overlay file names its `core` skill and `binding-revision`; on a match the skill applies it, on a mismatch it "is reported and the overlay is not applied". Rules: `mode: extend` only; an overlay "may narrow portable defaults, but it cannot expand tool permissions, task scope, filesystem access, network access, or publication authority"; precedence is user instructions, then verified project constraints, then the overlay, then skill defaults; a contradiction is reported, not silently resolved. The doc is plain about its status: "instruction composition, not a host-level Markdown merge", and hosts provide no discovery or pin validation. Three skills use it: `run-tests`, `scaffold-dotnet-test-project`, `writing-mstest-tests` ([`run-tests` L26-L45][s-run-tests]).
- **Kind**: convention doc.
- **Proposed address**: idea-only input to the install-architecture ticket and to ticket #16's override question.
- **Why it could fit.** The collection has the same problem in two places. The fork's Unity skills read a per-repo "Unity config" ([fork ledger](mattpocock-skills-unity.md), "Unity delta line pattern and the Unity config"), and ticket #16 decided that a big personal change becomes a same-name fork override, a whole copied skill. An overlay is the lighter third option: the skill stays unmodified and updatable, and the delta lives in the project. The no-escalation rule and the revision pin are the two safeguards such a scheme needs.
- **Why it might not.** It costs a file read at the start of every use of the skill, plus ~20 lines of instruction in each participating skill. It only works if the skill author added the hook, so it cannot overlay third-party skills that don't. It is a pilot in three skills with no host support.
- **Copy / adapt / idea-only**: idea-only (a convention, not a file to copy).
- **Overlap**: fork Unity config and `setup-matt-pocock-skills`; the **override** and **fork override** terms in [`GLOSSARY.md`](../../GLOSSARY.md); path-scoped rules as a per-project knowledge carrier ([lazy-loading](../lazy-loading.md)).
- **Idle context cost**: 0 idle; one extra read per invocation.
- **Recommendation (proposed)**: bring to the install theme as a named alternative to a full override for small per-project deltas. Owner decides whether the fork's Unity config already is this.

### 12. Reference-only skills, the description convention and the experimental plugin

- **What it is.** Three conventions.
  - **Reference-only skills.** Four `dotnet-test` skills set both `disable-model-invocation: true` and `user-invocable: false` and exist only to hold files that sibling skills read by path. [`test-analysis-extensions`][s-test-ext] says "Do not invoke this reference-only skill — its bundled files are read by the quality agent and analysis skills", and holds one lookup file per language (11 files). They cost no menu budget (entry 3) and are exempt from evals because "an activation-graded eval would compare two identical arms" ([CONTRIBUTING L305-L307][contributing]).
  - **Description shape.** Most descriptions follow `<what>. USE FOR: … DO NOT USE FOR: … INVOKES: …`, and a later generation opens with a routing command (`MUST USE when`, `ALWAYS USE when`, `MANDATORY for`, `DO NOT INVOKE when … use <sibling>`).
  - **`dotnet-experimental`.** A staging plugin for unproven skills, held to the same eval bar, expected to "graduate to a stable plugin or be retired" ([CONTRIBUTING L76-L86][contributing]), and absent from every marketplace.
- **Kind**: manifest-packaging convention.
- **Proposed address**: idea-only (install ticket, skill-writing theme).
- **Why it could fit.** The reference-only skill is an independent confirmation of ticket #22's finding that a router can read a disabled leaf by path, here used as shared storage between sibling skills; the source's wording "read the file directly, do not invoke" matches the decided rule. A staging bucket with an exit rule mirrors the fork's in-progress bucket and promotion rule.
- **Why it might not.** Reading a sibling skill's folder by relative path breaks when skills are copied one at a time, which is the owner's install direction. The routing-command openers are what push the descriptions to ~660 characters.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [lazy-loading](../lazy-loading.md) (disabled leaf read by path); fork bucket layout and promotion rule, `.agents/invocation.md` ([fork ledger](mattpocock-skills-unity.md)); Addy's shared-references portability problem ([addy ledger](addy-agent-skills.md) entry 4).
- **Idle context cost**: 0 for the four reference-only skills.
- **Recommendation (proposed)**: idea-only. Note "shared reference folder as a hidden skill" as a packaging option, with the single-copy caveat.

### 13. Roslyn LSP declaration and the `binlog` MCP server

- **What it is.** Two host integrations declared in manifests. The `dotnet` plugin's [`lsp.json`][lsp] starts a C# language server with `dnx roslyn-language-server --yes --prerelease -- --stdio --daemon-mode --autoLoadProjects` for `.cs`, `.razor` and `.cshtml`, with a 120-second warm-up; it needs the .NET 10 SDK ([plugin README][dotnet-readme]). The `dotnet-msbuild` plugin declares an MCP server, `dotnet dnx Microsoft.AITools.BinlogMcp --yes --prerelease`, for querying MSBuild binary logs ([marketplace][mp-claude]). `csharp-refactoring` and `csharp-expert` tell the agent to use LSP `findReferences`, `rename` and diagnostics when available. Codex installs get the skills but not the LSP.
- **Kind**: manifest-packaging (LSP + MCP).
- **Proposed address**: owner's call; C# pack, if the owner wants semantic navigation in SDK-style repos.
- **Why it could fit.** Binding-aware rename and find-references is what makes `csharp-refactoring`'s "rename by bindings, not text" achievable by an agent. For C# libraries with a `.csproj` this is a real capability gain.
- **Why it might not.** Enabling the plugin means the harness fetches and runs a **prerelease** tool from NuGet at session start with `--yes`, which is outside "nothing unreviewed runs". It needs .NET 10. *Inference*: in a Unity repo `--autoLoadProjects` would load Unity's generated `.csproj`/`.sln` if present, which is slow and often stale; the session's `rider` MCP server (configured on the owner's machine, failed to connect in this session) suggests the owner already has an IDE-backed route. Whether Claude Code's plugin `lspServers` support behaves as the source assumes was not checked here.
- **Copy / adapt / idea-only**: copy is trivial (one JSON block) but only as a deliberate, sandbox-tested choice.
- **Overlap**: the fork's `unity-verification` and `unity-debugging` (editor-driven checks); the Unity baseline's `unity-cli` ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: unknown for the LSP (tool surface is host-defined); an MCP server adds its tool definitions to context unless the host defers them (not measured).
- **Recommendation (proposed)**: owner's call, sandbox first. Do not enable either through the source plugin.

### 14. Copilot custom agents

- **What it is.** 16 `*.agent.md` files: `test-engineer` plus nine workers in `dotnet-test` ([`test-engineer.agent.md`][a-test-engineer]), three in `dotnet-msbuild`, and one each in `dotnet-diag` (`optimizing-dotnet-performance`, a "two-pass" reviewer over the entry 23 patterns), `dotnet-template-engine` and `dotnet-test-migration`. They use GitHub Copilot frontmatter (`tools`, `agents`, `handoffs`). The README is explicit that they "are not installed as native OpenAI Codex agents" and that the repo ships no Codex agents ([README][readme]).
- **Kind**: manifest-packaging (host-specific agents).
- **Proposed address**: none.
- **Why it could fit.** The `test-engineer` pipeline (researcher → planner → implementer → builder → tester → fixer) is a worked example of splitting test generation across subagents with bounded context.
- **Why it might not.** Copilot-only format. The fork already has `implement` and `tdd` flows, and the superpowers ledger proposed rejecting a competing plan-and-execute chain for the same reason ([superpowers ledger](superpowers.md)).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement`, `tdd`; pstack fleet machinery ([pstack ledger](pstack.md), proposed rejected).
- **Idle context cost**: on Claude Code, plugin agents add their names and descriptions to the listing ([loading-mechanics §1](../loading-mechanics.md)); not measured here.
- **Recommendation (proposed)**: reject all sixteen.

### 15. Agentic workflows, repo-ops workflows and coexistence experiments

- **What it is.** Three leftovers.
  - Four redistributable GitHub Agentic Workflow packages under [`agentic-workflows/`][aw] (build-failure analysis, MSBuild quality review, test-failure analysis, unskip closed tests), installed with `gh aw add-wizard`, each with an offline prompt eval. The `.github/skills/agentic-workflows` skill (~35 tokens) is the `gh aw` helper.
  - The repo's own ops workflows: devops health checks, issue and PR triage batches, a stale sweep, a PAT-pool validator, a markdown linter.
  - Three **coexistence experiments** ([`csharp-expert-coexistence.claude.experiment.yaml`][coexist]): `csharp-expert` is evaluated with 12 skills from other plugins loaded beside it, on a Claude-family and a GPT-family model, to check the router still routes; `msbuild-coexistence` does the same for the two plugins that both own MSBuild.
- **Kind**: CI-eval + script.
- **Proposed address**: none; the coexistence idea goes to #17.
- **Why it could fit.** Coexistence is the test the owner's collection most needs and no other ledger has: skills from the fork, the Unity baseline and vendored sources will sit in one listing, and "does my skill still fire next to its neighbours" is the realistic failure. The "unskip closed tests" package's rule (re-enable a skipped test only after its tracking issue is verifiably closed) is a tidy idea.
- **Why it might not.** `gh aw` and the ops workflows serve a large multi-maintainer repo on GitHub Actions with Copilot. The owner has no CI estate like it.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `triage` and the Check workflow ([fork ledger](mattpocock-skills-unity.md)); Addy's routing evals ([addy ledger](addy-agent-skills.md) entry 9).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: reject the workflows; add "coexistence run: evaluate a skill with its realistic neighbours loaded, on both model families" to #17's ideas.

---

## Skills

### 16. `csharp-expert` (router)

- **What it is.** The "front door for C# and .NET work" in the `dotnet` plugin ([`SKILL.md`][s-expert], 350 lines, one reference). A **routing contract**: classify the prompt, inspect the smallest set of repo files to detect the solution type, compare with "the descriptions of the skills currently available to the runtime", invoke the narrowest installed specialist, and when it is missing, name its plugin from a bundled marketplace map and give install steps. "Routing is not task completion … Continue in the same turn when the task can be completed and validated without the specialist" ([L24-L42][s-expert]). It carries an ambiguity table ("'Make this faster': build duration → build-performance skill; SQL/query shape → data skill; process CPU/memory → diagnostics …") and a C# language fallback for when no specialist owns the work.
- **Kind**: skill.
- **Proposed address**: none as a skill; idea-only for the router-content item on the map.
- **SDK or Unity**: SDK-only. Every route ends in a source plugin; the solution-type table has no Unity row.
- **Why it could fit.** It is a second worked router beside pstack's `poteto-mode` ([pstack ledger](pstack.md)), with a different design: it is model-invoked, routes on *repo evidence* (project file markers) as well as the prompt, and it knows about skills that are **not installed** and says how to get them. The "treat user nouns as clues, not proof" ambiguity table is the reusable part.
- **Why it might not.** Its value is the map of this marketplace. At ~259 tokens it is the price of one router whose targets the owner mostly won't install. The source needed dedicated coexistence experiments to keep it from stealing or missing activations (entry 15), a warning about model-invoked routers in general. The owner's decided direction is a manual router (map, "Router content").
- **Copy / adapt / idea-only**: idea-only. It cannot be copied: its body is a lookup into `dotnet/skills` plugins.
- **Overlap**: fork `unity` router and `ask-matt` ([fork ledger](mattpocock-skills-unity.md)); pstack `poteto-mode`; ticket #22's "router reads a disabled leaf by path".
- **Idle context cost**: ~259 tokens as published (661 chars).
- **Recommendation (proposed)**: reject the skill. Offer two ideas to the router-content decision: route on repo evidence, and let the router name pieces that exist in the collection but are not installed in this project.

### 17. `csharp-refactoring`

- **What it is.** A behavior-preserving refactoring skill ([`SKILL.md`][s-refactoring], 167 lines, one reference catalog of operations). It opens with a **mandatory classification gate**: a request called a "refactor" that is really an upgrade, a feature, a behavior change or a public nullability change gets a fixed three-line stop response ("Not a behavior-preserving refactor: …", "No files changed.", "Next workflow: …"); a mixed request gets the separable structural part done and the rest deferred ([L13-L42][s-refactoring-gate]). Then: stay inside the current workspace; "Rename / move by bindings, not text" with a tool ladder (IDE/Roslyn refactoring, then LSP, then analyzers, then compiler-validated edits, plain find/replace last); consolidate toward the existing owner, never invert a dependency because it compiles; a six-row **Do / Never** table ([L80-L91][s-refactoring-table]), e.g. "Rename a member reached by a string, reflection, DI, or configuration → … preserve the observed external name … | Never: Rewrite an external/configured name just to make the new source name consistent", and "Rename code compiled under `#if` or multiple TFMs → … validate each target framework explicitly | Never: Treat a green default-target build as evidence for unbuilt branches". Verification is proportional: local/private changes get one build-and-test, cross-boundary changes get a baseline and per-target runs. It ends with a four-line response contract (Refactor / Preserved / Validation / Deferred) and stop conditions ("The baseline is already red").
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked; or core, if the owner wants it in Unity repos too.
- **SDK or Unity**: **partly**. The gate, the bindings-not-text rule, the Do/Never table and the stop conditions are about C# semantics and hold under Unity. The validation commands (`dotnet build`, `dotnet test`), `PublicAPI.Shipped.txt`/`ApiCompat`, `[TypeForwardedTo]` and target-framework language are SDK-only. *Inference*: the Unity equivalents of its boundaries are sharper, not weaker: a renamed serialized field loses data without `[FormerlySerializedAs]`, a moved or renamed `MonoBehaviour` breaks script references through its `.meta` GUID, `#if UNITY_EDITOR` branches are the unbuilt branches, and `.asmdef` boundaries replace `InternalsVisibleTo` checks. The fork's `unity-serialization` and `unity-assemblies` own those.
- **Why it could fit.** The owner's stack is C# in both of its first two domains, and no fork skill covers refactoring discipline: `codebase-design` and `improve-codebase-architecture` say *what* to restructure, not how to do it without changing behavior. "Never modify tests to make an unauthorized behavior change appear preserved" and "never claim success after a failed restore, build … or test run" are exactly the honesty rules other ledgers proposed as always-on one-liners. The skill is short and decision-shaped.
- **Why it might not.** Its 724-character description (~283 tokens) is dense with exclusions tuned for Copilot's menu. It hands off to source plugins (`dotnet-upgrade`) and links the source's `lsp.json` on `main`. Without binding-aware tooling (entry 13) the top of its tool ladder is unavailable and it degrades to "compiler-validated edits", which in Unity means an editor recompile.
- **Copy / adapt / idea-only**: adapt. Shorten the description to one trigger sentence; replace the hand-offs with the owner's workflows; split validation into "SDK repo" and "Unity repo: use `unity-verification`"; add the Unity rows above by reference to the fork's skills, not by restating them. It cannot be copied directly because of the description length, the dangling hand-offs and the SDK-only validation.
- **Overlap**: fork `codebase-design`, `improve-codebase-architecture`, `unity-serialization`, `unity-assemblies` ([fork ledger](mattpocock-skills-unity.md)); pstack "Refactoring" playbook and `blast-radius` ([pstack ledger](pstack.md) entries 8, 34); Addy `code-simplification` and `deprecation-and-migration` ([addy ledger](addy-agent-skills.md)). The Unity baseline has no refactoring skill ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: ~283 tokens as published; ~50-70 with a rewritten description (*inference*).
- **Recommendation (proposed)**: adapt. The strongest single skill candidate in this source. Owner decides core vs C# pack once Open question 1 is settled.

### 18. `msbuild` (core entry skill) and `setup-local-sdk`

- **What it is.** The other two skills in the `dotnet` plugin. [`msbuild`][s-msbuild] (105 lines, 12 bundled references) is a task-routed entry for build failures, build performance and build-file review that "loads bundled references rather than activating the specialist" skills, so the core plugin covers ordinary cases without `dotnet-msbuild` installed. [`setup-local-sdk`][s-local-sdk] (386 lines) installs a .NET SDK into a repo-local folder for previews or pinned versions "without modifying the system-wide installation".
- **Kind**: skills.
- **Proposed address**: C# pack model-invoked (`msbuild`), C# pack user-invoked (`setup-local-sdk`).
- **SDK or Unity**: SDK-only, both.
- **Why it could fit.** `msbuild` is the source's own answer to "18 MSBuild skills is too many descriptions": one ~338-token entry that reads references on demand. That is the router-with-leaves shape ticket #22 decided on, already built. A C# library owner hits MSBuild failures.
- **Why it might not.** `msbuild`'s description is the longest in the plugin (867 chars) and half of it is exclusions. `setup-local-sdk` is rare, one-off work.
- **Copy / adapt / idea-only**: `msbuild`: copy with a rewritten description, if a C# pack exists. `setup-local-sdk`: idea-only.
- **Overlap**: entry 29 (the 18 specialists it summarises); fork `diagnosing-bugs`.
- **Idle context cost**: ~338 and ~209 tokens as published.
- **Recommendation (proposed)**: owner's call on `msbuild` as the single MSBuild piece of a C# pack (instead of entry 29); reject `setup-local-sdk`.

### 19. `csharp-scripts`

- **What it is.** Running file-based C# apps with `dotnet run file.cs` ([`SKILL.md`][s-scripts], 298 lines): directives (`#:package`, `#:property`, `#:sdk`, `#:include`, `#:ref`), shebang support, source-generated JSON, converting to a project, and a fallback for .NET 9 and earlier. "File-based apps require .NET 10 or later." Its description excludes "language-agnostic throwaway scripts, generic computations, Python/PowerShell-style automation".
- **Kind**: skill.
- **Proposed address**: C# pack user-invoked, or none.
- **SDK or Unity**: SDK-only. It is unrelated to Unity's compile loop, though it could be used *beside* a Unity project to try a C# API in isolation (*inference*; Unity's API surface differs, so results don't transfer automatically).
- **Why it could fit.** A quick "probe a C# language or BCL behaviour without a project" loop supports the source's own rule "verify load-bearing API claims by compiling" (entry 10) and the fork's `prototype` skill for pure-logic questions.
- **Why it might not.** Needs the .NET 10 SDK installed. Most of the body is directive reference a current model may know (the source's own baseline-delta rule). Whether the owner has .NET 10 was not checked.
- **Copy / adapt / idea-only**: idea-only, or copy with a short description if the owner uses file-based apps.
- **Overlap**: fork `prototype`, `unity-prototyping` (which decides when a prototype belongs in the engine).
- **Idle context cost**: ~170 tokens as published.
- **Recommendation (proposed)**: owner's call; lean reject.

### 20. `dotnet-pinvoke`

- **What it is.** Native interop guidance ([`SKILL.md`][s-pinvoke], 449 lines, two references): choose `DllImport` or `LibraryImport`; map native types; string marshalling; memory ownership; `SafeHandle`; error handling; callbacks; cross-platform library loading; migrating to `LibraryImport`; tooling (CsWin32, CsWinRT, Objective Sharpie); a review checklist and runnable validation steps.
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked, only if the owner writes native interop.
- **SDK or Unity**: **partly**. `DllImport`, type mapping, string and ownership rules hold under Unity. `LibraryImport` is a .NET 7 source generator and does not apply. *Inference*: Unity adds rules this skill lacks (IL2CPP callback attributes, per-platform plugin import settings, `__Internal` on iOS), so it would mislead as much as help there without a Unity delta.
- **Why it could fit.** Interop errors are silent memory corruption, the kind of decision a skill should encode. Native plugins are a real Unity topic.
- **Why it might not.** Niche for most projects; whether the owner does interop at all is unknown. 449 lines is near the source's own 500-line ceiling.
- **Copy / adapt / idea-only**: adapt if wanted (trim to the DllImport path, add a Unity delta); otherwise idea-only.
- **Overlap**: none in the fork or other ledgers. Not in the Unity baseline's gap list as read ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: ~212 tokens as published.
- **Recommendation (proposed)**: reject unless the owner names interop as real work.

### 21. `vectorization`

- **What it is.** SIMD authoring and review rules ([`SKILL.md`][s-vector], 191 lines): "Use the highest-level API that matches the contract, then stop" (`TensorPrimitives`, span operations), start explicit loops with `Vector128<T>`, keep platforms consistent, read `IsHardwareAccelerated` directly, then authoring, testing and benchmarking checklists and a completion contract.
- **Kind**: skill.
- **Proposed address**: none.
- **SDK or Unity**: SDK-only. *Inference*: Unity's SIMD route is Burst and `Unity.Mathematics`, not `System.Runtime.Intrinsics`.
- **Why it could fit.** "Review correctness and memory safety before performance" is a good ordering rule for any low-level optimisation.
- **Why it might not.** Rare work for this owner; the API family is absent from Unity.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 24.
- **Idle context cost**: ~163 tokens as published.
- **Recommendation (proposed)**: reject.

### 22. NuGet packaging: `nuget-trusted-publishing` and `convert-to-cpm`

- **What it is.** [`nuget-trusted-publishing`][s-trusted] (165 lines): set up OIDC publishing from GitHub Actions to nuget.org in four phases (assess, local verification, nuget.org policy, workflow), with safety rules and troubleshooting. [`convert-to-cpm`][s-cpm] (the whole `dotnet-nuget` plugin; 160 lines, six references): convert a solution to Central Package Management with a baseline capture, a targeted audit, a before/after comparison and a report.
- **Kind**: skills.
- **Proposed address**: C# pack user-invoked, both.
- **SDK or Unity**: SDK-only. Unity packages ship through UPM, not NuGet.
- **Why it could fit.** Both are one-off, human-initiated setups with real pitfalls, the profile the map assigns to user-invoked skills. If the owner publishes C# libraries to nuget.org, keyless publishing is current best practice.
- **Why it might not.** Whether the owner publishes to NuGet or has multi-project solutions is unknown (Open question 2). `nuget-trusted-publishing` overlaps the fork's `wizard`, which exists for exactly "steps only a human can perform" on a third-party dashboard.
- **Copy / adapt / idea-only**: copy as user-invoked with short descriptions, if the stack matches.
- **Overlap**: fork `wizard`; entry 29's `directory-build-organization`.
- **Idle context cost**: ~167 and ~332 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: owner's call, conditional on Open question 2; park as C# pack user-invoked candidates.

### 23. `analyzing-dotnet-performance`

- **What it is.** A scan for "~50 performance anti-patterns across async, memory, strings, collections, LINQ, regex, serialization, and I/O" ([`SKILL.md`][s-perf], 214 lines, seven references totalling ~1,060 lines). The loader is the interesting part: always read `critical-patterns.md`; detect signals in the code (`async`, `Span<`, `Regex`, `Dictionary<`, `JsonSerializer`) and load only the matching topic references; three scan depths. Findings get a severity with rules ("If hot-path context is unknown, report Critical findings unconditionally; report Moderate findings with a note"), **exact instance counts**, scale-based escalation, and a compact output format ("No explanatory prose beyond the Impact line"). A "Common Pitfalls" table lists what **not** to flag: "Flagging every `Dictionary` as needing `FrozenDictionary`", "Suggesting `ConfigureAwait(false)` in app code", "Reporting LINQ outside hot paths", "Suggesting `unsafe` code for micro-optimizations".
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked or user-invoked (a review pass the owner asks for).
- **SDK or Unity**: **partly**. From the critical reference's headings: sync-over-async, `ValueTask` double-await, boxing, `ArrayPool`, `stackalloc` in loops, `StringComparison.Ordinal`, `TryGetValue`, LINQ in hot paths and multiple enumeration hold under Unity. `[GeneratedRegex]`, `SearchValues<T>`, `FrozenDictionary` and the `System.Text.Json` source generator need .NET 7/8 and do not (*inference*). The skill has no notion of frame budgets, per-frame GC allocation or Unity's collections, which is where Unity performance work actually lives.
- **Why it could fit.** For C# libraries this is the official distilled list, with the false-positive guard most review skills lack. The signal-driven reference loading is a pattern worth copying for any large knowledge skill.
- **Why it might not.** A current model already knows most of these patterns; the source's own retirement rule applies (*inference*: no eval result was read to confirm its delta). In Unity it would give confident, half-applicable advice. Seven references is a lot of text to vendor and keep current with the .NET release train.
- **Copy / adapt / idea-only**: copy into a C# pack with a short description, SDK repos only; idea-only for Unity (the severity rules, exact counts and "what not to flag" table as the shape for a Unity performance review skill).
- **Overlap**: tipoLi's profiling skills, proposed standouts for the Unity pack ([unity-workflow ledger](unity-workflow-repos.md)); Addy `performance-optimization` ([addy ledger](addy-agent-skills.md) entry 35); pstack perf playbook ([pstack ledger](pstack.md) entry 31).
- **Idle context cost**: ~115 tokens as published (287 chars, the shortest candidate here).
- **Recommendation (proposed)**: owner's call for the C# pack; for Unity, idea-only and decided together with tipoLi's profiling skills.

### 24. `microbenchmarking`

- **What it is.** BenchmarkDotNet authoring guidance ([`SKILL.md`][s-bench], 137 lines, five references). It states its origin: "Evaluations of LLMs writing BenchmarkDotNet benchmarks have revealed common failure patterns caused by outdated assumptions about BDN's behavior". Core ideas: "Benchmarks are comparative instruments", so name the comparison axis first (approaches, runtimes, package versions, before/after builds, scale); four use cases with different lifetimes (coverage suite is permanent; investigation, change validation and development feedback are task-scoped and not checked in); **cost awareness** ("Each benchmark case … takes 15-25 seconds", `[Params]` multiply, with a table of `--job Dry/Short/Medium/Long` presets).
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked.
- **SDK or Unity**: SDK-only as written. *Inference*: BenchmarkDotNet does not run inside Unity; Unity's Performance Testing package is the counterpart. The framing (pick the comparison first, estimate run cost before running, throwaway vs permanent benchmarks) transfers.
- **Why it could fit.** It is built from measured model failures, the source's own quality bar. A library owner making performance claims needs it, and "dry-run for correctness before measuring" prevents the most common wasted run.
- **Why it might not.** Only relevant in repos that benchmark. ~261 tokens as published.
- **Copy / adapt / idea-only**: copy into a C# pack with a shortened description. For Unity: idea-only.
- **Overlap**: pstack `benchmark-checklist` with "explain the number" ([pstack ledger](pstack.md) entry 9), which is tool-neutral and proposed for adaptation; the two could be one core checklist plus this as the BDN leaf.
- **Idle context cost**: ~261 tokens as published.
- **Recommendation (proposed)**: copy into the C# pack if the owner benchmarks libraries; decide beside pstack's `benchmark-checklist`.

### 25. Runtime diagnostics collection: `dotnet-trace-collect`, `dump-collect`, `clr-activation-debugging`, `android-tombstone-symbolication`, `apple-crash-symbolication`

- **What it is.** The rest of `dotnet-diag` ([plugin][p-diag]):

| Skill | What it does | Idle cost as published |
|---|---|---|
| `dotnet-trace-collect` | pick a collection tool per environment (`dotnet-trace`, PerfView, `perfcollect`, `dotnet-monitor`), five references | ~128 |
| `dump-collect` | crash-dump collection for CoreCLR and NativeAOT, containers included | ~171 |
| `clr-activation-debugging` | reading .NET Framework shim activation logs (v2 vs v4 runtime selection) | ~169 |
| `android-tombstone-symbolication` | symbolicate .NET runtime frames in Android tombstones, with a PowerShell script | ~295 |
| `apple-crash-symbolication` | the same for `.ips` crash logs with `atos`, with a script | ~341 |

- **Kind**: skills (two with scripts).
- **Proposed address**: none.
- **SDK or Unity**: SDK-only. All target the CoreCLR/NativeAOT runtime and its tools. *Inference*: Unity players run Mono or IL2CPP, so neither the trace tools nor the symbol servers apply; the two symbolication skills are about .NET MAUI-style mobile apps.
- **Why it could fit.** `dump-collect`'s "Stop Signals" section (when to stop instead of improvising) is a good pattern. Otherwise little.
- **Why it might not.** Deployed-process diagnostics for server and mobile .NET apps; the owner's C# work is libraries and Unity.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity-debugging`, `diagnosing-bugs`.
- **Idle context cost**: ~1,100 tokens for the five.
- **Recommendation (proposed)**: reject all five.

### 26. `migrate-nullable-references`

- **What it is.** Enabling nullable reference types in an existing codebase ([`SKILL.md`][s-nullable], 291 lines, four references, one readiness script). The governing rule: "**Zero runtime behavior changes.** NRT migration is strictly a metadata and annotation exercise. The generated IL must not change". Three rollout strategies: project-wide, warnings-first, file-by-file with `#nullable enable`. "Start at the center and work outward" (models and shared utilities first). A commit at each phase boundary. A clean-build checkpoint, because "Incremental builds only recompile changed files and will hide warnings in untouched files". For libraries, "Every `?` on a public parameter or return type is a contract change", with a breaking-changes reference. The pitfalls table covers `!` sprinkling, over-annotating with `?`, `?.` silently changing behaviour, `?` on value types changing the type, and "Serializers create objects without calling constructors, so non-nullable DTO properties can still be null at runtime".
- **Kind**: skill.
- **Proposed address**: C# pack user-invoked (a migration is a deliberate, one-off decision).
- **SDK or Unity**: **partly**. Strategies A and B edit `<Nullable>` in the `.csproj`, which Unity regenerates. Strategy C (`#nullable enable` per file) works on C# 8 and later, so it works in Unity (*inference*; the `csc.rsp` route for project-wide enabling was not verified). The serializer pitfall is doubly true in Unity, where serialized fields are populated without constructors and Unity's own null semantics for destroyed objects are outside the skill.
- **Why it could fit.** Libraries are where nullable annotations matter most, and the "IL must not change" rule is a crisp guard against the agent "fixing" warnings by changing behaviour. Phase commits fit the owner's commit conventions.
- **Why it might not.** A one-time migration per codebase; if the owner's libraries already have `<Nullable>enable</Nullable>` it is dead weight. ASP.NET Core and EF Core references are irrelevant.
- **Copy / adapt / idea-only**: copy as user-invoked into a C# pack, dropping the two framework references; add one Unity note if it is to be used there. The readiness script is PowerShell and reads project files only (per the SKILL text; not run).
- **Overlap**: entry 17 (public nullability change is a source-contract change); fork `unity-serialization`.
- **Idle context cost**: ~249 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: copy as C# pack user-invoked if any owner library is not yet nullable-enabled; otherwise reject.

### 27. `dotnet-aot-compat`

- **What it is.** Making a project Native AOT and trimming compatible ([`SKILL.md`][s-aot], 269 lines, a polyfills reference). Critical rules: "NEVER use `#pragma warning disable` for IL warnings", "NEVER use `[UnconditionalSuppressMessage]`"; prefer `[DynamicallyAccessedMembers]` annotations that flow through the call chain, or mark methods `[RequiresUnreferencedCode]`. Procedure: enable the analyzers, build, "Triage warnings by code (do NOT read every file)", fix innermost first, validate all target frameworks.
- **Kind**: skill.
- **Proposed address**: C# pack user-invoked.
- **SDK or Unity**: SDK-only as written (the analyzers come from the .NET SDK). *Inference*: it is still relevant to a library *consumed by* Unity, because IL2CPP also strips and cannot JIT, and a library that passes the trim/AOT analyzers avoids the same reflection hazards. Unity's own mechanism (`link.xml`, `[Preserve]`) is not covered.
- **Why it could fit.** If the owner's C# libraries are meant to be used from Unity IL2CPP builds, trim/AOT cleanliness is a real quality bar, and "never suppress, annotate" is the decision an agent gets wrong.
- **Why it might not.** Needs `net8.0`+ targets for the analyzers. One-off per library.
- **Copy / adapt / idea-only**: copy as user-invoked if Open question 2 says the owner ships libraries.
- **Overlap**: fork `unity-assemblies` (stripping and defines).
- **Idle context cost**: ~194 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: owner's call, conditional on shipping libraries for IL2CPP.

### 28. Version migrations: `migrate-dotnet8-to-dotnet9`, `migrate-dotnet9-to-dotnet10`, `migrate-dotnet10-to-dotnet11`, `thread-abort-migration`, `system-text-json-net11`

- **What it is.** Four skills from [`dotnet-upgrade`][p-upgrade] and the single skill of `dotnet11`. The three framework migrations share one shape: assess, retarget, fix source-breaking changes, address behavioural changes, update infrastructure, verify, with 7-10 breaking-change references each, loaded by area. `thread-abort-migration` replaces `Thread.Abort` with cooperative cancellation when leaving .NET Framework; CONTRIBUTING holds its description up as the model of "when to use / when not to use" ([L238][contributing]). `system-text-json-net11` is decision guidance for APIs added in .NET 11 and is the source's own example of a skill that first "scored 0% improvement because it 'read as reference prose'" (entry 10).
- **Kind**: skills.
- **Proposed address**: none standing; install on demand.
- **SDK or Unity**: SDK-only. Unity does not move with the .NET release train.
- **Why it could fit.** When a library is retargeted, an official list of breaking changes is exactly what a model's training data lacks.
- **Why it might not.** Each is used once per release and then is dead weight at ~260-400 tokens apiece. They rot by design.
- **Copy / adapt / idea-only**: don't vendor. This is the one case where the source's marketplace is the right vehicle: enable `dotnet-upgrade` in the project for the duration of a migration, then disable it (*inference* from [loading-mechanics §3](../loading-mechanics.md)).
- **Overlap**: Addy `deprecation-and-migration` ([addy ledger](addy-agent-skills.md) entry 26), which is the general discipline.
- **Idle context cost**: ~298 + 263 + 396 + 301 + 312 ≈ 1,570 tokens as published.
- **Recommendation (proposed)**: reject as collection members; note "enable the upstream plugin temporarily" as the pattern for release-train material.

### 29. The 18 `dotnet-msbuild` skills

- **What it is.** The largest plugin by description cost ([plugin][p-msbuild], ~4,700 idle tokens, 3,733 body lines, one MCP server):

| Group | Skills |
|---|---|
| Build failure | `binlog-failure-analysis`, `binlog-generation`, `check-bin-obj-clash`, `resolve-project-references` |
| Build performance | `build-perf-baseline`, `build-perf-diagnostics`, `build-parallelism`, `eval-performance`, `incremental-build` |
| Authoring and review | `msbuild-antipatterns`, `msbuild-modernization`, `directory-build-organization`, `extension-points`, `target-authoring`, `property-patterns`, `item-management`, `including-generated-files`, `copy-to-output-directory` |

  Descriptions carry measurable triggers ("ResolveAssemblyReference (RAR) taking >5s, Roslyn analyzers consuming >30% of Csc time") and several open with a negative route ("DO NOT INVOKE when the primary request explicitly asks to convert …; use msbuild-modernization").
- **Kind**: skills.
- **Proposed address**: none as a set.
- **SDK or Unity**: SDK-only. Unity owns its build pipeline and regenerates project files.
- **Why it could fit.** Deep, official MSBuild knowledge with quantified thresholds. A multi-project library solution with custom targets or source generators would use `incremental-build`, `including-generated-files` and `directory-build-organization`.
- **Why it might not.** ~4,700 tokens idle is nearly five times the pack tripwire for one sub-topic. The core `msbuild` skill (entry 18) exists precisely to cover ordinary cases from bundled references for ~338 tokens. Whether the owner has MSBuild-heavy solutions is unknown.
- **Copy / adapt / idea-only**: don't vendor. If needed, enable the upstream plugin per project for the task, as in entry 28, accepting that its MCP server runs a prerelease tool (entry 13).
- **Overlap**: entry 18.
- **Idle context cost**: ~4,708 tokens as published.
- **Recommendation (proposed)**: reject all eighteen as collection members; entry 18's `msbuild` is the candidate if any MSBuild piece is wanted.

### 30. Test quality audit: `test-anti-patterns`, `test-smell-detection`, `assertion-quality`, `test-gap-analysis`, `grade-tests`, `test-tagging` (+ `test-analysis-extensions`)

- **What it is.** Six static test-review skills from [`dotnet-test`][p-test] that the plugin README calls **polyglot**: each detects the language and reads a per-language lookup file from the hidden `test-analysis-extensions` skill (entry 12). The .NET file covers MSTest, xUnit, NUnit and TUnit.

| Skill | What it does | Idle cost as published |
|---|---|---|
| [`test-anti-patterns`][s-anti] | "quick pragmatic scan": a four-tier catalog (Critical "tests that give false confidence": no assertions, missing `await` on async assertions, coverage touching, self-referential or always-true assertions, swallowed exceptions; High: sleeps, order dependency, over-mocking, implementation coupling, weak transformation oracle; Medium; Low), a private "completeness ledger" with a row per test, and a **"Calibrate severity honestly"** step | ~322 |
| `test-smell-detection` | the formal version: the testsmells.org 19-smell taxonomy, for "an academic or citable" review | ~271 |
| `assertion-quality` | classify every assertion, measure variety and depth, find shallow tests | ~211 |
| `test-gap-analysis` | **pseudo-mutation**: which caller-visible changes to production code would the existing tests still pass? Verify candidates only when asked, close gaps only when asked | ~313 |
| `grade-tests` | per-test Pass / Failed / Uncertain plus an A-F quality grade, composing `test-gap-analysis` in read-only mode; 460 lines | ~261 |
| `test-tagging` | classify tests by trait (smoke, regression, boundary …) and report the mix | ~205 |

  The calibration step is the distinctive part ([`test-anti-patterns` L169][s-anti-calibrate]): "When in doubt, rate Low"; "Separate a systemic finding from its instances … Report `1 finding / 6 affected tests`"; "Do not severity-rank ordinary missing cases as anti-patterns"; a "Not an issue" list (separate tests for distinct boundaries are not duplicates; explicit per-test setup "*improves* isolation"; round-trip equality is "valid metamorphic evidence"); and "If the tests are well-written, say so clearly up front. Do not inflate severity to justify the review."
- **Kind**: skills.
- **Proposed address**: one adapted skill, core or C# pack, user-invoked or model-invoked (owner's call). Not six.
- **SDK or Unity**: **holds under Unity**. They read test source and never run it, and the lookup file includes NUnit, the framework family Unity's test runner uses (*inference* for the Unity fit; the NUnit coverage is read from `extensions/dotnet.md`). The mutation idea needs no mutation tool.
- **Why it could fit.** The fork's `tdd` and `unity-testing` say how to *write* tests; nothing in the collection reviews *existing* tests, and agent-written tests are exactly where "coverage touching" and self-referential assertions appear. `test-gap-analysis`'s question ("would these tests catch a bug?") is the cheapest honest check on a test suite. The calibration list directly counters the over-reporting every review skill suffers.
- **Why it might not.** Six skills with overlapping triggers cost ~1,580 tokens and needed paired exclusions to route between them. `grade-tests` is 460 lines of scoring machinery for curated grading runs. They depend on the hidden extension folder by relative path (entry 12). Much of the catalog is knowledge a model has; the calibration rules are the delta (*inference*).
- **Copy / adapt / idea-only**: adapt. Build one "review these tests" skill from `test-anti-patterns` (catalog trimmed to C#, calibration step whole) plus the pseudo-mutation question from `test-gap-analysis`, with the NUnit and xUnit rows of the .NET lookup file inlined. It cannot be copied directly: six skills, long descriptions, cross-skill routing and the sibling-folder dependency.
- **Overlap**: fork `tdd`, `unity-testing`, `code-review` ([fork ledger](mattpocock-skills-unity.md)); superpowers `writing-good-tests.md` ([superpowers ledger](superpowers.md) entry 9); Addy `test-driven-development` ([addy ledger](addy-agent-skills.md) entry 41); `dotnet-slopwatch` in the pending Aaronontheweb ledger (disabled tests, empty catches), which the discovery sweep paired with this job; entry 35.
- **Idle context cost**: ~1,580 tokens for the six as published; ~60-80 for one adapted skill (*inference*), 0 if user-invoked.
- **Recommendation (proposed)**: adapt into a single test-review skill. A top candidate; decide in the testing theme beside `dotnet-slopwatch`.

### 31. Testability: `testability-obstacle`, `detect-static-dependencies`, `generate-testability-wrappers`, `migrate-static-to-wrapper`

- **What it is.** Four skills about making C# code testable.
  - [`testability-obstacle`][s-obstacle] (271 lines) is the decision skill. "Prove the obstacle" first ("If an adequate seam already exists, stop refactoring and use it"). Then **"Select the smallest safe seam"** ([L64][s-obstacle-seam]): time → inject `TimeProvider`, `FakeTimeProvider` in tests; filesystem → the repo's existing abstraction, else an injected delegate or a one-member interface; randomness → `Func<int>` for one value; environment/console → "Minimal interface containing only members used by the target". "Constructor injection is the default … but do not add a DI container to a class library just to satisfy this workflow." "Preserve the existing public construction surface … Do not turn the seam into a new public optional parameter merely for test convenience." For static APIs that cannot change shape: a scoped `AsyncLocal<T>` override that returns `IDisposable` and restores the previous value, never `[ThreadStatic]`, never a process-global fake. For time: "Never wait for wall-clock time"; advance fake time to just before the deadline, assert incomplete, then cross it.
  - `detect-static-dependencies` scans and ranks ambient static calls. `generate-testability-wrappers` and `migrate-static-to-wrapper` create and roll out wrappers; their descriptions open with "DO NOT USE when the target already consumes an injected interface" and "ALWAYS USE when asked to migrate …".
- **Kind**: skills.
- **Proposed address**: C# pack model-invoked (`testability-obstacle` only), or its seam table merged into fork `tdd`.
- **SDK or Unity**: **partly**. The seam-selection rules, the constructor-surface rule and the `AsyncLocal<T>` scope pattern are plain C# and hold. `TimeProvider`/`FakeTimeProvider` are .NET 8 types (*inference*: available to older targets only through a compatibility package, unverified for Unity). In Unity the ambient dependencies are different ones (`Time.time`, `Input`, scene singletons), which the fork's `unity-testing` and `unity-code-lifecycle` cover.
- **Why it could fit.** It sharpens the fork's `codebase-design` ("where a seam goes") into a concrete lookup for the four dependencies that make library tests flaky. "Smallest seam, don't widen the public API for tests" is the rule a library author most wants an agent to follow. The fake-time boundary recipe is precise.
- **Why it might not.** Four skills (~1,070 tokens) for one idea, and three of them are mechanics around a wrapper pattern the first one tells you to avoid when a built-in abstraction exists. Descriptions are long and imperative.
- **Copy / adapt / idea-only**: adapt `testability-obstacle` alone (short description, drop sibling routing); the other three idea-only.
- **Overlap**: fork `codebase-design`, `tdd`, `unity-testing` (the fork ledger notes `unity-testing` and `unity-assemblies` "carry the Unity form of seams"); superpowers TDD material ([superpowers ledger](superpowers.md) entry 9).
- **Idle context cost**: ~232 (`testability-obstacle`) + 238 + 285 + 313 ≈ 1,070 tokens as published.
- **Recommendation (proposed)**: adapt `testability-obstacle` as a C# pack skill, or merge its seam table into `tdd`'s C# guidance; reject the other three.

### 32. Test execution and authoring: `run-tests`, `platform-detection`, `filter-syntax`, `mtp-hot-reload`, `scaffold-dotnet-test-project`, `writing-mstest-tests`

- **What it is.** The SDK-bound half of `dotnet-test`. [`run-tests`][s-run-tests] (311 lines) picks the right command for VSTest, bridged or native Microsoft.Testing.Platform across MSTest, xUnit, NUnit and TUnit, with a decision table and the overlay hook (entry 11). `platform-detection` answers "VSTest or MTP?". `filter-syntax` is the hidden reference both use. `mtp-hot-reload` sets up an edit/re-run loop. `scaffold-dotnet-test-project` creates or re-wires a test project ("tests pass directly but CI discovers zero"). `writing-mstest-tests` (488 lines) is version-aware MSTest authoring.
- **Kind**: skills.
- **Proposed address**: C# pack model-invoked for `run-tests` only, if at all.
- **SDK or Unity**: SDK-only. Unity runs tests through its own test runner; the fork's `unity-verification` and `unity-testing` own that.
- **Why it could fit.** The .NET test-platform split (VSTest vs MTP, and SDK 10's native mode) is recent and is a real source of wrong `dotnet test` invocations by agents. `run-tests` is the skill whose activation loss exposed the menu-budget bug (entry 3), so it is heavily exercised.
- **Why it might not.** A repo with one test framework needs one line in its `AGENTS.md` ("run tests with X"), not a 311-line decision skill; the overlay mechanism in the same skill concedes this. `writing-mstest-tests` only helps MSTest users (Open question 3).
- **Copy / adapt / idea-only**: idea-only, unless the owner's libraries use MTP or mixed platforms.
- **Overlap**: fork `unity-verification`, `tdd`.
- **Idle context cost**: ~261 + 289 + 0 + 227 + 227 + 313 ≈ 1,320 tokens as published.
- **Recommendation (proposed)**: reject all six; a per-repo test command line covers the need.

### 33. Test generation pipeline: `code-testing`, `code-testing-agent`, `code-testing-extensions`

- **What it is.** [`code-testing`][s-code-testing] (385 lines) is the "implicit entry skill for generating, repairing, and strengthening tests". It sizes the request, handles focused work itself, and delegates broad generation to the `test-engineer` Copilot agent and its workers (entry 14). `code-testing-agent` is a hidden "legacy compatibility alias". `code-testing-extensions` is a hidden folder of 21 per-language guidance and example files.
- **Kind**: skills.
- **Proposed address**: none.
- **SDK or Unity**: SDK-only in practice: the pipeline's build and test steps assume a CLI test loop, and the delegation target is a Copilot agent.
- **Why it could fit.** Its "non-negotiable execution contract" and completion contract are examples of pinning an agent to truthful reporting of what was built and run.
- **Why it might not.** It competes with the fork's `tdd` (tests first, one at a time) with a generate-in-bulk model, and depends on agents that don't exist on Claude Code or Codex.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `tdd`, `implement`; superpowers and Addy TDD skills.
- **Idle context cost**: ~280 tokens as published (the other two are hidden).
- **Recommendation (proposed)**: reject all three.

### 34. Coverage: `coverage-analysis`, `crap-score`, `find-untested-sources`

- **What it is.** `coverage-analysis` interprets Cobertura reports (partial conditions, plateaus, target arithmetic) and ships two PowerShell scripts. `crap-score` computes CRAP (complexity × lack of coverage) per method to rank risk. `find-untested-sources` pairs source files with tests using a Roslyn file-based app or a tree-sitter Python script; its description says "MANDATORY … Invoke even for a tiny package; do not substitute manual globbing".
- **Kind**: skills (two with scripts).
- **Proposed address**: none standing; `crap-score` as an idea.
- **SDK or Unity**: SDK-only as written (Coverlet/`dotnet test` collection, `dotnet run script.cs`). *Inference*: Unity's Code Coverage package emits its own report formats, so the parsing steps would need rework; the CRAP idea itself is format-neutral.
- **Why it could fit.** "Rank methods by complexity times missing coverage" is a better target-picker than a coverage percentage, and pairs with entry 30's gap analysis.
- **Why it might not.** Coverage tooling is per-repo setup the owner may not have. The eval-quality README records that `crap-score`'s two parse paths produced contradictory answers on inconsistent fixtures (entry 6), a sign of fragility. `find-untested-sources` runs bundled code.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 30; fork `tdd`.
- **Idle context cost**: ~303 + 168 + 183 ≈ 650 tokens as published.
- **Recommendation (proposed)**: reject all three; keep the CRAP ranking idea for the testing theme.

### 35. `dotnet-experimental`: `exp-mock-usage-analysis`, `exp-test-maintainability`

- **What it is.** Two staged skills, not in any marketplace (entry 12). [`exp-mock-usage-analysis`][s-mock] (99 lines): "tracing each mock setup through the production code's execution path to find dead, unreachable, redundant, or replaceable mocks". `exp-test-maintainability` (204 lines): duplicate boilerplate and copy-paste tests, with calibration rules, proposing data-driven parameterisation.
- **Kind**: skills.
- **Proposed address**: ideas into the adapted test-review skill (entry 30).
- **SDK or Unity**: **holds under Unity** (static reading of test code; *inference*).
- **Why it could fit.** "Is this mock setup ever reached by the code under test?" is a precise, checkable question that agent-written tests often fail. Both are short.
- **Why it might not.** Explicitly experimental: "May change, be reworked, or be removed without notice". The owner's fork leans against mocking in the first place, so mock audits may find little (*inference*).
- **Copy / adapt / idea-only**: idea-only; fold the dead-mock trace into entry 30's adaptation as one step.
- **Overlap**: entry 30; fork `tdd`.
- **Idle context cost**: ~188 + 306 ≈ 494 tokens as published.
- **Recommendation (proposed)**: reject as separate skills; carry the dead-mock check into entry 30.

### 36. The 6 `dotnet-test-migration` skills

- **What it is.** `migrate-mstest-v1v2-to-v3`, `migrate-mstest-v3-to-v4`, `migrate-xunit-to-xunit-v3`, `migrate-xunit-to-mstest`, `migrate-nunit-to-mstest`, `migrate-vstest-to-mtp`, plus a Copilot orchestrator agent ([plugin][p-test-migration]). API-mapping cheat sheets and step workflows; the largest is 535 lines.
- **Kind**: skills.
- **Proposed address**: none.
- **SDK or Unity**: SDK-only. Unity pins its own NUnit version; nothing here applies.
- **Why it could fit.** If an owner library moves from xUnit v2 to v3 or to Microsoft.Testing.Platform, the mapping tables are accurate official references.
- **Why it might not.** One-shot work, and two of the six migrate *away from* xUnit and NUnit toward MSTest, a direction the owner has shown no interest in (Open question 3).
- **Copy / adapt / idea-only**: don't vendor; enable the upstream plugin temporarily if a migration happens (as in entry 28).
- **Overlap**: entry 28's pattern.
- **Idle context cost**: ~1,493 tokens as published.
- **Recommendation (proposed)**: reject all six.

### 37. App-framework and scaffolding plugins (30 skills)

- **What it is.** Seven plugins outside the owner's first two domains:

| Plugin | Skills | Idle cost as published |
|---|---|---|
| `dotnet-aspnetcore` | `dotnet-webapi`, `convert-blazor-server-to-webapp` | ~481 |
| `dotnet-blazor` | `author-component`, `collect-user-input`, `configure-auth`, `coordinate-components`, `create-blazor-project`, `fetch-and-send-data`, `plan-ui-change`, `support-prerendering`, `use-igniteui-blazor`, `use-js-interop` | ~2,538 |
| `dotnet-maui` | `dotnet-maui-doctor`, `maui-app-lifecycle`, `maui-collectionview`, `maui-data-binding`, `maui-dependency-injection`, `maui-safe-area`, `maui-shell-navigation`, `maui-theming` | ~2,373 |
| `dotnet-winforms` | `winforms-expert` | ~242 |
| `dotnet-data` | `optimizing-ef-core-queries`, `create-datadriven-aspnetcore` | ~393 |
| `dotnet-ai` | `technology-selection` (ML.NET, Microsoft.Extensions.AI, Agent Framework, ONNX, OllamaSharp; seven references) | ~348 |
| `dotnet-template-engine` | `template-authoring`, `template-comparison`, `template-discovery`, `template-instantiation`, `template-smart-defaults`, `template-validation` | ~1,855 |

- **Kind**: skills.
- **Proposed address**: none. `dotnet-webapi` and the Blazor set are web-pack material only if the owner's web apps are ASP.NET Core.
- **SDK or Unity**: SDK-only, all thirty. UI frameworks, EF Core, `dotnet new` templates and server apps have no Unity counterpart.
- **Why it could fit.** The owner's third domain is web apps (map Notes); if those are ASP.NET Core or Blazor, `dotnet-webapi` and the Blazor plugin are official and current. `technology-selection` would matter for an agentic workflow written in .NET.
- **Why it might not.** Nothing in the map says the owner's web stack is .NET; web pack sources are deferred on the map ("Web pack sources"). MAUI, WinForms and template authoring are outside the stated stack. Together ~8,200 idle tokens.
- **Copy / adapt / idea-only**: none now. If a .NET web pack is ever decided, enable `dotnet-aspnetcore` (~481 tokens) upstream rather than vendoring.
- **Overlap**: the deferred web pack sources (map, "Not yet specified"); the host's `claude-api` skill for LLM work ([anthropic-skills ledger](anthropic-skills.md)).
- **Idle context cost**: ~8,230 tokens for the seven plugins as published.
- **Recommendation (proposed)**: reject all thirty for now; revisit `dotnet-aspnetcore` and `dotnet-blazor` only if a web-pack session says the owner's web apps are .NET.

---

## Not verified

- Nothing was executed: validator behaviour, the eval pipeline, the readiness and coverage scripts and the smoke test are described from their READMEs and source text.
- The live dashboard (`dotnet.github.io/skills`) and the Vally documentation site were not opened. No eval result for any skill was read, so no claim here says a given skill actually beats its baseline.
- The SkillsBench paper the validator cites for its size tiers (arXiv 2602.12670) was not read.
- The Copilot CLI 15,000-character menu budget is the source's own statement in a code comment.
- All Unity-side verdicts are inference from the fork's "C# 9 on Roslyn" note and general knowledge of Unity's toolchain; no Unity documentation was read for this ledger. In particular: `TimeProvider` availability, project-wide nullable via `csc.rsp`, and Unity Code Coverage report formats.
- Whether Claude Code launches a plugin's `lspServers` entry as the source assumes, and what an LSP or the `binlog` MCP server costs in context, were not checked.
- Which platforms the nightly `skill-validator` archives cover (Windows included or not) was not checked.
- Whether the owner has .NET 10, a Copilot entitlement, NuGet-published libraries, multi-project solutions, or an MSTest/xUnit/NUnit preference: unknown, raised as open questions.

[root]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb
[readme]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/README.md
[license]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/LICENSE
[agents-md]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/AGENTS.md
[contributing]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md
[contributing-layout]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L53-L74
[contributing-versioning]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L88-L127
[contributing-mcp]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L129-L151
[contributing-ci]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L466-L485
[contributing-external]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L500-L517
[contributing-quality]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/CONTRIBUTING.md#L560-L600
[plugins]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins
[tests]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/tests
[aw]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/agentic-workflows
[agents-skills]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/skills
[mp-claude]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.claude-plugin/marketplace.json
[mp-codex]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/plugins/marketplace.json
[lsp]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/lsp.json
[dotnet-readme]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/README.md
[version-json]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/version.json
[version-sync]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/version/Sync-PluginVersions.ps1
[validator]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/skill-validator
[validator-readme]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/skill-validator/src/README.md
[skill-profiler]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/skill-validator/src/Check/SkillProfiler.cs#L23-L75
[plugin-profiler]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/skill-validator/src/Check/PluginProfiler.cs
[wf-skill-check]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.github/workflows/skill-check.yml
[run-evals]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/run-skill-evals.sh
[experiment]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/dotnet-skills.experiment.yaml
[coexist]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/csharp-expert-coexistence.claude.experiment.yaml
[vally-adapter]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/vally-adapter
[vally-readme]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/vally-adapter/README.md#L601-L642
[eval-quality]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/eval-quality/README.md
[dashboard]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/dashboard
[skill-value]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/dashboard/skill-value.js
[skill-coverage]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/skill-coverage/Measure-SkillCoverage.ps1
[codex-smoke]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/codex/codex-plugin-smoke.mjs
[known-domains]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/known-domains.txt
[allowed-deps]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/eng/allowed-external-deps.txt
[pr-scan]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.github/workflows/pr-malicious-scan.agent.md
[desc-prompt]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.github/prompts/evaluate-skill-descriptions.prompt.md
[overlays]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/OVERLAYS.md
[a-test-engineer]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/agents/test-engineer.agent.md
[s-improve]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/skills/improve-skill-quality/SKILL.md
[s-baseline-delta]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/skills/improve-skill-quality/references/writing-for-baseline-delta.md
[s-create-skill]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/skills/create-skill/SKILL.md
[s-create-test]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/.agents/skills/create-skill-test/SKILL.md
[s-test-ext]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/test-analysis-extensions/SKILL.md
[s-expert]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/csharp-expert/SKILL.md#L24-L42
[s-refactoring]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/csharp-refactoring/SKILL.md
[s-refactoring-gate]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/csharp-refactoring/SKILL.md#L13-L42
[s-refactoring-table]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/csharp-refactoring/SKILL.md#L80-L91
[s-msbuild]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/msbuild/SKILL.md
[s-local-sdk]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet/skills/setup-local-sdk/SKILL.md
[s-scripts]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-advanced/skills/csharp-scripts/SKILL.md
[s-pinvoke]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-advanced/skills/dotnet-pinvoke/SKILL.md
[s-vector]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-advanced/skills/vectorization/SKILL.md
[s-trusted]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-advanced/skills/nuget-trusted-publishing/SKILL.md
[s-cpm]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-nuget/skills/convert-to-cpm/SKILL.md
[s-perf]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-diag/skills/analyzing-dotnet-performance/SKILL.md
[s-bench]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-diag/skills/microbenchmarking/SKILL.md
[p-diag]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-diag
[s-nullable]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-upgrade/skills/migrate-nullable-references/SKILL.md
[s-aot]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-upgrade/skills/dotnet-aot-compat/SKILL.md
[p-upgrade]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-upgrade
[p-msbuild]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-msbuild
[p-test]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test
[p-test-migration]: https://github.com/dotnet/skills/tree/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test-migration
[s-anti]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/test-anti-patterns/SKILL.md
[s-anti-calibrate]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/test-anti-patterns/SKILL.md#L169-L213
[s-obstacle]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/testability-obstacle/SKILL.md
[s-obstacle-seam]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/testability-obstacle/SKILL.md#L64-L132
[s-run-tests]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/run-tests/SKILL.md#L26-L45
[s-code-testing]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-test/skills/code-testing/SKILL.md
[s-mock]: https://github.com/dotnet/skills/blob/1d40f95ed0f2cdedfa4c9b2614b7c2035a4323cb/plugins/dotnet-experimental/skills/exp-mock-usage-analysis/SKILL.md
