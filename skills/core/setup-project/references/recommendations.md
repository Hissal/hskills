# Recommendations

One view of everything that would help this project: skills from `Hissal/skill-collection` (the repo these skills come from), separately installed vendor skills and guidance shipped inside dependencies. An empty repo gets the same view, built from the intended stack. Nothing here needs a pack list, an installed guide, restored dependencies or finished configuration.

The view and the choice are step 2; delivery is step 4. Done when the owner has seen the view, every row has their answer, each pick is delivered or named as waiting for its dependency, and every source you could not reach is named.

## Contents

- [1. Find the stack](#1-find-the-stack)
- [2. Discover](#2-discover)
- [3. Weigh overlap](#3-weigh-overlap)
- [4. Show the view](#4-show-the-view)
- [5. Take the choice](#5-take-the-choice)
- [6. Deliver](#6-deliver)

## 1. Find the stack

Take it from declarations, lock files and code. With no stack to read, use the outcome and stack from [Orient](../SKILL.md#1-orient), and the intended versions below.

## 2. Discover

**Installed.** The skill listing this session shows, `skills-lock.json`, `.claude/skills/`, `.agents/skills/`, `enabledPlugins` in `.claude/settings.json`, and `[plugins]` in `.codex/config.toml`. An installed skill is shown as present and needs no pick.

**`Hissal/skill-collection`, at one commit.** Choose the commit once and read everything at it:

1. A `skills-lock.json` entry with source `Hissal/skill-collection` and a full commit as `ref`: that commit.
2. Otherwise the newest release tag from `git ls-remote --tags --refs https://github.com/Hissal/skill-collection.git`, resolved to its commit.
3. With no tag, the commit from `git ls-remote https://github.com/Hissal/skill-collection.git HEAD`. Tell the owner it is unreleased.

Read one of its files at that commit with:

```sh
gh api -H "Accept: application/vnd.github.raw" "repos/Hissal/skill-collection/contents/<path>?ref=<commit>"
```

Without `gh`, use `curl -fsSL https://raw.githubusercontent.com/Hissal/skill-collection/<commit>/<path>`, which serves only a public repository.

| File | Gives |
|---|---|
| `catalog.json` | Each skill ID's folder `path` and its direct `requires` |
| `collection.json` | Core and each pack's member folders |
| `docs/catalog.md` | What each skill and pack is for, and the section of vendor picks decided as setup offers |
| `<skill path>/SKILL.md` | Its `description`, and `disable-model-invocation` for the idle cost |
| `<guide path>/SETUP.md` | A recommended pack's detection signals, requirements and named vendor offers |

A pack's guide is its member folder ending in `-guide`. Read its `SETUP.md` from an installed copy when there is one and from the commit otherwise; reading installs nothing. A 404 for `SETUP.md` once `catalog.json` has been read means the pack has nothing to configure. A pack in `docs/catalog.md` and absent from `collection.json` is not built at this commit: leave it out of the view, and keep its vendor offers that fit the stack.

When `catalog.json` cannot be read, name the failure and the next step (`gh auth login`, or the network), and build the view from the other sources with that repo marked not checked.

**Vendor sources.** Read each candidate's own repository or documentation for its skills, commands, agents, hooks and telemetry. Candidates come from the catalog's vendor offers that fit the stack, a pack's `SETUP.md`, and the vendors of the stack's main tools. Vendor offers that a pack decision names are made in this view, under the catalog's conditions. Look once for each candidate's source, in the vendor's own organisation and documentation; one you cannot find takes a row marked `source not found`, with no route.

A repo is **agentic** when it builds agents, MCP servers or agent tooling: `.mcp.json`, an MCP or agent SDK dependency, a plugin manifest, or that stated intent. An instruction file alone is no signal. For an agentic repo, always offer both of these from Anthropic's `claude-plugins-official` marketplace (`anthropics/claude-plugins-official`, under `plugins/<name>/`):

- `mcp-server-dev`: skills for designing and building MCP servers, each skill its own row.
- `agent-sdk-dev`: a project scaffold command and verifier agents for the Claude Agent SDK. It ships no skill folder, so its route is the Claude Code plugin alone.

**Dependency-shipped guidance.** Look through what each direct dependency has already put on disk, in whichever folder its package manager restores to:

- `AGENTS.md`, `CLAUDE.md`, a root `SKILL.md`, `skills/*/SKILL.md`, `dist/skills/` or `.claude-plugin/`: agent guidance.
- Bundled documents the package tells agents to read, such as `dist/docs/`.
- A `skills` field in its manifest: a separate source, which does not follow the package's version.
- Marked blocks already in the project's instruction file, with the tool that owns them.

Discovery reads files. For a dependency that is not restored or not yet chosen, read its published documentation or package at the intended version, or the newest its declared range allows, and mark any guidance it ships **arrives with the dependency**. Running a package's setup command or install script waits for the owner's pick.

## 3. Weigh overlap

Group the candidates by the job each serves, then:

- Prefer the material that fits the installed or intended version.
- Keep complementary guidance.
- Keep two sources for one job only with a stated reason.
- Surface a conflict you cannot settle as a question for the owner.

Bundled and separate material compete on those terms alone: neither wins for being what it is.

## 4. Show the view

One table, one row per skill or per dependency's documentation, in order of value. Lead with your recommended selection and mark each row in it.

| Pick | Kind and source | Adds | Overlap | Idle cost | Always-on, hooks, telemetry | Route |
|---|---|---|---|---|---|---|

- **Adds:** a short reason tied to this project. A `Hissal/skill-collection` skill's row names what it `requires`, and its cost includes them, since they install with it.
- **Overlap:** the row it duplicates or complements and what you recommend, or `none`. Include installed skills and handwritten instructions.
- **Idle cost:** estimated tokens every session, `description` plus `when_to_use` characters ÷ 4 for each skill, command or agent. A user-invoked skill (`disable-model-invocation: true`) costs 0. A pointer costs its own line. Add the size on use when it is known. Write `not measured` with the reason when you could not read the source.
- **Always-on, hooks, telemetry:** each one by name, with its off switch when it has one, or `none found` with what you read. For a dependency, include any instruction block it writes itself. For a vendor skill, include any script or binary its folder ships.
- **Route:** from [Deliver](#6-deliver).

Under the table, name what the install route itself does: `npx skills` sends anonymous usage data and security-audit requests unless `DISABLE_TELEMETRY=1` is set. Ask which the owner wants.

## 5. Take the choice

The answer is one of:

- **Accept the selection:** every marked row.
- **Named rows:** exactly those.
- **A whole vendor set:** every skill from one named source, now and as that source adds more. Offer this as the owner's explicit choice. Say what it costs at today's size, which of its skills fit the project poorly, and which sources it could come from when a vendor has several.

Each answer covers the rows it names. Accepting a dependency's row, or the dependency itself, enables nothing else it ships: list each of its skills as its own row. Documentation takes one row per dependency, with no page-by-page choice.

Show the exact text of a hook or always-on instruction, then take a separate yes for it, even inside an accepted selection or whole set. On a no, deliver the rest by a route without it, and say what that loses.

This choice settles what the draft holds; approving the draft approves its commands and pointers.

## 6. Deliver

List each pick's command and pointer in the draft. After approval:

| Pick | Route |
|---|---|
| Documentation | One line in the `### Vendor docs` sub-block. For bundled documents: `When <job>, read <project-relative path>; it follows <dependency>'s installed version.`, with the path to the documents' entry file or folder, resolved from the workspace that uses the dependency. With nothing bundled: `When <job>, read <vendor URL>.` A vendor-managed block that already tells agents how to reach these documents stays as it is. Say so in the row and recommend no pointer; write one only when the owner picks it, and leave the block alone. |
| `Hissal/skill-collection` skill or pack | `npx skills add Hissal/skill-collection#<commit> --skill <name>... --agent claude-code codex --yes`, naming every requested skill and all it `requires`, followed transitively through `catalog.json` at that commit, because the tool does not resolve requirements. `--skill` takes each skill's `name`, here and in the routes below. A project on another sync tool uses that tool. |
| Vendor skill | `npx skills add <owner>/<repo>#<ref> --skill <name> --agent claude-code codex --yes`, with `<ref>` the commit of the newest release tag, or of the default branch when the source has no version tags. |
| Skill shipped in a dependency | `npx skills add ./<restored package folder> --skill <name> --agent claude-code codex --yes`. The leading `./` matters: `skills add` reads a bare `node_modules/<package>` as a GitHub repository. Tell the owner this is a copy: it keeps the version it was copied from until refreshed. |
| Whole vendor set | The vendor's plugin when it publishes one and the owner takes its hooks and always-on parts, since a plugin update brings new skills. Otherwise `--skill '*'`, and tell the owner later additions arrive only when the command runs again at a newer ref. |
| Claude Code plugin | `claude plugin install <plugin>@<marketplace> --scope project`, after `claude plugin marketplace add <owner>/<repo>` when the marketplace is new. It enables the whole plugin in `.claude/settings.json`, so offer it for a pick that wants every part. The marketplace is registered per user: tell the owner teammates run the same `marketplace add`. |
| Hook or always-on instruction | The vendor's own route, after its separate yes. |
| Arrives with the dependency | Nothing yet. Name it in the run's report as waiting; deliver its pointer or skill once the dependency is restored. [Scaffolding](scaffolding.md#run) reads its rules before then, from the published copy. |

The `skills` CLI needs a recent Node: on Node 20 it fails with a `fs/promises` `glob` SyntaxError, and `npx -p node@22 -p skills -c 'skills add ...'` runs it. The draft shows each command as it will run here. On the owner's no to the route's telemetry, each `skills` command starts with `DISABLE_TELEMETRY=1`. Read `npx skills add --help` when a flag is refused. When an install fails, report the command and its output, and carry on with the other picks.

A skill pick is delivered when its folder is in both `.claude/skills/` and `.agents/skills/` and `skills-lock.json` lists it, at the pinned ref when it has one, or when `.claude/settings.json` enables its plugin.

Installing grants availability only. A user-invoked skill stays user-invoked, and delivering it starts nothing.
