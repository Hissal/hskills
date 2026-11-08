---
name: unity-verification
description: Use when checking that a Unity change compiles or works, running Unity tests, building a Player, running C# in the Editor, classifying Unity involvement for issue triage or selection, or when Unity cannot run here or the Editor is locked.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/unity-verification"
  agent-skills-sync.requires: '["hissal.hskills/unity-guide"]'
  opencode/autoinvoke: "true"
---

# Unity verification

Before doing any work, load unity-guide (hissal.hskills/unity-guide) and
its needed reference files through the installed skill listing. Begin work only
after all requirements and needed references have loaded. If any cannot load,
stop without partial work and print:

Stopped: required skill unity-guide (hissal.hskills/unity-guide) could
not be loaded completely. Unavailable: <unloadable-material>. Ordinary installers
such as `npx skills` do not install requirements; `agent-skills-sync` resolves
them from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

This is the Unity layer on core `verifying`, which owns the process, the definition of done and the status words. Here: which check establishes what, where it can run, how to read what it says, and how to report it. Done when each claim rests on a check that establishes it, every result was read past its exit code, and the [report](#report) is written. A [lookup](#lookups-from-other-workflows) is done when its answer is given.

The CLI is beta and moves every few weeks. The commands named here mark traps. Take their current form from `unity commands --grep <term>`, `unity <command> --help`, `unity skill show` and, for Editor commands, `unity command --query <term>`.

## Project facts

Read **Verification** in `docs/agents/unity.md`. A missing field means this default:

| Field | Default |
|---|---|
| Allowed environments | Connected Editor and headless |
| Cold import | Ask first |
| Resident headless | Off |
| Test filters | None |
| Build targets and method | The project's active target, with the CLI's default build |
| Authoritative CI workflow | "CI, if the repo has one" |
| Unity involvement classification | Disabled |

Rung commands live in the check-commands file linked from the `## Agent skills` block. A row for a check replaces the default route for that check; with no file or no row, use the routes below.

## Choose the check

For each behaviour the change touches or failure it risks, pick the cheapest check that establishes it, and stop there. Checks are distinct evidence and are not cumulative: a dearer check never requires every cheaper one first. The one prerequisite is that code compiles and changed assets import before anything runs them.

| Check | Establishes | Leaves open |
|---|---|---|
| Text checks | What the files alone settle: a `.meta` beside each new asset, valid YAML or JSON, every use of a renamed symbol | Anything Unity computes |
| Compile | Scripts compile for the Editor and changed assets import | Code only the Player compiles, and all behaviour |
| EditMode tests, targeted or full | The logic those tests assert | Frames, Play mode lifetimes, content they never load, the Player |
| PlayMode tests | Behaviour across frames and Play mode lifetimes, from the state the test scripted | Real input, feel, the Player |
| Focused inspection | The changed thing itself, after import. It is how a moved, restyled or reworded item gets checked. Entering Play to look at a scene belongs here | Everything you did not look at |
| Player build | The build compiles and completes on that target and backend | How the Player behaves, until someone runs it |
| CI | The checks CI runs, in its environment | What its workflow leaves out |

- **Player build.** Run it when the change can break a build-only path (`#if` and `UNITY_EDITOR` branches, `UnityEditor` in a runtime assembly, stripping, IL2CPP, platform defines), or when asked. The Editor's own compile cannot see these: a runtime script calling `UnityEditor` outside its guard compiles there and passes every test, and only the build fails. A change with no such path needs no build.
- **Cost follows risk.** A missing piece of evidence goes in the report as unvalidated. It earns an expensive gate only when the change carries a risk that gate alone can establish.
- **Tests.** What to test and which suite a moment calls for is `unity-testing`'s call when it is installed; here you run them, with the project's test filters.
- **Keep three kinds of evidence apart**, and name which one each result is:
  - **Scripted state**: a test or script set the state, then observed it. A simulated run is this, never a playtest.
  - **Real input**: input arrived through the game's own input path.
  - **Human judgement**: feel, visuals, audio, perceived timing. No check gives this. It becomes a manual check in the report.

## QA checklist

Pick the few cases this change most risks, and name each one's evidence kind. They run on the targets and devices the project already has.

- **Interruptions**: focus loss, pause, a scene load or a dialog arriving mid-action.
- **Input-device switching**: changing device mid-interaction, a device disconnecting, prompts and UI focus following the switch.
- **State transitions**: entering or leaving a mode mid-action, restart, quit to menu, and returning to a state already left.

A case a test can script goes to `unity-testing`. A case that needs real input or judgement becomes a manual check in the report.

## Where Unity runs

Take the first route the project's allowed environments permit and this machine can run. [Environments](references/ENVIRONMENTS.md) has detection, what each route can do, and its traps. Read it before starting or driving an Editor.

1. **Connected Editor**: an open Editor with the Pipeline package, driven through the CLI. It is the only route while an Editor holds the project.
2. **Headless**: a batch launch per check, when an Editor is installed, nothing holds the project and a licence is available.
3. **Hand-off**: run the text checks, then name what the user or CI should run.

In every environment:

- The user's Editor stays running, and only the user closes it. The lock refusal's "Close it and run the command again" is addressed to the user; carry it to them as the fix they can choose.
- Batch mode launches only against a project no Editor holds.
- Activating, returning and signing in for licences are the user's.
- **A missing capability is an environment gap, reported as one and never as a passing check or a code failure.** A licence failure, a locked project, a missing Editor or a declined cold import each leaves its checks skipped and their claims unvalidated.

When the project lacks Pipeline and the connected route would help, run `unity pipeline install` and say so in the report: it adds `com.unity.pipeline` to the manifest. An Editor started afterwards loads it; one already open needs a refresh first ([Environments](references/ENVIRONMENTS.md)).

A resident headless Editor runs only when the project allows it. Name one you start in the report and stop it when done. Ask before stopping one you did not start.

## New checkout

Each checkout keeps its own `Library/`, generated state being per checkout. A checkout with none needs one before its first run:

- **Warm copy**, the default when another checkout of the project has a `Library/`: copy that folder in before Unity first opens the new checkout, with a parallel copy such as `robocopy <src> <dst> /E /MT`, since a file-by-file copy of a large `Library/` can outlast the import. Prefer a source no Editor holds, since an Editor can write mid-copy. Then delete `EditorInstance.json` and `ProtocolInstance.json` from the copy when present: while the source Editor lives, the copy's marker makes the CLI refuse the checkout as already open. The first run recompiles once and reimports what differs between the commits.
- **Cold import**, when no warm copy exists: ask the user once before the first run, since a full import can take many minutes, unless the project permits it. A run creating several worktrees asks once for all of them and imports one at a time: two at once ran a 15 GB machine out of memory and crashed the Editor. Warm runs in separate checkouts can run side by side.

## Reading results

A result is green only with a clean compile, a nonzero test count and zero failures. A count of zero is no verdict, core's **inconclusive**, whatever the exit code and report say: a filter that matched nothing exits 0 with `result="Passed"`. Run a filter as given, even when it looks wrong: its zero answers what was asked. Report that as not green and offer the exact name as the next run.

Exit codes and envelopes mislead in both directions. Read [Reading results](references/READING-RESULTS.md) before trusting any Unity result.

To run C# in the Editor (a validation script, a probe, a script another Unity skill ships), read [Running C#](references/RUNNING-CSHARP.md).

## CI

Pushing and triggering CI are the user's. Name the checks CI would cover and which workflow runs them; those stay unvalidated. Once the user has pushed, read the finished run from the CI host and report it as that check.

## Lookups from other workflows

A core workflow asking through the guide gets knowledge for its own job: run no check and start no workflow for it, and skip the report. Read the file for the need, and answer from it and the sections above.

| Asked for | Read |
|---|---|
| Ship-readiness for a project or a package | [Ship-readiness](references/SHIP-READINESS.md) |
| Measuring a change against real data: which values a run really used | [Which values](references/WHICH-VALUES.md) |
| Check tools and cost tiers (`constraints`), shared resources or parallel worktrees (`delegating`, `implement-spec`), slicing work (`to-tickets`), environment gaps (`retro`) | [Planning](references/PLANNING.md) |
| Classifying Unity involvement in issues, for triage or selection | [Issue classification](references/ISSUE-CLASSIFICATION.md) |

## Report

Every verification ends with this, inside core's report:

- **Ran**: each check, run or reused, with its route, tree and result (for tests, the counts), and which kind of evidence it is.
- **Skipped**: each check the risk needed that did not run, with its reason. A missing capability reads `environment gap: <what>` (no Editor, locked project, no licence, cold import declined, CI not triggered), and the answer says the code was not judged.
- **Unvalidated**: each behaviour or risk whose check did not run.
- **Known failures**: unrelated failures seen, left for their own investigation.
- **Manual checks**: what no check can judge, as concrete steps for the user.
