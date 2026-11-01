---
name: risky-changes
description: Use when a change changes a public API, transforms or drops data, or changes pricing, quotas, a default, or a provider or model parameter.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/risky-changes"
  opencode/autoinvoke: "true"
---

# Risky Changes

A filter once passed every test but disabled ~99% of the feature on live data. Tests check correctness; measurement checks usefulness.

Done when every assumption the change rests on has a status, the change's numbers on real data are in an evidence record at the configured path, and the record holds the approver's sign-off, or says `approval pending` with the same words on the PR's **Not done** line and nothing shipped.

## 1. Read the configuration

The project states two facts in its evidence fact file: the file the `## Agent skills` block of its `AGENTS.md` or `CLAUDE.md` names for evidence, else `docs/agents/evidence.md`.

- **Evidence record path**: the folder evidence records go in. Default: `docs/evidence/`.
- **Approver**: who signs off a risky change. Default: the owner in this session.

A missing file or a missing field takes its default.

## 2. Identify assumptions

List the assumptions the change depends on: what real-world data looks like (frequencies, shapes, nulls and edge cases), who relies on the current behavior, and what callers or customers will see or pay. Give each a status:

- **verified**: shown by a measurement or query you ran on named data; name the run and the data.
- **unvalidated**: no such run backs it yet. Step 3 measures it, or the record names it as a gap.
- **failed**: the evidence contradicts it; name the evidence.

Update the statuses as step 3 produces evidence. If evidence contradicts an assumption, reconsider the design, and put the options to the approver in the record's verdict. If measurement is unavailable or inconclusive, state the gap; do not treat the assumption as verified.

## 3. Measure real behavior

Run realistic cases drawn from real data (production samples, logs, recorded requests) against the real endpoint or provider:

- Base cases on real usage; vary topics, parameters, languages, and edge conditions.
- Define benchmarks per case: speed, quality, accuracy, cost, how often the new behavior occurs, and how many rows, requests or users it affects.
- Use hard numbers where possible. For subjective quality, use blind judging against criteria written before the run.
- Compare before and after when both can be measured.
- Measure through read-only access. Read-only production analysis also counts as measurement.

How much evidence is enough is the project's call, settled with the approver; there is no fixed case count. Cover the shapes the real data holds (the common case, the edge cases and the cases the change targets), and say in the record why the set is enough.

Ask the project's listed pack guides for measuring a change against real data for this stack. Use the answer inside this measurement; a lookup never starts a pack's workflow. People's reports of how a change feels are their own evidence class: record the ones that already exist, as reported, beside the numbers and never as measurements, and start no session or workflow to collect more.

Each number is a claim: when `verifying` is installed, vet the numbers with it. A result that does not separate before from after is **inconclusive**. When no real data is reachable, the record says **not measured** and what would measure it, and the decision goes to the approver.

## 4. Record the evidence

Save the cases and results at `<evidence record path>/<YYYY-MM-DD>-<change>.md`, one record per change. Create the folder if needed, and commit the record with the change. Without this record, the change is not verified. Unit tests do not replace live measurement. Record aggregates, counts and redacted examples; personal data and secrets stay in the source.

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
<approver>: approved on <date> for <the behavior approved> | approval pending

## Post-ship check
<within one day of shipping, what to measure on real traffic through read-only production analysis or a live sweep, and the number that would mean trouble>
```

## 5. Confirm the approver's sign-off before shipping

Present decisions that affect what customers see or pay, with the record's numbers. Get the approver's sign-off for those decisions; do not bury them in a plan or code default. Existing approval counts only if it covers the actual behavior being shipped. When the approver is someone other than the person in this session, hand that person the request to pass on. Write the answer under **Approval**.

Until sign-off is recorded, and always when running unattended, write `approval pending` under **Approval** and on the PR's **Not done** line, and leave the change unmerged, unreleased and undeployed.
