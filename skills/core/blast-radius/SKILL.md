---
name: blast-radius
description: Find what a change breaks outside its diff, and prove by running code the one fact the change is safe because of.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/blast-radius"
  agent-skills-sync.requires: '["hissal.skill-collection/verifying"]'
  opencode/autoinvoke: "false"
---

# Blast radius

Find what a change breaks away from the lines it touches, before it ships. Callers turn up in one search; the work here is the consumers and effects that search misses. A persuasive analysis is equally persuasive when it is wrong, so the change's safety rests on one fact shown by a run, and the analysis around it is graded claim by claim.

Before doing any work, load verifying (hissal.skill-collection/verifying) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill verifying (hissal.skill-collection/verifying) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; the Unity sync resolves them from
this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Done when every consumer and effect outside the diff that you found is either a risk or cleared, each with its evidence; the one fact the change is safe because of has run in code on a named tree or is marked **unvalidated**; every claim carries its rung on verifying's [evidence ladder](../verifying/SKILL.md#evidence-ladder); and every place you did not search is named with the reason.

The change is what the human names: a diff, a branch, a commit or a pull request. With nothing named, take the working tree and the branch against its base. You examine the change and report on it; the change itself stays as it is.

## 1. Read the change

From the diff, list every symbol added, altered or removed. Then write down the behaviour that differs now, above all the behaviour no changed line states: a default that moved, calls that run in a new order, a value now cached, shared or discarded, an error now swallowed or newly raised. When a pull request or commit messages came with the change, read them as well.

## 2. Name the safety fact

A change that looks dangerous usually turns out safe for one reason, such as "this call only removes entries nothing reads again" or "every reader of this field already treats a missing value as zero". Find that reason and write it as one sentence a run could show to be false. If it holds, it settles most of the worrying cases together, so it earns more of your effort than a long catalogue of things that might go wrong. When no single fact carries the change, say so and name the two or three facts it rests on.

## 3. Search past the symbol search

Search the callers first, then follow what a symbol search cannot see:

- **Dependencies at the version in use**: read the source of the library or framework the change calls, at the pinned version, with any local patch or override applied.
- **When code runs**: callbacks and deferred work that fire later, ordering between asynchronous steps, startup, shutdown, teardown and cleanup, retries, and code that runs twice or never.
- **Data outside the code**: the response an interface returns, a stored column or record, a file or wire format, caches, queued messages, and another program or language reading the same bytes.
- **Lookups by name**: configuration keys, strings, reflection, dependency injection, routes and feature flags.
- **Distance**: consumers several hops downstream, other repositories and published users you cannot see.

Ask the project's listed pack guides for *what a change can break outside the diff for this stack*, and search the places the answer names as well. When no guide answers, carry on with this list.

Done when every kind above has been searched or named as not searched, and every consumer found sits in step 4.

## 4. Weigh each risk

For each consumer or effect, estimate honestly how likely it is to break and what a break would cost. Sort them into two lists:

- **Risks**: how it breaks, where (`file:line`), likelihood, cost, and how to check.
- **Cleared**: what you checked and why it holds.

Every entry rests on a place you read, in the project or in the dependency's source at the version in use. An empty search is a finding: record the query and the paths it covered.

## 5. Prove the safety fact by running code

Write a script or test that exercises the real code (the library at the version the project ships, the exact function in question) and is built to fail if the fact is false. Run it and capture it by verifying's rules: the command, the tree it ran on and the real exit code. Include its output in the report.

Keep the script outside the change, in a scratch location, unless the owner chooses to keep it as a test. When the fact cannot be run (no runtime available, or the code needs a live system you cannot reach), mark it **unvalidated**, give the highest rung it reached, and say what a run would need.

When a run is cheap, prove the risks that matter most the same way.

## 6. Grade every claim

Give every claim about what the code does its rung on verifying's [evidence ladder](../verifying/SKILL.md#evidence-ladder), the highest it reached, and verifying's status word. A fact shown only by reading stays below "ran it", however convincing the reading.

## 7. Hand back

- **Behaviour change**: what the change does differently, including what no changed line states.
- **Safety fact**: the sentence, its rung and status, and the proof (command, tree, exit code, output), or **unvalidated** with the reason.
- **Risks**: each with how it breaks, `file:line`, likelihood and cost, how to check, its rung, and the proof for those that matter.
- **Cleared**: each with what was checked and its rung.
- **Catch it before merge**: the cheapest test or reproduction that would expose the breakage, the proving script included.
- **Not searched**: each kind or place left unsearched, and why.

Keep private details (credentials, internal hosts, customer data) out of anything bound for a public place.

When the owner chooses to defer the remaining investigation or pass it to someone else, and the evidence gathered so far (traced consumers, the proving script, dependency reading) would be costly to rebuild, offer `/handoff` with that reason. The owner starts it; you never run it.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.
