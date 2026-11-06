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
- **Merger subagent**: one merge at a time, after you have checked the work it merges.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. Where a ticket needs facts from outside sources, it may call the Skill tool with `research`; its brief names its role, researcher, so `research` does the reading in that subagent instead of starting another. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 5 (a branch with no commits ahead of the default branch can't open one). Write its body through `pr`, whose issue links set each ticket and the spec to `Closes` or `Refs` by the state of its work on every update.

4. Use a fresh **implementer subagent** for each ticket, each in its own worktree on its own branch. Its brief points at the spec, the ticket, the exploration notes and the integration branch, and carries:
   - the project-guidance pointer: load the coding guidance and tooling configuration the project's instructions point to before coding; tooling configuration wins, and a conflict between them is reported;
   - "Ask the project's listed pack guides for running work in parallel worktrees; when none answers, carry on silently."

   Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done

5. Once an **implementer subagent** completes, its report is a claim. Read its real diff against the ticket through `verifying` before anything merges. Merge work that passes this check into the integration branch with a **merger subagent**, then update the PR body through `pr`. A ticket whose implementer was blocked or needs more scope, or whose diff lacks what the ticket asks, is not merged: it stays open, the tickets it blocks stay off the frontier, and it goes in the report.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, call the Skill tool with `code-review` on the integration branch. Call the Skill tool with `receiving-review` on its findings: each is judged before anything changes, and judgement calls are batched to the owner or parked on the PR's **Not done** line under its authority rules. Give the fixes it settles on to a single fresh **implementer subagent**, check each fix through `verifying`, then merge with the **merger subagent**. An unfixed finding goes on the **Not done** line; open no ticket for it. Nothing here runs `/second-opinion`.

8. Check the integration branch tip through `verifying`: the project's checks, and every acceptance criterion of every ticket against the diff or a run, each with its status word. This comes before marking anything ready or reporting.

9. Close the work. First finish every open item an agent can do: a blocked ticket a fresh implementer can retry, a failing criterion, a criterion check an agent can run, a fixable finding, each through steps 4 to 8. Each item gets one retry; one that fails again needs the owner, with what failed. What stays open is only what needs the owner: a decision, access or authority the agents lack, a check only a human can make, or a twice-failed item.
   - **Draft PR:** update its body through `pr`. Once every criterion is verified, mark it ready for review. Otherwise it stays a draft, with what stays open on `pr`'s **Not done** line.
   - **No PR:** resolve each ticket whose work is merged and whose every criterion is verified or waits only on a check a human must make, the way the issue tracker closes work; the spec once every ticket is resolved. Leave the rest open.

   Report the integration branch, the PR if any, and what stayed unvalidated, with the reason.

   After the report, offer `/handoff` only when the owner chooses to defer or hand over the remaining tickets or findings and the evidence gathered would be costly to rebuild, giving that reason. Nothing already in the tracker is recorded again. The owner starts it; you never run it. Otherwise end at the report.

   When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.

10. Clean up all **implementer subagent** worktrees.
