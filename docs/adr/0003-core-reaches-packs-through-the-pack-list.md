---
status: accepted
---

# Core reaches packs through the pack list and the pack guides

A skill that needs pack knowledge carries an **extension point**: one sentence that names the need and asks the pack guides the project lists. The project's **pack list**, written by `setup-project` into the `## Agent skills` block of its `AGENTS.md` or `CLAUDE.md`, names each pack guide and its domain. The guide's needs table picks the pack skill. No skill outside a pack ever names that pack or one of its skills.

A pack skill adds to the core skill for the same job and never replaces it: the core skill owns the process, the pack skill holds what differs in its domain. When nothing answers an extension point, the skill carries on with its own process and says nothing.

## Considered Options

- **A delta line per pack in each core skill** (the fork's "In a Unity repo, call the `unity` skill for ..."). Rejected: every core skill would have to name every pack, present and future, and a new pack would mean editing core.
- **A job map in the project** (`prototyping: unity-prototyping`), read by the core skill, which then calls the pack skill directly. Rejected: it needs a fixed job vocabulary shared by core, every pack and setup, and the needs core skills actually have are too varied for one. The map would also copy each pack's needs table into every project, where it goes stale when the pack changes.
- **Finding pack guides in the skill listing** instead of a pack list. Rejected for extension points: it is a judgement on every run, it calls a user-scope pack's guide in repos where the pack is irrelevant, and a plugin install changes the guide's name. The listing is still how `setup-project` and the core guide discover installed guides.

## Consequences

- A pack is only reachable from core once `setup-project` has listed it. A pack guide that runs and finds itself unlisted says so once.
- Every extra hop goes through a guide, so reaching pack knowledge loads the guide's body as well as the pack skill.
- A pack that wants to be reached needs a guide, and the manifest makes the guide required by every pack skill that adds to a core skill.
- Packs reach other packs the same way, so one pack depending on another is optional unless the manifest records a hard requirement.
