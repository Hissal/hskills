---
name: constraints
description: Put a floor guard into the project, a diff check that fails when a change reaches green the cheap way (a new suppression, a skipped or deleted test, a stub, a loosened ratchet or a new exception), and record it as the task-end check.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/constraints"
  opencode/autoinvoke: "false"
---

# Constraints

An agent that hits a red check takes the cheapest road to green: it silences the checker, skips or deletes the test, stubs the work, or lowers the bar it was measured against. The **floor guard** catches those moves in the diff, so the bar cannot drop without someone seeing it. This skill puts a copy of the guard into the project, keeps that copy current, and records running it as the project's task-end check, so the agent and CI run the same guard.

Done when the project holds a guard copy that `--compare` reports `current`, or a differing copy the owner chose to keep; its data file sits beside it; the check-commands file has its row, or the report says why it has none; the copy has run once on the current tree with its real exit code recorded; and the report is written.

## The guard

The guard is a bundled script: [floor guard](scripts/floor-guard.mjs). It needs Node 18 or newer and git. Run it with `--help` first and treat it as a black box: work from its help and its `KEY: value` output, not its source.

It diffs the merge base against the working tree, untracked files included, and reports each floor move as `VIOLATION: <rule> <location>`, never the matched text. Exit 0 is clean, 1 is a violation, 2 means it could not run; a 2 is never a pass.

Its data file sits beside the copy, with the same name and `.json`. The guard reads only this file. It holds:

- **ratchets**: measured values the project must not fall back from, each with which way is better. Write a value only from a measurement on a named tree; never invent a target.
- **exceptions**: floor exceptions, each exempting one rule on one path glob, with a reason, an owner and an expiry. They are the owner's to add. A new or changed exception is itself a violation until it reaches the merge base.
- **patterns**: the project's own suppression, stub, skip, test-file and assertion forms, added to the guard's stack-neutral defaults.

Tightening the data file passes silently; loosening it is a violation. Commit the copy and its data file with the project: the guard compares against the merge base, so it protects a change only once they are in it.

## 1. Find the copy

Read the project's check-commands file, linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. A `task end` row whose "What it checks" starts with `Floor guard` names the copy in its command; that path is the copy. With no such row, ask where the copy should go, offering `tools/floor-guard.mjs`. The path must end in `.mjs`.

## 2. Install or refresh it

From the project root, run the bundled guard with `--compare <path>` and act on `GUARD_STATE`:

- **missing**: run the bundled guard with `--install <path>`. It writes the stamped copy and, when absent, an empty data file. It never overwrites a data file.
- **current**: nothing to install.
- **outdated**: the copy is an unedited install of a different guard. Offer the update, naming `COPY_VERSION` and `BUNDLED_VERSION`. When `UPDATE_LOOSENS` is `yes` or `unknown`, say so first and loudly: the update would weaken the floor, and `LOOSENED` lists each rule or pattern it drops. On the owner's yes, run `--install <path> --replace`; otherwise keep the copy and report it as outdated.
- **edited**: the copy changed since it was stamped, and the guard reports it as `guard-edited` until it is restamped. Show the owner how the copy differs from the bundled guard before offering the update, since replacing discards the edits, with the same loosening warning. Replace only on the owner's yes.

When `DATA_STATE` is `invalid`, leave the file as it is: the guard exits 2 until it is fixed. Name the problem the guard's run reports.

## 3. Record the check command

The check command is `CHECK_COMMAND` from the install output, run from the project root. When the project has no `origin/HEAD`, `origin/main` or `origin/master`, add `--base <ref>` naming its main branch.

In the check-commands file, add the guard's row, or update the existing one when the command changed:

| Command | What it checks | Cost tier |
| ------- | -------------- | --------- |
| `node tools/floor-guard.mjs` | Floor guard: fails a cheap road to green in the diff against the merge base (0 clean, 1 violation, 2 could not run) | task end |

Change no other row. When the project has no check-commands file, write none and edit no `AGENTS.md` or `CLAUDE.md`: tell the owner to run `/setup-project`, which records a floor guard the project already has.

## 4. Run it once

Run the check command on the current tree and record the exit code before reading the output. Report each violation by rule and location. An exit 2 is a blocker: report its reason and fix what the guard names, such as a missing base ref or an invalid data file.

## 5. Report

- The copy's path, `GUARD_STATE` before and after, and the version.
- The data file's path and state.
- The check-commands row written, or why none was.
- The run: command, tree, exit code and each violation.
- **Not done**: everything left open, such as a declined update or a missing check-commands file.

The guard runs at task end through the configured command. CI runs the same copy only when the owner asks for it, as a job with the repository's full history, since the guard needs the merge base. There is no git hook: the owner's own commits stay unblocked. Write no `CONSTRAINTS.md` and edit no always-on file: `AGENTS.md`, `CLAUDE.md` and the like.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.

## Unattended runs

When no owner is present to answer, ask nothing:

- Install a missing copy at the path the check-commands file names, else at `tools/floor-guard.mjs`, with the default rules.
- Refresh an `outdated` copy only when `UPDATE_LOOSENS` is `no`. Keep an `edited` copy, or one whose update loosens, as it is, and put the reason on the **Not done** line.
- Invent no ratchet values, add no exceptions or patterns, and write no prose quality rules.
- Put "interview not run" on the **Not done** line.
