# Skill Collection

A personal collection of agent skills and the machinery around them, gathered and adapted from many sources, sized to one owner's work across Unity, C# libraries, web apps and agentic workflows. The collection is the installed whole, not this repo alone: it spans this repo and the fork.

## Where it is installed

**Core**:
The part of the collection installed at user scope, reachable from every session in every repo.
_Avoid_: global, base, always-active layer

**Pack**:
A domain-specific part of the collection (e.g. the Unity pack) installed only into the projects it serves, so it costs nothing elsewhere.
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

## Building the collection

**Source**:
An external repository the collection may borrow skills, ideas or mechanisms from.
_Avoid_: upstream (that is `mattpocock/skills`, which only the fork merges from)

**The fork**:
`Hissal/mattpocock-skills-unity`, the Unity edition of Matt Pocock's skills. A member of the collection, not a source: its skills belong to core and the Unity pack while living in their own repo, which stays usable without the rest of the collection.
_Avoid_: base, source

**Override**:
A skill copied into this repo and edited slightly, keeping its name and staying recognisable as the skill it was copied from. A new skill built from other skills is not an override.
_Avoid_: vendored copy, adapted copy

**Fork override**:
An override of one of the fork's skills, installed in place of the fork's version. The home for a personal change too large for the fork.

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
