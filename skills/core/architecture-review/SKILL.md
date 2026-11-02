---
name: architecture-review
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then stop for your pick.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/architecture-review"
  agent-skills-sync.requires: '["hissal.skill-collection/reviewing"]'
  opencode/autoinvoke: "false"
---

# Architecture Review

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This command is _informed_ by the project's domain model and built on a shared design vocabulary:

- Call the Skill tool with "codebase-design" for the architecture vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion, and don't drift into "component," "service," "API," or "boundary."
- The domain language in `GLOSSARY.md` gives names to good seams; ADRs in `docs/adr/` record decisions this command should not re-litigate.

Only `reviewing` gates this review. The calls to `codebase-design`, `grilling` and `domain-modeling` are process calls, not requirements: when one is not installed, say so once and carry on, using the vocabulary and principles named above as written and walking the decisions with the owner directly.

The review is read-only until the owner chooses: the report goes to the OS temp directory, glossary and ADR edits happen only in the grilling loop of a candidate the owner picked, and code changes only in a continuation the owner chose.

Before doing any work, load reviewing (hissal.skill-collection/reviewing) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill reviewing (hissal.skill-collection/reviewing) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

## As a subordinate

When a calling workflow runs this review rather than the owner, follow the caller's scope and output contract and return findings only, exploring in your own context: no interview, dispatch, selection question, continuation offer or suggestion. Your caller owns the next phase.

## Process

### 1. Scope

**Scope before you scan: YAGNI.** Deepening a module pays off by making future changes to it easier, so put extra weight on the parts of the codebase that have recently changed. Decide *where* to look before you look.

Ask the project's listed pack guides for what to leave out of the hotspot scan and this stack's sources of friction.

Resolve and announce the scope through reviewing: the user's explicit request, else your caller's exact scope, else pending work, else the [hotspot survey](../reviewing/references/HOTSPOTS.md), all per its [scope contract](../reviewing/references/SCOPE.md). When the pending work clearly does not bear on architecture (a few assets changed by churn, say), offer the hotspot survey instead, as reviewing says [there](../reviewing/references/HOTSPOTS.md#when-the-survey-runs).

The resolved scope sets how far candidates reach:

- **Clearly scoped**: an explicit PR, branch or range, a caller's scope, or a bare invocation with pending work. Candidates stay within the change. Read surrounding modules as far as understanding the change needs. Small, easy wins outside the edited files may be suggested, each carefully scoped; whole-module refactors are out.
- **General**: a general request, a named area, or the hotspot survey. Examine whole modules: responsibilities, interface, internals, callers and dependencies, and cross-module relationships. History picks the modules; inspection covers them whole, never only their changed lines.

Discoveries outside the scope go to reviewing's out-of-scope observations, never to the candidates.

Done when reviewing's announcement block is out as its own message before step 2 starts, or one question or the survey offer is out to the owner. A summary of the scope in the final report does not count.

### 2. Explore

Read the project's domain glossary (`GLOSSARY.md`) and any ADRs in the area you're touching first.

Then spawn a sub-agent with a fresh context window to walk the codebase. Give it the resolved scope and snapshot, the reach rule from step 1, the pack guides' sources of friction and the duplication lens below. Don't follow rigid heuristics; explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow**, with an interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

Look through the **duplication lens** too. Repeated logic becomes a candidate only when it holds up:

- **Two real callers.** Prove at least two real callers of the repeated logic, quoting each call site. Similar names, generated copies and vendored copies do not count.
- **Reuse first.** Search for an existing helper that already does the job and point the callers at it before proposing a new one. A new helper stays small: the shared logic and nothing more.
- **Count.** Lines removed and lines added, once excluding tests and once including them. Say when the total may grow.
- **Risk.** Name the concrete risk of merging the copies, such as copies about to diverge or a caller relying on one copy's quirk. The risk is never "none".

A shared helper with N callers is a deepening opportunity that passes the deletion test: deleting it would scatter its logic back across N places. Fewer duplication candidates, including none, is a valid result.

Candidates and the explorer's report follow reviewing's evidence rules: an explorer that did not finish is missing coverage, and zero candidates is a valid result.

### 3. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user (`xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows) and tell them the absolute path.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure, on a dark theme. Mix Mermaid with hand-crafted CSS/SVG visuals: use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files**: which files/modules are involved
- **Problem**: why the current architecture is causing friction
- **Solution**: plain English description of what would change
- **Benefits**: explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram**: side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength**: one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge
- **Duplication** (duplication candidates only): each caller with its file and line, lines removed and added excluding and including tests, and the risk

After the cards, list any out-of-scope observations in reviewing's format. End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use GLOSSARY.md vocabulary for the domain, and the `/codebase-design` vocabulary for the architecture.** If `GLOSSARY.md` defines "Order," talk about "the Order intake module," not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007, but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?" Then stop until the owner picks.

### 4. Grilling loop

Once the user picks a candidate, develop its design decisions with them as far as they want. Call the Skill tool with "grilling" to walk the decision tree with them: constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize; call the Skill tool with "domain-modeling" to keep the domain model current as you go:

- **Naming a deepened module after a concept not in `GLOSSARY.md`?** Add the term to `GLOSSARY.md`. Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `GLOSSARY.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing; skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Want to explore alternative interfaces for the deepened module?** Call the Skill tool with "codebase-design" and use its design-it-twice parallel sub-agent pattern.

### 5. Offer a continuation

When the owner is ready to act on a candidate, offer these and wait for an explicit choice:

- **A spec**, written with `/to-spec`.
- **A bounded refactor in this session**, through `refactoring`, limited to the chosen candidate.
- **Delegated implementation**: a brief another agent implements from.

With no explicit choice, the review ends at the report or the developed design. A spec or brief carries the scope, the settled decisions with their reasons, constraints, interfaces, validation and open questions, and marks which decisions are the owner's and which are your proposals or assumptions.

When the owner defers or transfers a developed candidate whose evidence would be costly to rebuild, offer `/handoff` with that reason.
