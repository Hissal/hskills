---
name: hillclimb
description: Improve one measured result, such as load, build or test time or allocations, through one-at-a-time keep-or-revert experiments with a committed log.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/hillclimb"
  agent-skills-sync.requires: '["hissal.skill-collection/verifying"]'
  opencode/autoinvoke: "false"
---

# Hillclimb

Move one number in one direction through experiments. Each attempt tests one hypothesis with a frozen harness and is kept with its own commit or reverted in full. Every attempt, kept or reverted, goes in the experiment log on disk, and the log is the source of truth: read it before each attempt, and resume from it rather than from memory.

Done when the stop condition holds, or you have pushed past a plateau and the log says why each untried hypothesis is not worth its cost, or a blocker stops the run; and in every case each attempt has its row in the log, each kept win has its own commit, the log is committed at the stop, and the report gives baseline to final with a verdict from the number reference.

Before doing any work, load verifying (hissal.skill-collection/verifying) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill verifying (hissal.skill-collection/verifying) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

The needed reference is verifying's [number reference](../verifying/references/NUMBERS.md). Every number this run produces (the harness's separation, the baseline, each attempt, the final result) is a claim, vetted by it before it decides anything.

## 1. Open the log

The log lives under the project's evidence record path. The project states it in its evidence fact file: the file the `## Agent skills` block of its `AGENTS.md` or `CLAUDE.md` names for evidence, else `docs/agents/evidence.md`.

- **Evidence record path**: the folder evidence records go in. Default: `docs/evidence/`.

A missing file or a missing field takes its default.

When a log for this run already exists, read it whole and continue from the step it records. Otherwise work on a branch of the run's own and create one log for the run at `<evidence record path>/<YYYY-MM-DD>-hillclimb-<metric>.md` in [the experiment-log format](references/EXPERIMENT-LOG.md), creating the folder when needed. Write each section as its step finishes.

## 2. Set the objective

- **Metric**: one number, its unit and what produces it.
- **Direction**: lower or higher is better.
- **Stop condition**: a target paired with a minimum number of attempts, both checkable ("at least 30% below baseline and at least 10 attempts"), so a lucky early win cannot end the run.
- **Workload**: a realistic case that shows the problem the owner cares about. When no case shows it, build the case first; there is nothing to climb yet.
- **Regression gate**: the checks that must stay green on every kept attempt, chosen by verifying's rules for choosing checks.

Use the owner's numbers when given; otherwise propose them and agree them. These stay fixed for the run: a target is never relaxed to meet it.

## 3. Build the harness, prove it, freeze it

Ask the project's listed pack guides for measuring performance for this stack. Use the answer for the harness here and the attribution in step 4; a lookup never starts a pack workflow, and when no guide answers, carry on with these steps.

1. **Build** one command that runs the workload and prints the metric as the median and range of several runs, a count of errors and a count of the work done, so a fast failure or skipped work shows.
2. **Prove it separates.** Run it on contrasting workloads: the target case and one that should differ clearly (a smaller input, the costly feature switched off). The numbers must separate beyond their ranges in the expected direction. When they do not, revise the workload or the metric and prove again.
3. **Vet** the harness against the number reference's seven questions.
4. **Freeze** it: commit the harness and its inputs, or the command that generates them, on the run's branch with the log. From here the command, inputs and metric definition stay unchanged. Changing any of them starts a new baseline, recorded in the log.
5. **Baseline**: run the frozen harness on the starting tree and the regression gate, and record both with the tree. A red gate on the baseline stops the run under verifying's rules for a red check. The baseline's run-to-run range is the noise; a win must clear it.

## 4. Attribute the cost

Before proposing any change, find where the metric's cost goes: profile, trace or time the parts of the workload in runs separate from the harness, since instrumentation slows what it watches. Record the parts and their shares in the log. A part's share bounds what changing it can win, so hypotheses start at the largest shares. After each kept win, attribute again on the current best before the next hypothesis: the costs move.

## 5. Climb, one hypothesis per attempt

Read the log, then for each attempt:

1. **Hypothesis**: name the mechanism, grounded in the attribution ("parsing takes 40% because each line is copied twice; parse in place"). A hypothesis the log already shows reverted returns only with what has changed since, written in its row.
2. **Change** only what the hypothesis names.
3. **Measure** with the frozen harness against the current best, run from a separate checkout, interleaving the two, and run the regression gate. When the result sits close to the noise, run the same frozen command again rather than changing it, and check in an attribution run that the part the hypothesis named moved.
4. **Decide**:
   - **Kept** when the metric moves past the noise in the right direction, errors stay at zero, the work count holds and the gate exits 0.
   - **Reverted** otherwise, in full, including any file the attempt created. Neutral is a revert; a win that turns the gate red is a revert.
5. **Log** the row, kept or reverted, before the next attempt starts.
6. **Commit** a kept attempt alone: its files and the log, with the attempt number and before and after in the message. It becomes the current best. After a revert, confirm the tree matches the current best before going on; the reverted row reaches git with the next kept commit or at the stop.

Attempts run one at a time: they share the machine, and often a single resource, such as one editor, device or database. Run attempts in parallel only when the owner asks for it, each in its own isolated copy.

## 6. Push past the plateau

When several attempts in a row are reverted, the climb has reached a plateau, not the top. Change category (algorithm, data layout, I/O, allocation, caching, concurrency, build settings), combine near-misses into one attempt, re-read the hot code, attribute the cost again on the current best, and try a bolder change. Correctness and simplicity outrank the number.

The run stops when the stop condition holds; when, past a plateau, each untried hypothesis has a written reason in the log that it is not worth its cost; or at a blocker, reported as one. This skill sets no token, time or attempt cap; limits the host or owner set still apply.

## 7. Stop and report

1. Measure the final tree against the baseline commit with the frozen harness, interleaved, the baseline running from a separate checkout. Run the regression gate on the final tree.
2. Write the log's **Result** section and status, and commit the log.
3. Report:
   - the metric, direction and stop condition, and whether it was met;
   - the verdict from the number reference, with baseline to final as median, range, run count and bottleneck;
   - attempts run, kept and reverted, and each kept commit on one line;
   - the log's path and commit;
   - what was not investigated, and the best next hypothesis.

When the owner chooses to defer the run or hand it to someone else, and the harness, attribution or log would be costly to rebuild, offer `/handoff` as this host writes it, naming the log and the next hypothesis. A suggestion is the human's to start; you never run it.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.

## Unattended runs

Run unattended only when the owner explicitly asked for this run to proceed without them. An autonomous run that did not ask for `hillclimb` never starts one.

- The objective, stop condition, workload, harness and regression gate stay as set. When the owner set none, choose them, write the reason in the log's **Objective** section, and hold them fixed.
- Keep, revert and commit on the run's own branch without asking. Record consequential choices in the log.
- Stop and report when the run needs a decision only the owner can make, such as changing the objective or the harness.
- A host mechanism that keeps a goal running across turns is a way to drive the attempts where the host offers one; the log stays the source of truth.
