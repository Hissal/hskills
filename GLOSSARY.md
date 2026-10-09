# Skill Collection

A personal collection of agent skills and the machinery around them, gathered and adapted from many sources, sized to one owner's work across Unity, C# libraries, web apps and agentic workflows.

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

## Building the collection

**Source**:
An external repository the collection may borrow skills, ideas or mechanisms from.
_Avoid_: upstream (reserved for a source the collection tracks and merges from)

**The fork**:
`Hissal/mattpocock-skills-unity`, the Unity edition of Matt Pocock's skills, expected to remain publishable in its own right.
_Avoid_: base

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
