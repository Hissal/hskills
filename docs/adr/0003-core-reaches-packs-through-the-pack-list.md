---
status: accepted
---

# Core reaches packs through the pack list and the pack guides

A skill that needs pack knowledge carries an **extension point**: one sentence that names the need and asks the pack guides the project lists. The project's **pack list**, written by `setup-project` into the `## Agent skills` block of its `AGENTS.md` or `CLAUDE.md`, names each pack guide and its domain. The guide's needs table picks the pack skill. No skill outside a pack ever names that pack or one of its skills.

A pack skill adds to the core skill for the same job and never replaces it: the core skill owns the process, the pack skill holds what differs in its domain. When nothing answers an extension point, the skill carries on with its own process and says nothing.

## Knowledge lookup and execution

The [core review](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219205105) qualifies the original layering instruction:

- When another skill reaches a pack skill for knowledge about a stated need, it supplies that knowledge within the caller's job. It does not start the core workflow it normally layers on. A reviewer asking about test idioms remains a reviewer; it does not start test authoring.
- When performing the job itself, the pack skill uses the core process and contributes its domain layer once. Core-first and pack-first entry must not restart an active layer or duplicate execution.
- A core workflow that is user-invoked remains gated. A pack entry requiring it returns the exact user invocation; it does not invoke it automatically. The running core workflow obtains pack knowledge through its extension points.

This replaces the blanket promise that typing either skill name always starts the same workflow. Installation dependencies establish availability, not permission to invoke a workflow.

The decided needs are indexed in [Core extension points](../agents/core-extension-points.md). Several caller-specific needs may reach the same pack knowledge; the index does not introduce a fixed job vocabulary.

## Setup discovery

[The project setup decision](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) extends setup discovery beyond installed guides: `setup-project` uses the collection catalog alongside the installed skill listing and relevant vendor sources, and can read selected packs' `SETUP.md` material before installation. This supersedes the original installed-only setup restriction. Ordinary extension points continue to use the project's pack list; the setup sequence and recommendations are recorded in that decision.

## Considered Options

- **A delta line per pack in each core skill** (the fork's "In a Unity repo, call the `unity` skill for ..."). Rejected: every core skill would have to name every pack, present and future, and a new pack would mean editing core.
- **A job map in the project** (`prototyping: unity-prototyping`), read by the core skill, which then calls the pack skill directly. Rejected: it needs a fixed job vocabulary shared by core, every pack and setup, and the needs core skills actually have are too varied for one. The map would also copy each pack's needs table into every project, where it goes stale when the pack changes.
- **Finding pack guides in the skill listing** instead of a pack list. Rejected for extension points: it is a judgement on every run, it calls a user-scope pack's guide in repos where the pack is irrelevant, and a plugin install changes the guide's name. The listing is still how `setup-project` and the core guide discover installed guides.

## Consequences

- For ordinary extension points, a pack is only reachable from core once `setup-project` has listed it. A pack guide that runs and finds itself unlisted says so once.
- Every extra hop goes through a guide, so reaching pack knowledge loads the guide's body as well as the pack skill.
- A pack that wants to be reached needs a guide. Every pack skill that adds to a core skill declares that guide as a requirement; the manifest's dependency portion is generated from [Agent Skills Sync metadata](0004-skill-dependencies-use-agent-skills-sync-metadata.md).
- Packs reach other packs the same way, so one pack depending on another is optional unless its metadata declares a hard requirement. Such requirements follow ADR 0004's resolution and scope rules.
