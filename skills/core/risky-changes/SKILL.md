---
name: risky-changes
description: Use when a change touches a public API, transforms or drops data, or changes pricing, quotas, a default, or a provider or model parameter.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/risky-changes"
  opencode/autoinvoke: "true"
---

# Risky changes

Tests check correctness; measurement checks usefulness. A change of this kind can pass every test and still break the feature on real data, so it ships on numbers from real data and the approver's sign-off.

Done when every assumption the change rests on has a status, the change's numbers on real data are in an evidence record at the configured path, and the record holds the approver's sign-off, or says `approval pending` with the same words on the PR's **Not done** line and nothing shipped.

## 1. Read the configuration

The project states two facts in its evidence fact file: the file the `## Agent skills` block of its `AGENTS.md` or `CLAUDE.md` names for evidence, else `docs/agents/evidence.md`.

- **Evidence record path**: the folder evidence records go in. Default: `docs/evidence/`.
- **Approver**: who signs off a risky change. Default: the owner in this session.

A missing file or a missing field takes its default.

## 2. List the assumptions

Write down every assumption the change's safety rests on: what the real data looks like (shapes, frequencies, nulls, edge cases), who relies on the current behaviour, what callers or customers will see or pay. Give each a status:

- **verified**: name the evidence (a query result, a measurement, a log sample, a document).
- **unvalidated**: no evidence yet. Step 3 measures it, or the record names it as a gap.
- **contradicted**: the evidence shows it false; name the evidence.

Update the statuses as step 3 produces evidence. A contradicted assumption reopens the change: rethink it, and put the options to the approver in the record's verdict.

## 3. Measure against real data

Run the change against realistic cases drawn from real data: production samples, logs, recorded requests, the real endpoint or provider. Measure through read-only access. Measure before and after when both can run, and give every case numbers: how often the new behaviour occurs, how many rows, requests or users it affects, and the accuracy, cost or latency it moves. Judge subjective quality blind, against criteria written before the run.

How much evidence is enough is the project's call, settled with the approver; there is no fixed case count. Cover the shapes the real data holds (the common case, the edge cases and the cases the change targets), and say in the record why the set is enough.

Ask the project's listed pack guides for measuring a change against real data for this stack. Use the answer inside this measurement; a lookup never starts a pack's workflow. People's reports of how a change feels are their own evidence class: record the ones that already exist, as reported, beside the numbers and never as measurements, and start no session or workflow to collect more.

Each number is a claim: when `verifying` is installed, vet the numbers with it. A result that does not separate before from after is **inconclusive**. When no real data is reachable, the record says **not measured** and what would measure it, and the decision goes to the approver.

## 4. Record the evidence

Write one record per change at `<evidence record path>/<YYYY-MM-DD>-<change>.md`, creating the folder when needed, and commit it with the change. Record aggregates, counts and redacted examples; personal data and secrets stay in the source.

```md
# <the change, in one line>

**Date:** <YYYY-MM-DD> · **Tree:** <commit, marked dirty when uncommitted>

## Assumptions
| Assumption | Status | Evidence |
|---|---|---|

## Cases
Data source: <where the cases came from and how they were picked>. Enough because: <why this set covers the real data>.

| Case | Before | After | Note |
|---|---|---|---|

## Reports
<people's reports, as reported; or none>

## Verdict
<what the numbers show; inconclusive or not measured where that is the result>

## Approval
<approver>: approved on <date> for <the behaviour approved> | approval pending

## Post-ship check
<what to re-measure on real traffic within a day of shipping, and the number that would mean trouble>
```

## 5. Get the approver's sign-off

Show the approver the decisions that change what callers or customers see or pay, with the record's numbers, and ask for approval. An existing approval counts only when it covers the behaviour that will ship. When the approver is someone other than the person in this session, hand that person the request to pass on. Write the answer under **Approval**.

Until sign-off is recorded, and always when running unattended, write `approval pending` under **Approval** and on the PR's **Not done** line, and leave the change unmerged, unreleased and undeployed.
