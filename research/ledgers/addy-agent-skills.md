# Ledger: Addy Osmani agent-skills

Source: `addyosmani/agent-skills`, read at commit [`1401c8b`][root] (committed 2026-10-03, plugin version 0.6.12 per [`.claude-plugin/plugin.json`][cc-plugin]). Read on 2026-10-09 from a shallow clone in the session scratchpad. Nothing was installed or executed. Every source link below is pinned to that SHA. Fork links point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`, the same SHA the pstack ledger and the Unity baseline report used.

This ledger deepens the fork's earlier review, `research/2026-10-09-addy-agent-skills-evaluation.md` in the fork ("the earlier review"). That review read the same HEAD SHA through `main` URLs. It made the case for `constraint-driven-development`, `deprecation-and-migration`, `observability-and-instrumentation`, `api-and-interface-design` and `doubt-driven-development`, gave a fit table, and warned about the TDD pyramid percentages, the Git diff-size rule and the router's competing ownership. This ledger does not repeat those arguments. It adds the remaining skills, every mechanism, the frontmatter and packaging details, idle costs, and a proposed address for each candidate.

Everything below is **proposed**. The owner decides in theme sessions.

## Overview

**What the source ships** (counted from the tree at `1401c8b`):

| Part | Count | Where |
|---|---|---|
| Skills | 25. All model-invoked: none sets `disable-model-invocation`, and the repo's lint forbids it (entry 8) | [`skills/`][skills] |
| Lifecycle commands | 9 (`/spec /plan /build /test /review /code-simplify /ship /constraints /webperf`), kept as 3 copies: Claude `.md`, Gemini `.toml`, Antigravity `.toml` | [`.claude/commands/`][cmds], [`.gemini/commands/`][gem-cmds], [`commands/`][ag-cmds] |
| Personas (subagents) | 4: `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor` | [`agents/`][agents] |
| Shared checklists | 7 in root `references/` | [`references/`][refs] |
| Skill-local references | 3 (`floor-guard.md`, `optimization-patterns.md`, `hardening-patterns.md`) plus 3 `idea-refine` support files and a script | per skill |
| Hooks | 3 scripts: `session-start.sh`, `sdd-cache-pre/post.sh`, `simplify-ignore.sh`. None is wired by the plugin. Each has a test script | [`hooks/`][hooks] |
| Evals | 25 case files, fixtures, 3 Claude `plugin eval` cases, a rejected-changes ledger | [`evals/`][evals] |
| Scripts / CI | 5 validators, a lint library and an eval runner, most with a `node --test` file; one workflow on Ubuntu, macOS and Windows | [`scripts/`][scripts], [`test-plugin-install.yml`][ci] |
| Packaging | Claude plugin + marketplace, Codex plugin + marketplace, root `plugin.json` (Antigravity/Copilot CLI), `.opencode/skills` symlink | [README "Project Structure"][readme-layout] |
| Repo-maintenance conventions | `CLAUDE.md`, `AGENTS.md`, a path-scoped `.claude/rules` file, `docs/skill-anatomy.md`, `docs/advanced-per-agent-configuration.md` | repo root, [`docs/`][docs] |

**Idle cost if installed as published.** The 25 descriptions total 8,699 characters. That is about 3.3k tokens at the 2.6 chars/token ratio measured for fork descriptions in [`research/loading-mechanics.md`](../loading-mechanics.md), or about 2.2k at chars/4 (inference either way; not measured with `claude plugin details`). The four persona and nine command descriptions add about 1,600 characters (~600 tokens at 2.6). `constraint-driven-development` alone has an 886-character description (~350 tokens), the longest in the pack. For comparison, the owner's 19 model-invoked fork skills cost about 1.6k tokens ([loading-mechanics](../loading-mechanics.md)). The whole pack would more than double the owner's idle skill budget.

**Fit to the owner, in one line.** The skills, personas and checklists contain no mention of Unity, C#, .NET or `.csproj` (grep of `skills/`, `agents/`, `references/`). Their examples are TypeScript, React, Node, Python and SQL. Every candidate below needs at least a stack substitution.

**Standout candidates (proposed):**

- **`constraint-driven-development` plus `floor-guard`** (entries 22, 23): the one procedure here that turns standards into mechanical checks with a diff-scoped guard. Strong for C# libraries and, with Unity checks swapped in, for Unity projects.
- **The eval machinery** (entries 9 to 12): tiered skill evals with pairwise negative routing tests, plus Claude Code `plugin eval` cases and a dated finding about what description wording made a skill fire. This is the strongest input for the collection's own maintenance machinery (#17).
- **`deprecation-and-migration`** (entry 26): the procedure the earlier review rated high for packages and save formats. This ledger proposes an address and the Unity handoffs.
- **`definition-of-done.md`** (entry 7): a short, stack-neutral standing bar that the fork has no equivalent of.
- **Reference-link and artifact-path validators** (entries 4, 5): cheap CI guards against the exact breakage a multi-source collection will hit.
- **`doubt-driven-development`'s cross-model step** (entry 28): on this machine Codex is installed, so the `codex exec --sandbox read-only` route the skill documents is a real option for the owner (inference from `~/.codex/config.toml` existing, per [loading-mechanics](../loading-mechanics.md)).

**Biggest open questions:**

1. **Portable frontmatter versus gating.** Addy's lint makes any top-level frontmatter key outside the Agent Skills spec a CI error ([`skill-lint.js` L39-L52][lint-keys]). That rule rejects `disable-model-invocation`, which the collection's user-invoked gate depends on in Claude Code ([loading-mechanics](../loading-mechanics.md)). Addy avoids the conflict by having no user-invoked skills and putting the user-invoked surface in commands. Should the collection adopt the lint minus that rule, or the commands-as-gate design? Belongs to #15 and #17.
2. **Is there a web pack?** About a third of the pack (browser testing, frontend UI, web performance, shipping, CI/CD, most security controls, `/webperf`) only fits web work, the owner's third priority. If no web pack exists, these are all rejects.
3. **Do routing evals pay off for a mostly user-invoked collection?** Tier 2 scores model-invoked descriptions against each other. If the collection keeps only a handful model-invoked, `claude plugin eval` (entry 11) may be the better tool, but it is Claude-only and costs tokens.
4. **One home for standards.** `CONSTRAINTS.md` would sit beside the fork's `CODING_STANDARDS.md` and the Standards axis of the fork's `code-review`. The skill itself says the file must be "the canonical source" ([constraint skill L184][cdd-L184]). Which file wins?
5. **Router text as always-on.** The router's "Core Operating Behaviors" (entry 1) are good default rules, but carrying them always-on costs tokens in every session. Decide in #14.

## Entries

Entries run mechanisms first (router and hook, packaging, commands, personas, checklists, evals, other hooks, conventions), then all 25 skills in alphabetical order. The router skill `using-agent-skills` is covered by entry 1.

---

### 1. `using-agent-skills`, the router, as a design

- **What it is.** A model-invoked meta-skill (10.4 KB) with three parts. A flowchart maps 24 task shapes to skills. "Core Operating Behaviors" are six rules called "non-negotiable": surface assumptions, manage confusion (STOP and ask), push back, enforce simplicity, scope discipline, and verify against the Definition of Done. "Skill Rules" say to check for a skill before work and "When in doubt, start with a spec". [`using-agent-skills/SKILL.md`][router]
- **Kind**: skill (router) + convention doc.
- **Proposed address**: idea-only. If any text is kept, the six behaviors become a candidate for core always-on (#14) or the router (#15).
- **Why it could fit.** The six behaviors are short, stack-neutral, and match the owner's existing harness instructions on assumptions and scope ([router L45-L114][router-behaviors]). The repo's own docs warn against running it on a host with native skill routing, "That creates two routers for the same task" ([getting-started L45-L47][gs-router]; same for Codex, [codex-setup L27][codex-router]). That is direct evidence for the map's gating question.
- **Why it might not.** Its rules push toward the spec-first lifecycle ("When in doubt, start with a spec", "Check for an applicable skill before starting work") and so compete with the fork's `ask-matt` and workflow skills. The earlier review made the same point. It has drifted from the catalog: `constraint-driven-development` appears in the flowchart but not in the Quick Reference table or the Lifecycle Sequence ([router L141-L192][router]). Its description ("Use when starting a session") makes it fire at session start in practice (inference).
- **Copy / adapt / idea-only**: idea-only. It can't be copied because it routes to Addy's skill names and lifecycle. The behaviors would need rewording to match the owner's harness rules, for example "STOP and ask" versus autonomous runs.
- **Overlap**: fork `ask-matt` (router). pstack `poteto-mode` (pstack ledger, entry 1): pstack's router is user-invoked, Addy's is model-invoked. Unity baseline: none.
- **Idle context cost**: ~98 tokens of description. Injected by its hook (entry 2), the 10.4 KB body costs about 2.6k to 4k tokens per session (inference: bytes / 4 to / 2.6).
- **Recommendation (proposed)**: do not adopt the skill. Carry the six behaviors into #14 as candidate always-on text, compared against the owner's existing global instructions so nothing is duplicated.

### 2. `session-start.sh` (router injection hook)

- **What it is.** A SessionStart hook that prints `using-agent-skills/SKILL.md` as `additionalContext`. Its header says the plugin does not wire it, because hosts with native routing "would run a second router on top of the native one". Use it only on hosts without skill routing. [`hooks/session-start.sh` L5-L8][hook-ss]
- **Kind**: hook.
- **Proposed address**: reject.
- **Why it could fit.** It shows a clean SessionStart envelope that both Claude Code and Codex accept ([L10-L12][hook-ss]).
- **Why it might not.** It is the same pattern loading-mechanics flagged in superpowers: a hidden ~1k+ token idle cost that `plugin details` does not count ([loading-mechanics](../loading-mechanics.md)). Both target harnesses route natively.
- **Copy / adapt / idea-only**: idea-only. Its author's own reasoning is the lesson.
- **Overlap**: superpowers SessionStart (loading-mechanics; ledger #7 pending).
- **Idle context cost**: ~2.6k to 4k tokens per session if wired (inference, entry 1).
- **Recommendation (proposed)**: reject. Cite it in #15 as a source-side argument against SessionStart routers.

### 3. Multi-harness packaging

- **What it is.** One repo serves six hosts from one `skills/` directory. Claude: [`.claude-plugin/plugin.json`][cc-plugin] (`"skills": "./skills"`, two command dirs, `experimental.evals`) plus a [marketplace][cc-market]. Codex: [`.codex-plugin/plugin.json`][cx-plugin] (`"skills": "./skills/"`) plus [`.agents/plugins/marketplace.json`][cx-market] (local source `./`). Antigravity and Copilot CLI: root [`plugin.json`][root-plugin]. OpenCode: `.opencode/skills`, a symlink to `../skills/`. The README calls host paths "native discovery conventions, not branding aliases" ([README L352-L366][readme-layout]). [`validate-versions.js`][val-versions] keeps the version in sync across manifests. CI runs `claude plugin validate .` and a real `claude plugin install … --scope user` ([CI][ci]).
- **Kind**: manifest-packaging + CI-eval.
- **Proposed address**: idea-only, input to #18 (install).
- **Why it could fit.** It confirms in practice what loading-mechanics found in source: one repo with `.claude-plugin` and `.codex-plugin` manifests pointing at one `skills/` serves both harnesses. The install smoke test and version-sync check are cheap and worth copying.
- **Why it might not.** It ships one monolithic plugin, so there is no core/pack split and no per-project enablement. Nothing is gated. The symlink arrives as a 10-byte text file on a Windows clone, as observed in this clone, so OpenCode-style symlinks are fragile for this owner. Drift is visible already: the Codex `longDescription` says "24 production engineering workflows" ([L16][cx-plugin]) while the repo has 25. The Claude manifest lists `./commands`, which holds Antigravity `.toml` files. What Claude Code does with those was not checked.
- **Copy / adapt / idea-only**: idea-only for layout. Adapt `validate-versions` and the install job if the collection publishes plugins.
- **Overlap**: fork `scripts/sync-plugin-version.mjs`, `validate-plugin.mjs` (similar version and plugin checks). Unity baseline's plugin has a similar two-manifest layout ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: none of its own.
- **Recommendation (proposed)**: feed #18: "two manifests, one tree" works; add a CI install smoke test; avoid symlinks.

### 4. The shared-references portability problem (and its validator)

- **What it is.** 11 skills link to root `references/*.md` through `../../references/` (grep of `skills/*/SKILL.md`). A per-skill install (`npx skills add … --skill X`) copies only `skills/X/`, so those links break. The README admits it and points to issue #361 ([README L61-L66][readme-port]). Before the fix, "All 18 links across 11 skills resolved to files that do not exist … in every plugin-install layout", and agents "hit a file-not-found and stalled" ([`validate-reference-links.js` header][val-reflinks]). That script now checks every `references/` link, anchors included. `CLAUDE.md` names the newer convention: skill-local `references/` "for self-contained, distributable skills" ([CLAUDE.md L34][claude-md]). Skills also name each other in prose (for example `doubt-driven-development` → `orchestration-patterns.md`, `agents/`), which ties them together the same way.
- **Kind**: convention doc + CI-eval.
- **Proposed address**: idea-only for the convention; adapt the validator into maintenance machinery (#17).
- **Why it could fit.** A collection that vendors pieces from many sources (#12) will hit this exact failure. The validator is small (187 lines, zero dependencies) and specific: it checks anchors and nested reference files too.
- **Why it might not.** It hardcodes the `references/` naming. The collection may want one general "every relative link resolves after install" check instead.
- **Copy / adapt / idea-only**: adapt. Generalize the link pattern and run it against the *installed* layout (core and each pack separately), not just the repo tree.
- **Overlap**: none in fork CI (fork `check.mjs` enforces CLAUDE.md rules and plugin validity, per its header comment).
- **Idle context cost**: none.
- **Recommendation (proposed)**: adopt the rule "a skill carries every file it references" as a collection convention, and a resolve-after-install link check in #17.

### 5. Lifecycle commands (`/spec /plan /build /test /review /code-simplify`) and their validators

- **What it is.** Thin `.md` commands that name a skill and add a short procedure. They write fixed artifacts: `SPEC.md`, `tasks/plan.md`, `tasks/todo.md` ([`/plan`][cmd-plan], [`/spec`][cmd-spec]). `/build auto` is the substantial one ([`/build`][cmd-build]): it requires a spec at a known path, checks for a clean baseline with `git status --porcelain`, takes one approval, then runs every task as RED → GREEN → regression → build → commit. It stages only the task's files and stops on blockers, ambiguity, or anything "you can't undo with `git revert`". [`validate-commands.js`][val-cmds] enforces the same command set and identical descriptions across the three command directories. [`validate-artifact-paths.js`][val-paths] keeps the producer and consumer paths for spec, plan and todo in agreement (it cites a real break in PR #93).
- **Kind**: user-invoked commands + CI-eval.
- **Proposed address**: reject the commands. `/build auto`'s guard list is idea-only, for the fork's `implement`.
- **Why it could fit.** `/build auto`'s guard rails are concrete and good: clean-baseline check, one checkpoint, per-task commits, "never `git add -A` blindly", and an explicit stop list. The artifact-path validator is a good pattern for any skill pipeline that passes files between steps.
- **Why it might not.** The fork already owns this lifecycle (`to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`) on an issue tracker rather than in `SPEC.md` and `tasks/`. Installing both gives two answers to one question, as the earlier review warned. The three-format parity check only matters for Gemini and Antigravity, which are out of scope.
- **Copy / adapt / idea-only**: idea-only. Can't be copied: the commands name Addy's skills and file layout.
- **Overlap**: fork `to-spec`, `to-tickets`, `implement`, `implement-spec`, `tdd`, `code-review`. pstack's Feature and Autopilot playbooks (pstack ledger, entries 34, 36).
- **Idle context cost**: command descriptions are listed like skills (loading-mechanics). About 100 to 130 characters each.
- **Recommendation (proposed)**: reject. Hand `/build auto`'s stop list and staging rule to the fork-relationship ticket (#16) as a review input for `implement`.

### 6. `/ship` fan-out, the four personas, and `orchestration-patterns.md`

- **What it is.** `/ship` spawns `code-reviewer`, `security-auditor` and `test-engineer` in parallel in one turn, merges their reports, and emits GO/NO-GO with a mandatory rollback plan. It skips the fan-out only for changes of 2 files or fewer, under 50 lines, that touch no auth, payments, data or config ([`/ship`][cmd-ship]). The personas are plain subagent files with a role, a scope and an output template ([`agents/`][agents]). The repo's rule is "Personas do not invoke other personas", with fan-out-and-merge as the only endorsed multi-persona pattern ([AGENTS.md L70-L80][agents-md]; [`orchestration-patterns.md`][orch]). The `web-performance-auditor` has a "Metric-Honesty Rule": with no tool data, mark the scorecard `not measured` and label every finding `potential impact` ([L41-L52][webperf-agent]). The earlier review already praised that rule.
- **Kind**: user-invoked command + agent definitions + convention doc.
- **Proposed address**: idea-only. The metric-honesty rule is a candidate line for any performance skill (Unity pack or web pack).
- **Why it could fit.** The orchestration rules (no persona trees, the main session merges) are sound and match Claude Code's no-nested-subagents limit, which the doc names ([orch "Platform-enforced rules"][orch]). `/ship` notes that user-level `.claude/agents/` definitions override plugin ones ([`/ship`][cmd-ship]), which is a usable override mechanism.
- **Why it might not.** It is a team pre-merge ritual. For a solo developer, three reviewers on every change is expensive, and the fork already runs a two-axis parallel review. The personas are web- and OWASP-centred. Persona descriptions cost idle context (~290 tokens for four, inference at 2.6 chars/token).
- **Copy / adapt / idea-only**: idea-only. Personas would need rewriting per stack.
- **Overlap**: fork `code-review` (parallel Standards/Spec subagents). pstack `interrogate`/`arena` (pstack ledger, entries 11, 13).
- **Idle context cost**: ~290 tokens (4 persona descriptions) + ~40 (`/ship`).
- **Recommendation (proposed)**: reject `/ship` and the personas. Keep "personas don't invoke personas" and the metric-honesty rule as inputs to the review and performance themes.

### 7. Shared checklists (`references/`)

- **What it is.** Seven files. [`definition-of-done.md`][ref-dod] (67 lines) is a standing project-wide bar, distinct from per-task acceptance criteria. It covers correctness, quality, integration, documentation and ship-readiness, with apply-per-task/feature/release rules. The others: [`testing-patterns.md`][ref-testing] (Jest/React/Playwright), [`security-checklist.md`][ref-security] (threat model, headers, CORS, OWASP, an "Install-Script Gate"), [`performance-checklist.md`][ref-perf] (Core Web Vitals, DB), [`accessibility-checklist.md`][ref-a11y] (HTML/ARIA), [`observability-checklist.md`][ref-obs] (on-call questions, RED/USE, alerting), and [`orchestration-patterns.md`][orch] (entry 6).
- **Kind**: convention doc.
- **Proposed address**: `definition-of-done`: core, as a reference file read by `implement`/`code-review`-style skills (no idle cost). Observability: wherever entry 34 lands. Accessibility and performance: web pack. Testing: reject.
- **Why it could fit.** The Definition of Done is stack-neutral and short. It names a gap in the fork: acceptance criteria exist per ticket, but no standing "is it finished to our standard" list does. "Verified at runtime, not just compiled" maps directly onto the fork's `unity-verification` ladder.
- **Why it might not.** Its ship-readiness section assumes deployed services (rollback, observability). The testing patterns are JavaScript-only.
- **Copy / adapt / idea-only**: adapt the DoD: swap the ship-readiness section per project type (library release, Unity build), and link `unity-verification` for "verified at runtime". The other checklists are web references, adapt only into a web pack.
- **Overlap**: fork `implement`/`code-review` (partial; no standing DoD file found in the fork's README skill list). Unity baseline: none.
- **Idle context cost**: 0 as reference files.
- **Recommendation (proposed)**: adapt `definition-of-done.md` into core as a referenced file. Defer the rest to the web-pack decision.

### 8. Tier 1: structural lint (`skill-lint.js`, `validate-skills.js`) and `docs/skill-anatomy.md`

- **What it is.** A pure lint library (584 lines, 650 lines of tests). Errors: `name` must match the directory, kebab-case, description ≤ 1024 chars and containing "Use when/before/after/during" (negated forms rejected), required sections (`Overview`, `When to Use`, `Common Rationalizations`, `Red Flags`, `Verification`), no empty subdirectories, and **only spec frontmatter keys at top level** (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`). Warnings: dead cross-skill references, `SKILL.md` over 500 lines. Section exemptions live in the linter, "so contributors cannot bypass the validator by editing their own skill file". [`skill-lint.js` L1-L23, L39-L52, L75-L90][lint]. The anatomy doc explains the sections. It calls "Common Rationalizations" "the most distinctive feature of well-crafted skills" ([skill-anatomy L96-L99][anatomy]).
- **Kind**: CI-eval + convention doc.
- **Proposed address**: adapt into collection maintenance machinery (#17). Skill shape is a theme decision under `writing-for-agents`.
- **Why it could fit.** A collection drawn from many sources needs a uniform floor. The name/directory, description-trigger and dead-reference checks are cheap and well tested.
- **Why it might not.** The spec-keys rule rejects `disable-model-invocation` (open question 1). Codex gating lives in `agents/openai.yaml`, so the collection needs a check that the two gates agree, which this lint can't see. The required-sections list encodes Addy's house style; the fork's `writing-for-agents` takes a different approach to skill shape.
- **Copy / adapt / idea-only**: adapt. Drop or invert the frontmatter allowlist (allow the Claude gating keys, check them against `openai.yaml`). Make required sections configurable or remove them.
- **Overlap**: fork `scripts/check.mjs` (mechanical CLAUDE.md rules). Unity baseline: a frontmatter-check CI script ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: none.
- **Recommendation (proposed)**: adapt the library pattern (pure rules + thin CLI + unit tests). Add a "Claude flag ⇔ Codex `allow_implicit_invocation`" parity rule. Do not adopt the frontmatter allowlist as written.

### 9. Tier 2: trigger and routing evals (`run-evals.js` + `evals/cases/*.json`)

- **What it is.** A zero-dependency runner. It ranks every skill description against realistic prompts using stemmed TF-IDF cosine. Positive prompts must rank their skill in the top k (default 3). Negative prompts must not rank it first, and with an `owner` field the named owner must outrank it, "turning the negative into a real pairwise routing test" ([evals README L91][evals-readme]). Description pairs at ≥ 75% similarity are errors, ≥ 50% warnings ([`run-evals.js` L57-L58][run-evals]). A rank-1 floor (`--min-rank1 95`) runs in CI. Every skill must ship at least 3 positive prompts, 2 negative and 1 behavioural eval ([README L97][evals-readme]). The authors call it "a lexical approximation of routing" ([L22][evals-readme]).
- **Kind**: CI-eval.
- **Proposed address**: adapt into maintenance machinery (#17), scoped to model-invoked skills only.
- **Why it could fit.** It is the only deterministic, free check found so far that a description carries the user's vocabulary and doesn't collide with a neighbour. For the collection the important pairs are known: `unity-serialization` vs `deprecation-and-migration`, fork `diagnosing-bugs` vs `unity-debugging`, Unity skills vs web skills. The earlier review proposed the same tests.
- **Why it might not.** TF-IDF is not the model's router (the source says so). If most of the collection is user-invoked, the model-invoked set may be too small for the statistics to mean much (inference). It only sees `description`, not Claude's `when_to_use`.
- **Copy / adapt / idea-only**: adapt. The runner is MIT and dependency-free. Point it at the collection's model-invoked set per install target (core alone, core + Unity pack), since collisions only matter between skills installed together.
- **Overlap**: fork has none ("There is no automated eval", fork `docs/productivity/writing-for-agents.md` L47). pstack's Eval playbook (pstack ledger, entry 33) is behavioural, not lexical.
- **Idle context cost**: none.
- **Recommendation (proposed)**: adapt as an optional CI check per install target. Keep the `owner` pairwise negatives; that is the valuable idea.

### 10. Tier 3: behavioural evals (`run-evals.js --behavioral`)

- **What it is.** For each eval, it materializes `evals/fixtures/` into a throwaway git repo and runs headless `claude -p` with `--permission-mode acceptEdits`, a tool allowlist, and the skill injected through `--append-system-prompt "Follow this skill exactly"` ([`run-evals.js` L49, L546-L567][run-evals]). A second `claude -p` grades the stream-json trace against `expectations[]`. Two kinds exist: `execution` (needs fixtures) and `dialogue`, described as "a human-reviewed exemption". It includes "pressure cases for time pressure, sunk cost, and authority pressure" ([evals README L36-L38][evals-readme]). The schema extends Anthropic's skill-creator `evals.json`.
- **Kind**: CI-eval (on demand, spends tokens).
- **Proposed address**: idea-only for now. Possibly maintenance machinery later.
- **Why it could fit.** Pressure cases are a good idea for discipline skills such as `unity-verification` ("claim it compiled without running it"). The trace is fenced as untrusted data when passed to the grader ([README L38][evals-readme]).
- **Why it might not.** It injects the skill into the system prompt, so it tests *compliance* and never routing. Unity fixtures need an Editor, which makes this slow and licence-bound for the Unity pack (inference). It is Claude-only, so it says nothing about Codex. `acceptEdits` with `Bash` in the allowlist is a broad permission grant.
- **Copy / adapt / idea-only**: idea-only. The format (expectations as verifiable behaviours, pressure variants) transfers. The runner would need Codex support and a Unity fixture strategy.
- **Overlap**: pstack Eval playbook (pstack ledger, entry 33). Claude Code's own `skill-creator` evals (Anthropic ledger #8 pending).
- **Idle context cost**: none.
- **Recommendation (proposed)**: idea-only. Take "pressure cases" and "expectations are behaviours, not phrasings" into #17.

### 11. Plugin evals (`claude plugin eval`, `evals/plugin/`) and the description-phrasing finding

- **What it is.** Three cases run by `claude plugin eval`, which loads the whole plugin and scores each case with and without it. `code-review-fires` pairs three graders: a `tool_used: Skill` indicator, a free regex for the severity labels, and one LLM judge on a planted off-by-one ([cases][plugin-evals]). `code-review-stays-quiet` and `…-on-commit-message` are precision cases that must not fire. The README records what the first runs taught, on claude-opus-5-5 with a pinned model. Invocation is stochastic. Generic review phrasings "rarely fired the skill". One clause, saying the skill "applies even when the diff is pasted inline", moved four review phrasings from 7/27 to 21/27 fires, with 0/27 false fires on nine adjacent prompts. Advice: pin `--model`, record the CLI version, give cases ≥ 10 turns ([evals README L40-L53][evals-readme-plugin]). That clause is visible in the shipped description ([`code-review-and-quality`][s-review]).
- **Kind**: CI-eval (on demand).
- **Proposed address**: idea-only now. A candidate for #17 for the model-invoked core and Unity pack.
- **Why it could fit.** It measures the real router on Claude Code, the owner's first harness. The phrasing finding is direct evidence for writing descriptions: name the case where the model thinks "I can just do this myself".
- **Why it might not.** Claude-only, token-costly, stochastic. Its results are one author's runs at one CLI version (Claude Code 2.1.278 per the README) and were not reproduced here.
- **Copy / adapt / idea-only**: idea-only. Copy the case structure (fires + stays-quiet pairs, graded on the reply, not only on whether the tool fired).
- **Overlap**: none in the fork.
- **Idle context cost**: none.
- **Recommendation (proposed)**: record the phrasing finding for the `writing-for-agents` / description theme. Consider `plugin eval` fires/quiet pairs for the few model-invoked collection skills.

### 12. `evals/skill-impact.md` (rejected-changes ledger)

- **What it is.** An append-only table of skill or description changes "rejected on eval evidence so contributors can review prior attempts before proposing overlapping work". Columns: date, skill, attempted change, rank-1 before → after, rejected PR. Currently empty. [`evals/skill-impact.md`][skill-impact]
- **Kind**: convention doc.
- **Proposed address**: maintenance machinery (#17), repo-level doc.
- **Why it could fit.** It costs almost nothing and stops re-trying failed description tweaks. The same idea appears in `performance-optimization`'s "log every attempt, including the reverted ones" (entry 35).
- **Why it might not.** It only earns its keep if the evals in entry 9 or 11 exist. It is empty upstream, so there is no evidence it gets used.
- **Copy / adapt / idea-only**: copy the format.
- **Overlap**: fork `triage`'s `.out-of-scope/` rejected-concepts directory (fork `docs/engineering/triage.md` L51) is the same idea for feature requests.
- **Idle context cost**: none.
- **Recommendation (proposed)**: adopt if #17 adopts any eval tier.

### 13. `sdd-cache` hooks (WebFetch revalidating cache)

- **What it is.** PreToolUse/PostToolUse hooks on `WebFetch`. Post stores the response with ETag/Last-Modified from an extra HEAD request. Pre revalidates with a conditional HEAD and, only on `304`, blocks the fetch (exit 2) and returns the cached body on stderr. No TTL. Entries without validators are never cached. The cached body is "one agent's reading of the page" because WebFetch post-processes through a model, so the original prompt is shown on a hit. [`SDD-CACHE.md`][sdd-doc], [`sdd-cache-pre.sh`][sdd-pre], [`sdd-cache-post.sh`][sdd-post]
- **Kind**: hook.
- **Proposed address**: reject. Idea-only for the design note.
- **Why it could fit.** It is a careful design: freshness delegated to the origin, prompt-shaped bodies acknowledged. The owner does heavy doc lookups (Unity docs) through research.
- **Why it might not.** It needs `bash`, `jq`, `curl` and `shasum` on Windows, and depends on Claude's WebFetch response shape "as of 2026-04" ([post L36-L41][sdd-post]). Cache hits show up as tool *errors*. Codex has no WebFetch. The fork's `research` skill, and the owner's rule to `curl` raw docs for exact quotes, bypass WebFetch anyway.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `research`; Unity baseline `unity docs --url` ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: 0 (hook definition); hits add the cached body.
- **Recommendation (proposed)**: reject.

### 14. `simplify-ignore` hook

- **What it is.** One script on three events. PreToolUse `Read` backs up a file and replaces `simplify-ignore-start/end` blocks *in place on disk* with `BLOCK_<hash>` placeholders. PostToolUse `Edit|Write` expands them and re-filters. `Stop` restores. Known limitations include crash recovery by hand, renamed files keeping placeholders, and progressive fallback matching that "may leave cosmetic debris". [`SIMPLIFY-IGNORE.md`][si-doc], [`simplify-ignore.sh`][si-sh]
- **Kind**: hook.
- **Proposed address**: reject.
- **Why it could fit.** Hand-tuned hot paths (for example Burst/Jobs code) are real.
- **Why it might not.** It rewrites source files on disk during a session. In a Unity project the Editor watches and reimports changed scripts, so placeholders would trigger compiles of broken code (inference). The failure modes need manual recovery. A comment saying "don't simplify this" does nearly the same job.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: Claude Code's built-in `simplify` skill (observed in this session's skill list).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject.

### 15. Repo-maintenance conventions: `.claude/rules/skills-contributing.md`, `CLAUDE.md`, `AGENTS.md`

- **What it is.** A path-scoped rule (`paths: skills/**`) that loads only when skills are touched. It tells the agent to search the catalog and open PRs first, prefer extending over adding, and never duplicate content between skills ([rule][rule]). `CLAUDE.md` and `AGENTS.md` open with "Scope: … not meant to be copied into other projects or into a global agent configuration" ([CLAUDE.md L5][claude-md], [AGENTS.md L5][agents-md]). `AGENTS.md` also carries OpenCode rules: "If a task matches a skill, you MUST invoke it", "(even 1% chance)", "Never implement directly if a skill applies" ([AGENTS.md L15-L68][agents-md]).
- **Kind**: convention doc.
- **Proposed address**: the path-scoped rule idea goes to maintenance machinery for the collection repo (#17). The rest is idea-only.
- **Why it could fit.** A path-scoped rule costs nothing at idle in Claude Code (loading-mechanics: "Path-scoped rules are a zero-idle-cost always-on vehicle"). An "anti-duplication preflight before adding a skill" rule is exactly what a multi-source collection needs.
- **Why it might not.** Codex has no path-scoped rules (loading-mechanics). The OpenCode "1% chance" rules are the opposite of the map's budget stance.
- **Copy / adapt / idea-only**: adapt the rule's shape. Its content would point at the collection's ledgers and catalog instead of Addy's CONTRIBUTING.
- **Overlap**: fork `CLAUDE.md`/`AGENTS.md` (repo-maintenance guidance).
- **Idle context cost**: 0 at idle (path-scoped).
- **Recommendation (proposed)**: adopt the pattern (a path-scoped "before adding a skill, check the ledgers and catalog" rule) for this repo.

### 16. `docs/advanced-per-agent-configuration.md` (portable frontmatter policy)

- **What it is.** The repo's policy that vendor or runtime fields (`model`, `context: fork`, `disallowed-tools`, turn limits) go under `metadata` or a per-agent adapter file, never at the top level. It argues that strict clients may reject unknown keys ([L11-L12][adv-config]). It also documents Claude Code's `context: fork`, `allowed-tools` (pre-approves, does not restrict) and `disallowed-tools` (restricts) ([L25-L31][adv-config]). It proposes generating per-agent files from one source of truth, "pending agreement" ([L60-L70][adv-config]).
- **Kind**: convention doc.
- **Proposed address**: idea-only, input to #15/#18.
- **Why it could fit.** "Generate harness-specific files from one source" is the right shape for Claude + Codex gating (`disable-model-invocation` + `openai.yaml`). The `allowed-tools` vs `disallowed-tools` distinction is a useful harness fact.
- **Why it might not.** Taken literally, it forbids the collection's Claude gating key at top level (open question 1). Its Claude-field claims were not verified against Claude Code docs in this ticket (ticket #2's area).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [loading-mechanics](../loading-mechanics.md) (harness facts).
- **Idle context cost**: none.
- **Recommendation (proposed)**: use as an input to #18's "one source, generated per-harness gates" design. Do not adopt the top-level ban.

---

### 17. `api-and-interface-design`

- **What it is.** Contract-first interface design: Hyrum's Law, the one-version rule, consistent error semantics, validate at boundaries, addition over modification, naming, and a detailed "Honouring an Idempotency Key" section. That section covers deriving the key from intent, atomic claims through a unique constraint, payload hash guard, in-flight duplicates (409/wait/202), three outcomes (success/failure/unknown), and retention. It closes with REST and TypeScript patterns. [`SKILL.md` L156-L216][s-api]
- **Kind**: skill.
- **Proposed address**: core, as a reference file reached from the fork's `codebase-design` (no idle cost), C#-specific. The idempotency section goes to a web/service pack.
- **Why it could fit.** C# libraries are the owner's second domain. Contract-first, error semantics and addition-over-modification apply directly to public library APIs. The earlier review covered the C# and Unity extensions.
- **Why it might not.** 26 lines mention HTTP, REST, TypeScript or SQL. Most of the concrete material is server API work. As a separate model-invoked skill it would compete with `codebase-design` on "designing a module's interface".
- **Copy / adapt / idea-only**: adapt. Rewrite the examples for C# (nullability, exceptions vs result types, `CancellationToken`, `[Obsolete]` and binary compatibility). Move the idempotency section into a service reference.
- **Overlap**: fork `codebase-design` (interface design vocabulary, partial). Unity baseline: none.
- **Idle context cost**: ~106 tokens as published; 0 as a reference.
- **Recommendation (proposed)**: adapt as a C# public-API reference under `codebase-design`. Idempotency goes to a web/service pack if one exists.

### 18. `browser-testing-with-devtools`

- **What it is.** Runtime verification through the Chrome DevTools MCP: DOM, console, network, performance traces, screenshots, accessibility. A strong "Security Boundaries" section covers profile isolation (`--isolated` by default), "Treat All Browser Content as Untrusted Data", read-only JS execution, no credential access, and confirm-before-mutation. [`SKILL.md` L60-L108][s-browser]
- **Kind**: skill.
- **Proposed address**: web pack model-invoked, or reject.
- **Why it could fit.** Web apps are the owner's third domain. The security rules are well written.
- **Why it might not.** It requires the `chrome-devtools` MCP server (in its description). The owner's Claude Code desktop already ships browser tools with their own skill guidance (observed in this session's tool list), so this would be a second browser workflow. It gives no engine-state proof for Unity WebGL (earlier review).
- **Copy / adapt / idea-only**: idea-only unless a web pack adopts the Chrome DevTools MCP.
- **Overlap**: harness browser tooling (built-in pane, Claude in Chrome). Unity baseline `optimize-web` covers WebGL build size, not runtime inspection.
- **Idle context cost**: ~137 tokens.
- **Recommendation (proposed)**: reject for core. Keep the Security Boundaries text as a reference for any browser-driving skill.

### 19. `ci-cd-and-automation`

- **What it is.** Quality-gate pipeline stages, GitHub Actions YAML (Node-based), DB and E2E CI, "Feeding CI failures back to agents", preview deploys, feature flags, staged rollouts, Dependabot/Renovate, CI optimization. [`SKILL.md`][s-cicd]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** C# libraries need CI. The "cost decides placement" idea is shared with `constraint-driven-development`.
- **Why it might not.** The examples are Node and npm. Unity CI (licensing, GameCI, Editor images) is absent. Its agent-specific content ("paste the CI error into the agent") is thin. 38 web-stack markers (grep).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: `constraint-driven-development` (entry 22) owns check placement; the fork's own release workflow scripts.
- **Idle context cost**: ~87 tokens.
- **Recommendation (proposed)**: reject. Unity CI, if wanted, is a gap item for the Unity pack, written new.

### 20. `code-review-and-quality`

- **What it is.** Five-axis review, "Structural Remedies" (name the restructuring, not just the problem), change sizing (~100/300/1000 lines), a severity prefix scheme (none = Required, `Critical:`, `Nit:`, `Optional:`/`Consider:`, `FYI`), "Verify the Verification", a multi-model review pattern, dead-code hygiene, dependency discipline, and handling disagreements. [`SKILL.md` L88-L232][s-review]
- **Kind**: skill.
- **Proposed address**: idea-only, into the fork's `code-review` (#16).
- **Why it could fit.** The severity prefixes and "propose the move" remedies would sharpen the fork's Standards axis. "Verify the Verification" fits the owner's Unity concern about false "it works" claims.
- **Why it might not.** It is a full competing review workflow. The fork's two-axis review is the chosen owner. Line-count sizing doesn't measure Unity scene and prefab diffs (earlier review).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `code-review` (direct). pstack `interrogate` (pstack ledger, entry 13).
- **Idle context cost**: ~134 tokens.
- **Recommendation (proposed)**: reject as a skill. Offer the severity taxonomy, structural remedies and verify-the-verification to #16 as improvements to the fork's `code-review`.

### 21. `code-simplification`

- **What it is.** Behaviour-preserving simplification: Chesterton's Fence, follow conventions, clarity over cleverness, scope to what changed, incremental apply with tests, then TS/Python/React-specific guidance. [`SKILL.md`][s-simplify]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** Agent-written code benefits from a simplification pass.
- **Why it might not.** Claude Code already ships a built-in `simplify` skill (observed in this session's skill list). The fork's `code-review` carries a Fowler smell baseline. The language guidance is not C#.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: Claude Code built-in `simplify`; fork `code-review`, `improve-codebase-architecture`.
- **Idle context cost**: ~101 tokens.
- **Recommendation (proposed)**: reject.

### 22. `constraint-driven-development` (with the `/constraints` command)

- **What it is.** It writes a project's quality bar into `CONSTRAINTS.md` through a four-question interview, each question with a default. It gives every dimension a de facto tool and a command, places checks by cost (edit loop < 5 s, task end < 90 s, CI), ratchets measured values instead of inventing targets, and guards the diff against five "cheapest road to green" moves. It refuses to run its interview in non-interactive contexts and applies only the floor there ([L36-L38][cdd]). It ranks checks as External / Project / Suite by "can the agent make this pass by writing code that doesn't work?" and requires at least one external check ([L218-L224][cdd]). The `/constraints` command adds `check`, `guard` and `ratchet` sub-commands ([cmd][cmd-constraints]).
- **Kind**: skill + user-invoked command.
- **Proposed address**: core user-invoked, with stack tables as references (C#/.NET in core, Unity in the Unity pack).
- **Why it could fit.** It is the most mechanism-producing skill in the source. The owner runs agents unattended (wayfinder AFK tickets), which is the skill's stated case: "the only thing standing between it and main is a test suite the agent also wrote" ([L27][cdd]). The ratchet fits Unity projects with no coverage history. The earlier review covered C#/Unity substitutions.
- **Why it might not.** The tool table is JS/Python only (`tsc`, `eslint`, `vitest`, `npm i -D`) ([L146-L160][cdd]). Lighthouse and axe don't apply to Unity. It writes a second standards file beside the fork's `CODING_STANDARDS.md` (open question 4). As model-invoked it has the pack's longest description (~350 tokens). Its "add a line to AGENTS.md and CLAUDE.md" step edits always-on files.
- **Copy / adapt / idea-only**: adapt. Keep the procedure, ratchet, guard list and external/project/suite ranking. Replace the tool table: `dotnet build -warnaserror`, Roslyn analyzers, `dotnet test --collect "XPlat Code Coverage"`, `dotnet list package --vulnerable`, and for Unity the fork's `unity-verification` ladder. Decide `CONSTRAINTS.md` vs existing standards files before building.
- **Overlap**: fork `code-review` Standards axis, `CODING_STANDARDS.md` convention, `unity-verification`. pstack: none direct. Unity baseline: `unity vcs hooks` pre-commit integrity checks are a Unity-specific check source ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: ~352 tokens as published. 0 if user-invoked.
- **Recommendation (proposed)**: adapt as core user-invoked `/constraints`. A strong candidate.

### 23. `constraint-driven-development/references/floor-guard.md` (floor-guard reference script)

- **What it is.** A ~160-line Node reference implementation of the five floor checks. It diffs merge-base → working tree *including untracked files*. Exit codes: `0` clean, `1` violation, `2` "could not run", with "Never let a `2` read as a `0`". It reports rule and location, never a matched secret. "Tightening is silent, loosening is loud". [`floor-guard.md` L1-L30][floor-guard]. It has its own test in CI ([`floor-guard-reference-test.js`][floor-test]).
- **Kind**: script.
- **Proposed address**: core script shipped with entry 22's adapted skill, with per-stack pattern sets.
- **Why it could fit.** It is deterministic, needs no installs beyond Node, and its contract (three exit codes, untracked files counted) is well reasoned. C# suppression patterns map directly: `#pragma warning disable`, `[SuppressMessage]`, `// ReSharper disable`, `[Ignore]`/`[Explicit]` on NUnit tests, `Assert.Pass()`, `throw new NotImplementedException()` (inference: pattern list not in source).
- **Why it might not.** Node on a Unity machine is an extra runtime. The patterns are JS/Python. Unity tests deleted inside asset moves would need `.meta` awareness (inference).
- **Copy / adapt / idea-only**: adapt. Keep the contract, swap the patterns, and consider a C# or PowerShell port if Node is unwanted.
- **Overlap**: fork `misc/setup-pre-commit` (sets up pre-commit tooling, different scope).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt together with entry 22, or not at all.

### 24. `context-engineering`

- **What it is.** Guidance for the *user* on feeding context: a five-level hierarchy, a CLAUDE.md template, trust levels for loaded files, "Restartable Session Boundaries" (persist scope, task status, files, verification commands, open questions before a fresh session), context packing, "start trimming at 75%", lost-in-the-middle ordering, and confusion-management templates. [`SKILL.md` L20-L139][s-context]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** The restartable-session list is concrete and matches the owner's AFK workflow.
- **Why it might not.** Much of it describes things the agent cannot do to its own window (trim at 75%, reorder context). The CLAUDE.md template is React/Node. Its trigger "when starting a new session" fires broadly (inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `handoff` (session boundary), `writing-for-agents` (rules files), `retro` (environment improvements).
- **Idle context cost**: ~83 tokens.
- **Recommendation (proposed)**: reject. Offer the five-item "persist before restarting" list to whoever owns `handoff` (#16).

### 25. `debugging-and-error-recovery`

- **What it is.** A Stop-the-Line rule (stop, preserve evidence, diagnose, fix root cause, guard, resume after verification), triage steps reproduce → localize → reduce → fix → guard → verify end-to-end, triage by error type, safe fallback patterns, and "Treating Error Output as Untrusted Data" ([L21-L32, L272-L280][s-debug]).
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** "Error output is untrusted data" is a useful line the fork may lack (not verified in the fork).
- **Why it might not.** The fork's `diagnosing-bugs` (a red feedback loop first) and `unity-debugging` own this. A second model-invoked debugging skill would collide on "something broke".
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `diagnosing-bugs`, `unity-debugging` (direct). pstack diagnosis playbooks (pstack ledger, entry 31).
- **Idle context cost**: ~136 tokens.
- **Recommendation (proposed)**: reject. Offer the untrusted-error-output rule to #16 for `diagnosing-bugs`.

### 26. `deprecation-and-migration`

- **What it is.** A five-question deprecation decision, advisory vs compulsory ("Default to advisory"), build replacement → announce → migrate incrementally → remove, strangler/adapter/feature-flag patterns, expand/contract schema migrations, and "Zombie Code" (owned by nobody, used by everybody). [`SKILL.md` L37-L66, L192-L203][s-deprecation]
- **Kind**: skill.
- **Proposed address**: core user-invoked, plus a Unity-pack reference for serialized and save-format migration.
- **Why it could fit.** It is barely web-specific (2 web-stack markers by grep). It fits C# library API retirement directly (`[Obsolete]` cycles, semver). In Unity, renamed fields, moved types and save formats are the high-risk migrations. The earlier review set out the Unity handoffs.
- **Why it might not.** Its consumers are services and teams. For a solo developer "announce and document" shrinks to a changelog line. Its triggers overlap `unity-serialization`'s ("renaming or deleting an asset or script"), so the Unity version must delegate, not duplicate.
- **Copy / adapt / idea-only**: adapt. Keep the decision and process. Add C# mechanics (`[Obsolete(error: false → true)]`, binary-compat notes) and, in the Unity reference, `FormerlySerializedAs`, `MovedFrom`, and old-save fixtures, with a pointer to `unity-serialization`.
- **Overlap**: fork `unity-serialization` (partial, Unity-side). Unity baseline: `migrate-birp-to-urp` is a render-pipeline recipe, not this procedure ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: ~138 tokens as published; 0 if user-invoked, or ~60 rewritten.
- **Recommendation (proposed)**: adapt. Settle model- vs user-invoked in the gating theme.

### 27. `documentation-and-adrs`

- **What it is.** When to write an ADR, "Match the existing convention first", an ADR template and lifecycle, when (not) to comment, documenting gotchas, API docs (TSDoc, OpenAPI), README structure, changelog, docs for agents. [`SKILL.md`][s-docs]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** "Match the existing convention first" is a good rule.
- **Why it might not.** The fork's `domain-modeling` owns ADRs and the glossary, and `writing-for-agents` owns agent docs. A second model-invoked skill on "record a decision" would collide.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `domain-modeling`, `grill-with-docs`, `writing-for-agents` (direct).
- **Idle context cost**: ~120 tokens.
- **Recommendation (proposed)**: reject.

### 28. `doubt-driven-development`

- **What it is.** In-flight adversarial review: CLAIM → EXTRACT (artifact + contract, reasoning stripped) → DOUBT (fresh-context reviewer, adversarial prompt, *never* passed the claim) → RECONCILE (contract misread / actionable / trade-off / noise, in that order) → STOP (3 cycles max). It defines "non-trivial" as five conditions, including "introduces or modifies branching logic" ([L14-L40][s-doubt]). It requires *offering* cross-model review in every interactive cycle, with `codex exec --sandbox read-only` and `gemini --approval-mode plan` examples piped through stdin. "A read-only sandbox is the load-bearing detail" ([L112-L166][s-doubt]). It must not run from inside a persona ([L42-L47][s-doubt]). "Doubt theater" is a checkable red flag: two or more cycles with substantive findings and zero classified actionable.
- **Kind**: skill.
- **Proposed address**: core user-invoked.
- **Why it could fit.** The owner has Codex installed, so the cross-model step is practical here (inference, see Overview). That answers the pstack ledger's open question about model diversity under Claude-only subagents (pstack ledger, open question 2). The reconcile order and doubt-theater check are well formed.
- **Why it might not.** "Every non-trivial decision" with branching logic as a trigger is far too broad as model-invoked: most Unity edits qualify. The mandatory cross-model offer adds a question to every cycle. The earlier review asked for an explicit risk threshold.
- **Copy / adapt / idea-only**: adapt. Make it user-invoked, drop "branching logic" from the trigger, keep cross-model as an option rather than a mandatory question, and pre-write the Codex invocation for Windows (stdin from a file, read-only sandbox).
- **Overlap**: fork `code-review` (post-hoc). pstack `interrogate`, `arena` (pstack ledger, entries 11, 13). TDD's RED step, which the skill itself treats as a form of doubt.
- **Idle context cost**: ~197 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: adapt as core user-invoked. Decide against pstack `interrogate` in one theme.

### 29. `frontend-ui-engineering`

- **What it is.** Component architecture and state ownership, design-system adherence, "Reference-led UI quality" (study 2-3 screens, write a short design contract, rebuild in own components, never copy branding), "Avoid the AI Aesthetic" (a table of eight AI defaults such as purple/indigo, rounded-2xl and stock card grids), WCAG 2.1 AA keyboard/ARIA/focus, empty and error states, responsive, loading. [`SKILL.md` L116-L143][s-frontend]
- **Kind**: skill.
- **Proposed address**: web pack model-invoked. The design-contract idea could also feed Unity UI work.
- **Why it could fit.** Web apps are a real owner domain. The reference-led design contract and AI-aesthetic table are stack-neutral and transfer to game UI design decisions (inference).
- **Why it might not.** DOM, ARIA and CSS are not UI Toolkit or uGUI instructions (earlier review). Unity UI implementation belongs to the baseline's UI skills.
- **Copy / adapt / idea-only**: copy for a web pack. Idea-only for Unity.
- **Overlap**: Unity baseline UI router, UI Toolkit and uGUI skills (implementation layer) ([unity-baseline](../unity-baseline.md)). Fork `prototype` (UI variations).
- **Idle context cost**: ~127 tokens.
- **Recommendation (proposed)**: web-pack candidate if a web pack exists. Otherwise reject.

### 30. `git-workflow-and-versioning`

- **What it is.** Trunk-based development, commit early and often, atomic commits, ~100-line changes, branch naming, worktrees for parallel agents, a "Save Point Pattern", change summaries, pre-commit hygiene, git bisect, semver, tags as the source of truth, human-written changelogs. [`SKILL.md`][s-git]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** The semver, tag and changelog section suits C# library releases.
- **Why it might not.** Its description starts "Use when making any code change" (~173 tokens, fires constantly). The Save Point Pattern recommends `git reset --hard HEAD` ([L189][s-git]), which the fork's `git-guardrails-claude-code` exists to block. It competes with repo conventions and the owner's own commit-message rules.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `pr`, `misc/git-guardrails-claude-code`, owner's global commit conventions.
- **Idle context cost**: ~173 tokens.
- **Recommendation (proposed)**: reject.

### 31. `idea-refine`

- **What it is.** Divergent/convergent ideation: "How Might We" restatement, 3-5 sharpening questions via `AskUserQuestion`, 5-8 variations through seven lenses (inversion, constraint removal, audience shift, combination, 10x simpler, 10x scale, expert lens), then a one-pager in `docs/ideas/`. It has three support files and a 15-line `mkdir` script. It is exempt from the section lint as "Legacy structure" ([skill-lint L87-L90][lint]). [`SKILL.md`][s-idea]
- **Kind**: skill + script.
- **Proposed address**: reject; the lenses are idea-only.
- **Why it could fit.** The variation lenses are a compact prompt for game-design brainstorming.
- **Why it might not.** It names Claude's `AskUserQuestion` tool ([L69][s-idea]), so it is not portable to Codex as written. It overlaps grilling (interviewing) and prototype (exploring variants).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `grilling`, `grill-me`, `prototype`.
- **Idle context cost**: ~133 tokens.
- **Recommendation (proposed)**: reject. Offer the seven lenses to the grilling theme.

### 32. `incremental-implementation`

- **What it is.** The increment cycle, vertical / contract-first / risk-first slicing, Rule 0 simplicity, Rule 0.5 scope discipline, one thing at a time, keep it compilable, feature flags, safe defaults, rollback-friendly, how to direct an agent per increment. [`SKILL.md`][s-incr]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** "Risk-first slicing" is a useful named strategy.
- **Why it might not.** The fork's `implement`, `to-tickets` (tracer bullets) and `tdd` own this. The description ("any feature or change that touches more than one file") would fire on most work.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement`, `to-tickets`, `tdd` (direct).
- **Idle context cost**: ~142 tokens.
- **Recommendation (proposed)**: reject.

### 33. `interview-me`

- **What it is.** Intent extraction. Step 1 is a one-sentence hypothesis with a confidence number, plus a reason when below ~70%. Then one question at a time, each with a GUESS attached. It listens for "want vs. should want" ("If you didn't have to justify this to anyone, what would you actually want?"). The restate has six lines including a mandatory "Out of scope". It lists what is *not* a yes ("sounds good", "whatever you think"), stops when the agent can "predict the user's reaction to the next three questions", and then ends the turn without starting work. [`SKILL.md` L38-L140][s-interview]
- **Kind**: skill.
- **Proposed address**: idea-only, into the grilling theme.
- **Why it could fit.** Several mechanics are sharper than general grilling instructions: the confidence number with a reason, the three-question predictability test as a stop rule, the not-a-yes list, the mandatory out-of-scope line. It refuses non-interactive contexts ([L34-L36][s-interview]).
- **Why it might not.** It does the same job as the fork's `grilling` primitive and `grill-me`. Its description claims the "grill me" trigger phrase ([description][s-interview]), so installing both would split routing (inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `grilling`, `grill-me`, `grill-with-docs`, `to-questionnaire` (direct).
- **Idle context cost**: ~191 tokens.
- **Recommendation (proposed)**: reject as a skill. Offer the stop test, confidence-with-reason and not-a-yes list to #16 as improvements to `grilling`.

### 34. `observability-and-instrumentation`

- **What it is.** Define "working" first (2-4 on-call questions), choose log/metric/trace per question ("metrics tell you that, traces where, logs why"), structured logging, bounded labels and percentiles, sampled tracing, symptom-based alerts with runbooks, and verifying the telemetry itself. It pairs with `references/observability-checklist.md`. [`SKILL.md` L27-L51][s-obs]
- **Kind**: skill.
- **Proposed address**: web/service pack model-invoked, or core user-invoked. A Unity client variant would be written new.
- **Why it could fit.** It suits ASP.NET services and live-game backends (earlier review). The "question first" step transfers to Unity client diagnostics.
- **Why it might not.** The owner's primary work is client-side Unity, where frame-rate cost and the platform's telemetry APIs dominate. 22 web-stack markers.
- **Copy / adapt / idea-only**: adapt for services. Idea-only for Unity.
- **Overlap**: fork `diagnosing-bugs` "instrument" step (partial). Unity baseline: none.
- **Idle context cost**: ~131 tokens.
- **Recommendation (proposed)**: hold for the web/service pack decision. Carry "define the questions before instrumenting" into any Unity diagnostics work.

### 35. `performance-optimization`

- **What it is.** Measure → identify → fix one thing → verify (keep or revert) → guard. Core Web Vitals targets, anti-patterns with links into `references/optimization-patterns.md` (N+1, unbounded fetches, index use with `EXPLAIN ANALYZE`, pool exhaustion, images, re-renders, bundles), and "Log every attempt, including the reverted ones" in a PR section or `PERF.md` ([L162-L173][s-perf]).
- **Kind**: skill.
- **Proposed address**: web pack. The experiment-log rule goes to the Unity pack's performance gap item.
- **Why it could fit.** The keep-or-revert loop and the reverted-attempts ledger are stack-neutral. Unity performance is on the baseline's gap list ([unity-baseline](../unity-baseline.md) "Gaps").
- **Why it might not.** Every concrete example is web or DB. Unity needs Profiler, frame-time and GC guidance, which the earlier review says to keep separate.
- **Copy / adapt / idea-only**: copy for a web pack. Idea-only for Unity.
- **Overlap**: fork `diagnosing-bugs` (performance regressions), `unity-debugging` (measure against baseline). pstack `benchmark-checklist`, Hillclimb (pstack ledger, entries 9, 32). Unity baseline `optimize-web`, `optimize-audio` (Unity build-setting recipes).
- **Idle context cost**: ~123 tokens.
- **Recommendation (proposed)**: web-pack candidate. Decide the experiment log together with pstack Hillclimb.

### 36. `planning-and-task-breakdown`

- **What it is.** Plan mode, dependency graph, vertical slices, task template with acceptance criteria, checkpoints, sizing, and output to `tasks/plan.md` and `tasks/todo.md`. [`SKILL.md`][s-plan]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** Nothing the fork lacks.
- **Why it might not.** The fork's `to-tickets` (blocking edges, real tracker) and `wayfinder` own planning, and use an issue tracker rather than local files.
- **Copy / adapt / idea-only**: none.
- **Overlap**: fork `to-tickets`, `wayfinder` (direct).
- **Idle context cost**: ~102 tokens.
- **Recommendation (proposed)**: reject.

### 37. `security-and-hardening`

- **What it is.** "Threat Model First": map trust boundaries (including **LLM output**), name assets, STRIDE per boundary, abuse cases as first tests. Then a three-tier boundary system (Always / Ask First / Never) and hardening controls with patterns in `references/hardening-patterns.md`: injection, auth, SSRF, destructive operations on derived paths, rate limits, secrets, supply chain, privacy, LLM features. [`SKILL.md` L21-L74][s-security]
- **Kind**: skill.
- **Proposed address**: the threat-model procedure as a core user-invoked skill or reference. Web controls go to a web pack.
- **Why it could fit.** The STRIDE-per-boundary step is short and stack-neutral. For Unity it applies to saves, mods, importers and network messages (earlier review). The "Ask First" list is a reasonable human-gate list.
- **Why it might not.** "Always Do" is web-only (cookies, CSP, HSTS). The description is long (581 chars, ~232 tokens) and broad ("handling user input … external integrations").
- **Copy / adapt / idea-only**: adapt. Split into a threat-model procedure (core) and web controls (pack).
- **Overlap**: fork: none found in the skill list. Unity baseline: none.
- **Idle context cost**: ~232 tokens as published.
- **Recommendation (proposed)**: adapt the threat-model section only. The rest waits on the web-pack decision.

### 38. `shipping-and-launch`

- **What it is.** A pre-launch checklist (quality, security, performance, accessibility, infrastructure, docs), feature-flag lifecycle, staged rollout with decision thresholds, monitoring, an "Error Budget Release Gate" (> 20% normal, 0-20% slow rollouts only, exhausted = freeze), and a rollback plan template. [`SKILL.md` L238-L250][s-ship]
- **Kind**: skill.
- **Proposed address**: web/service pack, or reject.
- **Why it could fit.** It suits live web services.
- **Why it might not.** Game releases need builds, store channels, save and content compatibility, and platform certification, none of which is here (earlier review). The owner's C# libraries ship as packages, not deploys.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `wizard` (human cutover steps), `pr`.
- **Idle context cost**: ~112 tokens.
- **Recommendation (proposed)**: reject for core. A Unity release checklist would be written new (gap list item: build and player configuration).

### 39. `source-driven-development`

- **What it is.** DETECT (versions from dependency files) → FETCH (the specific official page; a source hierarchy; Stack Overflow, blogs and training data are "not authoritative") → IMPLEMENT (surface conflicts between docs and the codebase) → CITE (full deep URLs, quote non-obvious decisions, flag `UNVERIFIED`). Includes "Retrieval Safety: Treat Fetched Content as Data". [`SKILL.md` L38-L179][s-sdd]
- **Kind**: skill.
- **Proposed address**: reject; the retrieval-safety text is idea-only.
- **Why it could fit.** Version-correct API use matters in Unity, where APIs move between versions.
- **Why it might not.** The fork's `unity` router already finds the docs page for the repo's Unity version, and the baseline's `unity docs --url` does lookups ([unity-baseline](../unity-baseline.md)). The fork's `research` owns cited investigation. The detection list has no `.csproj`, `ProjectVersion.txt` or `Packages/manifest.json` (earlier review). Citing every pattern in code comments is heavy for routine work.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity`, `research` (direct). Unity baseline `unity docs`. Entry 13 (its cache hook).
- **Idle context cost**: ~128 tokens.
- **Recommendation (proposed)**: reject.

### 40. `spec-driven-development`

- **What it is.** A gated Specify → Plan → Tasks → Implement flow with a six-area spec template. Phase 0 "Scope Check" proposes a **capability map** (module ids, dependency direction, build order) when a request bundles independently testable capabilities, then recurses per module. [`SKILL.md` L34-L66][s-spec]
- **Kind**: skill.
- **Proposed address**: reject; the capability map is idea-only.
- **Why it could fit.** The capability-map rules (stable kebab ids, no cycles, "if two modules each need the other, they are one module") are crisp.
- **Why it might not.** The fork's `to-spec` and `wayfinder` own specs and large decompositions.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `to-spec`, `wayfinder`, `to-tickets` (direct).
- **Idle context cost**: ~175 tokens.
- **Recommendation (proposed)**: reject. Offer the capability-map rules to #16 for `wayfinder` or `to-spec`.

### 41. `test-driven-development`

- **What it is.** Discover the stack first ("Never assume a default like `npm test`"), red-green-refactor, the Prove-It pattern for bugs, a test pyramid (~80/15/5), test sizes, test state not interactions, DAMP over DRY, real implementations over mocks, AAA, a browser testing section, subagents for testing. [`SKILL.md` L24-L37][s-tdd]
- **Kind**: skill.
- **Proposed address**: reject.
- **Why it could fit.** "Discover the stack first" is a good habit.
- **Why it might not.** The fork's `tdd` and `unity-testing` own this. The percentages should not become Unity quotas (earlier review).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `tdd`, `unity-testing` (direct). pstack `tdd` (pstack ledger, entry 20).
- **Idle context cost**: ~111 tokens.
- **Recommendation (proposed)**: reject.

---

## Recommendation summary (proposed)

| Proposal | Entries |
|---|---|
| **Adapt into the collection** | 7 `definition-of-done`, 22 `constraint-driven-development` (core user-invoked), 23 floor-guard, 26 `deprecation-and-migration`, 28 `doubt-driven-development` (core user-invoked), 17 `api-and-interface-design` (C# reference), 37 security threat-model section |
| **Adapt into maintenance machinery (#17)** | 4 reference-link validator, 8 lint (minus the frontmatter ban), 9 routing evals, 12 rejected-changes ledger, 15 path-scoped contributing rule; 3 install smoke test / version sync |
| **Web/service pack, only if that pack exists** | 18 browser testing, 29 frontend UI, 34 observability, 35 performance, 38 shipping, rest of 37 |
| **Idea-only (feed other themes or the fork)** | 1 router behaviors (#14/#15), 5 `/build auto` guards, 6 orchestration rules + metric honesty, 10 pressure-case evals, 11 plugin-eval phrasing finding, 16 per-harness generation, 20 review severity taxonomy, 24 session-restart list, 25 untrusted error output, 31 ideation lenses, 33 interview mechanics, 40 capability map |
| **Reject** | 2 SessionStart router hook, 13 sdd-cache, 14 simplify-ignore, 19 CI/CD, 21 simplification, 27 docs/ADRs, 30 git workflow, 32 incremental implementation, 36 planning, 39 source-driven, 41 TDD |

## Not covered and limits

- **Read in full:** the router, `constraint-driven-development` and its `floor-guard.md` header and contract, `doubt-driven-development`, `context-engineering`, `interview-me`, `source-driven-development`, all 9 Claude commands, the three hooks and their docs (the `simplify-ignore.sh` body only to line 60), `evals/README.md`, `skill-impact.md`, the plugin eval cases, all manifests, the CI workflow, `CLAUDE.md`, `AGENTS.md` (to line 80), the contributing rule, `definition-of-done.md`, `advanced-per-agent-configuration.md`, `codex-setup.md`.
- **Skimmed** (headings plus the sections cited): the other 18 skills, the four personas, the other six checklists, `skill-lint.js`, `run-evals.js`, the validator headers, `skill-anatomy.md`, the README, and `getting-started.md` (first 80 lines). **Not opened:** the per-host setup guides other than Codex, `docs/comparison.md`, `adoption-guide.md`, `developer-onboarding.md`, the eval case JSON files and fixtures, skill-local `optimization-patterns.md` and `hardening-patterns.md`, `idea-refine` support files, the test scripts.
- **Idle costs** are estimates from description character counts (÷ 2.6 per [loading-mechanics](../loading-mechanics.md), which measured fork descriptions with `claude plugin details`). The plugin itself was not installed or measured.
- **Inference** is marked where it appears: whether Codex is usable on this machine, how Unity reacts to the `simplify-ignore` placeholders, the C# suppression pattern list, and what Claude Code does with the `.toml` command directory.
- **Cross-ledger overlap** is assessed against the pstack ledger only. Ledgers #4, #7, #8 and #9 were not yet written. The superpowers comparison relies on loading-mechanics.
- **License:** MIT, copyright 2025 Addy Osmani ([`LICENSE`][license]). Keep the notice with anything copied.

[root]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026
[license]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/LICENSE
[skills]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/skills
[agents]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/agents
[refs]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/references
[hooks]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/hooks
[evals]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/evals
[scripts]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/scripts
[docs]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/docs
[cmds]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands
[gem-cmds]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/.gemini/commands
[ag-cmds]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/commands
[ci]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.github/workflows/test-plugin-install.yml
[cc-plugin]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude-plugin/plugin.json
[cc-market]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude-plugin/marketplace.json
[cx-plugin]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.codex-plugin/plugin.json
[cx-market]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.agents/plugins/marketplace.json
[root-plugin]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/plugin.json
[readme-layout]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/README.md?plain=1#L352-L366
[readme-port]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/README.md?plain=1#L61-L66
[claude-md]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/CLAUDE.md?plain=1
[agents-md]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/AGENTS.md?plain=1
[rule]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/rules/skills-contributing.md?plain=1
[gs-router]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/docs/getting-started.md?plain=1#L43-L47
[codex-router]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/docs/codex-setup.md?plain=1#L27
[adv-config]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/docs/advanced-per-agent-configuration.md?plain=1
[anatomy]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/docs/skill-anatomy.md?plain=1#L96-L99
[router]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/using-agent-skills/SKILL.md?plain=1
[router-behaviors]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/using-agent-skills/SKILL.md?plain=1#L45-L114
[hook-ss]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/session-start.sh#L5-L12
[sdd-doc]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/SDD-CACHE.md?plain=1
[sdd-pre]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/sdd-cache-pre.sh
[sdd-post]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/sdd-cache-post.sh
[si-doc]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/SIMPLIFY-IGNORE.md?plain=1
[si-sh]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/hooks/simplify-ignore.sh
[cmd-plan]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands/plan.md?plain=1
[cmd-spec]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands/spec.md?plain=1
[cmd-build]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands/build.md?plain=1
[cmd-ship]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands/ship.md?plain=1
[cmd-constraints]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/.claude/commands/constraints.md?plain=1
[orch]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/orchestration-patterns.md?plain=1
[webperf-agent]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/agents/web-performance-auditor.md?plain=1#L41-L52
[ref-dod]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/definition-of-done.md?plain=1
[ref-testing]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/testing-patterns.md?plain=1
[ref-security]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/security-checklist.md?plain=1
[ref-perf]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/performance-checklist.md?plain=1
[ref-a11y]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/accessibility-checklist.md?plain=1
[ref-obs]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/observability-checklist.md?plain=1
[lint]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/lib/skill-lint.js#L1-L90
[lint-keys]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/lib/skill-lint.js#L39-L52
[run-evals]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/run-evals.js
[val-versions]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/validate-versions.js
[val-reflinks]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/validate-reference-links.js#L1-L35
[val-cmds]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/validate-commands.js#L1-L20
[val-paths]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/validate-artifact-paths.js#L1-L22
[floor-test]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/scripts/floor-guard-reference-test.js
[evals-readme]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/evals/README.md?plain=1#L14-L101
[evals-readme-plugin]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/evals/README.md?plain=1#L40-L53
[plugin-evals]: https://github.com/addyosmani/agent-skills/tree/1401c8b8030e023baeebb31781a6653fe8e93026/evals/plugin
[skill-impact]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/evals/skill-impact.md?plain=1
[floor-guard]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/constraint-driven-development/references/floor-guard.md?plain=1#L1-L30
[cdd]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/constraint-driven-development/SKILL.md?plain=1
[cdd-L184]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/constraint-driven-development/SKILL.md?plain=1#L184
[s-api]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/api-and-interface-design/SKILL.md?plain=1#L156-L216
[s-browser]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/browser-testing-with-devtools/SKILL.md?plain=1#L60-L108
[s-cicd]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/ci-cd-and-automation/SKILL.md?plain=1
[s-review]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/code-review-and-quality/SKILL.md?plain=1
[s-simplify]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/code-simplification/SKILL.md?plain=1
[s-context]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/context-engineering/SKILL.md?plain=1#L20-L139
[s-debug]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/debugging-and-error-recovery/SKILL.md?plain=1
[s-deprecation]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/deprecation-and-migration/SKILL.md?plain=1
[s-docs]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/documentation-and-adrs/SKILL.md?plain=1
[s-doubt]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/doubt-driven-development/SKILL.md?plain=1
[s-frontend]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/frontend-ui-engineering/SKILL.md?plain=1#L116-L143
[s-git]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/git-workflow-and-versioning/SKILL.md?plain=1
[s-idea]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/idea-refine/SKILL.md?plain=1
[s-incr]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/incremental-implementation/SKILL.md?plain=1
[s-interview]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/interview-me/SKILL.md?plain=1
[s-obs]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/observability-and-instrumentation/SKILL.md?plain=1#L27-L51
[s-perf]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/performance-optimization/SKILL.md?plain=1
[s-plan]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/planning-and-task-breakdown/SKILL.md?plain=1
[s-security]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/security-and-hardening/SKILL.md?plain=1#L21-L74
[s-ship]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/shipping-and-launch/SKILL.md?plain=1#L238-L250
[s-sdd]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/source-driven-development/SKILL.md?plain=1#L38-L179
[s-spec]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/spec-driven-development/SKILL.md?plain=1#L34-L66
[s-tdd]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/test-driven-development/SKILL.md?plain=1#L24-L37
