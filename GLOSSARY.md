# Skill Collection

A personal collection of agent skills and the machinery around them, gathered and adapted from many sources, sized to one owner's work across Unity, C# libraries, web apps and agentic workflows. Every skill in the collection lives in this repo.

## Which part it is

**Core**:
The universal skills of the collection: the ones everything else builds on, useful whatever the project. Usually installed at user scope, though nothing requires it.
_Avoid_: global, always-active layer

**Pack**:
An optional add-on to core: a named list of skills, installed separately so that taking core never brings it along. A project takes the whole list or picks single skills from it. Usually installed per project (the Unity pack in a Unity project), sometimes at user scope when it serves a person (the onboarding pack). A pack can be narrower than a domain, so two people on one project may pick different packs.
_Avoid_: domain layer, local, kit

## How it reaches the agent

**Always-on**:
Anything applied in a session without being invoked: hooks, steering-file rules, output styles. Core and packs can each carry always-on pieces.
_Avoid_: baseline, resident, always-active

**Model-invoked**:
A skill the agent may reach for on its own (or the user may type); its description occupies context whenever it is installed.
_Avoid_: toolkit, auto skill

**User-invoked**:
A skill only the human can fire by typing its name; it costs no idle context.
_Avoid_: command, workflow skill

**Address**:
A piece's position on both axes, spoken as two words, e.g. "core user-invoked" or "Unity pack always-on".

**Tripwire**:
A token figure for one layer of the collection that prompts a review when crossed: cut something, or raise it on purpose. It measures the collection only, never what else is installed.
_Avoid_: cap, limit, hard budget

## Finding the right skill

**Expensive workflow**:
A skill expected to use a lot of tokens, typically because it spawns subagents or is built to run across sessions. User-invoked by default; a reasoned exception may stay model-invoked.
_Avoid_: heavy skill, big workflow

**Guide**:
An entry skill that answers "where do I go for this?". It holds a needs table, routes, or both, and it suggests workflows without ever running them.
_Avoid_: router, hub, mode, dispatcher, index, map (that is the wayfinder map)

**Core guide**:
The guide to core's workflows. It holds routes only, is user-invoked, and consults a pack guide when the situation touches that pack.

**Automatic guide**:
The core guide published model-invoked, so the agent can suggest a workflow unasked. Part of the onboarding pack, not of core.

**Pack guide**:
A pack's model-invoked guide, named `<pack>-guide`.

**Need**:
The moment an agent or a person reaches for knowledge, phrased as what they are trying to do.

**Needs table**:
A guide's table from needs to the knowledge that answers them: its own reference files, or other skills in the same pack.

**Routes**:
A guide's table from situations to the workflows that fit them.

## Delegating work

**Role agent**:
An agent started to play a part in a workflow, making judgments its caller relies on: an implementer, a Standards reviewer, a researcher. It may start helpers and run the workflows its own role calls for, but never an agent for a peer role.
_Avoid_: persona, worker

**Helper**:
An agent started for one narrow errand that returns facts and makes no judgment, such as finding every caller of a function. It never starts an agent of its own.
_Avoid_: search agent, sub-subagent

## Continuity

**Handoff**:
A document that lets a fresh agent continue work another agent started. It marks each decision as the user's, the agent's or pending, and tells its reader that only the user's decisions are approved.
_Avoid_: checkpoint, context save, session summary

**Admission bar**:
The test a learning must pass before anyone writes it down: it holds reasoning that cannot be recovered from the code, tests or docs, and losing it would cost something real. Effort and completion do not count, and asking for a record does not lower the bar.
_Avoid_: learning store, memory

## Reaching a pack

**Extension point**:
The place in a skill where it asks the project's pack guides for knowledge about a stated need. It names the need and never a pack.
_Avoid_: delta line, pack hook

**Pack list**:
A project's list of the pack guides it uses, each with its domain in a few words. Part of project configuration.
_Avoid_: job map, pack registry

## Building the collection

**Source**:
An external repository the collection may borrow skills, ideas or mechanisms from.
_Avoid_: upstream (that is `mattpocock/skills`, the source Matt-derived skills are tracked against)

**The fork**:
`Hissal/mattpocock-skills-unity`, the Unity edition of Matt Pocock's skills. A source: Matt-derived skills are copied from it into this repo, and it is no longer where they are authored.
_Avoid_: base, member

**Override**:
A skill copied into this repo and edited slightly, keeping its name and staying recognisable as the skill it was copied from. A new skill built from other skills is not an override.
_Avoid_: vendored copy, adapted copy

**Project configuration**:
Facts a project states about itself for skills to read: its tracker, label names, where files live, commands to run, what needs approval. It lives in the project, never inside an installed skill. A skill's behaviour is fixed and takes no preference switches.
_Avoid_: settings, options, preferences

**Candidate**:
A single skill or mechanism from a source, under consideration and not yet decided.

**Mechanism**:
Anything in the collection that is not a skill: hooks, scripts, CI checks, evals, manifests, convention docs.

**Ledger**:
The per-source list of candidates, each with fit, misfit, adaptation, overlap and a proposed (never decided) recommendation.

**Theme**:
A cluster of candidates from across ledgers that compete for or share one job, decided together in one session.

**Blueprint**:
The decided architecture plus the decided catalog: the destination of the wayfinder map, handed off to be built.

## Command guard

**Reflection pause**:
A guard decision that asks the model to reconsider a potentially destructive action. It is not human approval.

**Human-required**:
A guard decision that reserves approval authority to the human. Model reflection and automatic approval by a harness do not count as human consent.

**Freeze**:
A temporary editing boundary chosen by the human for one session in one project.
