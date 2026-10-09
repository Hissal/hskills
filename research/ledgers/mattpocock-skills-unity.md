# Ledger: the fork (`Hissal/mattpocock-skills-unity`)

Ticket: [Ledger: the fork (mattpocock-skills-unity)](https://github.com/Hissal/skill-collection/issues/4), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Read on 2026-10-09 from the local clone `C:\dev\skills\mattpocock-skills-unity` at `HEAD` [`3d926c6e`](https://github.com/Hissal/mattpocock-skills-unity/commit/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515) (`origin/main`). Every source link below is pinned to that SHA. Every `SKILL.md` and its supporting files were read; the four Unity helper scripts and `SerializationScope.cs` were read from their headers and usage blocks, not executed. Nothing from the source repo was run.

Conventions in this file:

- Vocabulary is the collection's [GLOSSARY.md](../../GLOSSARY.md): **core**, **pack**, **always-on**, **model-invoked**, **user-invoked**, **address**, **candidate**, **mechanism**.
- **Every recommendation is proposed.** The owner decides in the theme sessions.
- *Inference:* marks a claim reasoned from the sources rather than stated by them.
- **Idle context cost** is an estimate: description characters / 4, plus about 5 tokens for the name (*inference*, a rough heuristic, not a tokenizer count). User-invoked skills cost 0 in Claude Code, per the glossary's definition of user-invoked. Whether Codex lists a `policy.allow_implicit_invocation: false` skill's description in context was not checked here: marked "Codex: unverified".
- **Overlap with the Unity baseline** is *pending* for every entry: `research/unity-baseline.md` does not exist on this repo's `main` yet. **Overlap with other ledgers**: none exist on `main` yet, so that field only names overlap inside the fork.

Shorthand: `fork:` links go to `https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/<path>`.

## Overview

**Counts.** 46 skills and 17 mechanism candidates.

| Bucket | Skills | Model-invoked | User-invoked | Model-invoked idle cost (est.) |
|---|---|---|---|---|
| `engineering/` (promoted) | 20 | 9 | 11 | ~530 tokens |
| `productivity/` (promoted) | 7 | 2 | 5 | ~100 tokens |
| `unity/` (promoted) | 8 | 8 | 0 | ~510 tokens |
| `in-progress/` | 7 | 0 | 7 | 0 |
| `misc/` | 4 | 4 | 0 | ~230 tokens |
| `deprecated/` | 0 (empty) | | | |

Sources: the bucket rules in [fork: CLAUDE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CLAUDE.md), the per-skill frontmatter (each entry links its `SKILL.md`), and [fork: skills/deprecated/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/deprecated/README.md) ("This bucket is currently empty").

**How the fork is built** (load-bearing for every entry):

- It is a fork of `mattpocock/skills` kept as **small, in-place Unity deltas** so upstream merges stay cheap ([fork: CLAUDE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CLAUDE.md)). Against the merge-base `4588b32`, 16 upstream `SKILL.md` files differ, by one or two lines each except `ask-matt` (a 13-line Unity section), and `setup-matt-pocock-skills` gains two whole files (`unity-setup.md`, `unity.md`) (observed with `git diff --stat 4588b32 HEAD -- skills/`).
- Each delta is one line of the shape "In a Unity repo, call the Skill tool with "unity" for <need phrase>" ([fork: CODING_STANDARDS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CODING_STANDARDS.md)), routed by the `unity` router's needs table to the seven `unity-*` skills.
- The local clone's `upstream/main` is **40 commits ahead** of that merge-base, touching at least `diagnosing-bugs`, `code-review`, `setup-matt-pocock-skills`, `implement`, `grilling`, `tdd`, `teach`, `wayfinder` and `ask-matt` (observed with `git log --oneline 4588b32..upstream/main`). So the fork's upstream skills lag upstream by those commits.

**Standout candidates (proposed):**

- **`grilling`, `domain-modeling`, `codebase-design`, `tdd`, `diagnosing-bugs`**: small, cheap descriptions, stack-agnostic, and the base other skills call. Strong core model-invoked picks.
- **`writing-for-agents`**: the collection's own authoring reference (context load vs cognitive load, pointers, leading words). It already shapes this map's Notes.
- **The Unity pack (`unity` router + seven `unity-*` skills)**: deep, cited, sandbox-checked Unity 6.x mechanics; the strongest fit for the owner's main stack. The open question is its shape, not its value.
- **`wayfinder`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `grill-with-docs`, `retro`**: the user-invoked flow, zero idle cost.
- **Mechanisms**: the invocation convention plus `agents/openai.yaml` (Codex parity), the Unity delta line pattern (a ready-made core-to-pack seam), and ADR 0002 (the Codex plugin constraint the install architecture must answer).

**Biggest open questions:**

1. **Copy or depend?** The collection can copy fork skills (and then carry their Unity delta lines and the 40-commit upstream lag itself), or treat the fork as an installed dependency and only add a companion layer. The fork's own prior research recommends the second: "Keep this fork as the engineering and Unity foundation. Build a separate curated companion collection" (local `research/2026-10-09-skill-collection-comparison.md`; that file is staged but not committed at `3d926c6e`, so it has no pinned link).
2. **Expensive but model-invoked.** The map says expensive workflows are user-invoked. `code-review` (two sub-agents) and `research` (a background agent) are model-invoked, and must stay so for `implement-spec` and `wayfinder` to call them through the Skill tool, since "a user-invoked skill can never be reached this way" ([fork: .agents/invocation.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/invocation.md)).
3. **Unity pack shape and baseline overlap.** Eight model-invoked descriptions (~510 tokens) in every Unity session, versus a router-only shape; and how much `Unity-Technologies/skills` already covers (pending the baseline ticket).
4. **Codex packaging.** ADR 0002 records that a Codex plugin manifest takes a single `skills` path and drops symlinks on install, which is why the fork ships no Codex plugin. A core/pack split must answer the same constraint.
5. **Today's install contradicts the pack idea.** `link-skills.sh` links every skill outside `deprecated/` and `misc/`, Unity and `in-progress/` included, into `~/.claude/skills` and `~/.agents/skills` (user scope), so the Unity descriptions cost idle context in every repo.

---

## Engineering skills

### `ask-matt`

- **What it is**: A user-invoked router over the fork's skills: one main flow (grill-with-docs, optional prototype detour, to-spec, to-tickets, implement or implement-spec, tdd, code-review, pr, retro), on-ramps (triage, diagnosing-bugs, wayfinder), standalone skills, a Unity section, and a phase-boundary decision tree (continue, `/clear`, `/handoff`, subagent, `/compact`) in `PHASE-BOUNDARIES.md`. Fork delta: the 13-line Unity section. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/ask-matt/SKILL.md), [PHASE-BOUNDARIES.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/ask-matt/PHASE-BOUNDARIES.md)
- **Kind**: skill (router)
- **Proposed address**: core user-invoked (as the collection's own router, rewritten)
- **Why it could fit**: The map's "Router content" fog item asks exactly what a manual router maps. Zero idle cost. `writing-for-agents` names a router skill as the cure for piled-up user-invoked skills ([fork: SKILL-MECHANICS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/writing-for-agents/SKILL-MECHANICS.md)). The phase-boundary tree is harness-agnostic advice the owner can reuse.
- **Why it might not**: Its content is a map of *this* skill set; every catalog decision invalidates parts of it. The fork's `CLAUDE.md` makes keeping it current a standing rule ("a router that lies"), a maintenance cost.
- **Copy / adapt / idea-only**: Adapt. Its structure (main flow, on-ramps, standalone, vocabulary underneath, phase boundaries) can be reused; the skill list must be rewritten for the decided catalog, and the Unity section moves to wherever the Unity pack's router lives. Cannot copy directly because it names fork skills the owner may drop and the name `ask-matt` is upstream's persona.
- **Overlap**: Inside the fork, `unity` is the Unity-side router. Unity baseline: pending.
- **Idle context cost**: 0 (user-invoked). Codex: unverified.
- **Recommendation (proposed)**: Adapt as the collection's router once the catalog is decided; keep `PHASE-BOUNDARIES.md` nearly as is.

### `code-review`

- **What it is**: Two-axis review of the diff since a fixed point: a **Standards** sub-agent (repo standards plus a 12-item Fowler smell baseline) and a **Spec** sub-agent (the originating issue), run in parallel and reported side by side without reranking. Fork delta: the Standards sub-agent calls the `unity` router for serialized types, asmdefs, statics and tests; Unity findings are hard only on data loss or a broken build. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/code-review/SKILL.md)
- **Kind**: skill
- **Proposed address**: core model-invoked (tension: see open question 2), or core user-invoked if `implement-spec` is changed to tell the user to run it
- **Why it could fit**: Stack-agnostic; the Unity delta covers the owner's main stack; `implement` and `implement-spec` close out with it.
- **Why it might not**: The largest description in the set (~111 tokens) for an expensive two-sub-agent workflow, which the map's Notes say should be user-invoked. It needs `docs/agents/issue-tracker.md` from setup.
- **Copy / adapt / idea-only**: Copy, possibly trimming the description. Upstream has since changed it ("search for standards files, foreground sub-agents, tracker doc", upstream `3da8c01`), so a copy from the fork takes the older version.
- **Overlap**: Inside the fork, `implement` and `implement-spec` call it; `tdd` defers refactoring to review. Unity baseline: pending.
- **Idle context cost**: ~111 tokens.
- **Recommendation (proposed)**: Take it; decide its invocation in the theme that settles expensive-workflow gating.

### `codebase-design`

- **What it is**: The deep-module vocabulary (module, interface, implementation, depth, seam, adapter, leverage, locality), principles (deletion test, "the interface is the test surface", one adapter vs two), plus `DEEPENING.md` (dependency categories, replace-don't-layer tests) and `DESIGN-IT-TWICE.md` (3+ parallel sub-agents designing radically different interfaces). Fork delta: one line routing Unity seams to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/codebase-design/SKILL.md), [DEEPENING.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/codebase-design/DEEPENING.md), [DESIGN-IT-TWICE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/codebase-design/DESIGN-IT-TWICE.md)
- **Kind**: skill (shared reference)
- **Proposed address**: core model-invoked
- **Why it could fit**: C# libraries and Unity code both benefit; `tdd`, `improve-codebase-architecture` and `setup-ts-deep-modules` call it, so it is shared reference that must be model-invoked.
- **Why it might not**: Examples are TypeScript; the owner's C# examples come only via the Unity skills.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `unity-testing` and `unity-assemblies` carry the Unity form of seams. Unity baseline: pending.
- **Idle context cost**: ~72 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `diagnosing-bugs`

- **What it is**: A six-phase loop for hard bugs: build a **tight**, **red-capable** feedback loop first (ten loop kinds, ending in a HITL bash template), reproduce and minimise, 3 to 5 falsifiable hypotheses, instrument with tagged logs, fix with a regression test at a correct seam, clean up. Fork delta: one line routing Unity loops, profiling and regression-test placement to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/diagnosing-bugs/SKILL.md), [hitl-loop.template.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh)
- **Kind**: skill (+ bash template)
- **Proposed address**: core model-invoked
- **Why it could fit**: Stack-agnostic discipline with a Unity route to `unity-debugging`'s Play loop; short description.
- **Why it might not**: Upstream has moved on ("prove a forced mutation landed before trusting the red", upstream `f3fc563`).
- **Copy / adapt / idea-only**: Copy (consider pulling the newer upstream text).
- **Overlap**: `unity-debugging` holds the Unity mechanics, not the discipline. Unity baseline: pending.
- **Idle context cost**: ~44 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `domain-modeling`

- **What it is**: The active discipline of building a project's domain model: challenge terms against `GLOSSARY.md`, sharpen fuzzy language, stress-test with scenarios, update the glossary inline, offer ADRs only when hard to reverse, surprising and a real trade-off. Ships `GLOSSARY-FORMAT.md` and `ADR-FORMAT.md`. No fork delta. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/domain-modeling/SKILL.md), [GLOSSARY-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md), [ADR-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/domain-modeling/ADR-FORMAT.md)
- **Kind**: skill
- **Proposed address**: core model-invoked
- **Why it could fit**: This collection already runs on it (its `GLOSSARY.md`, the map's Notes name it). `grill-with-docs`, `triage`, `wayfinder` and `improve-codebase-architecture` call it.
- **Why it might not**: Little; it is small and generic.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `teach` ships its own `GLOSSARY-FORMAT.md` variant. Unity baseline: pending.
- **Idle context cost**: ~43 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `grill-with-docs`

- **What it is**: A one-line wrapper: "Call the Skill tool twice, for "grilling" and "domain-modeling"". [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/grill-with-docs/SKILL.md)
- **Kind**: skill (user-invoked entry point)
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost; the main flow's first step.
- **Why it might not**: It adds nothing beyond its two calls; the owner could type `/grilling` and rely on `domain-modeling` triggering.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `grill-me` (same interview, no docs). Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take, if `grilling` and `domain-modeling` are taken.

### `implement`

- **What it is**: Six lines: implement from a spec or tickets, `/tdd` at pre-agreed seams, typecheck and single test files regularly, full suite at the end, `/code-review`, commit. Fork delta: route test cadence and "compiles or works" to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/implement/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost; the Unity delta is what makes "run the tests" meaningful in Unity.
- **Why it might not**: Thin; mostly a pointer to `tdd` and `code-review`. Upstream changed it after the merge-base (`6d6a5b9`).
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `implement-spec`. Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `implement-spec`

- **What it is**: Implements a whole spec on one **integration branch**, treating tickets as a **task graph**: implementer subagents in their own worktrees across the ready **frontier**, a merger subagent, then one `code-review` and cleanup. Fork delta: Unity parallel worktrees and integration-branch verification via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/implement-spec/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: The owner does agentic workflows; zero idle cost; the Unity delta answers the real Unity cost of worktrees (cold `Library/` imports, see `unity-verification`).
- **Why it might not**: Expensive (many subagents). It calls `code-review` and `tdd` through the Skill tool, so it pins those to model-invoked.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `implement`, the in-progress `chief-of-staff`. Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `improve-codebase-architecture`

- **What it is**: Scans for **deepening opportunities** (hotspots from git history first), renders them as a self-contained HTML report (Tailwind and Mermaid from CDNs, before/after diagrams) in the OS temp dir, then grills through the picked one. Fork delta: route "keeping asset churn out of the hotspot scan" and Unity friction signals to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/improve-codebase-architecture/SKILL.md), [HTML-REPORT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/improve-codebase-architecture/HTML-REPORT.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Periodic upkeep for the owner's C# libraries and Unity code; the Unity delta keeps `.meta`/scene churn from swamping the hotspot scan ([fork: unity-serialization SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/SKILL.md), "Hotspot scans").
- **Why it might not**: The HTML report relies on two CDNs and `start`/`open` to view it; *inference*: this collection's harness can also publish pages, so the report shape may be swapped.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `codebase-design` (vocabulary). Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `pr`

- **What it is**: A PR-body template: **Summary** (the smallest visual: pseudocode, call tree, component tree, file tree, Mermaid, diff), **Evidence** (before/after), **Merge Danger** (one-way or two-way door, blast radius). The visuals menu is credited to Dex Horthy's `show-me`. Fork delta: Unity Game/Scene capture and test results via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/pr/SKILL.md), [CREDITS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/pr/CREDITS.md)
- **Kind**: skill
- **Proposed address**: core model-invoked
- **Why it could fit**: The cheapest description in the set (~13 tokens) for something the agent should apply on its own whenever it writes a PR.
- **Why it might not**: Conflicts with any repo's own PR template; the owner's global `CLAUDE.md` already governs PR titles.
- **Copy / adapt / idea-only**: Copy (keep `CREDITS.md`).
- **Overlap**: Unity baseline: pending.
- **Idle context cost**: ~13 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `prototype`

- **What it is**: Throwaway code that answers one design question, in two branches: `LOGIC.md` (a single shareable HTML file with a pure, liftable logic module, free-play buttons and tabbed walkthroughs) and `UI.md` (several structurally different variants on one route behind `?variant=` and a floating switcher). Captured on a throwaway branch as a primary source. Fork delta: route Unity prototypes to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/SKILL.md), [LOGIC.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/LOGIC.md), [UI.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/UI.md)
- **Kind**: skill
- **Proposed address**: core model-invoked
- **Why it could fit**: Web apps and Unity both covered (Unity through `unity-prototyping`); `wayfinder` prototype tickets call it.
- **Why it might not**: `UI.md` is React/Next-flavoured; the logic HTML branch does not lift into C# (as `unity-prototyping` itself says).
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `unity-prototyping`. Unity baseline: pending.
- **Idle context cost**: ~50 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `research`

- **What it is**: Spin up a background agent to investigate against primary sources and write one cited Markdown file where the repo keeps such notes. No fork delta. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/research/SKILL.md)
- **Kind**: skill
- **Proposed address**: core model-invoked (tension: expensive; see open question 2)
- **Why it could fit**: This very ledger runs on it; `wayfinder` research tickets call it through the Skill tool.
- **Why it might not**: Launches a background agent: expensive. Very thin body; the discipline (pin SHAs, mark inference) lives in each caller's prompt instead.
- **Copy / adapt / idea-only**: Copy; *inference*: worth adding the pin-and-mark-inference rules this map's Notes impose.
- **Overlap**: Unity baseline: pending.
- **Idle context cost**: ~65 tokens.
- **Recommendation (proposed)**: Take; settle invocation with `code-review`.

### `retro`

- **What it is**: A retrospective that suggests changes to the agent's **environment**, not the code: navigation pointers, automated checks (mechanical violations get a deterministic check, judgement calls go to `CODING_STANDARDS.md`), steering files, tool economy, no-ops, information access. Fork delta: Unity environment gaps (unvalidated rungs, missing Unity config, no test assembly, editor without `com.unity.pipeline`) via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/retro/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost; directly serves maintaining a skill collection and its steering files.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: The prior comparison research proposes folding pstack's `correct` into a personal extension of `retro` (local `research/2026-10-09-skill-collection-comparison.md`, uncommitted). Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `setup-matt-pocock-skills`

- **What it is**: Prompt-driven per-repo setup: writes the `## Agent skills` block and `docs/agents/issue-tracker.md` (GitHub, GitLab, local `.scratch/`, or freeform), `triage-labels.md` (only when `triage` is installed), `domain.md`. Fork delta: Section D writes the **Unity config** `docs/agents/unity.md` (only fields that differ from each Unity skill's default; always asks the prototype folder; optional Unity involvement classification). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/setup-matt-pocock-skills/SKILL.md), [unity-setup.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/setup-matt-pocock-skills/unity-setup.md), [unity.md seed](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/setup-matt-pocock-skills/unity.md), [issue-tracker-github.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md)
- **Kind**: skill (+ seed templates)
- **Proposed address**: core user-invoked; the Unity section could move to a Unity pack user-invoked setup (*inference*: a pack-local setup keeps Unity seeds out of non-Unity repos)
- **Why it could fit**: This repo was set up by it (its `AGENTS.md` and `docs/agents/`). Hard dependency of `to-spec`, `to-tickets`, `triage`, `wayfinder`, `code-review`, `implement-spec` ([fork: ADR 0001](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md)).
- **Why it might not**: The name is upstream's; the GitLab template is dead weight for the owner. Upstream fixed tracker commands after the merge-base (`5b7cade`).
- **Copy / adapt / idea-only**: Adapt: rename for the collection, drop unused tracker seeds, decide where the Unity section lives. Cannot copy as is because the name is referenced by every hard-dependency skill's pointer line, which would need renaming in step.
- **Overlap**: The `unity` router reads its output. Unity baseline: pending (*inference*: the baseline may ship its own project config).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Adapt.

### `tdd`

- **What it is**: The red-green reference: good tests verify behaviour through public interfaces, test only at pre-agreed **seams**, anti-patterns (implementation-coupled, tautological, horizontal slicing), one vertical slice per cycle, refactoring belongs to review. `tests.md` and `mocking.md` hold TS examples. Fork delta: route Unity test writing, setup, choice and cadence to the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/tdd/SKILL.md), [tests.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/tdd/tests.md), [mocking.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/tdd/mocking.md)
- **Kind**: skill
- **Proposed address**: core model-invoked
- **Why it could fit**: C# libraries and Unity both; `unity-testing/EXAMPLES.md` already supplies the C# counterparts.
- **Why it might not**: TS-only examples in core (*inference*: a C# library owner may want C# examples outside Unity too).
- **Copy / adapt / idea-only**: Copy; optionally adapt examples to C#.
- **Overlap**: `unity-testing`. Unity baseline: pending.
- **Idle context cost**: ~43 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `to-spec`

- **What it is**: Synthesises the conversation into a spec (problem, solution, long user-story list, implementation and testing decisions, out of scope) without interviewing, sketches test seams first, publishes it to the tracker with `ready-for-agent`. Fork delta: Unity test seams via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/to-spec/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: The map's Destination hands off to `/to-spec`.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `to-tickets`

- **What it is**: Splits a plan into **tracer-bullet** vertical-slice tickets with **blocking edges**, quizzes the user on granularity, publishes as local files or native blocking links; wide refactors go **expand-contract**. Fork delta: Unity slicing (shared scene or prefab tickets block each other, editor or human work, serialized renames as expand-contract) and Unity involvement via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/to-tickets/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: The map's Destination names it; the Unity delta encodes real Unity merge pain.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `triage`

- **What it is**: Moves issues (and optionally external PRs) through category and state roles, verifies claims, grills when needed, writes **agent briefs** (`AGENT-BRIEF.md`) and records rejected enhancements in `.out-of-scope/` (`OUT-OF-SCOPE.md`). Every tracker comment carries an AI disclaimer. Fork delta: Unity involvement classification via the router. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/triage/SKILL.md), [AGENT-BRIEF.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/triage/AGENT-BRIEF.md), [OUT-OF-SCOPE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/triage/OUT-OF-SCOPE.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost; this repo already has its labels configured (`AGENTS.md`).
- **Why it might not**: Built for maintainers receiving outside issues and PRs; a solo owner creates most of their own issues, which `to-tickets` already makes agent-ready ("don't triage them", [ask-matt](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/ask-matt/SKILL.md)). `AGENT-BRIEF.md` is useful standalone.
- **Copy / adapt / idea-only**: Copy if taken; otherwise idea-only for the agent-brief format.
- **Overlap**: `.out-of-scope/` mechanism entry below. Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Owner's call on whether solo work needs it; lean take (zero idle cost), low priority.

### `wayfinder`

- **What it is**: Plans an effort too big for one session as a **map** issue of **decision tickets** (research, prototype, grilling, task), with fog of war, out of scope, native blocking, frontier, one ticket per session (research excepted). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/wayfinder/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: This collection's blueprint is a wayfinder map (issue 1).
- **Why it might not**: Upstream has since changed it ("no triage labels, no placeholder refs, no research PRs", `8295b8e`).
- **Copy / adapt / idea-only**: Copy (consider the newer upstream text).
- **Overlap**: Unity baseline: pending.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `wizard`

- **What it is**: Generates an interactive bash script that walks a human through steps only they can perform (provisioning, credentials, CI secrets, a migration), on top of a fixed `template.sh` library (stages, `open_url` incl. WSL, hidden secret entry, idempotent `.env` upserts, `gh secret`/`gh variable`). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/wizard/SKILL.md), [template.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/wizard/template.sh)
- **Kind**: skill (+ bash template)
- **Proposed address**: core user-invoked, or a web pack
- **Why it could fit**: Web apps and CI setup are part of the owner's work.
- **Why it might not**: ~84 tokens of description for an occasional need; its example is `.env`/Stripe-shaped, far from Unity and C# libraries.
- **Copy / adapt / idea-only**: Copy; demoting to user-invoked means flipping the frontmatter and `openai.yaml` and rewriting the description as human-facing.
- **Overlap**: `diagnosing-bugs`' HITL template is the same idea, smaller. Unity baseline: pending.
- **Idle context cost**: ~84 tokens as model-invoked; 0 if demoted.
- **Recommendation (proposed)**: Take as user-invoked (not model-invoked), or leave out.

## Productivity skills

### `grill-me`

- **What it is**: One line: "Call the Skill tool with "grilling"". The stateless entry point when no repo is under the work. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/grill-me/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost.
- **Why it might not**: Redundant if `grilling` is model-invoked and triggers on "grill".
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `grill-with-docs`, `grilling`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Optional; drop unless the owner wants a typed entry point.

### `grilling`

- **What it is**: The interview primitive: a design tree worked in rounds, each round the whole **frontier** with a recommended answer per question; facts are the agent's job (sub-agents), decisions are the user's. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/grilling/SKILL.md)
- **Kind**: skill
- **Proposed address**: core model-invoked
- **Why it could fit**: The map's HITL sessions name it; `grill-with-docs`, `triage`, `wayfinder`, `improve-codebase-architecture`, `loop-me` call it.
- **Why it might not**: Upstream refined its wording after the merge-base (`95249b0`).
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `.out-of-scope/question-limits.md` records why it has no question cap.
- **Idle context cost**: ~43 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

### `handoff`

- **What it is**: Compacts the conversation into a handoff document in the OS temp dir, with a "suggested skills" section, referencing artifacts instead of duplicating them, redacting secrets. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/handoff/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Claude Code to Codex hand-offs are part of the owner's harness story; `PHASE-BOUNDARIES.md` names a new harness as its main use.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `claude-handoff` (in-progress).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `teach`

- **What it is**: A multi-session teaching workspace in the current directory: `MISSION.md`, `RESOURCES.md`, learning records (ADR-like), HTML lessons and reference docs, shared assets; built on knowledge/skills/wisdom, retrieval practice and the zone of proximal development. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/teach/SKILL.md), [MISSION-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/teach/MISSION-FORMAT.md), [LEARNING-RECORD-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/teach/LEARNING-RECORD-FORMAT.md), [RESOURCES-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/teach/RESOURCES-FORMAT.md), [GLOSSARY-FORMAT.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/teach/GLOSSARY-FORMAT.md)
- **Kind**: skill
- **Proposed address**: core user-invoked, or out
- **Why it could fit**: Zero idle cost; useful when picking up a new engine area or language.
- **Why it might not**: Not engineering work; the ticket itself asks whether it belongs. Upstream changed it after the merge-base (`ad5400b`).
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `domain-modeling` (glossary format).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Owner's call; costs nothing idle, so the question is only catalog clutter.

### `to-questionnaire`

- **What it is**: Turns a decision the user can't answer alone into a Markdown questionnaire for one recipient; it grills the user only about the *send* (who, what back), then writes `to-questionnaire-<slug>.md`. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/to-questionnaire/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked, or out
- **Why it could fit**: Zero idle cost.
- **Why it might not**: A solo dev rarely has a recipient; *inference*: most useful for client or collaborator work.
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `grilling` (inverse).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Low priority; owner's call.

### `wait-what`

- **What it is**: One paragraph: re-pitch the last message with context, in ASD-STE100 Simplified Technical English, using `GLOSSARY.md`'s language. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/wait-what/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost, tiny.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: none.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Take.

### `writing-for-agents`

- **What it is**: The reference for writing anything an agent consumes: **context pointers**, the two loads (context vs cognitive), the information hierarchy and progressive disclosure, completion criteria, when to split, **leading words**, negation, pruning (single source of truth, caches, sediment, no-ops); `SKILL-MECHANICS.md` covers invocation choice and router skills. Fork delta: one description edit (triggers on any doc reached by a pointer). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/writing-for-agents/SKILL.md), [SKILL-MECHANICS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/writing-for-agents/SKILL-MECHANICS.md)
- **Kind**: skill (shared reference)
- **Proposed address**: core model-invoked
- **Why it could fit**: The collection *is* a body of agent-facing docs; the map's Notes name it for skill-shape decisions, and its "idle context is a budget" framing is this map's own.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy (the fork's description edit is an improvement over upstream's).
- **Overlap**: `retro` calls it.
- **Idle context cost**: ~55 tokens.
- **Recommendation (proposed)**: Take as core model-invoked.

## Unity skills

All eight are model-invoked, so the agent and the delta lines can reach them ([fork: skills/unity/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/README.md)). Each is backed by a cited research file in `research/` (mechanism entry below) and checked in `unity-sandbox/` before stating a mechanic as fact ([fork: CLAUDE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CLAUDE.md)). They lean on the `unity` CLI and `com.unity.pipeline`, and defer CLI syntax to "the Unity CLI's own skill" (`unity skill show`). **Overlap with the Unity baseline is pending for all eight**; *inference*: because they already defer CLI mechanics to Unity's own skill, the overlap most likely sits in `unity-verification` and `unity-debugging`, the two that drive the CLI.

### `unity` (router)

- **What it is**: The Unity entry point: detects a Unity project or UPM package (config path, root, then a glob skipping `Library/` etc.), reads the **Unity config** `docs/agents/unity.md`, routes a **need** through a 36-row needs table to the Unity skills or the CLI's own skill, finds version-matched docs (`unity docs --url`, or a hand-built URL), and names any uncovered need. Holds no mechanics itself. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity/SKILL.md)
- **Kind**: skill (router)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: The one seam every core delta line calls; "Not a Unity repo." lets a calling skill carry on unchanged.
- **Why it might not**: If the pack is not installed in a repo, a core delta line's Skill tool call has nothing to reach (*inference*: the line is conditional on "In a Unity repo", so it should only fire where the pack is installed, but that pairing is unverified).
- **Copy / adapt / idea-only**: Copy; the setup pointer (`/setup-matt-pocock-skills`) must follow any rename of setup.
- **Overlap**: `ask-matt`'s Unity section. Unity baseline: pending.
- **Idle context cost**: ~51 tokens.
- **Recommendation (proposed)**: Take as the Unity pack's entry point.

### `unity-verification`

- **What it is**: The **Verification ladder** (text checks, compile, targeted tests, full EditMode, PlayMode, player build, CI) with the rung rule; environments in order (connected editor via Pipeline, headless CLI, neither); hard rules (never close the user's editor, never batch against a held project, leave licences alone); warm `Library/` copies for new worktrees; result reading where exit codes lie; a fixed report (ran, skipped, unvalidated, manual checks); ticket slicing and optional Unity involvement classification. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-verification/SKILL.md), [ENVIRONMENTS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-verification/ENVIRONMENTS.md), [READING-RESULTS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-verification/READING-RESULTS.md), [RUNNING-CSHARP.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-verification/RUNNING-CSHARP.md), [ISSUE-CLASSIFICATION.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-verification/ISSUE-CLASSIFICATION.md)
- **Kind**: skill
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: The highest-value Unity skill for agent work: it encodes observed traps (`unity test` exits 0 on a zero-test filter; connected `run_tests` exits 0 on failures; concurrent cold imports crashed a 15 GB machine).
- **Why it might not**: Tied to a beta CLI that "moves every few weeks" (its own words), so it needs active upkeep; most likely overlap with the Unity baseline.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: Every other Unity skill calls it to run checks. Unity baseline: pending (likely high, *inference*).
- **Idle context cost**: ~71 tokens.
- **Recommendation (proposed)**: Take, pending the baseline comparison.

### `unity-assemblies`

- **What it is**: Assembly and compilation rules: asmdef layout is the user's call (propose, never make); the traps (no asmdef means `Assembly-CSharp`; asmdef code never sees it; nested `Editor` folders swallowed; `UnityEditor` breaking the Player build; silent dropped references); `GUID:` references with a hand-written `.meta`; `versionDefines`; seams at assembly boundaries; text checks via `asmdefs.sh`. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-assemblies/SKILL.md), [ASMDEF.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-assemblies/ASMDEF.md), [ANALYZERS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-assemblies/ANALYZERS.md), [asmdefs.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-assemblies/scripts/asmdefs.sh)
- **Kind**: skill (+ bash script)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: The owner writes Unity code and C# libraries (UPM packages are covered); assembly mistakes break builds silently.
- **Why it might not**: The largest Unity description (~84 tokens).
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `unity-testing` (test asmdefs), `unity-serialization` (script moves). Unity baseline: pending.
- **Idle context cost**: ~84 tokens.
- **Recommendation (proposed)**: Take.

### `unity-serialization`

- **What it is**: Identity (the `.meta` GUID is the asset; scripts are assets; file-scoped namespaces break `m_Script`), renames (`FormerlySerializedAs`, `MovedFrom`, enums), an expand-then-contract reserialize follow-up scoped by `SerializationScope.cs` or `scope.sh`, editing order (Editor, scripted API, surgical text), validation, reviewing serialized diffs, Unity merge conflicts (`MERGING.md`: pause never abort, UnityYAMLMerge by hand, merged-result checks). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/SKILL.md), [MERGING.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/MERGING.md), [PREFABS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/PREFABS.md), [UNITYYAML.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/UNITYYAML.md), [WHAT-SERIALIZES.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/WHAT-SERIALIZES.md), [SerializationScope.cs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/scripts/SerializationScope.cs), [scope.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-serialization/scripts/scope.sh)
- **Kind**: skill (+ C# and bash scripts)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: Silent data loss on renames and merges is the most expensive class of agent mistake in Unity; the merge material replaces upstream's removed `resolving-merge-conflicts` for Unity assets ([fork: CHANGELOG.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CHANGELOG.md), 1.1.0).
- **Why it might not**: Large (SKILL.md ~1,660 words plus ~3,000 words of references), but disclosed behind pointers, so it costs nothing until it fires.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `unity-assemblies` (moves), `unity-prototyping` (GUID grep). Unity baseline: pending.
- **Idle context cost**: ~63 tokens.
- **Recommendation (proposed)**: Take.

### `unity-testing`

- **What it is**: Mode rule (EditMode `[Test]` by default, PlayMode only when the engine must run), the **humble MonoBehaviour**, the engine behind the repo's own port, EditMode traps (no lifecycle, `DestroyImmediate`, error logs fail tests, cleanup), statics as if domain reload is off, run cadence per environment, seam sketching for specs, test-assembly templates, `[UnityTest]`/async/scene tests, C# versions of `tdd`'s examples. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-testing/SKILL.md), [ASSEMBLIES.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-testing/ASSEMBLIES.md), [UNITYTEST.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-testing/UNITYTEST.md), [EXAMPLES.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-testing/EXAMPLES.md)
- **Kind**: skill
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: Makes `tdd` work in Unity; the C# examples are the only C# test examples in the fork.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `tdd`, `unity-verification`. Unity baseline: pending.
- **Idle context cost**: ~61 tokens.
- **Recommendation (proposed)**: Take.

### `unity-code-lifecycle`

- **What it is**: Build every static as if domain reload is off; pick the API by version (6.5+ lifecycle attributes and `[AutoStaticsCleanup]`, else `SubsystemRegistration`/`InitializeOnEnterPlayMode`) and the module's existing pattern; reset rules and traps (`static readonly` without `Clear()` silently disables the generator for the whole assembly, `CS8785`); singletons and static events; load-code hazards (import workers). `LIFECYCLE.md` has observed callback orders. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-code-lifecycle/SKILL.md), [LIFECYCLE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-code-lifecycle/LIFECYCLE.md)
- **Kind**: skill
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: Unity 6.6 ships with domain reload off by default (per the skill), so second-Play bugs become the norm.
- **Why it might not**: Version-sensitive (6.5/6.6 APIs), so it ages fast.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `unity-testing` (statics in tests), `unity-debugging` (second-Play class). Unity baseline: pending.
- **Idle context cost**: ~63 tokens.
- **Recommendation (proposed)**: Take.

### `unity-prototyping`

- **What it is**: The Unity side of `prototype`: in the engine by default; each prototype in `<prototype folder>/<name>/` (self-ignoring by default) with an asmdef of `autoReferenced: false` and `defineConstraints: ["UNITY_EDITOR"]`; prototype scene with the host scene additive and never saved; one `Prototypes/<name>` menu item; EditorWindow logic driver; runtime variant switcher; capture and removal behind a GUID grep. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-prototyping/SKILL.md), [TEMPLATES.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-prototyping/TEMPLATES.md)
- **Kind**: skill
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: Game feel and UI questions are common in Unity work and need the engine.
- **Why it might not**: Narrower trigger than the others; *inference*: could become disclosed reference reached only through `prototype`'s delta line, if the pack shrinks to fewer model-invoked skills.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `prototype`, `unity-debugging` (repro folders reuse the prototype folder). Unity baseline: pending.
- **Idle context cost**: ~66 tokens.
- **Recommendation (proposed)**: Take, or fold behind the router (owner decides pack shape).

### `unity-debugging`

- **What it is**: Unity forms of the ten feedback-loop kinds; a tested `play-loop.sh` that enters Play, waits on a `DONE` flag, greps the console since a cursor, and runs twice when domain reload is off to catch second-Play bugs (exit 3); `runInBackground` and frame-stepping fallbacks; `eval`/`run_script` as the REPL; a bug-class table routing to siblings; IDE debugger as a human step; players, logs and Development Builds; baseline-first performance. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-debugging/SKILL.md), [SYMPTOMS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-debugging/SYMPTOMS.md), [PLAYERS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-debugging/PLAYERS.md), [DEBUGGER.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-debugging/DEBUGGER.md), [play-loop.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-debugging/scripts/play-loop.sh)
- **Kind**: skill (+ bash script)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**: Turns `diagnosing-bugs`' "tight red loop" into something an agent can run in Unity without a human.
- **Why it might not**: Depends on Pipeline commands (`editor_play`, `wait_for`, `console`) that may shift; it even points at Unity's own Play-mode verification loop recipe (`unity skill show --path references/playmode-verification-loop.md`), a sign of overlap with Unity's own material.
- **Copy / adapt / idea-only**: Copy.
- **Overlap**: `diagnosing-bugs`, `unity-verification`. Unity baseline: pending (likely real, *inference*).
- **Idle context cost**: ~53 tokens.
- **Recommendation (proposed)**: Take, pending the baseline comparison.

## In-progress skills

All seven are user-invoked, excluded from the plugin, and "can change or disappear without warning" ([fork: skills/in-progress/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/README.md)). None carries a fork delta.

### `chief-of-staff`

- **What it is**: A 167-word stance: one long-running session pursues a goal by coordinating subagents and schedules, owns the strategic view, communicates through context pointers, gardens the environment. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/chief-of-staff/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked, or idea-only
- **Why it could fit**: Agentic workflows are part of the owner's work.
- **Why it might not**: Thin: no steps, no completion criterion; "schedules" depend on the harness.
- **Copy / adapt / idea-only**: Idea-only; its pointer-based subagent communication already appears in `implement-spec`.
- **Overlap**: `implement-spec`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Idea-only for now.

### `claude-handoff`

- **What it is**: `handoff`, but instead of saving the summary it launches `claude --bg --name "<name>" "<summary>"`, a fresh background agent. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/claude-handoff/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: Zero idle cost; Claude Code is the owner's first harness.
- **Why it might not**: Claude Code only (the `claude --bg` flag), so no Codex parity; duplicates most of `handoff`.
- **Copy / adapt / idea-only**: Adapt, possibly as an option inside `handoff` rather than a sibling.
- **Overlap**: `handoff`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Owner's call: merge into `handoff` or drop.

### `loop-me`

- **What it is**: A stateful grilling session whose only output is **workflow** specs (`workflows/*.md`) for recurring **loops** in the user's life, with a vocabulary (trigger, checkpoint, push right, brief) and "done when an implementer agent could build it without asking a single question". [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/loop-me/SKILL.md)
- **Kind**: skill
- **Proposed address**: core user-invoked
- **Why it could fit**: The owner builds agentic workflows; zero idle cost.
- **Why it might not**: Beta; overlaps with general grilling.
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `grilling`, `teach` (stateful workspace pattern).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Owner's call; plausible fit for the agentic-workflow slice.

### `setup-ts-deep-modules`

- **What it is**: Wires dependency-cruiser into a TypeScript repo so each package is a deep module (root files are entry points, subfolders private, tests through entry points, no cycles), scaffolds an example package, and proves the rules bite (pass, fail on a deep import, pass). Ships the config. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/setup-ts-deep-modules/SKILL.md), [dependency-cruiser.config.cjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/setup-ts-deep-modules/dependency-cruiser.config.cjs)
- **Kind**: skill (+ config)
- **Proposed address**: web pack user-invoked
- **Why it could fit**: Web apps are part of the owner's work; the "prove the rules bite" step is a strong pattern.
- **Why it might not**: TypeScript only; *inference*: the C# analogue (assembly boundaries) is already `unity-assemblies`' and `InternalsVisibleTo`.
- **Copy / adapt / idea-only**: Copy into a web pack if one exists; the "prove it bites" pattern is idea-only for a C# version.
- **Overlap**: `codebase-design`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Web pack candidate; otherwise out.

### `writing-beats`

- **What it is**: Writing, exploit: build an article as a choose-your-own-adventure of **beats**, each grounded only on concepts already **grounded**, one beat written at a time. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/writing-beats/SKILL.md)
- **Kind**: skill
- **Proposed address**: a writing pack user-invoked, or out
- **Why it could fit**: Zero idle cost.
- **Why it might not**: Article writing is not in the owner's stated work.
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `writing-shape` (same job, different method), `writing-fragments`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Out unless the owner writes articles; decide the three `writing-*` skills together.

### `writing-fragments`

- **What it is**: Writing, explore: a grilling session that appends raw **fragments** (separated by `---`) to one file, prizing a **leading word**. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/writing-fragments/SKILL.md)
- **Kind**: skill
- **Proposed address**: a writing pack user-invoked, or out
- **Why it could fit**: Zero idle cost.
- **Why it might not**: As above.
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `writing-beats`, `writing-shape`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Same as `writing-beats`.

### `writing-shape`

- **What it is**: Writing, exploit: shape a raw-material file into an article paragraph by paragraph, arguing format choices (prose vs list, callout, table) with grounding. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/in-progress/writing-shape/SKILL.md)
- **Kind**: skill
- **Proposed address**: a writing pack user-invoked, or out
- **Why it could fit**: Zero idle cost.
- **Why it might not**: As above; competes with `writing-beats`.
- **Copy / adapt / idea-only**: Copy if kept.
- **Overlap**: `writing-beats`, `writing-fragments`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Same as `writing-beats`.

## Misc skills

`misc/` is "kept around but rarely used, not promoted" and skipped by `link-skills.sh` ([fork: skills/misc/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/README.md)). All four are model-invoked, so installing any of them would cost idle context.

### `git-guardrails-claude-code`

- **What it is**: Installs a Claude Code `PreToolUse` hook on `Bash` (project or user scope) running `block-dangerous-git.sh`, which greps the command for patterns such as `git push`, `reset --hard`, `clean -f`, `branch -D` and exits 2 with a BLOCKED message. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/git-guardrails-claude-code/SKILL.md), [block-dangerous-git.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh)
- **Kind**: skill that installs a hook
- **Proposed address**: idea-only for a core always-on hook (the hook itself, not the installer skill)
- **Why it could fit**: A real always-on safety mechanism; the hook costs no context.
- **Why it might not**: The script needs `jq` and bash (a Windows-first owner); its substring grep also blocks harmless commands that mention the pattern (*inference*: e.g. `echo "git push"`). It blocks `git push` outright, which an AFK agent workflow may need. Claude Code only.
- **Copy / adapt / idea-only**: Idea-only; the hook would need rewriting for Windows and a narrower match.
- **Overlap**: none in the fork.
- **Idle context cost**: ~66 tokens as a model-invoked skill; 0 as a plain hook.
- **Recommendation (proposed)**: Do not take the skill; consider a hook in the always-on theme.

### `migrate-to-shoehorn`

- **What it is**: Migrates TypeScript test `as` assertions to `@total-typescript/shoehorn` (`fromPartial`, `fromAny`, `fromExact`). [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/migrate-to-shoehorn/SKILL.md)
- **Kind**: skill
- **Proposed address**: out (or a web pack, user-invoked)
- **Why it could fit**: Only for TS test suites.
- **Why it might not**: One library, one migration; far from the owner's main stacks.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none.
- **Idle context cost**: ~47 tokens.
- **Recommendation (proposed)**: Reject.

### `scaffold-exercises`

- **What it is**: Scaffolds course exercise folders that pass `pnpm ai-hero-cli internal lint`. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/scaffold-exercises/SKILL.md)
- **Kind**: skill
- **Proposed address**: out
- **Why it could fit**: No fit.
- **Why it might not**: Specific to upstream's course tooling.
- **Copy / adapt / idea-only**: n/a.
- **Overlap**: none.
- **Idle context cost**: ~56 tokens.
- **Recommendation (proposed)**: Reject.

### `setup-pre-commit`

- **What it is**: Sets up Husky, lint-staged with Prettier, typecheck and test in a pre-commit hook for a JS/TS repo, then commits as a smoke test. [fork: SKILL.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/misc/setup-pre-commit/SKILL.md)
- **Kind**: skill
- **Proposed address**: web pack user-invoked, or out
- **Why it could fit**: `retro` treats a repo with no guardrail as a finding; this is one remedy for web repos.
- **Why it might not**: JS/TS only; nothing for C# or Unity repos.
- **Copy / adapt / idea-only**: Copy into a web pack if one exists, demoted to user-invoked.
- **Overlap**: `retro` (guardrail finding).
- **Idle context cost**: ~65 tokens as model-invoked; 0 if demoted.
- **Recommendation (proposed)**: Out, or web pack user-invoked.

## Deprecated bucket

### `deprecated/` (empty)

- **What it is**: The bucket holds only a README: "a retired skill is deleted, and the changeset that removes it names whatever replaced it." The one removed promoted skill, `resolving-merge-conflicts`, survives only as an archived docs page. [fork: skills/deprecated/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/deprecated/README.md), [fork: docs/engineering/resolving-merge-conflicts.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/docs/engineering/resolving-merge-conflicts.md)
- **Kind**: convention
- **Proposed address**: n/a
- **Why it could fit**: The "delete, name the replacement in the changeset" rule is a clean retirement policy.
- **Why it might not**: Nothing to take.
- **Copy / adapt / idea-only**: Idea-only (retirement policy).
- **Overlap**: The Unity half of the removed skill lives on in `unity-serialization/MERGING.md`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Nothing to adopt; consider the retirement rule.

---

## Mechanisms

### Changesets versioning and the release workflow

- **What it is**: `@changesets/cli` with GitHub changelogs; fork changesets are named `unity-*.md` so upstream's never mix in. `npm run version` runs `changeset version`, then `sync-plugin-version.mjs` (copies `package.json`'s version into `plugin.json`) and `hoist-changelog-note.mjs` (moves the changelog's note back under the title). `release.yml` opens a "chore: version skills" PR via `changesets/action`; on merge, `tag-release.mjs` tags `unity-v<version>` (avoiding upstream's `v1.x`) and creates the GitHub Release. [fork: package.json](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/package.json), [.changeset/config.json](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.changeset/config.json), [release.yml](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.github/workflows/release.yml), [sync-plugin-version.mjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/sync-plugin-version.mjs), [hoist-changelog-note.mjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/hoist-changelog-note.mjs), [tag-release.mjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/tag-release.mjs)
- **Kind**: CI-eval / manifest-packaging (release automation)
- **Proposed address**: repo maintenance mechanism (not installed anywhere)
- **Why it could fit**: Plugin installs only see an update when `plugin.json`'s `version` moves ([fork: ADR 0002](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/adr/0002-ship-as-a-claude-code-plugin.md), "Invariants"), so any plugin-based install needs version bumps.
- **Why it might not**: Heavy for one owner; the `unity-` prefix and tag workaround exist only because of the upstream relationship. Several packs (if each is a plugin) would need per-plugin versions, which a single-package changesets setup does not express (*inference*).
- **Copy / adapt / idea-only**: Adapt: drop the `unity-` naming, decide single vs per-pack versions; `sync-plugin-version` and `tag-release` are reusable as is.
- **Overlap**: `check.mjs` runs `check-plugin-version`.
- **Idle context cost**: 0 (not agent-facing).
- **Recommendation (proposed)**: Decide after the install architecture; adapt only if the collection ships as versioned plugins.

### `scripts/check.mjs` and the Check workflow

- **What it is**: `npm run check` enforces the mechanical `CLAUDE.md` rules over tracked and untracked files: no em-dashes; changesets named `unity-*.md`; every promoted skill linked from the top README, its bucket README and `plugin.json`, with a docs page for `engineering/` and `productivity/`; non-promoted skills never listed. Then runs `check-plugin-version` and (if `claude` is on PATH) `validate-plugin`. `check.yml` runs it on every PR with a pinned Claude Code CLI (`2.1.289`). [fork: check.mjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/check.mjs), [check.yml](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.github/workflows/check.yml)
- **Kind**: script + CI-eval
- **Proposed address**: repo maintenance mechanism
- **Why it could fit**: The `retro` rule made concrete (mechanical rules get a deterministic check); the collection will have its own invariants (every core skill in the core manifest, every pack skill in its pack, user-invoked frontmatter matching `openai.yaml`).
- **Why it might not**: Every current rule is fork-specific.
- **Copy / adapt / idea-only**: Adapt: keep the shape (one file, one line per violation, skip `validate-plugin` without the CLI), rewrite the rules. *Inference*: a natural new rule is checking that `disable-model-invocation` and `policy.allow_implicit_invocation` agree, which the fork states as a rule in `.agents/invocation.md` but does not check.
- **Overlap**: `validate-plugin`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Adapt.

### `validate-plugin`

- **What it is**: Runs `claude plugin validate . --json` and fails on any error or warning (strict), except the expected root `CLAUDE.md`/`CLAUDE.local.md` warnings, since the manifest has no field to exclude a file. [fork: validate-plugin.mjs](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/validate-plugin.mjs)
- **Kind**: script
- **Proposed address**: repo maintenance mechanism
- **Why it could fit**: Any Claude Code plugin packaging of core or packs benefits.
- **Why it might not**: Only matters if the collection ships plugins; Claude Code only (no Codex equivalent found in the fork).
- **Copy / adapt / idea-only**: Copy (adjust the allowed-warnings regex, run per plugin directory if packs become separate plugins).
- **Overlap**: `check.mjs`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Copy if plugins are chosen.

### `scripts/link-skills.sh` (and `list-skills.sh`)

- **What it is**: Dev-only script that symlinks every skill outside `deprecated/` and `misc/` (so `in-progress/` and `unity/` included) into `~/.claude/skills` and `~/.agents/skills`, prunes links to removed or demoted skills, refuses when a destination is itself a symlink into the repo, and forces native symlinks on Git Bash (`MSYS=winsymlinks:nativestrict`). `list-skills.sh` lists every `SKILL.md`. [fork: link-skills.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/link-skills.sh), [list-skills.sh](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/scripts/list-skills.sh)
- **Kind**: script (install)
- **Proposed address**: install mechanism for core (user scope); a pack needs a per-project variant
- **Why it could fit**: Live-editing installs (a `git pull` updates everything) suit a personal collection; Windows symlink handling is already solved; one script serves Claude Code and Codex (`~/.agents/skills`).
- **Why it might not**: It installs everything at user scope, which is the opposite of a pack; this is how Unity descriptions currently cost idle context in every repo (map's "Migrating the current setup"). ADR 0002 notes Codex drops symlinks when it copies a *plugin*; that concern is plugins, not `~/.agents/skills` links.
- **Copy / adapt / idea-only**: Adapt: split into "link core to user scope" and "link a pack into a project's `.claude/skills` and `.agents/skills`" (*inference*: project-scope skill directories exist for both harnesses; not verified in this ledger).
- **Overlap**: plugin manifests (the managed alternative).
- **Idle context cost**: 0 itself; decides everyone else's.
- **Recommendation (proposed)**: Adapt as one candidate install route; weigh against plugins in the install-architecture theme.

### Upstream-sync runbook

- **What it is**: How to merge `mattpocock/skills` into the fork: a dated sync branch, always a merge commit, fixed rules for upstream's changesets (delete), `CHANGELOG.md` and versions (ours), `package-lock.json` (regenerate), every other conflict traced to both intents with each Unity delta kept; then check `git diff upstream/main -- skills/ docs/` shows only Unity deltas, re-sync `ask-matt`, re-link, validate, add one `unity-upstream-sync-<date>` changeset. [fork: .agents/upstream-sync.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/upstream-sync.md)
- **Kind**: convention doc
- **Proposed address**: stays with the fork
- **Why it could fit**: If the collection tracks the fork (or any source) as an **upstream** in the glossary's sense, the same discipline applies.
- **Why it might not**: The glossary reserves "upstream" for a source the collection tracks and merges from; copying skills once makes this moot. Its rules are fork-specific.
- **Copy / adapt / idea-only**: Idea-only for the collection, unless the relationship ticket chooses to track the fork.
- **Overlap**: The 40-commit lag above shows the runbook's cadence matters.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Leave with the fork; revisit with the fork-relationship ticket.

### `.agents/invocation.md` (invocation and skill-to-skill calls)

- **What it is**: The convention that every skill is user-invoked (`disable-model-invocation: true` plus `policy.allow_implicit_invocation: false`) or model-invoked; descriptions are human-facing or model-facing accordingly; dependencies are written as "Call the Skill tool with "<name>"" (one skill per call, "twice" for two); a user-invoked skill can never be reached by another skill, so preconditions on one are phrased as "tell the user to run". [fork: .agents/invocation.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/invocation.md)
- **Kind**: convention doc
- **Proposed address**: collection convention doc (repo-level)
- **Why it could fit**: It is the mechanics behind the glossary's model-invoked / user-invoked axis, with Codex parity built in.
- **Why it might not**: Little.
- **Copy / adapt / idea-only**: Copy, with the collection's vocabulary.
- **Overlap**: `writing-for-agents/SKILL-MECHANICS.md` (the why).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Copy.

### `agents/openai.yaml` (Codex parity)

- **What it is**: Every skill folder carries `agents/openai.yaml` with `interface.display_name` and `interface.short_description` for Codex's picker, and `policy.allow_implicit_invocation: false` for user-invoked skills. Example: [fork: grill-me/agents/openai.yaml](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/productivity/grill-me/agents/openai.yaml); rule in [.agents/invocation.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/invocation.md).
- **Kind**: manifest-packaging
- **Proposed address**: per-skill metadata, every skill
- **Why it could fit**: The map requires Codex usability; this is the fork's existing answer for invocation parity.
- **Why it might not**: Two sources of truth for one property (frontmatter and YAML), unchecked by `check.mjs`.
- **Copy / adapt / idea-only**: Copy, and add a consistency check.
- **Overlap**: invocation convention.
- **Idle context cost**: 0 (Codex: unverified whether short descriptions load).
- **Recommendation (proposed)**: Copy.

### Plugin and marketplace manifests

- **What it is**: `.claude-plugin/plugin.json` lists the 35 promoted skills as explicit paths (curating a subset of a bucketed tree); `.claude-plugin/marketplace.json` makes the repo its own marketplace `hissal` with one plugin. No Codex plugin. [fork: plugin.json](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.claude-plugin/plugin.json), [marketplace.json](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.claude-plugin/marketplace.json)
- **Kind**: manifest-packaging
- **Proposed address**: install mechanism (core and each pack)
- **Why it could fit**: The `plugins` field is an array, so one marketplace could list a core plugin and a Unity pack plugin (*inference* from the file's shape; not tested). A pack-as-plugin can be enabled per project. The map's fog item on `Hissal/agent-plugins` (delete or repurpose as the pack marketplace) hangs on this.
- **Why it might not**: Plugins are read-only bundles ([fork: .agents/install-block.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/install-block.md), "The two routes are exclusive"), which fights live editing; Codex needs a different answer (next entry).
- **Copy / adapt / idea-only**: Adapt: new names, split per core and pack.
- **Overlap**: `link-skills.sh` (the editable alternative).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Strong input to the install-architecture theme.

### ADRs (`.agents/adr/`)

- **What it is**: Two ADRs. **0001**: only hard-dependency skills (`to-tickets`, `to-spec`, `triage`) carry an explicit setup pointer; soft ones mention the glossary vaguely. **0002**: ship a Claude Code plugin, defer a Codex plugin, because `.codex-plugin/plugin.json` accepts `skills` only as a single path and Codex drops symlinks when copying a plugin; its 2026-08-05 update is upstream's (the official-marketplace listing of `mattpocock-skills`), which the fork's install block contradicts for the fork itself. [fork: 0001](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md), [fork: 0002](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/adr/0002-ship-as-a-claude-code-plugin.md)
- **Kind**: convention doc
- **Proposed address**: research input, not a collection artifact
- **Why it could fit**: 0002's Codex constraint is a primary input for "how core and packs install for Claude Code and Codex"; it suggests one promoted-only directory per Codex plugin, i.e. one directory per core and per pack (*inference*).
- **Why it might not**: 0002 is dated; the Codex behaviour it records may have changed (it says to revisit "when Codex either supports a `skills` array / include-list or preserves symlinks").
- **Copy / adapt / idea-only**: Idea-only; re-verify the Codex constraint before relying on it. 0001's hard/soft split is reusable as is.
- **Overlap**: plugin manifests.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Feed into the install-architecture theme; re-check Codex's current manifest rules.

### Unity delta line pattern and the Unity config

- **What it is**: A core skill reaches Unity knowledge with one conditional line, "In a Unity repo, call the Skill tool with "unity" for <need phrase>", whose need phrase matches a row of the router's needs table; "one home per rule" ([fork: CODING_STANDARDS.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CODING_STANDARDS.md)). Repo facts live in `docs/agents/unity.md`, written by setup with only fields that differ from each Unity skill's default ([fork: unity.md seed](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/setup-matt-pocock-skills/unity.md)). Design notes: [fork: docs/design/unity-issue-classification.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/docs/design/unity-issue-classification.md).
- **Kind**: convention doc
- **Proposed address**: the core-to-pack seam convention (applies to core skills that serve any pack)
- **Why it could fit**: It is exactly the shape a core/pack split needs: core stays generic, a pack plugs in behind one line per need, and costs nothing outside its domain except a line in the core skill's body (paid only when that skill runs). It generalises to other packs (*inference*: "In a web repo, call the Skill tool with "web" for ...").
- **Why it might not**: Each delta line lives in a core skill, so core skills "know" every pack; with several packs that list grows. Without the pack installed, the line points nowhere.
- **Copy / adapt / idea-only**: Copy the pattern; generalise the wording.
- **Overlap**: `unity` router, `setup-matt-pocock-skills`.
- **Idle context cost**: 0 idle; a sentence per core skill at invocation.
- **Recommendation (proposed)**: Adopt as the collection's core-to-pack convention (owner decides).

### `research/` provenance

- **What it is**: One cited research file per Unity area (`unity-assemblies`, `-debugging`, `-merging`, `-prototyping`, `-serialization`, `-testing`, `-verification`, roughly 1,900 to 6,800 words each), each naming its ticket and sources; `research/README.md` requires versions and dates per subsection, forward pointers on superseded paragraphs, and re-pointed citations. `CLAUDE.md` makes reading the matching file mandatory before changing a Unity skill. [fork: research/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/research/README.md), e.g. [unity-verification.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/research/unity-verification.md)
- **Kind**: convention doc (+ archive)
- **Proposed address**: travels with the Unity pack (pack-maintenance material, never installed)
- **Why it could fit**: The Unity skills are only trustworthy because of it; the collection's own `research/` and ledgers follow the same idea.
- **Why it might not**: Large; only useful to whoever maintains the pack.
- **Copy / adapt / idea-only**: Copy the README rules into this repo's `research/`; keep the Unity files wherever the Unity pack is maintained.
- **Overlap**: `unity-sandbox`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Keep the rules; keep the Unity files with the Unity pack's home.

### `unity-sandbox`

- **What it is**: A gitignored, local-only Unity project (URP blank, Test Framework, `com.unity.pipeline`, one EditMode smoke test) where a Unity mechanic is checked hands-on before a skill states it; recreated with `unity projects create ...` if missing. [fork: CLAUDE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CLAUDE.md), [.gitignore](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.gitignore). (It exists locally; not inspected beyond its top-level listing.)
- **Kind**: convention (maintenance environment)
- **Proposed address**: Unity pack maintenance mechanism
- **Why it could fit**: "Observed on 6000.6.2f1" claims throughout the Unity skills come from it.
- **Why it might not**: Only relevant where the Unity pack is maintained.
- **Copy / adapt / idea-only**: Copy the convention (it is one paragraph and a command).
- **Overlap**: `research/` provenance.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Keep with the Unity pack's home.

### Docs pages and `.agents/writing-docs.md`

- **What it is**: A human-facing page per promoted `engineering/`/`productivity/` skill under `docs/`, published to `aihero.dev/skills-<name>`, with a fixed template (What it does, When to reach for it, Common questions, It's working if, Where it fits), absolute links, AI Coding Dictionary linking, and a "Unity deltas" paragraph rule. [fork: .agents/writing-docs.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/writing-docs.md), e.g. [docs/engineering/tdd.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/docs/engineering/tdd.md)
- **Kind**: convention doc
- **Proposed address**: out (for a personal collection)
- **Why it could fit**: A docs page relieves cognitive load for user-invoked skills.
- **Why it might not**: Built for upstream's publishing site and audience (the wiki hunt, the dictionary, "never name the author"); for one owner the router does the same job.
- **Copy / adapt / idea-only**: Idea-only (the "defining constraint" and "It's working if" sections are good prompts for a router entry).
- **Overlap**: `ask-matt`.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Reject for the collection.

### `.agents/install-block.md`

- **What it is**: The one canonical install wording (plugin route, skills.sh whole-set and single-skill forms) that `README.md`, changesets and docs must copy verbatim; states the plugin and skills.sh routes are exclusive, and fork and upstream are exclusive. [fork: .agents/install-block.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.agents/install-block.md)
- **Kind**: convention doc
- **Proposed address**: only if the collection publishes
- **Why it could fit**: The "exclusive routes" warning applies directly to the migration: the owner today has both linked fork skills and installed plugins.
- **Why it might not**: A personal collection has one reader.
- **Copy / adapt / idea-only**: Idea-only, unless a pack is published.
- **Overlap**: plugin manifests.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Idea-only; revisit at the publishable-split decision.

### `.out-of-scope/` knowledge base

- **What it is**: One file per rejected concept, with the reason and prior requests, read during triage to avoid re-litigating (three entries: mainstream trackers only, no question caps, no setup verify mode). [fork: .out-of-scope/question-limits.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.out-of-scope/question-limits.md), format in [triage/OUT-OF-SCOPE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/triage/OUT-OF-SCOPE.md)
- **Kind**: convention doc
- **Proposed address**: comes with `triage` if taken
- **Why it could fit**: Rejected candidates from these ledgers could be recorded the same way, so later sessions don't re-propose them (*inference*).
- **Why it might not**: The map already has an Out of scope section and closed tickets for that.
- **Copy / adapt / idea-only**: Idea-only.
- **Overlap**: ADRs (both record "why not").
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Idea-only.

### Bucket layout and the promotion rule

- **What it is**: `skills/<bucket>/<name>/`, with promoted buckets (`engineering`, `productivity`, `unity`) shipped in the plugin and listed in READMEs grouped by user-invoked and model-invoked, and non-promoted buckets (`misc`, `in-progress`, `deprecated`) excluded; `check.mjs` enforces it. [fork: CLAUDE.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/CLAUDE.md), [fork: skills/engineering/README.md](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/README.md)
- **Kind**: convention doc
- **Proposed address**: repo layout (input)
- **Why it could fit**: Grouping READMEs by invocation is cheap discoverability.
- **Why it might not**: Buckets are a maturity and topic axis; the collection's axes are core/pack and invocation. ADR 0002 shows buckets are what made a Codex plugin hard.
- **Copy / adapt / idea-only**: Idea-only: lay out by address (core vs each pack) so each installable unit is one directory (*inference*, follows from ADR 0002's constraint).
- **Overlap**: plugin manifests, ADR 0002.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Use as input to the layout decision, not as is.

### Dependabot

- **What it is**: Monthly grouped updates for npm and GitHub Actions with `build`/`ci` commit prefixes. [fork: .github/dependabot.yml](https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/.github/dependabot.yml)
- **Kind**: CI config
- **Proposed address**: repo maintenance mechanism
- **Why it could fit**: Cheap, if the collection has npm tooling and workflows.
- **Why it might not**: Only matters once there is tooling to update.
- **Copy / adapt / idea-only**: Copy if tooling lands.
- **Overlap**: none.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: Low priority; copy alongside any CI.
