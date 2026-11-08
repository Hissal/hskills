---
name: full-send
description: Take a spec or a rough goal to a merged PR, unattended, merging only once the project's own merge requirements are met.
disable-model-invocation: true
argument-hint: "A spec, ticket or goal"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/full-send"
  opencode/autoinvoke: "false"
---

# Full Send

You take a goal from its first framing to a merged PR, unattended. Done when GitHub reports the PR merged, the PR is unwatched and the handoff below is given; or when a required human review is the only thing left, reported as below; or at one of the procedure's stops, asked as it says.

Read the [delivery procedure](references/DELIVERY.md) before the first action: branch authority, scope, stop conditions, the tend loop and the done bar all live there, and this file only adds where the run starts, the merge and the handoff. Skip it and you will act without the rules that bound every push, reply and the merge itself.

The calls below to `tdd`, `verifying`, `pr`, `delegating`, `hillclimb` and `arena` are process calls, not requirements: when one is not installed, say so once and carry on doing its part as the step describes. A workflow the owner asked for by name is the exception: when it is not installed, that is the procedure's missing-access stop.

## Authority this invocation adds

- **Merge.** Invoking this skill is the owner's authorization to merge this run's PR. Never ask for it again. Authorization is not readiness: the [merge](#merge) happens only when its gate holds.
- **Unattended.** This is an explicitly invoked autonomous flow. Resolve implementation judgement calls, review findings among them, under the procedure's authority, and record each consequential one (the choice, its reason, the cost if wrong) for the handoff. The procedure's stop conditions are the only reasons to ask.
- **Testing.** Use the test methods the proof needs (running the app, browser automation, computer use, screenshots) without asking, even where a project file says to ask first. Rules on how to test still apply. Never production, data deletion, or a harness approval prompt.
- **Agents.** Choose any helper agent's model, harness and effort through `delegating`.
- **Workflows on request only.** When the owner asks for `hillclimb` on a measured result, run it unattended inside this run. Run `arena` only when the owner explicitly asks for it; a run never starts one on its own judgement.

## Run

1. **Frame.** Take the goal from the invocation; with none, ask for it. Explore the code and the project docs it touches, frame the outcome, choose an approach and build. There is no approval stop, and reasonable alternatives alone are not one. Keep the requested outcome and every stated constraint; record each consequential assumption with its reason and the cost if wrong.
2. **Branch.** Work on an isolated branch: a new one from the up-to-date default branch, in a worktree when the host gives you one. It is the run's own branch under the procedure's branch authority. Freeze edits to a path only when the owner asks.
3. **Build** what the goal asks, in full, and nothing more. Read the project's selected coding guidance and its tooling configuration through the project configuration (the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`); where the two disagree, the tooling configuration wins, and each conflict goes in the handoff. Write tests through `tdd` where the change allows.
4. **Prove** the change through `verifying`: evidence from a run that it does what the goal asks.
5. **Open the PR.** Commit, push, and open the PR through `pr`, ready for review rather than as a draft, so checks and automated reviews run.
6. **Tend** it in the procedure's tend loop to the done bar. Proof and review cover the final diff: re-prove each behaviour change and each meaningful conflict fix through `verifying` before the merge.
7. **Merge** it as below.

## Merge

**Gate.** Read the live PR and merge only when all of these hold on its latest head, the commit you last pushed:

- the procedure's done bar;
- your proof covers every change in the final diff;
- GitHub reports the PR mergeable, with nothing blocking it;
- no human review still requests changes.

When the gate fails on something the tend loop can fix, go back to the tend loop.

**A required human review is a dependency.** When the only thing left is an approval the project requires from a person, do not merge and do not wait it out: unwatch the PR and hand off with the verdict **waiting on human approval**. Confirm it is the real blocker by reading the branch protection or ruleset, not by inference.

**Method.** Merge with the method the repository uses: read its allowed merge methods and how its recent PRs were merged. Pin the merge to the head you checked (`gh pr merge --match-head-commit <sha>` or the host's equivalent); a head that moved sends you back to the gate. When the repository merges through a merge queue or auto-merge, use it, and stay in the tend loop's waiting until GitHub reports the PR merged; a PR the queue drops goes back to the tend loop.

**Never** bypass a required approval, weaken or skip a check, use an administrative bypass (`--admin` and the like), change branch protection or rulesets, dismiss a review to unblock the merge, or ask an agent to do any of these. A merge that cannot happen without one of them is a stop.

## Handoff

Unwatch the PR, fetch the base, and read the live PR: state, head, merge commit, checks and reviews. When someone else merged or closed it, report that instead of a verdict.

Report every slot:

- **PR**: the link, and its final head SHA.
- **Verdict**: **merged** (give the merge commit SHA and the method used); **waiting on human approval** (only a required approval remains: name it, confirmed as the real blocker); or **blocked** (what prevents the merge, what you tried, what is needed).
- **Proof**: how the change and each fix were proved.
- **Reviewer outcome**: each finding fixed or disposed of, with the reason.
- **Decisions**: each consequential assumption and choice, with its reason and the cost if wrong.
- **Follow-ups**: what you recorded and left out, with the reason.
- **Remaining risks**: what the proof does not cover.
