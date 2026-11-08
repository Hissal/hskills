---
name: constraints
description: Turn the project's quality bar into enforceable checks, through a short interview with a default for each question; place each check by cost, rank it by how hard it is to fake, ratchet measured values, and put a floor guard into the project that fails a change reaching green the cheap way.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/constraints"
  opencode/autoinvoke: "false"
---

# Constraints

A quality bar written only as prose is read, and then followed or not. This skill makes the project's bar mechanical: each part of it becomes a check with a command, placed where its cost lets it run, and measured values become ratchets that only tighten. Under all of it sits the **floor**. An agent that hits a red check takes the cheapest road to green: it silences the checker, skips or deletes the test, stubs the work, or lowers the bar it was measured against. The **floor guard** catches those moves in the diff, so the bar cannot drop without someone seeing it.

Done when the project holds a guard copy that `--compare` reports `current`, or a differing copy the owner chose to keep; its data file sits beside it; each check the owner accepted has its row in the check-commands file with a cost tier, or the report says why it has none; every ratchet records a value measured on a named tree; at least one check is External, or the report says why none is; each prose rule the owner gave is in the project's standards file, or the report says why it is not; every new or changed check has run once on the current tree with its real exit code recorded; and the report is written.

A check already configured that has broken (its command no longer starts, or its row names a moved file) is repaired in the task that found it, not left for a later run of this skill.

## The guard

The guard is a bundled script: [floor guard](scripts/floor-guard.mjs). It needs Node 18 or newer and git. Run it with `--help` first and treat it as a black box: work from its help and its `KEY: value` output, not its source.

It diffs the merge base against the working tree, untracked files included, and reports each floor move as `VIOLATION: <rule> <location>`, never the matched text. Exit 0 is clean, 1 is a violation, 2 means it could not run; a 2 is never a pass.

Its data file sits beside the copy, with the same name and `.json`. The guard reads only this file. It holds:

- **ratchets**: measured values the project must not fall back from, each with which way is better. Write a value only from a measurement on a named tree; never invent a target.
- **exceptions**: floor exceptions, each exempting one rule on one path glob, with a reason, an owner and an expiry. They are the owner's to add. A new or changed exception is itself a violation until it reaches the merge base.
- **patterns**: the project's own suppression, suppression-end (a block suppression's closing marker), stub, skip, test-file and assertion forms, added to the guard's stack-neutral defaults.

Tightening the data file passes silently; loosening it is a violation. Commit the copy and its data file with the project: the guard compares against the merge base, so it protects a change only once they are in it.

## 1. Find the copy

Read the project's check-commands file, linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. A `task end` row whose "What it checks" starts with `Floor guard` names the copy in its command; that path is the copy. With no such row, ask where the copy should go, offering `tools/floor-guard.mjs`. The path must end in `.mjs`.

## 2. Install or refresh it

From the project root, run the bundled guard with `--compare <path>` and act on `GUARD_STATE`:

- **missing**: run the bundled guard with `--install <path>`. It writes the stamped copy and, when absent, an empty data file. It never overwrites a data file.
- **current**: nothing to install.
- **outdated**: the copy is an unedited install of a different guard. Offer the update, naming `COPY_VERSION` and `BUNDLED_VERSION`. When `UPDATE_LOOSENS` is `yes`, say so first and loudly: the update would weaken the floor, and `LOOSENED` lists each rule or pattern it drops. When it is `unknown`, say as loudly that the update may weaken the floor: the copy is the same version with a different body, a newer version than the bundled guard (a downgrade), or its rules could not be read. On the owner's yes, run `--install <path> --replace`; otherwise keep the copy and report it as outdated.
- **edited**: the copy changed since it was stamped or lost its stamp, and the guard reports it as `guard-edited` until it is restamped. Show the owner how the copy differs from the bundled guard before offering the update, since replacing discards the edits, with the same loosening warning. Replace only on the owner's yes.

When `DATA_STATE` is `invalid`, leave the file as it is: the guard exits 2 until it is fixed. Name the problem the guard's run reports.

The guard's check command is `CHECK_COMMAND` from the install output, run from the project root. When the project has no `origin/HEAD`, `origin/main` or `origin/master`, add `--base <ref>` naming its main branch.

## 3. Detect before you ask

With no owner present to answer, skip to [Unattended runs](#unattended-runs). Otherwise never ask what the project shows. Before the first question, read:

- the stack: its manifests and build files;
- the checks it already runs: the check-commands file's rows, linter, analyzer, formatter and type-checker configuration, the test runner, and the CI configuration;
- the standards file: the guide the `### Style guide` pointer in the `## Agent skills` block names, else `CODING_STANDARDS.md` or `CONTRIBUTING.md`;
- the ratchets the data file already records.

Ask the project's listed pack guides for *the stack's check tools and their cost tiers*; when no guide answers, work from the tools the project already configures. A lookup never starts a pack workflow.

Report what you found in two lines, then ask only what is left.

## 4. Interview

Ask one question at a time, each with a guess from what you detected and a default. "I don't know" accepts the default, and the defaults alone give a working bar. Stop at four questions:

1. **Which dimensions, beyond the floor, should be enforced?** Offer the ones the project can check with what it has or the guides named: types, lint, tests, coverage of changed lines, secrets, dependency vulnerabilities, architecture boundaries, performance or accessibility budgets. Say what each costs to set up, such as a tool to install or a running app to measure. Default: what the project's tooling already checks, plus one External check (see [step 5](#5-place-and-rank-the-checks)).
2. **What is the slowest check you will wait for before work is handed back?** Default: about 90 seconds at task end; anything slower runs in CI.
3. **Which measured values should be held where they are today?** Default: every number the chosen checks report, such as a coverage percentage, a warning count or a bundle size, held at today's value. A target the project does not meet today is not set: the ratchet starts from the measurement and tightens from there.
4. **Is there a rule you hold that no check here can enforce?** Default: none. Each answer becomes a prose rule.

## 5. Place and rank the checks

Give every check its command and a cost tier, in the check-commands file's words:

- **edit loop**: seconds, run while editing; scope it to the changed file where the tool allows.
- **task end**: once before the work is called done, within question 2's budget.
- **CI**: too slow for task end, or needs an environment the agent lacks. Scope a slow tool to the diff before moving it to CI: run on the files a change touched, it often fits task end.

Cost decides placement: a check that stalls the loop gets switched off, and a switched-off check is worse than none, since the bar still looks like it exists.

Rank every check by one question: could an agent make it pass with code that does not work?

- **External**: the verdict comes from outside the project's own code, such as a vulnerability database, a published standard or a measurement of the running program. The agent cannot argue with it.
- **Project**: rules a human owns in a configuration file: lint rules, analyzer settings, layer boundaries.
- **Suite**: the project's own tests. Most useful, and the only fully circular kind.

At least one External check is required. When the project has none, propose one from what the guides named or the stack offers; when the owner declines, or none fits, say so on the **Not done** line.

## 6. Ratchet the measured values

For each value from question 3, run its measuring command on the current tree, record the exit code and the tree, and write the value to the data file under `ratchets`, with `better` set to `higher` or `lower`. Never write a value no run produced.

The guard compares a new measurement with the recorded one: `--ratchet <name> <measured>` exits 0 when the value held or improved and 1 when it regressed. The ratchet's check command measures and passes the number to it, in the project's own scripting where it has some, such as a script that prints the measurement and then calls the guard copy with it. The measuring step must exit non-zero, or print no number, when it fails, so a failed measurement exits 2 and never passes.

When a measurement improves (`RATCHET_STATE: improved`), write the new value to the data file: tightening is silent. Never lower a recorded value to make a check pass; the guard reports that as `ratchet-loosened`, and only the owner loosens the bar.

## 7. Write the outputs

Each part goes to its one place:

- **Check commands with cost tiers**: rows in the check-commands file, in its columns (Command, What it checks, Cost tier). Add the guard's row, a `task end` row whose "What it checks" starts with `Floor guard`:

  | Command | What it checks | Cost tier |
  | ------- | -------------- | --------- |
  | `node tools/floor-guard.mjs` | Floor guard: fails a cheap road to green in the diff against the merge base (0 clean, 1 violation, 2 could not run) | task end |

  Add a row for each new check and each ratchet. Update an existing row only when its command or tier changed, showing the owner the change first; change no row this run did not touch. When the project has no check-commands file, write none and tell the owner to run `/setup-project`, which owns that file.
- **Prose quality rules**: in the project's existing standards file from step 3, each rule as one line in the file's own style, so `code-review` reads it with the rest of the project's standards. When the project has no standards file, create none and tell the owner to run `/setup-project`, which chooses one; list the rules on the **Not done** line.
- **Ratchets and floor exceptions**: in the data file. Add an exception only when the owner asks for it, with a reason, an owner and an expiry (default: 90 days from today).

Write no `CONSTRAINTS.md` and edit no always-on file: `AGENTS.md`, `CLAUDE.md` and the like.

## 8. Run them once

Run every new or changed check command, the guard's included, on the current tree, and record each exit code before reading the output. Report each violation by rule and location. A command that cannot start keeps no row: report it with its next step. An exit 2 from the guard is a blocker: report its reason and fix what the guard names, such as a missing base ref or an invalid data file.

## 9. Report

- The copy's path, `GUARD_STATE` before and after, and the version.
- The data file's path and state, with each ratchet written: its name, value, direction and the tree it was measured on.
- Each check-commands row written or updated, with its tier and rank (External, Project or Suite), or why none was.
- The prose rules written and the file they went to.
- The runs: command, tree, exit code and each violation.
- **Not done**: everything left open, such as a declined update, no External check, a missing check-commands or standards file.

The guard runs at task end through the configured command. CI runs the same copy only when the owner asks for it, as a job with the repository's full history, since the guard needs the merge base. There is no git hook: the owner's own commits stay unblocked.

Then offer, only when the condition was observed, the invocation as this harness writes it:

- **`/wizard`**: at the blocker, when a sequence only the owner can perform (installing a tool machine-wide, granting a CI job access to a scanner, enabling a service) blocks a check and an interactive procedure would materially help. A single approval or value is asked for directly.

A suggestion is the owner's to start; you never run it.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.

## Unattended runs

When no owner is present to answer, ask nothing, and run steps 1, 2 and the guard's part of 7, 8 and 9 only:

- Install a missing copy at the path the check-commands file names, else at `tools/floor-guard.mjs`, with the default rules.
- Refresh an `outdated` copy only when `UPDATE_LOOSENS` is `no`. Keep an `edited` copy, or one whose `UPDATE_LOOSENS` is `yes` or `unknown`, as it is, and put the reason on the **Not done** line.
- Invent no ratchet values, add no exceptions or patterns, and write no prose quality rules.
- Put "interview not run" on the **Not done** line.
