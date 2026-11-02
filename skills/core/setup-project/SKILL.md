---
name: setup-project
description: Set up or re-check a project's configuration for the skills, in an empty, partly set up or established repo.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/setup-project"
  opencode/autoinvoke: "false"
---

# Setup Project

Scaffold the per-repo configuration the other skills read, linked from the `## Agent skills` block of the project's instruction file. Each entry under [Sections](#sections) names one choice, what it writes and its sub-block in that block.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

Invoked with a pack name (`/setup-project <pack>`), read [packs](references/packs.md) and follow its one-pack run in place of the full [process](#process).

## Process

### Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config`: is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Does `CLAUDE.md` hold only `@AGENTS.md`, or real content? Which of them holds an `## Agent skills` block?
- `GLOSSARY.md` and `GLOSSARY-MAP.md` at the repo root, and the legacy `CONTEXT.md` / `CONTEXT-MAP.md`. If a legacy file exists, offer to `git mv` it to its `GLOSSARY` name and rewrite those names in `docs/agents/domain.md`.
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/`: read every file this skill's prior output could be. These are the settled choices.
- Test, lint and build commands: package scripts, task runners, CI workflows.
- Style tooling configuration, and any written coding guide.
- `.agents/config/`: guard extensions already recorded.
- `.scratch/`: a sign that a local-markdown issue tracker convention is already in use
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### Present findings and ask

Summarise what's present and what's missing. Then take the [sections](#sections) in order. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it.

A choice the project's configuration already records is **settled**: state it in one line and keep it, without asking. Reopen a settled choice only when exploration contradicts it (the tracker file names GitHub and the remote now points at GitLab) or the user asks to change it.

### Confirm and edit

Show the user a draft of what this run would change: the `## Agent skills` block and each file a section writes. Let them edit before writing.

When every section is settled, the block already links its files and each file carries the [missing-field header](#defaults), there is no draft: tell the user nothing changed, make the [move offer](#instruction-file) if it applies, and end the run with every file byte-for-byte as it was.

### Write

Write to the file [Instruction file](#instruction-file) picks.

If an `## Agent skills` block already exists, update its contents in place rather than appending a duplicate, and change only the lines a changed choice touches. With no block yet, append it at the end of the file. Leave the surrounding sections as the user wrote them.

The block holds one sub-block per section that writes one:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of how the labels differ from the defaults]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.

### Check commands

[one-line summary of the commands and tiers]. See `docs/agents/check-commands.md`.

### Style guide

[the one conditional pointer line from Style guide below]

### Evidence

[one-line summary of how the evidence facts differ from the defaults]. See `docs/agents/evidence.md`.

### Guard extensions

[one-line summary of the added cases]. See `.agents/config/command-guard.json`.

### Packs

- `<guide's exact callable name>`: <its domain in a few words>. See `docs/agents/<pack>.md`.
```

Then write each section's docs file, using the seed template it names as a starting point. A docs file that already exists holds the user's edits: change only the lines a changed choice touches, and never rewrite it from its seed.

### Done

Tell the user what this run wrote and which skills read it. Mention they can edit `docs/agents/*.md` directly later, and that a re-run reads the current state, keeps what is settled and revisits only what changed.

## Instruction file

Pick the file by what exists:

| What exists | Write to |
|---|---|
| Neither `AGENTS.md` nor `CLAUDE.md` | Create `AGENTS.md` with the content, and `CLAUDE.md` holding only `@AGENTS.md` |
| `CLAUDE.md` holding only `@AGENTS.md` | `AGENTS.md`, creating it if it is missing |
| `CLAUDE.md` with real content | `CLAUDE.md`, in place, then make the move offer |
| `AGENTS.md` alone | `AGENTS.md`, in place, then offer to add `CLAUDE.md` holding only `@AGENTS.md`, since Claude Code reads `CLAUDE.md` |

An `## Agent skills` block already in either file stays where it is: update it there, so the project keeps one block.

**The move offer** is a separate question, asked after the block is settled, with its own approval: move `CLAUDE.md`'s content into `AGENTS.md` and leave `CLAUDE.md` holding only `@AGENTS.md`. Make the move only on an explicit yes, showing the merged `AGENTS.md` first when it already has content of its own. On any other answer, both files stay as they are.

## Defaults

A fact with no sensible default, such as the tracker or the check commands, is always written. A fact with a default is written only when the project differs. The domain docs file is written for its reading rules, whichever layout the project has. Whenever a section asks about a fact with a default, show the default and its value in the question; accepting it writes nothing, and a file that would then hold nothing is not created.

Facts live in one prose file per group under `docs/agents/`, linked from the block. A fact moves to `.agents/config/` only when a tool, not an agent, must read it.

Every config file opens with this line, directly under its title; a file this skill owns that lacks it gets the line through the draft. A JSON config file has no title and carries the line as its first key, `$comment`.

> A missing field means the owning skill's default.

## Sections

### Issue tracker

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, and `to-spec` read from and write to it. They need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub**: issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab**: issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown**: issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`, from its seed: [issue-tracker-github.md](./issue-tracker-github.md), [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) or [issue-tracker-local.md](./issue-tracker-local.md). For an "other" tracker, write the file from scratch using the user's description. The GitHub and GitLab templates describe a "PRs as a request surface" flag, defaulted **off**, which only a `yes` writes. Leave it off and don't raise it: a user who wants external PRs in the triage queue can add the flag the file describes later.

A GitHub or GitLab tracker needs a reachable repo. When the user picks one and no `git remote` points at that host, get the repo URL from them and wire it up (`git init` if needed, `git remote add origin <url>`) before going further. Done when `gh repo view` / `glab repo view` prints the project from inside this directory; if it can't, stop and tell the user what's missing.

### Triage labels

Ask only for a real tracker: GitHub, GitLab or other. Local markdown has no labels, so this section is skipped there. A real tracker already recorded with no `docs/agents/triage-labels.md` has settled on the defaults.

Ask exactly one question, showing the defaults:

> Do you want to keep the default triage labels? (recommended: **yes**) `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.

These are the five canonical roles, each label string equal to its name. On **yes**, write no table: no `docs/agents/triage-labels.md` and no `### Triage labels` sub-block, because a missing table means these defaults. Only if the user says no, usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`), collect the overrides so `triage` applies existing labels instead of creating duplicates.

With overrides, write `docs/agents/triage-labels.md` from [triage-labels.md](./triage-labels.md), keeping a row only for each role whose label differs, and add the `### Triage labels` sub-block.

When this section ran on GitHub or GitLab, take all five roles under their configured strings, overrides and defaults alike, and find which the tracker lacks (`gh label list` / `glab label list`). List those in the draft, and once it is approved, create them (`gh label create` / `glab label create`).

### Domain docs

Default to **single-context** (one `GLOSSARY.md` + `docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `GLOSSARY-MAP.md` pointing to per-context `GLOSSARY.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

Record the layout in `docs/agents/domain.md`, from its seed: [domain.md](./domain.md).

### Check commands

Derive the commands from the project's own configuration, and ask only for what it does not show. Propose one row per command with what it checks and its cost tier: `edit loop`, `task end` or `CI`, defined in the seed. Give a test command its one-file form as a separate `edit loop` row when the runner takes one, with `<file>` in the path's place.

Record the rows in `docs/agents/check-commands.md`, from its seed: [check-commands.md](./check-commands.md), replacing its placeholder row. `verifying`, `implement` and `constraints` read this name and these columns, so keep both. Rows already in the file are settled, whoever wrote them, including the rows `constraints` adds. A floor guard gets a row only when the project already has one. Settled rows are not run again.

Once the draft is approved and before writing `check-commands.md`, run each `edit loop` and `task end` command once, on a real test file for a one-file form; the draft names them. A command that cannot start (exit 127, an unknown script) leaves its row out and is reported with its next step. A command that runs and fails keeps its row and is reported with its exit code. Report `CI` rows as not run. A project with no commands yet writes no file, and the final report says so.

### Style guide

When no pointer is recorded, or the guide it names has gone, read [style-guide-choice.md](./style-guide-choice.md) and follow it: offer the choice, put the guide in the project, write the one pointer line and flag each conflict with tooling configuration. With a pointer already settled, run only that reference's Flag conflicts step.

### Evidence

An `## Agent skills` block already in place with no `docs/agents/evidence.md` has settled on the defaults. Otherwise ask one question, showing the defaults:

> Keep the evidence defaults? (recommended: **yes**) Evidence record path: `docs/evidence/`. Approver: the owner in this session.

On **yes**, write no file and no sub-block. Otherwise write `docs/agents/evidence.md`, with the missing-field header, holding only the facts that differ, under the names `risky-changes` and `hillclimb` read: `**Evidence record path**:` and `**Approver**:`. Add the `### Evidence` sub-block.

### Guard extensions

Only when a selected pack's `SETUP.md` offers guard extensions, read [guard-extensions.md](./guard-extensions.md) and record the selection. With no offer, skip this section.

### Packs

Take this section last, after every other section, whatever order they are written in. When your skill listing shows no pack guide (`<pack>-guide`, with a plugin prefix when a plugin installed it) and the instruction file has no `### Packs` list, skip it and write no sub-block. Otherwise read [packs](references/packs.md) and follow its full run.
