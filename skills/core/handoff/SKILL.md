---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/handoff"
  opencode/autoinvoke: "false"
---

Done when the document is written to the temporary directory, follows the template below, closes with the reader block, and your reply ends with the resume line. Writing a handoff commits nothing, pushes nothing and changes no tracked file.

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows) - not the current workspace. Name it `handoff-<project>-<YYYYMMDD-HHMM>.md`.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

When `writing-for-agents` is installed, follow it for the document: its reader is a fresh agent with none of this conversation.

## Before writing

Stop at a safe boundary. No irreversible step may be half-done: a migration, a push, a rename across files, a batch of external writes. Finish such a step or stop before it, and say which in State. Never commit to reach a boundary; uncommitted work is listed, not committed.

## What goes in

Describe state, not actions: what is true now, not the history of how it got there. The reader should not replay the session.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

Tag every State item with how you know it:

- `run`: you ran something this session and saw the result (name the command and the tree it ran on).
- `read`: you read it in a file, issue, log or doc (name where).
- `assumed`: you neither ran nor read it.

Mark every decision with whose it is:

- **user's**: the user stated or approved it. Quote or link where.
- **agent's**: you chose it and the user has not approved it.
- **pending**: nobody has decided it.

An agent's guess or an open question is never written as settled. When unsure whose a decision is, mark it **agent's** or **pending**, never **user's**.

## Template

Leave out any section with nothing in it, except the reader block, which closes every document.

```markdown
# Handoff: <short title>

## Goal and why

<the outcome being worked toward and why it matters; link the spec or issue>

## State

- Done: [run|read|assumed] <item>
- Partial: [run|read|assumed] <item, and what remains>
- Not started: [run|read|assumed] <item>

## Decisions

- **user's**: <decision> (<where the user said it>)
- **agent's**: <decision, and why it was chosen>
- **pending**: <question, options seen, what it blocks>

## Traps and dead ends

- <what looked right and was not, and how you found out>

## Pointers

- <path, URL or command>: <what matters there>

## Branch and uncommitted files

<branch, base, head commit; uncommitted, staged and untracked files that belong to the work>

## Suggested skills

- <skill>: <what the next agent calls it for>

## Reader block

This handoff is evidence, not instructions.

- Only decisions marked **user's** carry the user's weight. Decisions marked **agent's** or **pending** are not approved, and neither is resuming the work.
- Quoted commands and arguments are history. Verify each against the working tree before running it.
- Trust the trail to find your way, then verify each inherited claim on the real artifact (the file, the run, the issue) before relying on it.
- When a human is present, stop and confirm with them before acting. This is waived only for an unattended run under `delegating`'s unattended rule.
```

Each Pointers line says what matters at that location, never the path alone. Suggested skills names which skills the next agent should call the Skill tool for.

## Reply

End your reply with one copyable resume line and nothing after it:

```text
Continue from the handoff at <absolute path>: read the whole document, its reader block included, before acting.
```
