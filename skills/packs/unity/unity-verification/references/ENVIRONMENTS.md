# Environments

Observed on CLI 1.0.0-beta.15 with Editor 6000.3.20f1, unless a line says otherwise.

## What each route can run

| Check | Connected or resident Editor | Headless launch | No Unity here | CI runner |
|---|---|---|---|---|
| Text checks | Yes | Yes | Yes | Yes |
| Compile | `unity recompile` | Folded into the test or build run; alone, `unity run` with no method | No | Yes |
| EditMode tests | `test run` | `unity test` | No | Yes |
| PlayMode tests | `test run`, asynchronous | `unity test` | No | Yes, with GPU caveats |
| Player build | Possible; a batch job is usual | `unity build` | No | Yes |
| C# in the Editor | `script run`, `script eval` | `-executeMethod` | No | `-executeMethod` |
| Cost | Nothing extra | Editor start per run, under a minute on a tiny warm project | Installing an Editor plus a licence, with no documented unattended route for Personal | The repo's CI minutes |

A connected Editor verifies its in-memory state, which can differ from disk (unsaved scenes), and a modal dialog blocks it.

## Detecting the route

1. **Is an Editor serving?** `unity status --project-path <project> --json`. Pass `--project-path` on every Pipeline command when more than one Editor may be open. A failure exits 12 with `STATUS_NO_INSTANCES` or `STATUS_ALL_UNREACHABLE`; read `errors[0].code`. `state` in an instance says whether it is ready, and `--until-ready --timeout <seconds>` waits for that.
2. **Does an Editor hold the project?** `unity status` cannot see an Editor without Pipeline: one holding the project still gives `STATUS_NO_INSTANCES`. The check that settles it is the refusal: `unity test`, `unity run` and `unity build` against a held project exit 6 within seconds with "already open in a running Editor (PID n)", and change nothing. Then drive the Editor if it has Pipeline, or hand off.
3. **Can an Editor launch here?** `unity` on PATH, the version in `ProjectSettings/ProjectVersion.txt` installed (`unity editors --installed`), the project's allowed environments permitting it, and an active licence (`unity license status`, which exits 4 when none is active). Any missing piece is an environment gap: text checks, then hand-off.

A restrictive sandbox can hide a running Editor from `unity status`, per the CLI's docs (not observed here).

## Traps

- **A killed Editor's markers.** `Library/EditorInstance.json` and `Temp/UnityLockfile` stay behind, and the next run proceeds on its own since the PID is dead. They need no cleaning.
- **`unity close`** closes without saving, and `--force` terminates the process. Both are only for an Editor you started. Without Pipeline it exits 6 with `PROJECTS_CLOSE_PIPELINE_MISSING`.
- **Installing Pipeline into an open Editor.** It needs a refresh to load the package, and until it loads nothing can reach that Editor to trigger one, nor close it without killing the process and its unsaved work. Ask the user to switch to the Editor, or to refresh by hand if Auto Refresh is off, then wait for ready. Per the fork's earlier observation, not rechecked.
- **Safe Mode.** A GUI Editor that opens with compile errors boots into Safe Mode: packages do not load, so Pipeline serves nothing and connected commands fail. Per the CLI's docs `unity status` reports it with the compile errors; not rechecked. Fix the source and have the user refresh; the same Editor leaves Safe Mode with no restart. Batch mode never enters it, and exits on compile errors instead.

## Resident headless

Allowed only when the project says so. Open it on a project no Editor holds, once the code compiles: `unity open <project> --batchmode --until-ready` (CLI 1.0.0-beta.17). Batch mode quits on compile errors, so an Editor opened mid-edit is gone before it serves anything. Once ready it serves the same commands as a connected Editor. A wait that fails without saying the Editor exited (a timeout, a dialog) leaves it running, so stop it then too. Stop it with `unity close <project>`, the project positional as `unity close --help` shows (it takes no `--project-path`), adding `--force` when the project has no Pipeline, and confirm with `unity status`.

## No Unity here

An agent without Unity stops at text checks and hands off. Installing an Editor there does not help without a licence: Personal has no documented unattended activation, and service accounts cannot activate.
