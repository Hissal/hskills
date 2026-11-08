---
name: in-progress-guide
description: Use when choosing a workflow to design or specify a recurring activity (a routine, a repeated chore, something that should run on a schedule or an event) without building it; to hand an agent a goal or spec to take unattended to a PR you merge yourself or all the way to a merge, or an existing PR's checks, conflicts and review feedback until it is ready; to compare competing implementations of one goal and keep the stronger; or when asked which experimental workflows are installed.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/in-progress-guide"
  opencode/autoinvoke: "true"
---

# In-progress guide

Routes to **trials**: experimental workflows installed beside the core workflows, each on trial until its owner adopts, revises or drops it. A trial never replaces a core workflow. You recommend; the human starts. Your tool use here is reading. You never invoke a trial, never start one for the human, and never edit, build or delegate.

Done when every route whose situation fits the request is answered as below, or you have said that none fits, and nothing has started.

## Answer a need

- **Choosing a workflow.** Someone (the human, or the core guide asking for this pack's routes) is picking how to do a piece of work. Read [routes](ROUTES.md) and answer from it. Read it only then: a knowledge lookup never loads the routes.
- **A caller asks for knowledge.** This pack supplies none. Return nothing: no announcement and no general advice. The caller carries on with its own process.
- **Asked what is installed.** Read [routes](ROUTES.md) and list each installed trial with its situation, labelled experimental.

## Recommend a trial

For each route whose situation fits:

1. **Installed only.** Trials are user-invoked, so a harness may leave an installed trial out of your skill listing. Find the trial's `SKILL.md` by its callable name, in this order:
   1. **Your skill listing.** The trial is installed when its name is there, with a plugin prefix when a plugin installed it.
   2. **This harness's documented locations.** Otherwise try these exact paths in order, project scope (from the project root) first; the first that exists is the installed trial:
      - Claude Code: `.claude/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`.
      - Codex: `.agents/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.
      - OpenCode: `.opencode/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md`, `~/.config/opencode/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.

   Each try is a direct read of one exact path, or an existence check on it. Never enumerate an installation folder, whether a skill folder, a plugin folder or a home directory: no listing its contents, no searching it for files. The listing and these paths are the whole lookup. Leave out a route whose trial neither reaches.
2. **Label it experimental**, every time it is named.
3. **Say the useful difference**: what the trial does that the established workflow does not, from the route's row.
4. **Show the established alternative** from the row when it also fits this request, with its invocation. Prefer neither: the situation decides, and when both fit equally, say so and leave the choice to the human.
5. **Give the exact invocation** as installed in this harness: `/name` on Claude Code (`/plugin:name` for a plugin skill), `$name` on Codex. Add arguments only when the request already supplies them.

A trial keeps its own prerequisites: what its file asks the human to have ready still applies. A route grants no authority: no production operations, no messages to anyone, and no permission beyond what the trial's own invocation grants. Present a trial as an experiment beside core, never as an upgrade or a replacement.

When you run for a parent agent, return the fitting routes in this shape and make no offer; the parent decides what to tell the human.
