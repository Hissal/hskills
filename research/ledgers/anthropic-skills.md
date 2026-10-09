# Ledger: anthropics/skills

Ticket: [Ledger: anthropics/skills](https://github.com/Hissal/skill-collection/issues/8), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `anthropics/skills`, read at commit [`9d63080`][root] (committed 2026-10-09, "Update claude-api skill: Claude Haiku 5.5 as the current Haiku ..."). Read on 2026-10-09 from a shallow clone in the session scratchpad. Nothing from the source was installed or executed. Every source link below is pinned to that SHA. Fork links point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`, the SHA the other ledgers used.

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2) and vendoring facts from [`research/vendoring.md`](../vendoring.md) (ticket #12). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured exactly from each `SKILL.md` frontmatter (YAML block scalars folded the way YAML does). Tokens are estimated at 2.6 chars/token, the ratio [loading-mechanics §6](../loading-mechanics.md) measured on fork descriptions, plus ~5 for the name. Inference, not a `claude plugin details` measurement.

## Overview

**What the source ships** (counted from the tree at `9d63080`):

| Part | Count | Where |
|---|---|---|
| Skills | 19. **All model-invoked**: no `SKILL.md` sets `disable-model-invocation`, `user-invocable` or `when_to_use`, and no skill ships `agents/openai.yaml` (grep across the tree) | [`skills/`][skills] |
| Plugins in one marketplace | 5: `document-skills` (4 skills), `example-skills` (12), `claude-api`, `academy-guide`, `discernment-nudge` (1 each). All use `"source": "./"` with `"strict": false` and an explicit `skills` path list | [`.claude-plugin/marketplace.json`][marketplace] |
| `skill-creator` machinery | 3 subagent briefs, 8 Python scripts, 2 HTML viewers, a JSON schema reference | [`skills/skill-creator/`][sc-dir] |
| Eval and audit guides inside `claude-api` | `build-eval`, `eval-audit`, `eval-hillclimb`, `cost-hillclimb`, a Node runner scaffold and report builder; `prompt-audit` | [`claude-api/shared/evals/`][evals-dir], [`prompt-audit.md`][pa] |
| Spec and template | Both are stubs: the spec is a 3-line pointer to agentskills.io, the template a 6-line `SKILL.md` | [`spec/agent-skills-spec.md`][spec], [`template/SKILL.md`][template] |
| Licences | 14 skills Apache-2.0, the 4 document skills proprietary ("source-available"), `doc-coauthoring` ships no licence file; no root `LICENSE` | per-skill `LICENSE.txt`, [README][readme] |

**Idle cost if installed as published.** The 19 descriptions total 9,381 characters, about **3.6k tokens** (or ~2.3k at chars/4). By plugin: `example-skills` ~1.4k, `document-skills` ~1.15k, `claude-api` ~410, `academy-guide` ~380, `discernment-nudge` ~380. Because every plugin skill is model-invoked and Claude Code can't disable single skills inside a plugin ([loading-mechanics §3](../loading-mechanics.md)), installing `example-skills` to get `skill-creator` (~125 tokens alone) costs ~1.4k tokens per session. For comparison, the owner's 19 model-invoked fork skills cost ~1.6k ([loading-mechanics](../loading-mechanics.md)).

**Already on the owner's machine.** Three parts of this repo already reach the owner without installing anything (observed, read-only):

- This Claude desktop session's own skill listing contains `anthropic-skills:skill-creator`, `:docx`, `:pdf`, `:pptx` and `:xlsx`, served from `%APPDATA%\Claude\local-agent-mode-sessions\skills-plugin\...\skills\`. That host copy of `skill-creator` differs from the repo's in three files: a newer `quick_validate.py` that also rejects nested `SKILL.md` files, a reworded packaging section, and the licence copyright line (local `diff -rq`). All four document skills also differ from the repo. *Inference:* the host ships its own, newer build. Whether a plain terminal `claude` session gets the same skills was not checked.
- `claude-api` appears **unnamespaced** in this session's listing, with a description identical to the repo's. *Inference:* Claude Code bundles it ([loading-mechanics §2](../loading-mechanics.md) lists bundled skills as a scope).
- So the owner already pays roughly 125 + 1,150 + 410 idle tokens for these (inference, same ratio), and the collection should never vendor a second, competing copy of them.

**Standout candidates (proposed):**

- **Trigger-eval and description-optimiser loop** (entries 7, 8): the only tool found so far that measures the *real* Claude Code router on a description, with repeats, a stratified train/test split and selection by held-out score. Strong input for ticket #17. It needs adapting: it does not run on Windows as written, and it assumes the skill under test is *not* already installed.
- **`prompt-audit`** (entry 11): a non-interactive audit of skills, `CLAUDE.md`, rules and subagents for dated or contradictory instructions, with a "keep list" and "removal is a hypothesis" verification step. It is the closest existing tool to the collection's own "every always-on word must earn its place" rule, and it already reaches the owner through the bundled `claude-api`.
- **Behavioural eval with baseline + grader that critiques the evals** (entries 2, 3): with-skill vs no-skill (or old-skill) runs in parallel, then a grader whose second job is to flag non-discriminating assertions. Complements superpowers' pressure scenarios and pstack's blinded Eval playbook.
- **Eval hygiene from `eval-audit` / `eval-hillclimb`** (entry 12): noise floor vs headroom, "recompute the headline from raw rows", "prove the mechanism is wired". These are statistics rules any skill eval needs.
- **`doc-coauthoring`'s Reader Testing** (entry 18): test a document by handing it to a fresh subagent with only reader questions. It is a cheap check for skill bodies and agent-facing issues, i.e. what the fork's `writing-for-agents` produces.

**Biggest open questions:**

1. **Two Anthropic voices on descriptions.** `skill-creator` tells authors to make descriptions "a little bit 'pushy'" because "Claude has a tendency to 'undertrigger'" ([L67][sc-L67]), and its optimiser aims at 100-200 words ([`improve_description.py` L132][id-L132]). `prompt-audit`, in the same repo, calls triggering boosters a dated pattern that "now cause over-triggering" and calls trigger-case enumeration cruft ([L150, L161][pa-L150]). The fork's `writing-for-agents` sides with the audit ("One trigger per branch", fork [`writing-for-agents/SKILL.md` L17](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/writing-for-agents/SKILL.md#L17)). Which stance does the skill-writing theme adopt? An owner-run trigger eval (entry 7) is the way to settle it per skill rather than by doctrine.
2. **Is the trigger eval's signal above its own noise?** The default loop holds out 40% of ~20 queries × 3 runs. By `eval-audit`'s own rule of thumb (noise ≈ `1/sqrt(n·R)`, [§5][ea-s5]), that is about ±20 points on the test set (inference: 8 test queries × 3 runs). Picking the "best" description by test score may pick noise. Does ticket #17 want bigger query sets, or the loop as a smoke test only?
3. **Codex has no equivalent.** Every eval here drives `claude -p` (or subagents). Nothing measures Codex's implicit invocation. Is a Claude-only trigger check acceptable given the map's "Claude first, Codex usable" rule?
4. **Does the collection need `skill-creator` at all**, given the host already serves it model-invoked? The open question is about the *mechanisms*, not the skill: vendor adapted scripts into the collection's maintenance tooling (ticket #17), or just use the host's copy as-is.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Frontmatter allowlist rejects Claude/Codex gating keys | [`quick_validate.py` L42-50][qv-L42] allows only `name, description, license, allowed-tools, metadata, compatibility` | Any validator copied as-is would fail every user-invoked fork skill (`disable-model-invocation`) and any `when_to_use` |
| POSIX-only process plumbing | [`run_eval.py` L108][re-L108] calls `select.select()` on a subprocess pipe, which Python supports only for sockets on Windows ([Python docs, `select.select`](https://docs.python.org/3/library/select.html#select.select)); [`generate_review.py` L288-306][gr-L288] shells out to `lsof` | The trigger eval and description loop would fail on the owner's Windows machine as written (inference from the docs; not run). Needs a thread-based reader or WSL |
| Prompts assume claude.ai / Cowork users | [`SKILL.md` L32-41][sc-L32] (plumbers and grandparents), L420-455 (claude.ai and Cowork sections) | About a fifth of the body is surface-specific text the owner's Claude Code sessions don't need |
| Licence split | proprietary terms forbid copying or derivative works ([`docx/LICENSE.txt`][docx-lic]); `doc-coauthoring` has no licence file | Only the Apache-2.0 skills can be vendored, with the licence and change notice carried by hand ([vendoring.md](../vendoring.md)) |
| Stack: Python + Node + browser | eval viewer, report builder, `webapp-testing`, `web-artifacts-builder` | The owner's machine has Python and Node, but nothing here touches C#, .NET or Unity (grep of the skills) |

## Entries

Entries run `skill-creator` and its machinery first, then the eval and audit guides inside `claude-api`, then the other development skills, then document and creative skills (briefly), then packaging and conventions.

---

### 1. `skill-creator` (the skill)

- **What it is.** A model-invoked skill for creating, editing and measuring skills ([`skill-creator/SKILL.md`][sc], 485 lines, ~33 KB). The loop: capture intent and interview, draft, write 2-3 realistic test prompts into `evals/evals.json`, run them with and without the skill, grade, aggregate, open a human review page, rewrite from the feedback, repeat; then optionally run the description optimiser and package a `.skill` zip. It states that the user may opt out ("just vibe with me") at any time ([L26][sc-L26]). Separate sections adapt the loop for claude.ai (no subagents: no baselines, no benchmark) and Cowork (no display: `--static` viewer) ([L420-455][sc-L420]).
- **Kind**: skill.
- **Proposed address**: none in the collection. The host already serves it model-invoked (Overview).
- **Why it could fit.** The owner is building a skill collection and a Unity pack. A procedure that tests every new skill against a no-skill baseline before trusting it is what the map's "no blind picks" asks for, applied to the collection's own output.
- **Why it might not.** ~33 KB on invoke, much of it for other surfaces. It is generic about *what* to test; it says nothing about idle cost, gating, packs, or Codex. Its authoring guidance contradicts the fork's on descriptions (open question 1).
- **Copy / adapt / idea-only**: idea-only for the skill. The machinery is covered entry by entry below.
- **Overlap**: superpowers `writing-skills` and its subagent testing (superpowers ledger entries 17, 18); pstack "Authoring a skill" and Eval playbooks (pstack entries 33, 34); Addy's eval tiers (Addy entries 9-11); fork `writing-for-agents`. Unity baseline: none.
- **Idle context cost**: ~125 tokens (319 chars). Already paid via the host copy.
- **Recommendation (proposed)**: don't vendor. Keep using the host copy where it helps; take the mechanisms through ticket #17.

### 2. Behavioural eval loop: with-skill vs baseline runs and the workspace layout

- **What it is.** For each test prompt, spawn two subagents in the same turn: one given the skill path, one with no skill (new skill) or a snapshot of the old version (improving a skill) ([L169-186][sc-L169]). Results go to `<skill>-workspace/iteration-N/eval-<name>/{with_skill,without_skill|old_skill}/outputs/`, with an `eval_metadata.json` per case ([L167, L188-197][sc-L167]). Assertions are drafted *while* runs are in flight and must be "objectively verifiable"; subjective skills are judged qualitatively instead ([L199-205][sc-L199]). `total_tokens` and `duration_ms` come from the subagent completion notification and must be saved immediately, because "This is the only opportunity to capture this data" ([L207-219][sc-L207]). Schemas for every file live in [`references/schemas.md`][schemas].
- **Kind**: CI-eval (manual procedure) + convention doc.
- **Proposed address**: collection maintenance machinery (ticket #17), repo-local and user-invoked.
- **Why it could fit.** It answers "does this skill change behaviour versus the default?", the fork's no-op test, with a runnable control. Fresh subagents work on both Claude Code and Codex. The `old_skill` snapshot baseline fits the collection's adapt-from-source work: run the source's version against the adapted one.
- **Why it might not.** Tokens: two full runs per prompt per iteration. The with-skill run hands the subagent the skill *path* ([L176-177][sc-L169]), so it tests compliance with the body, never whether the description fires (that is entry 7). Unity skills need an Editor for real outputs, which makes behavioural runs slow (inference, same as Addy entry 10).
- **Copy / adapt / idea-only**: adapt. Keep the layout and the paired baseline; drop the claude.ai/Cowork branches; add the pressure-scenario design from superpowers entry 18 for discipline skills.
- **Overlap**: superpowers entry 18 (RED/GREEN with a no-guidance control); pstack entry 33 (blinded Eval playbook); Addy entry 10 (`--behavioral`, whose case schema "extends Anthropic's skill-creator `evals.json`", per the Addy ledger). Claude Code `claude plugin eval` scores with and without a plugin (Addy entry 11).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt-adapted as the collection's promotion check, merged with superpowers' pressure scenarios and pstack's blinding into one procedure (ticket #17).

### 3. Grader agent (`agents/grader.md`)

- **What it is.** A subagent brief that grades each expectation PASS/FAIL with quoted evidence ([`grader.md`][grader]). A pass needs "genuine task completion, not just surface-level compliance" (correct filename but wrong content fails), and "The burden of proof to pass is on the expectation" ([L39-40, L99][grader]). It also extracts and verifies implicit factual, process and quality claims from the output (Step 4), reads the executor's `user_notes.md`, and has a second job: "critique the evals themselves", because "A passing grade on a weak assertion is worse than useless" ([L9, L68-79][grader]). Output is `grading.json` with fixed field names that the viewer depends on ([SKILL.md L225][sc-L225]).
- **Kind**: CI-eval (subagent prompt).
- **Proposed address**: maintenance machinery (ticket #17), as a reference file the eval procedure points at.
- **Why it could fit.** "Critique the evals" catches the commonest eval failure: assertions that pass with or without the skill. It is short, stack-neutral, and works as a plain subagent prompt on both harnesses.
- **Why it might not.** An LLM grader is itself stochastic; nothing in the skill measures grader agreement (inference). For Unity outputs the grader would need inspection tools it doesn't name.
- **Copy / adapt / idea-only**: copy with light edits (Apache-2.0; carry the licence and a change note per [vendoring.md](../vendoring.md)).
- **Overlap**: pstack entry 33 (grading from files actually opened); superpowers entry 18 (meta-testing). Addy entry 10 (second `claude -p` as grader).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt, if ticket #17 adopts entry 2.

### 4. Blind comparator and post-hoc analyzer (`agents/comparator.md`, `agents/analyzer.md`)

- **What it is.** [`comparator.md`][comparator] judges two outputs labelled A and B "WITHOUT knowing which skill produced them", building a task-specific content and structure rubric (1-5 per criterion) and using assertions only as secondary evidence. [`analyzer.md`][analyzer] has two parts: an unblinded post-hoc analysis of *why* the winner won (instruction following, strengths, weaknesses, prioritised suggestions), and a benchmark analyst ([L187 onward][analyzer-L187]) that flags assertions passing in both configurations ("may not differentiate skill value"), high-variance evals, and time/token trade-offs.
- **Kind**: CI-eval (subagent prompts).
- **Proposed address**: maintenance machinery (ticket #17), optional tier.
- **Why it could fit.** Blind A/B is the right tool for "is my adapted version better than the source's?", a question every adapt candidate in these ledgers raises. The benchmark analyst's four-way pass/fail pattern table is a cheap, mechanical read of results.
- **Why it might not.** `skill-creator` itself calls it optional: "most users won't need it" ([L329][sc-L325]). Rubric scoring of prose outputs is noisy (inference).
- **Copy / adapt / idea-only**: copy the benchmark-analyst checklist; idea-only for the comparator unless adapt-vs-source comparisons become routine.
- **Overlap**: pstack entry 33 (blinding); pstack `benchmark-checklist` (pstack ledger standouts).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: fold the analyst's pattern checks into entry 2's procedure; keep the comparator as an on-demand reference.

### 5. `aggregate_benchmark.py` and `references/schemas.md`

- **What it is.** A stdlib script that walks `eval-*/<config>/run-*/grading.json` and writes `benchmark.json` and `benchmark.md`: pass rate, time and tokens per configuration as mean ± sample stddev, min, max, plus the delta between configurations ([`aggregate_benchmark.py`][agg], `calculate_stats` L45-64, delta L214-216). [`schemas.md`][schemas] fixes eight JSON shapes (`evals`, `history`, `grading`, `metrics`, `timing`, `benchmark`, `comparison`, `analysis`).
- **Kind**: script + convention doc.
- **Proposed address**: maintenance machinery (ticket #17).
- **Why it could fit.** Reporting mean ± stddev with the delta is the minimum honest summary for stochastic runs. A fixed schema lets results from different skills and dates be compared later.
- **Why it might not.** It reports spread but no confidence interval or noise floor; `eval-audit` (entry 12) says to compare the delta against a paired-difference CI first. Python with a `scripts.` package import path (`python -m scripts.aggregate_benchmark`) means running it from inside the skill folder.
- **Copy / adapt / idea-only**: adapt: add a noise-floor line per entry 12.
- **Overlap**: Addy entry 9 (rank-1 floor in CI); pstack `benchmark-checklist`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt-adapted with entry 2.

### 6. Eval viewer (`eval-viewer/generate_review.py`, `viewer.html`)

- **What it is.** A stdlib Python server (default port 3117) that embeds every run's outputs into one HTML page with an Outputs tab (prompt, rendered output, previous iteration, grades, an auto-saving feedback box) and a Benchmark tab; "Submit All Reviews" writes `feedback.json` ([SKILL.md L236-282][sc-L236], [`generate_review.py`][gr]). `--static` writes a standalone file instead ([L401][gr-L401]). The skill insists on it: "GENERATE THE EVAL VIEWER *BEFORE* evaluating inputs yourself" ([L451][sc-L445]).
- **Kind**: script.
- **Proposed address**: idea-only.
- **Why it could fit.** Putting outputs in front of the human before the agent edits the skill is the right order: human judgment drives the next iteration.
- **Why it might not.** The owner's outputs are mostly code changes and Unity behaviour, not documents to eyeball in a browser. The page pulls Google Fonts and a SheetJS script from CDNs ([`viewer.html` L7-10][viewer]), and port cleanup uses `lsof` ([L288-306][gr-L288]). A Markdown summary in the workspace would serve a solo developer equally well (inference).
- **Copy / adapt / idea-only**: idea-only: keep "human reviews before the agent revises" as a step.
- **Overlap**: none in the fork or other ledgers.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject the viewer; keep the ordering rule in entry 2's procedure.

### 7. Trigger eval (`scripts/run_eval.py`)

- **What it is.** Tests whether a *description* makes Claude Code reach for the skill. For each query it writes a temporary command file `.claude/commands/<name>-skill-<uuid>.md` containing the candidate description, in the nearest ancestor directory that has a `.claude/` ([L22-32, L51-68][re-L22]). It then runs `claude -p <query> --output-format stream-json --verbose --include-partial-messages` with the `CLAUDECODE` variable removed so it can nest inside a session ([L70-83][re-L70]). From the stream it decides early: the first `tool_use` block counts as a trigger only if it is `Skill` or `Read` naming the temp file; any other first tool returns "not triggered" ([L133-154][re-L133]). Each query runs 3 times by default with 10 workers; a should-trigger query passes at a trigger rate ≥ 0.5, a should-not-trigger query below it ([L184-256, L264-267][re-L184]). The skill's guidance: write 8-10 positive and 8-10 *near-miss* negative queries, realistic and detailed ("Write a fibonacci function" as a negative "is too easy"), and know that simple one-step queries won't trigger any skill ([SKILL.md L337-400][sc-L337]).
- **Kind**: CI-eval (script).
- **Proposed address**: collection maintenance machinery (ticket #17), run before promoting or rewording any model-invoked core or pack skill.
- **Why it could fit.** It measures the real router on the owner's first harness, with repeats, and treats a non-trigger as a measurable outcome. Near-miss negatives are exactly the cases the collection cares about: `unity-debugging` vs `diagnosing-bugs`, `tdd` vs `unity-testing`. Every model-invoked description has to justify its idle cost, and this is the check that shows whether it does its job.
- **Why it might not.** (a) **Windows**: `select.select()` on a pipe fails on Windows (Recurring blockers). (b) **Installed copy competes**: the owner symlinks every fork skill into `~/.claude/skills` ([loading-mechanics §2](../loading-mechanics.md)). The script counts only its uniquely named temp file, so if the installed copy of the same skill fires instead, the run scores "not triggered" (inference from [L147-152][re-L133]). Tests need the installed copy hidden. (c) **First-tool rule**: a skill whose own listing tells the model to run a command first (for example `claude-api`'s "run this grep FIRST") can never score as triggered (inference). (d) It writes into the project's `.claude/commands/` and leaves the file behind if the process is killed. (e) It tests the description in a *command* file, not a skill, so `when_to_use` and skill-only frontmatter are not exercised. (f) Claude only; nothing equivalent for Codex.
- **Copy / adapt / idea-only**: adapt. Replace `select` with a reader thread; write the candidate into a throwaway `--plugin-dir` or temp project instead of the live repo; hide the installed copy during the run; also accept the namespaced `plugin:skill` name; keep the 3-rep rate and the near-miss guidance.
- **Overlap**: superpowers entry 21 (`claude -p --plugin-dir` + grep the stream, positive cases only); Addy entry 9 (lexical TF-IDF, free but not the real router) and entry 11 (`claude plugin eval` fires/stays-quiet pairs). Claude Code `/skill-doctor` gives usage after the fact, not a test ([loading-mechanics §3](../loading-mechanics.md)).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: adopt-adapted as the collection's trigger regression check. Compare it with `claude plugin eval` in ticket #17 before building anything; the native command may already cover this without the Windows and cleanup problems.

### 8. Description optimiser (`run_loop.py`, `improve_description.py`, `generate_report.py`, `assets/eval_review.html`)

- **What it is.** An automated loop over entry 7. [`run_loop.py`][rl] splits the query set 60/40 into train and held-out test, stratified by `should_trigger` with a fixed seed ([L24-44][rl-L24]). Each iteration evaluates train and test together, then asks `claude -p` for a new description from the *train* failures only; test scores are stripped from the history the improver sees ([L195-198][rl-L195]). After up to 5 iterations it returns the description with the best **test** score "to avoid overfitting" ([L216-222][rl-L216]; [SKILL.md L394][sc-L394]). The improver prompt ([`improve_description.py` L79-142][id-L79]) asks for intent categories rather than "an ever-expanding list of specific queries", imperative phrasing, distinctiveness, "about 100-200 words", and stays under the 1,024-char hard limit, with a one-shot shorten retry if exceeded ([L163-182][id-L163]). Before the loop, the human reviews and edits the query set in [`eval_review.html`][evalreview], which downloads `eval_set.json`.
- **Kind**: CI-eval (scripts).
- **Proposed address**: idea-only for the automation; adopt the method (held-out selection, blinded improver, human-reviewed query set) in ticket #17.
- **Why it could fit.** Selecting on a held-out set and hiding test scores from the improver are the right controls against tuning a description to its own test prompts. The "don't enumerate queries, generalise to intent" instruction agrees with `prompt-audit` and the fork.
- **Why it might not.** Its length target, 100-200 words, is 3-6× the fork's median description (~60 tokens, [loading-mechanics §6](../loading-mechanics.md)). Run unattended, it would grow descriptions against the map's idle budget (inference). With ~20 queries the test set is ~8 queries × 3 runs; by `eval-audit`'s rule of thumb that is about ±20 points of noise (open question 2), so "best by test score" can be chance. It inherits every entry 7 blocker, opens a browser via `webbrowser.open` ([L279][rl-L279]), and its review page downloads to `~/Downloads`.
- **Copy / adapt / idea-only**: idea-only for the loop; if adapted, add a character budget per address (core vs pack) to the improver prompt and report the noise floor next to scores.
- **Overlap**: Addy entry 11 (the "applies even when pasted inline" phrasing finding); Addy entry 12 (rejected-changes ledger, the natural home for losing descriptions); superpowers entry 17 ("Description = When to Use, NOT What the Skill Does").
- **Idle context cost**: 0.
- **Recommendation (proposed)**: don't adopt the automation now. Revisit only if manual description tuning with entry 7 proves too slow.

### 9. `quick_validate.py` and `package_skill.py`

- **What it is.** [`quick_validate.py`][qv] checks frontmatter: YAML dict, an allowlist of six keys, kebab-case `name` ≤ 64 chars, `description` ≤ 1,024 chars with no `<` or `>`, `compatibility` ≤ 500 ([L42-92][qv-L42]). [`package_skill.py`][pkg] validates, then zips the folder into `<name>.skill`, excluding `__pycache__`, `node_modules`, `*.pyc`, `.DS_Store` and a root-level `evals/` ([L20-24][pkg-L19]). The host copy adds a check rejecting extra nested `SKILL.md` files, because the Skills API and claude.ai "accept exactly one per skill" (local diff, Overview).
- **Kind**: script (CI-eval + manifest-packaging).
- **Proposed address**: idea-only for the validator; reject the packager.
- **Why it could fit.** The spec limits (64-char name, 1,024-char description) are cheap CI checks. "`evals/` lives in the skill folder but never ships" is a tidy convention for co-locating a skill's tests with it.
- **Why it might not.** The allowlist rejects `disable-model-invocation` and `when_to_use` (Recurring blockers), so it would fail half the fork. The repo's own `claude-api` description is 1,068 characters, over the limit this validator enforces (measured). The `.skill` zip targets claude.ai upload; the owner installs through plugins and skill folders ([vendoring.md](../vendoring.md)).
- **Copy / adapt / idea-only**: idea-only. Fold the name and length checks into the lint candidate from Addy entry 8, with the gating keys allowed and a Claude ⇔ Codex gate-parity rule added.
- **Overlap**: Addy entry 8 (same spec-key allowlist problem); Unity baseline's frontmatter CI script ([unity-baseline](../unity-baseline.md)).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: take the limits and the `evals/`-excluded-from-ship convention into ticket #17's lint; don't copy the scripts.

### 10. Authoring conventions in `skill-creator`

- **What it is.** The "Skill Writing Guide" ([L71-139][sc-L71]): folder anatomy (`scripts/`, `references/`, `assets/`); three-level progressive disclosure, with metadata "Always in context (~100 words)", the body under 500 lines, and resources as needed; a table of contents for reference files over 300 lines; per-variant reference files (`aws.md`, `gcp.md`) so "Claude reads only the relevant reference file"; the "Principle of Lack of Surprise"; and "explain to the model why things are important in lieu of heavy-handed musty MUSTs" ([L139][sc-L139]). The improvement section adds "Keep the prompt lean", "read the transcripts, not just the final outputs", and a strong signal for bundling: if every test run independently wrote the same helper script, ship that script ([L298-304][sc-L298]). The description advice is to be "pushy" ([L67][sc-L67]).
- **Kind**: convention doc.
- **Proposed address**: ideas into fork `writing-for-agents` (core model-invoked), decided in the skill-writing theme.
- **Why it could fit.** "Repeated helper scripts across runs → bundle it" and "read transcripts, not outputs" are concrete and absent from the fork's guide. The per-variant reference layout matches how a Unity pack skill could split Editor, Player and CI paths.
- **Why it might not.** "Pushy" descriptions conflict with the map's idle budget and with the fork and `prompt-audit` (open question 1). Much of the rest (imperative voice, examples, explain why) the fork already covers in its own vocabulary.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents`; superpowers entries 17, 19 (superpowers vendors a 1,150-line copy of Anthropic's authoring guidance); pstack "Authoring a skill" playbook.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: carry "bundle what every run rebuilt" and "read the transcripts" into `writing-for-agents`; reject the "pushy" rule unless entry 7 runs show undertriggering on the owner's skills.

### 11. `prompt-audit` (in `claude-api/shared/prompt-audit.md`)

- **What it is.** A non-interactive audit, run as `/claude-api prompt-audit`, of prompts **and coding-agent configuration**: "`CLAUDE.md` / `AGENTS.md`, rule files, skills, custom commands, subagent definitions, output styles" ([L7][pa-L7]; subcommand table [SKILL.md L60][capi-L53]). It states scope and target-model assumptions instead of asking ([Step 0, L20-25][pa-L20]), inventories every surface without reading settings or credential files, uses `git blame` for provenance, applies one deletion rule ("could the model already know this?"), then scans pattern tables. Group 2 targets skill and config files specifically: verbose `SKILL.md`, the "recency trap" (one session's stumble made permanent), volatile paths and versions, **instruction files that contradict each other**, history narratives, and trigger-case enumeration ([L137-152][pa-L137]). An 11-item keep list protects context, fragile exact scripts, tool contracts and working redundancy ([L187-203][pa-L187]). Output is a report with `file:line`, pattern, reason and confidence, plus a proposed diff, applied only on explicit request ([L205-229][pa-L205]). Step 7: "removal is a hypothesis", so probe behaviour before and after, one change at a time, and re-audit at every model release ([L231-237][pa-L231]).
- **Kind**: skill (subcommand of a bundled skill) + convention doc.
- **Proposed address**: no new address. It already reaches the owner through bundled `claude-api` as `/claude-api prompt-audit`. Candidate step in ticket #17's maintenance routine (for example after each model release, and before promoting a vendored skill).
- **Why it could fit.** A multi-source collection will accumulate exactly the failures Group 2 lists: contradicting skills from different sources, pinned versions, and incident-shaped rules. Its "contradiction" row with `git blame` ordering is the only automated conflict check found across all ledgers so far. It also costs nothing extra, since the owner already has it.
- **Why it might not.** It is tuned to Claude model generations ("Claude Fable 5.1", "Claude Opus 5.5" appear in its tables), so Codex-facing text gets audited against a Claude target. It is long (237 lines) and loaded through a skill with a ~104 KB `SKILL.md`. Its verdicts are proposals that still need behavioural checks (its own Step 7).
- **Copy / adapt / idea-only**: use as-is through the bundled skill; don't vendor.
- **Overlap**: fork `writing-for-agents` (no-op and duplication hunting, run by hand); pstack `unslop`/`correct`; Addy entry 15 (repo-maintenance rules); superpowers entry 19 (its `AGENTS.md` notes its philosophy "differs from Anthropic's published guidance").
- **Idle context cost**: 0 extra (part of `claude-api`'s already-paid description).
- **Recommendation (proposed)**: adopt as a maintenance step in ticket #17: run `/claude-api prompt-audit` over the collection at each model release and before promoting vendored skills. Feed its keep list into `writing-for-agents`.

### 12. Eval-building and hill-climbing guides (`build-eval`, `eval-audit`, `eval-hillclimb`, `cost-hillclimb`, runner and report scaffolds)

- **What it is.** Guides inside `claude-api` for evaluating **Claude-powered apps**, reached as `/claude-api build-eval` and `/claude-api hillclimb` ([SKILL.md L63-65][capi-L53]). [`eval-audit.md`][ea] is a health checklist covering task design, harness, metrics hygiene, grader design and resolution. Its §5 sets the noise floor ("for a pass-rate, roughly `1/sqrt(n·R)`: 25 cases × 2 reps ~ ±14 points") against headroom and the smallest change worth acting on. Train and test must be split at random, never by baseline score, and "The headline recomputes from raw rows" ([§5][ea-s5]). [`eval-hillclimb.md`][eh] makes Step 0.5 "Prove the eval can be climbed" a hard gate: prove the mechanism is wired by disabling it and confirming the score drops, spot-check the grader on baseline failures, read `model` from the response ([L31-52][eh-L31]). [`runner-scaffold.mjs`][runner] adds resume, rep-aware traces, and a harness-integrity hash that halts a round which edited the runner until the human approves.
- **Kind**: convention doc + script.
- **Proposed address**: idea-only input to ticket #17 (statistics and hygiene rules for skill evals).
- **Why it could fit.** Every rule transfers to skill evals: noise floor before trusting a delta, disable the skill and confirm the score drops (the no-op test again), recompute from raw rows, random splits. It fills the gap entry 5 leaves.
- **Why it might not.** It is written for API apps (`usage`, cache tokens, model IDs, cost search). The Node runner targets the Anthropic SDK, not `claude -p` or subagents. The owner's agentic-workflow work may use it directly as an API user. That is a reason to keep using the bundled skill, not to vendor it.
- **Copy / adapt / idea-only**: idea-only. Quote the specific rules into ticket #17's eval procedure with attribution.
- **Overlap**: pstack Hillclimb and Eval playbooks (pstack entries 32, 33), the closest match; Addy entry 11 (pin model, record CLI version).
- **Idle context cost**: 0 extra (inside `claude-api`).
- **Recommendation (proposed)**: adopt the noise-floor, wired-mechanism and raw-row rules into the collection's eval procedure; leave the guides themselves to the bundled skill.

### 13. `claude-api` (the skill)

- **What it is.** A reference skill for the Claude API and SDKs ([`claude-api/SKILL.md`][capi], 611 lines, ~104 KB, plus ~60 per-language and shared files). It has bare subcommands (`migrate`, `prompt-audit`, `upgrade`, `cost-optimize`, `build-eval`, `preserved-thinking-migration`, `hillclimb`) ([L53-66][capi-L53]). It includes a dated model table ("cached: 2026-10-06", [L179][capi-L179]) and a C# folder covering the Messages API, batches, files, streaming and tool use ([`csharp/`][capi-cs]). Its 1,068-character description tells the model to grep the project for other providers "FIRST" before reading files.
- **Kind**: skill.
- **Proposed address**: none. Already bundled with Claude Code (Overview).
- **Why it could fit.** The owner builds agentic workflows. A C# SDK section exists, relevant to C# libraries that call Claude.
- **Why it might not.** It is already present. Vendoring would create a stale second copy of the fastest-moving content in the repo (model tables).
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none in the fork; the Unity baseline doesn't touch LLM APIs.
- **Idle context cost**: ~410 tokens, already paid.
- **Recommendation (proposed)**: reject vendoring; rely on the bundled copy (entries 11 and 12 use it).

### 14. `mcp-builder` (with `scripts/evaluation.py`)

- **What it is.** A four-phase guide to building MCP servers ([`mcp-builder/SKILL.md`][mcp]): research the protocol (fetch the spec sitemap, SDK READMEs by URL), implement with Zod/Pydantic schemas, `outputSchema`, annotations (`readOnlyHint`, `destructiveHint`, ...) and actionable errors, test with MCP Inspector, then write 10 read-only, verifiable, stable QA evaluations ([Phase 4, L151 onward][mcp-L151]). The recommended stack is TypeScript, or Python with FastMCP ([L52][mcp-L52]). [`evaluation.py`][mcp-eval] drives Claude through the Anthropic SDK against a live server and asks for `<summary>`, `<feedback>` on the tools, and `<response>`. Reference files cover best practices and both SDKs.
- **Kind**: skill (+ script).
- **Proposed address**: core user-invoked, if taken at all (agentic-workflow work, occasional).
- **Why it could fit.** The owner uses MCP (a Unity Editor MCP server and Rider are configured in this environment). The QA-pair evaluation method, where the model must answer real questions through the tools and give feedback on them, is a good test for any tool surface, including a Unity MCP.
- **Why it might not.** No C#: the official MCP C# SDK is not mentioned (grep), so a .NET/Unity server gets no guidance. Model-invoked as published. The eval harness needs `anthropic` and `mcp` pip packages and an API key, separate from the Claude Code subscription (inference from [`requirements.txt`][mcp-req] and the SDK import).
- **Copy / adapt / idea-only**: adapt if wanted: add a C# SDK reference, gate it user-invoked, keep the evaluation guide.
- **Overlap**: Addy `api-and-interface-design` (Addy entry 17) for interface rules; `claude-api` `agent-design.md` (tool-surface design). Unity baseline: none found in its ledger summary (inference; the baseline covers Unity feature recipes).
- **Idle context cost**: ~110 tokens if model-invoked; 0 user-invoked.
- **Recommendation (proposed)**: idea-only for now. Revisit when the owner next builds an MCP server; the QA-pair evaluation is the part worth keeping.

### 15. `webapp-testing`

- **What it is.** Python Playwright guidance for local web apps ([`webapp-testing/SKILL.md`][wat]): a decision tree (static HTML vs dynamic, server running or not), "reconnaissance-then-action" (wait for `networkidle`, screenshot or inspect the DOM, then pick selectors), and [`with_server.py`][wat-server], which starts one or more servers, polls their ports, runs a command and cleans up. It tells the agent to run scripts with `--help` and treat them as black boxes rather than read their source.
- **Kind**: skill (+ script).
- **Proposed address**: web pack, model-invoked or user-invoked.
- **Why it could fit.** Web apps are the owner's third stack. "Run `--help`, don't read the source" is a good context-saving convention for any bundled script, Unity helpers included.
- **Why it might not.** The owner's Claude Code desktop already has a built-in browser pane and a `run` skill for driving apps (this session's tool and skill listings; inference that they cover most of this). Python Playwright adds a dependency to JS projects.
- **Copy / adapt / idea-only**: idea-only, except the `--help`-first convention.
- **Overlap**: pstack `create-verification-skill` (pstack standouts); Addy `browser-testing-with-devtools` (Addy entry 18).
- **Idle context cost**: ~85 tokens if model-invoked.
- **Recommendation (proposed)**: reject the skill; take the "scripts are black boxes, `--help` first" line into `writing-for-agents`.

### 16. `frontend-design`

- **What it is.** Design-direction guidance for building UI ([`frontend-design/SKILL.md`][fd], 71 lines). Ground the design in the subject; type and layout as deliberate choices; a calibration list of five clusters that "AI-generated design right now clusters around" (cream + terracotta, near-black + acid accent, broadsheet, SaaS cards, template chrome); a two-pass plan → review-against-brief → build → critique process; and UI copy rules ("Save changes," not "Submit").
- **Kind**: skill.
- **Proposed address**: web pack, user-invoked.
- **Why it could fit.** It is short and specific, and the copy rules also apply to Unity UI text.
- **Why it might not.** Visual design is a small part of the owner's work. Its description has no "Use when" trigger phrase, which matters only if it stays model-invoked.
- **Copy / adapt / idea-only**: copy (Apache-2.0) if the web pack wants it.
- **Overlap**: Addy `frontend-ui-engineering` (Addy entry 29).
- **Idle context cost**: ~85 tokens if model-invoked; 0 user-invoked.
- **Recommendation (proposed)**: owner's call in the web-pack theme; low priority.

### 17. `web-artifacts-builder`

- **What it is.** Scaffolds a React 18 + TypeScript + Vite + Tailwind + shadcn/ui project with [`init-artifact.sh`][wab-init] and bundles it into one HTML file with Parcel for claude.ai artifacts ([`SKILL.md`][wab]). It ships a `shadcn-components.tar.gz`.
- **Kind**: skill (+ scripts).
- **Proposed address**: none.
- **Why it could fit.** Nothing specific to the owner.
- **Why it might not.** It targets claude.ai artifacts. The script installs `latest` Vite on Node 20+, and its bash and sed handling assumes macOS or Linux.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none.
- **Idle context cost**: ~115 tokens if model-invoked.
- **Recommendation (proposed)**: reject.

### 18. `doc-coauthoring` (Reader Testing)

- **What it is.** A three-stage workflow for writing docs, specs and proposals: context gathering, section-by-section refinement (clarify, brainstorm, curate, gap-check, draft), then **Reader Testing**. The agent predicts 5-10 questions a reader would ask, gives a fresh subagent only the document and each question, then has a subagent check for ambiguity, false assumptions and contradictions ([L242-292][dc-L242]). It offers the workflow and lets the user decline ([L10-26][dc]).
- **Kind**: skill.
- **Proposed address**: idea-only: Reader Testing as a step in fork `writing-for-agents` or `to-spec` (core).
- **Why it could fit.** Agent-facing documents (skills, issue bodies, `AGENTS.md`) are read by a context-free agent, and this tests exactly that. It is cheap and works on both harnesses.
- **Why it might not.** The rest of the workflow overlaps fork `grilling`, `to-spec` and `wayfinder`. Model-invoked with a broad trigger ("Trigger when user mentions writing docs"), it would compete with them. No licence file ships with it, so copying text is unclear (README says only "Many skills" are Apache-2.0).
- **Copy / adapt / idea-only**: idea-only (licence unclear; rewrite in the collection's own words).
- **Overlap**: fork `grilling`, `to-spec`, `writing-for-agents`; superpowers `brainstorming` (superpowers entry 3).
- **Idle context cost**: ~170 tokens if model-invoked.
- **Recommendation (proposed)**: reject the skill; propose Reader Testing as a check inside `writing-for-agents`.

### 19. `discernment-nudge`

- **What it is.** After a substantive answer the user may act on, append 2-3 short questions that help them check facts, probe reasoning and notice missing context, at most once per conversation, with explicit carve-outs including "writing code they will run" ([description][dn]). It is framed around the "AI Fluency framework" ([L24-42][dn]).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** It models scepticism about generated advice, which is a sound habit.
- **Why it might not.** It carves out the owner's main activity (coding). At ~380 tokens it is one of the most expensive descriptions here and fires on "after any substantive answer", which inference says competes with every research or recommendation turn.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: pstack `why` confidence tiers (pstack ledger) serve a similar purpose for engineering claims.
- **Idle context cost**: ~380 tokens.
- **Recommendation (proposed)**: reject.

### 20. `academy-guide`

- **What it is.** Recommends Claude Academy courses when a user asks how to use Claude products; carries a catalog of courses ([`academy-guide/SKILL.md`][ag]).
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** —
- **Why it might not.** Product-education content, not engineering. ~380 tokens of description that fires on "how do I" questions about skills, plugins and MCP, which are this collection's daily topic (inference: it would fire often here).
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none.
- **Idle context cost**: ~385 tokens.
- **Recommendation (proposed)**: reject.

### 21. Document skills: `docx`, `pdf`, `pptx`, `xlsx`

- **What it is.** The production document skills ([`docx`][docx], [`pdf`][pdf], [`pptx`][pptx], [`xlsx`][xlsx]) with Python helpers and OOXML schemas and validators. `docx`, `pptx` and `xlsx` each carry an identical copy of `scripts/office/` (local `diff -rq`), i.e. shared code duplicated per skill rather than referenced across skills. Proprietary licence: no copies outside the Services, no derivative works ([`docx/LICENSE.txt`][docx-lic]).
- **Kind**: skill (+ scripts).
- **Proposed address**: none. The host already provides newer copies (Overview).
- **Why it could fit.** —
- **Why it might not.** Already installed via the host; licence forbids vendoring.
- **Copy / adapt / idea-only**: idea-only: "duplicate shared scripts into each skill so each folder stands alone" is the same portability choice Addy entry 4 solves with a validator.
- **Overlap**: Addy entry 4 (shared-references portability).
- **Idle context cost**: ~1.15k tokens together if the marketplace plugin were also installed. Don't: it would duplicate the host's copies.
- **Recommendation (proposed)**: reject; never install `document-skills` alongside the host copies.

### 22. Creative and brand skills: `algorithmic-art`, `canvas-design`, `theme-factory`, `brand-guidelines`, `slack-gif-creator`, `internal-comms`

- **What it is.** p5.js generative art with seeded randomness ([`algorithmic-art`][aa]); poster and PDF design with 50+ bundled OFL fonts ([`canvas-design`][cd]); 10 preset colour/font themes for artifacts ([`theme-factory`][tf]); Anthropic's own brand colours ([`brand-guidelines`][bg]); Slack-sized GIF building with PIL/imageio helpers ([`slack-gif-creator`][sg]); company-format internal comms templates ([`internal-comms`][ic]).
- **Kind**: skills.
- **Proposed address**: none.
- **Why it could fit.** `algorithmic-art`'s seeded-randomness and parameter-exploration approach could inspire a procedural-generation prototype in Unity (idea-only, a stretch).
- **Why it might not.** Outside the owner's engineering focus; `brand-guidelines` is Anthropic's brand; together ~650 idle tokens as model-invoked skills.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none with the fork or the Unity baseline.
- **Idle context cost**: ~125 + 115 + 105 + 95 + 90 + 130 ≈ 660 tokens.
- **Recommendation (proposed)**: reject all six.

### 23. Marketplace packaging (`.claude-plugin/marketplace.json`)

- **What it is.** One marketplace, five plugins, all pointing at the repo root (`"source": "./"`) with `"strict": false` and an explicit `skills` array of folder paths ([marketplace.json][marketplace]). No `plugin.json` exists anywhere. The plugin is defined entirely by the marketplace entry, and one `skills/` tree is sliced into several plugins.
- **Kind**: manifest-packaging.
- **Proposed address**: idea-only input to ticket #18 (install architecture).
- **Why it could fit.** This is the shape the collection's "core plus packs" needs: one flat `skills/` tree, several installable plugins selected by path list, no files moved between packs. Combined with the per-project enablement in [loading-mechanics §3](../loading-mechanics.md), a Unity pack could be such a slice, disabled at user scope and enabled per project.
- **Why it might not.** Whether Codex honours `strict: false` with a `skills` path list in a Claude marketplace was not checked here. [loading-mechanics](../loading-mechanics.md) confirms Codex reads `.claude-plugin/marketplace.json` but not this field. The slicing also shows the cost trap: `example-skills` bundles 12 unrelated skills, so taking one means paying for twelve.
- **Copy / adapt / idea-only**: idea-only (a pattern, nothing to copy).
- **Overlap**: superpowers entry 2 and Addy entry 3 (multi-harness packaging); fork's own marketplace.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: record as prior art for ticket #18: "one tree, path-listed plugin slices", and the lesson to keep slices small. Verify Codex's handling of `strict: false` there.

### 24. Spec, template and licence conventions (`spec/`, `template/`, `THIRD_PARTY_NOTICES.md`, per-skill `LICENSE.txt`)

- **What it is.** The spec folder now only points to agentskills.io ([`spec/agent-skills-spec.md`][spec]); the template is a two-field `SKILL.md` ([`template/SKILL.md`][template]). Each skill carries its own `LICENSE.txt` (Apache-2.0 or the proprietary terms), and [`THIRD_PARTY_NOTICES.md`][notices] (46 KB) carries notices for bundled third-party components such as imageio and FFmpeg (GPL-3.0).
- **Kind**: convention doc.
- **Proposed address**: idea-only input to tickets #12 (vendoring, closed) and #18.
- **Why it could fit.** A per-skill licence file makes each folder self-describing when copied with provenance, which is the approach [vendoring.md](../vendoring.md) proposes for adapted skills.
- **Why it might not.** The licensing is uneven (one skill without a licence, no root licence), so per-skill checking is mandatory before vendoring anything from here.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [vendoring.md](../vendoring.md) (MIT notices carried by hand; the same applies to Apache-2.0, which also asks for a statement of changes, per the licence text in each `LICENSE.txt` §4).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: adopt "each vendored skill folder carries its upstream `LICENSE.txt` plus a provenance line" in the vendoring convention.

## Recommendation summary (proposed)

| # | Candidate | Proposed |
|---|---|---|
| 2, 3, 5 | Baseline eval loop, grader, benchmark aggregation | adopt-adapted for ticket #17 (merge with superpowers 18, pstack 33) |
| 7 | Trigger eval | adopt-adapted for ticket #17 (Windows fix, hide installed copy); compare with `claude plugin eval` first |
| 11 | `prompt-audit` | adopt as a maintenance step via the bundled `claude-api`; no vendoring |
| 12 | Eval hygiene rules | adopt the rules into the eval procedure |
| 4 | Comparator / analyzer | fold the analyst checks into 2; comparator on demand |
| 10, 15, 18 | Authoring ideas (bundle repeated scripts, read transcripts, `--help`-first, Reader Testing) | ideas into `writing-for-agents` |
| 23, 24 | Path-sliced marketplace, per-skill licences | prior art for tickets #18 and vendoring |
| 8, 9, 6 | Description optimiser, validator/packager, viewer | idea-only |
| 14, 16 | `mcp-builder`, `frontend-design` | owner's call (agentic / web pack); low priority |
| 1, 13, 21 | `skill-creator`, `claude-api`, document skills | don't vendor; already on the machine |
| 17, 19, 20, 22 | `web-artifacts-builder`, `discernment-nudge`, `academy-guide`, creative/brand skills | reject |

## Not covered and limits

- Nothing was run. The Windows failure of `run_eval.py` is inferred from the Python docs on `select.select`, not observed. The "installed copy steals the trigger" effect is inferred from the detection code.
- `claude-api` was read for its eval, audit and subcommand parts only. The per-language SDK references, Managed Agents docs and model tables were not reviewed for accuracy.
- `canvas-design`, `algorithmic-art`, `theme-factory`, `brand-guidelines`, `slack-gif-creator`, `internal-comms`, `academy-guide` and the document skills were read at frontmatter and section level only, per the ticket's "briefly".
- Where the host's `anthropic-skills` copies come from, and whether plain terminal `claude` sessions get them, was not established. Only the desktop session's listing and the files under `%APPDATA%\Claude` were checked.
- The comparison with Claude Code's native `claude plugin eval` rests on the Addy ledger's description (entry 11), not on a fresh read of its docs.

[root]: https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a
[readme]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/README.md
[marketplace]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/.claude-plugin/marketplace.json
[notices]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/THIRD_PARTY_NOTICES.md
[skills]: https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a/skills
[spec]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/spec/agent-skills-spec.md
[template]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/template/SKILL.md
[sc-dir]: https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator
[sc]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md
[sc-L26]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L26
[sc-L32]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L32-L41
[sc-L67]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L67
[sc-L71]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L71-L139
[sc-L139]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L139
[sc-L167]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L167-L197
[sc-L169]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L169-L186
[sc-L199]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L199-L205
[sc-L207]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L207-L219
[sc-L225]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L225
[sc-L236]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L236-L282
[sc-L298]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L298-L304
[sc-L325]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L325-L329
[sc-L337]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L337-L400
[sc-L394]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L394
[sc-L420]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L420-L455
[sc-L445]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/SKILL.md#L445-L455
[grader]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/agents/grader.md
[comparator]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/agents/comparator.md
[analyzer]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/agents/analyzer.md
[analyzer-L187]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/agents/analyzer.md#L187
[schemas]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/references/schemas.md
[agg]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/aggregate_benchmark.py
[gr]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/eval-viewer/generate_review.py
[gr-L288]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/eval-viewer/generate_review.py#L288-L306
[gr-L401]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/eval-viewer/generate_review.py#L401
[viewer]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/eval-viewer/viewer.html#L7-L10
[evalreview]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/assets/eval_review.html
[re-L22]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_eval.py#L22-L68
[re-L70]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_eval.py#L70-L83
[re-L108]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_eval.py#L108
[re-L133]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_eval.py#L133-L154
[re-L184]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_eval.py#L184-L267
[rl]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_loop.py
[rl-L24]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_loop.py#L24-L44
[rl-L195]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_loop.py#L195-L198
[rl-L216]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_loop.py#L216-L222
[rl-L279]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/run_loop.py#L279
[id-L79]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/improve_description.py#L79-L142
[id-L132]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/improve_description.py#L132
[id-L163]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/improve_description.py#L163-L182
[qv]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/quick_validate.py
[qv-L42]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/quick_validate.py#L42-L92
[pkg]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/package_skill.py
[pkg-L19]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/skill-creator/scripts/package_skill.py#L20-L24
[capi]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/SKILL.md
[capi-L53]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/SKILL.md#L53-L66
[capi-L179]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/SKILL.md#L179
[capi-cs]: https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/csharp/claude-api
[pa]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md
[pa-L7]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L7
[pa-L20]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L20-L25
[pa-L137]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L137-L152
[pa-L150]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L150-L161
[pa-L187]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L187-L203
[pa-L205]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L205-L229
[pa-L231]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/prompt-audit.md#L231-L237
[evals-dir]: https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals
[ea]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals/eval-audit.md
[ea-s5]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals/eval-audit.md#L181-L192
[eh]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals/eval-hillclimb.md
[eh-L31]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals/eval-hillclimb.md#L31-L52
[runner]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/claude-api/shared/evals/report/runner-scaffold.mjs
[mcp]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/mcp-builder/SKILL.md
[mcp-L52]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/mcp-builder/SKILL.md#L52
[mcp-L151]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/mcp-builder/SKILL.md#L151
[mcp-eval]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/mcp-builder/scripts/evaluation.py
[mcp-req]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/mcp-builder/scripts/requirements.txt
[wat]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/webapp-testing/SKILL.md
[wat-server]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/webapp-testing/scripts/with_server.py
[fd]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/frontend-design/SKILL.md
[wab]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/web-artifacts-builder/SKILL.md
[wab-init]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/web-artifacts-builder/scripts/init-artifact.sh
[dc]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/doc-coauthoring/SKILL.md#L10-L26
[dc-L242]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/doc-coauthoring/SKILL.md#L242-L292
[dn]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/discernment-nudge/SKILL.md
[ag]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/academy-guide/SKILL.md
[docx]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/docx/SKILL.md
[docx-lic]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/docx/LICENSE.txt
[pdf]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/pdf/SKILL.md
[pptx]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/pptx/SKILL.md
[xlsx]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/xlsx/SKILL.md
[aa]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/algorithmic-art/SKILL.md
[cd]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/canvas-design/SKILL.md
[tf]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/theme-factory/SKILL.md
[bg]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/brand-guidelines/SKILL.md
[sg]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/slack-gif-creator/SKILL.md
[ic]: https://github.com/anthropics/skills/blob/9d630808e4add0a7146de4af9384155d5dee350a/skills/internal-comms/SKILL.md
