# Experiment log format

One Markdown file per run, at `<evidence record path>/hillclimb/<YYYY-MM-DD>-<metric>.md`. It is the run's source of truth: a reader, or a resumed session, learns from it alone what was set, what was tried and what holds now.

## Rules

- Write each section when its step finishes, and a row as soon as its attempt is decided. The file on disk is updated before the next action.
- Rows are append-only. Never edit or remove one; a correction is a new row whose note names the row it corrects.
- Every number gives the median, the range and the run count, with its unit: `412 ms (405–420, n=7)`.
- **Before** is the current best when the attempt started; **After** is the attempt's own measurement from the same interleaved runs.
- **Verdict** is `kept` or `reverted`. A kept row's commit message names its attempt number, so `git log --grep "attempt <n>"` finds it.
- **Status** at the top reads `running` until the stop, then `stopped: <reason>`.

## Template

```md
# Hillclimb: <metric> on <workload>

**Started:** <YYYY-MM-DD> · **Branch:** <branch> · **Status:** running | stopped: <reason>

## Objective
- **Metric:** <name, unit, what produces it>
- **Direction:** lower | higher is better
- **Stop condition:** <target> and at least <N> attempts
- **Workload:** <the case, and why it shows the problem>
- **Regression gate:** <the commands that must exit 0>
- **Set by:** <the owner | the agent, unattended: why these>

## Harness
- **Command:** `<the one command>`
- **Frozen at:** <commit>
- **Separation:** <target case> <number> vs <contrasting case> <number>
- **Noise:** <baseline run-to-run range>; a kept attempt must clear it

## Baseline
<number, error count, work count> on <tree>; regression gate exit <code>

## Cost attribution
| Part | Share | Evidence |
|---|---|---|

## Attempts
| # | Hypothesis | Change | Before | After | Gate | Verdict | Note |
|---|---|---|---|---|---|---|---|

## Result
<verdict from the number reference; baseline to final; attempts kept and reverted; what was not investigated; the best next hypothesis>
```

Later re-attributions append to **Cost attribution** under a line naming the tree they ran on. A new baseline after a harness change appends to **Baseline** with the reason, and the attempts after it compare against it.
