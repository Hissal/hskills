# Unity pack setup

`setup-project` follows this file as the Unity pack's section, and reads it to recommend the pack before anything is installed. It writes `docs/agents/unity.md` and the pack line through `setup-project`'s draft.

## Contents

- [Detection signals](#detection-signals)
- [Recommend](#recommend)
- [What gets written](#what-gets-written)
- [1. Explore](#1-explore)
- [2. Confirm the facts in one list](#2-confirm-the-facts-in-one-list)
- [3. Ask the permissions](#3-ask-the-permissions)
- [4. Offer Unity involvement classification](#4-offer-unity-involvement-classification)
- [5. Ask the prototype folder](#5-ask-the-prototype-folder)
- [6. Draft](#6-draft)

## Detection signals

- A folder holding `ProjectSettings/ProjectVersion.txt`: a Unity project.
- A `package.json` with a top-level `unity` field: a UPM package.
- In a repo with neither, the owner saying they intend a Unity project or package.

Search as [Detect](SKILL.md#1-detect) does, with its skip list. With no signal the pack does not apply: ask nothing and write no file.

**Domain, for the pack line:** Unity projects and UPM packages.

## Recommend

**The pack:** `unity-guide`, `unity-testing`, `unity-verification`, `unity-debugging` and `unity-prototyping`. Add `unity-networking` when `Packages/manifest.json` holds a netcode package or the owner intends multiplayer.

**Official Unity skills:** read the skill list in `Unity-Technologies/skills` and give one row to each skill whose job fits something the repo shows or the owner intends: a package in the manifest, a render pipeline, an asset type in use. Each row shows idle cost, overlap with this pack and any hooks, as `setup-project`'s view asks. Recommend these rows one by one. The whole plugin is a choice only the owner opens. The pack works with none of them.

**Style:** this pack offers no template, so the Style guide section takes the project's own guide or none.

## What gets written

- **Only what differs.** A field is written when its value differs from the owning skill's default, and a missing field means that default. Two fields are always written: **Project**, and **Prototype folder** once answered.
- **Defaults stay with their owners.** Read each one from the owner named in [the table](#1-explore) and show it with its value. When the owner is not installed yet, read it where `setup-project` read this file.
- **Pointers, not copies.** **Conventions** names the repo's own docs by path, leaving their content there.
- **Repo-relative paths.** Refuse an absolute path, a leading `~` or a drive letter, because the file is committed and every other checkout and CI runner reads it. Offer the repo-relative form, or leave the value out.
- **No machine data:** no Editor install paths, usernames or licence data.

## 1. Explore

Find each fact by reading, without asking. When `docs/agents/unity.md` exists, also read its values and every line no field below accounts for.

| Field | Section | Owner | Where to look |
|---|---|---|---|
| **Path** and **Shape** | Project | `unity-guide` | The detection signals: each project or package folder, and `project`, `package` or `both` |
| A pointer per doc | Conventions | `unity-guide` | `AGENTS.md`, `CLAUDE.md`, `docs/`, `CONTRIBUTING.md` and READMEs in the project folder. Prefer one existing index over listing every doc. Each line: `<path>`, then the Unity work it governs |
| **Test filters** | Verification | `unity-verification` | `-testFilter`, `-testCategory` or `-assemblyNames` in runner scripts and CI jobs |
| **Build targets and method** | Verification | `unity-verification` | `targetPlatform` and `buildMethod` in CI, scripts calling `BuildPipeline.BuildPlayer`, Build Profile assets |
| **Authoritative CI workflow** | Verification | `unity-verification` | Workflows running Unity (`game-ci/`, `unity test`, `-runTests`, `-executeMethod`). With several, propose the one that runs the tests and builds |
| **Test assembly layout** | Testing | `unity-testing` | Folders and names of existing test asmdefs, and any layout rule in the conventions docs |
| **Mocking library** | Testing | `unity-testing` | A mocking DLL or package referenced by test asmdefs |
| **Naming convention** | Assemblies | [ASSEMBLIES.md](references/ASSEMBLIES.md) | Each `.asmdef`'s `name`, and any naming rule in the conventions docs |
| **Project-wide defines** | Assemblies | [ASSEMBLIES.md](references/ASSEMBLIES.md) | `-define:` in a `csc.rsp`, `scriptingDefineSymbols` in `ProjectSettings/ProjectSettings.asset`, Build Profile assets |
| **Third-party serializer** | Serialization | [SERIALIZATION.md](references/SERIALIZATION.md) | A serializer package or plugin folder (Odin: `Assets/Plugins/Sirenix/`), then the conventions doc covering it |

[LIFECYCLE.md](references/LIFECYCLE.md) owns the Code lifecycle section, which has no field to ask.

**Check runners** go to `setup-project`'s Check commands section, as its rows: scripts that run the repo's text checks, compile or Unity tests. On a one-pack run, which touches no core file, name them in the report with `/setup-project` as the next step.

## 2. Confirm the facts in one list

Show every fact as one list, each with its source, its owner's default and whether it will be written. With an existing file, put its value beside the discovered one where they differ, and propose the discovered one: the repo is current. The owner corrects the list in one reply. Done when the owner has answered the list.

## 3. Ask the permissions

Ask one question, listing each with its default from its owner, or with the value the file already sets:

- **Allowed environments**, **Cold import**, **Resident headless**, from `unity-verification`.

> Keep these Unity defaults? (recommended: **yes**)

**Yes** writes nothing new and keeps what the file sets. On **no**, ask which to change and take each one at a time. A value set back to its default leaves the file.

## 4. Offer Unity involvement classification

Read `ISSUE-CLASSIFICATION.md` in `unity-verification`'s references, then take the first that fits:

1. **The file records a choice:** keep it.
2. **The repo already has a convention** in its labels or tracker docs: propose a pointer to its canonical rules, adding no labels. Surface any meaning that conflicts for the owner to resolve.
3. **Otherwise** offer disabled (recommended, the default, writes nothing) or the default labels.

On adoption, write **Unity involvement classification** under Verification: `labels: unity:none, unity:headless, unity:interactive`, or the pointer. Put any label creation in the draft, following the tracker's file. Write an explicit `disabled` only to override a convention the repo has.

## 5. Ask the prototype folder

Ask on every run as its own question, even when every other default was kept, leading with the value the file records when it has one. A package-only repo has no `Assets/`: say so in one line and write no field, since `unity-prototyping` asks which project hosts a prototype.

First look for candidates under each project's `Assets/`: folders named for local, dev, sandbox, scratch or prototype work, and any folder holding its own `.gitignore`. Run `git check-ignore -v <folder>/x` on each. Then offer:

1. **`Assets/_Prototypes/`, a path only (recommended).** Setup records the path and nothing else: no folder, no ignore rule and no commit on the default branch. The folder first appears on a prototype's throwaway branch, committed normally with its `.meta` files, so pushing that branch takes it to another machine.
2. **A self-ignoring folder.** State the cost: nothing reaches another machine until captured with `git add -f`. Setup creates the folder with a `.gitignore` of `*` then `!.gitignore`, and confirms with `git check-ignore -v <folder>/x` once written. Tell the owner to commit that `.gitignore`, and the folder's `.meta` once Unity has imported it.
3. **Each ignored folder found.** It is accepted as found, with no git question and no change to any file. State the same cost as option 2.

A found folder that is not ignored works as option 1 at that path: show it as such when listing candidates.

Write **Prototype folder** for every answer, as a repo-relative path including the project's folder (`game/Assets/_Prototypes/`), one line per project.

## 6. Draft

Start the draft from this seed and keep the title, the header line and **Project**. Add each other section only when it holds a value, and only its fields with values.

```markdown
# Unity facts

> A missing field means the owning skill's default.

## Project

- **Path**:
- **Shape**:

## Conventions

- `<path>`: the Unity work it governs.

## Verification

- **Allowed environments**:
- **Cold import**:
- **Resident headless**:
- **Test filters**:
- **Build targets and method**:
- **Authoritative CI workflow**:
- **Unity involvement classification**:

## Testing

- **Test assembly layout**:
- **Mocking library**:

## Assemblies

- **Naming convention**:
- **Project-wide defines**:

## Serialization

- **Third-party serializer**:

## Prototype

- **Prototype folder**:
```

**On a re-run,** update the file in place: change only field lines whose value changed, add new ones, and remove ones now equal to the default. Every other line, including a note or a field this file does not name, stays where it is, word for word. With no change, nothing is drafted.
