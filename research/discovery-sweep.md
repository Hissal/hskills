# Discovery sweep: other sources that might earn a ledger

Research for [#13](https://github.com/Hissal/skill-collection/issues/13), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Swept on 2026-10-09. These are **pitches, not ledgers**. Every recommendation is **proposed**; ticket [#19](https://github.com/Hissal/skill-collection/issues/19) decides which sources earn a full ledger. Vocabulary follows `GLOSSARY.md`.

**Swept:**

- `hesreallyhim/awesome-claude-code` at [`794b2dc`](https://github.com/hesreallyhim/awesome-claude-code/tree/794b2dcaf3ee65aaded06a5150cbf8902b645031), all 228 rows of `THE_RESOURCES_TABLE_NEW.csv`.
- `VoltAgent/awesome-agent-skills` at [`8e70c97`](https://github.com/VoltAgent/awesome-agent-skills/tree/8e70c976525abe568c6d6698f555bf57218aac80).
- The official marketplace `anthropics/claude-plugins-official` at [`ac996c0`](https://github.com/anthropics/claude-plugins-official/tree/ac996c0dde7fb2a9f805cd5277ffc95ecd44a321): 315 marketplace entries plus its own `plugins/`.
- The skills.sh front-page leaderboard.
- `openai/skills` and `openai/plugins`.
- `gh search repos` for Unity, C# and Codex skill collections.

Every pitched repo was shallow-cloned into the session scratchpad and read. Nothing was installed or executed. Star counts and last-commit dates come from `gh api` on the sweep date.

**Excluded as already covered:** the fork, `mattpocock/skills`, pstack, Addy agent-skills, superpowers, `anthropics/skills`, karpathy-skills, caveman, vibe-wise, `davidondrej/skills` (#21), and the Unity/gamedev repos in #10/#11.

## Top recommendations (proposed)

1. **`dotnet/skills`** is the .NET team's official skills for the C# library pack, and it has eval machinery worth studying for maintenance.
2. **`Aaronontheweb/dotnet-skills`** has C# discipline skills (API compatibility, type design, slop detection, ILSpy, R3). Several of them also apply to Unity C#.
3. **The official marketplace's Anthropic-authored plugins:** `hookify`, `session-report`, `claude-md-management`, `pr-review-toolkit`, `plugin-dev`, `csharp-lsp`. #8 covers only `anthropics/skills`, so these are unledgered.
4. **`karanb192/claude-code-hooks`** has 22 single-purpose hook plugins, several aimed straight at the idle-context budget and at fake-green tests. Input for #14.
5. **`diet103/claude-code-infrastructure-showcase`** is a working `UserPromptSubmit` skill-suggestion hook driven by `skill-rules.json`. It is prior art for #15 (suggest user-invoked skills without loading them).
6. **`EveryInc/compound-engineering-plugin`** has a learnings loop (`ce-compound`/`-refresh`), measurement-first corpus retuning (`ce-retune`), and an install-manifest invariant relevant to #18.
7. **`getsentry/skills`**: `skill-scanner` (a security scan for vendored skills), `agents-md`, `claude-settings-audit`, `iterate-pr`.
8. **`agent-sh/agnix`** lints SKILL.md, CLAUDE.md, AGENTS.md and hooks across Claude Code and Codex, with a CI action. A maintenance candidate for #17.

A status line (`jarrodwatts/claude-hud` or `sirmalloc/ccstatusline`) is a quick install-only fix, not a ledger. See pitch 9.

## Pitches, ranked

### 1. `dotnet/skills`: C# library pack and eval machinery
[`3d38ac3`](https://github.com/dotnet/skills/tree/3d38ac343faf65054f7e8d45ca06925273e867e2) · 5.6k★ · last commit 2026-10-08 · MIT

- **What it ships:** 110 skills split into 17 area plugins (`dotnet`, `dotnet-test`, `dotnet-msbuild`, `dotnet-nuget`, `dotnet-upgrade`, `dotnet-diag`, …). There are marketplaces for Claude (`.claude-plugin/`) and Codex (`.agents/plugins/`).
- **Owner fit:** the per-area split already fits the "pack = plugin enabled per project" model for C# libraries. `csharp-expert`, `csharp-refactoring`, `test-anti-patterns`, `testability-obstacle`, `assertion-quality` and `microbenchmarking` may also suit Unity C#.
- **Maintenance value:** `eng/` holds a skill validator, `run-skill-evals.sh` and a public dashboard of token use and activation rates per skill. These are input for #17.
- **Caveat:** most MSBuild, SDK and test-platform skills assume the .NET SDK, not Unity's compiler.

### 2. `Aaronontheweb/dotnet-skills`: C# discipline, partly Unity-transferable
[`e426ed9`](https://github.com/Aaronontheweb/dotnet-skills/tree/e426ed93a9f3215cd21b277fdfa6bfccd3457945) · 1.2k★ · last commit 2026-09-17 · MIT · Claude and Codex plugin

- **What it ships:** 36 skills and 6 agents from the Akka.NET maintainer.
- **Candidates for the C# library pack:** `csharp-api-design` (extend-only design, wire/NuGet compatibility), `csharp-type-design-performance`, `csharp-coding-standards`, `dotnet-slopwatch` (catches disabled tests, suppressed warnings and empty catches), `ilspy-decompile`, and the `roslyn-incremental-generator-specialist` agent.
- **Unity relevance:** `r3-reactive-extensions` covers Cysharp's R3, which is used in Unity.
- **Caveat:** it ships as one plugin and most skills are model-invoked, so it would be cherry-picked with copy-with-provenance (`research/vendoring.md`), not installed whole. Akka and Aspire are about a third of it and irrelevant.

### 3. Anthropic-authored plugins in `claude-plugins-official/plugins/`
[`ac996c0`](https://github.com/anthropics/claude-plugins-official/tree/ac996c0dde7fb2a9f805cd5277ffc95ecd44a321/plugins) · 37.6k★ · last commit 2026-10-09

- **`hookify`:** guard rules written in markdown as `.local.md` files, enforced by generic Pre/PostToolUse, Stop and UserPromptSubmit hooks. It is silent unless a rule matches, which is the vibe-wise model.
- **`session-report`:** an HTML token, cache and skill-usage report from local transcripts. It could measure the idle budget.
- **`claude-md-management`:** a CLAUDE.md audit skill.
- **`pr-review-toolkit`:** agents such as `silent-failure-hunter` and `type-design-analyzer`.
- **`plugin-dev`:** `plugin-validator` and `skill-reviewer` agents.
- **`csharp-lsp`:** a C# language server plugin.
- **Fit:** first-party and Claude-only. Mostly install-as-is or ideas, and #8 does not cover them.

### 4. `karanb192/claude-code-hooks`: hook plugins for #14
[`3c9c90a`](https://github.com/karanb192/claude-code-hooks/tree/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f) · 533★ · last commit 2026-10-04 · MIT · Node, with tests

- **What it ships:** 22 one-hook plugins, each separately installable.
- **Relevant to the owner:**
  - `protect-tests` blocks deleting tests or adding skip markers to make a suite pass.
  - `git-safety` blocks destructive git and gh operations on protected branches.
  - `context-hogs` attributes tokens per file.
  - `dead-rules-audit` tracks how often each CLAUDE.md rule is relevant and whether it was followed.
  - `cache-tax` warns before a cold-cache resend.
  - `dead-end-registry` keeps a per-repo record of approaches that were tried and reverted.
- **Caveats:** young and small, Claude-only. Read each hook's output cost before adopting.

### 5. `diet103/claude-code-infrastructure-showcase`: skill-suggestion hook for #15
[`07f75ce`](https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50) · 10k★ · last commit 2026-07-12 · MIT

- **What it is:** `skill-activation-prompt` (a UserPromptSubmit hook) matches the prompt and the files in play against `.claude/skills/skill-rules.json`, then injects skill suggestions.
- **Why it matters here:** it is a working instance of the gating mechanism `research/loading-mechanics.md` proposes (suggest a user-invoked skill at zero idle cost). It also has a `skill-verification-guard` and a build-check Stop hook.
- **Caveats:** a showcase, not a product. Stale for three months, TypeScript-heavy, with optional embeddings and Gemini.

### 6. `EveryInc/compound-engineering-plugin`: learnings loop and measured retuning
[`67035e9`](https://github.com/EveryInc/compound-engineering-plugin/tree/67035e931c5cb26e80f198a7019a4502a9788273) · 25.4k★ · last commit 2026-10-07 · MIT

- **What it ships:** 43 skills and about 48 specialist prompts, published for Claude, Codex and other targets.
- **Ideas worth taking:**
  - `ce-compound` and `ce-compound-refresh`: capture non-obvious lessons as repo learnings and audit them for drift.
  - `ce-retune` (user-invoked): retune a skill corpus for a new model against a noise floor and a bar set before the run.
  - The install-manifest rule in `CONCEPTS.md`: "a Writer never claims a path it did not write", so user-replaced symlinks survive a reinstall. That is direct input for #18.
- **Caveat:** its brainstorm → plan → work chain competes with the fork's flow, as superpowers' does. Ideas only, most likely.

### 7. `getsentry/skills`: skill security scan and agent-doc upkeep
[`d18b7aa`](https://github.com/getsentry/skills/tree/d18b7aa8ba878354e5c348310230e652f7690f9c) · 1.0k★ · last commit 2026-09-29 · Apache-2.0

- **What it ships:** 27 skills.
- **Candidates:**
  - `skill-scanner` security-scans agent skills, which fits vendoring third-party skills.
  - `skill-writer`.
  - `agents-md` keeps AGENTS.md and CLAUDE.md concise.
  - `claude-settings-audit` proposes read-only permission allowlists.
  - `iterate-pr` loops until CI is green and review feedback is addressed.
  - `find-bugs`.
- **Caveat:** the rest (Django, SR&ED, brand) is Sentry-internal.

### 8. `agent-sh/agnix`: agent-config linter
[`004b7ea`](https://github.com/agent-sh/agnix/tree/004b7ea143de549c13e89614fd73be0497abbdd0) · 445★ · last commit 2026-10-09 · MIT/Apache-2.0

- **What it is:** a Rust CLI, LSP and GitHub Action with about 455 rules across Claude Code, Codex, Cursor and others. It validates SKILL.md frontmatter, CLAUDE.md/AGENTS.md and hook configs, with autofix.
- **Fit:** a CI check for the collection itself under #17. It costs nothing in-session.
- **Caveats:** young and fast-moving. Verify the rules against `loading-mechanics.md` facts before trusting them.

### 9. Status line: `jarrodwatts/claude-hud` or `sirmalloc/ccstatusline` (install, not ledger)
- **Repos:**
  - `jarrodwatts/claude-hud` at [`33b51db`](https://github.com/jarrodwatts/claude-hud/tree/33b51db6ceb5d0c91dc9c22404abcabacc8603b0) · 28.4k★ · last commit 2026-10-01 · a Claude plugin.
  - `sirmalloc/ccstatusline` at [`7f31041`](https://github.com/sirmalloc/ccstatusline/tree/7f31041046c59383d0ae56f3121a94cd420d443f) · 13.2k★ · last commit 2026-10-09 · an npx CLI.
- **Why now:** the owner's `statusLine` still points into the disabled caveman cache (map #1, "Migrating the current setup").
- **Cost:** a status line never enters model context. The HUD shows context use live, which serves the idle-budget goal. Pick one in the migration step. No ledger needed.

### 10. `trailofbits/skills`: ideas only (licence)
[`82fe822`](https://github.com/trailofbits/skills/tree/82fe8226252622fa807643bdca1710901198553a) · 7.4k★ · last commit 2026-09-28 · **CC-BY-SA-4.0**

- **Interesting pieces:**
  - `second-opinion` gets a cross-harness review from Codex.
  - `property-based-testing` and `mutation-testing`.
  - `sharp-edges` hunts footgun APIs, useful for C# library design.
  - `differential-review` computes blast radius by counting callers.
- **Caveat:** share-alike makes adapted copies inherit CC-BY-SA, and most of the repo is security-audit work. Ideas only.

### 11. `nizos/tdd-guard`: TDD enforcement hook
[`7245912`](https://github.com/nizos/tdd-guard/tree/7245912d8a368296b0cf161bc183d8ca0d8d03f5) · 2.4k★ · last commit 2026-10-05 · MIT

- **What it is:** a hook that blocks implementation edits without a failing test. It works on Claude Code, Codex and Copilot CLI, and it has a `reporters/dotnet` test reporter.
- **Fit:** it could back the fork's `tdd` skill mechanically for C# libraries.
- **Caveats:** it validates each edit with a model call, which costs latency and tokens, and it has no Unity Test Runner reporter.

### 12. `openai/plugins`: the Codex-side counterpart
[`0722921`](https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a) · 7.4k★ · last commit 2026-10-08

- **`plugin-eval`:** a Node CLI plus skills that score a skill or plugin, explain its token budget and measure real usage. It is the Codex peer of `claude plugin eval`, for #17.
- **`game-studio`:** web-game skills such as Phaser, three.js, playtesting and a sprite pipeline. Worth one line in #11's gamedev ledger.
- **Caveat:** most other plugins are SaaS connectors.

### 13. Web pack sources (low priority; web is the owner's third domain)
- **Repos:**
  - `vercel-labs/agent-skills` at [`063bee9`](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278) · 32k★: `react-best-practices`, `composition-patterns`, `web-design-guidelines`.
  - `pbakaus/impeccable` at [`d631a88`](https://github.com/pbakaus/impeccable/tree/d631a8827f99414d2b6daba4ef08b7f8701751d7) · 79k★ · Apache-2.0: one design-language skill.
  - `emilkowalski/skills` at [`e8a175d`](https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d) · 45k★ · MIT: animation and UI polish.
- **Fit:** all three top skills.sh and fit a web pack only. A single combined ledger would do, if any.

### 14. `Neeeophytee/finding-unknowns-skills`: overlaps the fork
[`ca5696a`](https://github.com/Neeeophytee/finding-unknowns-skills/tree/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc) · 342★ · last commit 2026-09-28 · MIT

- **What it ships:** 14 skills distilled, with attribution, from Claude Code team essays. Examples: `blindspot-pass`, `interview-me`, `reference-hunt`, `context-audit`, `progressive-disclosure`.
- **Overlap:** large with the fork's grilling and prototype skills. Worth only a skim for `context-audit` and `reference-hunt`.

## Considered and skipped

- **`affaan-m/ECC`** (276k★): a kitchen-sink harness with always-on "instincts" and memory. It runs against the idle-budget principle.
- **`garrytan/gstack`** (136k★), **SuperClaude**, **ccpm**, **claude-codepro**: persona or project-management workflow chains that compete with the fork's flow.
- **`wshobson/agents`** (92 plugins): generic personas. Its `unity-developer` agent and `unity-ecs-patterns` skill are thin next to the fork and the Unity baseline.
- **`Jeffallan/claude-skills`** (67 full-stack skills): generic, mostly model-invoked, no C#/Unity depth.
- **`NeoLabHQ/context-engineering-kit`**: GPL-3.0 blocks adaptation. Its `reflexion`/`sdd` ideas are covered elsewhere.
- **`microsoft/skills`**: Azure SDK skills, not the owner's stack.
- **`openai/skills`**: deprecated in its README (pointing to `openai/plugins`); last commit 2026-06-24.
- **`disler/claude-code-hooks-mastery`**: last push 2026-03. Superseded by pitch 4 and the docs.
- **`CoplayDev/unity-mcp`** (14.8k★): an MCP bridge, not skills. The Unity baseline's `unity mcp` already covers the route. For the Unity tickets if anywhere.
- **Memory plugins** (`claude-remember`, `claude-mnemonic`, MAMA and others): always-on injection with unclear payback.
- **Ralph-loop variants** (the official `ralph-loop`, `frankbria/ralph-claude-code`): autonomous loops, outside the owner's HITL decision style.
- **`pchalasani/claude-code-tools`**: session-continuity tooling built on Python/Rust CLIs, not skills. A tool to install if wanted.
- **`composio-community/awesome-codex-skills`** and the Codex search results: mostly content-generation skills, no engineering collections beyond those above.
- **Observability dashboards and menu-bar apps** (ccusage, cctop and others): personal tooling, nothing for the collection.
