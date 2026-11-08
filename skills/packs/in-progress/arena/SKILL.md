---
name: arena
description: Have two implementations of one goal built independently, then a separate evaluator picks, optionally combines and verifies the stronger.
disable-model-invocation: true
argument-hint: "A goal or spec to build twice, with any constraints"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/arena"
  opencode/autoinvoke: "false"
---

# Arena

Two implementers build the same goal under the same constraints and evaluation criteria, each on its own, and a separate evaluator judges the actual artifacts. The strongest candidate becomes the **base**; useful ideas from the other may be carried onto it. The result is then verified.

Done when the selected or combined result sits on its own branch, verified against every criterion, and your report gives the evaluator's ruling per criterion with its evidence. Arena builds and judges on branches only: pushing, opening a PR and merging stay with the human, or with the delivery flow that asked for this run.

**Stop and ask** when the goal is missing or too vague to write a checkable criterion for: two builds of an unclear goal compare guesses, not implementations. Ask only for what the repository, the issue tracker and the project configuration cannot tell you.

The calls to `delegating` and `verifying` are process calls, not requirements: when one is not installed, say so once and carry on (dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort; verify by running the checks yourself and reporting what ran).

## 1. Write the contract

One brief both implementers receive word for word:

- **Goal**: the outcome, from the invocation or the spec it names.
- **Constraints**: what must hold (interfaces kept, dependencies allowed, files out of bounds), from the request and the project configuration.
- **Evaluation criteria**: three to six, written now, before any candidate exists. Mark each **hard** (pass or fail; a failure cannot be outweighed) or **weighed** (compared between candidates). Each names how it is checked on the artifact: a test, a command, a run of the app, an inspection of named code.
- **Base commit**: the commit both start from.

The step is done when every criterion names its check and nothing in the brief tells one implementer more than the other.

## 2. Build twice, separately

Consult `delegating` before dispatching. The two implementers are a diversity group with diversity **preferred**: another model family when one is available, the same family when not. Diversity never blocks the run. Difficulty is the goal's.

Each implementer works in host isolation (the host's own worktree or isolated-checkout option) on its own branch from the base commit, and never sees the other's branch or report. Build custom isolation only when the host offers none. The brief is the contract from step 1 plus its branch name. Each returns its branch, head commit, and the checks it ran with their results.

When a candidate returns blocked or failed, it stays in the comparison as it is: a missing candidate is a finding, never a reason to rebuild it toward the other.

## 3. Evaluate the artifacts

Start one **evaluator** through `delegating`: role reviewer, a fresh context, not either implementer. Give it the contract and the two branches labelled `A` and `B`, without which model built which. Its tool use is reading and running: it changes neither branch.

The evaluator:

- inspects each candidate's diff from the base commit and runs each criterion's check on each branch; an implementer's report is a claim, and only the evaluator's own runs count as evidence;
- rules per criterion, with the run output or quoted lines behind each ruling;
- selects the base: no candidate that fails a hard criterion when another passes it; among the rest, the stronger on the weighed criteria, with ties broken by the smaller and clearer change;
- lists ideas from the other candidate worth carrying over, each with the criterion it improves, or none.

When both candidates fail the same hard criterion, or they solved different problems, the contract was underspecified. Report that and go back to step 1 with the human; never average the two.

## 4. Combine, only when it helps

Combining is optional. With no listed ideas, the base branch is the result. Otherwise, carry each listed idea onto a new branch from the base's head, one idea at a time, keeping one only when its criterion's check still passes and no other check regresses. Port the idea in the base's own code; a merge of the other branch is never the combination.

## 5. Verify the result

Call the Skill tool with `verifying` on the result branch. Run every criterion's check and the project's own checks on its head commit, and give each claim `verifying`'s status word. Every criterion the evaluator ruled on the base is checked again on the result: carrying ideas over may have changed it.

## Report

```md
Result: <branch> at <head SHA>; base <A|B>, combined with <ideas carried> | uncombined
Candidates: A <branch, model>, B <branch, model>
Criteria: <each criterion: hard|weighed, ruling for A and B with evidence, status on the result>
Not carried: <ideas left behind, and why>
Verification: <commands run on the result and their outcomes>
```

Name the models only in the report, after the evaluation. When you run for a parent agent or a delivery flow, return this report and the result branch; the caller decides what happens to it.
