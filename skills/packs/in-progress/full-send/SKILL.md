---
name: full-send
description: Take a spec or a rough goal to a merged PR, unattended, merging only once the project's own merge requirements are met.
disable-model-invocation: true
argument-hint: "A spec, ticket or goal"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/full-send"
  agent-skills-sync.requires: '["hissal.skill-collection/babysit-pr"]'
  opencode/autoinvoke: "false"
---

# Full Send

You take a goal from its first framing to a merged PR, unattended. Done when GitHub reports the PR merged, the PR is unwatched and the handoff below is given; or when a required human review is the only thing left, reported as below; or at one of the procedure's stops, asked as it says.

Before doing any work, load babysit-pr (hissal.skill-collection/babysit-pr) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill babysit-pr (hissal.skill-collection/babysit-pr) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Then read the [delivery procedure](references/DELIVERY.md): branch authority, scope, stop conditions and the run's steps live there, and `babysit-pr` tends the open PR. This file only adds the authority, the merge and the handoff. Skip the procedure and you will act without the rules that bound every push, reply and the merge itself.

## Authority this invocation adds

- **Merge.** Invoking this skill is the owner's authorization to merge this run's PR. Never ask for it again. Authorization is not readiness: the [merge](#merge) happens only when its gate holds.
- **Unattended.** This is an explicitly invoked autonomous flow. Resolve implementation judgement calls, review findings among them, under the procedure's authority, and record each consequential one (the choice, its reason, the cost if wrong) for the handoff. The procedure's stop conditions are the only reasons to ask.
- **Testing.** Use the test methods the proof needs (running the app, browser automation, computer use, screenshots) without asking, even where a project file says to ask first. Rules on how to test still apply. Never production, data deletion, or a harness approval prompt.
- **Agents.** Choose any helper agent's model, harness and effort through `delegating`.

## Merge

Once `babysit-pr` returns at its done bar, merge as below.

**Gate.** Read the live PR and merge only when all of these hold on its latest head, the commit you last pushed:

- the done bar of `babysit-pr`;
- your proof covers every change in the final diff;
- GitHub reports the PR mergeable, with nothing blocking it;
- no human review still requests changes.

When the gate fails on something tending can fix, go back to `babysit-pr`.

**A required human review is a dependency.** When the only thing left is an approval the project requires from a person, do not merge and do not wait it out: unwatch the PR and hand off with the verdict **waiting on human approval**. Confirm it is the real blocker by reading the branch protection or ruleset, not by inference.

**Method.** Merge with the method the repository uses: read its allowed merge methods and how its recent PRs were merged. Pin the merge to the head you checked (`gh pr merge --match-head-commit <sha>` or the host's equivalent); a head that moved sends you back to the gate. When the repository merges through a merge queue or auto-merge, use it, and wait as `babysit-pr` does until GitHub reports the PR merged; a PR the queue drops goes back to `babysit-pr`.

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
