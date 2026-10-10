# Ledger: Aaronontheweb/dotnet-skills

Ticket: [Ledger: Aaronontheweb/dotnet-skills](https://github.com/Hissal/skill-collection/issues/26), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `Aaronontheweb/dotnet-skills`, read at commit [`46003af`][root] (committed 2026-10-09 20:52 -05:00, "Add sdk-container-publishing skill (#85)"; `main` HEAD when read, checked with `git ls-remote`). The ticket and the [discovery sweep](../discovery-sweep.md) saw [`e426ed9`](https://github.com/Aaronontheweb/dotnet-skills/tree/e426ed93a9f3215cd21b277fdfa6bfccd3457945); HEAD has moved four commits since (`gh api …/compare`): a new `cscheck` skill, a new `sdk-container-publishing` skill, a rename of a frontmatter key on 30 skills (entry 3) and a correction of the `slopwatch` skill against its tool (entry 14). Read on 2026-10-10 from a shallow clone outside this repo. Nothing from the source was installed or executed, so every statement about what a tool *does* comes from the skill text, not from a run. Every source link below is pinned to `46003af`. Fork references point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`, the SHA the other ledgers used.

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2) and [`research/lazy-loading.md`](../lazy-loading.md) (ticket #22). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured from each `SKILL.md` and agent frontmatter by a script. Tokens are estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics](../loading-mechanics.md) measured on fork descriptions and the other ledgers reused. The chars/4 figure is given beside it where it matters. This is an estimate (inference), not a `claude plugin details` measurement.

**"SDK or Unity" legend.** Same three verdicts as the [`dotnet/skills` ledger](dotnet-skills.md), so the two can be read side by side:

- **SDK-only**: the skill's steps need the `dotnet` CLI, MSBuild project files, NuGet, or language and library features newer than Unity ships.
- **Holds under Unity**: the guidance is about C# source or test code and stays true when Unity compiles it.
- **Partly**: the reasoning holds, the commands or some examples don't.

The Unity side of every such verdict is *inference*. The one written anchor is the fork's `unity-assemblies/SKILL.md` L67: Unity compiles "C# 9 on Roslyn, per Unity's docs without init-only setters, covariant returns or module initializers; records need a hand-declared `IsExternalInit` and are never serialized". Which library APIs Unity's profile has (`Span<T>` and `ValueTask` yes; `FrozenDictionary`, `Parallel.ForEachAsync`, `PeriodicTimer`, `ArgumentNullException.ThrowIfNull`, `TimeProvider` in the base library no) is general knowledge and was not re-verified here. The source mentions Unity in exactly one skill, `r3-reactive-extensions` (whole-word, case-insensitive search for `unity` over every `.md`: three files, all in that skill's folder).

## Overview

**What the source is.** One person's .NET skills plugin: Aaron Stannard, maintainer of Akka.NET, "Patterns drawn from production systems including Akka.NET, Petabridge, and Sdkbin" ([README][readme]). MIT ([LICENSE][license], © 2025 Aaron Stannard). About 1.2k stars and 112 forks (`gh api repos/Aaronontheweb/dotnet-skills`, 2026-10-10). The repo calls itself "a knowledge base repository … There is no build system, tests, or compiled output" ([AGENTS.md][agents-md]). It is a **reference library**, not a workflow system: almost every skill is a long, example-heavy document on one technology, and the repo's own content rule is "Skills should be comprehensive reference documents (10-40KB)" ([AGENTS.md L98-L103][agents-md-content]).

**What it ships** (counted from the tree at `46003af`):

| Part | Count | Where |
|---|---|---|
| Skills | **39** folders under [`skills/`][skills], all 39 registered in the Claude manifest. The README and the Claude marketplace entry still say "30 skills and 5 specialized agents" ([README][readme], [marketplace.json][mp-claude]). The sweep counted 36 at `e426ed9`; two were added since, so that tree had 37 (*inference* from the compare) | [plugin.json][plugin-claude] |
| Model-invoked | **39**. No skill sets `disable-model-invocation` | per-skill frontmatter |
| Hidden from the `/` menu | 30 set `user-invocable: false`; 1 more (`sdk-container-publishing`) sets `invocable: false`, a key Claude Code does not read (entry 3). On Claude this hides the slash entry only; the description stays in context ([loading-mechanics §2](../loading-mechanics.md)) | entry 3 |
| User-invoked | **0** | — |
| Skill reference files | 37 Markdown files beside 15 of the skills (progressive disclosure). Skill folders total ~850 KB | `skills/*/` |
| Agents | **6** Claude Code subagent definitions in [`agents/`][agents-dir]. "the specialized agents are Claude Code-specific and are not included in the Codex plugin" ([README][readme]) | entries 25, 27-30 |
| Hooks, MCP servers, LSP | None shipped. One skill *documents* a `PostToolUse` hook for the reader to add (entry 14) | — |
| Packaging | One plugin, `dotnet-skills`, for two hosts: Claude ([plugin.json][plugin-claude], [marketplace.json][mp-claude]) and Codex ([plugin.json][plugin-codex], [marketplace.json][mp-codex]). Copy instructions for Copilot and OpenCode | entry 1 |
| Scripts and CI | 5 bash scripts in [`scripts/`][scripts-dir], 1 workflow ([`release.yml`][release-yml]) | entry 2 |
| Evals or tests of skills | None | — |

**Idle cost if installed as published.** It is one plugin, and Claude Code has no supported switch for a single skill inside a plugin ([loading-mechanics §3](../loading-mechanics.md)), so the whole row is the unit of cost.

| Group | Skills | Description chars | ≈ tokens (2.6) | ≈ tokens (chars/4) | Entries |
|---|---|---|---|---|---|
| C# language (`csharp-*`, `r3-*`) | 6 | 1,677 | **675** | 419 | 7-12 |
| General .NET (`aot-trimming`, `ilspy-decompile`, `serialization`, `project-structure`, `package-management`, `local-tools`, `opentelemetry`, `sdk-container-publishing`) | 8 | 2,380 | **955** | 595 | 13, 18-20, 22, 26 |
| Testing and quality gates (`slopwatch`, `crap-analysis`, `cscheck`, `snapshot-testing`, `testcontainers`, 2 Playwright) | 7 | 1,338 | **550** | 334 | 14-17, 23 |
| Akka.NET | 5 | 1,065 | **434** | 266 | 25 |
| Aspire, email, dev certs | 7 | 1,313 | **538** | 328 | 25, 26 |
| Data (EF Core, database) | 2 | 387 | **159** | 97 | 24 |
| DI and configuration | 2 | 352 | **146** | 88 | 21 |
| Repo meta | 2 | 335 | **139** | 84 | 2, 4 |
| **All 39** | **39** | **8,847** | **≈3.6k** | ≈2.2k | |

Three things follow.

1. **3.6 times the pack tripwire, and most of it is off-stack.** The decided tripwire is 1,000 tokens per pack as installed (ticket #14). The Akka, Aspire, email, data, DI and meta groups (18 skills, ~1.4k tokens) cover technology the map never names for this owner.
2. **Descriptions are short by .NET-repo standards.** The average is ~227 characters (~92 tokens), about a third of `dotnet/skills`' ~660 ([dotnet-skills ledger](dotnet-skills.md)). Two outliers: `aot-trimming` (863 chars, ~338 tokens) and `csharp-nullable-reference-types` (526, ~207). Nothing nears Claude's 1,536-character per-skill cut. But most descriptions state *what the skill covers*, not *when to use it*: only 4 of 39 contain "Use when", "Use for" or "Run after" (grep: `aot-trimming`, `cscheck`, `ilspy-decompile`, `dotnet-slopwatch`). That is the opposite of the `USE FOR / DO NOT USE FOR` convention `dotnet/skills` tuned against activation evals.
3. **The six agents add their own idle cost on Claude.** Their descriptions total 1,634 characters, ~660 tokens at the same ratio. *Inference*: Claude Code lists each installed subagent's description with the Agent tool every session; [loading-mechanics](../loading-mechanics.md) did not measure this, so the figure is unverified (see Not verified). Codex does not load them.

**Fit to the owner, in one line.** A server-side .NET author's library (actors, Aspire, EF Core, email, containers) with a small C#-discipline core the owner could use: about 10 of the 39 skills concern C# source, tests or library shipping, one of them (`r3-reactive-extensions`) names Unity, and the rest assume ASP.NET Core hosts and the .NET SDK.

**Standout candidates (proposed):**

- **`r3-reactive-extensions`** (entry 7): the only skill read in any ledger so far that covers Cysharp's R3. Its three load-bearing facts (errors do not end a subscription, every async operator needs a chosen `AwaitOperation`, nothing serialises concurrent `OnNext`) are exactly where an agent trained on Rx.NET or UniRx goes wrong, and each carries captured output from a real run. The model holds under Unity; the Unity-specific surface is missing.
- **`api-design`** (entry 8): extend-only design for a library's public surface, with the one rule models reliably miss: adding an optional parameter to a shipped method is a *binary* break. Nothing in `dotnet/skills` covers API compatibility. Plain C# semantics, so it holds under any compiler.
- **`dotnet-slopwatch`** (entry 14): a deterministic, baselined check for "fake green" in C# diffs (disabled tests, `#pragma warning disable`, empty catches, `Task.Delay` in tests, `NoWarn`). It is a tool wrapper, so the idea and rule list transfer even if the tool is never installed.
- **`cscheck`** (entry 16): property-based and model-based testing guidance written as decisions, not as API tour ("Do not use the implementation's answer to manufacture its expected answer"; "a green run can be vacuous"). The best-written skill in the source and the only one that follows a progressive-disclosure table.
- **`csharp-nullable-reference-types`** (entry 12): the day-to-day nullable authoring reference that `dotnet/skills`' migration-only skill lacks, including a "is a polyfill needed at all?" decision for `netstandard2.0`/`2.1` targets, which is the target a Unity-consumable library has.
- **`roslyn-incremental-generator-specialist`** (entry 27): the one agent with real content. 511 lines of pipeline, caching and emit rules for source generators. It is reference knowledge filed as an agent and would be a skill here.

**Biggest open questions:**

1. **Does the owner use R3 (or UniRx) in Unity projects?** Entry 7 is the only Unity-facing candidate and is worth nothing otherwise. If yes: is the reactive layer in engine-free C# (where this skill's `TimeProvider`/`FakeTimeProvider` testing story applies) or in `MonoBehaviour` code (where a Unity delta has to be written)?
2. **Do the owner's C# libraries have outside consumers of compiled binaries?** Entry 8's binary-compatibility rules and entry 13's trimming annotations matter for NuGet packages and precompiled DLLs. *Inference*: a UPM package shipped as source is recompiled by the consumer, so only source compatibility and Unity's own break surfaces (serialized names, `.asmdef` names, GUIDs) apply. This is the same question as the `dotnet/skills` ledger's Open question 2.
3. **A third-party checker in the loop?** `slopwatch` (entry 14) means installing a .NET tool the skill pins by version and running it on every edit. Ticket #14 admitted a hook only when it is silent unless it has something to say; the [hook-collections ledger](hook-collections.md) already proposes a `protect-tests` port for the same failure. One, both or neither?
4. **Reference library or decision skills?** This source's house style (10-40 KB of examples per skill) is the opposite of the `dotnet/skills` rule that a skill must beat the model's baseline, and of the fork's `writing-for-agents`. Much of the C# material is knowledge a current model has (*inference*; the source ships no eval to say otherwise). The proposals below therefore take *rules* out of these skills far more often than whole files.
5. **Router snippets in steering files.** The source's answer to "skills don't get used" is an always-on index pasted into `CLAUDE.md`/`AGENTS.md` (entry 4). Ticket #14 already turned down a skills-first nudge and ledger one-liners. Entry 4 is recorded so the router-content decision sees the counter-example, not to reopen #14.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| One plugin, all model-invoked | 39 descriptions, ~3.6k tokens, no per-skill switch on Claude ([loading-mechanics §3](../loading-mechanics.md)) | Installing it is all-or-nothing. Any candidate is a per-file copy with provenance ([vendoring](../vendoring.md)) |
| C# 10-14 and .NET 6-10 in the examples | `readonly record struct`, `init`, `required`, list patterns, the `field` keyword, `ArgumentNullException.ThrowIfNull`, `FrozenDictionary`, `UnsafeAccessor`, `Parallel.ForEachAsync`; `csharp-coding-standards` says "C# 12+" in its description | A skill that holds under Unity in principle still needs its examples filtered (*inference*) |
| `dotnet` CLI and NuGet in every setup step | `dotnet add package`, `dotnet tool restore`, `dotnet publish`, `dnx ilspycmd`, `.csproj` and `Directory.Build.props` edits | No Unity equivalent; fine in an SDK-style library repo |
| Reference-library size | 7 `SKILL.md` files exceed 500 lines; several skills carry 500-2,000 lines of references (OpenTelemetry: 515 + 2,104) | Vendoring means maintaining a lot of text against moving libraries. The source itself had to re-sync `slopwatch` with the tool it wraps after the skill fell behind (entry 14) |
| Sibling references by name | "see the `csharp-concurrency-patterns` skill", "See `dotnet/serialization` skill", Akka.NET as the top rung of the concurrency ladder | A single copied skill carries dangling pointers, and some point at Akka.NET |
| Name is not the folder | 15 skills have a frontmatter `name` that differs from the folder (`api-design` in `csharp-api-design/`, `modern-csharp-coding-standards` in `csharp-coding-standards/`, `dotnet-slopwatch` in `slopwatch/`; the folder `opentelementry-dotnet-instrumentation` is also misspelt) | Entries below use the frontmatter name and link the folder. A per-file installer keyed on folder names would install under a different name than the source's own router snippets use |
| Symlinked `CLAUDE.md` | `CLAUDE.md` is a git symlink to `AGENTS.md` (mode `120000`). On this Windows clone it checked out as a 9-byte text file containing `AGENTS.md` | Irrelevant to installed plugins (a plugin-root `CLAUDE.md` is not loaded, [installed-plugins ledger](installed-plugins.md)), but a warning for any collection layout that symlinks steering files (entry 5) |
| Pinned tool versions | `slopwatch.cmd` 0.4.2, CsCheck 4.9.1, R3 1.3.1, PolySharp 1.14.1 | Honest (each says what it was checked against) but rots; needs a re-check date in provenance |

### Index: every skill, agent and mechanism to its entry

| Entry | Skills / agents / mechanisms |
|---|---|
| 1 | one plugin, two hosts: Claude and Codex manifests and marketplaces; Copilot and OpenCode copy instructions |
| 2 | `validate-marketplace.sh`, `validate-codex-plugin.sh`, `bump-version.sh`, `generate-release-summary.sh`, `release.yml`; skill `marketplace-publishing` |
| 3 | `user-invocable: false` on reference skills (and the `invocable` misspelling) |
| 4 | router snippets for `AGENTS.md`/`CLAUDE.md`: skill `skills-index-snippets`, `generate-skill-index-snippets.sh`, README snippets |
| 5 | repo `AGENTS.md` with `CLAUDE.md` symlink; content guidelines |
| 6 | "validated against version X, output captured" evidence convention |
| 7 | `r3-reactive-extensions` |
| 8 | `api-design` |
| 9 | `type-design-performance` |
| 10 | `modern-csharp-coding-standards` |
| 11 | `csharp-concurrency-patterns` |
| 12 | `csharp-nullable-reference-types` |
| 13 | `aot-trimming` |
| 14 | `dotnet-slopwatch` |
| 15 | `crap-analysis` |
| 16 | `cscheck` |
| 17 | `snapshot-testing` |
| 18 | `ilspy-decompile` |
| 19 | `serialization` |
| 20 | `dotnet-project-structure`, `package-management`, `dotnet-local-tools` |
| 21 | `microsoft-extensions-configuration`, `dependency-injection-patterns` |
| 22 | `opentelemetry-net-instrumentation` |
| 23 | `testcontainers-integration-tests`, `playwright-blazor-testing`, `playwright-ci-caching` |
| 24 | `efcore-patterns`, `database-performance` |
| 25 | Akka.NET: `akka-net-best-practices`, `akka-net-testing-patterns`, `akka-hosting-actor-patterns`, `akka-net-aspire-configuration`, `akka-net-management`, agent `akka-net-specialist`. Aspire: `aspire-configuration`, `aspire-integration-testing`, `aspire-service-defaults`, `mailpit-integration` |
| 26 | `mjml-email-templates`, `verify-email-snapshots`, `dotnet-devcert-trust`, `sdk-container-publishing` |
| 27 | agent `roslyn-incremental-generator-specialist` |
| 28 | agent `dotnet-concurrency-specialist` |
| 29 | agents `dotnet-benchmark-designer`, `dotnet-performance-analyst` |
| 30 | agent `docfx-specialist` |

### Against the `dotnet/skills` ledger, entry by entry

Where both sources cover a job, this table says which is the better base (*proposed*; reasons are in the linked entries here).

| Job | Here | `dotnet/skills` ledger | Better base (proposed) |
|---|---|---|---|
| Nullable reference types | 12 `csharp-nullable-reference-types` (authoring reference, attribute catalog, polyfill decision) | 26 `migrate-nullable-references` (one-off migration, "IL must not change") | Different jobs. Official for a migration; this one for writing nullable code. If only one: official, because its rule set is decision-shaped |
| Trimming and Native AOT | 13 `aot-trimming` (model, playbook, allows a justified suppression) | 27 `dotnet-aot-compat` (procedure, "NEVER … `[UnconditionalSuppressMessage]`") | Official as the skill; this one's playbook as an optional reference. They disagree on suppression; the owner picks a stance |
| CRAP and coverage | 15 `crap-analysis` (ReportGenerator Risk Hotspots, OpenCover) | 34 `crap-score`, `coverage-analysis` (own parsing scripts, Cobertura) | Neither as a skill (both ledgers propose idea-only). If built: this one's tooling route is simpler; the official one had a recorded parsing inconsistency |
| Agent cheating on tests | 14 `dotnet-slopwatch` (deterministic tool on the diff) | 30 `test-anti-patterns` and siblings (model review of existing tests) | Complementary layers. Official for the review skill; this one for the mechanical gate |
| Performance guidance | 9 `type-design-performance` (design-time checklist), 29 `dotnet-performance-analyst` (persona) | 23 `analyzing-dotnet-performance` (~50 patterns, false-positive table, signal-driven loader) | Official, clearly. From here only the delegate-allocation checklist (entry 29) |
| Benchmarks | 29 `dotnet-benchmark-designer` (persona) | 24 `microbenchmarking` (built from observed model failures) | Official, clearly |
| Package management | 20 `package-management` ("never edit XML directly", CPM conventions) | 22 `convert-to-cpm` (one-off conversion workflow) | Different jobs. This one's golden rule as a repo line; official for the conversion |
| Repo layout and MSBuild | 20 `dotnet-project-structure` | 18 `msbuild`, 29 `directory-build-organization` | Official (maintained with the SDK); this one is the author's personal template |
| Routing to skills | 4 router snippet in the steering file (always-on) | 16 `csharp-expert` (model-invoked router skill) | Neither as built; both ideas go to the router-content decision |
| Packaging for Claude and Codex | 1 one plugin, Codex auto-discovers `skills/` | 1 seventeen plugins, three manifests each | Official's per-area split matches packs. This one shows the minimum that works |
| Validation and release | 2 bash + `jq` existence and version checks | 2-9 validator, evals, dashboard | Official for ideas. This one only for the tag-equals-manifest release guard |
| Hiding reference skills | 3 `user-invocable: false` (still costs idle context) | 12 `disable-model-invocation: true` + `user-invocable: false` (costs nothing) | Official's pair is the correct recipe for a reference-only leaf |
| Subagents | 27-30 six Claude Code agents | 14 sixteen Copilot `.agent.md` | Neither (wrong host, or persona text). Entry 27's content as a skill |
| EF Core | 24 `efcore-patterns`, `database-performance` | 37 `optimizing-ef-core-queries` | Out of the owner's stated stack in both; official if ever needed |
| No counterpart in `dotnet/skills` | 7 R3, 8 API compatibility, 11 concurrency choice, 16 property-based testing, 17 snapshot testing, 18 decompiling, 19 serialization choice, 21 DI/options, 22 OpenTelemetry, 23 Testcontainers/Playwright, 25 Akka.NET and Aspire | — | This source is the only base (zero hits for these terms in the `dotnet/skills` ledger) |
| No counterpart here | — | 17 `csharp-refactoring`, 31 `testability-obstacle`, 30 test review, 20 P/Invoke, 21 SIMD, 25 diagnostics, 28 version migrations, 29 MSBuild, 3-7 eval machinery | The official ledger's three top candidates have no rival here |

---

## Mechanisms

### 1. One plugin, two hosts

- **What it is.** A single plugin named `dotnet-skills` whose repo root is the plugin. Claude: [`.claude-plugin/plugin.json`][plugin-claude] lists all 39 skill folders and 6 agent files by path, and [`.claude-plugin/marketplace.json`][mp-claude] offers it with `"source": "./"`. Codex: [`.codex-plugin/plugin.json`][plugin-codex] says only `"skills": "./skills/"` (auto-discovery, no agents), and [`.agents/plugins/marketplace.json`][mp-codex] points at `./` with `installation: AVAILABLE`. Copilot and OpenCode get copy commands in the [README][readme]; the OpenCode loop renames each folder to its frontmatter `name` because "directory names must match frontmatter 'name' field". Install is `/plugin marketplace add Aaronontheweb/dotnet-skills` then `/plugin install dotnet-skills`, or `codex plugin marketplace add …` ([AGENTS.md][agents-md]).
- **Kind**: manifest-packaging.
- **Proposed address**: idea-only input to the install-architecture ticket.
- **Why it could fit.** It is the smallest working example of "one repo serves Claude and Codex" ([loading-mechanics §3](../loading-mechanics.md)): two manifests, two marketplaces, no per-skill `openai.yaml`. It also shows the asymmetry to plan for: Claude's manifest is an explicit registry, Codex's is a directory glob, so a folder added without registering it reaches Codex but not Claude.
- **Why it might not.** One plugin for 39 unrelated skills is the shape the map rules out: no pack boundary, no per-skill choice, ~3.6k idle tokens (Overview). The published metadata has drifted: the marketplace entry says version `1.0.0` and "30 skills and 5 specialized agents" while the manifest is `1.6.0` with 39 and 6. *Inference*: Claude resolves the version from `plugin.json` first ([loading-mechanics §3](../loading-mechanics.md)), so the stale marketplace version is cosmetic, but nothing in the repo checks it.
- **Copy / adapt / idea-only**: idea-only. Not installable as a pack without taking everything.
- **Overlap**: `dotnet/skills`' four marketplaces and three manifests per plugin ([dotnet-skills ledger](dotnet-skills.md) entry 1); the fork's plugin and marketplace manifests ([fork ledger](mattpocock-skills-unity.md)); [vendoring](../vendoring.md) ("marketplaces for unmodified plugins").
- **Idle context cost**: ~3.6k tokens for the skills plus ~660 for the agents on Claude (*inference*), as published.
- **Recommendation (proposed)**: do not install the plugin. Carry one note to the install ticket: when Claude registers skills by list and Codex by folder, a check must compare the two.

### 2. Validation and release scripts; `marketplace-publishing`

- **What it is.** Five bash scripts and one workflow. [`validate-marketplace.sh`][sc-validate] (147 lines, needs `jq`): both Claude JSON files parse, every registered skill folder has a `SKILL.md`, every registered agent file exists, and unregistered folders or agent files produce a *warning*, not a failure. [`validate-codex-plugin.sh`][sc-validate-codex] (199 lines): required manifest fields, kebab-case name, semver version, **Codex version equals Claude version**, every `SKILL.md` has frontmatter with `name` and `description`, and each marketplace entry resolves to a folder with a Codex manifest. [`bump-version.sh`][sc-bump] writes one version into both manifests and runs the lockstep check ("Never edit the version fields by hand", [AGENTS.md][agents-md]). [`generate-release-summary.sh`][sc-summary] lists skills and agents changed since a tag. [`release.yml`][release-yml] repeats the checks on push and, on a `v*` tag, fails unless the tag equals both manifest versions, then builds release notes and publishes a GitHub release. The skill [`marketplace-publishing`][s-marketplace-publishing] (262 lines, model-invoked, ~70 tokens) is the same procedure written for an agent working in this repo.
- **Kind**: script + CI; one skill.
- **Proposed address**: idea-only for the maintenance ticket (#17).
- **Why it could fit.** The tag-equals-manifest guard and the Claude-equals-Codex version check are two cheap rules for any pack shipped as a versioned plugin. "Registered in the manifest but missing on disk" is a real failure for an explicit registry.
- **Why it might not.** It checks existence only: no description length, no gating parity, no link check, no trigger test. The drift it misses is visible in the same commit (README and marketplace counts, entry 1; the `invocable` key, entry 3). Bash plus `jq` on a Windows-first machine. agnix and the owner's own check script are already proposed for this layer ([maintenance-tooling ledger](maintenance-tooling.md)). `marketplace-publishing` ships to every user of the plugin although it is only useful inside the source repo.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` validator and versioning ([dotnet-skills ledger](dotnet-skills.md) entries 2-3); fork `scripts/check.mjs`, `validate-plugin` and Changesets ([fork ledger](mattpocock-skills-unity.md)); gstack's description-budget ratchet ([gstack ledger](gstack.md)).
- **Idle context cost**: n/a for scripts; ~70 tokens for `marketplace-publishing` as published.
- **Recommendation (proposed)**: reject the scripts and the skill. Add two lines to #17's check list: "release tag equals every manifest version" and "repo-maintenance skills are not shipped in a pack".

### 3. `user-invocable: false` on reference skills

- **What it is.** 30 skills set `user-invocable: false`. The pull request in the source repo that introduced the key (#87, "Use user-invocable, the key Claude Code and Copilot read", read with `gh pr view`) explains the intent: they are "reference-only skills" meant to stay out of the `/` menu, and the earlier key `invocable: false` was silently ignored, "So all 30 still show up as slash commands". It adds a caveat: "`user-invocable` isn't in the base Agent Skills spec, so a skill uploaded to claude.ai or the Skills API rejects it". One day later a new skill, [`sdk-container-publishing`][s-sdk-container-publishing], was merged with the old `invocable: false` key again.
- **Kind**: manifest-packaging convention.
- **Proposed address**: idea-only for the maintenance ticket (#17) and for `writing-for-agents`.
- **Why it could fit.** It is a live example of two things the collection must get right. First, the semantics: on Claude `user-invocable: false` keeps the description in context and hides only the menu entry ([loading-mechanics §2](../loading-mechanics.md)), so it is a "model-invoked only" marker, not a gate and not a saving. Second, the failure mode: an unknown frontmatter key is accepted without complaint on every host, the misspelling sat on 30 files until that fix, and it came back within a day of the fix because no check knows the allowed keys.
- **Why it might not.** Nothing to adopt beyond the lesson. `dotnet/skills` already documents the correct recipe ([dotnet-skills ledger](dotnet-skills.md) entry 12: `disable-model-invocation: true` **and** `user-invocable: false` together make a skill that is read by path and never listed).
- **Copy / adapt / idea-only**: idea-only. The lint: frontmatter keys come from a closed allow-list.
- **Overlap**: davidondrej's inert `triggers:` key and gating-parity lint ([davidondrej ledger](davidondrej-skills.md) entry 3); agnix's frontmatter checks ([maintenance-tooling ledger](maintenance-tooling.md)); ticket #22 (a router reads a disabled leaf by path).
- **Idle context cost**: n/a. (The flag saves nothing: the 30 flagged skills still cost ~2.4k tokens.)
- **Recommendation (proposed)**: add "unknown frontmatter key fails the check" to #17 if agnix does not already cover it for both hosts. No convention to adopt.

### 4. Router snippets for `AGENTS.md` / `CLAUDE.md`

- **What it is.** The source's answer to under-used skills. The skill [`skills-index-snippets`][s-skills-index-snippets] (118 lines) states the goal: "Make skills and agents easy for coding assistants to use by removing the decision point. Instead of hoping an assistant will 'remember' to invoke a skill, provide a small router snippet inside `AGENTS.md` / `CLAUDE.md`" ([L17-L25][idx-goal]). Two forms are published in the [README][readme-snippets]: a readable one (task category → skill names, plus "Quality gates": "`dotnet-slopwatch`: after substantial new/refactor/LLM-authored code", "`crap-analysis`: after tests added/changed in complex code") and a "compressed (Vercel-style)" pipe-delimited one generated from the manifest by [`generate-skill-index-snippets.sh`][sc-index]. Both open with "IMPORTANT: Prefer retrieval-led reasoning over pretraining for any .NET work." The generator buckets skills by folder-name prefix in a `case` statement; a skill with a new prefix "will be silently ignored" ([AGENTS.md][agents-md]).
- **Kind**: convention doc (always-on text) + script + skill.
- **Proposed address**: idea-only for the router-content item on the map. As a piece it would be **pack always-on**.
- **Why it could fit.** It is honest evidence from a skill author that model-invoked descriptions alone did not get his skills used, the same finding behind `dotnet/skills`' menu-budget work ([dotnet-skills ledger](dotnet-skills.md) entry 3). The "quality gates" line is the useful half: it names *when* a check runs ("after tests added/changed in complex code"), which a description cannot say as firmly. Generating the index from the registry keeps it from drifting.
- **Why it might not.** Ticket #14 decided against exactly this: "no ledger one-liners, no skills-first nudge", and "packs carry no always-on piece by default". The compressed snippet as generated today is ~1,400 characters (*inference*: ~400-550 tokens always-on) and lists 39 names with no trigger information, so the agent still has to guess which name fits. It duplicates what the skill listing already puts in context on Claude and Codex. "Prefer retrieval-led reasoning over pretraining" is a blanket instruction to load skills, the nudge #14 turned down.
- **Copy / adapt / idea-only**: idea-only. Cannot be copied: its content is this plugin's skill names.
- **Overlap**: `dotnet/skills` `csharp-expert` ([dotnet-skills ledger](dotnet-skills.md) entry 16); pstack `poteto-mode` ([pstack ledger](pstack.md)); diet103's prompt-submit skill-suggestion hook, also recorded as the nudge #14 declined ([hook-collections ledger](hook-collections.md)); superpowers' SessionStart bootstrap ([superpowers ledger](superpowers.md)).
- **Idle context cost**: ~400-550 tokens always-on for the compressed form (*inference*); `skills-index-snippets` itself ~69 tokens model-invoked.
- **Recommendation (proposed)**: reject the snippet, the script and the skill. Offer one idea to the router-content decision: a "run this check after that kind of change" line is a trigger a manual router can carry.

### 5. Repo `AGENTS.md` with a `CLAUDE.md` symlink; content guidelines

- **What it is.** [`AGENTS.md`][agents-md] (5.3 KB) is the contributor guide for agents working *in the source repo*: structure, naming prefixes, how to add a skill or agent, release steps. "It is the canonical file; `CLAUDE.md` is a symlink to it" and "edits go here, never to the symlink target copy". Its content rules are four lines ([L98-L103][agents-md-content]): "Skills should be comprehensive reference documents (10-40KB)", "Include concrete code examples with modern C# patterns", "Reference authoritative sources rather than duplicating content", "Agents define personas with expertise areas and diagnostic approaches".
- **Kind**: convention doc.
- **Proposed address**: idea-only (always-on ticket #14, already decided; skill-shape input for `writing-for-agents`).
- **Why it could fit.** One canonical steering file for both hosts is what #14 decided ("user-scope CLAUDE.md + AGENTS.md copied from one source here"). This source shows the symlink variant and its cost.
- **Why it might not.** On this Windows machine the symlink checked out as a 9-byte text file whose whole content is `AGENTS.md` (git mode `120000`, `core.symlinks` off). A harness reading that `CLAUDE.md` gets one word. #14's wording is "copied", which avoids this; the source confirms copying is the right call here. The content rules are the opposite of the collection's direction: size as a quality bar, and agents as personas.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: ticket #14; davidondrej's "`.claude/skills` as an exact symlink to `.agents/skills`" rule ([davidondrej ledger](davidondrej-skills.md) entry 1), which has the same Windows exposure; the fork's `scripts/link-skills.sh` ([fork ledger](mattpocock-skills-unity.md)).
- **Idle context cost**: n/a (not installed with the plugin).
- **Recommendation (proposed)**: nothing to adopt. Record "a git symlink for a steering file becomes a one-word text file on a Windows clone without symlink support" as a constraint for the install ticket.

### 6. "Validated against version X, output captured"

- **What it is.** A habit in the source's newest skills. `r3-reactive-extensions`: "Everything in this skill was validated empirically against **R3 1.3.1**. Captured output appears in the reference files as evidence" ([L41-L42][r3-evidence]), and the references show the run output, including failures (three trials with lost list items). `cscheck`: "The linked examples were compiled and run with **CsCheck 4.9.1** on .NET 8. Its package identifies source revision `5050355`" and "Check the installed package before adapting signatures … do not infer a major version … from another library's API" ([L62-L68][cscheck-baseline]). The `slopwatch` re-sync (entry 14) pins `0.4.2` after the skill had described a config file "The tool doesn't read" (the source repo's PR #88).
- **Kind**: convention doc (authoring rule).
- **Proposed address**: idea-only for `writing-for-agents` and for provenance files.
- **Why it could fit.** It answers the reader's real question about a library skill: which version is this true for, and was it run or remembered? It is the library-skill form of `dotnet/skills`' "verify load-bearing API claims by compiling" rule ([dotnet-skills ledger](dotnet-skills.md) entry 10) and fits the per-skill provenance files proposed in the [maintenance-tooling ledger](maintenance-tooling.md). The fork's Unity skills already separate "from the docs" from "reproduced in a sandbox" (`unity-assemblies/ANALYZERS.md` L3).
- **Why it might not.** Only three of 39 skills do it, and the `slopwatch` history shows a version line does not keep a skill current by itself. Captured output makes references long.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `research/` provenance and the Unity "docs vs sandbox" wording ([fork ledger](mattpocock-skills-unity.md)); `dotnet/skills` authoring rules.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: one line for the skill-writing rules: a skill about a versioned library states the version its claims were checked against and whether they were run.

---

## Skills

### 7. `r3-reactive-extensions`

- **What it is.** A guide to R3, "Cysharp's ground-up reimplementation of Reactive Extensions — 'the new future of dotnet/reactive and UniRx'" ([`SKILL.md`][s-r3-reactive-extensions], 275 lines, three references totalling 677 lines). It is built around the places R3 breaks Rx habits:
  - **Errors do not end a subscription.** The grammar is "`(OnNext | OnErrorResume)* OnCompleted(Result)?`"; an exception goes to `OnErrorResume` and the stream lives on. `.OnErrorResumeAsFailure()` opts back into Rx behaviour ([L131-L150][r3-errors]).
  - **Async dispatch is explicit.** Every `SubscribeAwait`/`SelectAwait` takes an `AwaitOperation` (`Sequential`, `Drop`, `Switch`, `Parallel`, `SequentialParallel`, `ThrottleFirstLast`), with a table of overlap behaviour and typical use ([L152-L167][r3-await]).
  - **Nothing serialises concurrent producers.** "20,000 concurrent `OnNext` calls into a `List<T>` subscriber lost ~half the items and threw inside the operator chain"; the rule is `Synchronize()` or an `ObserveOn*` straight after any source several threads publish into ([L189-L214][r3-concurrency]).
  - **Two clocks.** `TimeProvider` for wall-clock operators, `FrameProvider` for `EveryUpdate`/`DelayFrame`, both fakeable in tests ([L218-L237][r3-frames]).
  - **Renamed and absent operators.** "it's `Debounce` (not `Throttle`), `ThrottleLast` (not `Sample`), `Chunk` (not `Buffer`). `Retry`, `GroupBy`, `Finally`, and plain `Buffer` are **absent** in 1.3.1" ([L256-L263][r3-dont]).

  References: [`rx-net-differences.md`][r3-diff] (nine differences and a ten-step "porting Rx.NET / UniRx code to R3" checklist), [`async-and-integration-patterns.md`][r3-async] (`Task` and `IAsyncEnumerable` bridges, `ReactiveProperty`, subjects, disposal helpers), [`scheduling-and-concurrency.md`][r3-sched] (race reproductions with captured output, fake providers). It states what it is not for: "R3, like all Rx, is **push-based with no backpressure**".
- **Kind**: skill.
- **Proposed address**: Unity pack model-invoked if the owner uses R3 in Unity; C# pack model-invoked if in libraries; a `paths:`-scoped project skill either way ([lazy-loading](../lazy-loading.md)).
- **SDK or Unity**: **partly**, leaning "holds". The model (error contract, `AwaitOperation`, concurrency contract, operator names, the porting checklist) describes R3's core API, which is the same assembly on every host (*inference*: the skill says the core is platform-neutral with "thin provider packages for Unity, Godot, WPF …"; R3's own README was not read). What does not carry over: the install line (`dotnet add package R3`; Unity is mentioned only as "`R3.Unity` (UPM)"), `FakeTimeProvider` from a NuGet testing package, and `TimeProvider` being "the .NET 8 BCL type" (*inference*: under Unity it has to come from a compatibility package; unverified). All captured evidence is from .NET console runs. Unity appears in three places only: `ObserveOnMainThread`, `UnityFrameProvider`, and "Unity gets an editor window" for `ObservableTracker`. **Missing for Unity** (*inference*, from the skill's silence): tying a subscription to a `GameObject`'s lifetime, which frame provider corresponds to which player-loop phase, serialised reactive properties in the Inspector, domain-reload behaviour of static subjects (the fork's `unity-code-lifecycle` territory), and UniTask interplay.
- **Why it could fit.** R3 is the successor to UniRx and common in Unity projects (the sweep flagged it for that reason). It is newer than most training data and deliberately incompatible with Rx in exactly the ways above, so this is knowledge a model is likely to get wrong, the strongest case for a library skill (*inference*). The skill is evidence-based (entry 6), decision-shaped in its core sections, and names its limits. `FakeFrameProvider.Advance(n)` gives deterministic frame-stepped tests for engine-free code, which suits fast EditMode tests (the choice between EditMode and PlayMode is the fork's `unity-testing`).
- **Why it might not.** Worthless unless the owner uses R3 (Open question 1). ~144 idle tokens, the third-largest description here. Written for server and desktop .NET: the frame clock gets one section, MVVM examples are XAML (`BindableReactiveProperty`). Pinned to 1.3.1; "absent in 1.3.1" claims rot with releases. 950 lines in total for a library whose README is the authority.
- **Copy / adapt / idea-only**: adapt. Keep the `SKILL.md` core and the differences reference; rewrite the description as a trigger; replace the install section; add a Unity delta (lifetime, player-loop providers, main-thread marshalling, domain reload by pointer to `unity-code-lifecycle`) checked against R3's README and a sandbox, in the fork's "docs vs reproduced" style. It cannot be copied directly because of the SDK install and test-package assumptions and the missing Unity surface.
- **Overlap**: none in the fork, the Unity baseline or any ledger (search for `R3`/`UniRx` across `research/`: no hits). Adjacent: the baseline gap list names "async (`Awaitable`, UniTask)" ([unity-baseline](../unity-baseline.md)); Nice-Wolf's `unity-async-patterns` ([unity-workflow ledger](unity-workflow-repos.md)); entry 11 here points to R3 as the "UI event" rung. Not covered by `dotnet/skills`.
- **Idle context cost**: ~144 tokens as published (362 chars); ~50-60 with a trigger description (*inference*); 0 until a matching file is touched if `paths:`-scoped.
- **Recommendation (proposed)**: adapt, conditional on Open question 1. The top candidate in this source for the owner's first domain. If the owner does not use R3: reject.

### 8. `api-design`

- **What it is.** "Public API Design and Compatibility" ([`SKILL.md`][s-csharp-api-design], 387 lines, no references). Three kinds of compatibility (source, binary, wire). **Extend-only design**: "Previous functionality is immutable", "New functionality through new constructs", "Removal only after deprecation period". A safe/unsafe change list whose sharpest item is: "ADD optional parameters to EXISTING methods (binary incompatible!) … callers compiled against the old signature will get MissingMethodException at runtime … Correct approach: add a NEW overload" ([L104-L110][api-optional]). An `[Obsolete]`-then-new-API deprecation pattern. **API approval testing**: generate the public surface as text with PublicApiGenerator, snapshot it with Verify, so "Any API change fails the test" and the diff shows in review ([L132-L173][api-approval]). Wire-format evolution in three phases (read side first, write side opt-in, then default). Encapsulation (an `.Internal` namespace or `[InternalApi]`, seal by default, small interfaces). A six-box PR checklist ([L323-L332][api-checklist]) and three anti-patterns: a breaking change disguised as a fix, a silently changed default, type names in a wire format ([L336-L376][api-anti]).
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked.
- **SDK or Unity**: **partly**. The change rules are C# and CLR semantics and hold for any compiler: an optional parameter's default is baked into the caller whether Roslyn runs inside Unity or the SDK. The approval-test recipe is SDK-only (`dotnet add package`, Verify, which needs module initializers; entry 17). One example uses `init` (L85). *Inference* on relevance: for a Unity package shipped as source, consumers recompile, so binary compatibility matters only for precompiled DLLs; and Unity adds break surfaces this skill does not know (a renamed serialized field, a renamed `.asmdef`, a moved script's GUID), which the fork's `unity-serialization` and `unity-assemblies` own. The wire-format half reads like Akka.NET cluster upgrades (`akka.cluster.use-heartbeat-v2 = on`) but its "read before write" rule applies to any save-file or network format (*inference*).
- **Why it could fit.** C# libraries are the owner's second domain, and nothing in the collection, the fork or `dotnet/skills` states compatibility rules. `dotnet/skills`' `csharp-refactoring` treats a public API change as "not a refactor" and stops ([dotnet-skills ledger](dotnet-skills.md) entry 17); this skill is what should happen next. The optional-parameter rule and "a changed default is a breaking change" are the kind of thing an agent does wrong while "tidying". At ~74 tokens it is cheap.
- **Why it might not.** Matters only for libraries with outside consumers (Open question 2). It contradicts itself twice: the PR checklist says "No new required parameters (use defaults)" although the body calls adding a defaulted parameter a binary break, and the versioning table allows "obsolete removal" in a minor release ([L296-L302][api-semver]) while the deprecation pattern says "Remove in next major version". Much of the rest is standard SemVer knowledge. The deprecation timescale ("Years, not releases") is an Akka.NET-sized project's policy, not a solo library's.
- **Copy / adapt / idea-only**: adapt. Cut to the change table, the deprecation pattern, the approval-test idea and the checklist; fix the two contradictions; drop the Akka examples; shorten to roughly a third. It cannot be copied directly because of those contradictions and the sibling pointer "See `dotnet/serialization` skill".
- **Overlap**: Addy `api-and-interface-design` and `deprecation-and-migration`, both proposed for adaptation as references ([addy ledger](addy-agent-skills.md) entry 17); `dotnet/skills` `csharp-refactoring` (public-surface rows of its Do/Never table) and `migrate-nullable-references` ("Every `?` on a public parameter … is a contract change"); fork `codebase-design`; entries 12, 17 and 19 here. The Unity baseline's gap list names "UPM package authoring" ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: ~74 tokens as published.
- **Recommendation (proposed)**: adapt, conditional on Open question 2. Decide beside Addy's `api-and-interface-design`: this one supplies the .NET-specific binary-compatibility rules that one lacks. One merged skill, not two.

### 9. `type-design-performance`

- **What it is.** A design-time checklist ([`SKILL.md`][s-csharp-type-design-performance], 398 lines, no references): seal classes by default ("enables JIT devirtualization and communicates API intent"); `readonly struct` for small immutable values, with a struct-versus-class table; prefer static pure functions, but "**Don't go overboard** - Use instance methods when you genuinely need state or polymorphism" ([L154][type-overboard]); defer enumeration (one `ToList()` at the end); `ValueTask` only for often-synchronous hot paths, "If in doubt, use Task"; `Span<T>`/`Memory<T>` instead of `byte[]`; return `IReadOnlyList<T>` from API boundaries, `FrozenDictionary` for static lookups.
- **Kind**: skill.
- **Proposed address**: none as a skill; a few lines for a C# pack style reference.
- **SDK or Unity**: **partly**, about half. Holds: `sealed`, `readonly struct`, static pure functions, single materialisation, read-only return types, `Span<T>` and `ArrayPool`. Does not: `readonly record struct` (C# 10), `ValueTask.FromResult` (.NET 5), `FrozenDictionary` (.NET 8), `IAsyncEnumerable` with `[EnumeratorCancellation]` as a default streaming answer. The devirtualization rationale is about the .NET JIT; whether Mono or IL2CPP gains the same from `sealed` was not checked. *Inference*: the skill has no idea of per-frame allocation, which is where "defer enumeration" becomes "no LINQ in `Update`", nor of `MonoBehaviour` (which cannot be a static pure function's home, and whose serialized fields cannot be read-only).
- **Why it could fit.** "Seal by default" and "return read-only collections from the public surface" double as API-stability rules for libraries (entry 8 repeats sealing). Short and uncontroversial.
- **Why it might not.** It is knowledge a current model already applies (*inference*). No decision in it is hard, and it has no "what not to flag" guard, which `dotnet/skills`' `analyzing-dotnet-performance` has (its pitfalls table lists "Flagging every `Dictionary` as needing `FrozenDictionary`" as an error, and this skill recommends exactly that without a size condition).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` `analyzing-dotnet-performance` ([dotnet-skills ledger](dotnet-skills.md) entry 23), the better base for any performance skill; entries 8 and 10 here (sealing, collections, `Span<T>` appear in all three); tipoLi's Unity profiling skills ([unity-workflow ledger](unity-workflow-repos.md)); Addy `performance-optimization` ([addy ledger](addy-agent-skills.md)).
- **Idle context cost**: ~70 tokens as published.
- **Recommendation (proposed)**: reject the skill. Keep "seal by default; read-only collection types on public members" as two lines for whatever C# style reference the owner ends up with.

### 10. `modern-csharp-coding-standards`

- **What it is.** The source's house style ([`SKILL.md`][s-csharp-coding-standards], 320 lines, four references totalling 1,283 lines). Eight principles ([L26-L35][std-principles]): immutability by default with `record` and `init`; nullable types and value objects; pattern matching; "Async Everywhere"; `Span<T>`/`Memory<T>`; accept abstractions; "Composition Over Inheritance - Avoid abstract base classes"; "Value Objects as Structs - Use `readonly record struct`", with "explicit conversions, never implicit operators". Further: a domain-specific result type for expected errors "not a generic `Result<T>`" ([L212-L216][std-result]); "**Banned:** AutoMapper, Mapster, ExpressMapper. Use explicit mapping extension methods instead" ([L220-L224][std-banned]); a DO/DON'T summary.
- **Kind**: skill (style guide).
- **Proposed address**: none as published; at most a short, owner-written C# pack style reference.
- **SDK or Unity**: **SDK-only** in practice. The description says "C# 12+". Records with `init`, `readonly record struct`, file-scoped namespaces, list patterns, `ArgumentNullException.ThrowIfNull`, `UnsafeAccessorAttribute` and `<Nullable>enable</Nullable>` in a `.csproj` all fail the fork's "C# 9 … without init-only setters" note or the Unity profile (*inference*). "Don't use mutable classes when records work" runs against Unity serialization outright: the fork's note says records "are never serialized". The ideas that survive are compiler-neutral: no implicit conversions on value objects, composition over base classes, explicit mapping, no exceptions for expected failures.
- **Why it could fit.** For an SDK-style library on a current .NET, it is a coherent modern style, and "ban reflection mappers, write explicit mapping methods" is a concrete, checkable rule.
- **Why it might not.** A style guide is the owner's to write, not to import: "always `readonly record struct`", "avoid abstract base classes" and "async everywhere" are one author's server-side preferences. It is the largest idle-knowledge skill here (1,600 lines) and almost all of it is language-feature tutorial a model knows (*inference*). It is not internally consistent: the result-type section says not to build a generic `Result<T>`, the DO list still says "Use `Result<T, TError>` for expected errors" and the sample code uses `Result<Order, OrderError>` ([L285-L296][std-dos]; the source repo's PR #88 says it fixed this, the DO line remains). It calls `ArgumentNullException.ThrowIfNull` a "C# 11+" feature; it is a .NET 6 library method (general knowledge, not from the source). A style skill triggers on "Writing new C# code", that is, always, which the idle-budget rule and the fork's skill-shape rules both discourage.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the baseline gap list's "C# style for Unity" ([unity-baseline](../unity-baseline.md)), which this does not fill; `dotnet/skills` `csharp-expert`'s language fallback ([dotnet-skills ledger](dotnet-skills.md) entry 16); karpathy-style always-on coding rules ([installed-plugins ledger](installed-plugins.md)); entries 8, 9, 12 here.
- **Idle context cost**: ~89 tokens as published.
- **Recommendation (proposed)**: reject. If the owner wants a C# style reference, "no implicit conversions on value objects" and "explicit mapping, no reflection mappers" are the two rules worth a line.

### 11. `csharp-concurrency-patterns`

- **What it is.** "Choosing the Right Tool" ([`SKILL.md`][s-csharp-concurrency-patterns], 273 lines, one 379-line reference). An escalation ladder with a decision tree ([L38-L71][conc-tree]): `async`/`await` for I/O, `Parallel.ForEachAsync` for CPU-bound work, `System.Threading.Channels` for producer/consumer, Reactive Extensions for UI events, then Akka.NET Streams and Akka.NET actors for server-side streams, state machines and "many independent entities". Its stance on locks ([L30-L34][conc-locks]): redesign first, then concurrent collections, then a `Channel<T>` to serialise access, "**Last resort:** Use `lock`". Anti-patterns: locks for business logic, manual threads, blocking in async code, unprotected shared state. "Only escalate when you have a concrete need."
- **Kind**: skill.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only** in practice. `Parallel.ForEachAsync` and `PeriodicTimer` are .NET 6; Channels is a NuGet package in Unity's profile (*inference*, unverified); three of the tree's eight branches end in Akka.NET. Unity's actual concurrency questions (main-thread affinity of the engine API, `Awaitable` versus UniTask versus coroutines, the job system) are absent.
- **Why it could fit.** "Start with `async`/`await`, escalate only on a concrete need, locks last" is a sound default, and the tree is short.
- **Why it might not.** The top of the ladder is the author's own framework. For a library author the more useful rules (never block on async, `ConfigureAwait(false)` in library code, accept a `CancellationToken`) are in entry 10 and are common knowledge. No testing guidance for concurrent code.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 7 (R3 is this skill's "UI events" rung, and R3 points back here); entry 28 (the concurrency agent); Nice-Wolf `unity-async-patterns` ([unity-workflow ledger](unity-workflow-repos.md)); `dotnet/skills` `analyzing-dotnet-performance` (sync-over-async patterns).
- **Idle context cost**: ~91 tokens as published.
- **Recommendation (proposed)**: reject.

### 12. `csharp-nullable-reference-types`

- **What it is.** An authoring and adoption reference for nullable reference types ([`SKILL.md`][s-csharp-nullable-reference-types], 198 lines, two references totalling 604 lines). Core rules: use `!` "only when a real invariant guarantees non-null and the compiler cannot see it"; "**Reorganize code before suppressing warnings**": narrow once with a guard at the boundary, copy a nullable field to a local before checking, keep the rest non-nullable, but "Do not extract a function solely to satisfy nullable analysis" ([L74-L96][nrt-reorg]). API rules for parameters, returns and members. A library section: annotations are "part of a shipped API contract … generally binary compatible, but they can be source breaking", with the four changes to review before release ([L148-L159][nrt-compat]). The C# 14 `field` keyword. An eight-point generation checklist. References: the full `System.Diagnostics.CodeAnalysis` attribute catalog, and a migration playbook with file-level `#nullable` directives and a section on older targets: the attributes are "**Not available:** netstandard2.0, .NET Framework", "**Partial on netstandard2.1**", preceded by "Is a polyfill needed at all?", three options with trade-offs, "Do not hand-roll the attributes" and "A polyfill provides types, not analysis" ([playbook L36-L92][nrt-playbook]).
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked, `paths:`-scoped to `**/*.cs` in library repos.
- **SDK or Unity**: **partly**. File-level `#nullable enable`, the `!` discipline, the reorganise-before-suppress rules and the earlier attributes hold under C# 9 (*inference*; the fork's note does not mention nullable, and project-wide enabling in Unity was not verified, same caveat as the `dotnet/skills` ledger). Not under Unity: `<Nullable>` in a `.csproj`, `required` members (C# 11), the `field` keyword (C# 14), `ArgumentNullException.ThrowIfNull`, and the polyfill packages (NuGet source generators). The `netstandard2.1` rows are directly relevant to a library meant to be consumed by Unity. Unity's own null semantics (destroyed objects comparing equal to null, serialized fields filled without constructors) are outside the skill; `dotnet/skills`' migration skill at least names the serializer pitfall.
- **Why it could fit.** It covers what `dotnet/skills`' `migrate-nullable-references` does not: writing nullable code day to day and annotating a library surface, the continuing job after a migration. The "reorganise before suppressing" section targets the most common agent misbehaviour here, sprinkling `!`. The polyfill decision is the one part a model cannot reason out, and it is written as a decision.
- **Why it might not.** ~207 idle tokens, the second-largest description, mostly a list of attribute names. The attribute catalog is documentation a model largely knows (*inference*). C# 14 material is irrelevant below .NET 10. If the owner's libraries are already nullable-clean, only the library-compatibility and polyfill sections earn their place.
- **Copy / adapt / idea-only**: adapt. Keep the suppression rules, the API-compatibility section and the polyfill decision; trim the attribute catalog to a pointer; rewrite the description to a trigger. It cannot be copied directly because of the description cost and the nonstandard `version`/`tags` frontmatter keys (entry 3's lesson).
- **Overlap**: `dotnet/skills` `migrate-nullable-references` ([dotnet-skills ledger](dotnet-skills.md) entry 26), proposed there as a user-invoked migration skill; the two are complementary and agree on "no `!` sprinkling" and on public `?` being a contract change. Entry 8 (public surface), entry 10 (which tells the reader to enable nullable and nothing more).
- **Idle context cost**: ~207 tokens as published (526 chars); ~50 with a trigger description (*inference*).
- **Recommendation (proposed)**: adapt as the *authoring* half, if the owner's libraries use nullable; take `dotnet/skills`' skill for the one-off migration. If only one nullable piece is wanted, the official one is the better base (shorter, decision-shaped, eval-backed process).

### 13. `aot-trimming`

- **What it is.** Trimming and Native AOT guidance for libraries and apps ([`SKILL.md`][s-aot-trimming], 158 lines, two references totalling 829 lines). It explains the two problems (reflection the linker cannot see; no JIT), the MSBuild switches (`IsTrimmable`, `IsAotCompatible`, `PublishTrimmed`, `PublishAot`), a test app that roots the library as "the standard way to validate a library", and the attribute model with a table mapping each reflection call to the narrowest `DynamicallyAccessedMemberTypes`. Its stance is permissive by design: "Reflection is not the enemy … you need none of this" in a JIT app ([L50-L52][aot-notenemy]), then a four-way choice per call site: keep and annotate, replace with a compile-time alternative, isolate behind a feature switch, or "Suppress only as a last resort — a single `[UnconditionalSuppressMessage(...)]` at an invariant-proven leaf, with a `Justification`. Never `#pragma`" ([L122-L134][aot-select]). The playbook reference covers source generators, `UnsafeAccessor`, trimming-safe islands, migration analyzers and a warning-approval baseline.
- **Kind**: skill.
- **Proposed address**: C# pack user-invoked (a deliberate, one-off piece of work per library).
- **SDK or Unity**: **SDK-only** as written: the analyzers ship with the .NET SDK and need a `net8.0`-compatible target. *Inference*, same as the `dotnet/skills` ledger: it still matters for a library consumed by Unity IL2CPP builds, which also strip code and cannot JIT, so a library that is clean under these analyzers avoids the same reflection hazards. Unity's own mechanism (`link.xml`, `[Preserve]`) is not covered; the baseline gap list names it.
- **Why it could fit.** If the owner ships libraries for IL2CPP, "make the reflection statically visible" is the right mental model, and the "first decide whether the code must be trimming-safe at all" opening stops an agent from annotating a library nobody trims.
- **Why it might not.** At ~338 tokens its description is the most expensive in the source, almost four times the average. It conflicts with `dotnet/skills`' `dotnet-aot-compat`, which says "NEVER use `[UnconditionalSuppressMessage]`" where this one allows a justified leaf suppression; an agent given the looser rule will use it. 987 lines to keep current with the SDK.
- **Copy / adapt / idea-only**: idea-only, or copy the playbook file as a reference under the official skill.
- **Overlap**: `dotnet/skills` `dotnet-aot-compat` ([dotnet-skills ledger](dotnet-skills.md) entry 27): same job, stricter procedure ("Triage warnings by code", fix innermost first), 269 lines. Entry 19 here (source-generated JSON). Fork `unity-assemblies` (stripping, defines).
- **Idle context cost**: ~338 tokens as published (863 chars); 0 user-invoked.
- **Recommendation (proposed)**: the official `dotnet-aot-compat` is the better base, on the same condition as there (the owner ships libraries for IL2CPP or AOT). From this one, keep at most the playbook reference and the "decide whether you need this at all" opening.

### 14. `dotnet-slopwatch`

- **What it is.** The operating manual for Slopwatch, "LLM Anti-Cheat for .NET" ([`SKILL.md`][s-slopwatch], 308 lines), a .NET command-line tool that scans C# and project files for "shortcuts LLMs take that make tests pass or builds succeed without actually solving the underlying problem". Six rules ([L210-L219][slop-rules]):

  | Rule | Severity | Catches |
  |---|---|---|
  | SW001 | Error | Disabled tests (`Skip=`, `Ignore`, `#if false`) |
  | SW002 | Warning | Warning suppression (`#pragma warning disable`, `SuppressMessage`) |
  | SW003 | Error | Empty catch blocks |
  | SW004 | Warning | Arbitrary delays in tests (`Task.Delay`, `Thread.Sleep`) |
  | SW005 | Warning | Project-file slop (`NoWarn`, `TreatWarningsAsErrors=false`) |
  | SW006 | Error | Central-package-management bypass (`VersionOverride`, inline `Version`) |

  The workflow: `slopwatch init` writes `.slopwatch/baseline.json` so "slopwatch only catches **new** slop"; `slopwatch analyze` after each change; `--update-baseline` only with a written reason. A table of invalid reasons: "'The test is flaky' → Fix the flakiness … 'We'll fix it later' → Fix it now" ([L293-L308][slop-override]). It documents a Claude Code `PostToolUse` hook on `Write|Edit|MultiEdit` running `slopwatch analyze -d . --hook`, which "Only analyzes **git dirty files**" and exits 2 so "Claude sees the error and can fix it immediately" ([L138-L165][slop-hook]), plus CI steps. Activation is meant to be constant: "**Use this skill constantly.** Every time an LLM (including Claude) makes changes to" C# or project files ([L8-L16][slop-when]); the description says "Run after every code modification".
- **Kind**: skill wrapping a third-party tool; documents a hook and a CI check.
- **Proposed address**: three separable pieces. The rule list: idea-only input to core (always-on text or the proposed test guard). The tool as a CI check: C# pack mechanism. The hook: C# pack always-on.
- **SDK or Unity**: **SDK-only** for the tool (installed with `dotnet tool`; whether it can scan a Unity project's `Assets/` without an SDK-style project was not tested). The *patterns* hold under Unity and name its test framework: `[Ignore]` is NUnit's attribute, `#pragma warning disable`, empty catches and `Thread.Sleep` in tests are compiler-neutral. SW005 and SW006 have no Unity meaning. *Inference*: Unity has its own forms the rule list lacks (`[UnityPlatform]` exclusions, `LogAssert.ignoreFailingMessages`, `yield return new WaitForSeconds` in a test, `#if !UNITY_EDITOR` around an assertion).
- **Why it could fit.** It names the exact failure the other ledgers circle around ("never weaken tests to pass", [davidondrej ledger](davidondrej-skills.md) entry 1; "fake green", [hook-collections ledger](hook-collections.md) entry 2) and answers it with a deterministic check, not a model's judgment. The **baseline** is the important design choice: a legacy repo full of suppressions does not drown the signal, and "new slop only" keeps a hook quiet on honest edits. A check that is silent unless it finds something is the shape ticket #14's hook gate asks for. It is the mechanical counterpart to `dotnet/skills`' model-run test review ([dotnet-skills ledger](dotnet-skills.md) entry 30), which that ledger already paired with it.
- **Why it might not.**
  - It installs and runs a third-party binary (`slopwatch.cmd` pinned at 0.4.2) on every edit. The tool's source was not read for this ledger, so its real behaviour, speed and false-positive rate are unknown.
  - The hook snippet has two faults against Claude Code's hook reference. `"timeout": 60000` is in **seconds** there ("Seconds before canceling", [hooks reference](https://code.claude.com/docs/en/hooks), read 2026-10-10), so it is ~16.7 hours where 60 seconds was surely meant. And a `PostToolUse` hook cannot "block the edit": for that event exit 2 "Shows stderr to Claude; the tool already ran" (same page).
  - A hook per edit starts a .NET process each time (*inference*: noticeable latency), and there is no Codex form.
  - "Use this skill constantly" is a model-invoked description doing an always-on job, the pattern the idle-budget rule exists to prevent. As a hook or CI step the skill text is not needed at all.
  - Zero tolerance is a policy: SW002 flags every `#pragma warning disable`, including legitimate ones around generated or interop code, and the remedy is a baseline edit.
  - Until the source repo's PR #88 the skill pinned tool version 0.2.0 when 0.4.2 was current and documented a config file "The tool doesn't read", a caution about vendoring tool manuals.
- **Copy / adapt / idea-only**: idea-only for the skill. If the owner wants the tool: wire it in a C# library repo's CI first (no context cost, no per-edit latency), with a corrected hook only if CI proves too late. The rule list is reusable without the tool: as the pattern set for a C# port of `protect-tests`, or as the "what counts as cheating" paragraph of a test-review skill. The skill cannot be copied directly: its always-run description, the faulty hook, and its dependence on a tool the owner has not chosen.
- **Overlap**: hook-collections `protect-tests`, proposed as a second core hook after a C#/Windows port ([hook-collections ledger](hook-collections.md) entry 2): that one *prevents* edits to tests before they happen, this one *detects* slop in any C# file after; they overlap on disabled tests only. `dotnet/skills` `test-anti-patterns` (Critical tier: no assertions, swallowed exceptions; High: sleeps) and `dotnet-aot-compat` ("NEVER use `#pragma warning disable` for IL warnings"). davidondrej `goal-loop` ("Forbid reward-hacking") and `AGENTS.md` one-liners; superpowers `verification-before-completion` ([superpowers ledger](superpowers.md) entry 12); fork `tdd`, `code-review`; the fork's `unity-testing` for the Unity forms.
- **Idle context cost**: ~85 tokens as published; 0 as a CI check or a silent hook.
- **Recommendation (proposed)**: do not vendor the skill. Carry the six-rule list and the baseline idea into the testing theme, to be decided together with `protect-tests` and the official test-review skills. Whether to run the tool itself is Open question 3.

### 15. `crap-analysis`

- **What it is.** Coverage plus complexity as a risk ranking ([`SKILL.md`][s-crap-analysis], 386 lines). "**CRAP Score = Complexity x (1 - Coverage)^2**", with bands (<5 low, 5-30 medium, >30 "Needs tests or refactoring") and worked examples ([L19-L29][crap-formula]). The rest is setup: a `coverage.runsettings` that emits OpenCover format ("required for CRAP score calculation because it includes cyclomatic complexity"), ReportGenerator as a local tool, the collect and report commands, how to read the "Risk Hotspots" section, recommended thresholds, GitHub Actions and Azure Pipelines YAML.
- **Kind**: skill (setup recipe).
- **Proposed address**: none standing; the ranking idea for a testing skill.
- **SDK or Unity**: **SDK-only** as written (`dotnet test --collect`, `.runsettings`, `dotnet tool`). *Inference, unverified*: Unity's Code Coverage package is understood to emit OpenCover XML, the format this route needs, so the "read the Risk Hotspots report" half may transfer to Unity more directly than `dotnet/skills`' Cobertura-parsing route. That needs a check against Unity's package documentation before anyone relies on it.
- **Why it could fit.** "Test the complex, uncovered methods first" is a better instruction to an agent than "raise coverage", and the formula is one line. Using ReportGenerator's existing report avoids custom parsing code.
- **Why it might not.** About 300 of the 386 lines are configuration and CI YAML a model can write on request. Coverage tooling is per-repo setup the owner may not have. The router snippet (entry 4) is what makes it fire ("after tests added/changed in complex code"); the description alone does not say when.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` `crap-score`, `coverage-analysis`, `find-untested-sources` ([dotnet-skills ledger](dotnet-skills.md) entry 34), proposed rejected there with "keep the CRAP ranking idea"; that ledger also records `crap-score`'s two parse paths giving contradictory answers. Same idea, two tool routes. Fork `tdd`.
- **Idle context cost**: ~85 tokens as published.
- **Recommendation (proposed)**: reject the skill; same verdict as the official ledger. If a coverage step is ever built, this source's "let ReportGenerator compute it" route is the simpler base.

### 16. `cscheck`

- **What it is.** Property-based, model-based and executable-specification testing with the CsCheck library ([`SKILL.md`][s-cscheck], 68 lines, four references totalling 524 lines). Added one day before this read. It opens with a "Choose the test shape" table mapping what needs checking to the API to start with and the one reference to read ([L12-L23][cscheck-shape]), then states rules instead of touring the API:
  - "Identify an observable requirement and a plausible wrong result it would reject … Do not use the implementation's answer to manufacture its expected answer." ([L25-L38][cscheck-contract])
  - "Generate **individual operations and their arguments**, allowing CsCheck to compose arbitrary sequences … Handwritten whole scenarios are useful regressions, but are not a substitute for exploring action orderings."
  - "A guard saying 'only withdraw when funds exist' cannot test insufficient-funds rejection."
  - "Prefer composed `Gen` values to `Random`, hand-chosen seed lists, custom shrinkers, or retries-until-green." "`equal:` must compare behavior or state; cleanup belongs in `finally`/`using`, not an equality predicate that always returns true."
  - "`Spec.Exhaustive` checks the **model**. `Spec.Conform` checks the real implementation … a green run can be vacuous." "When practical, show that the test rejects a known broken implementation" ([L51-L60][cscheck-verify]).
  - "Compile and execute examples rather than assuming similarly named FsCheck APIs exist in CsCheck."
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked, or a reference leaf read from the fork's `tdd` when a test is a property test.
- **SDK or Unity**: **partly**. The skill says "CsCheck itself is test-framework independent", so NUnit is fine, and the rules above are about test design, not about a compiler. Its examples were "compiled and run with **CsCheck 4.9.1** on .NET 8" ([L62-L68][cscheck-baseline]); whether CsCheck's assembly loads under Unity's profile, and which C# version its examples need, was not checked. Without the library the rules still apply to any generated-input test (*inference*).
- **Why it could fit.** Property and model-based tests suit the code a library author and a game developer both write: parsers, serializers, math, collections, state machines, inventory and economy rules. The skill is the best-shaped in the source by the fork's own standards: 68 lines, a decision table up front, references loaded by need, a version line, and every rule aimed at a way agent-written property tests go wrong (tautological oracles, always-true equality, pinned seeds, retries until green). "Show that the test rejects a broken implementation" is the same honesty check as `dotnet/skills`' pseudo-mutation question.
- **Why it might not.** Useful only if the owner adopts CsCheck, a single-maintainer library; whether the owner writes property tests at all is unknown. Brand new in the source, so unproven. ~98 idle tokens for something used occasionally.
- **Copy / adapt / idea-only**: copy with a provenance note if the owner uses CsCheck (it needs almost no change; `paths:`-scope it or mark it a reference leaf). Otherwise idea-only: the six rules above fit in the fork's `tdd` as "when a test generates its inputs".
- **Overlap**: abagames' balance and invariant skills and `implementing-gameplay-invariants`, proposed standouts for a gamedev pack ([gamedev ledger](gamedev-repos.md) entry A3): those say *which invariants* a game should hold, this says *how to test an invariant* without fooling yourself. Fork `tdd`, `unity-testing`; `dotnet/skills` `test-gap-analysis` and `assertion-quality` ([dotnet-skills ledger](dotnet-skills.md) entry 30). No property-testing skill in `dotnet/skills`.
- **Idle context cost**: ~98 tokens as published; 0 as a leaf read by path.
- **Recommendation (proposed)**: owner's call on the library. Either way, take the oracle rules ("don't derive the expected answer from the implementation", "a green run can be vacuous", "prove the test can fail") into the testing theme.

### 17. `snapshot-testing`

- **What it is.** Snapshot (approval) testing with the Verify library ([`SKILL.md`][s-snapshot-testing], 410 lines): the received/verified file cycle, setup through a `[ModuleInitializer]` ([L44-L56][snap-init]), object, HTML, email, HTTP-response and **public-API-surface** snapshots, scrubbing of dates, GUIDs and tokens, file layout, `.gitignore` for `*.received.*`, `.gitattributes` marking verified files `linguist-generated`, and failing CI on a missing baseline.
- **Kind**: skill.
- **Proposed address**: C# pack model-invoked, only if the owner uses Verify.
- **SDK or Unity**: **SDK-only**. The setup step is a module initializer, which the fork's note lists among the features Unity's compiler lacks, and packages arrive by `dotnet add package`. `Verify.NUnit` exists per the skill; whether it runs inside Unity's test runner was not checked.
- **Why it could fit.** The API-surface snapshot is the enforcement half of entry 8: a library's public surface becomes a reviewed text file, so an agent cannot change it silently. Scrubbing rules are the part people get wrong.
- **Why it might not.** Snapshot tests invite the cheat entry 14 exists to catch: an agent that "fixes" a failing snapshot by accepting the new output. The skill says approval is a human step but gives the agent no rule against doing it. `linguist-generated` on verified files *collapses them in PR diffs*, which hides exactly the change a reviewer is supposed to read (*inference* about the consequence; the setting is the skill's own advice). Half the examples are emails and HTTP.
- **Copy / adapt / idea-only**: idea-only, unless the owner already uses Verify.
- **Overlap**: entry 8 (API approval), entry 26 (`verify-email-snapshots`, the same library applied to emails); `protect-tests` ([hook-collections ledger](hook-collections.md) entry 2), whose guard would need to cover `*.verified.*` files. No counterpart in `dotnet/skills`.
- **Idle context cost**: ~76 tokens as published.
- **Recommendation (proposed)**: reject the skill. Keep one idea for the C# pack: a public-API snapshot test as the mechanical guard behind the API rules, with baseline files that only the human approves.

### 18. `ilspy-decompile`

- **What it is.** A short how-to for reading compiled .NET code with ILSpy's command line ([`SKILL.md`][s-ilspy-decompile], 102 lines): where assemblies live (`~/.nuget/packages/<name>/<version>/lib/<tfm>/`, runtime folders, build output), a four-step workflow (identify, locate, list types, decompile), and the commands (`ilspycmd -t Namespace.Type`, `-il`, `-p -o`). It is the only skill with `allowed-tools`, set to `Bash(dnx:*)` ([L4][ilspy-tools]).
- **Kind**: skill.
- **Proposed address**: C# pack user-invoked, or none.
- **SDK or Unity**: **SDK-only** to run (needs the .NET SDK and `dnx` or a global tool). *Inference*: its use is not SDK-bound. Pointing the same command at a Unity project's `Library/ScriptAssemblies` or at package DLLs would answer "what does this closed-source Unity package actually do", a real question in Unity work. The skill knows none of those paths.
- **Why it could fit.** "Read the implementation, don't guess" is the right reflex for a library author depending on packages, and decompiling is how to do it when source is not at hand.
- **Why it might not.** `allowed-tools: Bash(dnx:*)` pre-approves every `dnx` invocation while the skill is active, and `dnx` fetches and runs a tool package on demand, the same class of "harness downloads and runs something" the `dotnet/skills` ledger flagged for its LSP and MCP entries. The grant names the Bash tool only, so on this machine's PowerShell tool it would not apply ([hook-collections ledger](hook-collections.md) makes the same Bash-versus-PowerShell point for guards). The body is thin and hedged ("ILSpyCmd options may vary slightly by version"); a model knows these commands. Many packages now ship SourceLink, and an IDE decompiler covers the interactive case.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `research` ("primary sources … source code"), `diagnosing-bugs`; `dotnet/skills` has no decompile skill.
- **Idle context cost**: ~93 tokens as published.
- **Recommendation (proposed)**: reject as a skill. If wanted, one line in a C# pack reference ("to see how a dependency behaves, decompile it with `ilspycmd`; ask before installing the tool") covers it, with no `allowed-tools` grant.

### 19. `serialization`

- **What it is.** Choosing a serialization format ([`SKILL.md`][s-serialization], 413 lines): schema-based (Protobuf, MessagePack, source-generated System.Text.Json) over reflection-based (Newtonsoft.Json defaults, `BinaryFormatter`); a use-case table; setup for each; migrating from Newtonsoft.Json; wire-compatibility patterns (tolerant reader, "Introduce Read Before Write", "Never Embed Type Names"); a star-rating performance table; Akka.NET serializer configuration.
- **Kind**: skill.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only** as written (source-generated System.Text.Json, NuGet setup, server use cases). The word means something else in the owner's first domain: Unity serialization (scenes, prefabs, `[SerializeField]`) is the fork's `unity-serialization`. The wire rules would apply to a save-file or network format in a game (*inference*), but the skill never frames them that way.
- **Why it could fit.** "Never embed type names in a payload" and "ship the reader before the writer" are durable rules for any persisted format, including game saves.
- **Why it might not.** A technology-selection guide for distributed systems. The performance table is star ratings with no source. The wire rules duplicate entry 8.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 8 (wire compatibility); fork `unity-serialization` (different subject, same word: a naming collision to avoid in any C# pack); the baseline gap list's "save systems" and Nice-Wolf's save skill ([unity-workflow ledger](unity-workflow-repos.md)).
- **Idle context cost**: ~90 tokens as published.
- **Recommendation (proposed)**: reject. Fold "no type names in payloads; readers before writers" into the adapted API skill (entry 8) if that is taken.

### 20. `dotnet-project-structure`, `package-management`, `dotnet-local-tools`

- **What it is.** Three skills on SDK-repo plumbing.
  - [`dotnet-project-structure`][s-project-structure] (521 lines): the `.slnx` solution format, a full `Directory.Build.props` (shared target-framework properties, SourceLink, dynamic copyright year), `Directory.Packages.props`, `global.json` SDK pinning, `NuGet.Config`, and the author's release convention: versions parsed out of `RELEASE_NOTES.md` by PowerShell scripts.
  - [`package-management`][s-package-management] (459 lines): "**Golden Rule: Never Edit XML Directly** … Always use `dotnet` CLI commands to manage packages" with reasons ([L19-L38][pkg-golden]), Central Package Management, shared version variables for package families, when *not* to use CPM, a CLI reference, anti-patterns.
  - [`dotnet-local-tools`][s-local-tools] (478 lines): `.config/dotnet-tools.json`, restore in CI, pin exact versions, a catalog of common tools.
- **Kind**: skills.
- **Proposed address**: none standing. `package-management`'s golden rule as one line in a library repo's `AGENTS.md`.
- **SDK or Unity**: **SDK-only**, all three. Unity generates its project files and uses UPM.
- **Why it could fit.** "Add packages with the CLI, never by editing XML" is a crisp agent rule with a real payoff (resolved versions, CPM kept consistent), and it is the rule Slopwatch's SW006 enforces. A library owner sets up `Directory.Build.props` and SourceLink once per repo.
- **Why it might not.** 1,458 lines of setup reference for one-off tasks, ~217 idle tokens for the three. `dotnet/skills` covers the same ground from the SDK team with maintained skills. The release-notes versioning scheme is personal to the author. Whether the owner has multi-project solutions is the `dotnet/skills` ledger's Open question 2.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` `convert-to-cpm` and `nuget-trusted-publishing` (entry 22 there), `msbuild` (entry 18), `directory-build-organization` among the 18 MSBuild skills (entry 29); the fork's `setup-pre-commit` ([fork ledger](mattpocock-skills-unity.md)).
- **Idle context cost**: ~82 + ~82 + ~53 ≈ 217 tokens as published.
- **Recommendation (proposed)**: reject all three. Keep the golden rule as a candidate per-repo line for SDK-style library repos. For anything more, the official skills are the better base.

### 21. `microsoft-extensions-configuration`, `dependency-injection-patterns`

- **What it is.** [`microsoft-extensions-configuration`][s-microsoft-extensions-configuration] (343 lines, one reference): the Options pattern, data-annotation validation, `IValidateOptions<T>`, `ValidateOnStart`, option lifetimes, and anti-patterns ("Validation in Constructor", "Throwing in IValidateOptions"). [`dependency-injection-patterns`][s-microsoft-extensions-dependency-injection] (347 lines, one reference): group registrations into `Add*` extension methods on `IServiceCollection`, layered extensions, lifetimes, "Injecting Scoped into Singleton", scopes in background work, Akka.Hosting integration.
- **Kind**: skills.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only**. Both assume `Microsoft.Extensions.*` hosts. *Inference*: Unity projects that use dependency injection use other containers, and the fork's `unity-code-lifecycle` covers the static-state problems DI is used for there.
- **Why it could fit.** A library that offers an `AddMyLibrary()` extension to its consumers follows exactly this pattern.
- **Why it might not.** Application-host material; `dotnet/skills`' `testability-obstacle` says outright "do not add a DI container to a class library just to satisfy this workflow". Widely known patterns (*inference*).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` `testability-obstacle` ([dotnet-skills ledger](dotnet-skills.md) entry 31), `maui-dependency-injection`; fork `codebase-design`.
- **Idle context cost**: ~72 + ~74 ≈ 146 tokens as published.
- **Recommendation (proposed)**: reject both.

### 22. `opentelemetry-net-instrumentation`

- **What it is.** Instrumenting .NET code for OpenTelemetry ([`SKILL.md`][s-opentelementry-dotnet-instrumentation], 515 lines, three references totalling 2,104 lines; the folder name is misspelt `opentelementry`). Its organising idea is specific to .NET: instrument with the three built-in APIs (`ActivitySource`, `Meter`, `ILogger`), "Zero Dependencies", and keep the OpenTelemetry SDK at the "Application Root Only". Then naming, span kinds, status and exception recording, metric instrument choice, a "Zero-Allocation Fast Path", testing spans.
- **Kind**: skill.
- **Proposed address**: none, unless the owner's libraries emit telemetry.
- **SDK or Unity**: **SDK-only** in practice (server observability; *inference*: `System.Diagnostics.DiagnosticSource` types exist as a package, but nothing in Unity consumes them by default).
- **Why it could fit.** "A library depends on the BCL diagnostics types only, never on the OpenTelemetry SDK" is the correct rule for a library author and not obvious.
- **Why it might not.** The biggest skill in the source (2,600 lines) for a concern the map does not mention. ~104 idle tokens.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: none in the other ledgers. Entry 25's `aspire-service-defaults` wires the collection side.
- **Idle context cost**: ~104 tokens as published.
- **Recommendation (proposed)**: reject.

### 23. `testcontainers-integration-tests`, `playwright-blazor-testing`, `playwright-ci-caching`

- **What it is.** [`testcontainers-integration-tests`][s-testcontainers] (225 lines, two references): real databases, queues and caches in Docker for xUnit integration tests, "Real Infrastructure Over Mocks". [`playwright-blazor-testing`][s-playwright-blazor] (623 lines): end-to-end tests for Blazor apps (navigation without page reloads, auth, SignalR updates, selectors). [`playwright-ci-caching`][s-playwright-ci-caching] (223 lines): cache Playwright's browser binaries in GitHub Actions and Azure DevOps, keyed on the package version.
- **Kind**: skills.
- **Proposed address**: none now; web-pack material only if the owner's web apps are .NET.
- **SDK or Unity**: **SDK-only**, all three.
- **Why it could fit.** Web apps are the owner's third domain. If any is ASP.NET Core or Blazor, these are concrete and current.
- **Why it might not.** Nothing on the map says the owner's web stack is .NET; web pack sources are deferred. Testcontainers needs Docker in the loop. `playwright-ci-caching` is a CI recipe, not agent guidance.
- **Copy / adapt / idea-only**: none now.
- **Overlap**: the deferred web pack sources (map, "Not yet specified"); `dotnet/skills`' Blazor plugin ([dotnet-skills ledger](dotnet-skills.md) entry 37); the host's browser tooling.
- **Idle context cost**: ~75 + ~73 + ~58 ≈ 206 tokens as published.
- **Recommendation (proposed)**: reject all three for now; revisit only if a web-pack session says the owner's web apps are .NET.

### 24. `efcore-patterns`, `database-performance`

- **What it is.** [`efcore-patterns`][s-efcore-patterns] (629 lines): no-tracking by default, "Never Edit Migrations Manually", a dedicated migration service under Aspire, execution strategies, bulk `ExecuteUpdate`/`ExecuteDelete`, query splitting. [`database-performance`][s-database-performance] (505 lines): separate read and write models, "Always Apply Row Limits", avoid N+1, "Never Do Application-Side Joins", "Don't Build Generic Repositories", Dapper for read-heavy paths.
- **Kind**: skills.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only**.
- **Why it could fit.** Only if the owner builds .NET services with a relational database.
- **Why it might not.** Outside the stated stack. The two overlap each other (no-tracking, N+1 and cartesian explosion appear in both).
- **Copy / adapt / idea-only**: none.
- **Overlap**: `dotnet/skills` `optimizing-ef-core-queries` ([dotnet-skills ledger](dotnet-skills.md) entry 37), the better base if ever needed; davidondrej's database rules ([davidondrej ledger](davidondrej-skills.md) entry 1).
- **Idle context cost**: ~80 + ~79 ≈ 159 tokens as published.
- **Recommendation (proposed)**: reject both.

### 25. Akka.NET and Aspire (9 skills, 1 agent)

- **What it is.** The author's home ground, about a quarter of the catalog.

| Piece | Lines (+ references) | What it covers |
|---|---|---|
| [`akka-net-best-practices`][s-akka-best-practices] | 383 (+663) | EventStream is local-only versus DistributedPubSub, "Supervision is for CHILDREN", try-catch versus supervision, Props versus dependency resolver, cancellation in actors |
| [`akka-net-testing-patterns`][s-akka-testing-patterns] | 253 (+1,043) | Akka.Hosting.TestKit "for 95% of Use Cases", TestProbes, persistence tests, a file-watcher fix for test hosts |
| [`akka-hosting-actor-patterns`][s-akka-hosting-actor-patterns] | 614 | child-per-entity parents, message extractors, reminders, DI scope per message, sharding settings |
| [`akka-net-aspire-configuration`][s-akka-aspire-configuration] | 719 | wiring Akka.NET clustering and persistence into an Aspire app |
| [`akka-net-management`][s-akka-management] | 279 (+390) | cluster bootstrap and service discovery without seed nodes |
| agent [`akka-net-specialist`][a-akka-net-specialist] | 68 | a persona: lists of actor, cluster, persistence and streams topics, with pointers to getakka.net and the Petabridge bootcamp |
| [`aspire-configuration`][s-aspire-configuration] | 158 | AppHost passes explicit configuration by environment variable; "keep app code free of Aspire clients" |
| [`aspire-integration-testing`][s-aspire-integration-testing] | 217 (+634) | `DistributedApplicationTestingBuilder` fixtures with xUnit |
| [`aspire-service-defaults`][s-aspire-service-defaults] | 375 | a shared ServiceDefaults project (OpenTelemetry, health checks, resilience) |
| [`mailpit-integration`][s-aspire-mailpit-integration] | 458 | capture outgoing email locally with a Mailpit container under Aspire |

- **Kind**: skills, one agent.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only**, all ten. Actor clusters and Aspire orchestration are server-side .NET; none is written for a game client.
- **Why it could fit.** These are the most authoritative files in the repo: written by the framework's maintainer, full of non-obvious rules, and Akka.NET is niche enough that a model's baseline is weak (*inference*). For an Akka.NET user this would be the reason to install the plugin.
- **Why it might not.** The map lists Unity, C# libraries, web apps and agentic workflows; nothing suggests actors or Aspire. Together ~730 idle tokens for the nine skills plus ~127 for the agent, all of it paid by anyone who installs the plugin for the C# skills.
- **Copy / adapt / idea-only**: none. One transferable idea, already stated more generally elsewhere: `aspire-configuration`'s "the orchestrator emits plain configuration; the app never references the orchestrator" is the same dependency direction the fork's `codebase-design` asks of a seam.
- **Overlap**: `dotnet/skills`' app-framework plugins ([dotnet-skills ledger](dotnet-skills.md) entry 37) for the "off-stack .NET" verdict; entry 11 here, whose ladder ends in these skills.
- **Idle context cost**: ~434 (Akka skills) + ~294 (Aspire and Mailpit) ≈ 730 tokens, plus ~127 for the agent on Claude (*inference*), as published.
- **Recommendation (proposed)**: reject all nine skills and the agent. Revisit only if the owner starts an Akka.NET or Aspire project, and then install the source's plugin in that project instead of vendoring.

### 26. `mjml-email-templates`, `verify-email-snapshots`, `dotnet-devcert-trust`, `sdk-container-publishing`

- **What it is.** Four service-side leftovers. [`mjml-email-templates`][s-mjml-email-templates] (396 lines): responsive email with MJML and a template renderer. [`verify-email-snapshots`][s-verify-email-snapshots] (324 lines): entry 17's library applied to rendered emails. [`dotnet-devcert-trust`][s-dotnet-devcert-trust] (414 lines): repairing HTTPS development-certificate trust **on Linux** (Ubuntu, Fedora, Arch, WSL2); it says "On Windows and macOS, `dotnet dev-certs https --trust` handles everything automatically". [`sdk-container-publishing`][s-sdk-container-publishing] (122 lines, five references): container images from `dotnet publish /t:PublishContainer` without a Dockerfile, with a "Key Facts" list of version-specific traps ("The .NET 10 SDK tags images `latest`, not the version"; "Windows images need an explicit base image", [L45-L53][container-facts]).
- **Kind**: skills.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only**, all four.
- **Why it could fit.** `sdk-container-publishing` is well made: short, progressive, built on dated facts a model is likely to miss. If the owner ever containerises a .NET service it is the one to copy.
- **Why it might not.** Email, Linux certificate stores and container publishing are outside the stated stack; the owner is on Windows 11, where the certificate skill declares itself unnecessary. `sdk-container-publishing` carries the misspelt `invocable` key (entry 3).
- **Copy / adapt / idea-only**: none now.
- **Overlap**: entry 17; the deferred web pack.
- **Idle context cost**: ~85 + ~71 + ~88 + ~114 ≈ 358 tokens as published.
- **Recommendation (proposed)**: reject all four.

---

## Agents

All six are Claude Code subagent definitions: a Markdown file with `name` and `description` frontmatter and a system prompt, registered in the Claude manifest. None sets `model` or `tools`. The README says "They're invoked automatically when Claude Code detects relevant tasks" and that they "are not included in the Codex plugin" ([README][readme]). The source's own rule for them is "Agents define personas with expertise areas and diagnostic approaches" ([AGENTS.md L98-L103][agents-md-content]), and four of the six are exactly that: a "You are a … specialist" line followed by bulleted topic lists. `akka-net-specialist` is covered in entry 25.

### 27. `roslyn-incremental-generator-specialist`

- **What it is.** The exception among the agents: 511 lines of concrete rules for Roslyn incremental source generators ([agent file][a-roslyn-incremental-generator-specialist]). Principles ([L12-L18][roslyn-principles]): "Incremental pipeline first", "Cheap predicates only", "Strict parse vs emit separation", "Deterministic output", "Explicit caching. Intermediate models must be immutable and equatable." A file layout per generator (`Xxx.cs` pipeline wiring, `Xxx.Parser.cs`, `Xxx.Emitter.cs`, `Xxx.TrackingNames.cs`). Caching rules ([L216-L223][roslyn-cache]): "Avoid carrying symbols or semantic models in long-lived models", prefer stable identifiers. Anti-patterns with before/after code ([L354-L372][roslyn-anti]): "Do NOT capture syntax nodes in models", "Do NOT close over symbols in lambdas". Cancellation-token propagation, analyzer config options, `netstandard2.0` project setup with PolySharp ([L444-L458][roslyn-setup]), and required outputs for any change, including "Tests for generated output (snapshot or golden-file style)" and "At least one explicit cache-safety consideration for the affected pipeline" ([L479-L487][roslyn-outputs]), plus a recipe for testing incremental caching with tracking names.
- **Kind**: agent definition (in substance a reference skill).
- **Proposed address**: C# pack model-invoked skill, `paths:`-scoped to generator projects; not an agent.
- **SDK or Unity**: **partly**. The pipeline, caching and emit rules are about the Roslyn API and apply wherever a generator runs. Building and testing a generator is SDK work (a `netstandard2.0` project, NuGet analyzer packages). For Unity as the *host* of a generator, the fork's `unity-assemblies/ANALYZERS.md` (L13) records that Unity's manuals "only show `ISourceGenerator`; whether `IIncrementalGenerator` works is undocumented. Try it and read the compile output before relying on it." So this agent's whole subject is unverified under Unity, and its `ForAttributeWithMetadataName` examples need a recent Roslyn that Unity may not load (*inference*). Unity-side rules it lacks are in that fork file (the analyzer asset label, per-assembly scope, `internal` generated types to avoid CS0436).
- **Why it could fit.** Source generators are the standard way for a C# library to avoid reflection, which is what IL2CPP and entry 13 both want, so a library-and-Unity owner is a plausible generator author. Generator caching mistakes do not fail a build; they silently make the IDE slow, which is exactly knowledge worth encoding. It ends with required outputs, a checkable contract. The discovery sweep already named it.
- **Why it might not.** Whether the owner writes generators is unknown. As an agent it costs ~73 idle tokens on Claude for rare work and does nothing on Codex. 511 lines is long for one file with no progressive split. It points to the official cookbook on `main`, unpinned.
- **Copy / adapt / idea-only**: adapt: re-file as a skill (trigger description, body split into a core and a reference), add a pointer to the fork's `ANALYZERS.md` for Unity hosting. It cannot be copied directly because it is packaged as a Claude-only agent.
- **Overlap**: fork `unity-assemblies` (`ANALYZERS.md`); entry 13 (generators as the trimming-safe alternative); entry 17 (snapshot tests for generated output). `dotnet/skills` has no generator-authoring skill (three passing mentions of source generators in its ledger).
- **Idle context cost**: ~73 tokens as published (*inference*: agent descriptions are listed with the Agent tool); ~50-60 as a skill; 0 until matched if `paths:`-scoped.
- **Recommendation (proposed)**: adapt into a skill if the owner authors generators; otherwise reject. Owner's call.

### 28. `dotnet-concurrency-specialist`

- **What it is.** A persona for race-condition and deadlock analysis ([agent file][a-dotnet-concurrency-specialist], 80 lines): topic lists (threading fundamentals, async patterns, synchronization primitives, race patterns), a six-step "Diagnostic Approach" ("Identify shared state and access patterns … Look for timing assumptions and order dependencies"), anti-patterns, and root causes. Description: "Use for analyzing racy unit tests, deadlocks, and concurrent code issues."
- **Kind**: agent definition.
- **Proposed address**: none.
- **SDK or Unity**: **holds**, trivially: it names concepts, not APIs, and nothing in it is compiler-specific. It also says nothing about Unity's main-thread model.
- **Why it could fit.** Flaky tests from races are real in library work, and "`Thread.Sleep()` for coordination instead of proper signaling" is the same smell Slopwatch's SW004 flags.
- **Why it might not.** It is a table of contents, not instructions: no decision, no procedure beyond six generic steps, nothing a current model lacks (*inference*). The fork's `diagnosing-bugs` already supplies a diagnosis loop with a reproduction-first rule. ~118 idle tokens.
- **Copy / adapt / idea-only**: idea-only (nothing specific to take).
- **Overlap**: fork `diagnosing-bugs`; entry 11; `dotnet/skills` `testability-obstacle` ("Never wait for wall-clock time").
- **Idle context cost**: ~118 tokens as published (*inference*).
- **Recommendation (proposed)**: reject.

### 29. `dotnet-benchmark-designer`, `dotnet-performance-analyst`

- **What it is.** Two personas. [`dotnet-benchmark-designer`][a-dotnet-benchmark-designer] (87 lines): BenchmarkDotNet topics, "When BenchmarkDotNet Isn't Suitable" (long-running, multi-process, distributed scenarios), custom harness design, anti-patterns ("Measuring in Debug mode", "`[Benchmark(Baseline = true)]` on multiple benchmarks"). [`dotnet-performance-analyst`][a-dotnet-performance-analyst] (114 lines): JetBrains dotTrace and dotMemory interpretation, BenchmarkDotNet statistics, regression detection. Two sections of the analyst are specific where the rest is not:
  - **Hot-path delegate allocation** ([L62-L73][perf-delegates]): a capturing lambda allocates per call; passing a method group to a delegate parameter allocates, so cache it in a field; prefer a bound method group when the signature matches; "Always audit delegate construction in hot paths before benchmarking … Ask: 'Does this allocate per call or per pipeline build?'"
  - **Dispatch predictions** ([L105-L114][perf-dispatch]): "Be conservative predicting dispatch optimizations … Don't assume delegate-factory beats virtual dispatch without benchmarking … Trust measurements over intuition".
- **Kind**: agent definitions.
- **Proposed address**: none as agents; the delegate-allocation checklist as a few lines for a performance reference.
- **SDK or Unity**: the personas are **SDK-only** in their tooling (BenchmarkDotNet, JetBrains profilers on .NET). The delegate-allocation section **holds under Unity** and matters more there: closure and method-group allocations inside `Update` are a classic source of per-frame garbage (*inference*; allocation behaviour under Mono and IL2CPP was not verified against this text).
- **Why it could fit.** The allocation checklist is short, concrete and checkable in review. "Predict nothing, measure" matches pstack's "explain the number" rule.
- **Why it might not.** `dotnet/skills`' `microbenchmarking` and `analyzing-dotnet-performance` do both jobs better: one is built from observed model failures with run-cost awareness, the other has ~50 patterns and a false-positive guard ([dotnet-skills ledger](dotnet-skills.md) entries 23-24). These two are topic lists. ~232 idle tokens together.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `dotnet/skills` entries 23 and 24; pstack `benchmark-checklist` ([pstack ledger](pstack.md) entry 9); tipoLi's Unity profiling skills ([unity-workflow ledger](unity-workflow-repos.md)); entry 9 here.
- **Idle context cost**: ~123 + ~109 ≈ 232 tokens as published (*inference*).
- **Recommendation (proposed)**: reject both agents; the official skills are the better base. Carry the delegate-allocation checklist to whichever performance piece the owner picks, Unity included.

### 30. `docfx-specialist`

- **What it is.** A persona for the DocFX documentation generator ([agent file][a-docfx-specialist], 88 lines), tied to one project: "expertise in the DocFX static site generator and Akka.NET documentation standards", following getakka.net's documentation guidelines and "the project's PR validation pipeline". DocFX Markdown extensions, cross-reference syntax, `docfx.json` and `toc.yml`, markdownlint.
- **Kind**: agent definition.
- **Proposed address**: none.
- **SDK or Unity**: **SDK-only** (a .NET documentation tool). *Inference*: DocFX can document a Unity package's API, but nothing here addresses that.
- **Why it could fit.** Only if the owner publishes library API docs with DocFX.
- **Why it might not.** Written for Akka.NET's docs. ~108 idle tokens.
- **Copy / adapt / idea-only**: none.
- **Overlap**: none.
- **Idle context cost**: ~108 tokens as published (*inference*).
- **Recommendation (proposed)**: reject.

---

## Proposed summary

| Proposal | Entries |
|---|---|
| **Adapt** (conditional on the open questions) | 7 `r3-reactive-extensions` (if the owner uses R3; needs a Unity delta), 8 `api-design` (merged with Addy's API skill; if libraries have outside consumers), 12 `csharp-nullable-reference-types` (authoring half, beside the official migration skill), 27 `roslyn-incremental-generator-specialist` re-filed as a skill (if the owner writes generators) |
| **Copy or idea-only, owner's call** | 16 `cscheck` (copy if the library is adopted; its oracle rules either way), 14 `dotnet-slopwatch` (rule list and baseline idea; the tool is Open question 3) |
| **Ideas for other tickets** | 1 (compare a list registry with a folder glob), 2 (tag equals manifest version; no repo-maintenance skills in a pack), 3 (closed allow-list of frontmatter keys), 4 ("run this check after that change" lines for the router), 5 (no symlinked steering files on Windows), 6 (state the checked version), 13 (the "do you need this at all" opening), 15 (CRAP ranking), 17 (public-API snapshot as a guard), 20 (CLI-not-XML rule), 29 (delegate-allocation checklist) |
| **Reject** | the plugin as a whole (1); 9, 10, 11, 18, 19, 20, 21, 22, 23, 24, 26 (20 skills); all of 25 (9 skills, 1 agent); agents 28, 29, 30; `marketplace-publishing` and `skills-index-snippets` (2, 4); `crap-analysis` and `snapshot-testing` as skills (15, 17); `aot-trimming` in favour of the official skill (13) |

Counting skills: 4 proposed for adaptation or copy (`r3-reactive-extensions`, `api-design`, `csharp-nullable-reference-types`, `cscheck`), 1 as ideas with an open tool decision (`dotnet-slopwatch`), 34 proposed rejected as skills (several leaving a one-line idea). Of the 6 agents, 1 is proposed for adaptation as a skill and 5 rejected.

**Holding under Unity's compiler** (all *inference*): fully, none. Partly: `r3-reactive-extensions` (the model; not the install or test packages), `api-design` (the rules; not the approval-test recipe), `csharp-nullable-reference-types` (file-level adoption and suppression discipline; not C# 11-14 features), `type-design-performance` (about half), `cscheck` (the test-design rules; the library unverified), the patterns behind `dotnet-slopwatch` (not the tool), the delegate-allocation section of `dotnet-performance-analyst`, and `roslyn-incremental-generator-specialist` (with Unity's incremental-generator support undocumented). Everything else is SDK-only.

## Not verified

- Nothing was executed: Slopwatch, ILSpy, CsCheck, R3, the validation scripts and the release workflow are described from the skill and script text. Slopwatch's source repository was not read; its behaviour, speed and false-positive rate are unknown, and so is whether it can scan a Unity project.
- R3's own README and Unity package were not read. Everything about R3 under Unity (install route, where `TimeProvider` comes from, player-loop providers, lifetime helpers) is inference from this skill's few Unity mentions and general knowledge. The skill's "validated against R3 1.3.1" claim was taken as stated; the current R3 version was not checked.
- All Unity-side verdicts are inference from the fork's "C# 9 on Roslyn" note and general knowledge of Unity's toolchain; no Unity documentation was read for this ledger. In particular: which of `ValueTask`, `Span<T>`, `System.Threading.Channels`, `TimeProvider` and the nullable attributes Unity's profile includes; whether `sealed` helps Mono or IL2CPP devirtualize; closure-allocation behaviour under IL2CPP; whether CsCheck or Verify load in Unity's test runner; and whether Unity's Code Coverage package emits OpenCover XML with complexity data (entry 15).
- That Claude Code lists plugin subagents' descriptions in every session, and what that costs, is inference; [loading-mechanics](../loading-mechanics.md) did not measure agents. The ~660-token figure applies the skill ratio to the agents' 1,634 description characters.
- Whether Claude Code names a plugin skill by its folder or by its frontmatter `name` when the two differ (15 skills here) was not checked.
- The two hook-reference facts in entry 14 (timeout unit, `PostToolUse` exit 2) were read from `https://code.claude.com/docs/en/hooks.md` on 2026-10-10; the hook itself was not run. Whether `slopwatch --hook` is silent on a clean edit is the skill's implication, not a tested fact.
- The Akka.NET, Aspire, EF Core, email, Playwright, Testcontainers, OpenTelemetry and container skills (entries 22-26) were read at outline level with selected sections, enough to place them outside the owner's stack, not to judge their technical accuracy. The C# skills, `slopwatch`, `cscheck`, `ilspy-decompile`, the R3 references and the agents were read in full or nearly so; the long reference files of entries 10, 12 and 13 were read at outline level.
- The skill count at `e426ed9` (37, against the sweep's 36) is inferred from the compare view's file list, not from a checkout of that commit.
- Whether the owner uses R3, CsCheck, Verify or BenchmarkDotNet, ships NuGet packages or precompiled DLLs, targets IL2CPP with their libraries, or writes source generators: unknown, raised as open questions.

[root]: https://github.com/Aaronontheweb/dotnet-skills/tree/46003affea00e602a0c2112375d6f0217e90962d
[s-akka-aspire-configuration]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/akka-aspire-configuration/SKILL.md
[s-akka-best-practices]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/akka-best-practices/SKILL.md
[s-akka-hosting-actor-patterns]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/akka-hosting-actor-patterns/SKILL.md
[s-akka-management]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/akka-management/SKILL.md
[s-akka-testing-patterns]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/akka-testing-patterns/SKILL.md
[s-aot-trimming]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aot-trimming/SKILL.md
[s-aspire-configuration]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aspire-configuration/SKILL.md
[s-aspire-integration-testing]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aspire-integration-testing/SKILL.md
[s-aspire-mailpit-integration]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aspire-mailpit-integration/SKILL.md
[s-aspire-service-defaults]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aspire-service-defaults/SKILL.md
[s-crap-analysis]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/crap-analysis/SKILL.md
[s-cscheck]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/cscheck/SKILL.md
[s-csharp-api-design]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md
[s-csharp-coding-standards]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-coding-standards/SKILL.md
[s-csharp-concurrency-patterns]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-concurrency-patterns/SKILL.md
[s-csharp-nullable-reference-types]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-nullable-reference-types/SKILL.md
[s-csharp-type-design-performance]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-type-design-performance/SKILL.md
[s-database-performance]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/database-performance/SKILL.md
[s-dotnet-devcert-trust]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/dotnet-devcert-trust/SKILL.md
[s-efcore-patterns]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/efcore-patterns/SKILL.md
[s-ilspy-decompile]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/ilspy-decompile/SKILL.md
[s-local-tools]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/local-tools/SKILL.md
[s-marketplace-publishing]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/marketplace-publishing/SKILL.md
[s-microsoft-extensions-configuration]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/microsoft-extensions-configuration/SKILL.md
[s-microsoft-extensions-dependency-injection]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/microsoft-extensions-dependency-injection/SKILL.md
[s-mjml-email-templates]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/mjml-email-templates/SKILL.md
[s-opentelementry-dotnet-instrumentation]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/opentelementry-dotnet-instrumentation/SKILL.md
[s-package-management]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/package-management/SKILL.md
[s-playwright-blazor]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/playwright-blazor/SKILL.md
[s-playwright-ci-caching]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/playwright-ci-caching/SKILL.md
[s-project-structure]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/project-structure/SKILL.md
[s-r3-reactive-extensions]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md
[s-sdk-container-publishing]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/sdk-container-publishing/SKILL.md
[s-serialization]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/serialization/SKILL.md
[s-skills-index-snippets]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/skills-index-snippets/SKILL.md
[s-slopwatch]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/slopwatch/SKILL.md
[s-snapshot-testing]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/snapshot-testing/SKILL.md
[s-testcontainers]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/testcontainers/SKILL.md
[s-verify-email-snapshots]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/verify-email-snapshots/SKILL.md
[a-akka-net-specialist]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/akka-net-specialist.md
[a-docfx-specialist]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/docfx-specialist.md
[a-dotnet-benchmark-designer]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/dotnet-benchmark-designer.md
[a-dotnet-concurrency-specialist]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/dotnet-concurrency-specialist.md
[a-dotnet-performance-analyst]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/dotnet-performance-analyst.md
[a-roslyn-incremental-generator-specialist]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md
[readme]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/README.md
[readme-snippets]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/README.md#L81-L134
[license]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/LICENSE
[agents-md]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/AGENTS.md
[agents-md-content]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/AGENTS.md#L98-L103
[plugin-claude]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/.claude-plugin/plugin.json
[mp-claude]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/.claude-plugin/marketplace.json
[plugin-codex]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/.codex-plugin/plugin.json
[mp-codex]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/.agents/plugins/marketplace.json
[release-yml]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/.github/workflows/release.yml
[skills]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills
[agents-dir]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents
[scripts-dir]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts
[sc-validate]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts/validate-marketplace.sh
[sc-validate-codex]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts/validate-codex-plugin.sh
[sc-bump]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts/bump-version.sh
[sc-summary]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts/generate-release-summary.sh
[sc-index]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/scripts/generate-skill-index-snippets.sh
[r3-evidence]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L41-L42
[r3-errors]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L131-L150
[r3-await]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L152-L167
[r3-concurrency]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L189-L214
[r3-frames]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L218-L237
[r3-dont]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/SKILL.md#L256-L263
[r3-sched]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/scheduling-and-concurrency.md
[r3-diff]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/rx-net-differences.md
[r3-async]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/r3-reactive-extensions/async-and-integration-patterns.md
[api-optional]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md#L104-L110
[api-approval]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md#L132-L173
[api-semver]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md#L296-L302
[api-checklist]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md#L323-L332
[api-anti]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-api-design/SKILL.md#L336-L376
[type-overboard]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-type-design-performance/SKILL.md#L154
[std-principles]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-coding-standards/SKILL.md#L26-L35
[std-result]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-coding-standards/SKILL.md#L212-L216
[std-dos]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-coding-standards/SKILL.md#L285-L296
[std-banned]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-coding-standards/SKILL.md#L220-L224
[conc-locks]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-concurrency-patterns/SKILL.md#L30-L34
[conc-tree]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-concurrency-patterns/SKILL.md#L38-L71
[nrt-reorg]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-nullable-reference-types/SKILL.md#L74-L96
[nrt-compat]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-nullable-reference-types/SKILL.md#L148-L159
[nrt-playbook]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/csharp-nullable-reference-types/nrt-migration-playbook-reference.md#L36-L92
[aot-notenemy]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aot-trimming/SKILL.md#L50-L52
[aot-select]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/aot-trimming/SKILL.md#L122-L134
[slop-when]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/slopwatch/SKILL.md#L8-L16
[slop-hook]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/slopwatch/SKILL.md#L138-L165
[slop-rules]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/slopwatch/SKILL.md#L210-L219
[slop-override]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/slopwatch/SKILL.md#L293-L308
[crap-formula]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/crap-analysis/SKILL.md#L19-L29
[cscheck-shape]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/cscheck/SKILL.md#L12-L23
[cscheck-contract]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/cscheck/SKILL.md#L25-L38
[cscheck-verify]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/cscheck/SKILL.md#L51-L60
[cscheck-baseline]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/cscheck/SKILL.md#L62-L68
[snap-init]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/snapshot-testing/SKILL.md#L44-L56
[ilspy-tools]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/ilspy-decompile/SKILL.md#L4
[pkg-golden]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/package-management/SKILL.md#L19-L38
[idx-goal]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/skills-index-snippets/SKILL.md#L17-L25
[perf-delegates]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/dotnet-performance-analyst.md#L62-L73
[perf-dispatch]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/dotnet-performance-analyst.md#L105-L114
[roslyn-principles]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md#L12-L18
[roslyn-cache]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md#L216-L223
[roslyn-anti]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md#L354-L372
[roslyn-setup]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md#L444-L458
[roslyn-outputs]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/agents/roslyn-incremental-generator-specialist.md#L479-L487
[container-facts]: https://github.com/Aaronontheweb/dotnet-skills/blob/46003affea00e602a0c2112375d6f0217e90962d/skills/sdk-container-publishing/SKILL.md#L45-L53
