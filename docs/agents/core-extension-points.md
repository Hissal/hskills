# Core extension points

Blueprint reference for pack theme sessions. Each entry names a caller and the knowledge it asks the project's pack guides for. These are decided needs, not implemented skill files or a project job map. The convention and execution rules live in [ADR 0003](../adr/0003-core-reaches-packs-through-the-pack-list.md).

Use a core skill's own need phrase. A pack may answer several needs with the same knowledge. A knowledge answer stays within the caller's job; it does not start a different workflow.

## Planning and execution

Decided in [Planning and delegation](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823), with verification ownership amended by [Evidence and change safety](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190):

- `to-spec`: sketching test seams.
- `to-tickets`: slicing work: surfaces that cannot be worked in parallel, work that needs a human or a running tool, renames that need expand-contract.
- `implement`: how often to run tests and checks. Checking that a change compiles or works goes through `verifying`.
- `implement-spec`: running work in parallel worktrees; checking the integration branch goes through `verifying`.
- `pr`: capturing visual evidence and reading test results.

Added by the [core review](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219205105):

- `triage`: classifying stack involvement, reproduction/completion tools and environment, and required human participation.
- `delegating`: stack-specific shared resources and isolation constraints whenever assessing parallel work. This serves any calling workflow, not only `implement-spec`.

## Review and evidence

Decided in [Review and second opinions](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) and [Evidence and change safety](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190):

- `code-review` Standards: reviewing stack-specific code: serialized data, build and assembly setup, lifecycle, tests.
- `code-review` Failure: failure modes specific to the stack.
- `code-review` Spec: what a diff cannot prove for this stack.
- `verifying`: checking a change compiles or works; ship-readiness for this kind of project.
- `blast-radius`: what a change can break outside the diff for this stack.
- `constraints`: the stack's check tools and their cost tiers.
- `migrating`: migrating stack-specific data or APIs.

Added by [Theme: web pack](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226):

- `risky-changes`: measuring a change against real data for this stack.
- `dependency-audit`: this stack's dependency ecosystem.
- `break-ui`: where and how to check a UI against worst-case data for this stack.

## Diagnosis and testing

Decided in [Diagnosis and performance](https://github.com/Hissal/skill-collection/issues/38#issuecomment-6168634570) and [Testing](https://github.com/Hissal/skill-collection/issues/39#issuecomment-6170537610):

- `diagnosing-bugs`: building a feedback loop, instrumenting or profiling for this stack.
- `verifying`: measuring performance for this stack.
- `hillclimb`: measuring performance for this stack, the same need as `verifying`.
- `tdd`: writing, setting up and running tests for this stack.
- `test-review`: this stack's test idioms, including skip markers, assertion forms and cheat patterns; collecting test coverage for this stack.

## Design, continuity and prototyping

Decided in [Design and refactoring](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453), [Continuity and learning](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467), and [Prototyping](https://github.com/Hissal/skill-collection/issues/44#issuecomment-6195116678):

- `codebase-design`: this stack's seam and compatibility rules.
- `improve-codebase-architecture`: what to leave out of the hotspot scan and this stack's sources of friction.
- `refactoring`: this stack's rename and move hazards and how to validate a refactor.
- `retro`: environment gaps the session hit that are specific to this stack.
- `prototype`: where a prototype lives, how it runs and is removed, and which medium fits this stack.

## Setup and discovery

`setup-project` discovers guidance through the collection catalog, the installed skill listing and relevant vendor sources; it can read selected packs' `SETUP.md` material before installation. The [project setup decision](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) records the sequence, recommendations and escalation paths. Normal extension points consult the project's configured pack list under [ADR 0003](../adr/0003-core-reaches-packs-through-the-pack-list.md). The core guide suggests workflows and does not execute them.

Pack-specific jobs with no core counterpart may remain standalone pack knowledge or workflows. They do not require a new core extension point solely to exist.
