---
name: delegating
description: Use before dispatching any subagent or delegated agent, or when choosing the model, harness or effort one runs on.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/delegating"
  opencode/autoinvoke: "true"
---

# Delegating

One contract for every agent you start: who may start it, what it runs on, what its brief carries, what it returns, and how you check it. The calling workflow says what it needs; this skill resolves how. The exception: a calling skill may say that a plain read-only helper on the host's native subagent tool, with no model, harness or effort asked for, starts without this skill.

Done when every agent you started has a resolved choice shown in a dispatch summary, a standalone brief, and a return you checked against the real tree, or a blocked dispatch you reported.

Invoked with the argument `setup` (`/delegating setup`), you write the owner's personal delegation policy with them instead: read [policy setup](references/SETUP.md) and follow it in place of the steps below. Read it only in that mode.

## 1. Take the caller's contract

The calling workflow states, for each agent: its **role**, the task's **difficulty** (simple, normal, difficult), the **agent count**, and how the agents relate (independent, in sequence, or a diversity group with diversity **preferred** or **required**). Resolve those here. When the caller leaves one out, infer it from the task and say so in the dispatch summary.

Explicit instructions in the current message or invocation override everything below. An explicit model, harness or effort means exactly that choice: it is never silently replaced.

Name each agent's kind before starting it:

- A **role agent** plays a part the caller relies on for judgment (implementer, reviewer, researcher). It may start helpers and run the workflows its own role calls for, never an agent for a peer role.
- A **helper** runs one narrow errand and returns facts. It starts no agent.

The same rules bind you when you are yourself a dispatched agent. A helper, or a role agent that would need an agent for a peer role, returns that need to its parent instead.

## 2. Before firing

- **Parallel work.** Whenever agents would run at the same time, ask the project's listed pack guides for *stack-specific shared resources and isolation constraints*: what two workers cannot share (an editor, a device, a database, a port) and how to isolate them. When no guide answers, carry on silently with your own judgment. There is no fixed concurrency cap: respect the host's limits, any limit the user stated, and any infrastructure limit the project configuration records; run in parallel only what gains from it and cannot collide.
- **Dirty tree.** When workers run in another checkout (a worktree, a delegated child, a CLI in another folder), run `git status --porcelain`. If it lists anything, warn in one line which uncommitted work the workers will not see.
- **Cost.** Before a run of more than one agent, state its cost in one line: how many agents, on which models and efforts, and roughly how much each reads.

## 3. Select model, harness and effort

Resolve selection before transport, so the native tool's model list never quietly narrows the choice.

Explicit instructions win over the personal delegation policy for whatever they name; the policy then decides the rest. Read the policy at `~/.config/skill-collection/delegation.json`:

- **No file**: select automatically. That is normal, so suggest nothing.
- **A file**: check it against the [policy schema](references/policy.schema.json), then select each agent's choice by matching, order or pool, effort and fallback as the [policy guide](references/POLICY.md) says. Its selector examples ([ordered](references/policy-examples/ordered.json), [pool](references/policy-examples/pool.json), [workflow override](references/policy-examples/workflow-override.json)) are illustrations, never assignments. A rule whose choices are exhausted asks before going outside its list unless the policy sets `autoFallback`; unattended, the blocked dispatch is preserved and reported.
- **Invalid** (unreadable, not JSON, or breaking the schema): never treat it as absent. At dispatch, report the file and every problem, and suggest `/delegating setup` to repair it. Then ask the owner before selecting automatically; unattended, preserve the brief in a file and report the blocked dispatch.

Project facts and the host's real limits bind every policy choice: no rule widens authority, isolation or a concurrency limit.

- **Automatic** (no explicit instruction, and no policy rule matching): choose from suitable available models. Suitable means strong enough for the role's difficulty: a small fast model can run a simple helper, difficult work and final reviews need a frontier model. Your own model family is an acceptable default.
- **Family names** ("Opus", "GPT Sol") resolve against the live catalog to the newest suitable stable version, from advertised IDs and reliable version information. A preview or experimental variant only when named. Surface an ambiguity you cannot resolve.
- **Diversity groups** are selected together, never one agent at a time. Prefer different model families, then different lines within one family. The same model through two harnesses is not diversity. A model too weak for the role stays out, whatever its family. Preferred diversity unavailable: reuse a model and report it. Required diversity unavailable: the dispatch is blocked.
- **Effort**: low for simple quick work, medium for normal work, high for difficult work, unless the policy's `effortDefaults` replace them. xhigh only with an exceptional reason, stated in the summary. max only on the user's explicit instruction or a policy entry naming it; never raise effort to max on your own. A policy rule's effort counts as explicit. Map the intent to the harness's own control, reading the levels each model takes from a live listing, and reporting a limitation when none shows them: equal option names do not mean equal effort or cost. An automatic default may take the nearest level or the model's fixed behaviour, reported as such, and never lands upward on max. An explicit effort with no supported equivalent makes that choice unavailable.
- **Unavailable** (not installed, not signed in, quota or auth failure, no transport reaches it): move to the next suitable choice and record why. An explicitly requested choice that is unavailable gets no substitute without asking. Unattended, preserve the brief in a file and report the blocked dispatch.

## 4. Choose the transport

Use the host's own delegation first, following its guidance and its live tool schemas and capability listings. Start an agent that takes a brief with a fresh context, never a fork of your conversation.

When no host delegation reaches an allowed choice, run that harness's headless CLI:

- Read its current `--help` before the first run in a session.
- Write the brief to a file outside the checkout and pass it whole: the agent sees nothing else.
- Close stdin unless the brief goes through it, and give every run a time limit.
- Capture the final output to a file and keep the exit code. A non-zero exit, an empty output or output outside the return shape is a failed dispatch, not a result.
- Run it where the brief says, no wider than the brief's Authority.
- A quota or rate-limit failure makes that choice unavailable for now: report it and move on, never retry in a loop.

A choice no transport reaches is unavailable (step 3). Permission and sandbox modes are never assumed equal across harnesses because their labels match; a child runs at or below the authority the brief grants. Each fresh review round is a new delegated task carrying the complete context (brief, prior findings, responses, open objections), never a continuation of the last reviewer's conversation.

## 5. Write the brief

The brief is the agent's whole world: it sees nothing else. Write it for the weakest executor that might run it: exact paths, current-code excerpts where they matter, exact commands. Pass large artifacts (diffs, specs, logs) as file paths, not pasted text. Use this shape:

```md
Written against: <full commit SHA, plus "uncommitted changes" when the tree is dirty>
Role: <role agent: may start helpers and run the workflows this role calls for, never an agent for a peer role | helper: start no agent>
Objective: <the outcome, in one or two sentences>
Authority: <what this task may do, from the invoking workflow; running on another harness grants nothing more>
Constraints: <scope, files to leave alone, isolation from step 2>
Skills to call: <skill names the agent calls, e.g. tdd, verifying>
Extension points: <the parent's pack-guide sentences, verbatim; never the answers>
Validation: <the command that proves the objective>
Stop when: <a condition anyone can check>
Never weaken, skip, delete or narrow a test to make it pass.
Unattended: at a decision with a reversible default, take the default and list it under Rulings. Stop and return blocked for an unresolved decision, an action outside Authority, or a premise that proves false.
Return: <the shape in step 7; a researcher writes findings to a file and returns a few lines plus its path>
```

An action the invoking workflow already authorised (an autonomous flow's push or merge) goes under Authority and is not asked about again.

## 6. Dispatch

Before the first dispatch call, write this summary as visible text in the same message as that call. The user sees neither your thinking nor the brief, so a summary only there, or only in the final report, does not count.

```md
**Dispatch:** <role> on <harness or provider>, <model>, effort <level> [<approximation or limitation>]
**Transport:** <the host's tool | CLI: <command>>
**Selection:** <explicit instruction | policy: <rule, e.g. workflows.code-review[0] or rules[1]> | automatic: <no policy | no matching rule | outside the list: why>>; diversity <met | reused: why | not asked>
```

One line per agent when several go together.

## 7. Check the return

Every agent returns exactly one status:

```md
Status: done | blocked | needs more scope
Changed: <paths, or none>
Seen to fail: <commands and results>
Seen to pass: <commands and results>
Rulings: <each reversible default taken, or none>
Blocked on / scope needed: <only when not done>
```

The report is evidence, never the result. Check the real diff and run the checks yourself through `verifying` before calling the work done. No report, a report outside this shape, or a report naming no evidence is not done: a gap is not a pass. Confirm the model and effort that actually ran from the run's own record where it names them, and report them; say so when they differ from what you requested.

Carry every ruling into your final report, and onto the ticket when the work comes from one. Needs more scope goes to whoever owns the scope; you widen nothing on the agent's behalf.
