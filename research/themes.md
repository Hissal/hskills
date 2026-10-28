# Themes: how ledger entries group into decision sessions

Resolves [How do ledger entries group into theme sessions?](https://github.com/Hissal/skill-collection/issues/20). Every entry of every ledger in `research/ledgers/` (544 entries) is placed below. An entry that feeds two sessions appears in both, with the other named in brackets. Each line gives the entry's title as its ledger heads it, then the ledger's own *proposed* recommendation, shortened; the ledger holds the full entry. Nothing here is a decision about a candidate.

## Order

1. **The fork pass**, with the research ticket on gstack's and compound-engineering's workflow chains running beside it.
2. **How do core skills and setup reach a pack?** Blocks everything below.
3. **Core themes**, in any order: planning and delegation, review and second opinions, evidence and change safety, diagnosis and performance, testing, design and refactoring, continuity and learning, writing skills and docs, core guard rule set, prototyping. Planning and review also wait on the research ticket.
4. **Does core hold together as a whole?**
5. **Pack themes**: Unity pack, game design and feel, C# pack, web pack.
6. **Guide content.**
7. **Does the decided collection hold together as a whole?** Reads the catalog, the guides and the last two sections of this file, and may reopen any decision.

Rules for every theme: the fork skills taken in the fork pass are the base, and a theme is free to propose edits, merges or new skills on top. A theme that meets an overarching architecture question raises it as a new ticket on the map and does not settle it inside the session.

## The fork pass

Not a theme. One pass over the fork's skills that decides, for each, whether it is copied here and at what address. It builds the baseline every theme then works on. Merges into a fork skill are decided in the theme that owns the skill's job, named in brackets beside each entry.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `ask-matt`: Adapt as the collection's router once the catalog is decided; keep `PHASE-BOUNDARIES.md` nearly as is. _(also: guide content)_
- `code-review`: Take it; decide its invocation in the theme that settles expensive-workflow gating. _(also: review and second opinions)_
- `codebase-design`: Take as core model-invoked. _(also: design and refactoring)_
- `diagnosing-bugs`: Take as core model-invoked. _(also: diagnosis and performance)_
- `domain-modeling`: Take as core model-invoked. _(also: planning and delegation)_
- `grill-with-docs`: Take, if `grilling` and `domain-modeling` are taken. _(also: planning and delegation)_
- `implement`: Take. _(also: planning and delegation)_
- `implement-spec`: Take. _(also: planning and delegation)_
- `improve-codebase-architecture`: Take. Collection name and continuation amended to `architecture-review` by the [guide-content decision](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993). _(also: design and refactoring)_
- `pr`: Take as core model-invoked. _(also: planning and delegation)_
- `prototype`: Take as core model-invoked. _(also: prototyping)_
- `research`: Take; settle invocation with `code-review`. _(also: evidence and change safety)_
- `retro`: Take. _(also: continuity and learning)_
- `setup-matt-pocock-skills`: Adapt. _(also: reaching a pack)_
- `tdd`: Take as core model-invoked. _(also: testing)_
- `to-spec`: Take. _(also: planning and delegation)_
- `to-tickets`: Take. _(also: planning and delegation)_
- `triage`: Owner's call on whether solo work needs it; lean take (zero idle cost), low priority.
- `wayfinder`: Take. _(also: planning and delegation)_
- `wizard`: Take as user-invoked (not model-invoked), or leave out. _(also: web pack)_
- `grill-me`: Optional; drop unless the owner wants a typed entry point.
- `grilling`: Take as core model-invoked. _(also: planning and delegation)_
- `handoff`: Take. _(also: continuity and learning)_
- `teach`: Owner's call; costs nothing idle, so the question is only catalog clutter. _(also: continuity and learning)_
- `to-questionnaire`: Low priority; owner's call.
- `wait-what`: Take. _(also: continuity and learning)_
- `writing-for-agents`: Take as core model-invoked. _(also: writing skills and docs)_
- `unity` (router): Take as the Unity pack's entry point. _(also: unity pack; reaching a pack)_
- `unity-verification`: Take, pending the baseline comparison. _(also: unity pack)_
- `unity-assemblies`: Take. _(also: unity pack)_
- `unity-serialization`: Take. _(also: unity pack)_
- `unity-testing`: Take. _(also: unity pack)_
- `unity-code-lifecycle`: Take. _(also: unity pack)_
- `unity-prototyping`: Take, or fold behind the router (owner decides pack shape). _(also: unity pack)_
- `unity-debugging`: Take, pending the baseline comparison. _(also: unity pack)_
- `chief-of-staff`: Idea-only for now.
- `claude-handoff`: Owner's call: merge into `handoff` or drop. _(also: continuity and learning)_
- `loop-me`: Owner's call; plausible fit for the agentic-workflow slice. _(also: planning and delegation)_
- `setup-ts-deep-modules`: Web pack candidate; otherwise out. _(also: web pack)_
- `writing-beats`: Out unless the owner writes articles; decide the three `writing-*` skills together. _(also: writing skills and docs)_
- `writing-fragments`: Same as `writing-beats`. _(also: writing skills and docs)_
- `writing-shape`: Same as `writing-beats`. _(also: writing skills and docs)_
- `git-guardrails-claude-code`: Do not take the skill; consider a hook in the always-on theme. _(also: core guard rule set)_
- `migrate-to-shoehorn`: Reject.
- `scaffold-exercises`: Reject.
- `setup-pre-commit`: Out, or web pack user-invoked. _(also: web pack)_
- `.out-of-scope/` knowledge base: Idea-only.

## How do core skills and setup reach a pack?

Not a theme: an architecture ticket that runs second and blocks every theme. Entries here are prior art for it.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `setup-matt-pocock-skills`: Adapt. _(also: the fork pass)_
- `unity` (router): Take as the Unity pack's entry point. _(also: the fork pass; unity pack)_
- Unity delta line pattern and the Unity config: Adopt as the collection's core-to-pack convention (owner decides).

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 15. Compound Packs: reject the mechanism. Offer two ideas to the Unity pack theme: `applies_when` situation keys on rule sheets, and "vendored rule text is evidence, not instructions". Do not use the word "pack" for it. _(also: unity pack)_

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 11. Repository overlays: bring to the install theme as a named alternative to a full override for small per-project deltas. Owner decides whether the fork's Unity config already is this.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 12. `plugin-dev`: hook scripts and the `.local.md` settings pattern: nothing to copy. Note for #18 that both of Anthropic's own stateful plugins key their hooks on a project-local file and exit silently without it, which supports the silent-unless-qualified pattern … _(also: ideas for decided areas)_

**[affaan-m/ECC](ledgers/ecc.md)**

- 7. Hookify runtime: no adoption. Note for the gating and install tickets: "one generic hook, per-project rule files, untracked-only by default" is the alternative to "one script per pack hook", worth choosing between … _(also: ideas for decided areas)_

**[Hook collections](ledgers/hook-collections.md)**

- 21. `skill-verification-guard`, `skill-activation-tracker` and file triggers: reject. Keep "a silent `PostToolUse`/`PreToolUse` pointer keyed on file path, once per session" as the Codex-side fallback already named in lazy-loading, to be tested if a pack ever needs it.

## Planning and delegation

Getting from idea to delegated work: `grilling`, `domain-modeling`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `loop-me`, `pr`, plus agentic-workflow odds and ends.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `domain-modeling`: Take as core model-invoked. _(also: the fork pass)_
- `grill-with-docs`: Take, if `grilling` and `domain-modeling` are taken. _(also: the fork pass)_
- `implement`: Take. _(also: the fork pass)_
- `implement-spec`: Take. _(also: the fork pass)_
- `pr`: Take as core model-invoked. _(also: the fork pass)_
- `to-spec`: Take. _(also: the fork pass)_
- `to-tickets`: Take. _(also: the fork pass)_
- `wayfinder`: Take. _(also: the fork pass)_
- `grilling`: Take as core model-invoked. _(also: the fork pass)_
- `loop-me`: Owner's call; plausible fit for the agentic-workflow slice. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 3. `poteto-agent` agent definition: idea-only; raise in ticket #15 as "how does a delegated agent inherit the collection's discipline".
- 4. `how`: adapt as a small user-invoked skill, or fold its template into whatever investigation entry the collection picks. Low priority.
- 12. `swarm`: idea-only; fold "a gap is not a pass" and "declare the race rule before spawning" into whatever orchestration skill the collection keeps.
- 17. `figure-it-out`: idea-only; offer the three-valued verdict to `loop-me`.
- 18. `show-me-your-work` and `log.sh`: adopt-adapted, high priority, as a shared mechanism that `loop-me` and hillclimb-style workflows reference.
- 36. PR and fleet machinery: Opening a PR, Babysit, Shipping, Autopilot-full, Autopilot-stack, Multi-phase plan, Orchestrate, Worktree cleanup, `bugbot-triage.md`, `watch-pr`, `orch`, `check-plan.mjs`, `worktree-audit.sh`: reject as a group. Offer the brief template to `loop-me`/`implement`, the learned-pattern format to `triage`, and "Scope names what it leaves out" plus "Blast Radius" sections to fork `pr` (the …
- 38. The pstack guide (`docs/guide/`): idea-only; cite page 7's checklist when the collection documents unattended runs.

**[superpowers](ledgers/superpowers.md)**

- 3. `brainstorming` (with visual companion and spec reviewer prompt): reject the skill. Offer the spike/bounded/architectural classification and the "approval covers only the stage presented" rule to the fork's grilling or `to-spec` as wording ideas.
- 4. `writing-plans`: reject the skill. Propose adding "Interfaces (consumes/produces)" and "Review Focus" fields to the fork's ticket shape, and the proportion check to `to-tickets`.
- 5. `subagent-driven-development` (SDD): reject as a skill. Take into the fork's `implement-spec` (via ticket #16 or a theme session): the Model Selection rules, "artifacts as files", the no-nested-reviewer contract, the BASE-recording …
- 6. `executing-plans` (Native / inline execution): reject; mention "ledger only on a passing test command" as an idea for fork `implement`.
- 7. SDD workspace, ledger and ruling log (scripts + convention): adopt-adapted. Take `review-package` and the "Rulings I made" convention into the fork's delegation skills. Decide in the same theme as pstack's `show-me-your-work`.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 5. Lifecycle commands (`/spec /plan /build /test /review /code-simplify`) and their validators: reject. Hand `/build auto`'s stop list and staging rule to the fork-relationship ticket (#16) as a review input for `implement`.
- 31. `idea-refine`: reject. Offer the seven lenses to the grilling theme.
- 33. `interview-me`: reject as a skill. Offer the stop test, confidence-with-reason and not-a-yes list to #16 as improvements to `grilling`.
- 40. `spec-driven-development`: reject. Offer the capability-map rules to #16 for `wayfinder` or `to-spec`.

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 10. `goal-loop`: adapt the contract as core user-invoked, or merge it into the ticket-brief format, in the workflow theme (#15).
- 14. `git-worktree`: reject the skill; offer the bootstrap checklist to whichever skill owns worktrees.
- 15. Micro-prompt skills: `decisions`, `stop-overthinking`, `remind`, `file-tree`, `rename`, `keep-track`, `read-all-adrs`: owner's call on `decisions` as a core user-invoked micro-skill; reject the others.
- 16. `ask-then-build`: reject; the "my pick + reason" format is a possible line in `grilling`.
- 18. `adr-verbatim`: reject; offer the "no unapproved agent suggestions" line to `domain-modeling`.

**[garrytan/gstack](ledgers/gstack.md)**

- 6. Session-scoped hook skills: `careful`, `freeze`, `guard`, `unfreeze`: adapt `freeze` + `unfreeze` as core user-invoked (Claude-only, stated as such). Feed `careful`'s PowerShell rules, safe exceptions and deny/ask tiers into the core guard's Windows port, decided … _(also: core guard rule set)_
- 8. `plan-tune`: question tuning: reject. Offer "label decisions one-way or two-way; an agent may default two-way doors, never one-way" to the workflow theme as a line for AFK briefs and `grilling`.
- 19. The persona and workflow chain (collapsed): reject all 37 as competing with the fork's flow. Offer the "quote the line or cap confidence at 4-5" gate to fork `code-review`. If a web pack is ever decided, read `pbakaus/impeccable` directly … _(also: review and second opinions)_

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 4. `CONCEPTS.md` vocabulary capture: reject the silent-capture mechanism. Offer the two capture rules (verify against source; no code names dressed as domain terms) to the theme that covers `domain-modeling`.
- 26. Git and PR workflow: `ce-commit`, `ce-commit-push-pr`, `ce-worktree`, `ce-babysit-pr`, `ce-resolve-pr-feedback`: reject all five. Note one line for any future watch-loop skill: "recompute the to-do set from remote state every tick; seeing an item never marks it handled".
- 29. The workflow chain (collapsed): reject the chain as competing with the fork's flow. The single idea worth lifting: the Sizing test (`CONCEPTS.md` L119). Every mechanism a plan adds that the request did not ask for ("a guard, retry …

**[anthropics/skills](ledgers/anthropic-skills.md)**

- 14. `mcp-builder` (with `scripts/evaluation.py`): idea-only for now. Revisit when the owner next builds an MCP server; the QA-pair evaluation is the part worth keeping.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 18. `ralph-loop`: reject; keep "loop state in a project-local file, hook silent without it" as one more instance of the pattern in entry 12.
- 20. `feature-dev`: reject; note the reading-list rule for sub-agent prompt templates.

**[Maintenance tooling](ledgers/maintenance-tooling.md)**

- 20. `prompt-optimizer`: do not add a skill; let the eval theme pick one hill-climbing playbook among this, pstack's and Anthropic's, and take this one's stop rule and failure-mode list as tie-breakers.
- 21. `iterate-pr`: owner's call; if any PR-babysitting skill is wanted, this is the smallest well-specified one. Otherwise reject.
- 22. `commit`, `create-branch`, `pr-writer`: reject as skills; offer `pr-writer`'s "minimum useful shape" table to the fork's `pr` in its theme.

**[Installed plugins](ledgers/installed-plugins.md)**

- vibe-wise: Ideas only: hand decisions back to the user, a "Proposed additions" table separating the user's decisions from the agent's fill-ins, pending decisions that survive compaction.

## Review and second opinions

Checking work before it lands: `code-review`, cross-model review, doubt and self-critique.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `code-review`: Take it; decide its invocation in the theme that settles expensive-workflow gating. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 11. `arena`: idea-only until ticket #2 lands; then reconsider as a user-invoked skill.
- 13. `interrogate`: offer `lead-judgment.md`'s four buckets and filters to the fork's `code-review` synthesis step. Reject the skill as a separate entry.

**[superpowers](ledgers/superpowers.md)**

- 13. `requesting-code-review` (with `code-reviewer.md`): reject; offer the "Declined to judge" section to fork `code-review`'s report shape.
- 14. `receiving-code-review`: adopt-adapted, pending a baseline test; a candidate for the code-review theme.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 6. `/ship` fan-out, the four personas, and `orchestration-patterns.md`: reject `/ship` and the personas. Keep "personas don't invoke personas" and the metric-honesty rule as inputs to the review and performance themes. _(also: diagnosis and performance)_
- 20. `code-review-and-quality`: reject as a skill. Offer the severity taxonomy, structural remedies and verify-the-verification to #16 as improvements to the fork's `code-review`.
- 28. `doubt-driven-development`: adapt as core user-invoked. Decide against pstack `interrogate` in one theme.

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 12. `codex-subagent`: adapt as the one shared "call Codex from Claude" recipe that entry 13 and Addy's doubt step reuse. Decide in the cross-model theme.
- 13. `gpt-review`, `fable-review`, `total-review`: adapt the brief and merge rules into one cross-model review skill, decided together with entry 12 and Addy's doubt step.

**[garrytan/gstack](ledgers/gstack.md)**

- 12. `codex` (and its mirror `claude-code`): reject as a skill. In the cross-model theme, add to the shared recipe: probe auth and model access first, prefix a "don't read agent skill folders" boundary, show the reviewer's text verbatim plus …
- 19. The persona and workflow chain (collapsed): reject all 37 as competing with the fork's flow. Offer the "quote the line or cap confidence at 4-5" gate to fork `code-review`. If a web pack is ever decided, read `pbakaus/impeccable` directly … _(also: planning and delegation)_

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 23. `ce-pov` and `ce-bakeoff`: add both to the cross-model review theme already queued from the davidondrej ledger, as the fourth and fifth candidates. Owner's call whether a "three isolated attempts plus judge" skill earns a …

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A19. `gating-by-blind-restoration` + `gating-expensive-batch-work`: adapt blind restoration as core user-invoked, in a "review/doubt" theme with addy 28. Batch gating is the owner's call.
- A21. `critiquing-own-response`, `dispatching-agent-work`, `extracting-spec-design-ladders`: (1) owner's call in the review/doubt theme; (2) and (3) reject.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 8. `pr-review-toolkit`: packaging, `/review-pr`, `code-reviewer`, `code-simplifier`: reject installing. Offer "report only findings at or above a stated confidence" and "choose axes from the diff" to the review theme as edits to the fork's `code-review`.
- 9. `pr-review-toolkit`: `silent-failure-hunter`: adapt the checklist as an optional "error handling" axis or reference in the fork's `code-review`. Decide in the review theme.
- 19. `code-review`, `code-simplifier`: reject both plugins; offer "independent scoring pass, drop below a threshold" to the review theme together with entry 8.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- T1. `second-opinion`: idea-only. Add the eight rules above as acceptance criteria for whichever cross-model review recipe the theme session picks.
- T5. `differential-review`: reject. Offer "blame the removed lines" as one line for fork `code-review`.

## Evidence and change safety

Proving a change is safe and a claim is true: blast radius, verification before completion, confidence tiers, definition of done, migrations, constraints.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `research`: Take; settle invocation with `code-review`. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 5. `why` and its epistemics framework: adapt the epistemics tiers into the collection's research discipline (high value, small); adapt a slim git-only `why` as user-invoked (medium value).
- 8. `blast-radius`: adopt-adapted, high priority, user-invoked. Consider lifting the evidence ladder into a shared reference.

**[superpowers](ledgers/superpowers.md)**

- 12. `verification-before-completion`: adopt-adapted as a candidate for core, after a baseline test shows it changes behaviour. Decide in the same theme as other "evidence before claims" candidates.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 7. Shared checklists (`references/`): adapt `definition-of-done.md` into core as a referenced file. Defer the rest to the web-pack decision. _(also: web pack)_
- 22. `constraint-driven-development` (with the `/constraints` command): adapt as core user-invoked `/constraints`. A strong candidate.
- 23. `constraint-driven-development/references/floor-guard.md` (floor-guard reference script): adopt together with entry 22, or not at all.
- 26. `deprecation-and-migration`: adapt. Settle model- vs user-invoked in the gating theme. _(also: unity pack)_
- 37. `security-and-hardening`: adapt the threat-model section only. The rest waits on the web-pack decision. _(also: web pack)_

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 8. The DeepAPI family: `deepapi`, `deep-research`, `deep-scrape`, `varied-search`, `who-is-this`, `online-shopping`: reject all six. Carry the coverage-checklist rule into the fork `research` skill if the research theme wants it.
- 11. `risky-changes`: adapt into the web pack; decide against `blast-radius` in one theme. _(also: web pack)_

**[garrytan/gstack](ledgers/gstack.md)**

- 15. `health`: reject. Offer the "named check commands in the steering file" convention and the two capture rules (real exit code first; non-zero exit can't be clean) to the verification theme.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A24. Convention: "Verification Scope" in `AGENTS.md`: owner's call. Probably merge into the verification skill rather than always-on. _(also: unity pack)_

## Diagnosis and performance

Finding causes and measuring speed: `diagnosing-bugs`, benchmarks, hill-climbing, experiment logs.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `diagnosing-bugs`: Take as core model-invoked. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 9. `benchmark-checklist` (with `principle-explain-the-number`): adopt-adapted, high priority. Pair the core checklist with a Unity pack note that `unity-debugging` can point at.
- 31. Diagnosis playbooks: Bug fix, Perf issue, Runtime forensics, Trace forensics: offer the mantras and "revert what a refuted hypothesis motivated" to `diagnosing-bugs`; offer "artifact → query → symbolized frame" to `unity-debugging`. _(also: unity pack)_
- 32. Hillclimb playbook: adopt-adapted as a user-invoked skill, depending on entries 9 and 18.

**[superpowers](ledgers/superpowers.md)**

- 10. `systematic-debugging` (with supporting techniques): reject the skill. Offer the 3-fix breaker to fork `diagnosing-bugs`, and consider a Unity version of condition-based waiting for `unity-testing`. _(also: unity pack)_

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 6. `/ship` fan-out, the four personas, and `orchestration-patterns.md`: reject `/ship` and the personas. Keep "personas don't invoke personas" and the metric-honesty rule as inputs to the review and performance themes. _(also: review and second opinions)_
- 25. `debugging-and-error-recovery`: reject. Offer the untrusted-error-output rule to #16 for `diagnosing-bugs`.
- 34. `observability-and-instrumentation`: hold for the web/service pack decision. Carry "define the questions before instrumenting" into any Unity diagnostics work. _(also: web pack)_
- 35. `performance-optimization`: web-pack candidate. Decide the experiment log together with pstack Hillclimb. _(also: web pack)_

**[garrytan/gstack](ledgers/gstack.md)**

- 16. `investigate`: reject. Offer "after three failed hypotheses, stop and question the architecture" and an optional "freeze edits to the suspect module" step to `diagnosing-bugs`, the second only if entry 6's `freeze` …

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 17. `ce-debug`: reject the skill. Offer three lines to the `diagnosing-bugs` theme: the causal-chain gate, "three failed fixes means diagnose why", and "a fix that reverses intended behaviour is deferred to the …
- 24. `ce-optimize`: reject. Offer "attribute cost before searching variants; the experiment log on disk is the source of truth" to the performance theme.

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- A3. `unity-profiling`: Adopt-adapted. High priority if the owner wants perf work in the pack. _(also: unity pack)_

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A12. `localizing-game-state-divergence`: merge the idea into `unity-debugging` / `diagnosing-bugs` (oracle-first, first-violation vs first-cause, "coarse trace" stop). _(also: unity pack)_

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 23. `analyzing-dotnet-performance`: owner's call for the C# pack; for Unity, idea-only and decided together with tipoLi's profiling skills. _(also: c# pack)_
- 24. `microbenchmarking`: copy into the C# pack if the owner benchmarks libraries; decide beside pstack's `benchmark-checklist`. _(also: c# pack)_

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 29. `dotnet-benchmark-designer`, `dotnet-performance-analyst`: reject both agents; the official skills are the better base. Carry the delegate-allocation checklist to whichever performance piece the owner picks, Unity included.

## Testing

Writing and judging tests: `tdd`, test review, testability, property testing.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `tdd`: Take as core model-invoked. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 20. `tdd`: reject; optionally offer the "bad test" list to fork `tdd`.

**[superpowers](ledgers/superpowers.md)**

- 9. `test-driven-development` (with `writing-good-tests.md`): reject the skill. Offer the mutation check, "Name the Break" and "whole suite defines green" to fork `tdd` as additions.

**[garrytan/gstack](ledgers/gstack.md)**

- 14. `test-audit` (with the test value bar): adapt the authoring gate and retention bar as a reference for fork `tdd` (a fork-side change, so the owner decides where it is authored per #16). Owner's call on a user-invoked `test-audit` for C# …

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 30. Test quality audit: `test-anti-patterns`, `test-smell-detection`, `assertion-quality`, `test-gap-analysis`, `grade-tests`, `test-tagging` (+ `test-analysis-extensions`): adapt into a single test-review skill. A top candidate; decide in the testing theme beside `dotnet-slopwatch`.
- 31. Testability: `testability-obstacle`, `detect-static-dependencies`, `generate-testability-wrappers`, `migrate-static-to-wrapper`: adapt `testability-obstacle` as a C# pack skill, or merge its seam table into `tdd`'s C# guidance; reject the other three. _(also: c# pack)_
- 34. Coverage: `coverage-analysis`, `crap-score`, `find-untested-sources`: reject all three; keep the CRAP ranking idea for the testing theme.
- 35. `dotnet-experimental`: `exp-mock-usage-analysis`, `exp-test-maintainability`: reject as separate skills; carry the dead-mock check into entry 30.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 14. `dotnet-slopwatch`: do not vendor the skill. Carry the six-rule list and the baseline idea into the testing theme, to be decided together with `protect-tests` and the official test-review skills. Whether to run the tool …
- 15. `crap-analysis`: reject the skill; same verdict as the official ledger. If a coverage step is ever built, this source's "let ReportGenerator compute it" route is the simpler base.
- 16. `cscheck`: owner's call on the library. Either way, take the oracle rules ("don't derive the expected answer from the implementation", "a green run can be vacuous", "prove the test can fail") into the testing … _(also: c# pack)_

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 10. `pr-review-toolkit`: `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer`: reject as pieces. Offer the four invariant questions to `codebase-design` and "rate a missing test by the bug it would catch" to the test-review theme, both as one-line additions. _(also: design and refactoring)_

**[Hook collections](ledgers/hook-collections.md)**

- 2. `protect-tests`: adapt as a second core hook, C# and Windows first, and only if the owner has seen an agent weaken a test. Otherwise park it as the ready answer for the first time it happens. _(also: ideas for decided areas)_
- 30. The `PreToolUse` validator: reject for the collection. Keep `protect-tests` (entry 2) as the deterministic alternative, and see open question 4.
- 32. TDD rules text and custom instructions: owner's call: compare "Reaching a Clean Red" and the refactor allowances against the fork's `tdd` when that theme is decided.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- T2. `property-based-testing`: reject as a skill. If `cscheck` or another C# property-testing candidate is taken, check it states the strength order, the two empty-test traps and the offer-once rule. _(also: c# pack)_
- T3. `mutation-testing`: reject. Keep the three triage rules as a note for the test-review candidate.

## Design and refactoring

Shaping modules and public APIs: `codebase-design`, `improve-codebase-architecture`, API design, refactoring.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `codebase-design`: Take as core model-invoked. _(also: the fork pass)_
- `improve-codebase-architecture`: Take. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 10. `architect` and its design red flags: offer "split ownership", "two ways to do one task" and "importable internals" as additions to the fork's design vocabulary. Reject the skill.
- 34. Build playbooks: Feature, Refactoring, Investigation, Prototype, Visual parity, Authoring a skill: offer Refactoring's pin-and-revert rule to fork `improve-codebase-architecture`; reject the rest as covered.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 17. `api-and-interface-design`: adapt as a C# public-API reference under `codebase-design`. Idempotency goes to a web/service pack if one exists.

**[garrytan/gstack](ledgers/gstack.md)**

- 17. `deslop-shared-libs`: adapt as a core user-invoked audit, or fold the rubric into `codebase-design` as a reference. Decide in the design/refactoring theme against the host's `simplify`.

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 17. `csharp-refactoring`: adapt. The strongest single skill candidate in this source. Owner decides core vs C# pack once Open question 1 is settled. _(also: c# pack)_

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 8. `api-design`: adapt, conditional on Open question 2. Decide beside Addy's `api-and-interface-design`: this one supplies the .NET-specific binary-compatibility rules that one lacks. One merged skill, not two. _(also: c# pack)_
- 19. `serialization`: reject. Fold "no type names in payloads; readers before writers" into the adapted API skill (entry 8) if that is taken.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 10. `pr-review-toolkit`: `pr-test-analyzer`, `type-design-analyzer`, `comment-analyzer`: reject as pieces. Offer the four invariant questions to `codebase-design` and "rate a missing test by the bug it would catch" to the test-review theme, both as one-line additions. _(also: testing)_

**[Ideas-only skim](ledgers/ideas-skim.md)**

- T4. `sharp-edges`: reject as a skill. Offer a three-question misuse probe (edge values, swappable parameters, the lazy and the confused caller) to whichever API-design piece the C# theme takes.

## Continuity and learning

Carrying state across sessions and learning from them: `handoff`, `retro`, `wait-what`, `teach`, recall, corrections.

Follow-up decision: [Does handoff need a teammate-ready brief?](https://github.com/Hissal/skill-collection/issues/62) adds a work brief form to `handoff`, for a teammate or the owner's future session, with issue output and fresh-session pickup; the resolution holds the contract.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `retro`: Take. _(also: the fork pass)_
- `handoff`: Take. _(also: the fork pass)_
- `teach`: Owner's call; costs nothing idle, so the question is only catalog clutter. _(also: the fork pass)_
- `wait-what`: Take. _(also: the fork pass)_
- `claude-handoff`: Owner's call: merge into `handoff` or drop. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 6. `teach`: reject as a skill; offer the "redraw and add one part" diagram rule to the fork's `teach` as an idea.
- 7. `recall`: medium priority. Decide together with handoff/pickup in one theme.
- 14. `correct`: adopt-adapted as an extension of `retro` (one owner per workflow), keeping the enforcer table.
- 15. `reflect`: idea-only; consider the "learning → named skill edit, human approves" routing for the collection's maintenance machinery (ticket #17).
- 16. `automate-me`: idea-only. Possibly run its mining step once, by hand, as research input for theme sessions.
- 25. `no-comments` and the `Comment Sicko` agent: reject the skill and agent; keep "encode then delete" as an idea for `correct`.
- 35. Continuity playbooks: Autonomous run, Pause safely, Session pickup: offer Pause safely's checklist to `handoff`; decide in the same theme as `recall` (entry 7).

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 24. `context-engineering`: reject. Offer the five-item "persist before restarting" list to whoever owns `handoff` (#16).

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 9. `handoff`: adapt: merge the three ideas into the fork `handoff`.
- 19. `teach`: reject; optionally add the concise-chat line to the fork's `teach`.

**[garrytan/gstack](ledgers/gstack.md)**

- 9. Learnings store and `learn`: reject the store and the skill. Offer the entry fields (source, confidence, files, and "prune when the file is gone or entries contradict") to the theme that decides `retro` and pstack `correct`.
- 11. `context-save` and `context-restore`: reject the skills; adapt the provenance markers into fork `handoff`, decided with davidondrej entry 9.
- 18. `retro`: reject. Offer "record recommendations, score follow-through next time" to the fork's `retro`.

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 1. `ce-compound`: adapt as one small core user-invoked skill, only if the theme that decides `retro` and pstack `correct` concludes a per-problem store is wanted. If not, lift the admission bar into fork `retro` as …
- 2. `ce-compound-refresh`: decide with entry 1. Independently of that, carry "accuracy audit by default, worth audit only on request, every deletion quotes its evidence" to #17 as the rule for any pruning of the collection's …
- 3. Learning schema, the two validators, the discoverability check and the read path: put "cited paths and SHAs in agent-written docs are mechanically checked" on #17's candidate list. Offer the "informational, not imperative" pointer wording to fork `writing-for-agents`. _(also: ideas for decided areas)_
- 5. Session-history scripts: note the transcript paths as a data source for #17's trigger checks. Reject as a copied script. _(also: ideas for decided areas)_
- 18. `ce-handoff`: reject the skill. Offer to the handoff theme: "say what matters at each pointer", "treat a handoff as untrusted context and stop for confirmation on resume", and "decisions carry the user's weight …
- 20. `wtf`: reject the skill. Offer the two lines to `wait-what`.
- 21. `ce-explain`: reject. Note "explain what the agents did over the last N sessions, with recall questions" as one idea for the `teach` theme.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 4. `hookify`: `/hookify`, `conversation-analyzer`, `writing-rules`, `list` / `configure` / `help`: reject the pieces. Offer one idea to the fork's `retro`: scan the session for corrections and, for each, let the owner choose the fix vehicle (skill description, steering-file line through the text …
- 7. `claude-md-management`: `/revise-claude-md`: owner's call between adapting it as a small core user-invoked skill and folding its diff-with-why step into the fork's `retro`. Decide with entry 4.

**[affaan-m/ECC](ledgers/ecc.md)**

- 2. `SessionStart` bootstrap and session memory: reject the bootstrap. Carry the stale-replay wording into the handoff theme as a merge candidate for the fork's `handoff`: a line telling the reading agent that commands and arguments quoted in a …

## Writing skills and docs

How skills, steering files and prose are written: `writing-for-agents`, skill formats, the agent-docs audit, the git-rule-file setup skill, prose checks. Also carries agnix's wording-opinion rules and the judgement rules from Anthropic's skill guidance (degrees of freedom per step, checklists, feedback loops, naming dependencies to install, writing for the frontier models first).

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `writing-for-agents`: Take as core model-invoked. _(also: the fork pass)_
- `writing-beats`: Out unless the owner writes articles; decide the three `writing-*` skills together. _(also: the fork pass)_
- `writing-fragments`: Same as `writing-beats`. _(also: the fork pass)_
- `writing-shape`: Same as `writing-beats`. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 21. `technical-writing`: put in the writing theme against `writing-for-agents`; likely adapt as user-invoked for human-facing docs.
- 22. `unslop`: writing theme; lean towards a reference file cited by writing skills, not always-on.
- 29. The principles format (24 `principle-*` skills): adopt the format for a small, curated set (below), stored as reference files that skills cite; decide index placement in ticket #15.
- 30. The playbook format: raise the "ownership line + Reply contract" shape in the session that decides skill shape.

**[superpowers](ledgers/superpowers.md)**

- 17. `writing-skills` (authoring rules): reject the skill. Propose merging the description rule, the form-to-failure table and the micro-test protocol into `writing-for-agents`, in the theme that decides skill-writing standards.
- 19. `persuasion-principles.md` and `anthropic-best-practices.md`: reject as files; cite as background in the skill-writing theme. Verify the Meincke et al. figure before quoting it anywhere.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 11. Plugin evals (`claude plugin eval`, `evals/plugin/`) and the description-phrasing finding: record the phrasing finding for the `writing-for-agents` / description theme. Consider `plugin eval` fires/quiet pairs for the few model-invoked collection skills. _(also: ideas for decided areas)_

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 6. `effective-agent-skills`: reject as a skill; merge the three items above in the skill-writing theme.

**[garrytan/gstack](ledgers/gstack.md)**

- 2. Catalog trim, catalog budget and the context-budget ratchet: adapt the budget test with the ratchet protocol as the enforcement of #14's tripwires. Put "lead-sentence-only descriptions" to the skill-writing theme as a question to settle with a trigger eval. _(also: ideas for decided areas)_
- 3. Lazy sections ("carve"): reject as a mechanism; offer "mutually exclusive modes each get their own reference file, and the skill says read exactly one" as a line for `writing-for-agents`.
- 5. Preamble tiers and `gstack-skill-start`: reject. Note "one script prints STATUS lines, prose branches on them" as an authoring pattern for skills that must detect environment.

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 10. Skill-body size ratchet and the "survives truncation" writing rules: add a per-skill body-size check to #17 beside the description tripwire sums, with the bound chosen and sourced by the owner. Offer "ordering is load-bearing: stop rules and done bar first" and the … _(also: ideas for decided areas)_
- 13. The authoring standard: `ce-skill-work`, the portable-skill guide, `CODING_STANDARDS.md` and the `AGENTS.md` rules: take five rules to the skill-writing theme as candidate lines for `writing-for-agents`: conditions not cases; restate on the second review round; description = mechanism sentence + one trigger per …
- 14. Specialist prompt assets and model tiers: adopt as a house convention if any collection skill dispatches subagents: persona text lives inside the skill, tiers are named by role, and the dispatch prompt carries its inputs. No standalone agent …
- 19. `ce-noslop`: decide in the same theme as pstack `unslop`. Proposed outcome: one user-invoked prose-check skill built on this source's seven tests, with pstack's catalog as its reference file.

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- A12. Mechanism: router-with-symptom-table layout, "Scope — what this skill does NOT do", and lint gates: Idea-only, for the maintenance theme.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A20. Skill-maintenance group: `migrating-agents-md-to-control-flow`, `refining-workflows-from-artifacts`, `extracting-agent-skills`: idea-only, feeding the maintenance theme. `refining-workflows-from-artifacts` is the strongest of the three.
- J12. Convention: `docs/cases/` ("cases, not rules"): idea-only, into authoring conventions.

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 10. Authoring skills, the "Quality bar" and the description-rating prompt: reject the skills; merge four rules into `writing-for-agents` in the skill-writing theme: baseline-delta ("delete what the model writes unaided"), paired exclusions between sibling skills, no …

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 6. "Validated against version X, output captured": one line for the skill-writing rules: a skill about a versioned library states the version its claims were checked against and whether they were run.

**[anthropics/skills](ledgers/anthropic-skills.md)**

- 10. Authoring conventions in `skill-creator`: carry "bundle what every run rebuilt" and "read the transcripts" into `writing-for-agents`; reject the "pushy" rule unless entry 7 runs show undertriggering on the owner's skills.
- 15. `webapp-testing`: reject the skill; take the "scripts are black boxes, `--help` first" line into `writing-for-agents`. _(also: web pack)_
- 18. `doc-coauthoring` (Reader Testing): reject the skill; propose Reader Testing as a check inside `writing-for-agents`.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 6. `claude-md-management`: `claude-md-improver`: do not install. Carry one check into #17: "every command and path named in a steering file still exists" (a currency check), and the "what not to add" list as supporting text for the text gate. _(also: ideas for decided areas)_
- 11. `plugin-dev`: seven skills: reject for the collection. Record for the skill-writing theme that "trigger examples belong in the body, not the description" now has first-party examples on the owner's side of the description …

**[Maintenance tooling](ledgers/maintenance-tooling.md)**

- 13. `skill-writer`: reject the skill; carry the four rules above into the skill-writing theme.
- 18. `agents-md`: merge its rules (size target, pointer table, the three "do not" lines, verify paths) into `writing-for-agents` as a short steering-file section; do not add a separate skill.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- F1. `context-audit`: adapt as a core user-invoked skill, decided in the maintenance theme alongside the overlapping audit pieces.

## Core guard rule set

Which rules the core command guard ships. The engine shape is decided; the rule content is not.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `git-guardrails-claude-code`: Do not take the skill; consider a hook in the always-on theme. _(also: the fork pass)_

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 2. Command guard: `deny-dangerous.sh` + `test-guard.sh` + `global-agent-guardrails`: adapt the hook + test harness as the core always-on command guard, replacing the fork's `git-guardrails-claude-code` idea. Decide in the always-on theme (#14).

**[garrytan/gstack](ledgers/gstack.md)**

- 6. Session-scoped hook skills: `careful`, `freeze`, `guard`, `unfreeze`: adapt `freeze` + `unfreeze` as core user-invoked (Claude-only, stated as such). Feed `careful`'s PowerShell rules, safe exceptions and deny/ask tiers into the core guard's Windows port, decided … _(also: planning and delegation)_

**[affaan-m/ECC](ledgers/ecc.md)**

- 4. GateGuard fact-forcing gate: reject the gate. Record "deny once with a rollback question, then allow" as a design option for the core guard's *grey-zone* commands (ones too common to block outright, such as `git reset --hard`) …
- 5. PowerShell destructive-command classifier: take the 62 test cases and the 13 rule IDs as the specification for the core guard's PowerShell arm. Decide in the hook theme whether to vendor the classifier (Node) or reimplement the catastrophic …
- 6. `block-no-verify` and `config-protection`: add the hook-bypass forms from `block-no-verify`'s tests to the core guard's candidate patterns. Hold `config-protection` as a named idea next to `protect-tests` in #17, to revisit only if the owner …

**[Hook collections](ledgers/hook-collections.md)**

- 1. `block-dangerous-commands`: don't install the plugin. Use its `critical` tier as the published pattern source when the core guard is built, and decide open question 1 first.
- 4. `protect-secrets`: owner's call. Not core by default; a candidate for a web pack, or replaced by two permission deny rules.
- 6. `case-insensitive-guard`: reject; note the failure mode.
- 8. `guard-pack`: carry "one dispatcher process, fail open per guard" into the core hook design.
- 10. Guard conventions and test machinery: adopt the conventions for collection hooks, and add two checks they lack: a "guard is actually loaded" smoke test per shell, and a PowerShell-tool case. _(also: ideas for decided areas)_
- 25. Codex adapter, `.codex/hooks.json`, `.agents/skills` mirror: use its gap list as a checklist when the core guard is made to run on Codex, and verify each item against a logged payload (entry 18) instead of trusting either README. _(also: ideas for decided areas)_
- 31. `tdd-guard on` / `off` and SessionStart housekeeping: note "every blocking hook needs a documented off switch" as a house rule; prefer an env var or state file over a prompt hook.
- 35. Enforcement doc: record as a known limit of any edit-matcher guard: it guards against accidents through the edit tools, not against a determined shell route.

## Prototyping

The general practice only: what a prototype is for, the brief, the medium, capture and hand-over, with an eye on what the Unity and web sessions will add. `unity-prototyping` and the HTML-or-engine choice for a Unity project are decided in the Unity pack theme, on top of this. The ideas-skim ledger's proposed merges P1 to P6 belong here, except the Unity-specific parts.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `prototype`: Take as core model-invoked. _(also: the fork pass)_

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 25. `ce-prototype`: reject the skill. Offer "do not fake the dimension being tested" as the deciding line for `unity-prototyping`'s HTML-or-engine choice, and the decisions capsule to `prototype`.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A18. Engine/web-specific group: `scaffolding-godot-mini-games`, `running-headless-godot`, `developing-with-crisp-game-lib`, `smoke-testing-web-games`, `probing-web-game-mechanics`, `styling-web-game-typography`, `generating-dot-assets`: reject.
- W5. `prototype-fast`: idea-only. Merge the brief template (question, core verb, throwaway?, timebox, keep-if) into `unity-prototyping`.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 25. `receipts`, `playground`, `project-artifact`: reject all three; mention `playground`'s copy-out-a-prompt loop when the prototype theme meets.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- G2. `web-game-foundations`: idea-only. Carry the ownership split into P4, the action map into P1, serializable state into P3.
- G3. `game-ui-frontend` (+ `frontend-prompts.md`, `three-hud-layout-patterns.md`): idea-only, into P1.
- G4. `game-playtest` (+ `playtest-checklist.md`): idea-only, into P2. Worth re-reading A18 in the same session: its rejection was for Unity, and the owner's web prototypes are the case it fits.
- G5. `phaser-2d-game` (+ `phaser-architecture.md`, `engine-selection.md`): reject. Open question 5 asks whether a library by `<script>` tag is ever acceptable.
- F2. `reference-hunt`: idea-only: add the semantics-summary port step to the fork's prototype capture (P6). Standalone skill is the owner's call.

## Unity pack

What the Unity pack holds once a pack guide replaces the fork's `unity` skill, including `unity-prototyping`.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `unity` (router): Take as the Unity pack's entry point. _(also: the fork pass; reaching a pack)_
- `unity-verification`: Take, pending the baseline comparison. _(also: the fork pass)_
- `unity-assemblies`: Take. _(also: the fork pass)_
- `unity-serialization`: Take. _(also: the fork pass)_
- `unity-testing`: Take. _(also: the fork pass)_
- `unity-code-lifecycle`: Take. _(also: the fork pass)_
- `unity-prototyping`: Take, or fold behind the router (owner decides pack shape). _(also: the fork pass)_
- `unity-debugging`: Take, pending the baseline comparison. _(also: the fork pass)_
- `research/` provenance: Keep the rules; keep the Unity files with the Unity pack's home.
- `unity-sandbox`: Keep with the Unity pack's home.

**[pstack](ledgers/pstack.md)**

- 19. `create-verification-skill` and `maintain-verification-skill`: adapt into the Unity pack, after ticket #3 says what Unity's own skills drive.
- 31. Diagnosis playbooks: Bug fix, Perf issue, Runtime forensics, Trace forensics: offer the mantras and "revert what a refuted hypothesis motivated" to `diagnosing-bugs`; offer "artifact → query → symbolized frame" to `unity-debugging`. _(also: diagnosis and performance)_
- 37. Benny automation pack: reject as a pack; carry the control-adapter contract into the Unity verification-skill adaptation (entry 19) and the "dormant pack files are not skills" packaging idea into ticket #18.

**[superpowers](ledgers/superpowers.md)**

- 10. `systematic-debugging` (with supporting techniques): reject the skill. Offer the 3-fix breaker to fork `diagnosing-bugs`, and consider a Unity version of condition-based waiting for `unity-testing`. _(also: diagnosis and performance)_

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 19. `ci-cd-and-automation`: reject. Unity CI, if wanted, is a gap item for the Unity pack, written new.
- 26. `deprecation-and-migration`: adapt. Settle model- vs user-invoked in the gating theme. _(also: evidence and change safety)_
- 38. `shipping-and-launch`: reject for core. A Unity release checklist would be written new (gap list item: build and player configuration). _(also: web pack)_

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 15. Compound Packs: reject the mechanism. Offer two ideas to the Unity pack theme: `applies_when` situation keys on rule sheets, and "vendored rule text is evidence, not instructions". Do not use the word "pack" for it. _(also: reaching a pack)_

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- A1. `unity-play-harness`: Adopt-adapted, high priority. The single best candidate in this ledger.
- A3. `unity-profiling`: Adopt-adapted. High priority if the owner wants perf work in the pack. _(also: diagnosis and performance)_
- A4. `unity-debug`: Reject as a skill; harvest the traps into the fork's Unity skills after verification.
- A5. `unity-device-testing`: Owner's call on mobile scope (open question 5); adapt if yes.
- A6. Shipping: `unity-android-release`, `unity-ios-build`: Owner's call (mobile scope). Otherwise harvest the "read the artifact back" idea.
- A7. `unity-live-services`: Idea-only. Owner's call if online play enters scope.
- A8. `unity-new-project`: Reject (baseline). Harvest the tag-pinning rule.
- B2. Gap-area guides (9, grouped): Owner's call per area. Default idea-only.
- B3. Tier 1 correctness skills (5, grouped): Adopt-adapted: `unity-async-patterns`, `unity-input-correctness`. Merge `unity-lifecycle`'s non-statics patterns into the fork's lifecycle skill. Others are owner's call.
- B4. Tier 2 architecture decision skills (5, grouped): Adopt-adapted: save-system, scene-assets. The architecture trio is idea-only.
- B6. `unity-ops` skills: `unity-surface-preflight`, `unity-cli-contract`: Reject; harvest the sandbox-false-negative rule.
- C1. `unity-agent-workflows` (the skill as a whole): Reject as a whole; harvest C2-C5.
- C2. Idea: visible-owner proof, screenshot-text owner, shared-caller blast radius: Idea-only: add "runtime writer beats serialized value" and "list callers before changing a shared helper" where the fork's Unity diagnosis lives.
- C4. Mechanism: Bee `.rsp` + bundled Roslyn compile check outside the Editor: Owner's call: worth a sandbox experiment, not an adoption.
- D9. Baseline- or platform-covered and business skills (10, grouped): Reject; mobile ideas go to the owner's mobile-scope decision (open question 5).

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A12. `localizing-game-state-divergence`: merge the idea into `unity-debugging` / `diagnosing-bugs` (oracle-first, first-violation vs first-cause, "coarse trace" stop). _(also: diagnosis and performance)_
- A13. `adversarially-validating-game-repairs` (+ 2 references): idea-only. Add the shape checklist to the Unity pack's debugging skill; pooling, domain reload and scene reload are Unity-specific lifetime boundaries that the fork's `unity-code-lifecycle` already …
- A16. `arcadifying-mini-games`: reject; keep the phase invariants as an idea for a future Unity scene/flow skill.
- A24. Convention: "Verification Scope" in `AGENTS.md`: owner's call. Probably merge into the verification skill rather than always-on. _(also: evidence and change safety)_
- J2. `gameplay-validation`: adapt into `unity-verification` (Unity pack), with no new skill.
- J4. `gameplay-harness`: idea-only, to inform a Unity harness decision in the playtest/tune theme. _(also: game design and feel)_
- J7. `engines/unity` adapter: adapt as a Unity pack reference. _(also: game design and feel)_
- W2. Unity skills that fill baseline gaps: `unity-input-system`, `unity-animation`, `unity-build-pipeline`, `unity-scriptableobjects`, `unity-csharp-scripting`: adapt `unity-input-system`, `unity-build-pipeline`, `unity-animation` for the Unity pack. Make `unity-scriptableobjects` and `unity-csharp-scripting` the owner's call because of the fork overlap …
- W6. Engine-neutral disciplines that touch Unity gaps: `game-feel`, `save-systems`, `performance-optimization`, `camera-systems`, `input-systems`: adapt `save-systems` (Unity pack or gamedev pack); the rest idea-only. _(also: game design and feel)_
- W10. Mechanism: version-support policy + validator: idea-only for maintenance: a version-pin field per Unity pack skill.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 7. `r3-reactive-extensions`: adapt, conditional on Open question 1. The top candidate in this source for the owner's first domain. If the owner does not use R3: reject. _(also: c# pack)_

**[affaan-m/ECC](ledgers/ecc.md)**

- 8. Advisory, quality and telemetry hooks (collapsed): reject all. Keep "batch at `Stop`, not per edit" as a note for any future Unity compile-check hook.
- 22. The other 70 agents, 95 commands and 12 legacy shims: reject as a set. Note "a narrow build-resolver role" as an idea for the Unity pack, to weigh against simply using `unity-verification`.

## Game design and feel

Whether a gamedev pack exists apart from the Unity pack, and what it holds.

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- A2. `unity-game-brief`: Adopt-adapted, user-invoked. Decide together with D1 in a "game kickoff" theme.
- A9. `unity-game-ui`: Reject as a skill; keep the readability rules as idea material for a game-UI theme.
- A11. AI asset generation: `codex-visual`, `comfyui-asset-generation`, `unity-3d-models`, `unity-rigged-character`: Owner's call in an "art pipeline" theme. Default reject; keep the ideas.
- B5. Tier 3 design-intent skills (5, grouped): Idea-only. Feed a "game design reference" theme together with D2-D5 and C3.
- C3. Idea: state-step guard (`shown != clicked != opened != selected != applied != completed != persisted`): Adopt-adapted as reference text.
- D1. `unity-game-director`, Step 2.5 "Scope a novel or ambiguous mechanic BEFORE building it": Adopt-adapted (Step 2.5), decided with A2. Reject the director router.
- D2. `unity-game-economy`: Owner's call; default idea-only.
- D3. `unity-gameplay-systems`: game feel / juice and the combat impact stack: Adopt-adapted (game-feel section) as reference text.
- D4. `unity-card-games`: Idea-only.
- D5. `unity-game-layout`: Owner's call; adapt if grid/board games are in scope.
- D6. Art pipeline cluster: `unity-art-direction`, `unity-asset-designer`, `unity-aaa-graphics`, `unity-asset-pipeline`, `unity-scene-composition`: Reject as skills; keep the registry and golden-asset ideas for the art theme.
- D7. Generators and authored animation: `unity-image-generator`, `unity-pixel-art`, `unity-3d-generator`, `unity-audio-generator`, `unity-animation`: Reject; harvest the animation timing ideas.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A1. `refining-game-prototypes` (+ `references/stage-checks.md`, `revision-log.md`): adapt into the gamedev pack, user-invoked. It is the anchor of a possible "playtest/tune" theme.
- A2. `evaluating-gameplay-balance` (+ 5 references): adapt, gamedev pack user-invoked. Decide together with A1, since A1 calls it.
- A3. `implementing-gameplay-invariants` (+ `invariant-patterns.md`): adapt, gamedev pack model-invoked. The description needs rewriting so it triggers on "implementing a mechanic from a design", not only on anti-mashing.
- A4. `stress-testing-game-concepts` (+ failure taxonomy, policy library, report contract): adopt/adapt, gamedev pack user-invoked.
- A5. Concept workbench: `exploring-game-design-space` + `curating-game-concept-portfolio`: idea-only. Keep "mutate a causal relationship, not a theme" and "each final concept names its smallest discriminating test" as a reference inside A4's adaptation.
- A6. Compact game design: `designing-mini-games`, `designing-minimal-game-rules`, `generating-retro-arcade-concepts`: reject as skills; idea-only for the Core Rules list.
- A7. `maximizing-game-feel` (+ `technique-catalog.md`): adapt, gamedev pack model-invoked, merged with J6's cleanup rules. Theme: "game feel".
- A8. `directing-game-visuals`: idea-only, folded into A7.
- A9. `gating-intent-legibility` (+ 5 references): owner's call. Strong idea; whether it pays depends on Unity frame capture.
- A10. `auditing-game-screen-readability` (+ moments catalogue, frame-check script): adapt, gamedev pack user-invoked, as a lower priority than A1.
- A11. `auditing-gameplay-implementation-coverage` (+ 2 references): owner's call: gamedev pack user-invoked, or a reference inside A12.
- A15. `verifying-turn-based-games`: owner's call. Reject unless the owner has a turn-based project.
- J3. `game-qa`: idea-only, a candidate section of a release checklist.
- J4. `gameplay-harness`: idea-only, to inform a Unity harness decision in the playtest/tune theme. _(also: unity pack)_
- J5. `action-feel` + the README iron laws: owner's call. Adopt if the owner makes action games; the iron laws are worth keeping as ideas in any case.
- J6. `juice-vfx` + `asset-runtime`: idea-only, merged into the game-feel candidate.
- J7. `engines/unity` adapter: adapt as a Unity pack reference. _(also: unity pack)_
- J8. Design contracts: `game-planning`, `balance-design`, `difficulty-design`, `tutorial-design`: idea-only.
- J9. Mechanic library (~150 disciplines): combat kit, traversal, camera, world/growth, genres, live-ops, monetization: reject as installable. Note in the catalog as an on-demand reference source.
- W4. `game-jam`: owner's call. Adopt if the owner jams.
- W6. Engine-neutral disciplines that touch Unity gaps: `game-feel`, `save-systems`, `performance-optimization`, `camera-systems`, `input-systems`: adapt `save-systems` (Unity pack or gamedev pack); the rest idea-only. _(also: unity pack)_
- W8. `steam-publish` + `itch-publish`: owner's call.

## C# pack

Whether a C# pack exists and what it holds. Pieces that the testing, design and diagnosis themes judge to be core stay there.

**[pstack](ledgers/pstack.md)**

- 24. `typescript-best-practices`: web pack candidate; and propose writing a C# equivalent new. _(also: web pack)_

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 13. Roslyn LSP declaration and the `binlog` MCP server: owner's call, sandbox first. Do not enable either through the source plugin.
- 17. `csharp-refactoring`: adapt. The strongest single skill candidate in this source. Owner decides core vs C# pack once Open question 1 is settled. _(also: design and refactoring)_
- 18. `msbuild` (core entry skill) and `setup-local-sdk`: owner's call on `msbuild` as the single MSBuild piece of a C# pack (instead of entry 29); reject `setup-local-sdk`.
- 19. `csharp-scripts`: owner's call; lean reject.
- 20. `dotnet-pinvoke`: reject unless the owner names interop as real work.
- 22. NuGet packaging: `nuget-trusted-publishing` and `convert-to-cpm`: owner's call, conditional on Open question 2; park as C# pack user-invoked candidates.
- 23. `analyzing-dotnet-performance`: owner's call for the C# pack; for Unity, idea-only and decided together with tipoLi's profiling skills. _(also: diagnosis and performance)_
- 24. `microbenchmarking`: copy into the C# pack if the owner benchmarks libraries; decide beside pstack's `benchmark-checklist`. _(also: diagnosis and performance)_
- 26. `migrate-nullable-references`: copy as C# pack user-invoked if any owner library is not yet nullable-enabled; otherwise reject.
- 27. `dotnet-aot-compat`: owner's call, conditional on shipping libraries for IL2CPP.
- 31. Testability: `testability-obstacle`, `detect-static-dependencies`, `generate-testability-wrappers`, `migrate-static-to-wrapper`: adapt `testability-obstacle` as a C# pack skill, or merge its seam table into `tdd`'s C# guidance; reject the other three. _(also: testing)_

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 7. `r3-reactive-extensions`: adapt, conditional on Open question 1. The top candidate in this source for the owner's first domain. If the owner does not use R3: reject. _(also: unity pack)_
- 8. `api-design`: adapt, conditional on Open question 2. Decide beside Addy's `api-and-interface-design`: this one supplies the .NET-specific binary-compatibility rules that one lacks. One merged skill, not two. _(also: design and refactoring)_
- 9. `type-design-performance`: reject the skill. Keep "seal by default; read-only collection types on public members" as two lines for whatever C# style reference the owner ends up with.
- 10. `modern-csharp-coding-standards`: reject. If the owner wants a C# style reference, "no implicit conversions on value objects" and "explicit mapping, no reflection mappers" are the two rules worth a line.
- 12. `csharp-nullable-reference-types`: adapt as the *authoring* half, if the owner's libraries use nullable; take `dotnet/skills`' skill for the one-off migration. If only one nullable piece is wanted, the official one is the better base …
- 13. `aot-trimming`: the official `dotnet-aot-compat` is the better base, on the same condition as there (the owner ships libraries for IL2CPP or AOT). From this one, keep at most the playbook reference and the "decide …
- 16. `cscheck`: owner's call on the library. Either way, take the oracle rules ("don't derive the expected answer from the implementation", "a green run can be vacuous", "prove the test can fail") into the testing … _(also: testing)_
- 17. `snapshot-testing`: reject the skill. Keep one idea for the C# pack: a public-API snapshot test as the mechanical guard behind the API rules, with baseline files that only the human approves.
- 18. `ilspy-decompile`: reject as a skill. If wanted, one line in a C# pack reference ("to see how a dependency behaves, decompile it with `ilspycmd`; ask before installing the tool") covers it, with no `allowed-tools` …
- 20. `dotnet-project-structure`, `package-management`, `dotnet-local-tools`: reject all three. Keep the golden rule as a candidate per-repo line for SDK-style library repos. For anything more, the official skills are the better base.
- 27. `roslyn-incremental-generator-specialist`: adapt into a skill if the owner authors generators; otherwise reject. Owner's call.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 14. `csharp-lsp`: trial as-is in a C# library repo first, then in the Unity sandbox with generated project files; adopt for the C# pack only if the Unity trial gives true diagnostics. This also settles two "not …

**[affaan-m/ECC](ledgers/ecc.md)**

- 18. `rules/csharp/` (5 path-scoped rule files): reject. If the C# theme wants a path-scoped rule at all, write a fresh one of a few lines scoped away from Unity folders, and decide it there.
- 20. `csharp-reviewer` (agent); Unity and game dev: none: reject the agent. Offer the six stack-neutral async and nullability points to the C# theme as candidate lines for a C# library standards doc that the fork's `code-review` would read.

**[Hook collections](ledgers/hook-collections.md)**

- 26. Stop-hook build checks: reject.
- 33. .NET reporter and the reporter architecture: note for the C# pack theme; no action now.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- T2. `property-based-testing`: reject as a skill. If `cscheck` or another C# property-testing candidate is taken, check it states the strength order, the two empty-test traps and the offer-once rule. _(also: testing)_

## Web pack

Whether a web pack exists, and so whether `vercel-labs/agent-skills`, `pbakaus/impeccable` and `emilkowalski/skills` get a ledger.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `wizard`: Take as user-invoked (not model-invoked), or leave out. _(also: the fork pass)_
- `setup-ts-deep-modules`: Web pack candidate; otherwise out. _(also: the fork pass)_
- `setup-pre-commit`: Out, or web pack user-invoked. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 24. `typescript-best-practices`: web pack candidate; and propose writing a C# equivalent new. _(also: c# pack)_

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 7. Shared checklists (`references/`): adapt `definition-of-done.md` into core as a referenced file. Defer the rest to the web-pack decision. _(also: evidence and change safety)_
- 18. `browser-testing-with-devtools`: reject for core. Keep the Security Boundaries text as a reference for any browser-driving skill.
- 29. `frontend-ui-engineering`: web-pack candidate if a web pack exists. Otherwise reject.
- 34. `observability-and-instrumentation`: hold for the web/service pack decision. Carry "define the questions before instrumenting" into any Unity diagnostics work. _(also: diagnosis and performance)_
- 35. `performance-optimization`: web-pack candidate. Decide the experiment log together with pstack Hillclimb. _(also: diagnosis and performance)_
- 37. `security-and-hardening`: adapt the threat-model section only. The rest waits on the web-pack decision. _(also: evidence and change safety)_
- 38. `shipping-and-launch`: reject for core. A Unity release checklist would be written new (gap list item: build and player configuration). _(also: unity pack)_

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 11. `risky-changes`: adapt into the web pack; decide against `blast-radius` in one theme. _(also: evidence and change safety)_
- 20. `setup-help`: reject; mention the "current step + ≤8 remaining" shape to `wizard` as a fallback for one-off setups.
- 24. `create-readonly-db-role` and `openrouter`: owner's call, conditional on stack; park as web-pack user-invoked candidates.

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 28. Web, iOS, product and author-stack skills: reject all nine. Revisit `ce-test-browser`, `ce-polish` and `ce-dogfood` only if a web pack ledger is commissioned.

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 37. App-framework and scaffolding plugins (30 skills): reject all thirty for now; revisit `dotnet-aspnetcore` and `dotnet-blazor` only if a web-pack session says the owner's web apps are .NET.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 23. `testcontainers-integration-tests`, `playwright-blazor-testing`, `playwright-ci-caching`: reject all three for now; revisit only if a web-pack session says the owner's web apps are .NET.

**[anthropics/skills](ledgers/anthropic-skills.md)**

- 15. `webapp-testing`: reject the skill; take the "scripts are black boxes, `--help` first" line into `writing-for-agents`. _(also: writing skills and docs)_
- 16. `frontend-design`: owner's call in the web-pack theme; low priority.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 15. The other eleven LSP plugins: defer `typescript-lsp` to the web-pack decision; reject the other ten as out of stack.
- 16. `security-guidance`: reject for core and the Unity pack; park for the web-pack decision. Carry the `python3` → `python` → `py -3` probe into the notes for any Python hook the collection ships on Windows.

**[Hook collections](ledgers/hook-collections.md)**

- 17. `auto-stage`, `format-code`, `notify-permission`: reject.

## Guide content

The routes of the core guide and each pack guide's needs table and routes. Runs after the pack themes.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `ask-matt`: Adapt as the collection's router once the catalog is decided; keep `PHASE-BOUNDARIES.md` nearly as is. _(also: the fork pass)_

**[pstack](ledgers/pstack.md)**

- 1. `poteto-mode` (the router): take the *pattern* into ticket #15: one user-invoked entry, a principle index inside it rather than in idle context, verbatim step copying with visible skips. Do not adopt the file.
- 26. `poteto-help`: idea-only; feed the "answer and hand back a prompt, don't run it" rule into ticket #15's router content.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- J1. Pack architecture: entry skill + `dispatcher` + `CONTRACT.md` + 191 model-invoked skills: reject the pack; idea-only for the per-phase skill budget and the `DEFER` output.

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 16. `csharp-expert` (router): reject the skill. Offer two ideas to the router-content decision: route on repo evidence, and let the router name pieces that exist in the collection but are not installed in this project.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 4. Router snippets for `AGENTS.md` / `CLAUDE.md`: reject the snippet, the script and the skill. Offer one idea to the router-content decision: a "run this check after that kind of change" line is a trigger a manual router can carry.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 22. `claude-code-setup`: reject; note "recommend at most one or two per category" as a restraint rule for any future router.

**[affaan-m/ECC](ledgers/ecc.md)**

- 13. Context profiles (`lean@1`, `full@1`) and skill triggers: no adoption. Cite in #15 as prior art that reached the same "kernel + routed remainder" shape and has not yet shipped a router.

**[Hook collections](ledgers/hook-collections.md)**

- 20. `skill-activation-prompt` and `skill-rules.json` prompt triggers (input for #15): don't adopt the hook. Give #15 these inputs: (a) a suggestion hook is feasible and free when silent, but the only job left for it after #14 is pointing the *user* at user-invoked workflows; (b) if … _(also: ideas for decided areas)_

## Ideas for decided areas

Entries addressed to decisions already made (always-on, gating, install, maintenance, vendoring). No session is planned for them. They stay open as ideas: any theme may pull one in, and the closing review reads this section.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- `deprecated/` (empty): Nothing to adopt; consider the retirement rule.
- Changesets versioning and the release workflow: Decide after the install architecture; adapt only if the collection ships as versioned plugins.
- `scripts/check.mjs` and the Check workflow: Adapt.
- `validate-plugin`: Copy if plugins are chosen.
- `scripts/link-skills.sh` (and `list-skills.sh`): Adapt as one candidate install route; weigh against plugins in the install-architecture theme.
- Upstream-sync runbook: Leave with the fork; revisit with the fork-relationship ticket.
- `.agents/invocation.md` (invocation and skill-to-skill calls): Copy.
- `agents/openai.yaml` (Codex parity): Copy.
- Plugin and marketplace manifests: Strong input to the install-architecture theme.
- ADRs (`.agents/adr/`): Feed into the install-architecture theme; re-check Codex's current manifest rules.
- `.agents/install-block.md`: Idea-only; revisit at the publishable-split decision.
- Bucket layout and the promotion rule: Use as input to the layout decision, not as is.
- Dependabot: Low priority; copy alongside any CI.

**[pstack](ledgers/pstack.md)**

- 2. Plugin packaging and the "everything user-invoked" convention: record as prior art for tickets #14, #15 and #18, especially the split between "registered skills" and "dormant pack files that are not skills".
- 27. `setup-pstack`: idea-only, for ticket #18 if per-role model choice becomes a feature.
- 33. Eval playbook: adopt-adapted for ticket #17 as the collection's skill-promotion check.

**[superpowers](ledgers/superpowers.md)**

- 1. `SessionStart` bootstrap hook + `using-superpowers`: reject as a mechanism. Carry three ideas into ticket #14: re-inject after `compact`, add a subagent opt-out line, and keep any always-on nudge to a few lines that name *when to suggest* user-invoked …
- 2. Multi-harness packaging and the porting guide: record as prior art for ticket #18, especially `"hooks": {}` as a way to keep a Claude-only hook out of Codex. Note one inconsistency for whoever relies on it: the README's Muse section says the …
- 16. `diagnosing-superpowers`: adopt-adapted for ticket #17 as a user-invoked "diagnose a session" tool, scoped to the collection's skills. Check first how much `/skill-doctor` already covers.
- 18. Testing skills with subagents (pressure-scenario methodology): adopt-adapted. Make it the collection's skill-promotion check, together with pstack's Eval playbook, in ticket #17.
- 21. Skill-triggering tests and plugin tests (`tests/`): adopt-adapted for ticket #17 as a description regression check, run before promoting any model-invoked skill.
- 22. Contributor guidelines for agents (`AGENTS.md`) and the PR template: park; revisit only if the fork starts taking PRs (ticket #16).
- 23. Repo hygiene scripts (`lint-shell.sh`, pre-commit): note for ticket #17; no adoption needed.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 1. `using-agent-skills`, the router, as a design: do not adopt the skill. Carry the six behaviors into #14 as candidate always-on text, compared against the owner's existing global instructions so nothing is duplicated.
- 2. `session-start.sh` (router injection hook): reject. Cite it in #15 as a source-side argument against SessionStart routers.
- 3. Multi-harness packaging: feed #18: "two manifests, one tree" works; add a CI install smoke test; avoid symlinks.
- 4. The shared-references portability problem (and its validator): adopt the rule "a skill carries every file it references" as a collection convention, and a resolve-after-install link check in #17.
- 8. Tier 1: structural lint (`skill-lint.js`, `validate-skills.js`) and `docs/skill-anatomy.md`: adapt the library pattern (pure rules + thin CLI + unit tests). Add a "Claude flag ⇔ Codex `allow_implicit_invocation`" parity rule. Do not adopt the frontmatter allowlist as written.
- 9. Tier 2: trigger and routing evals (`run-evals.js` + `evals/cases/*.json`): adapt as an optional CI check per install target. Keep the `owner` pairwise negatives; that is the valuable idea.
- 10. Tier 3: behavioural evals (`run-evals.js --behavioral`): idea-only. Take "pressure cases" and "expectations are behaviours, not phrasings" into #17.
- 11. Plugin evals (`claude plugin eval`, `evals/plugin/`) and the description-phrasing finding: record the phrasing finding for the `writing-for-agents` / description theme. Consider `plugin eval` fires/quiet pairs for the few model-invoked collection skills. _(also: writing skills and docs)_
- 12. `evals/skill-impact.md` (rejected-changes ledger): adopt if #17 adopts any eval tier.
- 15. Repo-maintenance conventions: `.claude/rules/skills-contributing.md`, `CLAUDE.md`, `AGENTS.md`: adopt the pattern (a path-scoped "before adding a skill, check the ledgers and catalog" rule) for this repo.
- 16. `docs/advanced-per-agent-configuration.md` (portable frontmatter policy): use as an input to #18's "one source, generated per-harness gates" design. Do not adopt the top-level ban.

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 1. Global `AGENTS.md`: don't adopt. Carry "never weaken tests to pass", "check the diff before done", and "don't revert changes you didn't make" as candidate one-liners into #14.
- 3. Dual gating convention (`disable-model-invocation` + `agents/openai.yaml`) and the `triggers:` field: add the gating-parity lint to #17's checks.
- 4. Category layout, sanitized mirror, and `push-skills`: reject the skill; note "private canonical, sanitized public mirror, verify the published file" as one option for the split-boundaries decision.
- 5. Cross-agent distribution and `distribute-skill-to-all-agents`: reject the skill; carry the "one canonical root + verify" idea into the install ticket.
- 7. DeepAPI managed-skill updater: reject the mechanism; note the hash-manifest idea for #17's drift detection.
- 23. `github-outside-sandbox`: reject as a skill; owner's call whether one line belongs in Codex-side always-on text.

**[garrytan/gstack](ledgers/gstack.md)**

- 1. Per-host generation: `SKILL.md.tmpl` → `SKILL.md` (`hosts/`, `gen-skill-docs.ts`): reject the generator. Carry "lint Codex's 1,024-char description limit" and "if prose is ever shared between skills, generate it and gate freshness in CI" into #17.
- 2. Catalog trim, catalog budget and the context-budget ratchet: adapt the budget test with the ratchet protocol as the enforcement of #14's tripwires. Put "lead-sentence-only descriptions" to the skill-writing theme as a question to settle with a trigger eval. _(also: writing skills and docs)_
- 4. `model-overlays/`: reject the mechanism. Offer "ground progress claims in a tool result from this session" and "when the user is describing a problem, the deliverable is an assessment; don't apply a fix until asked" as …
- 7. Install machinery: `setup`, `gstack-settings-hook`, settings-level hooks, routing injection, team mode: reject all of it. Carry the five settings-file safety rules into the install/migration ticket.
- 10. Test and eval suite: reject the suite. Carry the prompt-byte rule, touchfile selection and the runner diagnostics into #17 as design notes for whichever eval the owner picks.
- 13. `benchmark-models`: reject. "Dry-run the provider/auth check before any paid run" and "judge is opt-in" are notes for #17's eval design.

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 3. Learning schema, the two validators, the discoverability check and the read path: put "cited paths and SHAs in agent-written docs are mechanically checked" on #17's candidate list. Offer the "informational, not imperative" pointer wording to fork `writing-for-agents`. _(also: continuity and learning)_
- 5. Session-history scripts: note the transcript paths as a data source for #17's trigger checks. Reject as a copied script. _(also: continuity and learning)_
- 6. `ce-retune`: do not install. Carry four rules into #17 as the acceptance test for *any* eval it adopts: (1) an A/A run before any A/B claim; (2) the bar is written before the change; (3) arms interleaved and …
- 7. The install-manifest rule and the cleanup registries: adopt the rule as a stated invariant of the collection's installer in #18, "the installer only replaces or removes paths its own lock says it wrote; anything else at a target path is the owner's and …
- 8. Multi-target publishing: native manifests, converter CLI, release metadata: for #18, take "native manifests first, converter only where a host has none" as the design rule, which for Claude Code + Codex means no converter. For #17, take "one script writes version and counts …
- 9. Gating parity test, expected-set tests and the callee rule: adapt both checks for #17. In #15, state the callee constraint explicitly and choose per skill between "model-invoked with a restrained description" and "user-invoked, reached by read-the-file".
- 10. Skill-body size ratchet and the "survives truncation" writing rules: add a per-skill body-size check to #17 beside the description tripwire sums, with the bound chosen and sourced by the owner. Offer "ordering is load-bearing: stop rules and done bar first" and the … _(also: writing skills and docs)_
- 11. Skill-convention guards: self-containment, reference integrity, platform variables, shell safety, line endings: add to #17's check list: skill-local paths exist; bundled scripts are LF; a skill marked as individually installable references nothing outside its folder. Leave the rest.
- 12. Skill-eval cell, judged conversation evals and A/B packs: reject as code. Carry to #17: (1) the split "deterministic checks in CI, prose behaviour as local evidence"; (2) "grade surviving artifacts, never the transcript's claims"; (3) "A/B a skill by git …
- 16. CI gates and release hygiene: for #17, check that the collection's validation covers both the marketplace and the plugin manifest, with a pinned CLI. Offer "skills are product code: commit type by intent" as a line for the …

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- B7. Mechanism: `unity-ops-guard` shadow-mode PreToolUse hook, restatement budget, overlap audit: Idea-only, for the maintenance theme.
- C5. Mechanisms: `UNITY_STRUCTURE*.md` maps ("Teach"), trigger evals, semantic-contract check, session mining: Idea-only, maintenance theme.
- D10. Mechanism: canonical host-neutral skills + per-skill `agents/openai.yaml` + installer and validator: Idea-only.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A14. `generating-semantic-game-mutants` (+ 13 fixture mutants): idea-only, feeding the maintenance/eval theme.
- A22. Mechanism: plugin-bundle builder (`tools/plugin-bundles/`, `plugin-bundles/*.json`, `PLUGIN_RELEASE.md`): hand to the install-architecture ticket as prior art. It is the most concrete "one tree → many Claude+Codex packs" generator seen so far.
- A23. Mechanism: curated external skills (`tools/install-external-skills.sh`, README "External Skill References", `check-readme-skills.sh`): idea-only for the vendoring/maintenance theme. The "declined, and why" note format is worth copying into the catalog.
- J11. Mechanism: behaviour A/B experiment, engineering-quality records, contract tests: idea-only for the maintenance/eval theme, especially pre-registration and "not-run stays in the denominator".

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 1. Four marketplaces and three manifests per plugin: carry the "same names and sources, host-specific descriptions, Codex manifest lists only what Codex loads" rules into the install ticket. Do not install any plugin whole (see the skill entries).
- 2. Per-plugin versioning: reject the tooling; note "version derives from content, never hand-edited" as an option if packs ship as versioned plugins.
- 3. `skill-validator check`: static analysis and the menu budget: take the rule list as input to #17, in particular (a) a per-layer budget check computed over *rendered* listing text, set to the owner's tripwires, (b) "no XML-like tags in descriptions", (c) file …
- 4. `skill-validator evaluate`: A/B runs, pairwise judge, overfitting judge: idea-only. Add "plugin arm" and "classify rubric items as outcome / technique / vocabulary" to whatever eval method #17 settles on.
- 5. `run-skill-evals.sh`, the experiment files and the verdict policy: idea-only. Take the decision rule (distinct-stimulus votes, underpowered as a third verdict, dormancy cases, fail closed on missing results) as the *policy* layer over whichever runner #17 picks; the …
- 6. Eval-quality gate (`check_eval_quality.py`): idea-only. Carry the shrink-only ratchet, the self-test rule and the index-not-working-tree rule into #17.
- 7. Skill Value and token dashboard; skill coverage: reject the dashboard; keep two ideas for #17: an activation-rate floor below which a skill's "value" is not reported, and a claims-to-tests coverage listing for skills that carry checklists.
- 8. Codex plugin smoke test: adapt as a small Codex discovery smoke check in #17.
- 9. Reference scanner, allow-lists and the PR malicious-code scan: idea-only. Offer the four scanner rules and the "inventory every script and external tool a skill uses" file to the maintenance-tooling theme.
- 12. Reference-only skills, the description convention and the experimental plugin: idea-only. Note "shared reference folder as a hidden skill" as a packaging option, with the single-copy caveat.
- 15. Agentic workflows, repo-ops workflows and coexistence experiments: reject the workflows; add "coexistence run: evaluate a skill with its realistic neighbours loaded, on both model families" to #17's ideas.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 1. One plugin, two hosts: do not install the plugin. Carry one note to the install ticket: when Claude registers skills by list and Codex by folder, a check must compare the two.
- 2. Validation and release scripts; `marketplace-publishing`: reject the scripts and the skill. Add two lines to #17's check list: "release tag equals every manifest version" and "repo-maintenance skills are not shipped in a pack".
- 3. `user-invocable: false` on reference skills: add "unknown frontmatter key fails the check" to #17 if agnix does not already cover it for both hosts. No convention to adopt.
- 5. Repo `AGENTS.md` with a `CLAUDE.md` symlink; content guidelines: nothing to adopt. Record "a git symlink for a steering file becomes a one-word text file on a Windows clone without symlink support" as a constraint for the install ticket.

**[anthropics/skills](ledgers/anthropic-skills.md)**

- 1. `skill-creator` (the skill): don't vendor. Keep using the host copy where it helps; take the mechanisms through ticket #17.
- 2. Behavioural eval loop: with-skill vs baseline runs and the workspace layout: adopt-adapted as the collection's promotion check, merged with superpowers' pressure scenarios and pstack's blinding into one procedure (ticket #17).
- 3. Grader agent (`agents/grader.md`): adopt, if ticket #17 adopts entry 2.
- 4. Blind comparator and post-hoc analyzer (`agents/comparator.md`, `agents/analyzer.md`): fold the analyst's pattern checks into entry 2's procedure; keep the comparator as an on-demand reference.
- 5. `aggregate_benchmark.py` and `references/schemas.md`: adopt-adapted with entry 2.
- 6. Eval viewer (`eval-viewer/generate_review.py`, `viewer.html`): reject the viewer; keep the ordering rule in entry 2's procedure.
- 7. Trigger eval (`scripts/run_eval.py`): adopt-adapted as the collection's trigger regression check. Compare it with `claude plugin eval` in ticket #17 before building anything; the native command may already cover this without the Windows …
- 8. Description optimiser (`run_loop.py`, `improve_description.py`, `generate_report.py`, `assets/eval_review.html`): don't adopt the automation now. Revisit only if manual description tuning with entry 7 proves too slow.
- 9. `quick_validate.py` and `package_skill.py`: take the limits and the `evals/`-excluded-from-ship convention into ticket #17's lint; don't copy the scripts.
- 11. `prompt-audit` (in `claude-api/shared/prompt-audit.md`): adopt as a maintenance step in ticket #17: run `/claude-api prompt-audit` over the collection at each model release and before promoting vendored skills. Feed its keep list into `writing-for-agents`.
- 12. Eval-building and hill-climbing guides (`build-eval`, `eval-audit`, `eval-hillclimb`, `cost-hillclimb`, runner and report scaffolds): adopt the noise-floor, wired-mechanism and raw-row rules into the collection's eval procedure; leave the guides themselves to the bundled skill.
- 23. Marketplace packaging (`.claude-plugin/marketplace.json`): record as prior art for ticket #18: "one tree, path-listed plugin slices", and the lesson to keep slices small. Verify Codex's handling of `strict: false` there.
- 24. Spec, template and licence conventions (`spec/`, `template/`, `THIRD_PARTY_NOTICES.md`, per-skill `LICENSE.txt`): adopt "each vendored skill folder carries its upstream `LICENSE.txt` plus a provenance line" in the vendoring convention.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 1. Marketplace manifest conventions: carry "pack slugs are immutable; use `renames` if one must change" and "a manifest-only entry can ship a single LSP or hook config" into #18.
- 2. Marketplace CI: policy scan, frontmatter validation, SHA bumps, licence check: add the prompt's hook questions (unconditional or gated; network calls; data read beyond purpose; does the description disclose it) to the vendoring review step, next to Sentry's scanner. Note the …
- 3. `hookify`: the rule engine and its four hooks: do not install. Take two ideas into #17 and the guard's design: "rules are data files, the engine is the tested part" and "each rule file has an `enabled` flag". If the owner wants a generic rule …
- 5. `session-report`: adopt as the collection's usage-measurement tool, as a copy with provenance set to user-invoked; decide in the maintenance theme (#17) against the overlapping candidates. Its per-skill use counts …
- 6. `claude-md-management`: `claude-md-improver`: do not install. Carry one check into #17: "every command and path named in a steering file still exists" (a currency check), and the "what not to add" list as supporting text for the text gate. _(also: writing skills and docs)_
- 12. `plugin-dev`: hook scripts and the `.local.md` settings pattern: nothing to copy. Note for #18 that both of Anthropic's own stateful plugins key their hooks on a project-local file and exit silently without it, which supports the silent-unless-qualified pattern … _(also: reaching a pack)_

**[affaan-m/ECC](ledgers/ecc.md)**

- 1. Instincts and `continuous-learning-v2`: reject the subsystem. Keep one idea for the always-on theme: if a learned line is ever wanted, the instinct file format (trigger, action, evidence, confidence, project scope) is a good *record* …
- 3. Hook runtime: profiles, flags, dispatchers and the metadata sidecar: add three lines to the hook house style in #17: no extra keys in `hooks.json`; a hook that has nothing to say prints nothing and never echoes its input; every hook has one env switch that disables …
- 7. Hookify runtime: no adoption. Note for the gating and install tickets: "one generic hook, per-project rule files, untracked-only by default" is the alternative to "one script per pack hook", worth choosing between … _(also: reaching a pack)_
- 9. Install manifests: modules, profiles, components: no adoption. Carry two checks to #17 and #18: "every skill belongs to exactly one pack or core" and "each pack's manifest states its measured description tokens", the second being the tripwire sum …
- 10. Installer: install-state, ownership guard, hook consent, doctor / repair / uninstall: carry three rules into #18 as requirements for whatever installs the collection: record a digest per installed file; never overwrite or adopt a file that is not in the record; merge hooks into …
- 11. Multi-harness layout and `PLUGIN_SCHEMA_NOTES.md`: record the three manifest traps in #18 and, if a plugin is shipped, as checks in #17. Record the drift as evidence for a rule: one canonical skill tree; any per-harness copy is generated or …
- 12. `rules/`: structure and loading: reject `common/` as always-on text. Keep the layout note for the install ticket: if a pack ever ships a path-scoped rule, it goes under a namespaced folder, is copied (not symlinked), and one pack's …
- 15. CI validators, catalog count check and test suite: add two checks to #17's own script: no personal absolute paths in shipped skills, and no invisible or bidirectional Unicode in any file copied from a source. Skip the rest in favour of agnix.
- 16. Skill-governance skills: `skill-comply`, `context-budget`, `skill-stocktake`, `rules-distill`, `config-gc`, `skill-scout`: add "adherence under a competing prompt" as a named eval type in #17, next to trigger evals, with `skill-comply`'s three strictness levels as the scenario template. Reject the other five.

**[Hook collections](ledgers/hook-collections.md)**

- 2. `protect-tests`: adapt as a second core hook, C# and Windows first, and only if the owner has seen an agent weaken a test. Otherwise park it as the ready answer for the first time it happens. _(also: testing)_
- 3. `git-safety`: reject. Keep "protected-branch rules belong in a per-project hook, not core" as a note for packs.
- 5. `config-guard` and `config-watch`: reject for the collection.
- 7. `subagent-spawn-cap`: reject the hook; note the built-in concurrency setting for the install ticket.
- 9. `instructions-audit`: reject as a hook; pass the invisible-Unicode rules to #17 as a check to run over vendored files.
- 10. Guard conventions and test machinery: adopt the conventions for collection hooks, and add two checks they lack: a "guard is actually loaded" smoke test per shell, and a PowerShell-tool case. _(also: core guard rule set)_
- 11. `dead-rules-audit`: reject the plugin; keep "measure whether an always-on line is followed before keeping it" as a #17 idea.
- 12. `context-hogs`, `bench/read-replay` and `docs/token-diet.md`: reject the plugin; hand the settings list to the migration item on the map as things to check against current docs.
- 13. `cache-tax`: reject.
- 18. `utils/event-logger.py`: note as the first step of building any collection hook.
- 19. One plugin per hook: carry "a moved hook path fails silently" into #18 as a check the install must make.
- 20. `skill-activation-prompt` and `skill-rules.json` prompt triggers (input for #15): don't adopt the hook. Give #15 these inputs: (a) a suggestion hook is feasible and free when silent, but the only job left for it after #14 is pointing the *user* at user-invoked workflows; (b) if … _(also: guide content)_
- 23. AI classification providers: reject. Tell #15: an LLM classifier in a prompt hook over-suggested by the author's own measure; deterministic rules are the only thing they let block.
- 24. Activation telemetry: add "log skill activations, compare with suggestions" to #17 as an optional measurement, Claude-only.
- 25. Codex adapter, `.codex/hooks.json`, `.agents/skills` mirror: use its gap list as a checklist when the core guard is made to run on Codex, and verify each item against a logged payload (entry 18) instead of trusting either README. _(also: core guard rule set)_
- 27. `setup.ts` wizard, `verify-setup.sh`, `/verify-setup`: carry "a doctor command that fires every installed hook once" into #18.
- 34. `setup` skill and plugin packaging: note the "hook plugin + user-invoked setup skill" split for #18; reject `npx @latest` in hook commands as a house rule.

**[Maintenance tooling](ledgers/maintenance-tooling.md)**

- 1. agnix CLI, `.agnix.toml` and autofix modes: adopt as the format-validity layer of #17's check, version-pinned and configured, with the owner's own script (entry 17) for everything agnix cannot see.
- 2. Skill rule families: `AS-*` (14), `CC-SK-*` (18), `CX-SK-001`, `XP-SK-001`: enable, minus the three rules above.
- 3. Steering-file rule families: `CC-MEM-*` (13), `AGM-*` (6), `XP-*` (9), `PE-*` (6), `REF-*` (4), `XML-*` (3): enable `CC-MEM-001/002/003/011/012/014`, `XP-004/005/007/009`, `REF-*`, `XML-*`; leave `PE-*`, `CC-MEM-005` to `010`, `AGM-002/004` and `XP-006` off until the owner has compared them with …
- 4. Claude Code config families: `CC-HK-*` (26), `CC-SET-*` (32), `CC-PL-*` (17), `CC-AG-*` (18), `CC-OS-*` (6): enable `CC-HK-*` and `CC-PL-*`; leave `CC-SET-*`, `CC-AG-*`, `CC-OS-*` at defaults and silence only what proves noisy.
- 5. Codex families: `CDX-*` (7), `CDX-CFG-*` (30), `CDX-AG-*` (7), `CDX-PL-*` (16), `CDX-APP-*` (3), `CDX-REQ-*` (2): enable with `CDX-AG-004` off; expect little signal until the collection commits a `.codex/config.toml` or a `.codex-plugin/`.
- 7. CI action `agnix-ci`, pre-commit hook and SARIF: adopt-adapted: SHA-pinned action, pinned `version`, committed `.agnix.toml`, warnings non-fatal at first.
- 9. Rule evidence metadata, `agnix explain`, `agnix eval`, version pinning (`VER-001`): idea-only; pin `[tool_versions]` in `.agnix.toml` if entry 1 is adopted.
- 10. Spec-drift sentinel and tool-release watch: adapt as a low-priority scheduled check; start with the fork-behind-upstream counter, which #17 already names as a tripwire input.
- 11. Repo preflight: count, copy and bookkeeping sync checks: fold "always-on copies are identical to their source" into the owner's check script (entry 17).
- 12. `skill-scanner` + `scan_skill.py` + `warden.toml`: adapt the script as the intake and drift scan in #17's vendoring procedure; keep the agent pass as a user-invoked step run when a new source is vendored.
- 14. Per-skill `SPEC.md`, `SOURCES.md` and `EVAL.md`: adapt as the provenance-and-contract file for adapted skills and overrides; decide its exact shape together with the vendoring lock file in #17.
- 15. `quick_validate.py`: reject the script; keep "every path a skill names must exist" as a check requirement for #17.
- 16. AXIS evals (`evals/axis.config.json`, `evals/scenarios/*.json`): idea-only. Put "AXIS, if it supports Claude Code" on #17's runner comparison beside `claude plugin eval`; adopt the adoption gate wording whichever runner wins.
- 17. Registration checklist, packaging and the dual-gate rule: write the checks above into one script modelled on the fork's `check.mjs`, run beside agnix. Reject the root-plugin and symlink packaging.
- 19. `claude-settings-audit`: reject.
- 24. `security-review`, `gha-security-review`, `secret-serialization`: reject as installed skills; note `gha-security-review` as a one-off review to run when #17's CI lands.
- 28. `analyze`: static skill and plugin checks, score and grade: reject the static evaluator in favour of agnix plus the owner's script.
- 29. `explain-budget`: three-tier token budget and baselines: adopt the model, re-implemented in the owner's check script with the owner's ratio and tripwires; record invoke cost as a second, informational figure.
- 30. `init-benchmark`, `benchmark`, `compare` and observed usage: idea-only. Keep it as the Codex option on #17's runner comparison; do not adopt before a Claude-side runner is chosen.

**[Installed plugins](ledgers/installed-plugins.md)**

- karpathy-skills: Keep the plugin disabled; "surgical changes" and "state assumptions" were candidate one-liners for always-on text.
- caveman: Not recreated; the lesson (inject a style rule once, keep it short, never per prompt) is in the always-on decision.
- vibe-wise: Not recreated; its silent-unless-opted-in hook is the model for always-on pieces.

## Not pursued

Entries whose ledger proposes a plain reject and carries no idea elsewhere. No session is planned. Nothing here is deleted from its ledger, and the closing review reads this section too.

**[The fork](ledgers/mattpocock-skills-unity.md)**

- Docs pages and `.agents/writing-docs.md`: Reject for the collection.

**[pstack](ledgers/pstack.md)**

- 23. `bro`: reject (covered by `wait-what`).
- 28. `make-bot-ui`: reject.

**[superpowers](ledgers/superpowers.md)**

- 8. `dispatching-parallel-agents`: reject.
- 11. `using-git-worktrees`: reject.
- 15. `finishing-a-development-branch`: reject.
- 20. Graphviz flowcharts in skills (`graphviz-conventions.dot`, `render-graphs.js`): reject.

**[Addy Osmani agent-skills](ledgers/addy-agent-skills.md)**

- 13. `sdd-cache` hooks (WebFetch revalidating cache): reject.
- 14. `simplify-ignore` hook: reject.
- 21. `code-simplification`: reject.
- 27. `documentation-and-adrs`: reject.
- 30. `git-workflow-and-versioning`: reject.
- 32. `incremental-implementation`: reject.
- 36. `planning-and-task-breakdown`: reject.
- 39. `source-driven-development`: reject.
- 41. `test-driven-development`: reject.

**[davidondrej/skills](ledgers/davidondrej-skills.md)**

- 17. `before-building`: reject.
- 21. `prompt-for-others`: reject as a standalone skill; the work brief capability is adapted into `handoff`, with the solo-developer rejection premise corrected by [Does handoff need a teammate-ready brief?](https://github.com/Hissal/skill-collection/issues/62).
- 22. `larp-detector`: reject for now.
- 25. Author-stack tool wrappers: reject all seventeen.
- 26. Personal-workflow skills: `signal-from-expert`, `domain-checker`, `fireflies-transcript`, `image-prompt`, `save-idea`: reject all five.

**[garrytan/gstack](ledgers/gstack.md)**

- 20. Suite plumbing not covered above: gbrain, OpenClaw, bundled browser-skills: reject.

**[EveryInc/compound-engineering-plugin](ledgers/compound-engineering.md)**

- 22. `ce-simplify-code`: reject as already available.
- 27. `ce-setup`: reject.

**[Unity workflow skill repos](ledgers/unity-workflow-repos.md)**

- A10. Baseline-covered feature skills (22, grouped): Reject (baseline covers them).
- B1. Baseline- or fork-covered guides (11, grouped): Reject. `unity-xr` is the owner's call if XR enters scope.
- D8. MCP execution layer: `unity-mcp-bridge`, `unity-mcp-skill`: Reject.

**[Engine-agnostic gamedev skill repos](ledgers/gamedev-repos.md)**

- A17. Retro audio group: `building-era-authentic-game-audio`, `designing-retro-arcade-sound-kits`, `creating-godot-procedural-audio`: reject.
- J10. Asset and 2D skills (`art-bible`, `character-rig`, `materials`, `model-pipeline`, `open-asset-fixture`, `vfx-generate`, `pixel-animation`, `spine-skeletal`, `sprite-atlas`, `sprite-catalog`, `sprite-skin`): reject.
- W1. Router + whole-catalog install: reject the install.
- W3. Unity skills that duplicate the baseline: `unity-navmesh`, `unity-tilemap-2d`, `unity-physics`: reject.
- W7. Other disciplines and genres (`game-ai`, `ai-behavior-trees-utility-ai`, `procedural-gen`, `dialogue-systems`, `level-design`, `audio-design`, `shader-programming`, `physics-tuning`, `game-ui-ux`, `create-game-assets`; 9 genre skills): reject.
- W9. Non-Unity engine skills (Godot 16, Unreal 6, web 6, other 10): reject.

**[dotnet/skills](ledgers/dotnet-skills.md)**

- 14. Copilot custom agents: reject all sixteen.
- 21. `vectorization`: reject.
- 25. Runtime diagnostics collection: `dotnet-trace-collect`, `dump-collect`, `clr-activation-debugging`, `android-tombstone-symbolication`, `apple-crash-symbolication`: reject all five.
- 28. Version migrations: `migrate-dotnet8-to-dotnet9`, `migrate-dotnet9-to-dotnet10`, `migrate-dotnet10-to-dotnet11`, `thread-abort-migration`, `system-text-json-net11`: reject as collection members; note "enable the upstream plugin temporarily" as the pattern for release-train …
- 29. The 18 `dotnet-msbuild` skills: reject all eighteen as collection members; entry 18's `msbuild` is the candidate if any MSBuild piece is …
- 32. Test execution and authoring: `run-tests`, `platform-detection`, `filter-syntax`, `mtp-hot-reload`, `scaffold-dotnet-test-project`, `writing-mstest-tests`: reject all six; a per-repo test command line covers the need.
- 33. Test generation pipeline: `code-testing`, `code-testing-agent`, `code-testing-extensions`: reject all three.
- 36. The 6 `dotnet-test-migration` skills: reject all six.

**[Aaronontheweb/dotnet-skills](ledgers/aaronontheweb-dotnet-skills.md)**

- 11. `csharp-concurrency-patterns`: reject.
- 21. `microsoft-extensions-configuration`, `dependency-injection-patterns`: reject both.
- 22. `opentelemetry-net-instrumentation`: reject.
- 24. `efcore-patterns`, `database-performance`: reject both.
- 25. Akka.NET and Aspire (9 skills, 1 agent): reject all nine skills and the agent. Revisit only if the owner starts an Akka.NET or Aspire project, and …
- 26. `mjml-email-templates`, `verify-email-snapshots`, `dotnet-devcert-trust`, `sdk-container-publishing`: reject all four.
- 28. `dotnet-concurrency-specialist`: reject.
- 30. `docfx-specialist`: reject.

**[anthropics/skills](ledgers/anthropic-skills.md)**

- 13. `claude-api` (the skill): reject vendoring; rely on the bundled copy (entries 11 and 12 use it).
- 17. `web-artifacts-builder`: reject.
- 19. `discernment-nudge`: reject.
- 20. `academy-guide`: reject.
- 21. Document skills: `docx`, `pdf`, `pptx`, `xlsx`: reject; never install `document-skills` alongside the host copies.
- 22. Creative and brand skills: `algorithmic-art`, `canvas-design`, `theme-factory`, `brand-guidelines`, `slack-gif-creator`, `internal-comms`: reject all six.

**[Anthropic-authored marketplace plugins](ledgers/anthropic-marketplace-plugins.md)**

- 13. `plugin-dev`: `agent-creator`, `plugin-validator`, `skill-reviewer`, `/create-plugin`: reject.
- 17. `explanatory-output-style`, `learning-output-style`: reject both; they are the pattern the always-on decision ruled out.
- 21. `commit-commands`: reject.
- 23. `skill-creator`, `frontend-design`, `mcp-server-dev`, `agent-sdk-dev`, `mcp-tunnels`: nothing for the catalog. Install `mcp-server-dev` or `agent-sdk-dev` in a project that needs one, never at …
- 24. `claude-security`, `code-modernization`: reject both.
- 26. `math-olympiad`, `math-proof`, `cwc-makers`: reject.
- 27. `example-plugin`: none; reference only.

**[affaan-m/ECC](ledgers/ecc.md)**

- 14. Root steering files: `AGENTS.md`, `CLAUDE.md`, `SOUL.md`, `contexts/`: reject.
- 17. `unified-memory`, the Memory Vault and `ck`: reject.
- 19. `csharp-testing` and `dotnet-patterns` (skills): reject both in favour of the dotnet/skills candidates. Nothing here is missing from that ledger.
- 21. The other 297 skills: reject as a set. If a theme session wants a second opinion on one topic, read that single ECC skill then …
- 23. Everything else: `ecc2/`, dashboards, MCP configs, plan-canvas, orchestration, sponsor and Pro material: reject.

**[Hook collections](ledgers/hook-collections.md)**

- 14. `dead-end-registry`: reject; the hand-written handoff section covers the need.
- 15. `standup-autopilot`, `nerf-receipts`, `bounty-board`, `session-logger`: reject all four.
- 16. `pr-provenance-stamp`: reject.
- 22. Dev-doc reminder, session intelligence and `session-doc-updater`: reject. Cite as the second local example, after caveman, of why gate item 2 exists.
- 28. Skills: `skill-developer`, `backend-dev-guidelines`, `frontend-dev-guidelines`, `error-tracking`: reject all four.
- 29. Subagents, commands, dev-docs pattern, editor config: reject.

**[Maintenance tooling](ledgers/maintenance-tooling.md)**

- 6. Other-tool families (about 215 rules): reject (scoped out by config); revisit MCP rules only if an MCP config enters the collection.
- 8. `agnix` skill, Claude plugin, MCP server, LSP and editor extensions: reject the skill, plugin and MCP server; editor extension is the owner's call outside the blueprint.
- 23. `code-review`, `find-bugs`, `code-simplifier` (skill and agent): reject.
- 25. `doc-coauthoring`: reject here; decide under the Anthropic entry.
- 26. `django-access-review`, `django-perf-review`: reject.
- 27. Sentry-internal skills and the `senpai` agent: reject all.
- 31. The five skills, metric packs and the plugin bundle: reject the skills and the bundle.

**[Ideas-only skim](ledgers/ideas-skim.md)**

- G1. `game-studio` (router) and the plugin shape: reject. The router pattern is already recorded from three other sources.
- G6. `three-webgl-game`, `react-three-fiber-game`, `web-3d-asset-pipeline`, `sprite-pipeline`: reject.

