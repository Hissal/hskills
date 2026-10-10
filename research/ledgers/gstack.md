# Ledger: garrytan/gstack

Ticket: [Ledger: garrytan/gstack](https://github.com/Hissal/skill-collection/issues/23), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `garrytan/gstack`, read at commit [`20eb620`][root] (committed 2026-10-09, `v1.91.68.0`). That was still `main`'s HEAD when read on 2026-10-10 (`gh api repos/garrytan/gstack/commits/main`), so no re-pin was needed. Read from a shallow clone in the OS temp directory. Nothing from the source was installed or executed. Every source link below is pinned to that SHA. Fork references point at the [fork ledger](mattpocock-skills-unity.md) (fork @ `3d926c6`).

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Scope, as the ticket sets it.** Mechanisms first. The mechanisms and the standalone skills get full entries (1 to 18). The persona and workflow chain is collapsed into entry 19 and the suite's own plumbing into entry 20; those skills were read at frontmatter level only, except where an entry says otherwise.

**Idle cost method.** Description characters were measured from each generated `SKILL.md` frontmatter by a script. Tokens are estimated at 2.6 chars/token plus ~5 for the name, the method the [davidondrej ledger](davidondrej-skills.md) used, taken from the ratio [loading-mechanics §6](../loading-mechanics.md) measured. This is an estimate (inference), not a `claude plugin details` measurement. The source's own figures are quoted beside it where it publishes them.

## Overview

**What the source is.** Garry Tan's "AI engineering workflow": a suite of role-playing workflow skills (CEO reviewer, eng manager, designer, QA lead, release engineer) plus a compiled headless-browser toolchain, a state directory (`~/.gstack/`), 115 helper scripts and binaries in [`bin/`][bin], and a very large test and eval suite. MIT ([LICENSE][license]); some design material is derived from Apache-2.0 `pbakaus/impeccable` and listed in [NOTICE.md][notice]. GitHub shows ~136k stars and ~20k forks (`gh api repos/garrytan/gstack`, 2026-10-10). It is installed by cloning into `~/.claude/skills/gstack` and running a 4,662-line bash [`setup`][setup] that needs Bun (and Node on Windows) and builds binaries ([README L47][readme-req], [L55][readme-install]).

**What it ships** (counted from the tree at `20eb620`):

| Part | Count | Where |
|---|---|---|
| Skills rendered for Claude | 56: 55 skill folders plus the root router `gstack`. A 57th template, `claude-code`, renders only for non-Claude hosts | each `<skill>/SKILL.md.tmpl` → committed `<skill>/SKILL.md` |
| Model-invoked | All 56. No Claude render sets `disable-model-invocation`. Six templates carry `sensitive: true` (`careful`, `freeze`, `guard`, `unfreeze`, `ship`, `land-and-deploy`), which adds the flag on the Factory and Copilot hosts only ([hosts/copilot.ts][host-copilot]); the Claude host strips the field ([hosts/claude.ts L11-L22][host-claude-fm]) | per-skill frontmatter |
| Codex gating | One `agents/openai.yaml` with `allow_implicit_invocation: true` ([agents/openai.yaml][openai-yaml]) | generated |
| Host configs | 12: claude, codex, factory, kiro, opencode, slate, cursor, openclaw, hermes, gbrain, copilot, agy ([hosts/index.ts L23][hosts-index]) | [`hosts/`][hosts] |
| Model overlays | 11 files | [`model-overlays/`][overlays] |
| Hooks | 2 skill-scoped hook scripts (`check-careful.sh`, `check-freeze.sh`) and 5 settings-level hooks under [`hosts/claude/hooks/`][claude-hooks] that `setup` can register in `~/.claude/settings.json` | see entries 6, 7 |
| Tests | 1,008 `test/*.test.ts` files, 98 of them `skill-e2e-*` (file count by `ls`) | [`test/`][test] |
| CI | 26 workflows | [`.github/workflows/`][workflows] |

**Idle cost if installed as published (Claude Code).**

- **Skill listing: about 1.9k tokens** for the 56 descriptions (4,180 description characters; ~1.0k at chars/4). The source measures the same surface itself and caps it in CI: the sum of every skill's `name` + `description` must stay under **1,194 token-equivalents** at bytes/4, with a 260-byte cap per skill ([test/catalog-budget.test.ts L42-L46][catalog-budget]). Per-skill average is ~34 tokens, low because of the catalog trim (entry 2).
- **The source's "always-on" ledger says 7,273 tokens** ([context-budget.json L3][ctx-budget]), but that counts each skill's *whole* frontmatter (`allowed-tools`, `triggers`, `hooks`) ([lib/context-bill.ts L1-L10][context-bill]). Claude Code lists only name, description and `when_to_use` ([loading-mechanics §1](../loading-mechanics.md)), so on Claude the 1.9k figure is the better estimate and 7.3k is an upper bound (inference).
- **Steering text the install asks for.** The README's install prompt tells the agent to add a "gstack" section to `CLAUDE.md` listing 38 skills and banning `mcp__claude-in-chrome__*` ([README L55][readme-install]), and the first skill run offers to append a 12-rule "Skill routing" section to the project `CLAUDE.md` and commit it ([bin/gstack-skill-start L494-L526][routing-injection]). Together roughly 300 to 400 always-on tokens (inference from the text length).
- **Settings hooks.** `setup` registers a `Stop` hook by default ([setup L4385][setup-stop]), offers `PreToolUse` + `PostToolUse` hooks on `AskUserQuestion` for question tuning ([setup L4135-L4140][setup-plantune]), and in team mode a `SessionStart` auto-update hook ([setup L3950-L3956][setup-session]). Hook definitions cost no context; only their output does ([loading-mechanics §4](../loading-mechanics.md)). What these hooks print was not read in full.
- **On invocation**, the source's own fixture puts each skill at 0.5k tokens (`unfreeze`) to 34.7k (`design-review`); `investigate` is 12.1k, `review` 19.3k, `retro` 18.7k ([context-budget.json][ctx-budget]). Much of that is the shared preamble (entry 5).

**Fit to the owner, in one line.** No skill mentions Unity or C#. The suite is built for web/SaaS product teams (PRs, deploys, browser QA, design, iOS). It does support Windows through Git Bash ([setup.ps1][setup-ps1]), and its hook scripts match PowerShell commands, which is rare among the sources read so far.

**Standout candidates (proposed):**

- **Catalog trim + budget ratchet** (entry 2): descriptions cut to one lead sentence at build time, the "use when" text moved into the body, and CI tests that fail when the listing or any skill's load size grows. The closest thing in any source to the map's tripwires (#14) as an enforced check.
- **`careful`'s PowerShell rule table and two-tier decision** (entry 6): a `PreToolUse` guard that matches both `Bash` and `PowerShell` tools, denies two catastrophic shapes and *asks* on the rest, with 93 hook tests. Direct input for the Windows port the [davidondrej ledger](davidondrej-skills.md) entry 2 says the core command guard needs.
- **`freeze` as a session-scoped edit boundary** (entry 6): a skill whose frontmatter hooks only exist after the user invokes it, fail-closed, with an owner token so `investigate` can take and release the lock. Zero idle cost as a user-invoked skill.
- **The test value bar** (entries 10, 14): an authoring gate of four questions for every new test, a *retention bar* for what must never be deleted, and the "prompt-byte contract" rule for testing skill text (pin machine-read tokens, never English sentences).
- **`context-save`'s provenance markers** (entry 11): every remaining-work item is marked `(path run)`, `(path read)` or `(path assumed)`. One table that upgrades any handoff.
- **`deslop-shared-libs`** (entry 17): a strictly read-only audit for shared-code extractions with a "prove two real callers, count lines removed and added" rubric. Fits the owner's C# library work.

**Biggest open questions:**

1. **Templates or hand-written skills?** gstack generates every `SKILL.md` from a template for 12 hosts. The owner has two harnesses and the fork hand-writes one `SKILL.md` plus an `agents/openai.yaml`. Is any build step wanted, or only the *checks* gstack attaches to its build (freshness, budget, Codex 1,024-char limit)? (Entries 1, 2.)
2. **Trimmed descriptions versus routing text.** gstack's trim moved trigger phrases out of the listing, then compensates with an always-on routing section in `CLAUDE.md` and a router skill. The owner's decision in #14 was no skills-first nudge. Does the owner want lead-sentence-only descriptions *without* the compensating routing text, and is triggering good enough that way? Needs a trigger eval, not a guess.
3. **Session-scoped guards on Codex.** Skill-frontmatter hooks are Claude-only ([loading-mechanics §4](../loading-mechanics.md)); gstack marks them "advisory" on Codex ([hosts/codex.ts][host-codex]). Is a Claude-only `freeze` acceptable?
4. **A persistent learnings store.** gstack keeps per-project JSONL learnings outside the repo and reads them back in later sessions. The fork keeps knowledge in repo files (`GLOSSARY.md`, ADRs, steering files via `retro`). Does the owner want any machine-local memory at all? (Entry 9.)
5. **Cross-model review**, again: `codex` joins davidondrej's `codex-subagent`/`total-review`, Addy's `doubt-driven-development` and pstack's `interrogate` in the same theme (entry 12).

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Every skill is a build artifact wired to the suite | Generated files start `<!-- AUTO-GENERATED from SKILL.md.tmpl -->`; bodies call `~/.claude/skills/gstack/bin/gstack-*` helpers and hardcode that install path, including in hook commands ([careful/SKILL.md L12-L23][careful-hooks]) | No skill runs if copied alone. Copying means rewriting the body, not trimming it |
| The preamble | Most skills open with `{{PREAMBLE}}`: update check, session tracking, telemetry, question format, learnings ([preamble.ts L57-L66][preamble-tiers]) | Thousands of tokens of suite plumbing per invocation that the owner would strip |
| Local analytics and state | Even the preamble-free skills append a line to `~/.gstack/analytics/skill-usage.jsonl` on every run ([careful/SKILL.md][careful]); remote telemetry is opt-in and off by default ([README L668-L683][readme-telemetry]) | Any copy must remove the state writes |
| Bun + compiled binaries | `setup` requires Bun ≥ 1.4.2, Node on Windows, builds browser/PDF/design binaries ([README L47][readme-req]) | The toolchain is far heavier than a skills repo; nothing here justifies installing it |
| Personas and tone | "You are a **Staff Engineer who owns the CI dashboard**" ([health L29][health]); Codex is described as "the '200 IQ autistic developer'" ([codex/SKILL.md.tmpl][codex]) | Conflicts with the fork's plain `writing-for-agents` style; rewrite on adoption |
| Nonstandard frontmatter | `preamble-tier`, `version`, `triggers`, `gbrain`, `voice-triggers`, `sensitive` on every template. Neither harness documents these keys ([loading-mechanics §1](../loading-mechanics.md)) | Inference: inert on Claude and Codex (read by the generator and gstack's own tools). Drop when copying |
| Pinned model names | `gpt-6-astra` default ([codex L72][codex]), `claude-fable-5-1` judge ([ARCHITECTURE L405-L416][arch-tiers]), per-model overlay files | Rots; the source runs a "model-policy-freshness" CI job to chase it |

### Index: every skill and mechanism to its entry

| Entry | Skills / mechanisms |
|---|---|
| 1 | `SKILL.md.tmpl` generation, `hosts/`, `gen-skill-docs.ts`, resolvers, freshness CI, `claude-code` (non-Claude render) |
| 2 | catalog trim, catalog budget test, context-budget ratchet, `gstack-context-bill` |
| 3 | lazy `sections/` ("carve") |
| 4 | `model-overlays/` |
| 5 | preamble tiers, `gstack-skill-start` |
| 6 | `careful`, `freeze`, `guard`, `unfreeze`, hook scripts and their tests |
| 7 | `setup`, `gstack-settings-hook`, settings-level hooks, routing injection, team mode, `gstack-upgrade`, root router `gstack` |
| 8 | `plan-tune`, question registry, one-way doors, question hooks |
| 9 | learnings store, `learn` |
| 10 | test and eval suite, test value bar doc |
| 11 | `context-save`, `context-restore` |
| 12 | `codex` (and `claude-code`) |
| 13 | `benchmark-models` |
| 14 | `test-audit` |
| 15 | `health` |
| 16 | `investigate` |
| 17 | `deslop-shared-libs` |
| 18 | `retro` |
| 19 | `office-hours`, `plan-ceo-review`, `plan-eng-review`, `plan-design-review`, `plan-devex-review`, `autoplan`, `spec`, `review`, `ship`, `land-and-deploy`, `landing-report`, `setup-deploy`, `canary`, `document-release`, `document-generate`, `qa`, `qa-only`, `devex-review`, `cso`, `design-consultation`, `design-shotgun`, `design-html`, `design-review`, `ios-qa`, `ios-fix`, `ios-design-review`, `ios-sync`, `ios-clean`, `browse`, `open-gstack-browser`, `setup-browser-cookies`, `scrape`, `skillify`, `benchmark`, `pair-agent`, `make-pdf`, `diagram` |
| 20 | `setup-gbrain`, `sync-gbrain`, gbrain resolvers, `openclaw/` native skills, `browser-skills/` |

---

## Mechanisms

### 1. Per-host generation: `SKILL.md.tmpl` → `SKILL.md` (`hosts/`, `gen-skill-docs.ts`)

- **What it is.** Every skill is written once as `SKILL.md.tmpl` (prose plus `{{PLACEHOLDER}}` tokens) and rendered by [`scripts/gen-skill-docs.ts`][gen] into a committed `SKILL.md` ([ARCHITECTURE L314-L403][arch-tmpl]). Placeholders are filled by ~35 *resolver* modules, some from source code (a browser command table from `commands.ts`), most from shared prose (the same test rubric injected into five skills). A host is one small typed config: [`defineHost()`][define-host] supplies defaults, and each host overrides paths, a frontmatter allowlist or denylist, a description limit, literal path rewrites, tool-name rewrites, suppressed resolvers and skipped skills. Codex's config keeps only `name` + `description`, **errors** when a description exceeds 1,024 chars, rewrites `~/.claude/skills/gstack` → `$GSTACK_ROOT` and `CLAUDE.md` → `AGENTS.md`, and emits `agents/openai.yaml` ([hosts/codex.ts L14-L40][host-codex-fm]). Claude output is committed; other hosts' output is gitignored and rendered at install. CI regenerates all hosts and fails on any diff or stray untracked file ([skill-docs.yml][wf-skill-docs]). Merge conflicts on generated files are resolved only in the template, then regenerated ([CLAUDE.md L114-L160][claude-md-skill]).
- **Kind**: script + CI-eval + manifest-packaging.
- **Proposed address**: idea-only input to the install-architecture and maintenance (#17) tickets.
- **Why it could fit.** The owner targets two harnesses. Three of this mechanism's pieces answer real problems the other ledgers raised: a build-time **error on Codex's 1,024-char description limit**; **one source for shared prose** injected into several skills (the fork repeats rules across `unity-*` skills by hand, inference); and the "why committed, not generated at runtime" argument (the file must exist at load, CI can check freshness, `git blame` works, [ARCHITECTURE L397-L403][arch-committed]).
- **Why it might not.** The owner's skills are short and hand-written, and the fork already ships the same `SKILL.md` to both harnesses plus an `openai.yaml` ([fork ledger](mattpocock-skills-unity.md), `agents/openai.yaml` entry). gstack needs generation because its Claude text is full of Claude tool names and `~/.claude` paths that must be rewritten for 11 other hosts; skills written host-neutrally from the start don't need it (the conclusion of [unity-workflow ledger](unity-workflow-repos.md) D10). A build step also breaks "edit the file, it's live" and makes every vendored skill a two-file change. The generator is 1,170 lines plus 15k lines of resolvers, written for Bun.
- **Copy / adapt / idea-only**: idea-only. It can't be copied because the generator, resolvers and host configs encode gstack's own paths and prose. The liftable parts are checks: a description-length lint per harness, and a "generated or duplicated blocks are in sync" test if the collection ever shares prose between skills.
- **Overlap**: fork `agents/openai.yaml` convention; [unity-workflow ledger](unity-workflow-repos.md) D10 (canonical host-neutral skills + per-skill `openai.yaml` + validator); Addy's shared-references portability problem ([addy ledger](addy-agent-skills.md) entry 4); [loading-mechanics](../loading-mechanics.md) (one repo serves Claude and Codex as plugins).
- **Idle context cost**: n/a (build time).
- **Recommendation (proposed)**: reject the generator. Carry "lint Codex's 1,024-char description limit" and "if prose is ever shared between skills, generate it and gate freshness in CI" into #17.

### 2. Catalog trim, catalog budget and the context-budget ratchet

- **What it is.** Three linked pieces that police idle cost. (a) **Catalog trim**: at generation time, each Claude description is split into its lead sentence, which stays in frontmatter, and the "use when…" routing prose, which moves into a `## When to invoke this skill` section at the top of the body ([gen-skill-docs.ts L265-L277][gen-trim], [L405][gen-trim-fn]). The template for `careful` has a five-line description; the rendered frontmatter says only "Safety guardrails for destructive commands. (gstack)" ([careful/SKILL.md.tmpl][careful-tmpl] vs [careful/SKILL.md][careful]). (b) **Catalog budget**: a test sums `name` + `description` bytes over all skills and fails above 1,194 token-equivalents, with a 260-byte per-skill cap ("A description that needs more than 260 bytes is a body paragraph, not a catalog entry") and a written *ratchet protocol*: adding a skill raises the ceiling by exactly its size, in the same commit, with the derivation in a comment ([catalog-budget.test.ts L18-L53][catalog-budget-doc]). (c) **Context-budget ratchet**: a fixture holds a ceiling for the whole-frontmatter total and for each skill's per-invocation "eager" tokens; growth fails CI until the fixture is refreshed in the same commit, "so the change is a visible decision in the diff" ([CONTRIBUTING L422-L423][contrib-budget], [context-budget.json][ctx-budget]). The measuring tool, [`gstack-context-bill`][context-bill], is offline and read-only, estimates tokens from bytes with per-file-class divisors fitted to real `count_tokens` measurements (SKILL.md bodies ~4.2 bytes/token, reference files 2.4 to 4.7), and prints its error band.
- **Kind**: script + CI-eval + convention doc.
- **Proposed address**: the budget test as maintenance machinery (#17); the trim as idea-only for the skill-writing theme.
- **Why it could fit.** The map calls idle context a budget and #14 set tripwires (500 / 1,000 / 1,000 tokens). This is a working implementation of a tripwire: a number in a test, a failure message that tells the author what to do, and a rule that raising it is a reviewed diff. The per-skill byte cap is a cheap lint that would have caught most oversized descriptions in the other ledgers. The ratchet's "re-derive it, do not trust the number" comment style is good practice for any budget constant.
- **Why it might not.** The trim removes trigger phrases from the listing, which is what the model matches on. gstack compensates with always-on routing text and a router skill (entry 7), a nudge #14 already declined. A lead sentence alone may under-trigger; [anthropic-skills ledger](anthropic-skills.md) argues the opposite ("pushy descriptions"), and the fork's `writing-for-agents` sits between. gstack's own history records a bug where the split silently dropped routing prose ([catalog-trim.test.ts][catalog-trim-test]). The token divisors are fitted to one older tokenizer; the tool says to use exact counting on newer models.
- **Copy / adapt / idea-only**: adapt the budget test (a small script: parse frontmatter, sum, compare to the tripwire per layer, print the protocol). It can't be copied directly because it imports gstack's skill census and counts gstack's tree. The trim is idea-only.
- **Overlap**: #14 tripwires; Addy's structural lint ([addy ledger](addy-agent-skills.md) entry 8); anthropic's description optimiser ([anthropic-skills ledger](anthropic-skills.md) entry 8); B7's "restatement budget" ([unity-workflow ledger](unity-workflow-repos.md)); `claude plugin details` as the exact measure ([loading-mechanics §6](../loading-mechanics.md)).
- **Idle context cost**: n/a. Its effect on the source: ~1.9k idle tokens for 56 skills (~34 each), against ~60 per skill in the fork.
- **Recommendation (proposed)**: adapt the budget test with the ratchet protocol as the enforcement of #14's tripwires. Put "lead-sentence-only descriptions" to the skill-writing theme as a question to settle with a trigger eval.

### 3. Lazy sections ("carve")

- **What it is.** Long skills are split into a skeleton `SKILL.md` plus `sections/<id>.md` files listed in a `manifest.json` (id, file, title, trigger text). In the template, `{{SECTION_INDEX:skill}}` renders a situation → section table and `{{SECTION:id}}` renders a "STOP, Read this file" pointer on Claude, but **inlines** the section on hosts where relative reads are unreliable ([sections.ts L1-L17][sections]). `codex` uses it for its three mutually exclusive modes: "read ONLY that mode's section… never read the other two" ([codex/SKILL.md.tmpl L180-L182][codex-modes]). 21 skills have a `sections/` folder. Tests guard completeness, ordering and that a section is actually read before its step runs (`carve-*` tests in [`test/`][test]).
- **Kind**: convention + script.
- **Proposed address**: idea-only for the skill-writing theme.
- **Why it could fit.** It is plain progressive disclosure with two refinements worth keeping: a manifest that is the single source for the section table, and an explicit "modes are mutually exclusive, read one" instruction. #22 already decided a router may Read a leaf by relative path "if it says 'read the file'".
- **Why it might not.** Nothing new beyond references folders, which the fork and Anthropic's guidance already use. gstack needs it because single skills reach 136 KB; the owner's don't. The source's own 160 KB ceiling ("Hosts read at most this many UTF-8 bytes of one SKILL.md", [sections.ts L32-L33][sections-ceiling]) was not checked against harness docs.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [lazy-loading research](../lazy-loading.md) (#22); fork `unity` router; superpowers and anthropic progressive-disclosure guidance.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject as a mechanism; offer "mutually exclusive modes each get their own reference file, and the skill says read exactly one" as a line for `writing-for-agents`.

### 4. `model-overlays/`

- **What it is.** Eleven small Markdown files of per-model behavioural nudges ([`model-overlays/`][overlays]). A file may start with `{{INHERIT:claude}}` to build on a base ([model-overlay.ts L1-L17][overlay-resolver]). The generator pastes the overlay for the host's default model into every skill's preamble under a heading that makes it *subordinate*: "If a nudge below conflicts with skill instructions, the skill wins. Treat these as preferences, not rules" ([L60-L63][overlay-sub]). Contents: `claude.md` has three rules (mark todos one at a time, state the approach before heavy actions, prefer dedicated tools over shell); `opus-4-8.md` adds effort-matching, one-question-per-turn pacing and "interprets instructions literally"; `fable-5.md` adds "act when you have enough to act", "ground progress claims in evidence", "assessment vs action"; `gpt.md` pushes completion and no preamble ([claude.md][overlay-claude], [opus-4-8.md][overlay-opus], [fable-5.md][overlay-fable], [gpt.md][overlay-gpt]). A benchmark contract doc exists for measuring overlays ([OVERLAY_BENCHMARK_CONTRACT.md][overlay-bench], not read).
- **Kind**: convention doc (build-time prompt fragments).
- **Proposed address**: idea-only input to always-on text (#14) and to the Codex-side `AGENTS.md`.
- **Why it could fit.** The owner runs two model families. #14 decided the core always-on text is one source copied to `CLAUDE.md` and `AGENTS.md`; overlays are the pattern for the few lines that should *differ* per harness (for example a "finish the task, don't stop at a list" nudge that suits one family and not the other). The subordination wrapper is a good guard for any such text.
- **Why it might not.** Overlays are baked in at build time per *host default*, not per the model actually running, so they are wrong whenever the user switches model (the source says to re-run setup after changing the Codex model, [CLAUDE.md L126-L134][claude-md-skill]). Files named after model versions rot quickly: there are two near-identical Opus files. Several nudges restate what the harness system prompt already says (inference from this session's own instructions about dedicated tools and todo discipline). They are injected into every skill, so they are paid on every invocation.
- **Copy / adapt / idea-only**: idea-only. Without the generator there is nowhere to paste them.
- **Overlap**: #14 (core text = one source for both harnesses); karpathy-skills' CLAUDE.md and davidondrej's global `AGENTS.md` ([installed-plugins ledger](installed-plugins.md), [davidondrej ledger](davidondrej-skills.md) entry 1).
- **Idle context cost**: 0 idle as built; ~150 to 600 tokens per skill invocation (inference from file sizes).
- **Recommendation (proposed)**: reject the mechanism. Offer "ground progress claims in a tool result from this session" and "when the user is describing a problem, the deliverable is an assessment; don't apply a fix until asked" as candidate one-liners for #14's admission gate.

### 5. Preamble tiers and `gstack-skill-start`

- **What it is.** Most templates declare `preamble-tier: 1-4`, and `{{PREAMBLE}}` expands to a tier-sized startup block ([preamble.ts L57-L66][preamble-tiers], [L78-L113][preamble-compose]). Tier 1: one bash fence that runs [`bin/gstack-skill-start`][skill-start] and prints `KEY: value` STATUS lines the prose branches on, plus upgrade check, model overlay, a trimmed voice rule and completion status. Tier 2 adds the question format, context recovery, writing style, a "completeness" principle, a confusion protocol, an evidence directive, context health and question tuning. Tier 3 adds repo-mode and "search before building". Tier 4 equals 3. Missing tier is a build error. Since v1.71 the runtime script replaced "~18KB of inline bash per tier-2+ skill", and one-time onboarding text is emitted only when its gate fires ([ARCHITECTURE L387-L395][arch-preamble]). A few skills (`careful`, `freeze`, `guard`, `unfreeze`, `deslop-shared-libs`, `cso`, `gstack-upgrade`) have no preamble.
- **Kind**: convention + script.
- **Proposed address**: none (idea-only).
- **Why it could fit.** Two patterns generalise: (a) **STATUS lines**: a skill runs one script, the script prints `KEY: value` facts, and the prose branches on them, which moves detection out of the model and into code; the fork's `unity-verification` ladder could use the same shape (inference). (b) **Gate-emitted instructions**: text that applies once is printed by a script only when its condition holds, instead of sitting in every skill, the same principle as #14's "silent unless qualified" hook.
- **Why it might not.** The preamble is the suite's tax: every workflow skill starts by running a telemetry-and-update script and loading up to several thousand tokens of shared rules. That is the opposite of the owner's "a skill loads what the task needs". Tiers are a blunt control; the source keeps moving text out of them. It is also the main reason no gstack skill can be copied as-is.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: superpowers' SessionStart bootstrap (proposed reject, [superpowers ledger](superpowers.md) entry 1); vibe-wise's opt-in silent hook ([installed-plugins ledger](installed-plugins.md)); #14.
- **Idle context cost**: 0 idle; paid per invocation.
- **Recommendation (proposed)**: reject. Note "one script prints STATUS lines, prose branches on them" as an authoring pattern for skills that must detect environment.

### 6. Session-scoped hook skills: `careful`, `freeze`, `guard`, `unfreeze`

- **What it is.** Four skills whose protection exists only after the user invokes them, through `hooks:` in skill frontmatter.
  - [`careful`][careful] registers a `PreToolUse` hook on **both `Bash` and `PowerShell`** ([L12-L23][careful-hooks]) running [`check-careful.sh`][check-careful]. Two tiers ([L5-L10][check-careful-tiers]): **deny** for two catastrophic simple commands (recursive delete whose only targets are `/` or home; force-push to the default branch, resolved from `origin/HEAD`), and **ask** for the rest (`rm -r`, SQL `DROP`/`TRUNCATE`, force-push, `git reset --hard`, `git checkout .`, `kubectl delete`, `docker rm -f`/`system prune`, shell obfuscation such as base64-to-shell). A safe-exception list lets `rm -rf node_modules|dist|build|.cache|…` through silently ([L213-L221][check-careful-safe]). A **PowerShell/cmd rule table** covers `Remove-Item -Recurse/-Force` and its aliases, `rd /s`, `del /s`, `Format-Volume`, `Clear-Disk`, `Clear-Content`, `[IO.File]::Delete`, and flags things it cannot inspect (`-EncodedCommand`, `Invoke-Expression`, `Start-Process` of a shell, `& $var`) ([L258-L292][check-careful-win]). Users can add ERE lines in a global or per-project `careful-patterns.txt` ([L370-L379][check-careful-patterns]). Missing helpers or an unparsable payload degrade to **ask**, never silence. The decision JSON is nested under `hookSpecificOutput` because "Claude Code ignores a top-level `permissionDecision`".
  - [`freeze`][freeze] registers on `Edit`, `Write`, `NotebookEdit` and denies any path outside one user-chosen directory, read from a state file. It is **fail-closed** (an exit trap turns any script failure into a deny, [check-freeze.sh L22-L26][check-freeze-backstop]), resolves symlinks to their final target, normalises Windows drive paths, and says plainly "This prevents accidental edits, not a security boundary — Bash or PowerShell commands like `sed`… can still modify files". State changes go through one writer with a lock and an **owner token**, so `investigate` can acquire a boundary and release only its own ([freeze-state.sh][freeze-state], entry 16).
  - [`guard`][guard] registers both sets of hooks. [`unfreeze`][unfreeze] clears the state file; hooks stay registered but allow everything.
  - Shared JSON extraction lives in [`hook-extract.sh`][hook-extract] (python3, falling back to node). Tests: 93 cases in [`hook-scripts.test.ts`][hook-tests], plus Windows-path and lock-lifecycle suites.
- **Kind**: skills + hooks + scripts (+ test harness).
- **Proposed address**: `freeze`/`unfreeze` as **core user-invoked** (adapted); `careful`'s rule table and tiers as input to the **core always-on** command guard that #14 already admitted.
- **Why it could fit.** (1) The owner is on Windows with PowerShell as the primary shell. This is the only source read so far whose guard matches the `PowerShell` tool and has Windows rules and tests; the davidondrej guard, proposed as the model for the core guard, is bash-only and needs exactly this port. (2) The deny/ask split fits #14's "catastrophic only" rule: the always-on guard takes only the deny tier, and the noisier ask tier becomes an opt-in session mode. (3) `freeze` is the cheapest scope-creep control available: zero idle cost when user-invoked, and useful for AFK runs and for "debug this module, touch nothing else" (inference). In Unity it could pin edits to one `Assets/` subfolder or one package.
- **Why it might not.** Skill-frontmatter hooks are Claude-only ([loading-mechanics §4](../loading-mechanics.md)); on Codex gstack calls them advisory. Hook commands hardcode `$HOME/.claude/skills/gstack/...` and run through `bash -c`, so they depend on Git Bash being what the harness launches and on `python3` or `node` being on PATH (not checked on the owner's machine). `freeze` state is **global and persistent**: it survives the session and applies to every project until `/unfreeze`, which is surprising across parallel sessions. As published, all four are model-invoked, and the agent turning its own guard on or off is not what the owner wants (inference). `careful`'s ask tier matches by regex on the whole command, so quoted text such as a commit message mentioning `rm -r` may trip it (not tested here; davidondrej's harness tests that exact case).
- **Copy / adapt / idea-only**: adapt. They can't be copied directly: scripts source gstack's state-root helper, log to `~/.gstack/analytics`, and use gstack's install path. Needed: a relocatable hook path, state under the project (or keyed by project), removal of analytics, `disable-model-invocation: true`, and merging `guard` into the other two (it adds nothing but a combined prompt). For the core guard: lift the PowerShell rule table and the "can't inspect → ask" class into the Windows port, with block and allow test pairs.
- **Overlap**: the core command guard decided in #14; [davidondrej ledger](davidondrej-skills.md) entry 2 (deny-list + 151-case harness, needs a Windows port); fork `git-guardrails-claude-code`; [unity-workflow ledger](unity-workflow-repos.md) B7 (`unity-ops-guard` shadow-mode hook); `investigate` here.
- **Idle context cost**: as published ~25 (`careful`) + 32 (`freeze`) + 36 (`guard`) + 40 (`unfreeze`) ≈ 133 tokens. 0 if user-invoked. On invocation 0.5k to 1.3k each ([context-budget.json][ctx-budget]).
- **Recommendation (proposed)**: adapt `freeze` + `unfreeze` as core user-invoked (Claude-only, stated as such). Feed `careful`'s PowerShell rules, safe exceptions and deny/ask tiers into the core guard's Windows port, decided together with davidondrej entry 2. Reject `guard` as a separate skill. Owner's call whether an opt-in ask-tier "careful mode" is wanted on top of the always-on guard.

### 7. Install machinery: `setup`, `gstack-settings-hook`, settings-level hooks, routing injection, team mode

- **What it is.** [`setup`][setup] links or copies skills per host, builds binaries, and edits `~/.claude/settings.json` through [`bin/gstack-settings-hook`][settings-hook]: a schema-aware hook manager with add / ensure / remove-by-source / diff / rollback / prune-stale verbs, a lock, atomic writes, backup-on-change, "parse failure fails CLOSED: a corrupt settings.json is never overwritten", and an identity table because "Claude Code strips unknown keys when it rewrites settings.json" so a tag alone can't prove ownership ([L1-L60][settings-hook]). Hooks it can register: a `Stop` hook that closes dangling timeline entries (default on, [setup L4385][setup-stop]); `PreToolUse`/`PostToolUse` on `AskUserQuestion` for question tuning (consent prompt, [L4135-L4140][setup-plantune]); a `SessionStart` auto-update check in team mode ([L3950-L3956][setup-session]); an opt-in `UserPromptSubmit` bridge to a third-party memory tool. It heals hook entries that point at deleted worktrees. The first skill run offers to append a "Skill routing" section to the project `CLAUDE.md` and commit it ([gstack-skill-start L494-L526][routing-injection]). The root [`gstack`][root-skill] skill is a router: "Do NOT answer directly when a skill exists for the task". [`gstack-upgrade`][upgrade] self-updates the install. `gstack-team-init required` makes a repo demand gstack from teammates ([README L57-L67][readme-team]).
- **Kind**: manifest-packaging + scripts + hooks + skills.
- **Proposed address**: none. Idea-only input to the install-architecture and migration tickets.
- **Why it could fit.** The owner's migration will edit `~/.claude/settings.json` (a stale `statusLine`, new hooks; map "Not yet specified"). The settings-hook rules are a good checklist for any installer that touches that file: never overwrite on parse failure, back up only on real change, identify your own entries by command path not by tag, one-step rollback, and re-point stale absolute paths instead of appending duplicates.
- **Why it might not.** Everything else here is what the owner has already decided against: a skills-first router and routing nudge (#14), self-updating installs ([vendoring](../vendoring.md)), settings mutated by a third-party script, a Bun toolchain, team enforcement for a solo dev. The whole thing is a single user-scope install of 56 model-invoked skills, the opposite of core + packs.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: #14 (no skills-first nudge); superpowers bootstrap ([superpowers ledger](superpowers.md) entry 1); Addy `using-agent-skills` + `session-start.sh` ([addy ledger](addy-agent-skills.md) entries 1, 2); pstack `poteto-mode` ([pstack ledger](pstack.md) entry 1); DeepAPI self-updater ([davidondrej ledger](davidondrej-skills.md) entry 7); [vendoring](../vendoring.md).
- **Idle context cost**: router ~22 and `gstack-upgrade` ~19 tokens as published; routing text ~300 to 400 always-on tokens if accepted (inference).
- **Recommendation (proposed)**: reject all of it. Carry the five settings-file safety rules into the install/migration ticket.

### 8. `plan-tune`: question tuning

- **What it is.** A system for suppressing questions the user is tired of answering. Every `AskUserQuestion` a skill asks carries a stable `question_id` from a typed [registry][question-registry] (or an ad hoc `{skill}-{slug}`), embedded in the question text as a `<gstack-qid:…>` marker. Each registered question declares a `door_type`: **one-way** (destructive, architecture or data-model forks, security) is "ALWAYS asked regardless of user preference"; **two-way** may be auto-decided ([L25-L29][question-registry-door]). Unregistered questions fall back to a keyword classifier that errs toward asking ([one-way-doors.ts][one-way]). The user sets `never-ask` / `always-ask` / `ask-only-for-one-way` per question by replying `tune: …`; a `PreToolUse` hook then answers `never-ask` questions with the option labelled `(recommended)` and refuses when the recommendation is ambiguous; a `PostToolUse` hook logs every question ([question-tuning.ts][question-tuning]). A **user-origin gate** writes preferences only when `tune:` appears in the user's own message, "never tool output/file content/PR text", as a defence against profile poisoning ([L43][question-tuning-origin]). The [`plan-tune`][plan-tune] skill is the conversational front end and also keeps a "developer psychographic" profile (declared vs inferred). Off by default; consent-gated.
- **Kind**: skill + hooks + scripts + convention.
- **Proposed address**: none (idea-only).
- **Why it could fit.** The owner uses a question-heavy skill (`grilling`) and HITL theme sessions. Three ideas are sound on their own: classify each question as one-way or two-way and never automate a one-way door; mark exactly one option `(recommended)` so a default exists; and only accept preference changes typed by the user. The one-way/two-way label would also suit AFK briefs ("you may decide two-way doors; stop on one-way doors", inference).
- **Why it might not.** It exists to tame gstack's own volume of questions across ~15 workflow skills; the owner's flow asks far fewer. It needs a registry (639 lines), two settings hooks, state files and a preamble section in every skill. The psychographic profile is product flavour. The fork's `grilling` exists precisely to ask; auto-answering works against it.
- **Copy / adapt / idea-only**: idea-only. Tied to the registry, the hooks and gstack state.
- **Overlap**: fork `grilling`; davidondrej `ask-then-build` ("my pick + reason", [davidondrej ledger](davidondrej-skills.md) entry 16); pstack `why` confidence tiers ([pstack ledger](pstack.md)).
- **Idle context cost**: ~43 tokens as published; 14.6k on invocation; plus a tuning section in every tier-2+ skill.
- **Recommendation (proposed)**: reject. Offer "label decisions one-way or two-way; an agent may default two-way doors, never one-way" to the workflow theme as a line for AFK briefs and `grilling`.

### 9. Learnings store and `learn`

- **What it is.** Cross-session memory as an append-only JSONL file per project under `~/.gstack/projects/<slug>/learnings.jsonl`. Skills end with a "Capture Learnings" block: log an entry with a **type** (`pattern`, `pitfall`, `preference`, `architecture`, `tool`, `operational`), a kebab `key`, an `insight`, a **confidence 1-10**, a **source** (`observed`, `user-stated`, `inferred`, `cross-model`) and the **files** it refers to, with the rule "Only log genuine discoveries… would this insight save time in a future session?" ([learnings.ts L129-L143][learnings-log]). The writer validates every field and rejects injection-looking text ([gstack-learnings-log][learnings-log-bin]). Skills start with a "Prior Learnings" search and must cite a hit as "Prior learning applied: [key] (confidence N/10, from [date])". Duplicates resolve at read time, latest wins. Cross-project search is opt-in. [`learn`][learn] manages the store: show, search, **prune** (flag entries whose `files` no longer exist, and same-key entries that contradict, [L87-L91][learn-prune]), export as a Markdown section for `CLAUDE.md`, stats.
- **Kind**: skill + scripts + convention.
- **Proposed address**: none for the store. Ideas into fork `retro` (core user-invoked).
- **Why it could fit.** The entry schema is well thought out: recording *source* and *confidence* separates what was seen from what was guessed, and recording *files* makes staleness mechanically checkable. `learn export` → a reviewed `CLAUDE.md` section is the same destination the fork's `retro` already aims at, by a human-approved path.
- **Why it might not.** The store is machine-local, outside the repo, unreviewed, and read back into context by every workflow skill, so a wrong learning silently steers later sessions; the source itself needed injection sanitising and a pruning skill. Claude Code already has its own project auto-memory, in use on the owner's machine (this session loaded one). The fork puts durable knowledge in versioned files (`GLOSSARY.md`, ADRs, steering files). A second memory system would compete with both.
- **Copy / adapt / idea-only**: idea-only. The scripts depend on Bun and gstack's state root.
- **Overlap**: fork `retro` and `domain-modeling`; pstack `correct` and `reflect` ([pstack ledger](pstack.md) entries 14, 15); the harness's auto-memory; [unity-workflow ledger](unity-workflow-repos.md) C5 (session mining).
- **Idle context cost**: `learn` ~15 tokens as published; 8.6k on invocation.
- **Recommendation (proposed)**: reject the store and the skill. Offer the entry fields (source, confidence, files, and "prune when the file is gone or entries contradict") to the theme that decides `retro` and pstack `correct`.

### 10. Test and eval suite

- **What it is.** Three tiers ([ARCHITECTURE L405-L416][arch-tiers], [L450-L527][arch-e2e]). **Tier 1, free**: static checks on every `bun run test`: generated files are fresh for every host, every command a skill mentions exists in the command registry, hook scripts behave, budgets hold ([skill-validation.test.ts][skill-validation]). **Tier 2, paid E2E**: [`session-runner.ts`][session-runner] spawns `claude -p --output-format stream-json` as a separate process, streams NDJSON, and records `exit_reason`, `timeout_at_turn` and `last_tool_call`; an eval store writes partial results atomically after each test so a killed run keeps its data; includes skill-routing "journey" tests ([skill-routing-e2e.test.ts][routing-e2e]). **Tier 3, LLM judge**: scores docs on clarity / completeness / actionability and checks planted-bug detection ([llm-judge.ts][llm-judge]). Around these: **touchfile selection**, a literal map from each paid test to the file globs that should trigger it, so a PR runs only affected evals ([touchfiles.ts][touchfiles]); gate vs periodic tiers; shard runners; flake ranking; `eval:compare` between runs; a "blame protocol" for eval failures and "always detach" guidance for running evals as an agent ([CLAUDE.md][claude-md]). The policy for what a test on skill text may assert is the **test value bar** ([docs/test-value-bar.md][tvb]): a *prompt-byte contract* is only "the machine-read tokens inside a prompt… An English sentence is not a prompt-byte contract because the model reads it: rewording it must not break a test" ([L23-L31][tvb-prompt]); a *sentence pin* must become a structural check or be deleted ([L32-L38][tvb-pin]).
- **Kind**: CI-eval + scripts + convention doc.
- **Proposed address**: idea-only input to maintenance machinery (#17).
- **Why it could fit.** The collection will need some checks on skills. Three pieces are right-sized: (1) the **prompt-byte rule** answers the question every skill-lint raises, "what may a test on a `SKILL.md` assert?": structure, order, machine-read tokens, safety lines by meaning; never wording. (2) **Touchfile selection** is a tiny idea (a map of test → globs) that keeps paid trigger evals affordable for one person. (3) The **session runner's diagnostics** (`exit_reason`, `last_tool_call`, partial results that survive a kill) are what the `claude -p` trigger eval from the [anthropic-skills ledger](anthropic-skills.md) entry 7 lacks. "E2E tests spawn `claude -p`… not via the Agent SDK, which can't nest inside Claude Code sessions" is a useful constraint to know.
- **Why it might not.** The scale is wrong by two orders of magnitude: 1,008 test files, sharded runners, a dozen CI workflows and paid evals budgeted in dollars per run, for a product with many users. Most tests guard gstack-specific plumbing. It is Bun/TypeScript; the owner's stack is C#, and the other ledgers' eval candidates are Python or Node.
- **Copy / adapt / idea-only**: idea-only. The harness imports gstack internals throughout.
- **Overlap**: anthropic trigger eval and with/without-skill loop ([anthropic-skills ledger](anthropic-skills.md) entries 2, 7); superpowers triggering tests and pressure scenarios ([superpowers ledger](superpowers.md) entries 18, 21); Addy tiers 1-3 ([addy ledger](addy-agent-skills.md) entries 8-10); pstack eval playbook ([pstack ledger](pstack.md) entry 33); jammyfu contract tests ([gamedev ledger](gamedev-repos.md) J11).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: reject the suite. Carry the prompt-byte rule, touchfile selection and the runner diagnostics into #17 as design notes for whichever eval the owner picks.

---

## Skills

### 11. `context-save` and `context-restore`

- **What it is.** A save/resume pair ([`context-save`][context-save], [`context-restore`][context-restore]). Save gathers git state, then writes a timestamped Markdown file with frontmatter (status, branch, timestamp, files modified) and four parts: what's being worked on, decisions and why, remaining work, notes including "things that were tried and didn't work". Its distinctive rule is **Remaining Work provenance**: every item starts `Open.` and ends with how the session knows it: `(path run)` with the observed outcome, `(path read)`, or `(path assumed)` "however confident"; writing steps get their own markers (`target state checked` / `code read` / `path assumed`) "because whether a write is safe to repeat depends on the target's state, not on the code that writes" ([L87-L103][context-save-prov]). The filename is computed in bash from an allowlist-sanitised title, never by the model. Restore prefers the newest checkpoint from the **current branch** and falls back to other branches, because all worktrees share one checkpoint folder, and checks that a checkpoint belongs to this project before trusting it. Both carry a hard gate: no code changes.
- **Kind**: skills.
- **Proposed address**: ideas into fork `handoff` (core user-invoked).
- **Why it could fit.** The provenance markers fix the most dangerous part of any handoff: a next step stated as fact that was only guessed. It composes with davidondrej's "describe state, not actions" and "verify every claim against the code" ([davidondrej ledger](davidondrej-skills.md) entry 9). Current-branch-first restore matters to anyone using worktrees.
- **Why it might not.** Files live in `~/.gstack/projects/<slug>/checkpoints`, outside the repo, with slug and identity machinery (~40 KB per skill once rendered). The harness has session resume and compaction of its own. Two skills where the fork has one.
- **Copy / adapt / idea-only**: idea-only for the skills; adapt the provenance table (about ten lines) into the fork's `handoff`.
- **Overlap**: fork `handoff`, `claude-handoff`; davidondrej `handoff`; pstack continuity playbooks ([pstack ledger](pstack.md) entry 35).
- **Idle context cost**: ~17 + ~30 tokens as published; ~10.4k each on invocation.
- **Recommendation (proposed)**: reject the skills; adapt the provenance markers into fork `handoff`, decided with davidondrej entry 9.

### 12. `codex` (and its mirror `claude-code`)

- **What it is.** A wrapper around the Codex CLI for a second opinion from another model family ([`codex/SKILL.md.tmpl`][codex]). Three mutually exclusive modes: **review** (`codex review` against the base branch with a pass/fail gate), **challenge** (adversarial: try to break the change), **consult** (free question with session continuity). Before spending anything it probes: binary present, auth valid, the account can actually use the selected model, sandbox can start, version not known-bad; each failure has a named status and a stop-or-continue rule ("a rate-limited mode run is missing coverage, never a pass"). Every prompt is prefixed with a **filesystem boundary** telling Codex not to read `~/.claude/`, `.claude/skills/` or `agents/`, so the reviewer doesn't wander into skill files ([L194-L208][codex-boundary]). Output is shown verbatim, then exactly one line: "Recommendation: <action> because <reason naming the most actionable finding>" ([L212-L226][codex-synth]). Reasoning effort defaults to high/high/medium by mode because "`xhigh` uses ~23x more tokens than `high` and causes 50+ minute hangs" ([L255][codex-xhigh]). `claude-code` is the reverse wrapper rendered for non-Claude hosts; the generator skips each host's own wrapper because "An outside reviewer must use a different harness" ([hosts/claude.ts L26][host-claude-skip]).
- **Kind**: skill (+ `gstack-codex-probe` helper).
- **Proposed address**: one core user-invoked cross-model review skill (adapted), shared with the other sources' versions.
- **Why it could fit.** Codex is installed on the owner's machine ([loading-mechanics](../loading-mechanics.md)). Compared with davidondrej's `codex-subagent`, this adds four things: the preflight probe before paying, the filesystem boundary, the three-mode split, and the rule that a second opinion from the same harness is not a second opinion.
- **Why it might not.** 59 KB rendered and 15.2k tokens on invocation; most of it is model-selection policy, probes and gstack telemetry. It pins a default model name. The persona text needs removing. Whether the quoted `xhigh` figures still hold was not checked.
- **Copy / adapt / idea-only**: adapt ideas only. It can't be copied: every step calls `gstack-codex-probe` and gstack path helpers.
- **Overlap**: [davidondrej ledger](davidondrej-skills.md) entries 12, 13 (`codex-subagent`, `gpt-review`, `total-review`); Addy `doubt-driven-development` ([addy ledger](addy-agent-skills.md) entry 28); pstack `interrogate`/`arena` ([pstack ledger](pstack.md) entry 13); fork `code-review`; superpowers `requesting-code-review`.
- **Idle context cost**: ~23 tokens as published; 0 if user-invoked.
- **Recommendation (proposed)**: reject as a skill. In the cross-model theme, add to the shared recipe: probe auth and model access first, prefix a "don't read agent skill folders" boundary, show the reviewer's text verbatim plus one recommendation line, and never count a failed or rate-limited run as a pass.

### 13. `benchmark-models`

- **What it is.** An interactive front end to a `gstack-model-benchmark` binary that runs one prompt (or a skill file) through Claude, GPT via Codex CLI and Gemini, and tabulates latency, tokens, cost and an optional judge score ([`SKILL.md.tmpl`][bench-models]). Rules: always dry-run first to show which providers are authenticated; "Never hardcode model names"; "Never auto-include `--judge`. It adds real cost; user must opt in"; offer to save JSON as a baseline because "skill performance drifts as providers update their models" ([L151-L155][bench-rules]).
- **Kind**: skill + compiled script.
- **Proposed address**: none.
- **Why it could fit.** The owner uses two model families and may want to know which one runs a given skill better; "save a baseline, re-run after a model update" is the right habit for a maintained collection.
- **Why it might not.** The skill is only a prompt flow around a Bun binary and three provider adapters the owner would not install. A single run of one prompt per model is not a measurement; the [pstack ledger](pstack.md) `benchmark-checklist` and the [anthropic-skills ledger](anthropic-skills.md) noise-floor rules say why.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: pstack `benchmark-checklist`, hillclimb/eval playbooks ([pstack ledger](pstack.md) entries 9, 33); anthropic with/without-skill loop and `aggregate_benchmark.py` ([anthropic-skills ledger](anthropic-skills.md) entries 2, 5).
- **Idle context cost**: ~24 tokens as published.
- **Recommendation (proposed)**: reject. "Dry-run the provider/auth check before any paid run" and "judge is opt-in" are notes for #17's eval design.

### 14. `test-audit` (with the test value bar)

- **What it is.** A whole-repo sweep for tests that cost more than they protect ([`SKILL.md.tmpl`][test-audit]). "Optimize for confidence, not deletion count… none is a valid result." Steps: a **mechanical pre-filter** before the model reads anything (files with no assertion, tests that grep source text, export-list snapshots, near-duplicates by whitespace-stripped checksum, [L72-L88][test-audit-prefilter]); bounded evidence reading; for each candidate either *retain* it under a named contract or fill a complete **retirement card** (`test`, `detects`, `non_test_callers`, `search_command`, `stronger_proof`, `history`, `unlocks`, `validation`), where `history` comes from `git log --follow` and "An incomplete card means the candidate is not ready" ([L99-L103][test-audit-card]); a report grouped by owning module with production and test LOC counted separately; one approval question per batch; and "Production code is removed only when the repo's typecheck/build or dead-code tool passes with it removed in a scratch worktree; grep evidence alone is not enough" ([L140][test-audit-grep]). It is report-only unless a batch is approved and never commits. The shared rubric ([docs/test-value-bar.md][tvb]) defines the **authoring gate** (what behaviour does this test protect, what credible regression makes it fail, why doesn't existing coverage catch it, does it need a production seam no production caller needs, [L15-L19][tvb-gate]) and the **retention bar** (keep tests that independently enforce a public API, protocol, config, migration, storage, security, platform or generated-output contract; "Static or slow is not a reason to delete", [L39-L44][tvb-retain]). The doc says the bar was adapted from OpenClaw's `test-audit` skill.
- **Kind**: skill + convention doc.
- **Proposed address**: core user-invoked (adapted), or the authoring gate as a reference inside fork `tdd`.
- **Why it could fit.** Agent-written test suites bloat, and the fork's `tdd` governs how tests are *written*, not how a suite is pruned. The authoring gate is four questions that fit `tdd`'s existing "test behaviour, not implementation" stance and add the "does this need a seam no production caller needs" check, which matches `codebase-design`'s seam vocabulary. The retirement card is a strong evidence format for any deletion. For C# libraries, "anything reachable from the package entrypoint is never retired" maps onto public API.
- **Why it might not.** The mechanical pre-filter is written for JS/TS/Python/Go/Ruby naming and assertion words; it would find nothing in NUnit/xUnit or Unity Test Framework code without rewriting (`[Test]`, `Assert.*`, `*Tests.cs`). In Unity, "passes with it removed in a scratch worktree" means a fresh `Library/` and a full reimport (the same objection the [superpowers ledger](superpowers.md) raised to worktrees-by-default). The skill writes reports into `~/.gstack` and hands landing to `/ship`. A prune sweep is occasional work.
- **Copy / adapt / idea-only**: adapt. Rewrite the pre-filter for C#, replace the state paths and `/ship` handoff, drop the preamble. The value-bar terms can be taken nearly as written (MIT; the doc credits OpenClaw, whose licence was not checked).
- **Overlap**: fork `tdd`, `unity-testing`, `codebase-design`; superpowers `writing-good-tests.md` ([superpowers ledger](superpowers.md) entry 9); Addy `test-driven-development` ([addy ledger](addy-agent-skills.md) entry 41); Unity baseline: no test-pruning skill found in [unity-baseline](../unity-baseline.md) (skim).
- **Idle context cost**: ~37 tokens as published; 0 if user-invoked; 10.1k on invocation as published.
- **Recommendation (proposed)**: adapt the authoring gate and retention bar as a reference for fork `tdd` (a fork-side change, so the owner decides where it is authored per #16). Owner's call on a user-invoked `test-audit` for C#; park it until a suite actually needs pruning.

### 15. `health`

- **What it is.** A read-only code-quality dashboard ([`SKILL.md.tmpl`][health]). It reads a `## Health Stack` section from `CLAUDE.md` or auto-detects tools (tsc, biome/eslint/ruff, test runner, knip, shellcheck), offers to persist the detected commands to `CLAUDE.md`, runs each tool separately, scores each category 0-10 against a rubric, computes a weighted composite **in code, "not by hand"**, redistributes weight from skipped categories and labels the result "partial coverage", appends a history row and shows trends. "**HARD GATE:** Do NOT fix any issues" ([L35][health-gate]). Its capture rules are careful: record the checker's real exit code before any parser runs, count from the full log not the displayed tail, "A zero match count cannot make a non-zero checker exit `CLEAN`", a tool that returns 127 is a failure not a skip, and a capture failure makes the composite `N/A` rather than a guess ([L164][health-na]).
- **Kind**: skill.
- **Proposed address**: none (idea-only).
- **Why it could fit.** The "declare the project's check commands once in the steering file, then every skill reads them" convention is useful: the fork's verification skills need to know how to typecheck, test and lint a given repo. The capture rules are the kind of honesty the fork's `unity-verification` also insists on.
- **Why it might not.** Detection is entirely web-stack (tsconfig, biome, knip, shellcheck) plus a gbrain category; nothing for `dotnet build`, analyzers or Unity. A composite score with fixed weights is a team-dashboard artefact; a solo dev runs the checks and reads the failures. CI already does this for libraries.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity-verification` (the verification ladder), `code-review`; Addy `definition-of-done` ([addy ledger](addy-agent-skills.md)); superpowers `verification-before-completion` ([superpowers ledger](superpowers.md) entry 12); pstack verification-skill generator ([pstack ledger](pstack.md) entry 19).
- **Idle context cost**: ~17 tokens as published; 11.4k on invocation.
- **Recommendation (proposed)**: reject. Offer the "named check commands in the steering file" convention and the two capture rules (real exit code first; non-zero exit can't be clean) to the verification theme.

### 16. `investigate`

- **What it is.** A four-phase debugging skill ([`SKILL.md.tmpl`][investigate]) under an "Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST" ([L73-L77][investigate-law]). Phase 1 collects symptoms, traces code, checks `git log` on the affected files, reproduces, and searches prior learnings; output is one testable root-cause hypothesis. Then a **Scope Lock**: it acquires a `freeze` boundary on the narrowest directory containing the affected files, keeps the returned owner token, and releases only that token at the end, leaving any user-set boundary alone ([L122-L143][investigate-lock]). Phase 2 matches six bug patterns (race, nil propagation, state corruption, integration failure, config drift, stale cache) and searches the web for the *sanitised* error category. Phase 3 tests the hypothesis with temporary instrumentation, with a **3-strike rule**: after three failed hypotheses, stop and ask, because "this may be an architectural issue" ([L194-L202][investigate-3]). Phase 4 fixes the root cause with a regression test that fails without the fix; a fix touching more than 5 files triggers a blast-radius question. Phase 5 re-reproduces and prints a fixed DEBUG REPORT with a status of DONE / DONE_WITH_CONCERNS / BLOCKED.
- **Kind**: skill (+ frontmatter hooks to `freeze`).
- **Proposed address**: none; ideas into fork `diagnosing-bugs` (core model-invoked).
- **Why it could fit.** Two additions the fork's `diagnosing-bugs` lacks: the **scope lock** (a debugging session mechanically prevented from "fixing" unrelated code, via entry 6) and the **3-strike escalation**. "Sanitise before you search an error" is a sensible privacy line.
- **Why it might not.** The fork's `diagnosing-bugs` is the stronger discipline: it builds a tight red-capable feedback loop *first* and asks for 3 to 5 falsifiable hypotheses, where this skill forms one hypothesis by reading code ([fork ledger](mattpocock-skills-unity.md)). The pattern table is web-backend flavoured (Redis, CDN, Turbo). Its description tells the agent to "Proactively invoke this skill (do NOT debug directly)", a pushy trigger. 47 KB rendered. Per #16, Matt-derived skills are authored in the fork, and a competing debugging skill here would duplicate one.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `diagnosing-bugs`, `unity-debugging`; superpowers `systematic-debugging` ([superpowers ledger](superpowers.md) entry 10); Addy `debugging-and-error-recovery` ([addy ledger](addy-agent-skills.md) entry 25); pstack diagnosis playbooks ([pstack ledger](pstack.md) entry 31); `unity-debug` ([unity-workflow ledger](unity-workflow-repos.md) A4).
- **Idle context cost**: ~28 tokens as published; 12.1k on invocation.
- **Recommendation (proposed)**: reject. Offer "after three failed hypotheses, stop and question the architecture" and an optional "freeze edits to the suspect module" step to `diagnosing-bugs`, the second only if entry 6's `freeze` is adopted.

### 17. `deslop-shared-libs`

- **What it is.** A strictly read-only audit that looks for code worth sharing ([`SKILL.md.tmpl`][deslop]). "Find up to five new opportunities to share code, then recommend the best three… Fewer findings, including none, are valid; never invent callers to fill a quota" ([L20-L23][deslop-quota]). Scope: the last 14 days of commits and PRs plus the current branch, on the theory that actively changed code is where duplication hurts. It checks open and older PRs so it doesn't propose work already underway, with an explicit request budget. Candidates are judged by a shared rubric ([shared-libs.ts][shared-libs]): **prove the callers** (at least two verified first-party locations with functions and lines; "Similar names or formatting alone do not establish equivalent behavior"; generated and vendored copies don't count); **reuse before extracting**; **keep the helper small**; **account for the whole change** (lines removed, added and saved, for implementation and separately including tests; "State when tests or integration may make the total change grow"); **rank useful changes** and reject "similarities with incompatible contracts". Output: a table of up to five ideas, up to three ranked recommendations each with both callers linked, the smallest helper and its destination, a migration sketch, and a named risk that is "never 'none'". It stops there: "do not offer or start implementation". Unusually, it has no preamble and no state writes. About half of its 181 lines are hardening for running against an untrusted repo: a safe-git wrapper, no fetches, no project scripts.
- **Kind**: skill.
- **Proposed address**: core user-invoked (adapted).
- **Why it could fit.** It is the most self-contained skill in the suite and stack-neutral. The owner writes C# libraries and Unity code, where duplicated helpers across assemblies and packages are common (inference), and agent-written code duplicates freely. The rubric's line accounting is an honest check against abstraction for its own sake, and it speaks the same language as the fork's `codebase-design` (deep modules: a small interface that hides a lot). It is useful as a periodic sweep, so user-invoked at zero idle cost fits.
- **Why it might not.** The hardening (safe-git helper, provider GET APIs only, paged PR budgets) is written for auditing other people's repos on a hosted service and is dead weight on the owner's own trusted repos; it also references `{{SAFE_GIT}}`, a gstack binary. "PRs in the last 14 days" assumes a PR-driven team; a solo dev's signal is commits. The fork's `codebase-design` already finds "deepening opportunities", from the design side rather than the duplication side.
- **Copy / adapt / idea-only**: adapt. Keep the rubric and output contract (~60 lines), replace the PR machinery with "recent commits and the working tree", drop the safe-git section, add `disable-model-invocation`. Can't be copied directly because of the `{{SAFE_GIT}}` and `{{SHARED_LIBS_RUBRIC}}` placeholders and helper binary.
- **Overlap**: fork `codebase-design` (deepening opportunities), `code-review`; the host's `simplify` skill (reuse and simplification on *changed* code, in this session's listing); Addy `/code-simplify` ([addy ledger](addy-agent-skills.md) entry 5); pstack `blast-radius` ([pstack ledger](pstack.md) entry 8).
- **Idle context cost**: ~30 tokens as published; 0 if user-invoked; 3.4k on invocation as published.
- **Recommendation (proposed)**: adapt as a core user-invoked audit, or fold the rubric into `codebase-design` as a reference. Decide in the design/refactoring theme against the host's `simplify`.

### 18. `retro`

- **What it is.** A weekly engineering retrospective built from git history ([`SKILL.md.tmpl`][retro]). One script, [`gstack-retro-metrics`][retro-metrics], emits labelled `METRIC: value` lines (commits, LOC, test ratio, hourly distribution, session detection, hotspots, PR sizes, a focus score, streaks), and the prose turns them into a narrative with per-author praise and growth notes, week-over-week trends, a "Shortcut Debt Ledger" ([L310][retro-debt]), a JSON snapshot saved to `.context/retros/`, and **recommendation follow-through**: each prior retro's "3 Things to Improve" is scored `addressed`, `partial` or `open` against this window's commits, with evidence ([L357][retro-follow]). A `global` mode aggregates across every repo on the machine and writes a "tweetable summary".
- **Kind**: skill + script.
- **Proposed address**: none.
- **Why it could fit.** One idea transfers to the fork's `retro`: save the recommendations in a machine-readable snapshot and open the next retro by checking which were acted on. The "one script emits metrics, prose interprets" shape is the STATUS-line pattern again (entry 5).
- **Why it might not.** Same name, different job. The fork's `retro` reviews the agent's *environment* (steering files, checks, navigation) after a piece of work; this one measures a *team's* shipping velocity. Commit-hour histograms, streaks and LOC praise have little value for a solo dev, and per-author analysis has none. 71 KB rendered, 18.7k tokens on invocation. A second skill named `retro` would collide with the fork's ([loading-mechanics §2](../loading-mechanics.md) on name collisions).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `retro` (name collision); pstack `reflect` and `correct` ([pstack ledger](pstack.md) entries 14, 15).
- **Idle context cost**: ~21 tokens as published.
- **Recommendation (proposed)**: reject. Offer "record recommendations, score follow-through next time" to the fork's `retro`.

### 19. The persona and workflow chain (collapsed)

- **What it is.** gstack's core product: a sprint run as a sequence of role-playing skills, idea → plan reviews → build → review → QA → ship → deploy → monitor → document ([AGENTS.md][agents-md], [README][readme]). 37 skills, read at frontmatter level only except where noted:

| Group | Skills (lead description as published) | Idle tokens as published |
|---|---|---|
| Ideation and plan review | `office-hours` (YC office hours, two modes), `plan-ceo-review`, `plan-eng-review`, `plan-design-review`, `plan-devex-review`, `autoplan` (runs all four reviews in sequence with auto-decisions), `spec` (vague intent → executable spec, files a GitHub issue) | ~223 |
| Review, ship, deploy | `review` (pre-landing PR review), `ship` (merge base, test, review, bump VERSION, CHANGELOG, commit, push, PR), `land-and-deploy`, `landing-report`, `setup-deploy`, `canary` (post-deploy monitoring), `document-release`, `document-generate` | ~224 |
| QA and audits | `qa` (find and fix), `qa-only` (report), `devex-review`, `cso` (security audit with container-run scanners) | ~120 |
| Design | `design-consultation`, `design-shotgun`, `design-html`, `design-review` | ~240 |
| iOS | `ios-qa`, `ios-fix`, `ios-design-review`, `ios-sync`, `ios-clean` | ~144 |
| Browser and output tooling | `browse` (drives the Aside browser, falls back to a bundled Chromium daemon), `open-gstack-browser`, `setup-browser-cookies`, `scrape`, `skillify` (turn a scrape into a saved browser-skill), `benchmark` (web performance), `pair-agent`, `make-pdf`, `diagram` | ~365 |

- **Kind**: skills (+ compiled binaries, a browser extension, container images for `cso`).
- **Proposed address**: none.
- **Why it could fit.** One idea is worth lifting, from the review family's **confidence calibration** ([confidence.ts L22-L33][confidence], read in full): every finding carries a 1-10 confidence that decides whether it is shown, and a **pre-emit verification gate**: "Quote the specific code line: file:line and verbatim text… If you cannot quote the motivating line(s), the finding is unverified. Force its confidence to 4-5", which sends it to an appendix. For framework-generated symbols the reviewer must quote the generator, because "Missing literal names in the class body or grep results do not prove absence". That last point applies directly to Unity (serialized fields, source generators, `[SerializeField]` wiring; inference). A runner-up is the decision-brief shape for questions: re-ground, explain plainly, one `RECOMMENDATION:` line, lettered options ([opus-4-8.md][overlay-opus]).
- **Why it might not.** This chain *is* a development flow, and the collection already has one: the fork's `grilling` → `to-spec` → `to-tickets` → `implement` → `code-review` → `pr`, which #16 fixes as authored in the fork. Two flows mean two routers, colliding names (`review`, `spec`, `qa`) and conflicting advice. The personas target startup product work (CEO scope expansion, YC office hours, deploy canaries, design systems, iOS devices); none of it is Unity or C# library work. As published the 37 skills add ~1.3k idle tokens and 8k to 35k tokens each on invocation. The browser tooling needs compiled binaries and, on macOS, a third-party browser; the harness already provides browser tools. `ship` commits, pushes and opens PRs by its own conventions, against the owner's commit rules.
- **Copy / adapt / idea-only**: idea-only. Nothing here runs outside the suite.
- **Overlap**: the fork's whole workflow ([fork ledger](mattpocock-skills-unity.md)); superpowers' brainstorm → plan → execute chain (proposed reject, [superpowers ledger](superpowers.md)); Addy lifecycle commands ([addy ledger](addy-agent-skills.md) entry 5); pstack PR machinery ([pstack ledger](pstack.md)); host browser tools; a possible web pack (map, "Web pack sources") for the design skills, whose anti-pattern material derives from `pbakaus/impeccable` ([NOTICE.md][notice]), already a named web-pack source.
- **Idle context cost**: ~1.3k tokens as published for the 37.
- **Recommendation (proposed)**: reject all 37 as competing with the fork's flow. Offer the "quote the line or cap confidence at 4-5" gate to fork `code-review`. If a web pack is ever decided, read `pbakaus/impeccable` directly rather than gstack's derived copy.

### 20. Suite plumbing not covered above: gbrain, OpenClaw, bundled browser-skills

- **What it is.** [`setup-gbrain`][setup-gbrain] and [`sync-gbrain`][sync-gbrain] install and feed "GBrain", the author's separate knowledge-base CLI (local PGLite or Supabase, registered as MCP); `gbrain:` frontmatter on some skills declares context queries that a resolver turns into "load prior context" and "save results" blocks, suppressed on hosts without a brain ([define-host.ts L37-L44][define-host-gbrain]). [`openclaw/`][openclaw] holds four hand-written native skills for the OpenClaw agent runtime. [`browser-skills/`][browser-skills] holds saved scrape recipes.
- **Kind**: skills + manifest-packaging.
- **Proposed address**: none.
- **Why it could fit.** Declaring a skill's context queries as frontmatter data, rendered by one resolver, is a tidy pattern if the collection ever had a shared knowledge source.
- **Why it might not.** All of it serves products the owner doesn't use (GBrain, OpenClaw, Supabase), and the map puts other agents out of scope.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 9 (memory); [davidondrej ledger](davidondrej-skills.md) entry 25 (author-stack tool wrappers).
- **Idle context cost**: ~64 (`setup-gbrain`) + ~43 (`sync-gbrain`) tokens as published.
- **Recommendation (proposed)**: reject.

---

## Not verified

- **Nothing was run.** Hook behaviour, the generator, the budget tests and every skill are described from source text only. The "93 cases" in `hook-scripts.test.ts` is a count of `test(` occurrences; the 1,008 test files are a file count.
- **Idle cost** is estimated, not measured with `claude plugin details`. That Claude Code ignores the extra frontmatter keys (`triggers`, `preamble-tier`, `version`, `gbrain`) for the listing is inference from [loading-mechanics §1](../loading-mechanics.md). The size of the `CLAUDE.md` sections gstack asks for is estimated from text length.
- **Windows.** Whether gstack's hook commands (`bash -c "exec bash …"`, `python3` or `node` for JSON) work under the owner's Claude Code on Windows was not tested. `careful`'s false-positive behaviour on quoted text was not tested.
- **Skill-scoped hooks.** Whether a hook command in skill frontmatter can use a relocatable path variable instead of a hardcoded install path was not checked against the harness docs.
- **Settings hooks.** The five scripts under `hosts/claude/hooks/` were not read in full, so what they print into context (if anything) is unknown.
- **Entry 19 and 20 skills** were read at frontmatter level only, apart from the confidence resolver, the question-format resolver's opening and the `opus-4-8` overlay. `OVERLAY_BENCHMARK_CONTRACT.md`, `docs/TESTING_INTERNALS.md` and the `plan-tune` design docs were not read.
- **Licences.** gstack is MIT; the test value bar credits OpenClaw's `test-audit` skill, whose licence was not checked. Design material derives from Apache-2.0 `impeccable` per NOTICE.md.
- **Quoted figures from the source** (`xhigh` ~23x tokens and 50-minute hangs; "~18KB of inline bash per skill"; eval costs) are the source's claims, not checked.

[root]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e
[license]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/LICENSE
[notice]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/NOTICE.md
[readme]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/README.md
[readme-req]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/README.md?plain=1#L47
[readme-install]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/README.md?plain=1#L55
[readme-team]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/README.md?plain=1#L57-L67
[readme-telemetry]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/README.md?plain=1#L668-L683
[agents-md]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/AGENTS.md
[claude-md]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/CLAUDE.md
[claude-md-skill]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/CLAUDE.md?plain=1#L114-L160
[contrib-budget]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/CONTRIBUTING.md?plain=1#L422-L423
[arch-tmpl]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/ARCHITECTURE.md?plain=1#L314-L403
[arch-preamble]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/ARCHITECTURE.md?plain=1#L387-L395
[arch-committed]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/ARCHITECTURE.md?plain=1#L397-L403
[arch-tiers]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/ARCHITECTURE.md?plain=1#L405-L416
[arch-e2e]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/ARCHITECTURE.md?plain=1#L450-L527
[setup]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup
[setup-ps1]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup.ps1
[setup-session]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup#L3950-L3956
[setup-plantune]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup#L4135-L4140
[setup-stop]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup#L4385-L4395
[bin]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin
[settings-hook]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin/gstack-settings-hook#L1-L60
[skill-start]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin/gstack-skill-start
[routing-injection]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin/gstack-skill-start#L494-L526
[root-skill]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/SKILL.md.tmpl
[upgrade]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/gstack-upgrade/SKILL.md
[openai-yaml]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/agents/openai.yaml
[hosts]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts
[hosts-index]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/index.ts#L23
[define-host]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/define-host.ts#L120-L160
[define-host-gbrain]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/define-host.ts#L37-L44
[host-claude-fm]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/claude.ts#L11-L22
[host-claude-skip]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/claude.ts#L26
[host-codex]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/codex.ts
[host-codex-fm]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/codex.ts#L14-L40
[host-copilot]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/copilot.ts
[claude-hooks]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/hosts/claude/hooks
[overlays]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/model-overlays
[overlay-claude]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/model-overlays/claude.md
[overlay-opus]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/model-overlays/opus-4-8.md
[overlay-fable]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/model-overlays/fable-5.md
[overlay-gpt]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/model-overlays/gpt.md
[overlay-bench]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/OVERLAY_BENCHMARK_CONTRACT.md
[overlay-resolver]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/model-overlay.ts#L1-L17
[overlay-sub]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/model-overlay.ts#L60-L63
[gen]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/gen-skill-docs.ts
[gen-trim]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/gen-skill-docs.ts#L265-L277
[gen-trim-fn]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/gen-skill-docs.ts#L405
[preamble-tiers]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/preamble.ts#L57-L66
[preamble-compose]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/preamble.ts#L78-L113
[sections]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/sections.ts#L1-L17
[sections-ceiling]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/sections.ts#L32-L33
[confidence]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/confidence.ts#L22-L33
[shared-libs]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/shared-libs.ts
[question-tuning]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/question-tuning.ts
[question-tuning-origin]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/question-tuning.ts#L43
[question-registry]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/question-registry.ts
[question-registry-door]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/question-registry.ts#L25-L29
[one-way]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/one-way-doors.ts
[learnings-log]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/scripts/resolvers/learnings.ts#L129-L143
[learnings-log-bin]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin/gstack-learnings-log
[context-bill]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/lib/context-bill.ts#L1-L32
[ctx-budget]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/fixtures/context-budget.json
[catalog-budget]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/catalog-budget.test.ts#L42-L46
[catalog-budget-doc]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/catalog-budget.test.ts#L18-L53
[catalog-trim-test]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/catalog-trim.test.ts#L1-L18
[test]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test
[workflows]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/.github/workflows
[wf-skill-docs]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/.github/workflows/skill-docs.yml
[skill-validation]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/skill-validation.test.ts
[session-runner]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/helpers/session-runner.ts
[routing-e2e]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/skill-routing-e2e.test.ts
[llm-judge]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/helpers/llm-judge.ts
[touchfiles]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/helpers/touchfiles.ts#L1-L20
[hook-tests]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test/hook-scripts.test.ts
[tvb]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/test-value-bar.md
[tvb-gate]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/test-value-bar.md?plain=1#L15-L19
[tvb-prompt]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/test-value-bar.md?plain=1#L23-L31
[tvb-pin]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/test-value-bar.md?plain=1#L32-L38
[tvb-retain]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/docs/test-value-bar.md?plain=1#L39-L44
[careful]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/SKILL.md
[careful-tmpl]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/SKILL.md.tmpl
[careful-hooks]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/SKILL.md?plain=1#L12-L23
[check-careful]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/check-careful.sh
[check-careful-tiers]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/check-careful.sh#L5-L10
[check-careful-safe]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/check-careful.sh#L213-L221
[check-careful-win]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/check-careful.sh#L258-L292
[check-careful-patterns]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/check-careful.sh#L370-L379
[hook-extract]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/careful/bin/hook-extract.sh
[freeze]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/freeze/SKILL.md
[check-freeze-backstop]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/freeze/bin/check-freeze.sh#L22-L26
[freeze-state]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/freeze/bin/freeze-state.sh
[guard]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/guard/SKILL.md
[unfreeze]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/unfreeze/SKILL.md
[plan-tune]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/plan-tune/SKILL.md.tmpl
[learn]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/learn/SKILL.md.tmpl
[learn-prune]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/learn/SKILL.md.tmpl#L87-L93
[context-save]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/context-save/SKILL.md.tmpl
[context-save-prov]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/context-save/SKILL.md.tmpl#L87-L103
[context-restore]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/context-restore/SKILL.md.tmpl
[codex]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/codex/SKILL.md.tmpl
[codex-modes]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/codex/SKILL.md.tmpl#L180-L182
[codex-boundary]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/codex/SKILL.md.tmpl#L194-L208
[codex-synth]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/codex/SKILL.md.tmpl#L212-L226
[codex-xhigh]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/codex/SKILL.md.tmpl#L255-L257
[bench-models]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/benchmark-models/SKILL.md.tmpl
[bench-rules]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/benchmark-models/SKILL.md.tmpl#L151-L155
[test-audit]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test-audit/SKILL.md.tmpl
[test-audit-prefilter]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test-audit/SKILL.md.tmpl#L72-L88
[test-audit-card]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test-audit/SKILL.md.tmpl#L99-L103
[test-audit-grep]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/test-audit/SKILL.md.tmpl#L139-L140
[health]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/health/SKILL.md.tmpl
[health-gate]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/health/SKILL.md.tmpl#L35-L36
[health-na]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/health/SKILL.md.tmpl#L162-L165
[investigate]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/investigate/SKILL.md.tmpl
[investigate-law]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/investigate/SKILL.md.tmpl#L73-L77
[investigate-lock]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/investigate/SKILL.md.tmpl#L122-L143
[investigate-3]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/investigate/SKILL.md.tmpl#L194-L202
[deslop]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/deslop-shared-libs/SKILL.md.tmpl
[deslop-quota]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/deslop-shared-libs/SKILL.md.tmpl#L20-L23
[retro]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/retro/SKILL.md.tmpl
[retro-debt]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/retro/SKILL.md.tmpl#L310
[retro-follow]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/retro/SKILL.md.tmpl#L357
[retro-metrics]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/bin/gstack-retro-metrics
[setup-gbrain]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/setup-gbrain/SKILL.md
[sync-gbrain]: https://github.com/garrytan/gstack/blob/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/sync-gbrain/SKILL.md
[openclaw]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/openclaw
[browser-skills]: https://github.com/garrytan/gstack/tree/20eb6202fa8ea83a882e7c0463b722cd8a31af1e/browser-skills
