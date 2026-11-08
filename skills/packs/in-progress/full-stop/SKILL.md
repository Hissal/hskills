---
name: full-stop
description: Take a spec or a rough goal to a PR ready for the owner to merge, unattended, and never merge it.
disable-model-invocation: true
argument-hint: "A spec, ticket or goal"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/full-stop"
  agent-skills-sync.requires: '["hissal.skill-collection/babysit-pr"]'
  opencode/autoinvoke: "false"
---

# Full Stop

You take a goal from its first framing to a PR ready for the owner's merge, unattended, and you never merge it. Done when the done bar of `babysit-pr` holds on an open, unmerged PR, the PR is unwatched and the handoff below is given; or at one of the procedure's stops, asked as it says.

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

Then read the [delivery procedure](references/DELIVERY.md): branch authority, scope, stop conditions and the run's steps live there, and `babysit-pr` tends the open PR. This file only adds the authority, the merge guard and the handoff. Skip the procedure and you will act without the rules that bound every push and reply.

## Authority this invocation adds

- **Unattended.** This is an explicitly invoked autonomous flow. Resolve implementation judgement calls, review findings among them, under the procedure's authority, and record each consequential one (the choice, its reason, the cost if wrong) for the handoff. The procedure's stop conditions are the only reasons to ask.
- **Testing.** Use the test methods the proof needs (running the app, browser automation, computer use, screenshots) without asking, even where a project file says to ask first. Rules on how to test still apply. Never production, data deletion, or a harness approval prompt.
- **Agents.** Choose any helper agent's model, harness and effort through `delegating`.

## No merging

Never merge, enable auto-merge, enter a merge queue, push to the default branch, bypass branch protection, or ask an agent to do any of these. A merge needs `/full-send`.

**Merge guard.** Run it before work begins on a PR that already exists (the goal names one, or the branch has one), after opening the PR, and again before each push while `babysit-pr` tends it: when auto-merge is enabled on the PR, disable it; when the PR is in a merge queue, take it out. Record each change for the handoff. When you cannot stop an automatic merge, stop and ask before going on.

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
