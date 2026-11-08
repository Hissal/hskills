---
name: full-stop
description: Take a spec or a rough goal to a PR ready for the owner to merge, unattended, and never merge it.
disable-model-invocation: true
argument-hint: "A spec, ticket or goal"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/full-stop"
  opencode/autoinvoke: "false"
---

# Full Stop

You take a goal from its first framing to a PR ready for the owner's merge, unattended, and you never merge it. Done when the delivery procedure's done bar holds on an open, unmerged PR, the PR is unwatched and the handoff below is given; or at one of the procedure's stops, asked as it says.

Read the [delivery procedure](references/DELIVERY.md) before the first action: branch authority, scope, stop conditions, the tend loop and the done bar all live there, and this file only adds where the run starts, the merge guard and the handoff. Skip it and you will act without the rules that bound every push and reply.

The calls below to `tdd`, `verifying`, `pr`, `delegating`, `hillclimb` and `arena` are process calls, not requirements: when one is not installed, say so once and carry on doing its part as the step describes. A workflow the owner asked for by name is the exception: when it is not installed, that is the procedure's missing-access stop.

## Authority this invocation adds

- **Unattended.** This is an explicitly invoked autonomous flow. Resolve implementation judgement calls, review findings among them, under the procedure's authority, and record each consequential one (the choice, its reason, the cost if wrong) for the handoff. The procedure's stop conditions are the only reasons to ask.
- **Testing.** Use the test methods the proof needs (running the app, browser automation, computer use, screenshots) without asking, even where a project file says to ask first. Rules on how to test still apply. Never production, data deletion, or a harness approval prompt.
- **Agents.** Choose any helper agent's model, harness and effort through `delegating`.
- **Workflows on request only.** When the owner asks for `hillclimb` on a measured result, run it unattended inside this run. Run `arena` only when the owner explicitly asks for it; a run never starts one on its own judgement.

## No merging

Never merge, enable auto-merge, enter a merge queue, push to the default branch, bypass branch protection, or ask an agent to do any of these. A merge needs `/full-send`.

**Merge guard.** Run it before work begins on a PR that already exists (the goal names one, or the branch has one), after opening the PR, and again before each push: when auto-merge is enabled on the PR, disable it; when the PR is in a merge queue, take it out. Record each change for the handoff. When you cannot stop an automatic merge, stop and ask before going on.

## Run

1. **Frame.** Take the goal from the invocation; with none, ask for it. Explore the code and the project docs it touches, frame the outcome, choose an approach and build. There is no approval stop, and reasonable alternatives alone are not one. Keep the requested outcome and every stated constraint; record each consequential assumption with its reason and the cost if wrong.
2. **Branch.** Work on an isolated branch: a new one from the up-to-date default branch, in a worktree when the host gives you one. It is the run's own branch under the procedure's branch authority. Freeze edits to a path only when the owner asks.
3. **Build** what the goal asks, in full, and nothing more. Read the project's selected coding guidance and its tooling configuration through the project configuration (the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`); where the two disagree, the tooling configuration wins, and each conflict goes in the handoff. Write tests through `tdd` where the change allows.
4. **Prove** the change through `verifying`: evidence from a run that it does what the goal asks.
5. **Open the PR.** Commit, push, and open the PR through `pr`, ready for review rather than as a draft, so checks and automated reviews run. Run the merge guard on it.
6. **Tend** it in the procedure's tend loop to the done bar. Proof and review cover the final diff: re-prove each behaviour change and each meaningful conflict fix through `verifying` before the handoff.

## Handoff

Unwatch the PR, fetch the base, and read the live PR: head, base, checks, reviews and mergeability. Confirm it is open, not a draft, and not set to merge without the owner. If someone else merged it, report that instead of a verdict.

Report every slot:

- **PR**: the link, the final head SHA, and that it is open and unmerged.
- **Verdict**: **ready** (the done bar holds and nothing waits); **waiting on human approval** (only a required approval remains: name it, confirmed as the real blocker); or **blocked** (what prevents readiness, what you tried, what is needed).
- **Proof**: how the change and each fix were proved.
- **Reviewer outcome**: each finding fixed or disposed of, with the reason.
- **Decisions**: each consequential assumption and choice, with its reason and the cost if wrong, merge-guard changes included.
- **Follow-ups**: what you recorded and left out, with the reason.
- **Remaining risks**: what the proof does not cover.
