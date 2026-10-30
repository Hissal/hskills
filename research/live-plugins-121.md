# Live plugin acceptance (#121) and installed lifecycle (#120)

Executed 2026-10-30 on Linux, base `a37ed41` plus prerequisite
`eae39682f4d87032949736030642731ccf259e3f`, under [#78](https://github.com/Hissal/skill-collection/issues/78).
Status: Claude plugin behavior verified; Codex plugin discovered but untrusted.
Both tickets remain open for the remaining platform and human acceptance.
This extends [adapter smoke evidence](live-hooks-120.md) and the
[registration investigation](guard-plugin-install.md).

## Reproduction

Run `python3 scripts/install/evidence/live-plugins.py` from the checkout.
This manual authenticated test prints an artifact directory, uses the installed
Claude and Codex binaries, and preserves normal authentication. It reads no
credentials and writes no user settings or trust approvals. It hashes the user's
guard configuration before and after. Installation and registration target a
temporary home; source branch changes affect only a disposable local clone.
The fixture's project is outside Git, with no remote, so the force-push probe
cannot push. Model calls cost normal account usage. The fixture retains logs.

The helper `plugin-hooks-list.py ARTIFACT_DIR` uses the real Codex app-server
`initialize` and `hooks/list` read APIs with the temporary registration. It
reports actual plugin hook origins and trust without needing a model login.
`plugin-session.py ARTIFACT_DIR` runs two Claude turns in one process, switching
the disposable source to a branch without the guard between turns.

## Observations

Claude Code 2.1.314, requested opus/medium, ran the plugin via `--plugin-dir`
pointing at the installer's versioned content-addressed snapshot. Setting sources
were empty; there was no user-hook overlay. Real `PreToolUse:Bash` events denied
`git push --force origin main` with `git.force-push-default`, silently allowed
`printf ALLOW_120`, and denied `printf PROJECT_BLOCK_120` with `project.smoke`.
Separate launches before and after removing the guard on the disposable source
branch gave the same results. A two-turn stream-input session additionally
retained the same session ID: a silent allow fired before the switch, and
the core block, silent allow and project block fired after the switch.
The branch switch was performed by the fixture between host results, not by the
model. [Host events](evidence/live-plugins-121/same-session.jsonl) retain hook
responses and tool results; thinking is omitted.

Codex 0.166.0 normal-auth `exec --ignore-user-config` with invocation-only
marketplace and enabled-plugin settings did execute all three probes, but did
**not** fire the temporary plugin. This attempt is a failed loading overlay,
not a guard pass and not sufficient evidence of trust refusal. Its exact argv
and [trace](evidence/live-plugins-121/codex-plugin.stderr) are retained.
The temporary home's actual installed registration was then inspected through
`hooks/list`. That returned `source: plugin`, plugin ID
`command-guard@skill-collection-guard`, enabled true, and `trustStatus: untrusted`.
The effective command and source path are inside the host's versioned cache at
`.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/`, rather than
in the source checkout. [Exact host response](evidence/live-plugins-121/codex-hooks-list.jsonl).
This establishes the installed plugin's pending trust barrier independently of
the failed overlay and without assuming blank-home authentication is required.
[Official hook documentation](https://learn.chatgpt.com/docs/hooks), read
2026-10-30, confirms plugin installation does not grant hook trust.

Minimum human action for that installation: launch
`CODEX_HOME=/tmp/plugin-live-121-1pzs54rm/home/.codex /home/agent/.npm-global/bin/codex`
and review the current command-guard hook in `/hooks`. That retained temporary
installation has no copied credentials; if the host requires authentication,
use its normal login flow. No trust-bypass flag or persisted approval was used.
Codex block/allow/project and running-session branch acceptance remain pending
this review and an authenticated session that loads that installation.

## Installed lifecycle

The fixture used the real collection CLI `install`, `doctor`, and `uninstall`
with temporary `--home` and `--source`, selecting real host binaries through
`COMMAND_GUARD_CLAUDE` and `COMMAND_GUARD_CODEX`. Both hosts registered successfully.
Install and doctor exited 1 with registered paths and explicit pending host
validation/Codex trust, rather than claiming runtime verification. Uninstall
exited 0; none of the newly recorded plugin files remained. This is actual CLI
registration and filesystem lifecycle evidence; it does not claim uninstall
stops an already running session. User guard settings were outside all targets.
[Lifecycle outputs and exact argv](evidence/live-plugins-121/install-argv.json)
are beside the host evidence. The prerequisite's automated real-filesystem cases
cover preservation of unrelated hooks and migration ownership.

Linux evidence establishes no macOS or Windows result. No agents, PR, push,
root-checkout branch switch, credential copy, trust write, or persistent user
settings modification was part of these tests.

## Verification

`npm ci` completed. The collection check passed (611 guard cases and 36 install
cases); the check fixture suite passed 218 cases. Existing agnix warnings concern
marketplace policy compatibility and the guide-eval fixture. No production code
defect was found or changed at the approved CLI seam. Recorded live acceptance
assertions verify rule IDs, silent hook output, one session ID across the switch,
and the four expected hook invocations. The final repeated collection check runs
after adding the evidence. Integration tip `0037acb` was merged before reporting.
