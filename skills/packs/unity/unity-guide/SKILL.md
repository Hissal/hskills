---
name: unity-guide
description: Use when designing, changing, reviewing or diagnosing Unity code, assemblies, serialized data or lifecycle behavior; when a workflow requests Unity-specific knowledge; or when choosing a Unity workflow.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/unity-guide"
  opencode/autoinvoke: "true"
---

# Unity guide

Knowledge for Unity projects and UPM packages. You supply knowledge for the job in hand and never start a workflow: a review stays read-only, a gated workflow stays gated, and a lookup writes no file, temporary ones included. Invoked with no stated need, take the task in front of you as the need.

Take the steps in order. Your final reply opens with every line steps 1 and 2 ask you to say, even one a progress message already said, then the answer. On a later lookup in the session, reuse the detection and leave out the lines an earlier final reply gave.

## 1. Detect

A **project** is a folder holding `ProjectSettings/ProjectVersion.txt`. A **package** is a folder whose `package.json` has a top-level `unity` field.

1. **Recorded paths.** When `docs/agents/unity.md` records paths under **Project**, check each for a marker. Name a path with neither as stale, in the wording of [the contradiction notice](#2-read-the-project-facts). Any path that holds a marker settles detection.
2. **Search.** With no valid recorded path, search from the repo root for both markers, skipping dot-folders, folders ending in `~`, `Library/`, `Temp/`, `Logs/`, `obj/`, `Build/`, `Builds/`, `node_modules/` and a project's `Assets/`. Those hold generated, cached or imported manifests that are not this repo's.

Every hit counts. Say `Unity repo: <shape> at <paths>.`, where the shape is `project`, `package` or `both`.

With no hit, reply `Not a Unity repo.` and return, adding nothing else. The caller carries on as if this step had not run.

## 2. Read the project facts

**Pack list.** Read the `### Packs` section of the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. When it does not list `unity-guide`, say this, then answer anyway:

> `unity-guide`: installed, not set up: run `<setup-project invocation>`.

**Fact file.** Read `docs/agents/unity.md`. A missing file or field means the owning skill's default. This guide owns **Project** and **Conventions**: read each repo doc under **Conventions** whose scope covers the need.

**Contradictions.** The repo outranks the record. When a recorded fact disagrees with the repo, use the repo and say:

> `docs/agents/unity.md` says <recorded fact>; the repo shows <what you found>. Using the repo. Re-run `<setup-project invocation>` to update it.

Write the invocation as installed in this harness: `/setup-project` on Claude Code (`/plugin:setup-project` from a plugin), `$setup-project` on Codex.

## 3. Answer the need

- **A caller asks.** Find the row for its need, load only that row's target, and answer from it inside the caller's job. Load a file by reading it and a `skill:` target through the skill tool. Skip a target skill that is not installed without a word.
- **No caller.** Take the rows whose need matches the work and load those targets.
- **No row fits.** Reply `No Unity pack row covers: <need>.`, adding no general advice and doing none of the work. The caller carries on with its own process.
- **Choosing a workflow.** Follow [Choosing a workflow](#choosing-a-workflow).

## Needs

| Need | Target |
|---|---|
| A Unity API, Manual or package fact at this repo's versions | [Docs lookup](SKILL.md#docs-lookup) |
| Knowledge from an official Unity skill or vendor source this project selected | vendor-guidance: the sources in the project's `### Vendor docs` and `docs/agents/vendor-sources.md`; reading one grants no workflow authority |
| Serialized fields, asset/script moves, prefab overrides, saved-data compatibility or GUIDs; Unity asset merge conflicts; asset churn in a hotspot scan | [Serialization rules](references/SERIALIZATION.md) |

## Docs lookup

The repo's versions: an Editor from `m_EditorVersion` in the project's `ProjectVersion.txt`; a package's minimum from the `unity` field of its `package.json`; an installed package from its entry in the project's `Packages/packages-lock.json`.

Read `unity docs --help` for the current flags, then stop at the first step that gives you the page:

1. **Print the page as Markdown** with `unity docs --content`. Run it from the project folder itself, or pin `--editor-version`.
2. **Use the CLI's page URL** from `--url`, or from `unity docs toc`, which lists the real pages. Fetch it.
3. **Search the official docs**: `docs.unity.com`, and `docs.unity3d.com/Packages` for a package. Hand-built URLs are out; a URL comes from the CLI or from the search.

A missing CLI or flag sends you to the next step. Close the answer with one of these lines:

- `Version match: confirmed (docs <version>, repo <version>).` The page itself states that version and its major.minor equals the repo's.
- `Version match: not confirmed (docs <version>, repo <version>).` Any other page.
- `Unverified: <fact>. No official page found.` Nothing found. Anything you add from memory is labelled as memory and carries no version claim.

Traps observed on CLI 1.0.0-beta.15:

- In a subfolder of the project or outside it, the CLI prints the newest docs and says nothing. A version the site lacks falls back to another with a one-line notice. So read the version off the page: the `version:` field of the Markdown, or `--json`.
- `--url` on a miss exits 0 with a `search?q=` address, `resolvedBy: search`. That is a results list, so it is no page: go on.
- The Manual has no name lookup: `--content --manual` fails and `--url --manual` returns a search. Take the page's `url` from `unity docs toc --manual`.
- `--package` takes no topic and no `--editor-version`. It reads `Packages/packages-lock.json` from the project folder, and with no lock entry gives the registry's newest. Its `--content` often has no Markdown to print, and its `--url` is the manual's index: reach the page through that page's links or step 3.

## Choosing a workflow

Asked by the core `guide` for routes, say `This pack has no workflows of its own.` and nothing more: this pack gives it no routes.

Asked by anyone else which workflow fits, say the same sentence, then return one invocation with its reason and run nothing. Take an installed Unity skill from the [needs table](#needs) when its job fits. Otherwise take the core skill below, and for anything else, `/guide`.

| Job | Invocation |
|---|---|
| Checking a change compiles, works or is ready to ship | `/verifying` |
| Finding the cause of a bug, failure or regression | `/diagnosing-bugs` |
| Writing or fixing tests | `/tdd` |
| Reviewing a change | `/code-review` |
| Reshaping code while its behaviour stays the same | `/refactoring` |
| Trying an idea with something throwaway | `/prototype` |
| Building a bounded change or ticket | `/implement` |

Write it in this harness's form: `/name` on Claude Code (`/plugin:name` for a plugin skill), `$name` on Codex.
