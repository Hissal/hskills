---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/implement-spec"
  opencode/autoinvoke: "false"
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

Read the issue tracker from the project's configuration: the tracker file linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. If the project names no tracker, tell the user to run `/setup-project`, and stop.

The goal is the entire spec implemented on a single **integration branch**, with every ticket and the spec closed or left open by the state of its work, and every gap that needs the owner reported.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Ask the project's listed pack guides for running work in parallel worktrees, and use the answer when you create worktrees; when none answers, carry on silently.

Start every subagent with a fresh context window.

The calls below to `research`, `tdd`, `verifying`, `code-review`, `receiving-review` and `pr` are process calls, not requirements: when one is not installed, say so once and carry on doing its part as the step describes.

Before dispatching any subagent, consult `delegating`; when `delegating` is not installed, dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort. The brief, the return, the dispatch summary and the rules for reading a report live there. This workflow's roles:

- **Exploration subagent**: optional, one, before any implementer. Role: researcher.
- **Implementer subagents**: one per frontier ticket, in parallel, each in its own worktree. Difficulty is the ticket's.
- **Diff-check reviewer subagents**: one per completed implementer run, a fresh one each round. Role: reviewer, starting no agents. Difficulty is the ticket's.
- **Merger subagent**: one merge at a time, after the ticket's diff-check reviewer returns `merge`.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to build the task graph. Keep only the spec, the task graph and each ticket's acceptance criteria; reach a ticket's body by its pointer when a step needs it, as implementers do.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. Where a ticket needs facts from outside sources, it may call the Skill tool with `research`; its brief names its role, researcher, so `research` does the reading in that subagent instead of starting another. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 5 (a branch with no commits ahead of the default branch can't open one). Write its body through `pr`, whose issue links set each ticket and the spec to `Closes` or `Refs` by the state of its work on every update.

4. Use a fresh **implementer subagent** for each ticket, each in its own worktree on its own branch. Its brief points at the spec, the ticket, the exploration notes and the integration branch, and carries:
   - the project-guidance pointer: load the coding guidance and tooling configuration the project's instructions point to before coding; tooling configuration wins, and a conflict between them is reported;
   - "Ask the project's listed pack guides for running work in parallel worktrees; when none answers, carry on silently."
   - which checks it runs, by the cost tiers in the project's check commands in project configuration: the `edit loop` checks and the checks its ticket names, while building and again after merging the tip, except a `task end` check whose result other tickets' merges can change, which waits for step 7. With no cost tiers configured, nothing waits. A ticket whose criteria are all such waiting checks gets no implementer and no merge: its work is step 7's pass on the integration branch, in the run that merges the last ticket it covers. Until then it stays open.

   Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done

5. Once an **implementer subagent** completes, its report is a claim. One that returned blocked or needs more scope gets no diff check: its ticket is not merged and goes in the report.

   For every other completed ticket, start a fresh **diff-check reviewer**. You do not read the diff yourself. Its brief points at the spec, the ticket and the ticket's branch, and carries the ticket's checks from step 4. The reviewer reads that branch's diff against the integration branch and checks each acceptance criterion through `verifying`. Its Return is `delegating`'s, with these lines added:

   ```md
   Verdict: merge | fix | needs decision
   Criteria: <each criterion: verifying's status word, with quoted diff lines or run output>
   To fix: <only for fix: what is missing, per criterion>
   Decision needed: <only for needs decision: what, and who owns it>
   ```

   Check the return per `delegating`, then route on the verdict:
   - **merge**, with every criterion verified except checks that wait for step 7: merge it into the integration branch with a **merger subagent**, then update the PR body through `pr`. A `merge` with any other criterion not verified is routed as `fix`.
   - **fix**: a fixable gap, meaning an unmet criterion, a missing test or a failing check whose evidence says what is missing. A fresh implementer gets the ticket and the verdict and fixes the gap on the ticket's branch; a fresh diff-check reviewer then checks the new diff. Each round is a new delegated task carrying the full context, per `delegating`. The limit is 2 fix rounds: a ticket still not at `merge` after them is not merged and goes in the report with every round's verdicts.
   - **needs decision**: a criterion that is wrong, contradicts the spec, or can't be checked as written. The ticket is not merged and goes in the report with the reason.

   A ticket that is not merged stays open, and the tickets it blocks stay off the frontier. Tickets blocked by a ticket in a fix round stay off the frontier until it merges or goes in the report.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once no more tickets will merge in this run (every ticket is complete, or the rest are blocked, twice-failed or left for later), check the integration branch tip once through `verifying` with the `task end` checks that waited from step 4. Then call the Skill tool with `code-review` on the integration branch. Call the Skill tool with `receiving-review` on its findings: each is judged before anything changes, and judgement calls are batched to the owner or parked on the PR's **Not done** line under its authority rules. Give the fixes it settles on, and that pass's failures, to a single fresh **implementer subagent**, check each fix through `verifying`, then merge with the **merger subagent**. An unfixed finding or a check still failing goes on the **Not done** line; open no ticket for it. Nothing here runs `/second-opinion`.

8. Check the integration branch tip through `verifying`: the project's checks, and every acceptance criterion of every ticket against the diff or a run, each with its status word. This comes before marking anything ready or reporting.

9. Close the work. First finish every open item an agent can do: a blocked ticket a fresh implementer can retry, a failing criterion, a criterion check an agent can run, a fixable finding, each through steps 4 to 8. Each item gets one retry, except a ticket that used its 2 fix rounds in step 5; one that fails again, or used its fix rounds, needs the owner, with what failed. What stays open is only what needs the owner: a decision, access or authority the agents lack, a check only a human can make, or a twice-failed item.
   - **Draft PR:** update its body through `pr`. Once every criterion is verified, mark it ready for review. Otherwise it stays a draft, with what stays open on `pr`'s **Not done** line.
   - **No PR:** resolve each ticket whose work is merged, or done in step 7's pass, and whose every criterion is verified or waits only on a check a human must make, the way the issue tracker closes work; the spec once every ticket is resolved. Leave the rest open.

   Report the integration branch, the PR if any, what stayed unvalidated, with the reason, and each ticket that went through fix rounds, with every round's verdicts.

   After the report, offer `/handoff` only when the owner chooses to defer or hand over the remaining tickets or findings and the evidence gathered would be costly to rebuild, giving that reason. Nothing already in the tracker is recorded again. The owner starts it; you never run it. Otherwise end at the report.

   When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.

10. Clean up all **implementer subagent** worktrees.
