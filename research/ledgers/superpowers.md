# Ledger: superpowers

Source: `obra/superpowers`, read at commit [`8ca22db`][root] (2026-09-25, release v6.4.2 per [`plugin.json`][cc-manifest]). Read on 2026-10-09 from a shallow clone; nothing was installed or executed. Every superpowers link below is pinned to that SHA. The owner has v6.4.1 installed and disabled for Claude Code (`"superpowers@claude-plugins-official": false` in `~/.claude/settings.json`) and **enabled** for Codex (`[plugins."superpowers@openai-curated"] enabled = true` in `~/.codex/config.toml`). A recursive diff against the local 6.4.1 cache shows that only `writing-plans` changed in skill content, plus version strings and a removed one-line `CLAUDE.md` ([release notes v6.4.2][relnotes]). Idle-cost figures come from `claude plugin details superpowers`, run read-only against the installed 6.4.1. Fork links are pinned to `Hissal/mattpocock-skills-unity` at [`3d926c6`][fork-readme].

Vocabulary follows `GLOSSARY.md`. Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2). Everything below is **proposed**. The owner decides in theme sessions.

## Overview

**What superpowers ships** (counted from the tree at `8ca22db`):

| Part | Count | Where |
|---|---|---|
| Skills | 15, **all model-invoked** (no skill sets `disable-model-invocation`; checked by grep across the tree) | [`skills/`][skills] |
| Always-on hook | 1 `SessionStart` hook (`startup\|clear\|compact`) that injects the whole `using-superpowers` skill | [`hooks/hooks.json`][hooks-json], [`hooks/session-start`][hook-ss] |
| Skill-bundled scripts | SDD `sdd-workspace`, `task-brief`, `review-package`; inline-execution `task-start`, `task-done`; `find-polluter.sh`; `render-graphs.js`; a zero-dependency brainstorm server | under each skill's `scripts/` |
| Prompt templates | implementer, task reviewer, re-reviewer, final code reviewer, spec reviewer, 11 diagnosis analyst/scrub prompts | beside each skill |
| Harness packaging | Manifests for Claude Code, Codex, Cursor, Devin, Kimi, Muse, Hermes, Gemini, OpenCode, Pi; per-harness tool-mapping references | repo root dot-folders, [`using-superpowers/references/`][refs] |
| Tests | Plugin-infrastructure tests plus skill-triggering tests driven by `claude -p` | [`tests/`][tests] |
| External eval lab | `superpowers-evals` (Quorum), cloned into `evals/`, not in this repo | [`docs/testing.md`][testing-doc] |

**The design fact that matters most for this collection.** Superpowers is the opposite of pstack (ticket #5): everything is model-invoked, and a `SessionStart` hook forces the agent to check for skills before *any* response. [`using-superpowers`][using-sp] says that if there is "even a 1% chance a skill might apply", the agent "ABSOLUTELY MUST invoke the skill". The project treats that bootstrap as the product: "The bootstrap is the entire integration. Without it, the skill files are inert" ([porting guide, Part 1][porting]). On Claude Code this costs about **2k tokens in every session**: ~840 for the 15 descriptions plus ~1.1k for the injected skill body, which `claude plugin details` mislabels as "no model context cost" (already flagged in [loading-mechanics §4](../loading-mechanics.md)). On Codex the plugin ships `"hooks": {}` so that no hook runs, and only the descriptions load ([`.codex-plugin/plugin.json`][cx-manifest], [porting guide, Shape A][porting]). Because Claude Code cannot disable single skills inside a plugin (ticket #2), installing superpowers means taking all 15 descriptions and the hook, or none. Cherry-picking means vendoring copies.

**Standout candidates (proposed):**

- **Testing skills with subagents** (entry 18): pressure scenarios, a no-guidance control, micro-tests with 5+ reps, meta-testing. This is the most worked-out skill-testing method among the sources read so far. Candidate maintenance machinery for ticket #17.
- **"Description = triggers only, never the workflow"** and **"Match the Form to the Failure"** (entry 17): two evidence-backed authoring rules that the fork's `writing-for-agents` lacks.
- **SDD's on-disk ledger, ruling log and review-package scripts** (entries 5 and 7): concrete fixes for compaction loss, bloated dispatches and truncated review diffs. They are ideas the fork's `implement-spec` could borrow without adopting the workflow.
- **`verification-before-completion`** and **`receiving-code-review`** (entries 12 and 14): small discipline skills with no fork counterpart.
- **Skill-triggering tests** (entry 22): `claude -p --plugin-dir ... --output-format stream-json`, then grep the stream for the `Skill` call and for tools used before it. A cheap regression check for model-invoked descriptions.

**Biggest open questions:**

1. **Bootstrap or not (tickets #14, #15).** Superpowers argues that skills do not fire reliably without a forced "check first" rule, while the fork relies on plain descriptions. Is the owner seeing missed triggers that would justify any always-on nudge? If so, could it be a few lines rather than a ~1.1k-token skill body?
2. **Two skill-writing philosophies (ticket #17).** Superpowers shapes discipline with Iron Laws, rationalization tables, capitals and persuasion principles ([`persuasion-principles.md`][persuasion]). The fork's [`writing-for-agents`][fork-wfa] hunts no-ops and tunes leading words. Superpowers' own [`writing-skills`][ws] partly reconciles them ("Match the Form to the Failure": prohibitions for discipline failures, recipes for shape failures). The collection needs one stance before borrowing any discipline skill wholesale.
3. **Owner's Codex has superpowers enabled at user scope.** That is roughly 0.6 to 0.9k idle tokens in every Codex session (inference, chars / 4) and a second, competing TDD/debug/plan chain beside the fork's skills. Keep, disable, or make it a pack? This belongs with the migration item in the map's "Not yet specified".
4. **Which workflow chain owns "plan, then execute"?** Superpowers runs brainstorming → spec file → plan file → SDD or inline execution, all as local Markdown under `docs/superpowers/`. The fork runs grilling → `to-spec` → `to-tickets` → `implement`/`implement-spec` on an issue tracker. Running both would double-trigger (brainstorming's description says "You MUST use this before any creative work"). Which pieces cross over, if any (ticket #15)?

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Cross-references use the `superpowers:` namespace | e.g. [`systematic-debugging`][debug] Phase 4 names `superpowers:test-driven-development`; [`writing-plans`][wp] header names `superpowers:subagent-driven-development` | Every copied skill needs its references renamed to collection names |
| Voice: "your human partner" is deliberate | [`AGENTS.md`][agents-md] ("'your human partner' is deliberate, not interchangeable with 'the user'") | Harmless to keep. Rewording is fine for us, but the result loses the upstream eval backing (inference) |
| Artifacts default to `docs/superpowers/{specs,plans}/` and `.superpowers/sdd/` | [`brainstorming`][brainstorm] checklist step 6, [`writing-plans`][wp], [`sdd-workspace`][sdd-ws] | Paths need adapting to the owner's `docs/` and tracker layout |
| Generic-stack examples (`npm test`, `cargo test`, `pytest`, `go test`) | [`finishing-a-development-branch`][finish] Step 1, [`using-git-worktrees`][worktrees] Step 2 | No Unity Test Runner path; Unity steps would route through the fork's `unity-verification` |
| Bash required for hooks and scripts | [`run-hook.cmd`][run-hook] polyglot wrapper; scripts invoked as `bash scripts/...` | Works on the owner's Windows machine through Git Bash (inference from the wrapper's search order); silently skips the hook if no bash is found |
| Skills mutually reference each other as a chain | brainstorming → writing-plans → SDD/executing-plans → requesting-code-review → finishing-a-development-branch | Taking one link usually drags others or needs its exits rewritten |

## Entries

Entries run always-on design and packaging first, then the workflow chain, then discipline skills, then meta (skill-writing and testing), then other mechanisms. Where a group of files does one job, one entry covers the group and names each file.

---

### 1. `SessionStart` bootstrap hook + `using-superpowers`

- **What it is.** [`hooks/hooks.json`][hooks-json] registers a synchronous `SessionStart` command on `startup|clear|compact`. [`hooks/session-start`][hook-ss] reads `skills/using-superpowers/SKILL.md`, wraps it in `<EXTREMELY_IMPORTANT>You have superpowers.` and emits it as `additionalContext`. It branches on environment variables to emit the field shape Cursor, Claude Code, Muse or Copilot expects, because "Claude Code reads BOTH ... without deduplication". The injected skill ([`using-superpowers/SKILL.md`][using-sp]) has a `<SUBAGENT-STOP>` guard and the 1% rule ("Invoke relevant or requested skills BEFORE any response or action — including clarifying questions"). It also has a 12-row "Red Flags" table of rationalizations, a process-before-implementation priority rule, a pointer to per-harness tool references, and a closing rule that user instructions (CLAUDE.md, AGENTS.md) beat skills.
- **Kind**: hook + skill (always-on).
- **Proposed address**: idea-only input to ticket #14 (always-on) and #15 (gating).
- **Why it could fit.** It is the strongest worked example of an always-on "use your skills" nudge, and it is honest about why one exists. The `SUBAGENT-STOP` guard, the `compact` matcher (re-inject after compaction) and the "user instructions win" line are each small, reusable ideas. The event-variable branching in `session-start` is useful prior art if the collection ever ships a hook for Claude and Codex together.
- **Why it might not.** It costs about 2k tokens per Claude session (840 descriptions + ~1.1k body; [loading-mechanics §4](../loading-mechanics.md)), and the hook fires again on every `clear` and `compact`. The 1% rule turns every message, including trivial questions, into a skill check. Inference: this also costs turns and pulls whole skill bodies in where the owner wants a quick answer. It conflicts directly with the map's rule that expensive workflows are user-invoked and only *suggested*: under the bootstrap, brainstorming, worktrees and plans fire on their own.
- **Copy / adapt / idea-only**: idea-only. A copy would re-create the exact idle cost the map budgets against, and its wording references superpowers' skill names throughout.
- **Overlap**: fork `ask-matt` (a user-invoked router, the opposite design); pstack `poteto-mode` (ledger entry 1, user-invoked router). Unity baseline: none.
- **Idle context cost**: ~1.1k tokens of hook output per session start, clear and compact, plus ~60 for the skill's own description (`claude plugin details`).
- **Recommendation (proposed)**: reject as a mechanism. Carry three ideas into ticket #14: re-inject after `compact`, add a subagent opt-out line, and keep any always-on nudge to a few lines that name *when to suggest* user-invoked skills.

### 2. Multi-harness packaging and the porting guide

- **What it is.** One repo carries manifests for about ten harnesses: [`.claude-plugin/plugin.json`][cc-manifest] (auto-discovers `skills/` and `hooks/hooks.json`), [`.codex-plugin/plugin.json`][cx-manifest] (declares `"skills": "./skills/"` and `"hooks": {}`, "specifically to suppress Codex's `hooks/hooks.json` auto-discovery"), `.cursor-plugin`, `.devin-plugin`, `.kimi-plugin`, `.muse-plugin`, `.hermes-plugin`, `gemini-extension.json` plus `GEMINI.md`, an OpenCode JS plugin and a Pi extension. [`docs/porting-to-a-new-harness.md`][porting] sets out three shapes for delivering the bootstrap (shell hook, code plugin, instructions file). It states two rules: skills name *actions*, never tools, with tool names mapped in [`references/<harness>-tools.md`][refs]; and nothing ever edits the user's own config. [`.version-bump.json`][vbump] plus [`scripts/bump-version.sh`][bump] keep 11 version fields in sync, with `--check` for drift and `--audit` for stray old strings.
- **Kind**: manifest-packaging + convention doc + script.
- **Proposed address**: idea-only input to ticket #18 (install architecture); `bump-version.sh` idea to ticket #17.
- **Why it could fit.** It confirms ticket #2's finding that one Claude-format repo can serve Codex. Superpowers runs the identical `skills/` tree on both, with only a manifest difference. "Skills name actions, not tools" plus a per-harness tool-mapping file is a clean way to keep one skill body for Claude and Codex. The version-bump audit suits a collection that may ship several plugin manifests (core plus packs).
- **Why it might not.** Eight of the ten harnesses are out of scope (the map says Claude Code first, Codex second). The tool-mapping files are written for superpowers' own dispatch vocabulary.
- **Copy / adapt / idea-only**: idea-only for the manifests. `bump-version.sh` could be adapted if the collection ends up with several manifests.
- **Overlap**: fork's own plugin marketplace setup ([fork README][fork-readme]); pstack entry 2 (packaging convention).
- **Idle context cost**: n/a (mechanism).
- **Recommendation (proposed)**: record as prior art for ticket #18, especially `"hooks": {}` as a way to keep a Claude-only hook out of Codex. Note one inconsistency for whoever relies on it: the README's Muse section says the bootstrap runs via SessionStart "alongside Claude Code, Codex, Cursor...", which contradicts the Codex manifest and the porting guide. Trust the manifest.

### 3. `brainstorming` (with visual companion and spec reviewer prompt)

- **What it is.** A model-invoked design gate ([`brainstorming/SKILL.md`][brainstorm], 285 lines). It first discovers intent and writes back an understanding the human can correct. It then classifies the request as **spike**, **bounded** or **architectural**, says the classification aloud, and applies a `<HARD-GATE>`: no implementation, scaffolding or implementation skill until that path's approval. Spike gets a nod, bounded gets an in-chat design and an explicit yes, and architectural gets a written spec in `docs/superpowers/specs/`, self-review, human review, and then *only* `writing-plans`. "When in doubt between two paths, take the heavier one," and the path only ratchets up. An optional browser "visual companion" ([`visual-companion.md`][visual], [`server.cjs`][server]) serves mockups from a local server. It is offered just in time and loads a Prime Radiant logo as opt-out telemetry unless `SUPERPOWERS_DISABLE_TELEMETRY` or `DISABLE_TELEMETRY` is set ([README, telemetry][readme-telemetry]). [`spec-document-reviewer-prompt.md`][spec-reviewer] is not referenced from any skill (grep across `skills/`). Inference: it is orphaned, like the `plan-document-reviewer-prompt.md` that v6.4.2 deleted for the same reason ([release notes][relnotes]).
- **Kind**: skill (+ script, prompt template).
- **Proposed address**: idea-only; if anything, ideas for the fork's grilling/`to-spec` chain (core user-invoked).
- **Why it could fit.** The three-path classification, said aloud so the human can override it, is a cheap way to scale process to task size. "Approval of an idea ... does not approve artifacts that do not exist yet" names a real failure, and the release notes cite the session that motivated it. The intent-first step ("Knowing the app genre does not tell you why your partner wants it") is sharp.
- **Why it might not.** Its description ("You MUST use this before any creative work") makes it fire on almost every feature request. That is the opposite of the map's "expensive workflows are user-invoked". It competes head-on with fork `grilling`, `grill-with-docs`, `to-spec` and `wayfinder`. The architectural path writes local spec files, while the owner's flow publishes to the issue tracker. The visual companion is a Node server with telemetry, an odd fit for Unity work.
- **Copy / adapt / idea-only**: idea-only. A direct copy would bring the forced trigger, the `superpowers:` chain and the `docs/superpowers/` paths.
- **Overlap**: fork `grilling`, `grill-me`, `grill-with-docs`, `to-spec`, `wayfinder`, `prototype` (spike path). Unity baseline: none.
- **Idle context cost**: ~70 tokens if model-invoked; ~6.3k on invoke (`claude plugin details`).
- **Recommendation (proposed)**: reject the skill. Offer the spike/bounded/architectural classification and the "approval covers only the stage presented" rule to the fork's grilling or `to-spec` as wording ideas.

### 4. `writing-plans`

- **What it is.** Turns a spec into a plan file ([`writing-plans/SKILL.md`][wp]). The plan has a fixed header (Goal, Architecture, Tech Stack, Spec path), **Global Constraints** copied verbatim from the spec, and **Review Focus**: up to five failure modes the spec implies but no task tests, each pinned by a test in the owning task. Tasks carry `Files` and `Interfaces` (Consumes/Produces). v6.4.2 rewrote step content as "a plan records decisions": test steps give names and assertions, code steps give exact signatures and spec values, and bodies appear only for undetermined algorithms. A **Proportion** self-check flags a plan "several times longer than the spec" as a transcript. The release notes report plans in "a quarter of the time and about a third of the tokens" with unchanged results on planted-defect probes ([relnotes v6.4.2][relnotes]). It ends by asking the human to review and pick Subagent-driven or Native execution, with a recommendation.
- **Kind**: skill.
- **Proposed address**: idea-only for fork `to-tickets` / `to-spec` (core user-invoked).
- **Why it could fit.** "Interfaces block per task" solves exactly the problem of a subagent seeing only its own ticket, which fork `implement-spec` has with tracker tickets. "Review Focus" (spec-implied but untested inputs) is a sharp, cheap addition to any spec or ticket template. The proportion check guards against over-specified plans, and the release notes say Opus-class models tend toward exactly that.
- **Why it might not.** It produces one local plan file with numbered tasks, while the fork splits work into tracker tickets with blocking edges. Its executors (`sdd-workspace`, `task-brief`) parse the `### Task N` headings, so the format is coupled to entries 5 and 6.
- **Copy / adapt / idea-only**: idea-only. The plan format only pays off together with superpowers' executors.
- **Overlap**: fork `to-spec`, `to-tickets`, `wayfinder`. Addy and pstack ledgers: pstack's Multi-phase plan playbook (pstack entry 36).
- **Idle context cost**: ~30 tokens if model-invoked; ~3.3k on invoke (6.4.1 figure; 6.4.2 is shorter).
- **Recommendation (proposed)**: reject the skill. Propose adding "Interfaces (consumes/produces)" and "Review Focus" fields to the fork's ticket shape, and the proportion check to `to-tickets`.

### 5. `subagent-driven-development` (SDD)

- **What it is.** The controller loop for running a plan ([`subagent-driven-development/SKILL.md`][sdd], 568 lines, the largest skill). Before Task 1 it runs a preflight conflict scan written as a table into the ledger. Each task gets a fresh implementer subagent ([`implementer-prompt.md`][sdd-impl]), which reads a task brief extracted by [`task-brief`][sdd-brief], writes its full report to a file and returns only status. A task reviewer then checks spec compliance and quality ([`task-reviewer-prompt.md`][sdd-reviewer]) against a diff file built by [`review-package`][sdd-pkg]. The fix loop allows five rounds: rounds 1-3 resume the same implementer, and rounds 4-5 bring a fresh one on a stronger model. At the cap a "breaker" makes the controller adjudicate and park findings with recorded rulings. A final whole-branch review runs on the most capable model, then one fix wave. Explicit **Model Selection** rules apply ("Always specify the model explicitly", "Turn count beats token price"). Implementers must never spawn subagents. The controller only stops for four classes: destructive, security-sensitive, outside-worktree side effects, or a plan where every path is a guess. On Claude Code, the whole loop can opt-in run one layer down as a nested mid-tier orchestrator ([`claude-code-tools.md`][refs-cc]); the release notes say this measured "about half the cost and wall clock" ([relnotes v6.4.1][relnotes]).
- **Kind**: skill (+ scripts, prompt templates).
- **Proposed address**: idea-only for fork `implement-spec` / `implement` (core user-invoked).
- **Why it could fit.** Many of its rules are hard-won, session-cited fixes that apply to any delegating workflow: hand artifacts over as files, not pasted text ("a real session's dispatch hit 42k chars of which 99% was pasted history"); never use `HEAD~1` for a multi-commit task; one fix dispatch for the final review, not one per finding; workers don't spawn reviewers. The model-selection section is the clearest guidance found so far on tiering subagents in Claude Code. The owner runs agentic workflows, and fork `implement-spec` already delegates to implementer subagents.
- **Why it might not.** It is a full alternative to the fork's tracker-based `implement-spec`: sequential tasks only ("Never dispatch multiple implementation subagents in parallel"), where the fork runs a parallel frontier across worktrees. It is ~12k tokens on invoke. "Rulings, not stalls" gives the controller broad authority to decide plan conflicts, which the owner should accept deliberately. For Unity, every implementer would also need the Unity verification route, which superpowers knows nothing about.
- **Copy / adapt / idea-only**: idea-only for the skill. The prompts and scripts could be adapted (see entry 7).
- **Overlap**: fork `implement-spec`, `implement`, `code-review`; pstack `swarm`/Orchestrate (pstack entries 12, 36).
- **Idle context cost**: ~40 tokens if model-invoked; ~11.8k on invoke.
- **Recommendation (proposed)**: reject as a skill. Take into the fork's `implement-spec` (via ticket #16 or a theme session): the Model Selection rules, "artifacts as files", the no-nested-reviewer contract, the BASE-recording rule, and the single final fix wave.

### 6. `executing-plans` (Native / inline execution)

- **What it is.** Rebuilt in v6.4.1 from a 64-line stub that "measured the same as running with no plugin at all" ([relnotes v6.4.1][relnotes]). The session implements every task itself, sharing SDD's workspace and ledger format so a plan can switch executors mid-flight. It uses TDD as the per-task gate, then dispatches one fresh whole-branch review on the most capable model ([`executing-plans/SKILL.md`][exec]). [`task-start`][exec-start] and [`task-done`][exec-done] record BASE and run the test command; the completion line goes into the ledger only if the command passes.
- **Kind**: skill (+ scripts).
- **Proposed address**: idea-only.
- **Why it could fit.** "Cheap executor, expensive reviewer at the end" is a sensible cost shape for a solo dev on a mid-tier session model. `task-done` (ledger only on green) is a nice honesty mechanism.
- **Why it might not.** It depends on the plan format from entry 4 and the workspace from entry 7. Fork `implement` already covers "implement it myself, then `/code-review`" in 17 lines.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement`, `code-review`.
- **Idle context cost**: ~60 tokens if model-invoked; ~7.3k on invoke.
- **Recommendation (proposed)**: reject; mention "ledger only on a passing test command" as an idea for fork `implement`.

### 7. SDD workspace, ledger and ruling log (scripts + convention)

- **What it is.** The persistence layer under entries 5 and 6. [`sdd-workspace`][sdd-ws] gives each plan a git-ignored directory under `.superpowers/sdd/<plan>/`, claimed through a `plan-path` file, with collision handling (v6.4.1 fixed two plans with the same basename sharing one). `progress.md` starts with an identity line and gets `Task N: complete (commits a..b, review clean)`, fix-round lines, deferred minors and `Ruling: <what> — <why> — <cost if wrong>` lines. The controller must trust the ledger and `git log` over its own memory after compaction, because "controllers that lost their place have re-dispatched entire completed task sequences — the single most expensive failure observed" ([SDD Setup][sdd]). At the end, every `Ruling:` line is copied into the final message under "Rulings I made" ("A ruling that dies with the workspace was a decision made in secret"). [`review-package`][sdd-pkg] writes commits, stat and `-U10` diff to one file, and rejects empty or non-descendant ranges (exit 3).
- **Kind**: script + convention doc.
- **Proposed address**: core, as scripts/conventions bundled with whichever implement skill the collection keeps (user-invoked).
- **Why it could fit.** Compaction loss during long delegated runs is a real failure for the owner's agentic workflows. A ledger file plus "Rulings I made" is a small, harness-neutral answer. `review-package` is about 50 lines of bash, has no dependencies, and fits fork `code-review` (which reviews "since a fixed point") as well as `implement-spec`.
- **Why it might not.** Fork `implement-spec` keeps state on the tracker (tickets, integration branch), which already survives compaction. A second ledger could duplicate it.
- **Copy / adapt / idea-only**: adapt. `review-package` copies almost as-is (drop the `PLAN_FILE` argument). The ledger and ruling conventions need rewording for tickets instead of plan tasks. MIT licence ([`LICENSE`][license]).
- **Overlap**: fork `implement-spec` (tracker state), `handoff`/`claude-handoff` (session continuity); pstack `show-me-your-work` + `log.sh` (pstack entry 18, decision trail).
- **Idle context cost**: 0 (scripts read only when a skill points at them).
- **Recommendation (proposed)**: adopt-adapted. Take `review-package` and the "Rulings I made" convention into the fork's delegation skills. Decide in the same theme as pstack's `show-me-your-work`.

### 8. `dispatching-parallel-agents`

- **What it is.** A short pattern ([`dispatching-parallel-agents/SKILL.md`][dpa], 167 lines): when there are several *independent* failures (e.g. "3+ test files failing with different root causes"), dispatch one focused agent per domain concurrently, with a prompt structure and an integrate-and-verify step.
- **Kind**: skill.
- **Proposed address**: none, or idea-only.
- **Why it could fit.** The independence test (related failures → one agent) is correct and short.
- **Why it might not.** Current models already fan out like this when they have an Agent tool (inference). The description, "Use when facing 2+ independent tasks", is broad and would fire often for a small gain.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement-spec` (parallel frontier), `code-review` (parallel sub-agents).
- **Idle context cost**: ~40 tokens if model-invoked; ~2.2k on invoke.
- **Recommendation (proposed)**: reject.

### 9. `test-driven-development` (with `writing-good-tests.md`)

- **What it is.** The Iron Law "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST": code written before its test is deleted ("Don't keep it as 'reference'"). It covers red-green-refactor with verify-red and verify-green steps, a rationalization table and red flags ([`test-driven-development/SKILL.md`][tdd]). Since v6.4.1, the project's whole suite defines green, not one test file ([relnotes][relnotes]). [`writing-good-tests.md`][tdd-good] adds "Name the Break" (each test names the bug it catches), "Exercise the Real Thing", "derive expected values by hand, never with the code under test", and a **mutation check**: wrong constant, wrong branch, missing side effect, default return, missing validation.
- **Kind**: skill.
- **Proposed address**: idea-only for fork `tdd`.
- **Why it could fit.** The mutation check and "derive expected values by hand" are concrete, checkable test-quality rules that the fork's `tdd` could gain cheaply. "Run the whole suite, report every failure by name" is backed by an eval result in the release notes ("11 of 12 probe runs" ran one file only).
- **Why it might not.** Fork `tdd` is model-invoked and already does red-green-refactor, with Unity test rules behind it in `unity-testing`. Two TDD skills would double-trigger (different names, so no collision). "Delete means delete" is rigid for exploratory Unity work, where PlayMode behaviour often has to be seen before it can be specified (inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `tdd`, `unity-testing`; pstack `tdd` (pstack entry 20); pstack `principle-test-behavior-not-implementation`.
- **Idle context cost**: ~30 tokens if model-invoked; ~3.5k on invoke.
- **Recommendation (proposed)**: reject the skill. Offer the mutation check, "Name the Break" and "whole suite defines green" to fork `tdd` as additions.

### 10. `systematic-debugging` (with supporting techniques)

- **What it is.** "NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST" over four phases: root cause, pattern analysis, hypothesis, implementation ([`systematic-debugging/SKILL.md`][debug]). After three failed fixes, stop and question the architecture with the human. Supporting files: [`root-cause-tracing.md`][debug-rct] (trace backward to the trigger), [`defense-in-depth.md`][debug-did] (validate at every layer after the fix), [`condition-based-waiting.md`][debug-cbw] (poll for conditions, not sleeps), and [`find-polluter.sh`][debug-polluter] (bisect which test leaves stray state). It also ships three pressure-test scenarios and a [`CREATION-LOG.md`][debug-log] showing how the skill was extracted and bulletproofed.
- **Kind**: skill (+ reference docs, script, test scenarios).
- **Proposed address**: idea-only for fork `diagnosing-bugs` / `unity-debugging`.
- **Why it could fit.** "Three failed fixes → stop and question the architecture" is a clear, checkable breaker. `condition-based-waiting` maps directly to Unity PlayMode tests that use `WaitForSeconds` (inference: the same flakiness class). The pressure scenarios are good examples for entry 18.
- **Why it might not.** Fork `diagnosing-bugs` (140 lines) already runs a disciplined loop (feedback loop → minimise → hypothesise → instrument → fix → regression-test), and `unity-debugging` maps Unity symptoms. The two would compete on "bug" triggers.
- **Copy / adapt / idea-only**: idea-only for the skill. `condition-based-waiting.md` could be adapted as a Unity pack reference.
- **Overlap**: fork `diagnosing-bugs`, `unity-debugging`, `unity-testing`.
- **Idle context cost**: ~40 tokens if model-invoked; ~3.4k on invoke.
- **Recommendation (proposed)**: reject the skill. Offer the 3-fix breaker to fork `diagnosing-bugs`, and consider a Unity version of condition-based waiting for `unity-testing`.

### 11. `using-git-worktrees`

- **What it is.** Detect existing isolation first (`git-dir` vs `git-common-dir`, with a submodule guard), ask consent, prefer the harness's native worktree tool (e.g. `EnterWorktree`), and fall back to `git worktree add` under a git-ignored `.worktrees/`. Then run project setup and verify a clean test baseline ([`using-git-worktrees/SKILL.md`][worktrees]).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** "Prefer native tools; manual worktrees create phantom state your harness can't see" is correct for Claude Code, which has `EnterWorktree`.
- **Why it might not.** For Unity, a new worktree means a fresh `Library/` and a full reimport. Inference: that can take many minutes, so "isolation by default" is expensive in the owner's main stack. Fork `implement-spec` already handles worktrees, and points to `unity` for parallel worktrees in Unity repos.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement-spec`, `unity`.
- **Idle context cost**: ~70 tokens if model-invoked; ~2.4k on invoke.
- **Recommendation (proposed)**: reject.

### 12. `verification-before-completion`

- **What it is.** "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE" ([`verification-before-completion/SKILL.md`][verify], 120 lines). A five-step gate (identify the command, run it fully, read the output, check it confirms the claim, then claim). A table maps each claim to its required evidence (e.g. "Agent completed → VCS diff shows changes, not agent reports 'success'"). Red flags include "should", "probably" and premature "Done!".
- **Kind**: skill.
- **Proposed address**: core model-invoked, or folded into core always-on text (ticket #14).
- **Why it could fit.** It is small (~1.2k on invoke), harness-neutral, and targets a failure common to every stack. "Trusting agent success reports" matters for the owner's delegated workflows. The fork has no general counterpart; `unity-verification` covers only Unity, where it is the stronger, stack-specific check.
- **Why it might not.** Inference: much of it restates what current Claude models and the harness's own instructions already push (verify before claiming), so parts may be no-ops in the fork's `writing-for-agents` sense. That would need a baseline test (entry 18) to settle. The capitals-heavy style differs from the fork's.
- **Copy / adapt / idea-only**: adapt. Keep the claim→evidence table; route Unity claims to `unity-verification`; drop the `superpowers` voice where it adds nothing.
- **Overlap**: fork `unity-verification` (Unity-only), `implement`/`code-review` close-out; Addy ledger (ticket #6) may have a verification skill (not checked here).
- **Idle context cost**: ~80 tokens as written (225-char description). A trimmed trigger-only description would be ~40.
- **Recommendation (proposed)**: adopt-adapted as a candidate for core, **after** a baseline test shows it changes behaviour. Decide in the same theme as other "evidence before claims" candidates.

### 13. `requesting-code-review` (with `code-reviewer.md`)

- **What it is.** Dispatch a reviewer subagent with crafted context (never session history), using a template ([`code-reviewer.md`][cr-template]) that grades findings Critical/Important/Minor, judges behaviour the spec doesn't mention "by what a reasonable user would expect", and lists what it "Declined to judge" ([`requesting-code-review/SKILL.md`][req-cr]).
- **Kind**: skill (+ prompt template).
- **Proposed address**: idea-only for fork `code-review`.
- **Why it could fit.** "Declined to judge" is a neat honesty slot: it makes reviewer scope gaps visible to the caller.
- **Why it might not.** Fork `code-review` is a fuller two-axis (Standards and Spec) parallel review. The skill's own example still defaults `BASE_SHA` to `HEAD~1`, which SDD forbids for multi-commit tasks (an internal inconsistency at this SHA).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `code-review`.
- **Idle context cost**: ~40 tokens if model-invoked; ~1k on invoke.
- **Recommendation (proposed)**: reject; offer the "Declined to judge" section to fork `code-review`'s report shape.

### 14. `receiving-code-review`

- **What it is.** How to respond to review feedback ([`receiving-code-review/SKILL.md`][recv-cr], 205 lines): read, restate, verify against the codebase, evaluate, then respond or push back. It forbids performative agreement ("You're absolutely right!"). If any item is unclear, ask before implementing any of them. It covers external reviewers differently from the human, includes a YAGNI check for "professional" suggestions, and has a section on GitHub thread replies.
- **Kind**: skill.
- **Proposed address**: core model-invoked (candidate).
- **Why it could fit.** The fork has no counterpart, and the owner receives automated and human PR review. "Clarify all unclear items before implementing any" and "verify the suggestion against this codebase" are concrete and checkable.
- **Why it might not.** Its trigger ("receiving code review feedback") is narrow but frequent once PR bots are involved. The description is long (234 chars). Some content (tone rules) may be no-ops for current models (inference; needs a baseline).
- **Copy / adapt / idea-only**: adapt. Shorten the description to triggers only (entry 17's own rule), and drop the `superpowers` cross-references.
- **Overlap**: none in the fork; pstack `correct` (pstack entry 14) is adjacent.
- **Idle context cost**: ~80 tokens as written; ~40 with a trimmed description.
- **Recommendation (proposed)**: adopt-adapted, pending a baseline test; a candidate for the code-review theme.

### 15. `finishing-a-development-branch`

- **What it is.** Verify the suite, detect the environment (worktree, detached HEAD), then offer four options (merge locally, push and PR, keep, discard with typed confirmation) and clean up the worktree ([`finishing-a-development-branch/SKILL.md`][finish]).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** "Discard needs typed confirmation" and "capture the worktree path before you `cd` away" are careful details.
- **Why it might not.** Its description fires at "implementation is complete", which overlaps the fork's `implement` close-out and `pr`. The test commands are generic-stack (no Unity Test Runner). The owner's CLAUDE.md already governs commits and PRs.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement`, `implement-spec`, `pr`.
- **Idle context cost**: ~40 tokens if model-invoked; ~2.8k on invoke.
- **Recommendation (proposed)**: reject.

### 16. `diagnosing-superpowers`

- **What it is.** A post-mortem skill ([`diagnosing-superpowers/SKILL.md`][diag]) with 11 prompts, 4 references and 4 templates. It runs intake one question at a time, locates the session transcripts on disk ([`session-discovery.md`][diag-disc]), fans out seven parallel analyst subagents (skill timeline, plan adherence, repeated work, stumbles, quality evidence, request conflicts, cost and time) under a "context safety" rule ("One transcript line can be a megabyte"), and writes a report where "Every finding cites `path:line`". Optionally it drafts a GitHub issue or builds a scrubbed bundle through a scrub/audit loop, each step only with approval.
- **Kind**: skill (+ prompt templates).
- **Proposed address**: collection maintenance machinery (ticket #17), user-invoked.
- **Why it could fit.** "Why didn't my skill fire / why was that session so expensive?" is exactly what a collection that budgets idle context and gates workflows needs to answer about its *own* skills. The structure (intake, locate, seven dimensions, cited report) is harness-neutral apart from the transcript format. `tests/claude-code/analyze-token-usage.py` ([link][analyze-tokens]) is a smaller tool for the cost dimension: it breaks token usage down per subagent from a Claude Code session JSONL.
- **Why it might not.** It is built to send bug reports to the superpowers maintainers (issue search, issue template, bundle export). As a model-invoked skill its description is the longest in the plugin (379 chars). It is heavy: seven analyst subagents per run.
- **Copy / adapt / idea-only**: adapt. Keep the intake, locate, analyst dimensions and cited report; drop the GitHub issue and bundle steps; make it user-invoked.
- **Overlap**: fork `retro` (post-session environment improvements; adjacent, not the same); Claude Code's built-in `/skill-doctor` covers per-skill cost and usage ([loading-mechanics §3](../loading-mechanics.md)).
- **Idle context cost**: ~120 tokens as shipped (model-invoked); 0 if user-invoked.
- **Recommendation (proposed)**: adopt-adapted for ticket #17 as a user-invoked "diagnose a session" tool, scoped to the collection's skills. Check first how much `/skill-doctor` already covers.

### 17. `writing-skills` (authoring rules)

- **What it is.** The skill-authoring guide ([`writing-skills/SKILL.md`][ws], 681 lines; ~9.7k on invoke). Its central framing is "Writing skills IS Test-Driven Development applied to process documentation". Three sections stand out: **Skill Discovery Optimization**, i.e. "Description = When to Use, NOT What the Skill Does". It reports that a description summarizing the workflow ("code review between tasks") made an agent do one review where the body required two, and that the trigger-only description fixed it. **Match the Form to the Failure**: prohibitions plus rationalization tables for rule-skipping; positive recipes for wrong-shaped output (prohibitions "measurably backfire" there); required template slots for omissions; conditionals on observable predicates. It adds "No nuance clauses" and "Exemption clauses don't scope". **Micro-Test Wording Before Full Scenarios**: one fresh-context sample per call, always a no-guidance control, 5+ reps, read every flagged match, "Variance is a metric". There are also word-count targets for frequently loaded skills and a skill-creation checklist.
- **Kind**: skill (+ convention doc).
- **Proposed address**: ideas into fork `writing-for-agents` (core model-invoked) and ticket #17.
- **Why it could fit.** The owner is building a skill collection; these are the most evidence-backed authoring rules found so far. The description rule directly serves the map's "every description must earn its cost": trigger-only descriptions are also shorter. "Match the Form to the Failure" fits the fork's no-op and leading-word thinking and gives it a decision table.
- **Why it might not.** As a whole skill it duplicates fork `writing-for-agents` and Anthropic's own `skill-creator` (ticket #8 territory). Its Iron Law style ("Delete means delete" applied to skills written before a test) is heavy for a solo collection.
- **Copy / adapt / idea-only**: idea-only for the skill; the three sections above are candidates to merge into `writing-for-agents` as rewritten content.
- **Overlap**: fork `writing-for-agents`; anthropics/skills `skill-creator` (ticket #8); pstack "Authoring a skill" playbook (pstack entry 34).
- **Idle context cost**: ~40 tokens if model-invoked; ~9.7k on invoke.
- **Recommendation (proposed)**: reject the skill. Propose merging the description rule, the form-to-failure table and the micro-test protocol into `writing-for-agents`, in the theme that decides skill-writing standards.

### 18. Testing skills with subagents (pressure-scenario methodology)

- **What it is.** [`testing-skills-with-subagents.md`][ws-testing] (384 lines) and its worked example [`examples/CLAUDE_MD_TESTING.md`][ws-claudemd]. **RED**: run a realistic scenario *without* the skill and record the agent's rationalizations verbatim. **GREEN**: write the minimum that addresses them. **REFACTOR**: plug each new loophole with an explicit negation, a rationalization-table row, a red flag, and a description update, then re-verify. Scenarios combine 3+ pressures (time, sunk cost, authority, economic, exhaustion, social, pragmatic), force an A/B/C choice, use real paths, and say "This is a real scenario. You must choose and act." **Meta-testing** asks the failing agent how the skill should have been written, and sorts the answer into "skill was clear, I ignored it", "should have said X", or "didn't see section Y". It tests by skill type (discipline, technique, pattern, reference). The CLAUDE.md example compares four documentation variants (soft suggestion, directive, emphatic, process-oriented) against a null baseline. Real scenarios ship with the debugging skill ([`test-pressure-1.md`][debug-p1]).
- **Kind**: CI-eval (manual procedure) + convention doc.
- **Proposed address**: collection maintenance machinery (ticket #17), repo-local, user-invoked.
- **Why it could fit.** The map says "no blind picks" and every description must earn its cost. This procedure checks *whether a skill changes behaviour at all*, which is the baseline needed before adopting entries 12 and 14 or any borrowed discipline skill. The null-baseline control is the same question as the fork's "does it change behaviour versus the default?" no-op test, but runnable. It needs only subagents, which both harnesses have.
- **Why it might not.** It is manual and costs a subagent run per rep (5+ reps per variant). The pressure-scenario style tests *discipline* compliance. It is weaker for the fork's reference-style skills (Unity rules), and the doc says so ("Don't test: Pure reference skills").
- **Copy / adapt / idea-only**: adapt. Strip the `superpowers` framing, then merge with pstack's blinded Eval playbook (pstack entry 33): pstack contributes blinding and grading from files actually opened, superpowers contributes baseline/control, pressure design and meta-testing.
- **Overlap**: pstack Eval playbook (entry 33); anthropics/skills `skill-creator` evals (ticket #8, not checked here); fork `writing-for-agents` (states the no-op test, gives no protocol).
- **Idle context cost**: 0 (repo-local procedure).
- **Recommendation (proposed)**: adopt-adapted. Make it the collection's skill-promotion check, together with pstack's Eval playbook, in ticket #17.

### 19. `persuasion-principles.md` and `anthropic-best-practices.md`

- **What it is.** [`persuasion-principles.md`][persuasion] maps Cialdini-style principles (authority, commitment, scarcity, social proof, unity, reciprocity, liking) to skill wording. It cites "Meincke et al. (2025)" for "33% → 72%" compliance and adds an ethics test ("Would this technique serve the user's genuine interests if they fully understood it?"). [`anthropic-best-practices.md`][anthropic-bp] is a 1,150-line copy of Anthropic's skill-authoring guidance. Superpowers' [`AGENTS.md`][agents-md] also says its "internal skill philosophy differs from Anthropic's published guidance".
- **Kind**: convention doc.
- **Proposed address**: idea-only.
- **Why it could fit.** It explains *why* superpowers' skills read the way they do, which helps judge any discipline skill borrowed from it.
- **Why it might not.** The research claim was not checked against the cited paper here (secondary claim). The Anthropic copy is a vendored snapshot of someone else's docs; the collection should point at the live docs instead (ticket #2 already fetches them).
- **Copy / adapt / idea-only**: idea-only. Don't vendor the Anthropic copy.
- **Overlap**: fork `writing-for-agents` (leading words, "relentless" vs "be thorough"); pstack `unslop`/`technical-writing`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject as files; cite as background in the skill-writing theme. Verify the Meincke et al. figure before quoting it anywhere.

### 20. Graphviz flowcharts in skills (`graphviz-conventions.dot`, `render-graphs.js`)

- **What it is.** Many superpowers skills carry ` ```dot ` process graphs (brainstorming, SDD, executing-plans, TDD, dispatching-parallel-agents). [`writing-skills`][ws] has a "Flowchart Usage" section, [`graphviz-conventions.dot`][ws-dot] fixes node shapes, and [`render-graphs.js`][ws-render] renders a skill's dot blocks to SVG for humans (requires a local graphviz install).
- **Kind**: convention doc + script.
- **Proposed address**: idea-only.
- **Why it could fit.** A decision graph is a compact way to state branching ("Tasks mostly independent? → ..."), and `writing-skills` limits it to non-obvious decisions ("Code in Flowcharts" is listed as an anti-pattern).
- **Why it might not.** Dot source is token-heavy compared with a short numbered list. Inference: SDD's process graph is ~60 lines that largely repeat its prose. The fork's style is prose and short lists.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents` (structure guidance).
- **Idle context cost**: 0 (only inside bodies).
- **Recommendation (proposed)**: reject.

### 21. Skill-triggering tests and plugin tests (`tests/`)

- **What it is.** [`tests/explicit-skill-requests/run-test.sh`][test-explicit] runs `claude -p "<prompt>" --plugin-dir <repo> --dangerously-skip-permissions --max-turns N --output-format stream-json` in a throwaway project. It then greps the stream for a `"name":"Skill"` call with the expected skill (namespaced or not), and flags any non-todo tool used *before* the first Skill call as "premature action". The prompts cover realistic phrasings (e.g. ["skip formalities"][test-skip]). The suite also has Haiku-specific and multi-turn variants. [`tests/hooks/test-session-start.sh`][test-hook] checks the hook's output shape per harness. [`analyze-token-usage.py`][analyze-tokens] breaks session JSONL usage down per subagent. [`docs/testing.md`][testing-doc] separates these plugin tests from the behaviour evals in the external `superpowers-evals` repo (Quorum, real CLI sessions graded against acceptance criteria), which "are slow (3-30+ minutes each)" and not safe for public CI.
- **Kind**: CI-eval + script.
- **Proposed address**: collection maintenance machinery (ticket #17), repo-local.
- **Why it could fit.** A triggering test answers the question the map cares about for every model-invoked skill: does the description fire on the prompts it should, and *not* on the ones it shouldn't? `--plugin-dir` against the collection's own repo is exactly how ticket #2 measured costs. The test is a bash script with grep and no dependencies.
- **Why it might not.** `--dangerously-skip-permissions` in a headless run is a risk the owner must accept per run, kept to a throwaway directory. The tests check only positive triggering. Negative cases (should *not* fire) would need adding. Quorum is a separate lab with a container runtime, too heavy for one person (inference).
- **Copy / adapt / idea-only**: adapt. Reuse the stream-json grep approach, add negative prompts, and run with a permission mode the owner approves.
- **Overlap**: pstack Eval playbook (entry 33); Claude Code `/skill-doctor` (usage data after the fact, not a test).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt-adapted for ticket #17 as a description regression check, run before promoting any model-invoked skill.

### 22. Contributor guidelines for agents (`AGENTS.md`) and the PR template

- **What it is.** [`AGENTS.md`][agents-md] opens with "If You Are an AI Agent ... Stop." It cites a 94% PR rejection rate and makes the agent responsible for protecting its human from a slop PR. Before opening one, the agent must fill the template, search open and closed PRs, verify a real problem was experienced, disclose model, harness and plugins, and show the full diff for approval. It rejects "compliance" rewrites of skills without eval evidence, and requires a session transcript for new harness support, with a fixed acceptance prompt ("Let's make a react todo list" must auto-trigger brainstorming).
- **Kind**: convention doc.
- **Proposed address**: idea-only (relevant only if the collection or the fork is published and takes contributions).
- **Why it could fit.** The fork is meant to stay publishable. An agent-facing "before you open a PR" gate, with a disclosure requirement and a fixed acceptance test, is cheap prior art.
- **Why it might not.** The collection is personal, and the fork has few outside contributors (inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork's own repo docs (not compared).
- **Idle context cost**: 0 for the collection. It loads only inside the superpowers repo.
- **Recommendation (proposed)**: park; revisit only if the fork starts taking PRs (ticket #16).

### 23. Repo hygiene scripts (`lint-shell.sh`, pre-commit)

- **What it is.** [`scripts/lint-shell.sh`][lint-shell] runs ShellCheck and syntax checks on changed shell scripts (`--all`, `--format` with shfmt, `--strict`). [`.pre-commit-config.yaml`][precommit] lints only the external `evals/` Python with ruff and ty.
- **Kind**: script + CI-eval.
- **Proposed address**: idea-only for ticket #17.
- **Why it could fit.** If the collection ships bash scripts (hooks, `review-package`), a changed-files ShellCheck pass is cheap insurance, and Windows plus Git Bash makes shell edge cases likely.
- **Why it might not.** It is generic; any ShellCheck wrapper does the same.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `setup-pre-commit` (misc).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: note for ticket #17; no adoption needed.

## Idle cost summary (Claude Code, if the plugin were enabled)

| Piece | Tokens per session | Source |
|---|---|---|
| 15 skill descriptions | ~840 | `claude plugin details superpowers` (6.4.1) |
| `SessionStart` injection of `using-superpowers` | ~1.1k (plus again after each `clear`/`compact`) | [`hooks/session-start`][hook-ss]; on-invoke figure for `using-superpowers` from `plugin details`; [loading-mechanics §4](../loading-mechanics.md) |
| **Total** | **~2k** | |

On Codex (the owner's current state), the descriptions load without the hook: 2,310 description characters plus names and paths, roughly 0.6 to 0.9k tokens, plus Codex's fixed skills preamble, which is paid anyway (inference: chars / 4; [loading-mechanics §1](../loading-mechanics.md)).

If the candidates proposed for adoption above were taken as core model-invoked skills with trigger-only descriptions (entries 12 and 14), the cost would be about 80 tokens. Entries 7, 16, 18 and 21 are repo-local or user-invoked and cost nothing idle.

## Not covered and limits

- Read in full: `using-superpowers` and its Claude Code and Codex references, `brainstorming`, `writing-plans`, `subagent-driven-development`, the three SDD scripts, the hook and its wrapper, all manifests, `README.md`, `AGENTS.md`, the v6.4.1 and v6.4.2 release notes, the porting guide's Parts 1 and Shape A, and `docs/testing.md`. Read in part (opening sections, headings and the passages cited): `executing-plans`, `test-driven-development` and `writing-good-tests.md`, `systematic-debugging` and its three technique files, `verification-before-completion`, `requesting-` and `receiving-code-review`, `code-reviewer.md` (headings), `dispatching-parallel-agents`, `using-git-worktrees`, `finishing-a-development-branch`, `diagnosing-superpowers` (SKILL.md and `session-discovery.md`), `writing-skills` (SDO, testing, form-to-failure, RED-GREEN-REFACTOR sections), `testing-skills-with-subagents.md`, `persuasion-principles.md`, the explicit-skill-request test runner, and the opening of `implementer-prompt.md`. Not opened: the other SDD prompt bodies, `visual-companion.md` past its first sections, the brainstorm server source beyond its host and telemetry lines, the diagnosis analyst prompts and templates, the per-harness tool references other than Claude Code and Codex, `docs/plans/` and `docs/superpowers/{specs,plans}/` (the project's own dogfooded design history), and the OpenCode, Pi, Hermes and Kimi integration code.
- The external eval lab `prime-radiant-inc/superpowers-evals` was not read. Its default branch was at `e64684c` on 2026-10-09 (via `gh api`), recorded for whoever follows up.
- Idle-cost numbers are from `claude plugin details` on the installed 6.4.1. v6.4.2 changes only `writing-plans` among skills, and its description is unchanged, so the idle figures hold.
- Claims about release-note eval results ("9/9", "11 of 12", "about half the cost") are the project's own reports, not reproduced here.
- Unity baseline overlap: none found. The baseline is feature-recipe skills plus `unity-cli` (ticket #3), and superpowers is stack-neutral process. Addy (#6) and anthropics/skills (#8) ledgers did not exist at the time of writing, so overlap with them is noted only where obvious.
- Superpowers is MIT ([`LICENSE`][license]); keep the notice with anything copied.

[root]: https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d
[license]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/LICENSE
[readme-telemetry]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/README.md#visual-companion-telemetry
[relnotes]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/RELEASE-NOTES.md
[agents-md]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/AGENTS.md
[cc-manifest]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/.claude-plugin/plugin.json
[cx-manifest]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/.codex-plugin/plugin.json
[vbump]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/.version-bump.json
[bump]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/scripts/bump-version.sh
[lint-shell]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/scripts/lint-shell.sh
[precommit]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/.pre-commit-config.yaml
[porting]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/docs/porting-to-a-new-harness.md
[testing-doc]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/docs/testing.md
[hooks-json]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/hooks/hooks.json
[hook-ss]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/hooks/session-start
[run-hook]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/hooks/run-hook.cmd
[skills]: https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills
[tests]: https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/tests
[using-sp]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/using-superpowers/SKILL.md
[refs]: https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/using-superpowers/references
[refs-cc]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/using-superpowers/references/claude-code-tools.md
[brainstorm]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/brainstorming/SKILL.md
[visual]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/brainstorming/visual-companion.md
[server]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/brainstorming/scripts/server.cjs
[spec-reviewer]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/brainstorming/spec-document-reviewer-prompt.md
[wp]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-plans/SKILL.md
[sdd]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/SKILL.md
[sdd-impl]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/implementer-prompt.md
[sdd-reviewer]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/task-reviewer-prompt.md
[sdd-brief]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/scripts/task-brief
[sdd-pkg]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/scripts/review-package
[sdd-ws]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/subagent-driven-development/scripts/sdd-workspace
[exec]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/executing-plans/SKILL.md
[exec-start]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/executing-plans/scripts/task-start
[exec-done]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/executing-plans/scripts/task-done
[dpa]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/dispatching-parallel-agents/SKILL.md
[tdd]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/test-driven-development/SKILL.md
[tdd-good]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/test-driven-development/writing-good-tests.md
[debug]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/SKILL.md
[debug-rct]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/root-cause-tracing.md
[debug-did]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/defense-in-depth.md
[debug-cbw]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/condition-based-waiting.md
[debug-polluter]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/find-polluter.sh
[debug-log]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/CREATION-LOG.md
[debug-p1]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/systematic-debugging/test-pressure-1.md
[worktrees]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/using-git-worktrees/SKILL.md
[verify]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/verification-before-completion/SKILL.md
[req-cr]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/requesting-code-review/SKILL.md
[cr-template]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/requesting-code-review/code-reviewer.md
[recv-cr]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/receiving-code-review/SKILL.md
[finish]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/finishing-a-development-branch/SKILL.md
[diag]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/diagnosing-superpowers/SKILL.md
[diag-disc]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/diagnosing-superpowers/references/session-discovery.md
[ws]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/SKILL.md
[ws-testing]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/testing-skills-with-subagents.md
[ws-claudemd]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/examples/CLAUDE_MD_TESTING.md
[ws-dot]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/graphviz-conventions.dot
[ws-render]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/render-graphs.js
[persuasion]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/persuasion-principles.md
[anthropic-bp]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/skills/writing-skills/anthropic-best-practices.md
[test-explicit]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/tests/explicit-skill-requests/run-test.sh
[test-skip]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/tests/explicit-skill-requests/prompts/skip-formalities.txt
[test-hook]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/tests/hooks/test-session-start.sh
[analyze-tokens]: https://github.com/obra/superpowers/blob/8ca22dba9a94f28898bbce59f2537ff4d87c747d/tests/claude-code/analyze-token-usage.py
[fork-readme]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/README.md
[fork-wfa]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/writing-for-agents/SKILL.md
