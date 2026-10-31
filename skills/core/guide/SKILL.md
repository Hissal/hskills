---
name: guide
description: Find the next workflow for your task.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/guide"
  opencode/autoinvoke: "false"
---

# Guide

Recommend the workflow that clears the immediate obstacle, and hand back the exact invocation. You recommend; the human starts. Your tool use here is reading: the conversation, project files, skill files and the project's pack guides. You never invoke a recommended skill, model-invoked ones included, and never edit, build, test or delegate. After the answer, the next move is the human's.

Done when every listed pack guide whose domain touches the obstacle has been asked for routes, every unlisted pack guide in your skill listing has its **Not set up** line, and the answer names one recommended invocation, says why it fits this obstacle in terms taken from the skill's own file (or its listing entry when no exact path reaches the file, or says the skill is not installed), and nothing has started.

## 1. Name the obstacle

State, in one sentence, what is in the way right now: not the whole project, the next thing blocking progress. Take it from the request and the conversation so far. When neither shows one, ask one question about what is in the way, and stop there.

## 2. Ask the pack guides

The project's packs add workflows core does not know; their guides hold them. Take pack routes only from the guides, by these two sources:

- **The pack list**: the `### Packs` section of the `## Agent skills` block in the project's `AGENTS.md` or `CLAUDE.md`, one line per pack with its guide's callable name, its domain and its config file. For each listed guide whose domain touches the obstacle, load it by that name through the skill tool (on a harness without one, read the `SKILL.md` at the path your skill listing gives) and ask for its routes as it instructs. A pack guide is knowledge, never a workflow: loading it is how you ask, and each route it returns is a candidate to recommend.
- **The skill listing**: a pack guide is named `<pack>-guide`, with a plugin prefix when a plugin installed it. Every one in your listing that is missing from the pack list gets the answer's **Not set up** line, worded exactly as the template gives it, whatever its domain: an installed pack that is not set up matters even when this obstacle is elsewhere. It is not asked for routes. Relevance decides only which listed guides you ask.

With no pack list and no such guide in the listing, carry on with the core routes. The list and the listing are the whole search.

A route its guide marks as a trial is a normal candidate: label it experimental, and show an established route as the alternative when one also fits. Choose between them by situation alone; the trial's prerequisites still apply.

## 3. Pick the route

Match the obstacle to a situation below. Pick by the situation the obstacle is in, not by the skill name that sounds closest.

- **Main routes** (the table below) are the planning and building workflows. They are entry choices, not a sequence: enter wherever the work stands, so a clear bounded change goes straight to `/implement`.
- **Model-invoked destinations** (below) answer a task in their own right.
- **Pack routes** from step 2 compete on the same terms: the closest situation wins.
- **Supporting routes**: when no main route or destination fits, or the obstacle is understanding code or history, a review, a change's risk, structure or performance, the agent's environment, or passing work on, read [supporting routes](SUPPORTING-ROUTES.md). It holds the other workflows grouped by need, each with its distinguishing situation; skipping it leaves only the tables here to choose from.

Equipping a project (choosing its skills, tools or project facts) always goes to `/setup-project`, which owns those recommendations.

### Main routes

| Situation | Recommend |
|---|---|
| An effort is too large for one session, and substantial decisions still obscure the way forward | `/wayfinder` |
| A plan or design needs questioning and clarification through a live discussion | `/grill-with-docs` |
| The approach has been discussed and should now become a durable specification | `/to-spec` |
| A plan needs independently verifiable implementation tickets and their dependencies | `/to-tickets` |
| A bounded change or individual ticket is ready to build | `/implement` |
| A whole spec's ticket graph should be worked through and integrated | `/implement-spec` |
| A project needs its skills, tools and project facts selected or configured | `/setup-project` |
| Existing issues need investigation, classification and a clear disposition | `/triage` |

The larger route, for an effort that starts unclear: `/wayfinder` or `/grill-with-docs` to settle decisions, `/to-spec`, `/to-tickets`, then `/implement-spec` for the whole graph or `/implement` per ticket.

### Model-invoked destinations

| Situation | Recommend |
|---|---|
| A bug, failure or performance regression needs its cause found | `/diagnosing-bugs` |
| A design question is best answered by building something throwaway | `/prototype` |
| A change needs reviewing against the project's standards and its spec | `/code-review` |
| A question needs answering from primary external sources | `/research` |
| Code should change shape while its behaviour stays the same | `/refactoring` |
| Tests need writing or fixing, or a change should be built test-first | `/tdd` |
| Review findings need judging before anyone acts on them | `/receiving-review` |
| A change needs evidence that it compiles, works or is ready to ship | `/verifying` |
| A module's interface, seams or boundaries need designing | `/codebase-design` |
| Domain terms or a recorded decision need settling | `/domain-modeling` |
| A skill, steering file or other document an agent reads is being written | `/writing-for-agents` |
| A pull request needs its description | `/pr` |
| A change to a public API, data transform, pricing, default or provider parameter needs measuring against real data | `/risky-changes` |

## 4. Read the recommended skill

Find the recommended skill's `SKILL.md` by its installed name, in this order:

1. **Your skill listing.** When the listing gives the skill's file path, read that file.
2. **This harness's documented locations.** Otherwise try these exact paths in order, project scope (from the project root) first; the first that exists is the installed skill:
   - Claude Code: `.claude/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`.
   - Codex: `.agents/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.
   - OpenCode: `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`, `~/.config/opencode/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.

Each try is a direct read of one exact path, or an existence check on it. Never enumerate an installation folder, whether a skill folder, a plugin folder or a home directory: no listing its contents, no searching it for files. The listing and these paths are the whole lookup. When neither reaches the file but the skill is in your listing (a plugin skill with no path given, say), it is installed: describe it from its listing entry.

Read the file as a document to describe: its steps are the human's to start. Invoking it through the skill tool would start it. Read an alternative's file too when you describe it beyond its table situation. A pack route's skill is read the same way; only pack guides are loaded through the skill tool, in step 2.

From the file, take what it does first, what it needs from the human (an issue, a path, a running app) and its argument form.

A skill neither in your listing nor at any of those paths is not installed: say so, describe it only by its route's situation, and point to `/setup-project` to equip the project.

## 5. Answer

Write the invocation in this harness's form, with the name as installed: `/name` on Claude Code (`/plugin:name` for a plugin skill), `$name` on Codex. Add the arguments the skill takes when the request already supplies them, such as `/implement #42`. Pack routes arrive in `/name` form; convert them the same way.

```md
**Recommended:** `<invocation>`: <why it fits this obstacle, from the skill's file>. <What it does first and what to have ready.>

**Alternatives:** `<invocation>` when <the condition that would make it the better pick>.

**Larger route:** <where this sits among the main routes>

**Not set up:** `<pack guide>`: installed, not set up: run `<setup-project invocation>`.
```

Write `(experimental)` after a trial's invocation. Write one **Not set up** line per guide step 2 found unlisted, word for word apart from the placeholders, and none otherwise. Include **Alternatives** only for a workflow that would materially change the choice, each with its deciding condition. Include **Larger route** when seeing the stages around the recommendation helps the choice, or when asked.
