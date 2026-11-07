# Behavioural evals

A by-hand procedure for testing whether a selected skill changes what an agent
does. Hand-run only, like the [trigger eval](trigger-evals.md): runs spend tokens
and need authenticated harnesses. No skill has to pass a behavioural eval; pick
one when its behaviour matters enough to measure.

The trigger eval asks whether a skill fires. This procedure asks what happens
once it has: the skill is invoked explicitly, so firing is never under test here.

## When to run

In a build split into tickets, run behavioural evals once, after every ticket
merges, with the trigger evals. Per ticket, run only the cheap checks. See
[Evals in multi-ticket builds](trigger-evals.md#evals-in-multi-ticket-builds).

## Procedure

Do the steps in order. Each step ends on the condition written after **Done**.

### 1. Write the bar

Before you edit the skill, write the bar: the observations that make one run a
pass, and the pass count over all repetitions that makes the skill pass.
Write each observation so a reader can check it on the files and transcript
alone ("`tally.txt` exists with one line per word"; "no file write before the
plan is shown"). Record the bar where the results will go (the issue or PR for
the change) before the first run.

Pick observations an agent without the skill could plausibly miss. Prefer
observations on what the output contains and whether it is correct over the
absence of an action any agent avoids unasked: an agent not asked to edit does
not edit. The prompt gives the task only, never the behaviour under test. The
prompt of #137 (the `handoff` eval) said nothing was approved, so the control
kept its guess unapproved too, and the case tested the prompt, not the skill
(owner rulings on
[#137](https://github.com/Hissal/skill-collection/issues/137#issuecomment-6708124892)
and on [#140](https://github.com/Hissal/skill-collection/issues/140#issuecomment-6708125077),
the `retro` eval).

**Done** when the bar is recorded, every observation in it is checkable on the
files and transcript, and the prompt does not state the behaviour under test.

### 2. Build the fixture

The fixture is a scratch project outside this repository: a `git init` with a
committed baseline, so `git status --porcelain` shows everything a run produced.
Make one copy per run. Prepare two arms with the same prompt:

- **Skill arm**: the skill installed in the project scope
  (`.claude/skills/<name>/` for Claude, `.agents/skills/<name>/` for Codex,
  `.opencode/skills/<name>/` for OpenCode), plus any skills it requires.
- **Control arm**: the same project with no guidance for the task installed.

User-scope skills and configuration still load in a headless session. List
them, and confirm none of them names or covers the task under test.

**Done** when both arms exist and you have recorded harness versions, model
IDs, installation scopes and the user-scope material that loads.

### 3. Run

Use the models of the [trigger eval](trigger-evals.md): by default the frontier
labels `Opus` and `Sol`; a full run adds the lower tiers and OpenCode Go models
when a skill is added or reworded or a new model ships. Run at least five
repetitions per arm per model. Each run is a fresh process and session in its
own fixture copy, with no continuation flags. Save every transcript:

```
claude -p "<prompt>" --model opus --permission-mode acceptEdits --output-format stream-json --verbose > run.jsonl
codex exec --json --model <sol-model-id> --sandbox workspace-write '<prompt>' > run.jsonl < /dev/null
opencode run --format json --model <provider/model> "<prompt>" > run.jsonl
```

Grant the write permission the task needs in both arms, so a pass is the
agent's choice and never forced by a sandbox.

**Done** when every arm and model has its repetitions and every transcript is saved.

### 4. Grade

Grade each run against the bar on two sources:

- **Files produced**: `git status --porcelain` and `git diff` against the
  baseline, and the contents of every new file.
- **Transcript**: read it end to end. Note what the agent read, each tool call
  and file write, and where its path diverged from other runs.

Grade what the run found or did on its merits, not only by exact match to an
expected list. An item worded differently from the bar still meets the
observation it matches; a correct finding the bar did not list is recorded in
the run's favour but never stands in for a missed observation; a wrong one
counts against the run.

Report the pass count per arm per model (`4/5`). Variance is a metric: runs
that disagree mean the behaviour is unreliable, and a split count is a finding
in itself, never rounded to a pass. The skill passes when every frontier model
meets the bar's pass count. Lower-tier misses are advisory, as in the trigger
eval. The control arm shows what agents do by default. An observation the
control also meets is default behaviour: record it, and never count it against
the skill. When the control meets the whole bar, the case cannot show what the
skill adds; sharpen the bar or prompt in a later case.

A run whose prompt states the behaviour under test proves nothing either way:
a pass only shows the agent followed the prompt. Count none of its runs, fix
the prompt, and rerun both arms.

**Done** when every run has a verdict per bar observation and every differing
path in the transcripts is explained.

### 5. Classify failures

Classify each failing run before you rewrite any skill text:

- **Fixture**: the scenario or bar is wrong: an ambiguous prompt, a bar that
  rewards the wrong thing, or user-scope material leaking guidance. Fix the
  fixture or bar, then rerun both arms.
- **Harness**: the run never tested the skill: a permission or sandbox denial,
  a tool error, a timeout, a malformed transcript, or the skill missing from
  the listing. Fix the setup, then rerun.
- **Routing**: the agent never reached the material: a reference or required
  skill went unloaded because its pointer did not fire. Sharpen the pointer
  wording, then rerun; if it is the skill's description, rerun the trigger eval
  too.

A failure that is none of these, where the agent loaded and read the material
and still missed the bar, is a fault in the skill text. Rewrite the skill only
then, and rerun the full eval against the unchanged bar.

**Done** when every failing run has one class and its fix is applied or recorded.

### 6. Record

Post the results where the bar was recorded: bar, date, harness versions, model
IDs, repetitions, pass count per arm per model, each failure's class, and
anything unexpected in the transcripts.

## Required case: missing hard requirement

This case proves the [runtime stop rule](skill-format.md#hard-requirements-at-runtime)
on a real harness. Rerun it when the shared stop template changes, when a
harness pin is bumped, and when a new frontier model ships.

The fixture pair is [`tally`](../scripts/eval/behaviour/fixture/tally/SKILL.md),
which requires `tally-rules` (`hissal.skill-collection/eval-tally-rules`) and
carries the shared stop template, and
[`tally-rules`](../scripts/eval/behaviour/fixture/tally-rules/SKILL.md) itself. Install only `tally` in the
skill arm. Confirm no user-scope skill is named `tally-rules`.

- **Prompt**: `/tally rhythm, banana, sky` for Claude, `$tally rhythm, banana, sky`
  for Codex.
- **Bar per run**: `git status --porcelain` is empty; the transcript shows no
  file write or edit; the final message starts `Stopped:` and names
  `tally-rules` and `hissal.skill-collection/eval-tally-rules`.
- **Pass count**: 5/5 on each frontier model.
- **Control arm**: install both skills. A no-guidance control cannot show a
  stop, so the control proves the stop comes from the missing requirement: each
  run writes `tally.txt` as `rhythm: 1`, `banana: 3`, `sky: 1`.

## Case: retro finds an incident nobody commented on

This case proves `retro` reports a costly incident the user never mentioned,
beside the corrections the user did make. Rerun it when `retro`'s coverage or
report wording changes.

The fixture is the [`retro-session`](../scripts/eval/behaviour/fixture/retro-session/)
folder: copy it as the scratch project. `session.jsonl` is a Claude Code
transcript of one session that hands two changes to `src/report.js` to two
delegates, whose transcripts are under `session/subagents/`.

- **Uncommented**: `test/export.test.js` times out on 10 of 14 runs. Both
  delegates re-run it on the base commit to prove the failure is not theirs,
  and about 40 minutes of wall time go on re-runs. Nobody mentions it.
- **Commented**: the user makes three corrections in the main session: use
  `format: 'json'`, make the csv header lowercase, and run the tests.

Install `retro` and `writing-for-agents` in the skill arm.

- **Prompt**: `/retro the session in session.jsonl` for Claude,
  `$retro the session in session.jsonl` for Codex.
- **Bar per run**: `git status --porcelain` is empty; the transcript shows no
  file write or edit inside the project; the final message has an item, or a
  dropped candidate with its reason, about the export test failing again and
  again (it names `export.test.js`, `exportRows` or `writes the export file`
  and says the test failed or was re-run more than once); it names
  `format: 'json'`; it has no match for `rung\s*\d` (case-insensitive).
- **Pass count**: 4/5 on each frontier model.
- **Control arm**: install `retro` as it was before this case, from commit
  `a7940db` (`git show a7940db:skills/core/retro/SKILL.md`), with
  `writing-for-agents`. A session this small leaves that version little to
  miss, and it may meet the bar too. That makes this case a regression guard:
  the skill passes on its own pass count, and a control pass is recorded, not
  counted against it.
