# Windows install acceptance: spec 2

Use this handoff on a native Windows machine to finish the remaining platform
acceptance for [#116](https://github.com/Hissal/skill-collection/issues/116),
[#119](https://github.com/Hissal/skill-collection/issues/119),
[#120](https://github.com/Hissal/skill-collection/issues/120),
[#121](https://github.com/Hissal/skill-collection/issues/121) and
[#127](https://github.com/Hissal/skill-collection/issues/127), under
[spec #78](https://github.com/Hissal/skill-collection/issues/78).
Implementation is in [PR #180](https://github.com/Hissal/skill-collection/pull/180).
This handoff was written against `5501720`; use the latest PR head, or `main`
after it merges. A WSL run does not establish native Windows behavior.

## Scope and existing evidence

For the completed native matrix and steering, read
[Windows acceptance](../evidence/windows-install-2026-10-31.md). For the guard lifecycle, its
repairs and their native acceptance, read [Windows guard acceptance](../evidence/windows-guard-followup.md).
The [evidence index](../evidence/README.md) maps each claim to its report. Use the steps below
to reproduce or extend those results, recording only newly exercised cases.

Finish the observations below using isolated fixture skills. Actual core/pack
guides and onboarding content are owned by other specs and are unnecessary here.
Linux live runs already verified both mixed-scope requirement directions, copy
selection, and Codex duplicate listing. Windows CI at `5501720` passed 38 install
cases, 218 check fixtures, 612 guard cases and both security scans. That proves
filesystem behavior, not an authenticated Windows harness following the links.

Before choosing host flags or interpreting transcripts, read:

- [Personal installation](../user-install.md) for ownership, steering and doctor.
- [Cross-scope evidence](../evidence/issue-127-cross-scope.md) for the fixture
  identities, markers, six Linux observations and required Windows matrix.
- [Live hook evidence](../../research/live-hooks-120.md) for safe block/allow
  probes and host-event assertions.
- [Live plugin evidence](../../research/live-plugins-121.md) for snapshot and
  running-session branch-switch assertions and the Codex trust boundary.
- [Trigger evidence rules](../trigger-evals.md) before claiming a skill body loaded.
- `writing-for-agents` before writing the resulting agent-facing evidence.

## 1. Establish a disposable, authenticated Windows run

Use a clean checkout containing PR #180. Follow its `AGENTS.md` and naming
conventions. Record `git rev-parse HEAD`, Windows version, PowerShell version,
`node --version`, `git --version`, `claude --version` and `codex --version`.
Use Node 22 or newer. Locate installed commands with `Get-Command`; a PATH miss
is not proof that a harness is absent.

Run these from the checkout and save exit codes and output:

```powershell
npm ci
node scripts/check/test/run.js
node scripts/check/check.js
```

Choose a fresh directory beneath `[System.IO.Path]::GetTempPath()` for homes,
fixture source and projects. Keep all installer destinations there, using the
CLI's `--home`, `--source`, `--claude-root` and `--agents-root` overrides as needed.
Preserve normal authentication through supported per-invocation host settings.
If isolated profiles need login or hook trust, ask the human to perform those
steps. Credential copies and automatic trust writes are outside this task.
Keep real user settings, existing skill links and guard registration unchanged;
record configuration hashes before and after to verify that boundary.

**Done:** checks pass, exact host versions and model IDs are recorded, and each
host can complete a neutral authenticated request in the chosen configuration.
Stop a blocked host with its exact error and smallest required human action;
continue independent cases on the other host.

## 2. Build the link matrix

Start with `node scripts/install/evidence/cross-scope.js`. It prints `ROOT:` and
creates `duplicate`, `project-to-user` and `user-to-project` scenarios, install
logs and literal body/reference markers. This builder does not run a model.

The Linux live runner `scripts/install/evidence/live-cross-scope.py` depends on
`unshare` and mount namespaces: do not run it unchanged on Windows. Use its
prompts and evidence assertions in a native runner with supported host discovery
and configuration overrides. Add a Windows runner alongside it if needed; keep
fixture changes separate from production install policy.

Exercise each host with both installer-created directory link types:

1. Directory symlink, with the OS permission needed to create it.
2. Junction, reached through the installer's symlink-failure fallback.

Confirm actual reparse-point type with `Get-Item | Format-List FullName,LinkType,Target`
and canonical targets with Node `fs.realpathSync`. If the machine always permits
symlinks, a fixture-only Node preload may inject `EPERM` for directory symlink
creation so the real installer creates a real junction. Record injected refusal
separately from an actual OS refusal. The existing Windows-only installer cases
show this seam. If symlink creation is unavailable, leave that arm pending and
ask for Developer Mode or an appropriate Windows test session; do not silently
substitute a junction.

For each link type, run all three scenarios in fresh sessions on Claude and Codex:

- Duplicate: observe the selected caller path and marker; capture Codex's actual
  installed listing separately from which body it reads.
- Project caller → user requirement: observe both bodies and `references/token.md`.
- User caller → project requirement: observe both bodies and the reference.

Use `/scope-caller` on Claude and `$scope-caller` on Codex. Capture tool events,
paths, body markers and `RULES-REFERENCE`; a final answer repeating a marker is
insufficient. Grant only required read permissions for the fixture link and its
source target. Preserve a reference-load failure as a failure, not an inferred pass.

**Done:** twelve live observations (2 hosts × 2 link types × 3 scenarios) have
transcripts, actual link types and read paths. Explain any precedence/listing
result differing from the Linux evidence before changing policy.

## 3. Verify steering and guard lifecycle

Use `--owner-steering` only with the disposable `--home`. Verify both steering
links resolve to fixture `steering.md`, a rerun remembers the opt-in, and an
unrecorded file survives a conflict. Exercise the file-copy fallback where file
symlinks are refused, then alter only the fixture copy and verify doctor reports
drift. A fixture-injected file-link refusal is acceptable if clearly labelled.
**Done:** link/copy type, ownership outcomes and drift exit code are recorded.

For the guard, run the actual install → doctor → uninstall CLI against disposable
homes with the installed Windows host binaries. Include unrelated fixture hooks
and settings so preservation is observable. Codex pending trust must keep its
legacy fallback; only the human reviews and trusts the current plugin definition
through `/hooks`. Record pending trust distinctly from a guard denial.

Use the Linux live evidence's harmless probes in a scratch project without a
remote: core block, safe allow and additive project block. Observe actual host
hook events and the plugin cache source. For branch-switch isolation, switch a
separate disposable source clone to a branch without the guard between turns
of the same running session; verify the cached plugin still enforces all probes.
The integration checkout and unrelated user repositories stay on their branches.
**Done:** lifecycle exit codes, preserved unrelated configuration, effective
cached paths, actual hook events and same-session results are recorded per host.

## 4. Deliver evidence and update the tickets

Write one dated report under `docs/evidence/` and link it from the existing
cross-scope report. For every case include commit, OS, host version, exact model,
command, scope/link type, expected observation, actual observation, exit status
and sanitized transcript path. Omit credentials, assistant thinking and unrelated
user context. Separate verified, failed, blocked and not-run cases.

Run the repository's required checks after edits. Commit the report and any
necessary portable fixture changes; publish through the repository's normal PR
workflow. Add issue comments linking durable evidence on the tickets this run
actually advances. Close a ticket only when every acceptance item is evidenced;
leave incomplete host/platform cells explicit. This Windows task does not close
#78 or implement other specs' guides/check policies.

**Done:** another agent can locate each matrix cell's evidence through the report
and ticket pointers, and every remaining blocker names a concrete human action
or a specific cross-spec ticket.
