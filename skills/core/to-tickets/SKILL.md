---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blocking links on a real tracker).
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/to-tickets"
  opencode/autoinvoke: "false"
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary come from the project's configuration: the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. When it names no tracker, tell the user to run `/setup-project`, and publish nothing until a tracker is named. Without a label mapping, use the role names as label strings (`ready-for-agent`).

Ask the project's listed pack guides for *slicing work: surfaces that cannot be worked in parallel, work that needs a human or a running tool, renames that need expand-contract*. Use the answer for slices, edges and Proof notes; the lookup starts nothing else, and when no guide answers, carry on silently with these steps.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

Search the tracker's open issues for work this breakdown would cover. Each match is an **existing issue**: a ticket it already covers is not created again, and edges point at the existing issue instead.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Exclusive surfaces block too.** A surface is exclusive when only one worker can hold it at a time: a file that cannot be merged (binary, generated, or one whole-file asset), a shared migration sequence, one device, environment or running service. Tickets that share one get an edge between them even when neither needs the other's result: the ticket that unblocks more goes first. Name the surface on the edge ("shared surface: <surface>"), so nobody mistakes it for a result dependency.

Write each **acceptance criterion** as pass/fail: an observable behaviour, an output, a command result or a file anyone can check the same way. Wording that needs judgement ("clean", "intuitive", "fast enough", "well tested", "where appropriate") becomes the measure behind it; when there is no measure to name, ask the user for one.

**Shared `task end` checks get one final ticket.** A criterion for a `task end` check (cost tiers are in the project's check commands) whose result other tickets' merges can change goes in one final ticket, blocked by every ticket it covers, instead of in each ticket.

**PR groups split a breakdown with more than one semantic part.** When the work has several meaningful parts, such as one per skill of a new pack, propose **PR groups**: each group is one semantic part, delivered as one PR of a stack, numbered from 1 at the bottom of the stack. `/implement-spec` delivers grouped tickets as that stack. A breakdown with one semantic part gets no groups and no ticket carries the field. The rules:

- Each ticket belongs to exactly one group, or is `none` (below).
- A ticket's blockers sit in its own group or an earlier one, followed through `none` tickets: a grouped ticket blocked through a chain of `none` tickets by another grouped ticket needs that one in its own group or an earlier one too. When no grouping keeps this order, regroup, or offer the work as one PR.
- Work that several groups need (a shared file, type or config) is its own ticket in group 1, and the tickets that build on it are blocked by it.
- An existing issue the breakdown reuses gets a group like any ticket, shown in the quiz with the change it needs: its PR group field added, which happens only as the user approves. An existing issue that lands outside this stack, before it, is named as a prerequisite instead, with no group.
- A ticket that produces no commits (an eval, research, a decision, a manual check) gets `none` with a short reason, such as `none (eval, no commits)`. `none` tickets are outside the ordering rule in both directions: they may block, or be blocked by, a ticket in any group, and only the grouped tickets at the two ends of a chain through them are ordered.

Add a **Proof** note to a ticket that test-first work cannot prove (a visual result, a manual or device run, a measurement, a step only a human can perform): how to prove it is done. When nothing can prove it, write "none" with the reason. A ticket that tests prove carries no Proof note.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first, with the surface named on each exclusive-surface edge
- **What it delivers**: the end-to-end behaviour this ticket makes work
- **Proof**: the note, when the ticket has one
- **PR group**: `<position>. <name>` or `none (<reason>)`, when you proposed groups

List the existing issues that cover part of the work, and what each replaces.

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it, or share an exclusive surface with them?
- Should any tickets be merged or split further?
- When you proposed groups: are the PR groups and their order right, or should the work be delivered as one PR? On "one PR", no ticket carries the PR group field.

Iterate until the user approves the breakdown.

### 5. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker the project's configuration names; the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md` (unless the configuration names another folder), numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below: one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. If the source was an existing issue, make each ticket its sub-issue (tracker doc's operation). Apply the `ready-for-agent` triage label unless instructed otherwise; the tickets are agent-grabbable by construction.

Before creating each ticket, search the tracker for it once more; one found since the quiz is shown to the user instead of duplicated. An existing issue changes only as the user approved in the quiz.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, each exclusive-surface edge with its surface named, or "None (can start immediately)".

**PR group:** `<position>. <name>`, position 1 being the bottom of the stack, or `none (<reason>)`. Omit when the breakdown has no PR groups.

**Status:** ready-for-agent

**Proof:** how to prove it is done, or "none" with the reason. Omit when tests prove it.

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective, not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Proof

How to prove it is done, or "none" with the reason. Omit this section when tests prove it.

## PR group

`<position>. <name>`, position 1 being the bottom of the stack, or `none (<reason>)`. Omit this section only when the breakdown has no PR groups; keep it when "Blocked by" is left out.

## Blocked by

- A reference to each blocking ticket, with the surface named on each exclusive-surface edge, or "None (can start immediately)". Omit this section when blockers were set as native edges; the surface then goes in "What to build".

</issue-template>

Write each ticket for the agent that works from it: when `writing-for-agents` is installed, follow it for the prose. In either form, avoid specific file paths or code snippets: they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

### 6. Offer the next step

Once the tickets and their edges are published, offer one next step with the reason for choosing it, as this harness writes the invocation:

- `/implement <ticket>` when the user wants a selected ready ticket built: one ticket on the frontier, or tickets to be taken one at a time.
- `/implement-spec <parent or spec>` when the whole graph should be worked through and integrated.
- When the tickets carry PR groups, offer `/implement-spec`: only it delivers the approved stack. Offer `/implement <ticket>` for grouped work only with that warning, since it builds one ticket with no stack.

The user starts it; you never run it. When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.
