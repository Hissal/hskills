# Spec readiness in mattpocock/skills outside loop-me

Checked on 16 October 2026 against upstream `main` commit `49dd158d1076134a641b33efb035946536778336`, resolved with `gh api repos/mattpocock/skills/commits/main`. Sources below are pinned to that commit. This describes current upstream, not the fork baseline previously assessed by this collection. No `loop-me` source was used for these findings.

## Finding

Upstream expects planning to settle the questions needed for an agent to proceed independently. It does not require removing the implementer's implementation choices. Its agent-brief instructions expressly give those choices to the implementing agent. Readiness is distributed across the planning conversation, synthesis, ticket breakdown and triage rather than defined by a single universal spec checklist.

That is an interpretation of the following instructions together, rather than a separate upstream policy statement.

## Planning completion

`grilling` opens with "Interview the user relentlessly until you reach a shared understanding." It maps decisions as a design tree. The agent discovers environmental facts, while the user supplies decisions. Its completion rule says the frontier must be empty, every branch visited and nothing left silently assumed. It also requires user confirmation of shared understanding before acting. [grilling, lines 6-30](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/grilling/SKILL.md#L6-L30).

`grill-me` is a wrapper that invokes `grilling`; `grill-with-docs` invokes `grilling` plus `domain-modeling`. Neither adds its own readiness test. [grill-me, lines 6-7](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/grill-me/SKILL.md#L6-L7), [grill-with-docs, lines 6-7](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/grill-with-docs/SKILL.md#L6-L7).

`wayfinder` defines map completion as "the way is clear, with nothing left to decide before someone goes and does the thing." The same paragraph limits the map to planning unless its Notes override that default. Its destination may be a spec to hand off and iterate on, a decision, or a change. Wayfinder decisions carry `wayfinder:` labels, never `ready-for-agent`, because they are decisions rather than implementation work. [wayfinder, lines 7-13](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wayfinder/SKILL.md#L7-L13), [lines 55-69](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wayfinder/SKILL.md#L55-L69).

## Spec synthesis and readiness

`to-spec` says not to interview, but to synthesize the existing conversation and codebase understanding. It still explicitly checks proposed test seams with the user, then publishes the template and applies `ready-for-agent` without additional triage. [to-spec, lines 7-19](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-spec/SKILL.md#L7-L19).

The template covers the problem, solution, extensive user stories, implementation decisions already made, testing decisions, out-of-scope work and further notes. It does not contain a separate readiness checklist or require the spec writer to eliminate every implementation decision. Implementation decisions may include modules, interfaces, architectural decisions, schemas and API contracts. [to-spec, lines 21-75](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-spec/SKILL.md#L21-L75).

The companion documentation says "The spec records decisions you already made. It is not a place to make new ones." It says a fresh session should be able to pick up the work without the user explaining it again. For the label, it explains that the document is complete enough for an agent to work from, but readiness marks an input rather than an instruction to start work. It warns that polling agents can mistake a parent spec for a runnable ticket. [to-spec documentation, lines 5-28](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/docs/engineering/to-spec.md#L5-L28), [lines 41-42](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/docs/engineering/to-spec.md#L41-L42).

## Tickets make work independently executable

`to-tickets` requires complete vertical slices, each demoable or verifiable independently and small enough for one fresh context window. A ticket may be specified and labelled ready while blocked by another ticket. Execution starts at the frontier whose blockers are complete. The user approves the breakdown, granularity and blocking edges before publication. Published tickets receive `ready-for-agent` by default because they are "agent-grabbable by construction." [to-tickets, lines 25-65](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-tickets/SKILL.md#L25-L65).

Both local and tracker templates include acceptance criteria. The description of work is end-to-end behavior from the user's perspective rather than an implementation list for each layer. [to-tickets, lines 69-103](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-tickets/SKILL.md#L69-L103).

Companion documentation supplies a useful stronger check: for each criterion, identify an observation that would falsify it and verify it fails at the implementer's starting commit. This appears in documentation about known weak criteria, not as an explicit step in the skill. It also says each ticket should read as something a fresh session can finish with the user absent. [to-tickets documentation, lines 76-88](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/docs/engineering/to-tickets.md#L76-L88).

## Explicit permission for implementation choices

The clearest distinction is in `triage/AGENT-BRIEF.md`. Its behavioral guidance says to describe what the system should do, rather than how to implement it, then explicitly states:

> The agent will explore the codebase fresh and make its own implementation decisions.

The same file requires concrete, testable and independently verifiable acceptance criteria, plus explicit scope boundaries. Thus a fully specified agent brief leaves implementation decisions to the agent while defining observable completion. [agent briefs, lines 19-37](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/AGENT-BRIEF.md#L19-L37).

`triage` defines `ready-for-agent` as "fully specified, ready for an AFK agent." It verifies claims, uses grilling if clarification is needed and posts an agent brief when marking ready. It lists design decisions among reasons work might require a human. That concerns decisions that prevent delegation, not a prohibition on all implementation decisions, given the brief's express instruction above. A maintainer can override readiness directly. [triage, lines 31-45](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/SKILL.md#L31-L45), [lines 68-90](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/SKILL.md#L68-L90).

## Paths and code are not a readiness requirement

`to-spec` and `to-tickets` prohibit specific file paths and code snippets because they become stale, with an exception for prototype snippets that encode a decision more precisely than prose, such as a state machine or schema. Agent briefs likewise favor durable interfaces, types and behavioral contracts over paths, line numbers or assumptions about the current implementation structure. [to-spec, lines 43-57](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-spec/SKILL.md#L43-L57), [to-tickets, line 105](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-tickets/SKILL.md#L105), [agent briefs, lines 9-17](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/AGENT-BRIEF.md#L9-L17).

## Implementer responsibilities and limits

`implement` has no additional universal readiness review. It fetches a supplied ticket, asks if the reference is ambiguous, uses TDD at pre-agreed seams where possible, runs checks and requests code review. `implement-spec` reads the spec and ticket graph, optionally delegates further codebase or external-documentation exploration, and implements frontier tickets. Further exploration after specification is therefore explicitly allowed. [implement, lines 7-17](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement/SKILL.md#L7-L17), [implement-spec, lines 19-36](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement-spec/SKILL.md#L19-L36).

## Search coverage

Read the full current versions of `grilling`, `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `wayfinder`, `triage`, `triage/AGENT-BRIEF.md` and relevant companion docs. Also searched Markdown under `skills/`, excluding `loop-me`, plus the glossary and relevant engineering docs for readiness, full specification, no questions, asking questions, design decisions, completion and acceptance criteria. No outside-loop-me instruction was found that says a spec must leave an implementer zero design decisions, or that it must be buildable without asking a single question. The planning completion wording remains strong, but the agent-brief guidance prevents reading that as removing implementation discretion.

## Collection decision

The owner confirmed on 16 October 2026 that `loop-me` keeps its original completion wording. See [Does the collection carry an in-progress pack for skills under test?](https://github.com/Hissal/skill-collection/issues/53).

Do not equate "without asking a single question" with "zero design decisions". The former requires enough clarity to proceed without further user clarification; the implementer can still explore the codebase and make implementation choices. The rejection of X1 in [Theme: planning and delegation](https://github.com/Hissal/skill-collection/issues/35) concerned the bundled prescriptive specification approach, including file paths, line numbers and zero design decisions. It does not require weakening `loop-me`'s completion rule.
