# Supporting routes

The core guide's workflows beyond the main routes, grouped by need. Pick the row whose situation the obstacle is in; the invocations are written in Claude Code's form, so convert them as [the guide](SKILL.md) says.

## Understanding code and history

| Situation | Recommend |
|---|---|
| Understand how existing code works | `/how` |
| Investigate why code ended up this way using repository and issue history | `/why` |
| Re-explain the last response more clearly and concisely, adding context where needed | `/wait-what` |

## Reviewing quality and correctness

| Situation | Recommend |
|---|---|
| Get an independent review or investigate a specific doubt | `/second-opinion` |
| Assess whether tests catch plausible mistakes and earn their maintenance cost | `/test-review` |
| Establish or refine project quality constraints and enforceable checks | `/constraints` |
| Exercise a UI with realistic worst-case data and failure conditions | `/break-ui` |
| Improve human-facing prose or identify weak generic writing | `/unslop` |

## Assessing and managing changes

| Situation | Recommend |
|---|---|
| Examine what a change could break beyond its diff | `/blast-radius` |
| Rename, move, replace or retire something whose consumers need a compatibility transition | `/migrating` |
| Examine dependency and supply-chain risks | `/dependency-audit` |

## Structure and performance

| Situation | Recommend |
|---|---|
| Find opportunities to improve module boundaries and reduce architectural friction | `/architecture-review` |
| Improve a measurable result through repeated checked experiments | `/hillclimb` |

## The agent environment

| Situation | Recommend |
|---|---|
| Audit instructions and context the agent receives, including conflicts and unnecessary load | `/context-audit` |
| Measure actual Claude Code session token use | `/session-report` (Claude-only) |
| Choose which models, harnesses and effort delegated agents run on, or repair an invalid delegation policy | `/delegating setup` |
| Set a temporary editing boundary for this session and project | `/freeze` |
| Remove that temporary editing boundary | `/unfreeze` |

`/session-report` exists only on Claude Code; on another harness, say it is unavailable here rather than recommending it.

## Continuity and learning

| Situation | Recommend |
|---|---|
| Prepare work and context for another session or teammate | `/handoff` |
| Obtain missing facts or decisions from another person through a questionnaire | `/to-questionnaire` |
| Prepare an interactive procedure for steps only a human can perform | `/wizard` |
| Examine a completed session for mistakes and worthwhile improvements | `/retro` |
