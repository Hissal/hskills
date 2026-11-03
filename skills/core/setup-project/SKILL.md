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

This is a prompt-driven skill, not a deterministic script. It takes an empty, partly set up or established project to verified configuration in one conversation, and keeps what is already done.

Invoked with a pack name (`/setup-project <pack>`), read [packs](references/packs.md) and follow its one-pack run in place of the full [process](#process).

## Process

Six steps in this order, whatever the project's starting state. Each step ends on its criterion. A step with nothing to do takes one line saying why, and the run moves on, so an empty project runs all six and an established one mostly reports what is settled.

A choice the project's configuration already records is **settled**: state it in one line and keep it, without asking. Reopen a settled choice only when exploration contradicts it (the tracker file names GitHub and the remote now points at GitLab) or the user asks to change it.

An `## Agent skills` block is **in place** once it holds a core sub-block. A block holding only what a one-pack run can write (`### Packs`, `### Guard extensions`, `### Setup handoff`) has settled no core choice, so a full run takes every section as a first run would, and still updates that block where it is.

### 1. Orient

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config`: is this a GitHub repo? Which one? A folder with no repo has no remote.
- `AGENTS.md` and `CLAUDE.md` at the repo root: does either exist? Does `CLAUDE.md` hold only `@AGENTS.md`, or real content? Which of them holds an `## Agent skills` block?
- `GLOSSARY.md` and `GLOSSARY-MAP.md` at the repo root, and the legacy `CONTEXT.md` / `CONTEXT-MAP.md`. If a legacy file exists, offer to `git mv` it to its `GLOSSARY` name and rewrite those names in `docs/agents/domain.md`.
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/`: read every file this skill's prior output could be. These are the settled choices, apart from `docs/agents/setup-handoff.md`, which holds [open questions](#open-questions) to bring back first, and `docs/agents/setup-research/`, the saved evidence behind them and past choices.
- Test, lint and build commands: package scripts, task runners, CI workflows.
- Style tooling configuration, and any written coding guide.
- `.agents/config/`: guard extensions already recorded.
- `.scratch/`: a sign that a local-markdown issue tracker convention is already in use
- Monorepo signals: a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. These are present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.
- Harness configuration: `.codex/` means Codex, `opencode.json` means OpenCode, and `.claude/` with more than `skills/` means Claude Code. `.claude/skills/`, `.agents/` and `skills-lock.json` show what is installed and name no harness: setup writes them itself, and many harnesses share `.agents/`.

Bring back any `docs/agents/setup-handoff.md` entries, as [open questions](references/open-questions.md#handoff) says. Then summarise what's present and what's missing, and name the steps that look settled.

Establish the intended outcome, its constraints, the stack and the harnesses the project is meant to work in. State in one line whatever the repo already answers, and ask one question for the rest, helping choose when the owner is undecided. With an `## Agent skills` block in place and nothing else in the invocation, the outcome is keeping this configuration current, so that takes no question. With no harness named or configured, take the one running this conversation.

Done when the starting state, outcome, stack and harnesses are each stated, or routed through [Open questions](#open-questions).

### 2. Recommend

Take [Recommendations](#recommendations), then the checks in [Vendor sources](#vendor-sources). A later answer that changes the stack or adds a dependency, in step 3 or step 6, brings this back for what is new alone, in the same view.

Done when each row has the owner's answer, or nothing new remains to recommend.

### 3. Settle

Take the remaining [sections](#sections) in order, leaving [Check commands](#check-commands) for step 6. One section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Match the depth to the uncertainty: skip a section exploration already settled, give a one-line explainer only when the choice genuinely branches, and send a question that bounded reading can settle through [Open questions](#open-questions).

Done when each section is settled, answered, or held on an open question.

### 4. Deliver guidance

Guidance lands before anything is scaffolded, so scaffolding can use it.

Show the user a draft of what this run would change: the `## Agent skills` block, each file a section writes, each pick's command and pointer, the labels to create and each scaffolding command. Say that the check commands come in step 6's draft, and list the harness checks for step 1's harnesses, marking any that spends a model call; the approved list sets only what [verify guidance](references/verify-guidance.md) checks, and skills still install to both folders. Let them edit before anything is written. Approval covers everything the draft lists.

When every section is settled, the block already links its files and each file carries the [missing-field header](#defaults), and no gap needs filling, there is no draft: tell the user nothing changed, make the [move offer](#instruction-file) if it applies, and go on to step 6 with every file byte-for-byte as it was.

After approval, in this order:

1. Deliver each pick through [Deliver](references/recommendations.md#6-deliver) and record it through [Vendor sources](#vendor-sources). A failed install goes through [Open questions](#open-questions), and the rest carries on.
2. Write to the file [Instruction file](#instruction-file) picks. If an `## Agent skills` block already exists, update its contents in place rather than appending a duplicate, and change only the lines a changed choice touches. With no block yet, append it at the end of the file. Leave the surrounding sections as the user wrote them. The block holds one sub-block per section that writes one, in the shape and order of [the block](references/agent-skills-block.md).
3. Write each section's docs file, using the seed template it names as a starting point. A docs file that already exists holds the user's edits: change only the lines a changed choice touches, and never rewrite it from its seed.

Done when each pick is delivered, waiting or reported, and the block and every approved file are on disk.

### 5. Fill gaps

When the draft holds a scaffolding command, read [scaffolding](references/scaffolding.md) and follow its Run part. Otherwise say no gap needs filling and move on.

Done when each gap is filled or on an open question.

### 6. Record and verify

Everything here comes from the project as it now stands, so an empty project needs no second run.

1. **Look again.** Repeat step 1's look at commands, tooling, manifests and monorepo signals. An answer the result contradicts reopens under the settled rule. A new dependency brings step 2 back for what it ships. Deliver each waiting pick whose dependency is now restored, and clear its **Waiting** field.
2. **Derive.** Take [Check commands](#check-commands), and the [Style guide](#style-guide) pointer and conflicts.
3. **Confirm.** Show the rows and any line the look changed as a short draft, approved like step 4's, with the harness checks when step 4 had no draft. Nothing to change means no draft. Run and write what it approves.
4. **Verify guidance.** When this run delivered or changed guidance, read [verify guidance](references/verify-guidance.md) and follow it. On any other run, confirm that each selected skill's folder and each pointer's path still exist.
5. **Report.** Tell the user what this run wrote and which skills read it, then each step's result: done, skipped with its reason, or **incomplete** with its next step. List every question still open: its handoff entry or issue, any research still running, and what each one blocks. Mention they can edit `docs/agents/*.md` directly later, and that a re-run reads the current state, keeps what is settled and revisits only what changed.

A check that cannot finish here stays incomplete and goes through [Open questions](#open-questions) with the exact command as its next step. Independent work finishes either way.

Done when every check has a result or a next step, and the report names each one.

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

Every config file opens with this line, directly under its title, with or without the `>`; a config file this skill owns that lacks it gets the line through the draft, and `docs/agents/setup-handoff.md` and `docs/agents/setup-research/` are not config files, so neither the line nor the no-change check under [Deliver guidance](#4-deliver-guidance) applies to them. A JSON config file has no title and carries the line as its first key, `$comment`.

> A missing field means the owning skill's default.

## Open questions

An open question never stalls the run, whether a section raised it or the owner volunteered it at any point, including a doubt about a choice a section would otherwise write without asking. Take the first route that fits, then carry on with everything that does not need its answer. Read [open-questions.md](references/open-questions.md) when any route past the lookup fires.

| The question | Route |
|---|---|
| A fact the repo, a command or a doc states | Look it up in place and continue. |
| One question that bounded reading can settle | Start a research subagent through `delegating` at once, save its findings, and bring the evidence back for the owner to choose. |
| Clear work or a decision that needs another session or a human | Record a handoff: a tracker issue, or a local document with no tracker. |
| Several connected decisions, shape unclear, more than one session | Recommend a `/wayfinder` map, and record a handoff. One substantial research question stays with the research route. |
| A sequence only the human can perform, blocking progress, where an interactive procedure would materially help | Suggest `/wizard`, and record a handoff. |
| A check that cannot finish here: a missing tool, sign-in or network, or a harness this machine lacks | Mark it incomplete, and record a handoff whose next action is the exact command to run. |

A single approval or value is a question to ask the owner; a step you can run yourself is yours to run.

`delegating` is a process call, and `/wayfinder`, `/wizard` and `/handoff` are suggestions the owner starts. None is a requirement: the run works without them.

## Sections

### Recommendations

Recommend collection skills, vendor skills and dependency-shipped guidance together, in one view. Follow [recommendations.md](references/recommendations.md) when this run has something new to weigh: the project has no `## Agent skills` block in place yet, or the stack or dependencies changed since the block did (`git log` on the manifests and the instruction file, or what the owner says when there is no history). It says how to reach the collection catalog and a pack's `SETUP.md` from an installed folder, with no checkout and before any install.

Skills already installed and pointers already in `### Vendor docs` are settled. When nothing new remains to recommend, say so in one line and write nothing.

The view takes the owner's choice. Each pick then goes in step 4's draft with its install command or pointer, and is delivered once the draft is approved. Documentation pointers go in the `### Vendor docs` sub-block; a run with none writes no sub-block.

### Vendor sources

When this run delivers a vendor pick or a pick waiting for its dependency, when the owner deselects one, or when `docs/agents/vendor-sources.md` exists, read [vendor-sources.md](references/vendor-sources.md) and follow it: in step 2 check what the file holds, and in step 4 record the picks and remove what is no longer selected. Otherwise skip this section and write no file.

Refreshing happens during this run, or when an agent changes a followed dependency within its task's authority. Nothing runs between those times.

### Scaffolding

When the intended outcome needs something the project lacks, read [scaffolding](references/scaffolding.md) and follow its Choose part. With no gap, skip this section.

### Issue tracker

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, and `to-spec` read from and write to it. They need to know whether to call `gh issue create`, write a markdown file under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub**: issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab**: issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown**: issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.): ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`, from its seed: [issue-tracker-github.md](./issue-tracker-github.md), [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) or [issue-tracker-local.md](./issue-tracker-local.md). For an "other" tracker, write the file from scratch using the user's description. The GitHub and GitLab templates describe a "PRs as a request surface" flag, defaulted **off**, which only a `yes` writes. Leave it off and don't raise it: a user who wants external PRs in the triage queue can add the flag the file describes later.

A GitHub or GitLab tracker needs a reachable repo. When the user picks one and no `git remote` points at that host, get the repo URL from them and wire it up (`git init` if needed, `git remote add origin <url>`) before going further. Done when `gh repo view` / `glab repo view` prints the project from inside this directory; if it can't, tell the user what's missing and take it through [Open questions](#open-questions).

### Triage labels

Ask only for a real tracker: GitHub, GitLab or other. Local markdown has no labels, so this section is skipped there. A real tracker already recorded with no `docs/agents/triage-labels.md` has settled on the defaults. Otherwise read [triage-label-choice.md](references/triage-label-choice.md) and follow it, using the seed [triage-labels.md](./triage-labels.md).

### Domain docs

Default to **single-context** (one `GLOSSARY.md` + `docs/adr/` at the repo root). This fits almost every repo; write it without asking.

Offer **multi-context** (a root `GLOSSARY-MAP.md` pointing to per-context `GLOSSARY.md` files) only when exploration found monorepo signals. Then confirm which layout they want.

Record the layout in `docs/agents/domain.md`, from its seed: [domain.md](./domain.md).

### Check commands

Runs in step 6, so an empty project's commands come from what step 5 produced. Derive the commands from the project's own configuration, and ask only for what it does not show. Propose one row per command with what it checks and its cost tier: `edit loop`, `task end` or `CI`, defined in the seed. Give a test command its one-file form as a separate `edit loop` row when the runner takes one, with `<file>` in the path's place.

Record the rows in `docs/agents/check-commands.md`, from its seed: [check-commands.md](./check-commands.md), replacing its placeholder row. `verifying`, `implement` and `constraints` read this name and these columns, so keep both. Rows already in the file are settled, whoever wrote them, including the rows `constraints` adds. A floor guard gets a row only when the project already has one. Settled rows are not run again.

Once step 6's draft is approved and before writing `check-commands.md`, run each `edit loop` and `task end` command once, on a real test file for a one-file form; the draft names them. A command that cannot start (exit 127, an unknown script) leaves its row out and goes through [Open questions](#open-questions) with its next step. A command that runs and fails keeps its row and is reported with its exit code. Report `CI` rows as not run. A project with no commands after step 5 writes no file, and the final report says so.

### Style guide

When no pointer is recorded, or the guide it names has gone, read [style-guide-choice.md](references/style-guide-choice.md) and follow it: offer the choice in step 3, put the guide in the project and write the one pointer line in step 4, and in step 6 name the tooling step 5 added and flag each conflict with tooling configuration. With a pointer already settled, run only that reference's Flag conflicts step.

A block holding `### Domain docs` with no `### Style guide` has settled on no guide, so a skip writes nothing and is not offered again. Exploration reopens it by finding a written guide or tooling configuration, as does a newly selected pack that offers a template.

### Evidence

An `## Agent skills` block already in place with no `docs/agents/evidence.md` has settled on the defaults. Otherwise ask one question, showing the defaults:

> Keep the evidence defaults? (recommended: **yes**) Evidence record path: `docs/evidence/`. Approver: the owner in this session.

On **yes**, write no file and no sub-block. Otherwise write `docs/agents/evidence.md`, with the missing-field header, holding only the facts that differ, under the names `risky-changes` and `hillclimb` read: `**Evidence record path**:` and `**Approver**:`. Add the `### Evidence` sub-block.

### Guard extensions

Only when a selected pack's `SETUP.md` offers guard extensions, read [guard-extensions.md](references/guard-extensions.md) and record the selection. With no offer, skip this section.

### Packs

Take this section last in step 3, after every other section. When no pack guide (`<pack>-guide`, with a plugin prefix when a plugin installed it) shows in your skill listing, the project's skill folders or this run's picks, and the instruction file has no `### Packs` list, skip it and write no sub-block. Otherwise read [packs](references/packs.md) and follow its full run.
