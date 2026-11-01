---
name: migrating
description: Rename, move, replace or retire something others depend on without breaking its consumers.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/migrating"
  opencode/autoinvoke: "false"
---

# Migrating

Change something other code, data or people depend on, and keep every consumer working through the change. The old path and the new path live side by side until nothing uses the old one; only then does the old one go.

Done when every consumer is listed with how it moves, the stages in scope have shipped with the old path still working, the changelog and any consumer notice are written, and the handback names each remaining stage with the evidence that unlocks it.

## 1. Confirm it is a migration

It is a migration when at least one of these holds:

- **Compatibility transition**: old and new must both work for a while.
- **Persisted data**: records, files, saves, caches or queued messages already hold the old shape.
- **Staged rollout**: old and new code run at the same time (a gradual deploy, installed clients that update late, a rollback).
- **Separately updated consumer**: something outside this change uses it: another repository, a published package's users, a script someone runs, another team.

When none holds (the change preserves behaviour and every consumer is in this change and moves with it), it is a refactor and needs no transition. Say so in one line, naming the consumers that move together, and stop.

## 2. Name the change

State the old identity, the new identity and the kind of change:

- **Move**: rename, relocation or replacement by an equivalent. The old name keeps working as a forwarder until the contract stage removes it.
- **Retirement**: something consumers rely on goes away with no equivalent: a feature, an endpoint, a format, a behaviour. Read [retiring](references/RETIRING.md): its decision comes after the consumer list and before the plan, and can end the work there.

## 3. List the consumers first

Before changing anything, search for every consumer of the old path, by kind:

- **Code**: callers, imports, string and reflection lookups, configuration, build and deploy scripts, tests, documentation examples.
- **Serialized data**: stored records, files, caches, messages in flight, exports, and saves on users' machines.
- **Outside callers**: other repositories, published package users, installed older versions, external clients, scripts and integrations you cannot see.

For each consumer, write where it is and how it moves: **in this change**, **separately** (and by whom), or **unknown**. A kind with no consumer gets "none found" with what was searched. When the thing is published or reachable from outside the repository, outside callers exist even if none is visible: list them as unknown. You are never the only consumer by assumption.

Ask the project's listed pack guides for *migrating stack-specific data or APIs*; take the stack's own mechanisms for keeping old names, shapes and callers working from the answer, and carry on with these steps when none answers.

Done when every kind has been searched and every consumer has a row.

## 4. Plan the stages

Plan an **expand/contract** sequence:

1. **Expand**: add the new path beside the old one. The old one keeps working, through a forwarder, an alias, an adapter or dual reading.
2. **Move consumers**: switch them to the new path one at a time; each one checked before the next.
3. **Contract**: remove the old path, in its own change, once evidence shows nothing uses it: a clean search, no old-shape data left that anything still has to read, and separately updated consumers confirmed moved.

Each stage ships and reverts on its own. Write the plan as stages, each with what ships and what must be true before the next one starts. Consumers that move separately and old data that is never rewritten usually put the contract stage outside this session.

When the thing is a published interface (a documented format, a package's public API, an endpoint others call), follow `codebase-design`'s published-interface reference for what counts as breaking and how the interface may change. When that skill is not installed, carry on with these steps.

### Stored or wire formats: readers first, writers after

When data in the old shape is stored or sent between versions, order the stages by reader and writer:

1. **Readers**: ship code that reads both the old and the new shape while it still writes the old one.
2. **Writers**: switch the writer to the new shape only once every reader that can meet the data understands it: older installed versions, other services, and the version a rollback would restore.
   When some reader can never be confirmed (outside tools, mods, installs that are never updated), write both shapes instead of switching. New readers must pick one shape when the two disagree, since an old tool can edit and write back only the old one: decide which wins and test that case. Stop writing the old shape only after the window the changelog or consumer notice announces for the old path (step 6). Dual-writing needs a format that tolerates the extra field, and a field whose meaning changed cannot be dual-written.
3. **Old-shape reading** stays while old data can exist. Data that is never rewritten (saves, archives, exports) keeps it for good, unless the data carries a version marker and is upgraded on load.

Check each reader against a real old-shape sample written by the old code, kept as a fixture, not one rebuilt by hand from the new code's idea of it.

## 5. Ship the stages in scope

Do the stages the plan puts in this session. After each one, check every listed consumer that is still on the old path: old data still loads, old callers still run, and the tests for both paths pass. The old path stays until its contract stage.

## 6. Tell the consumers

- **Changelog**: when the project keeps one, add the change in consumer terms: what changed, what to use instead, how long the old path works.
- **Notice**: when a consumer moves separately, draft a notice to it with the same three facts and what it must do. Name who should receive it; the human decides how it is sent.

## 7. Hand back

Report:

- The consumer list, each row with its status now.
- The stages shipped, and each remaining stage with the evidence that unlocks it (for the contract stage: which consumers must move and which data must be gone or upgraded first).
- The changelog entry and any drafted notice.

Then offer, only when the condition was observed, the invocation as this harness writes it:

- **`/dependency-audit`**: at handback, or before a decision the concern blocks, when the migration exposed a consequential supply-chain concern beyond the task (unexplained lockfile churn, questionable provenance of a replacement package, a vulnerability whose reachability is unresolved). Name the package, the evidence and the unanswered question. A dependency change on its own is not that concern.
- **`/wizard`**: at the blocker, when a sequence only the human can perform (running a production data migration, publishing a release, changing an outside system) blocks the next stage and an interactive procedure would materially help. A single approval or value is asked for directly.

A suggestion is the human's to start; you never run it.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.
