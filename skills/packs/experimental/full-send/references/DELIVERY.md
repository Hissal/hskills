# Delivery procedure

One procedure behind two entry skills: `full-stop` (goal or spec to a PR ready for the owner's merge) and `full-send` (the same, then the merge). The entry skill you were invoked through sets the authority and where the run ends, and may narrow what follows; it never widens it. Everything else is here, up to the open PR; from there `babysit-pr` tends it. The run is done at the entry skill's end, or at a [stop](#stop-conditions).

- [Branch authority](#branch-authority)
- [Scope](#scope)
- [Stop conditions](#stop-conditions)
- [Run](#run)
- [Bounds and learning](#bounds-and-learning)

The calls below to `tdd`, `verifying`, `pr` and `delegating` are process calls, not requirements: when one is not installed, say so once and carry on doing its part as the step describes. A workflow the owner asked for by name is the exception: when it is not installed, that is the missing-access stop.

## Branch authority

- **The run's own branch.** Commit, push, rebase and force-push with `--force-with-lease` without asking again.
- **A failed lease** means someone else pushed. Fetch, inspect their commits, and reconcile with them; their work is never overwritten.
- **Every other branch is out**, the default branch above all: no push, no force-push, no deletion.

## Scope

- **In:** the commits the goal needs, replies on the PR that explain a fix or a disagreement, an issue that holds a finding deferred from the PR, and updates to the PR's linked ticket that record its state.
- **Out:** messages anywhere else, deployment, production changes, and any destructive change to data outside the repository (deleting, closing, overwriting). Closing a PR is out too, even one made obsolete.

## Stop conditions

These hold for the whole run, the rounds `babysit-pr` tends included. Stop and ask the owner only for:

- a consequential decision the goal leaves open and this run's authority does not cover;
- access or infrastructure you lack and cannot get within scope;
- a premise of the goal that proves false or contradicts another;
- an overlapping PR that makes this one obsolete;
- `babysit-pr`'s fix-round budget spent with a finding still to fix, reported as its stop says;
- an obstacle with no credible path left, after changing approach.

Everything else is yours to decide: choose a sensible default and record the choice, its reason and the cost if wrong, for the final report. Reasonable alternatives alone are not a stop. Never drop a requested capability to finish: a run that cannot deliver it stops and says so.

**How to ask.** Unwatch the PR first, if one is open. Ask through the harness's question tool, so the run visibly waits on the owner, and put the whole context in the question: the PR link, what blocks you, and the options with your recommendation first. With no question tool, or no answer from it, take the safe path: leave the PR open and unmerged, and lead your final message with the question.

## Run

1. **Frame.** Take the goal from the invocation; with none, ask for it. Explore the code and the project docs it touches, frame the outcome, choose an approach and build. There is no approval stop, and reasonable alternatives alone are not one. Keep the requested outcome and every stated constraint; record each consequential assumption with its reason and the cost if wrong.
2. **Branch.** Work on an isolated branch: a new one from the up-to-date default branch, in a worktree when the host gives you one. It is the run's own branch under [branch authority](#branch-authority). Freeze edits to a path only when the owner asks.
3. **Build** what the goal asks, in full, and nothing more. Read the project's selected coding guidance and its tooling configuration through the project configuration (the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`); where the two disagree, the tooling configuration wins, and each conflict goes in the final report. Write tests through `tdd` where the change allows.
4. **Prove** the change through `verifying`: evidence from a run that it does what the goal asks.
5. **Open the PR.** Commit, push, and open the PR through `pr`, ready for review rather than as a draft, so checks and automated reviews run. Then run any check the entry skill adds for an open PR.
6. **Tend** it through `babysit-pr` to its done bar. This run's authority, stop conditions and the entry skill's rules stay in force through every round. Proof and review cover the final diff: re-prove each behaviour change and each meaningful conflict fix through `verifying` before the entry skill's last step.

## Bounds and learning

- **No skill-imposed cap** on tokens, time or retries, and no budget question. Review rounds are the exception: `babysit-pr`'s fix-round budget bounds them. Host limits and limits the owner states still bind.
- **Repeated failure changes the approach**: the same fix failing twice is a sign to re-diagnose, not to retry. An obstacle that stays impassable is a stop: keep the work pushed and report it incomplete.
- **A concrete failure** in the run (a wrong turn, a misleading instruction, a tool that misbehaved) may earn a short offer of `/retro`: what happened, the evidence, and the instruction or mechanism that may need correcting, with your hypothesis kept apart from the owner's assessment. Offer it at the end; never run it.
