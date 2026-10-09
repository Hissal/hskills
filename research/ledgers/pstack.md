# Ledger: pstack

Source: `cursor/plugins`, directory `pstack/`, read at commit [`ccb5507`][root] (2026-10-07, plugin version 0.15.15 per [`plugin.json`][manifest]). Read on 2026-10-09 from a sparse clone; nothing was installed or executed. Every pstack link below is pinned to that SHA. Fork links are pinned to `Hissal/mattpocock-skills-unity` at [`3d926c6`][fork-readme].

This ledger deepens the fork's earlier review (`research/2026-10-09-skill-collection-comparison.md` in the fork, staged but not yet committed there). That review read the same pstack SHA and covered `blast-radius`, `benchmark-checklist`, hillclimb, `how`/`why`, the verification-skill pair, `correct`, `interrogate`, `arena`/`architect`, the eval playbook, seven principles, and warnings about `poteto-mode`, `no-comments`, visual parity, trace forensics and Benny. This ledger does not repeat those arguments. It adds the rest of the catalog, the mechanisms, the Cursor-specific blockers, and a proposed address and cost for each candidate.

Everything below is **proposed**. The owner decides in theme sessions.

## Overview

**What pstack ships** (counted from the tree at `ccb5507`):

| Part | Count | Where |
|---|---|---|
| Skills | 51: one router (`poteto-mode`), 24 `principle-*` skills, 26 other skills | [`skills/`][skills] |
| Playbooks (router-owned procedure files) | 23, plus one reference (`bugbot-triage.md`) | [`poteto-mode/playbooks/`][playbooks] |
| Agent definitions | 2 (`poteto-agent`, `Comment Sicko`) | [`agents/`][agents] |
| Scripts | 2 Bun/TypeScript CLIs (`watch-pr`, `orch`), `check-plan.mjs`, `worktree-audit.sh`, `log.sh`, a dependency bootstrap | [`poteto-mode/scripts/`][scripts], [`show-me-your-work/scripts/log.sh`][logsh] |
| Automation pack | Benny: 3 automation skills, 3 templates, 3 references | [`automations/benny/`][benny] |
| Docs | 10-page user guide | [`docs/guide/`][guide] |
| Packaging | Cursor plugin manifest | [`.cursor-plugin/plugin.json`][manifest] |

**The design fact that matters most for this collection.** 50 of the 51 skills set `disable-model-invocation: true`. Only [`setup-pstack`][setup] lacks it, and [`poteto-help`][help] says so in plain words: "Only `/setup-pstack` loads from the user's words." Every workflow and every principle is user-invoked, or reached through the user-invoked router. If all 51 descriptions were model-invoked they would cost roughly 2,700 tokens of idle context (estimate: description characters / 4, computed over the tree), 1,200 of that from the principles alone. pstack pays none of that at idle; it pays at invocation, when the router's ~20 KB body and its principle index load. This is the clearest prior art for the map's "idle context is a budget" note and for ticket #15 (gating and routing).

**Standout candidates (proposed):**

- `benchmark-checklist` with `principle-explain-the-number`: the most portable piece in the source. No Cursor dependency in the procedure.
- The **Hillclimb** and **Eval** playbooks: experiment discipline for optimisation and for testing skill changes. Eval is a candidate for the collection's own maintenance machinery (ticket #17).
- `show-me-your-work` plus `log.sh`: a small, scriptable decision trail for unattended runs.
- `blast-radius`, `correct`, and the `why` epistemics tiers: evidence ladders the fork lacks.
- `create-verification-skill` / `maintain-verification-skill`: a generator for a per-project "drive the real app" skill, which fits a Unity pack variant.
- `principle-test-behavior-not-implementation`: one sharp, checkable test-quality rule ("would it pass if every import returned `undefined`?").

**Biggest open questions:**

1. **Router or not.** pstack routes everything through one user-invoked mode skill whose `reminder:` frontmatter keeps it in context as a Cursor Custom Mode. Claude Code and Codex have no Custom Mode (inference; ticket #2 owns harness facts). Does the collection want a router at all (ticket #15), and if so, user-invoked only?
2. **Model diversity.** `interrogate`, `arena`, `architect`, `reflect`, `why` and `how` assign different model *families* per role (defaults `claude-opus-5-5-xhigh` and `grok-4.7-xhigh-fast`, per [`setup-pstack`][setup]). Their value claim is "the adversarial signal comes from model diversity" ([`interrogate`][interrogate]). Claude Code subagents can pick only Claude models, as far as this reader knows (inference, verify in ticket #2). Same-model fan-out may keep little of the value.
3. **Principles as addressable files.** pstack keeps each principle as a separate disabled skill that the router's index points at. In Claude Code a disabled skill presumably cannot be loaded through the Skill tool by the model, so the principles would need to become plain reference files read by path (inference; ticket #2).
4. **One authorization policy.** pstack's [`poteto-mode` Autonomy section][pm] lets "external actions (team chat, ticket updates, kicking off evals) proceed without asking", while [`principle-never-block-on-the-human`][p-never-block] lists "send external messages" as needing confirmation. The prior review flagged the same mismatch. The collection needs one policy before borrowing any autonomy text.
5. **PR-landing machinery for one developer.** About a third of the playbook text (Babysit, Shipping, Autopilot-full/stack, Orchestrate) plus both TypeScript CLIs serve stacked-PR fleets with Bugbot and cloud agents. Likely surplus for a solo Unity developer, but the owner should say so explicitly.

### Cursor-specific assumptions that block direct copying

These recur across entries; each entry names the ones it hits.

| Assumption | Evidence | Effect on Claude Code / Codex |
|---|---|---|
| `Task` tool fields `subagent_type`, `model` (slug), `readonly` ("strips MCP"), `environment: "cloud"`, `cloud_base_branch`, `run_in_background` | [`poteto-mode` Subagents][pm], [`swarm`][swarm], [`reflect`][reflect] | Claude Code's Agent tool has different fields and no Cursor cloud agents. Rewrite every spawn. |
| Cross-family model slugs and a per-role model rule at `~/.cursor/rules/pstack-models.mdc` (`alwaysApply: true`) | [`setup-pstack`][setup] | No equivalent always-applied rule file format; cross-family panels likely impossible (inference). |
| `mode: true`, `reminder:`, `icon:`, `color:` frontmatter (Custom Modes) | [`poteto-mode` frontmatter][pm], [`poteto-help`][help] | Unsupported keys (inference); router would be a plain user-invoked skill. |
| `paths:` frontmatter for file-glob activation | [`typescript-best-practices`][ts] | Unknown in Claude Code / Codex; ticket #2. |
| Cursor built-ins `/loop`, `create-skill`, `AskQuestion`, `/automate`, `SendToUser` secret-request, `update_state` routines | [`autonomous-run`][pb-autonomous], [`authoring-a-skill`][pb-authoring], [`automate-me`][automate-me], [`make-bot-ui`][bot-ui] | Claude Code on this machine lists a `loop` skill (observed in this session's skill list, not doc-verified); the others have no direct equivalent. |
| Skills that pstack calls but does not ship: `deslop`, `control-ui`, `control-cli` (from `cursor-team-kit`) | [README "not shipped here"][readme] | Every playbook step that says "via the control skill" has no target. For Unity, the Unity MCP / `unity-verification` would be the control surface. |
| Transcript paths `~/.cursor/projects/<slug>/agent-transcripts/` | [`recall`][recall], [`reflect`][reflect], [`eval`][pb-eval], [`show-me-your-work`][smyw] | Claude Code keeps session JSONL under `~/.claude/projects/<slug>/` (observed on this machine); path and record schema differ. |
| Project skill path `.cursor/skills/` | [`create-verification-skill`][cvs], [`automate-me`][automate-me] | Becomes `.claude/skills/` and `.agents/skills/` or whatever ticket #18 decides. |
| Bugbot, Origin forge CLI, Graphite (`gt`) | [`babysit`][pb-babysit], [`shipping`][pb-shipping], [`orchestrate`][pb-orchestrate] | Not in the owner's stack. |
| Bun runtime with a self-installing bootstrap (`bun install --frozen-lockfile` on first run, then re-exec) | [`bootstrap.ts`][bootstrap] | Needs Bun on Windows; runtime dependency install from a skill directory is a supply-chain decision, not a copy. |
| macOS/Unix tooling (`xcrun simctl`, `df -h /`, `uptime`, `nproc`, `strace`) | [`worktree-cleanup`][pb-worktree], [`benchmark-checklist`][bench] | Owner is on Windows; examples need replacing. |

## Entries

Entries run router and packaging first, then skills, then principles, then playbooks, then other mechanisms. Where a group of files does one job, one entry covers the group and names each file.

---

### 1. `poteto-mode` (the router)

- **What it is.** A user-invoked skill that every non-trivial task enters. It holds a trigger list ("Non-negotiables"), an inline index of all 24 principles with one-line "when it applies" clauses, an Autonomy policy, subagent defaults, a reply-writing style, and a list of 23 playbooks. On invocation it matches the task to a playbook and copies that playbook's steps verbatim into the todo list, keeping skipped steps as `skip: <reason>`. [`poteto-mode/SKILL.md`][pm]
- **Kind**: skill (router) + convention doc.
- **Proposed address**: idea-only for the collection's router design (ticket #15). If anything is built, core user-invoked.
- **Why it could fit.** It is the most worked-out example of "expensive workflows are user-invoked; the agent only reaches them through one door", which is the map's stated rule. The "copy the playbook steps verbatim into the todo list, keep skips visible" mechanic is a cheap way to make a workflow auditable. The "name each principle that shaped a decision and the choice it changed" rule turns principles from name-dropping into evidence ([guide p. 8][guide-08]).
- **Why it might not.** It encodes one person's style and Cursor's runtime throughout: model slugs, `poteto-agent`, `cursor-team-kit` skills, Bugbot, Custom Modes. Its triggers are very broad ("Any code → name the data shape first", "Code crossing a function boundary → the architect skill"), which for routine Unity edits would trigger multi-agent design work. The fork already has a router, [`ask-matt`][fork-ask-matt].
- **Copy / adapt / idea-only**: idea-only. Cannot be copied because nearly every line names a Cursor tool, model slug or unshipped skill, and its Autonomy text conflicts with the owner's harness rules (open question 4).
- **Overlap**: fork `ask-matt` (router), fork `wayfinder`/`implement` (workflow ownership). Unity baseline: none known (ticket #3).
- **Idle context cost**: 0 if user-invoked (pstack's own choice). About 50 tokens of description if model-invoked; body ~20 KB on invocation.
- **Recommendation (proposed)**: take the *pattern* into ticket #15: one user-invoked entry, a principle index inside it rather than in idle context, verbatim step copying with visible skips. Do not adopt the file.

### 2. Plugin packaging and the "everything user-invoked" convention

- **What it is.** [`plugin.json`][manifest] declares `"skills": "./skills/"` and `"agents": "./agents/"`; Benny's files sit outside both so they never register as slash skills ([Benny README][benny-readme]). 50 of 51 skills set `disable-model-invocation: true` (counted from frontmatter). [`setup-pstack`][setup] writes an always-applied rule that every skill reads for per-role model choices, with documented fallbacks when the rule or a line is missing.
- **Kind**: manifest-packaging + convention doc.
- **Proposed address**: idea-only input to ticket #18 (install architecture) and ticket #14 (always-on).
- **Why it could fit.** It shows that a large catalog can ship with near-zero idle cost. The "config rule overrides skill defaults; missing line falls back" shape is a clean way to make a pack configurable per machine without editing skills.
- **Why it might not.** Cursor's plugin format is not Claude Code's or Codex's. Making everything user-invoked also gives up the agent reaching for a small, cheap discipline skill on its own, which the fork relies on (most fork engineering skills are model-invoked per its [README][fork-readme]).
- **Copy / adapt / idea-only**: idea-only. The manifest format is Cursor's.
- **Overlap**: fork's Claude Code plugin marketplace setup ([fork README][fork-readme]).
- **Idle context cost**: n/a (mechanism).
- **Recommendation (proposed)**: record as prior art for tickets #14, #15 and #18, especially the split between "registered skills" and "dormant pack files that are not skills".

### 3. `poteto-agent` agent definition

- **What it is.** A 686-byte subagent definition whose whole job is "read the `poteto-mode` skill's `SKILL.md` in full before any work". `poteto-mode` tells every playbook step to spawn this type rather than a general one, because "substituting `generalPurpose` skips that read and drifts". [`agents/poteto-agent.md`][agent-poteto]
- **Kind**: convention doc (agent definition).
- **Proposed address**: idea-only.
- **Why it could fit.** It names a real failure: delegated subagents do not inherit the parent's loaded skill. A collection that delegates (fork `implement`, `loop-me`) could use the same move: a named subagent that loads the discipline first.
- **Why it might not.** It ties every subagent to one full style document, which costs ~20 KB per spawn.
- **Copy / adapt / idea-only**: idea-only. Claude Code subagent files have their own frontmatter; `is_background` is Cursor's.
- **Overlap**: fork `ask-matt` and `loop-me` both ship `agents/` folders (seen in the fork tree); not read in detail here.
- **Idle context cost**: Claude Code lists subagent descriptions to the parent (inference; ticket #2). About 90 tokens if adopted as written.
- **Recommendation (proposed)**: idea-only; raise in ticket #15 as "how does a delegated agent inherit the collection's discipline".

### 4. `how`

- **What it is.** Answers "how does X work?" at the level of a senior engineer onboarding. Simple questions get one explainer; complex ones get 2 to 4 parallel read-only explorers, then one explainer that synthesizes into Overview / Key Concepts / How It Works / Where Things Live / Gotchas. [`how/SKILL.md`][how], [`explainer-prompt.md`][how-explainer]
- **Kind**: skill.
- **Proposed address**: core user-invoked.
- **Why it could fit.** Unfamiliar Unity packages and C# libraries are a frequent cost for the owner. The output template is a good fixed shape for onboarding notes. The "when in doubt, take the simple path" rule keeps cost down.
- **Why it might not.** Plain Claude Code already does this well with an Explore subagent; the added value is mostly the output shape and the parallel-angle decomposition.
- **Copy / adapt / idea-only**: adapt. Replace `Task` fields and model-role lines; keep the two-path complexity split and the explainer template.
- **Overlap**: fork `research` (but that targets external primary sources, not the local codebase); fork `teach`. Claude Code's built-in Explore agent.
- **Idle context cost**: 0 as user-invoked; ~77 tokens if model-invoked.
- **Recommendation (proposed)**: adapt as a small user-invoked skill, or fold its template into whatever investigation entry the collection picks. Low priority.

### 5. `why` and its epistemics framework

- **What it is.** Answers "why is this built this way?". It anchors on code (blame, `git log --follow`, `gh pr view`), then spawns one investigator per available evidence category (source control, tracker, docs, chat, observability, error tracking, analytics) and a synthesizer. Its [`references/epistemics.md`][why-epistemics] defines confidence tiers (Direct, Supported, Inferred, and further) with phrasing rules; the synthesizer may not flatten them. [`why/SKILL.md`][why], [`code-archaeology.md`][why-archaeology]
- **Kind**: skill + convention doc (epistemics).
- **Proposed address**: core user-invoked for the skill; the epistemics tiers as a shared reference used by research-type skills.
- **Why it could fit.** The epistemics tiers are a sharper version of the map's own "mark inference as inference" rule. The code-archaeology playbook (pickaxe `-S`/`-G`, `--follow`, PR mining) is directly useful in the owner's repos.
- **Why it might not.** Six of its seven evidence categories assume team tools (Slack, Datadog, Sentry, Databricks). For a solo developer, source control plus GitHub Issues is most of the evidence, so the parallel fan-out mostly reports "no MCP available".
- **Copy / adapt / idea-only**: adapt. Keep code anchoring, code archaeology and epistemics; drop or make optional the per-MCP roster and source playbooks named for specific vendors.
- **Overlap**: fork `research` (cited primary-source write-ups), fork `domain-modeling` (ADRs as rationale). The prior review proposed `how`/`why` together.
- **Idle context cost**: 0 as user-invoked; ~106 tokens if model-invoked (the longest description in pstack).
- **Recommendation (proposed)**: adapt the epistemics tiers into the collection's research discipline (high value, small); adapt a slim git-only `why` as user-invoked (medium value).

### 6. `teach`

- **What it is.** Explains a change or subsystem so a person understands it, by running `how` and `why` and weaving their output into one plain account, built up "diagram by diagram" (each diagram redraws the last and adds one part). [`teach/SKILL.md`][teach]
- **Kind**: skill.
- **Proposed address**: none proposed.
- **Why it could fit.** The incremental-diagram rule is a good teaching technique.
- **Why it might not.** Name clash with the fork's `teach`, which is a multi-session, stateful teaching workspace with a different job ([fork README][fork-readme]). Depends on `how`, `why` and an image-generation tool.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `teach` (same name, different job), fork `wait-what`.
- **Idle context cost**: 0 (not proposed).
- **Recommendation (proposed)**: reject as a skill; offer the "redraw and add one part" diagram rule to the fork's `teach` as an idea.

### 7. `recall`

- **What it is.** Rebuilds the user's recent working context from their own chat transcripts (fanned out to cheap subagents) plus the shared record (via `why`'s investigators), checks the surfaced PRs and branches against live `git`/`gh`, and returns a fixed capsule: at most 5 bullets, one status-tagged line per thread, at most 5 problems, one next move. [`recall/SKILL.md`][recall]
- **Kind**: skill.
- **Proposed address**: core user-invoked, if adopted.
- **Why it could fit.** The owner runs many sessions across Unity projects and this repo; "where did I leave off" is a real need. The status-tag vocabulary (`[merged #N]`, `[in flight <branch>]`, `[reverted #N]`) is a tidy output contract. It scopes itself to the active workspace by default and forbids reading other projects' chats without being asked.
- **Why it might not.** Transcript paths and JSONL schema are Cursor's. The fork's `handoff` and `claude-handoff` cover the deliberate case (writing state down before leaving); `recall` covers the case where nobody did.
- **Copy / adapt / idea-only**: adapt. Rewrite the transcript locator for `~/.claude/projects/<slug>/` (and Codex's store, unknown); drop the multi-source sweep down to git and GitHub.
- **Overlap**: fork `handoff`, `claude-handoff`; pstack `session-pickup` playbook (entry 31).
- **Idle context cost**: 0 as user-invoked; ~82 tokens if model-invoked.
- **Recommendation (proposed)**: medium priority. Decide together with handoff/pickup in one theme.

### 8. `blast-radius`

- **What it is.** Finds what a change breaks outside the diff, with a five-step evidence ladder ("You said so" → "pointed at the line" → "showed the bad case can't happen" → "ran it" → "reproduced it in the running app") and a rule to find and *prove by running code* the single fact the change is safe because of. [`blast-radius/SKILL.md`][blast]
- **Kind**: skill.
- **Proposed address**: core user-invoked.
- **Why it could fit.** The prior review already argued fit for Unity asset migrations, lifecycle changes, saved data and public C# APIs. New here: the evidence ladder is reusable beyond this skill, for example in review and diagnosis reports.
- **Why it might not.** Step 3's examples are web-specific ("microtasks, unmount and teardown, Solid versus React"). Its step 6 escalates to `arena` (multi-model).
- **Copy / adapt / idea-only**: adapt. Replace web examples with Unity and C# ones (serialized field consumers, `.meta` GUID references, domain reload, reflection and string-based lookups); drop the `arena` step or make it optional.
- **Overlap**: fork `code-review` (reads the diff, does not prove safety by running code); fork `unity-serialization` (owns rename and move rules for assets). Unity baseline unknown (ticket #3).
- **Idle context cost**: 0 as user-invoked; ~70 tokens if model-invoked.
- **Recommendation (proposed)**: adopt-adapted, high priority, user-invoked. Consider lifting the evidence ladder into a shared reference.

### 9. `benchmark-checklist` (with `principle-explain-the-number`)

- **What it is.** Seven questions to vet any measured number before reporting it: why not double (name the limiter), was each side tuned, does it break physical limits, did it error, does it reproduce (at least 5 alternating runs, median and range), does it matter end to end, did the work even happen. Ends in a fixed report shape and an "inconclusive" rule. The principle file states the same idea in one page. [`benchmark-checklist/SKILL.md`][bench], [`principle-explain-the-number`][p-explain]
- **Kind**: skill (+ principle as convention doc).
- **Proposed address**: core model-invoked (it is short, and the agent should reach for it whenever it reports a number), or core user-invoked if the budget is tight.
- **Why it could fit.** No Cursor runtime dependency in the procedure. Unity performance claims (frame time, GC alloc, load time) are exactly where noise, Editor-versus-Player and Debug-versus-Release mistakes produce plausible wrong numbers. The prior review rated it high.
- **Why it might not.** Examples are Unix and Node (`uptime`, `nproc`, `node --cpu-prof`, `strace`). For Unity the "tuned" question needs Player builds, IL2CPP versus Mono, and Profiler settings, which belong in the Unity pack.
- **Copy / adapt / idea-only**: adapt. Keep the seven questions and the report rule verbatim in spirit; move tool examples into a short per-stack table, with the Unity row in the Unity pack.
- **Overlap**: fork `diagnosing-bugs` (covers perf regressions as a diagnosis loop, not number vetting); fork `unity-debugging` ("measuring a Unity performance regression" per its description).
- **Idle context cost**: ~60 tokens if model-invoked.
- **Recommendation (proposed)**: adopt-adapted, high priority. Pair the core checklist with a Unity pack note that `unity-debugging` can point at.

### 10. `architect` and its design red flags

- **What it is.** Five phases: ground with `how` (and `why`), sketch at least two structurally distinct designs via `arena` on two model families, screen each against [`design-red-flags.md`][arch-flags] (shallow module, information leakage, temporal decomposition, pass-through method, split ownership, two ways to do one task, importable internals), implement against the sketch, and scrap the sketch when deviations repeat. [`architect/SKILL.md`][architect]
- **Kind**: skill + convention doc (red flags).
- **Proposed address**: idea-only for the skill; the red-flag list could become a reference inside the fork's `codebase-design`.
- **Why it could fit.** The red flags are framed for agent contributors ("assume the next contributor is an agent that sees only the files it opened, copies the nearest example"), which is a useful lens the fork's deep-module vocabulary does not state as directly. Phase E's scrap tells are concrete.
- **Why it might not.** Heavy overlap with fork `codebase-design` and `improve-codebase-architecture` (both deep-module based, per the [fork README][fork-readme]). Requires `arena` with model diversity. `poteto-mode` triggers it for any code crossing a function boundary, which would be constant in C#.
- **Copy / adapt / idea-only**: idea-only. Cannot copy because it is built on `arena`'s cross-family runners and Cursor `Task` fields.
- **Overlap**: fork `codebase-design`, `improve-codebase-architecture`, `prototype`; the prior review noted overlap with `DESIGN-IT-TWICE.md`.
- **Idle context cost**: 0 (not proposed as a skill).
- **Recommendation (proposed)**: offer "split ownership", "two ways to do one task" and "importable internals" as additions to the fork's design vocabulary. Reject the skill.

### 11. `arena`

- **What it is.** N parallel candidates on the same prompt, a readonly cross-judge on a different model family, a base chosen criterion by criterion from a 3 to 6 item rubric, then hand-grafting of the best ideas from the losers, then verification. Divergent candidates mean the framing was under-specified: reframe, don't average. [`arena/SKILL.md`][arena]
- **Kind**: skill.
- **Proposed address**: core user-invoked, if adopted.
- **Why it could fit.** The rubric-first, pick-a-base-then-graft procedure is sound and model-agnostic in shape. "Wild divergence means re-frame" is a useful stop rule.
- **Why it might not.** Its value is cross-family judging; with only Claude models it becomes same-model fan-out (open question 2). It is expensive by design.
- **Copy / adapt / idea-only**: adapt or idea-only depending on ticket #2's answer about model choice in Claude Code and Codex.
- **Overlap**: fork `prototype` (variants behind a switcher), `codebase-design` ("design it twice"); pstack `swarm`, `architect`.
- **Idle context cost**: 0 as user-invoked; ~61 tokens if model-invoked.
- **Recommendation (proposed)**: idea-only until ticket #2 lands; then reconsider as a user-invoked skill.

### 12. `swarm`

- **What it is.** Fan out N parallel cloud workers over slices or races, declare a selection rule up front (`first pass`, `rank all`, `best-of`), require each report to carry the SHAs and method its brief named, respawn once on a malformed result, and return one table. [`swarm/SKILL.md`][swarm]
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** The aggregation rules (drop a result that omits the requested SHA and method; a gap is not a pass) are good discipline for any fan-out.
- **Why it might not.** Built on `environment: "cloud"` Cursor agents. Claude Code's Agent tool and Workflow scripts already cover fan-out natively (inference from this session's tool list).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `loop-me` (in progress, "co-ordinating subagents").
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; fold "a gap is not a pass" and "declare the race rule before spawning" into whatever orchestration skill the collection keeps.

### 13. `interrogate`

- **What it is.** One reviewer per configured model gets the same prompt, a rubric and a strict code-quality lens ([`code-quality-review.md`][interrogate-cq], which includes "do not let a PR push a file from under 1k lines to over 1k"). The lead then sorts every finding into Act on / Consider / Noted / Dismissed using [`lead-judgment.md`][interrogate-lead] (nitpick gravity, hypothetical versus actual, premature-abstraction warnings), plus an agreement map. [`interrogate/SKILL.md`][interrogate]
- **Kind**: skill.
- **Proposed address**: idea-only for the skill; the lead-judgment framework as an addition to fork `code-review`.
- **Why it could fit.** The lead-judgment filters are what most multi-reviewer setups miss: they stop a reviewer's padded nits from becoming work. Model-independent.
- **Why it might not.** The fan-out's value depends on model diversity (open question 2). The fork's `code-review` already runs two parallel sub-agents on separate axes (Standards and Spec).
- **Copy / adapt / idea-only**: adapt the lead-judgment reference only.
- **Overlap**: fork `code-review` (strong).
- **Idle context cost**: 0 for a reference file.
- **Recommendation (proposed)**: offer `lead-judgment.md`'s four buckets and filters to the fork's `code-review` synthesis step. Reject the skill as a separate entry.

### 14. `correct`

- **What it is.** Mines commits, reverts, review comments and agent instruction files for mistake classes (a class counts after two occurrences), fixes each at the highest level that works (architecture, then types or a lint whose error names the fix, then tests, then docs last), proves each new check fails on a real past mistake, and keeps a rule-to-enforcer table in the agent instruction file. [`correct/SKILL.md`][correct]
- **Kind**: skill.
- **Proposed address**: core user-invoked, or folded into a core `retro` extension.
- **Why it could fit.** The prior review proposed folding its "prove the check rejects a real past mistake" requirement into `retro`. New here: the rule-to-enforcer table is a concrete artifact the fork's `retro` does not produce, and it makes unenforced rules visible as repeats.
- **Why it might not.** Overlaps `retro`; two retrospective-style skills compete for the same trigger.
- **Copy / adapt / idea-only**: adapt. Short and nearly tool-free; needs only Unity examples (asmdef boundaries, Roslyn analyzers) in the pack.
- **Overlap**: fork `retro`; pstack `reflect` (entry 15), `principle-encode-lessons-in-structure`.
- **Idle context cost**: 0 as user-invoked; ~78 tokens if model-invoked.
- **Recommendation (proposed)**: adopt-adapted as an extension of `retro` (one owner per workflow), keeping the enforcer table.

### 15. `reflect`

- **What it is.** Three parallel reviewers (judgment, tooling, divergent) read the session transcript; a synthesizer returns Accepted / Rejected / Backlog; items better enforced by a check move to Backlog; the user approves before any skill edit. The tooling reviewer prompt treats the transcript as untrusted data and flags every moment the user supplied context the agent could have fetched. [`reflect/SKILL.md`][reflect], [`tooling-reviewer.md`][reflect-tooling]
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** "Route each learning to a concrete edit on an existing skill" is the right target for a collection that will maintain many skills. The prompt-injection stance in the reviewer prompt is worth copying anywhere transcripts are read.
- **Why it might not.** The fork's `retro` covers session retrospectives. Three model-diverse reviewers per session is costly.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `retro`; pstack `correct`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; consider the "learning → named skill edit, human approves" routing for the collection's maintenance machinery (ticket #17).

### 16. `automate-me`

- **What it is.** Mines the user's recent transcripts in parallel slices for repeated preferences (a signal must appear in two or more slices), asks one or two structured questions, and drafts a personal `<handle>-mode` skill that defaults to `disable-model-invocation: true`. [`automate-me/SKILL.md`][automate-me]
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** The owner is building exactly this, a personal collection; mining transcripts for evidence of actual habits is a good input to the theme sessions.
- **Why it might not.** The deliverable is a one-off; a skill to produce it is more than the job needs. Depends on Cursor `create-skill`, `AskQuestion` and transcript paths.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents`, `grilling`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only. Possibly run its mining step once, by hand, as research input for theme sessions.

### 17. `figure-it-out`

- **What it is.** When no playbook fits, design one first: a falsifiable done predicate, quantified scope, a rigor level, riskiest-unknown-first units, a harness with a captured baseline, a hypothesis loop with VERIFIED / NOT VERIFIED / INCONCLUSIVE verdicts, and a committed decision trail. [`figure-it-out/SKILL.md`][figure]
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** "Inconclusive is not a pass" and "build the harness before the work" are good rules for long unattended runs.
- **Why it might not.** Overlaps the fork's `wayfinder` (plans large work as decision tickets) and `loop-me` (long-running goal). It starts by reading `poteto-mode`'s principles.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `wayfinder`, `loop-me`, `to-spec`/`to-tickets`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; offer the three-valued verdict to `loop-me`.

### 18. `show-me-your-work` and `log.sh`

- **What it is.** An append-only TSV decision log (`ts, phase, decision, why, evidence, result`), local by default and committed only when a reviewer needs it. A Bash helper stamps the timestamp, strips tabs and newlines, and prefixes cells starting with `=`, `+`, `-` or `@` to stop spreadsheet formula injection. At the end of a run the agent audits its rows against the transcript (supersede, never edit), and a different-model reviewer adds an "Attention" section. [`show-me-your-work/SKILL.md`][smyw], [`log.sh`][logsh], [template][smyw-template]
- **Kind**: skill + script.
- **Proposed address**: core user-invoked, plus the script as a shared mechanism other skills call.
- **Why it could fit.** The fork has long-running skills (`wayfinder`, `implement`, `loop-me`) with no shared trail format. The format is tiny and tool-agnostic; the formula-injection guard shows care. Hillclimb and figure-it-out both reuse it, so it is a genuine shared mechanism.
- **Why it might not.** The transcript audit and cross-model review depend on Cursor paths and model diversity. Bash on Windows needs Git Bash (present on this machine).
- **Copy / adapt / idea-only**: adapt. Copy the format and `log.sh` nearly as-is (MIT, keep notice); rewrite the audit step for Claude Code transcripts; make the cross-model review optional.
- **Overlap**: fork `handoff` (state, not decisions); none for decision logs.
- **Idle context cost**: 0 as user-invoked; ~85 tokens if model-invoked.
- **Recommendation (proposed)**: adopt-adapted, high priority, as a shared mechanism that `loop-me` and hillclimb-style workflows reference.

### 19. `create-verification-skill` and `maintain-verification-skill`

- **What it is.** The generator interviews the repo (surface, run, drive, observe, isolate), writes a project-local `verify-<app>` skill with Launch / Doctor / Drive / Evidence / Cleanup / Helpers sections and a per-feature map, then must run its own instructions once end to end and confirm evidence survives cleanup. The maintainer runs one read-only subagent per feature file from source, then one live pass that exercises every feature under three invariants, and ships at most one PR of proven corrections. [`create-verification-skill`][cvs], [`maintain-verification-skill`][mvs], [feature-map example][cvs-example]
- **Kind**: skill (generator) + convention doc (feature map).
- **Proposed address**: Unity pack user-invoked (a Unity-flavoured generator); possibly a web pack variant later.
- **Why it could fit.** The prior review saw it as complementary to `unity-verification`: the ladder picks *which* check; a feature map says *how to exercise this game's features*. "A generated skill that was never executed is a draft" and "kill what you started, never by process name" are good rules. The doctor step maps to "is the Editor connected and on the right scene".
- **Why it might not.** Its harness recipes are web, CLI and service shaped; Unity Play mode driving needs the Unity MCP or test framework, which the Unity baseline may already cover (ticket #3). Writes to `.cursor/skills/`.
- **Copy / adapt / idea-only**: adapt. Rewrite the Drive and Doctor sections for Unity (Play mode entry, scene load, input simulation, screenshot, log capture), retarget paths, keep the feature-map shape and the "prove before handing over" step.
- **Overlap**: fork `unity-verification`, `unity-debugging`; Benny's [control-adapter contract][benny-control] (entry 37); Unity baseline unknown (ticket #3).
- **Idle context cost**: 0 as user-invoked; ~75 tokens each if model-invoked.
- **Recommendation (proposed)**: adapt into the Unity pack, after ticket #3 says what Unity's own skills drive.

### 20. `tdd`

- **What it is.** A narrow bug-fix TDD: write a failing regression test only when a cheap local test path exists; otherwise use the closest executable check; "prefer no new test over a bad test". [`tdd/SKILL.md`][tdd]
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** Its "when not to test" list is honest and short.
- **Why it might not.** The fork's `tdd` is a fuller red-green-refactor skill with Unity test rules behind it (`unity-testing`). Two `tdd` skills would collide by name.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `tdd`, `unity-testing`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject; optionally offer the "bad test" list to fork `tdd`.

### 21. `technical-writing`

- **What it is.** A layered writing standard: Diátaxis to pick the document mode, Google developer style for sentences, Simplified Technical English rules for load per sentence, Global English for single readings, plus a worked before-and-after. [`technical-writing/SKILL.md`][tw]
- **Kind**: skill (convention doc).
- **Proposed address**: core user-invoked, if adopted.
- **Why it could fit.** The owner writes READMEs and docs for publishable C# libraries and the fork; a standard with named sources is better than taste.
- **Why it might not.** Overlaps fork `writing-for-agents` (agent-facing docs) and fork `pr` (PR bodies), and the three in-progress writing skills. Its "propose a new offender to `unslop`" rule couples it to `unslop`.
- **Copy / adapt / idea-only**: adapt; small edits only (drop the coupling and tab-indent rule).
- **Overlap**: fork `writing-for-agents`, `pr`, `writing-*` (in progress).
- **Idle context cost**: 0 as user-invoked; ~67 tokens if model-invoked.
- **Recommendation (proposed)**: put in the writing theme against `writing-for-agents`; likely adapt as user-invoked for human-facing docs.

### 22. `unslop`

- **What it is.** A numbered catalog of AI-prose tells (vocabulary, "serves as", rule of three, em dashes, mid-sentence colons, inline-header lists, abstract metaphor nouns, over-compression), with stable rule numbers other skills cite. Description: "Cut AI tells from any writing. Must always apply." [`unslop/SKILL.md`][unslop]
- **Kind**: skill (convention doc).
- **Proposed address**: core user-invoked, or a reference file that writing skills point at. Not always-on.
- **Why it could fit.** Concrete, checkable, and short. Stable rule ids make it citable from other skills.
- **Why it might not.** Its description says "must always apply", which would argue for always-on and permanent context cost; pstack itself still disables model invocation. Overlaps `writing-for-agents`, and the map lists caveman and vibe-wise as already-available prose plugins (ticket #9).
- **Copy / adapt / idea-only**: adapt as a reference file; it is near tool-free.
- **Overlap**: fork `writing-for-agents`; ticket #9 (caveman, vibe-wise).
- **Idle context cost**: ~13 tokens of description if model-invoked (the shortest useful one in pstack); ~1.5 K tokens if made always-on (body size 6 KB / 4).
- **Recommendation (proposed)**: writing theme; lean towards a reference file cited by writing skills, not always-on.

### 23. `bro`

- **What it is.** One instruction: restate the last message plainly, no jargon. [`bro/SKILL.md`][bro]
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** Zero-cost user-invoked convenience.
- **Why it might not.** The fork's `wait-what` does the same with glossary grounding.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: fork `wait-what`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject (covered by `wait-what`).

### 24. `typescript-best-practices`

- **What it is.** A rule table grounding `principle-type-system-discipline` in TypeScript (discriminated unions, branded types, `unknown` over `any`, schemas before guards, no `as`, exhaustiveness via `never`, `satisfies`), activated by `paths: ["**/*.ts", "**/*.tsx"]`. [`typescript-best-practices`][ts], [patterns][ts-patterns]
- **Kind**: skill.
- **Proposed address**: web pack model-invoked (or path-scoped if the harness supports it); idea for a C# counterpart.
- **Why it could fit.** Web apps are the owner's third area. The table form (rule, one-line summary) is a good shape for a C# pack equivalent: records and sealed hierarchies for sum types, `readonly struct` for branded ids, nullable reference types, exhaustive `switch` expressions.
- **Why it might not.** `paths:` activation may not exist in Claude Code or Codex (ticket #2). The fork's in-progress `setup-ts-deep-modules` touches TypeScript structure.
- **Copy / adapt / idea-only**: adapt for the web pack; idea-only for C#.
- **Overlap**: fork `setup-ts-deep-modules`, `migrate-to-shoehorn` (both TypeScript); Unity baseline might hold C# style rules (ticket #3).
- **Idle context cost**: ~25 tokens if model-invoked; 0 if path-scoped and the harness hides it until a match (unverified).
- **Recommendation (proposed)**: web pack candidate; and propose writing a C# equivalent new.

### 25. `no-comments` and the `Comment Sicko` agent

- **What it is.** `no-comments` spawns `Comment Sicko`, a persona agent that deletes every comment outside a short keep-list (license headers, external-constraint notes, public API docs, issue links, `prettier-ignore`), marks workaround code `MUST KILL`, and then the parent fixes accepted flags and offers to encode stated constraints as checks. [`no-comments`][no-comments], [`comment-sicko.md`][agent-sicko]
- **Kind**: skill + agent definition.
- **Proposed address**: none.
- **Why it could fit.** The narrow idea (encode a stated constraint as a type, test or lint, then delete the prose) is good.
- **Why it might not.** The prior review called it unusually aggressive: ambiguity deletes the comment. Unity code often needs comments explaining engine quirks (serialization callbacks, execution order), which the keep-list covers only if proven "on a live path".
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: pstack `correct`, `principle-encode-lessons-in-structure`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject the skill and agent; keep "encode then delete" as an idea for `correct`.

### 26. `poteto-help`

- **What it is.** A user-invoked help router over pstack: infers the need, answers one section, hands back one prompt to type, and links the source file. Includes a symptom-to-fix table ("The mode stopped applying after a few turns", "Parallel agents overwrote each other"). [`poteto-help/SKILL.md`][help], [prompting][help-prompting], [recipes][help-recipes]
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** "For a help question, don't start the work; hand them the prompt" is a good cost rule for a help skill.
- **Why it might not.** The fork's `ask-matt` already routes over its skills.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `ask-matt`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; feed the "answer and hand back a prompt, don't run it" rule into ticket #15's router content.

### 27. `setup-pstack`

- **What it is.** Detects available model slugs, asks for a reasoning budget (four labelled tiers), maps each role to a model, validates, and writes an always-applied rule file; offers `create-verification-skill` if no verify skill exists. The only model-invocable skill in pstack. [`setup-pstack/SKILL.md`][setup]
- **Kind**: skill + manifest/config.
- **Proposed address**: idea-only.
- **Why it could fit.** "One config file of role → model, every skill falls back to its default when a line is missing, re-runs overwrite idempotently" is a clean pattern if the collection ever has per-role model choices (Claude Code subagents can name a model).
- **Why it might not.** Cursor rule format and model slugs.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `setup-matt-pocock-skills` (per-repo setup of tracker, labels, docs).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only, for ticket #18 if per-role model choice becomes a feature.

### 28. `make-bot-ui`

- **What it is.** Builds a local web page whose buttons POST to a Cursor "Grok Bot" webhook routine, keeps the sender key server-side, and exposes the page over Tailscale. [`make-bot-ui/SKILL.md`][bot-ui]
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** The key-handling rules (never in browser, never in chat, request through a secret card) are sound.
- **Why it might not.** Entirely Cursor-product-specific (`update_state`, `SendToUser`, routines); no match to the owner's work.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject.

---

### 29. The principles format (24 `principle-*` skills)

- **What it is.** Each principle is a 0.8 to 4.9 KB file with a one-sentence rule, a **Why**, a **Pattern** list, and often a **test** or **Stop** clause; files cross-link by relative path and state how they differ from neighbours ("Distinct from Prove It Works, which..."). Each sets `disable-model-invocation: true`; `poteto-mode` carries a one-line index of all 24 grouped Core / Architecture / Verification / Delegation / Meta, and requires the reply to name each applied principle and the decision it changed. Users steer by naming a principle in chat ([guide p. 8][guide-08]). Total body size 41 KB. [`skills/principle-*`][skills], [index in `poteto-mode`][pm]
- **Kind**: convention doc (format) + skills.
- **Proposed address**: the *format* as an idea for a core reference library; individual principles per the table below.
- **Why it could fit.** It keeps rules out of idle context while letting the router and other skills cite them by name. The "Distinct from" lines prevent near-duplicate rules from blurring. "Cite a principle only if you read its leaf this session" and "name the decision it changed" are cheap anti-name-dropping checks.
- **Why it might not.** In Claude Code, disabled skills likely cannot be loaded by the model (open question 3), so the leaves must be plain files. 24 rules is a lot to curate; several restate fork content.
- **Copy / adapt / idea-only**: adapt the format; content per principle below.
- **Overlap**: fork `codebase-design` (deep modules), `domain-modeling`, `diagnosing-bugs`, `tdd`, `retro`.
- **Idle context cost**: 0 as plain reference files; ~1,200 tokens if all 24 were model-invoked; ~900 tokens if the index were always-on (index text ~3.5 KB / 4).
- **Recommendation (proposed)**: adopt the format for a small, curated set (below), stored as reference files that skills cite; decide index placement in ticket #15.

Per-principle disposition (all **proposed**; links in the reference list):

| Principle | One-line content | Fit and overlap | Proposed |
|---|---|---|---|
| [laziness-protocol][p-lazy] | Prefer deletion; smallest diff; flat call hierarchy | Fits; overlaps fork deep-module stance only partly | adapt |
| [foundational-thinking][p-found] | Data structures first; scaffold first; concurrency corollary | Fits; general | adapt (merge with model-the-domain) |
| [redesign-from-first-principles][p-redesign] | Integrate a requirement as if it were day-one | Fits; short | adapt |
| [attack-the-premise][p-premise] | After two failed fixes sharing a premise, census the actors before fix three | Novel; good for flaky Unity bugs | adapt |
| [subtract-before-you-add][p-subtract] | Remove dead weight first | Overlaps laziness-protocol | merge into laziness |
| [minimize-reader-load][p-reader] | Count layers to trace and state to hold; 30-second test | Overlaps fork `codebase-design` | offer to fork |
| [outcome-oriented-execution][p-outcome] | Converge on target; planned breakage OK | Conflicts with serialized-data safety in Unity | idea-only |
| [experience-first][p-experience] | Delight over convenience; library users count | Product taste, not a rule an agent checks | reject |
| [exhaust-the-design-space][p-exhaust] | 2-3 competing sketches when no precedent | Overlaps fork `prototype`, "design it twice" | reject (covered) |
| [build-the-lever][p-lever] | Build the script that does or proves the work; "if cited and no script in the diff, you didn't apply it" | Strong; fits editor-scripting and codemods | adapt |
| [model-the-domain][p-domain] | Structure over scattered conditionals; temporal decomposition smell | Overlaps fork `codebase-design` | offer to fork |
| [boundary-discipline][p-boundary] | Validate at boundaries; pure core | Fits C#; Unity needs a serialized-data note (prior review) | adapt |
| [type-system-discipline][p-types] | Illegal states unrepresentable; brand primitives; exhaustiveness | Fits C# well; language-neutral already | adapt (C# examples) |
| [make-operations-idempotent][p-idem] | Converge regardless of partial runs | Fits editor tooling and build scripts | adapt |
| [migrate-callers-then-delete-legacy-apis][p-migrate] | Delete the old API in the same wave | Dangerous for published C# libraries and serialized data; pstack limits it to internal APIs | idea-only |
| [separate-before-serializing-shared-state][p-separate] | Remove sharing before adding locks | Fits agent worktrees and Unity scene ownership | adapt |
| [prove-it-works][p-prove] | Check the real artifact, not a proxy | Overlaps fork `unity-verification` reporting | adapt (short core rule) |
| [fix-root-causes][p-root] | Reproduce, ask why, no silencing guards; restart bugs suspect state | Overlaps fork `diagnosing-bugs` | reject (covered) |
| [sequence-verifiable-units][p-sequence] | Small units each ending green; commits ordered as an argument | Overlaps fork `implement`, `to-tickets` tracer bullets | offer to fork |
| [test-behavior-not-implementation][p-test] | Would the test pass if every import returned `undefined`? Five failing shapes | Strong and checkable; partial overlap with fork `tdd` | adapt (C#/NUnit examples) |
| [explain-the-number][p-explain] | Name the limiter; rule out other explanations | Pairs with entry 9 | adapt |
| [guard-the-context-window][p-context] | Route bulk to subagents; summaries only | Generic; harness already nudges this | reject |
| [never-block-on-the-human][p-never-block] | Proceed on reversible work; confirm irreversible | Conflicts with owner's harness safety rules as worded (open question 4) | idea-only |
| [encode-lessons-in-structure][p-encode] | Second time you write an instruction, make it a check; pick the strongest mechanism | Overlaps fork `retro`; pairs with `correct` | merge into `correct` |

### 30. The playbook format

- **What it is.** Each of the 23 playbooks is a short file that opens with a bolded ownership line ("You own the diagnosis. Instrument the live process, don't theorize from source."), numbered steps that name the skills and principles they invoke, and a closing **Reply:** line that fixes the deliverable. The router copies the steps verbatim into the todo list. [`playbooks/`][playbooks], [`poteto-mode` Playbooks section][pm]
- **Kind**: convention doc.
- **Proposed address**: idea-only for the collection's skill shape (pairs with fork `writing-for-agents`).
- **Why it could fit.** The ownership line plus the Reply contract make each workflow's success condition explicit in two sentences. Playbooks are files under one skill, so they cost nothing until routed to.
- **Why it might not.** The fork's skills already carry similar structure; adopting a second house format would split conventions.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents`; fork `wayfinder` and `implement` structure.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: raise the "ownership line + Reply contract" shape in the session that decides skill shape.

### 31. Diagnosis playbooks: Bug fix, Perf issue, Runtime forensics, Trace forensics

- **What it is.** [Bug fix][pb-bug] reproduces on the real surface, binary-searches hypotheses with runtime evidence, and stages the failing repro commit before the fix. [Perf issue][pb-perf] vets every number with `benchmark-checklist` and orders fixes by seven "performance mantras" (don't do it, do it once, do it less, later, when they're not looking, concurrently, cheaper). [Runtime forensics][pb-runtime] captures a live profile or heap snapshot and proves the mechanism before believing it. [Trace forensics][pb-trace] loads a captured artifact into a queryable form (prescribes SQLite) and refuses to call an unsymbolized frame a diagnosis.
- **Kind**: convention doc (procedures).
- **Proposed address**: ideas into fork `diagnosing-bugs` (core) and `unity-debugging` (Unity pack).
- **Why it could fit.** The performance mantras are a compact, ordered fix generator that fits Unity frame-time work. "Diagnosis, not fix" as a separate deliverable fits Unity Profiler and Memory Profiler captures. "Every shipped line traces to runtime evidence; revert what a refuted hypothesis motivated" sharpens diagnosis.
- **Why it might not.** Steps lean on `control-ui`/`control-cli` and CDP; trace forensics' SQLite prescription is web-trace shaped (prior review). The fork's `diagnosing-bugs` already has a reproduce → minimise → hypothesise → instrument loop.
- **Copy / adapt / idea-only**: idea-only for the playbooks; candidate edits to fork skills.
- **Overlap**: fork `diagnosing-bugs` (strong), `unity-debugging`, `tdd`.
- **Idle context cost**: 0 (edits to existing skills).
- **Recommendation (proposed)**: offer the mantras and "revert what a refuted hypothesis motivated" to `diagnosing-bugs`; offer "artifact → query → symbolized frame" to `unity-debugging`.

### 32. Hillclimb playbook

- **What it is.** Sustained improvement of one metric: ground the workload, fix a metric, direction and a stop predicate that pairs a target with a minimum number of attempts, build and *prove the sensitivity of* a measurement harness, freeze it, then loop one hypothesis per iteration with keep-or-revert, one commit per accepted win, a `decision.tsv` row either way, and "push past the first plateau". [`hillclimb.md`][pb-hillclimb]
- **Kind**: convention doc (procedure).
- **Proposed address**: core user-invoked skill (new, adapted from this playbook), with a Unity pack note for Unity harnesses.
- **Why it could fit.** The prior review covered the core discipline. New here: the harness-sensitivity check (contrasting workloads must separate as expected before freezing) and the "target plus attempt floor" predicate that stops a lucky early win from ending the run. Applies to load times, build times, test-suite times and allocations.
- **Why it might not.** Delegates each attempt to a subagent on a configured model; fans independent hypotheses to parallel worktrees, which conflicts with a single Unity Editor instance.
- **Copy / adapt / idea-only**: adapt. Serialize attempts by default in Unity; keep harness freezing, the decision log (entry 18) and keep-or-revert.
- **Overlap**: fork `diagnosing-bugs` (one-off perf regressions), `unity-debugging`; pstack Perf issue.
- **Idle context cost**: 0 as user-invoked; est. ~60 tokens if model-invoked.
- **Recommendation (proposed)**: adopt-adapted as a user-invoked skill, depending on entries 9 and 18.

### 33. Eval playbook

- **What it is.** Tests a skill or prompt change blind: no `eval`/`test`/`judge` words anywhere the candidate sees, an organic prompt, sanitized directory names, no chain-eliciting cues, one judge scoring all outputs under neutral labels, and chain-following graded from which files each candidate *actually opened* (transcripts), never from self-report. The lead reads every output and treats judge disagreement as a rubric problem. [`eval.md`][pb-eval], [guide p. 9][guide-09]
- **Kind**: CI-eval (manual procedure).
- **Proposed address**: collection maintenance machinery (ticket #17), user-invoked in this repo only.
- **Why it could fit.** The map requires every model-invoked description to earn its cost; this is a procedure for checking that a skill changes behavior, including whether it triggers. "Grade from files actually read" is the right evidence for skill-loading questions. Guide p. 9 says the same applies to adopting someone else's skill, which is this collection's whole activity.
- **Why it might not.** Candidate and judge on different model families; Cursor transcript paths. Manual and expensive per run.
- **Copy / adapt / idea-only**: adapt. Rewrite for Claude Code subagents and its JSONL transcripts; keep the blinding rules verbatim in substance.
- **Overlap**: none in the fork. Prior review's "Validation before promoting a borrowed skill" section proposes a similar process.
- **Idle context cost**: 0 (repo-local).
- **Recommendation (proposed)**: adopt-adapted for ticket #17 as the collection's skill-promotion check.

### 34. Build playbooks: Feature, Refactoring, Investigation, Prototype, Visual parity, Authoring a skill

- **What it is.** [Feature][pb-feature] requires a four-item "throughput checkpoint" (blocking steps, independent workstreams, shared state, smallest decomposition) and mandatory `arena` delegation when several shapes are valid. [Refactoring][pb-refactor] pins behavior with a characterization test first ("type check and lint are not a pin"), and reverts the change if it does not lower reader load. [Investigation][pb-investigation] is read-only and ends in `how`'s template. [Prototype][pb-prototype] inverts quality rules and builds variants behind one switcher. [Visual parity][pb-visual] protects the baseline and demands zero pixel diff. [Authoring a skill][pb-authoring] says "when in doubt, delete; keep only prose that changes a decision".
- **Kind**: convention doc (procedures).
- **Proposed address**: ideas for fork skills; no new skill.
- **Why it could fit.** Refactoring's "pin, then move, then prove reader load dropped, else revert" is the most transferable item; it suits C# library refactors.
- **Why it might not.** Feature's mandatory arena and four-item checkpoint is heavy for solo work. Visual parity's zero-pixel rule does not suit Unity rendering (prior review). Prototype is covered by fork `prototype` and `unity-prototyping`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `implement`, `improve-codebase-architecture`, `prototype`, `unity-prototyping`, `writing-for-agents`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: offer Refactoring's pin-and-revert rule to fork `improve-codebase-architecture`; reject the rest as covered.

### 35. Continuity playbooks: Autonomous run, Pause safely, Session pickup

- **What it is.** [Autonomous run][pb-autonomous] states a checkable exit predicate, picks a wake mechanism (event watcher with heartbeat fallback), and forbids relaxing the predicate. [Pause safely][pb-pause] stops at a safe boundary, makes a `wip:` commit, and writes an off-context resume note. [Session pickup][pb-pickup] treats the prior trail as authoritative ("a 'let me verify from scratch' pass means you're treating the trail as untrustworthy"), then verifies inherited claims on the real artifact.
- **Kind**: convention doc (procedures).
- **Proposed address**: ideas for fork `handoff` / `claude-handoff` / `loop-me`.
- **Why it could fit.** Pause safely's checklist (finish or back out, no irreversible action, `wip:` commit, resume note with intent, progress, state, next step, gotchas) is a compact complement to `handoff`. "Never relax the predicate" fits `loop-me`.
- **Why it might not.** Relies on Cursor `/loop`; the fork covers most of this.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `handoff`, `claude-handoff`, `loop-me`; pstack `recall`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: offer Pause safely's checklist to `handoff`; decide in the same theme as `recall` (entry 7).

### 36. PR and fleet machinery: Opening a PR, Babysit, Shipping, Autopilot-full, Autopilot-stack, Multi-phase plan, Orchestrate, Worktree cleanup, `bugbot-triage.md`, `watch-pr`, `orch`, `check-plan.mjs`, `worktree-audit.sh`

- **What it is.** A full stacked-PR operation. [Opening a PR][pb-pr] fixes a briefing-style body (Why / What changed / Scope / Tradeoffs / Blast Radius / Verification). [Babysit][pb-babysit] and [Shipping][pb-shipping] work the merge frontier and re-check verdicts by `git patch-id` after rebases. [Autopilot-full][pb-autofull], [Autopilot-stack][pb-autostack] and [Orchestrate][pb-orchestrate] run fleets of cloud agents with a store of single-writer files, a brief template (GOAL / SCOPE / CONTEXT / ACCEPTANCE / VERIFY / TIMEBOX / FORBIDDEN / REPORT / STANDING), and liveness rules. [Multi-phase plan][pb-multiphase] emits a checkbox plan linted by [`check-plan.mjs`][check-plan]. [`bugbot-triage.md`][bugbot] is a fix / dismiss / ask rubric with a learned-pattern format (confidence: candidate / recurring / strong). [`watch-pr`][scripts] and [`orch`][scripts] are tested Bun CLIs. [Worktree cleanup][pb-worktree] with [`worktree-audit.sh`][wt-audit] is a read-only audit plus gated deletion.
- **Kind**: convention doc + script + manifest.
- **Proposed address**: idea-only.
- **Why it could fit.** Three ideas travel: the orchestrate brief template (any delegation, including fork `implement` and `loop-me`); the patch-id rule for "does this verdict still describe this patch after a rebase"; and the learned-pattern format with confidence levels for any triage rubric (fork `triage`). `check-plan.mjs` is a working example of `encode-lessons-in-structure` applied to a plan document.
- **Why it might not.** Built for Cursor cloud agents, Bugbot, Origin and Graphite at team scale; a solo Unity developer rarely stacks PRs. `watch-pr` and `orch` need Bun and self-install dependencies ([`bootstrap.ts`][bootstrap]). Worktree cleanup is macOS-specific (`xcrun simctl`, `df -h /`) and deletes user state.
- **Copy / adapt / idea-only**: idea-only. Not copyable: Cursor `Task` cloud fields, Origin and Bugbot, Bun runtime, macOS tooling.
- **Overlap**: fork `pr` (PR body shape), `triage`, `to-tickets`, `wayfinder`, `implement`, `loop-me`; `git-guardrails-claude-code` (opposite stance on destructive git).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject as a group. Offer the brief template to `loop-me`/`implement`, the learned-pattern format to `triage`, and "Scope names what it leaves out" plus "Blast Radius" sections to fork `pr` (the fork's `pr` already has a merge-danger call, so check for duplication).

### 37. Benny automation pack

- **What it is.** Two Cursor Automations for a Slack issue channel. Triage posts exactly one thread reply with a marker (`[benny:bug]`, `[benny:performance]`, `[benny:other]`), dedupes against the tracker and creates tickets fail-closed. Repro waits for a trusted marker from a configured identity, stops if someone owns the fix, reproduces the exact symptom twice through the real UI via a configured control adapter and feature map, verifies existing PRs instead of authoring over them, and opens only a draft PR after before-and-after proof. Setup copies the pack into the target repo and enables pstack there for shared skills. [`FOR_AGENTS.md`][benny-for-agents], [`reproduce-and-fix-issues`][benny-repro], [`triage-issue-reports`][benny-triage], [`setup-benny`][benny-setup], [control-adapter contract][benny-control], [config example][benny-config]
- **Kind**: skill (automation instructions, not registered as skills) + manifest-packaging + convention doc.
- **Proposed address**: idea-only.
- **Why it could fit.** Its safety design is the best part: frozen source coordinates, coordinator as the only poster, children forbidden every Slack write by name, "state inspection may confirm an observation, must not inject the symptom", "no confirmed repro means no authored fix". The [control-adapter contract][benny-control] (bring up, drive UI, drive mapped features, inspect state, screenshot, record, cleanup) is a neutral interface a Unity control skill could implement.
- **Why it might not.** Depends on Cursor Automations, Slack, a tracker MCP and project-scoped plugins; the owner has no Slack intake (inference from the map's owner description).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: pstack verification-skill pair (entry 19); fork `triage`, `unity-verification`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: reject as a pack; carry the control-adapter contract into the Unity verification-skill adaptation (entry 19) and the "dormant pack files are not skills" packaging idea into ticket #18.

### 38. The pstack guide (`docs/guide/`)

- **What it is.** A 10-page user guide: setup, using the mode, understanding code, design, build and clean, verify and ship, overnight runs, steering with principle names, making it yours, recipes and pitfalls. [`docs/guide/README.md`][guide]
- **Kind**: convention doc.
- **Proposed address**: idea-only.
- **Why it could fit.** Page 7's "earn the trust before the loop" checklist (done it by hand once, agent has your tools, every stage can stop the line, repeated failures turned into checks) and its four-line "overnight contract" prompt are good material for `loop-me` docs ([guide p. 7][guide-07]). Page 9's advice "start smaller than you think" matches the map's budget stance ([guide p. 9][guide-09]).
- **Why it might not.** Written for Cursor users and pstack's own skills.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork README.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: idea-only; cite page 7's checklist when the collection documents unattended runs.

## Not covered and limits

- Read in full: the router, all 26 other skill files, all 24 principles, both agents, 19 of 23 playbooks, `bugbot-triage.md`, Benny's `README.md`, `FOR_AGENTS.md`, configuration example and repro prompt template, the manifest, the README, `log.sh`, and guide page 9. Skimmed (long lines truncated, or headings and first sections only): the four largest playbooks (Babysit, Autopilot-full, Multi-phase plan, Orchestrate), Benny's three skill bodies after their safety rules, `why`'s epistemics and per-vendor source playbooks, the reference prompts of `how`, `interrogate`, `architect` and `reflect`, `check-plan.mjs`, `worktree-audit.sh`, `bootstrap.ts`, the TypeScript sources of `watch-pr` and `orch` (entry points and types only), and guide pages 7 and 8. Not opened: guide pages 1 to 6 and 10, the guide images, `orch.ts`/`store.ts` bodies and the test files.
- Harness claims about Claude Code and Codex (model choice per subagent, `paths:` support, whether disabled skills can be loaded by the model, transcript schema) are marked inference and belong to ticket #2.
- Unity baseline overlap is "unknown" throughout, pending ticket #3.
- No other ledgers exist yet in this repo, so cross-ledger overlap is not assessed.
- pstack is MIT ([`LICENSE`][license]); keep the notice with anything copied.

[root]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack
[manifest]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/.cursor-plugin/plugin.json
[readme]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/README.md
[license]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/LICENSE
[skills]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills
[agents]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/agents
[playbooks]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks
[scripts]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/scripts
[bootstrap]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/scripts/bootstrap.ts
[check-plan]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/scripts/check-plan.mjs
[wt-audit]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/scripts/worktree-audit.sh
[bugbot]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/references/bugbot-triage.md
[benny]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny
[benny-readme]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/README.md
[benny-for-agents]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/FOR_AGENTS.md
[benny-repro]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md
[benny-triage]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/skills/triage-issue-reports/SKILL.md
[benny-setup]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/skills/setup-benny/SKILL.md
[benny-control]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/skills/reproduce-and-fix-issues/references/control-adapter.md
[benny-config]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/automations/benny/templates/configuration.example.yaml
[guide]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/docs/guide/README.md
[guide-07]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/docs/guide/07-overnight.md
[guide-08]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/docs/guide/08-principles.md
[guide-09]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/docs/guide/09-make-it-yours.md
[agent-poteto]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/agents/poteto-agent.md
[agent-sicko]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/agents/comment-sicko.md
[pm]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/SKILL.md
[help]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-help/SKILL.md
[help-prompting]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-help/references/prompting.md
[help-recipes]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-help/references/recipes.md
[setup]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/setup-pstack/SKILL.md
[how]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/how/SKILL.md
[how-explainer]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/how/references/explainer-prompt.md
[why]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/why/SKILL.md
[why-epistemics]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/why/references/epistemics.md
[why-archaeology]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/why/references/sources/code-archaeology.md
[teach]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/teach/SKILL.md
[recall]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/recall/SKILL.md
[blast]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/blast-radius/SKILL.md
[bench]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/benchmark-checklist/SKILL.md
[architect]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/architect/SKILL.md
[arch-flags]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/architect/references/design-red-flags.md
[arena]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/arena/SKILL.md
[swarm]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/swarm/SKILL.md
[interrogate]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/interrogate/SKILL.md
[interrogate-cq]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/interrogate/references/code-quality-review.md
[interrogate-lead]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/interrogate/references/lead-judgment.md
[correct]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/correct/SKILL.md
[reflect]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/reflect/SKILL.md
[reflect-tooling]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/reflect/references/tooling-reviewer.md
[automate-me]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/automate-me/SKILL.md
[figure]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/figure-it-out/SKILL.md
[smyw]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/show-me-your-work/SKILL.md
[smyw-template]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/show-me-your-work/references/decision-log-template.tsv
[logsh]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/show-me-your-work/scripts/log.sh
[cvs]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/create-verification-skill/SKILL.md
[cvs-example]: https://github.com/cursor/plugins/tree/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/create-verification-skill/references/feature-map-example
[mvs]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/maintain-verification-skill/SKILL.md
[tdd]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/tdd/SKILL.md
[tw]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/technical-writing/SKILL.md
[unslop]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/unslop/SKILL.md
[bro]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/bro/SKILL.md
[ts]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/typescript-best-practices/SKILL.md
[ts-patterns]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/typescript-best-practices/references/patterns.md
[no-comments]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/no-comments/SKILL.md
[bot-ui]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/make-bot-ui/SKILL.md
[pb-authoring]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/authoring-a-skill.md
[pb-autonomous]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/autonomous-run.md
[pb-autofull]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/autopilot-full.md
[pb-autostack]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/autopilot-stack.md
[pb-babysit]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/babysit.md
[pb-bug]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/bug-fix.md
[pb-eval]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/eval.md
[pb-feature]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/feature.md
[pb-hillclimb]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/hillclimb.md
[pb-investigation]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/investigation.md
[pb-multiphase]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md
[pb-pr]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/opening-a-pr.md
[pb-orchestrate]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/orchestrate.md
[pb-pause]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/pause-safely.md
[pb-perf]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/perf-issue.md
[pb-prototype]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/prototype.md
[pb-refactor]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/refactoring.md
[pb-runtime]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/runtime-forensics.md
[pb-pickup]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/session-pickup.md
[pb-shipping]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/shipping.md
[pb-trace]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/trace-forensics.md
[pb-visual]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/visual-parity.md
[pb-worktree]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/poteto-mode/playbooks/worktree-cleanup.md
[p-premise]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-attack-the-premise/SKILL.md
[p-boundary]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-boundary-discipline/SKILL.md
[p-lever]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-build-the-lever/SKILL.md
[p-encode]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-encode-lessons-in-structure/SKILL.md
[p-exhaust]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-exhaust-the-design-space/SKILL.md
[p-experience]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-experience-first/SKILL.md
[p-explain]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-explain-the-number/SKILL.md
[p-root]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-fix-root-causes/SKILL.md
[p-found]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-foundational-thinking/SKILL.md
[p-context]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-guard-the-context-window/SKILL.md
[p-lazy]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-laziness-protocol/SKILL.md
[p-idem]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-make-operations-idempotent/SKILL.md
[p-migrate]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md
[p-reader]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-minimize-reader-load/SKILL.md
[p-domain]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-model-the-domain/SKILL.md
[p-never-block]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-never-block-on-the-human/SKILL.md
[p-outcome]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-outcome-oriented-execution/SKILL.md
[p-prove]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-prove-it-works/SKILL.md
[p-redesign]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-redesign-from-first-principles/SKILL.md
[p-separate]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md
[p-sequence]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-sequence-verifiable-units/SKILL.md
[p-subtract]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-subtract-before-you-add/SKILL.md
[p-test]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-test-behavior-not-implementation/SKILL.md
[p-types]: https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/skills/principle-type-system-discipline/SKILL.md
[fork-readme]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/README.md
[fork-ask-matt]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/ask-matt/SKILL.md
