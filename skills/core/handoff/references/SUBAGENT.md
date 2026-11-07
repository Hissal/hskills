# Subagent destination

`/handoff subagent` (or `sub`) hands a side task to a subagent so this thread stays lean. The handoff document becomes the subagent's standalone brief, and its result comes back to this session.

## Brief

Call the Skill tool with `delegating` and dispatch through it: selection, transport, brief, dispatch summary and return check all follow that skill. The brief is `delegating`'s brief shape with the handoff document as its context:

- **Written against**: the head commit from Branch and uncommitted files, plus "uncommitted changes" when the tree is dirty.
- **Role**: a role agent for the work the free text and Goal name (implementer, researcher), or a helper for a narrow errand.
- **Objective**: the outcome from Goal and why, narrowed by the free text.
- **Authority**: only what the user already granted this session for this work. Decisions marked **agent's** or **pending** are not approvals and grant nothing.
- **Skills to call**: the document's Suggested skills.
- **Validation** and **Stop when**: checks a reader can run on the tree, taken from State and the free text.
- The document follows the brief's fields whole, reader block included, or as a path outside the checkout when it is long.

When a work brief was asked for, map the brief's sections instead:

- **Objective**: Outcome and why, narrowed by the free text.
- **Validation** and **Stop when**: Completion checks.
- **Constraints**: Constraints.
- **Written against** and context: Current state and remaining work and Context and evidence, plus the head commit and whether the tree is dirty, read from the checkout.
- **Pointers**: Pointers.
- The brief follows the fields whole, reader block included.

A brief has no Suggested skills or Branch and uncommitted files: say in the dispatch summary which fields it left empty, and fill Skills to call only from what the user asked for.

When the conversation and the free text cannot fill Objective or Stop when, ask the user one question before dispatching.

The subagent runs unattended: the brief's Unattended line is `delegating`'s unattended rule, which waives the reader block's stop-and-confirm.

## Return

The subagent returns `delegating`'s three-state return (`done`, `blocked` or `needs more scope`). Check it as `delegating` says before reporting it as the result: the report is evidence, not the result.

When the dispatch is blocked or the selection is unavailable, fall back as `SKILL.md` says.

## Reply

Give the subagent's status, what it changed and the evidence you checked, its rulings, the dispatch summary, and the document's path.
