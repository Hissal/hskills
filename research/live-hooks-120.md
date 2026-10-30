# Live command guard smoke tests (#120)

Executed 2026-10-30 on Linux from integration base `6c99b5a` for
[#120](https://github.com/Hissal/skill-collection/issues/120), under spec
[#78](https://github.com/Hissal/skill-collection/issues/78). Status: live Claude
and Codex smoke probes pass; the complete ticket acceptance remains broader.

## Method and evidence

The earlier [plugin investigation](guard-plugin-install.md) used a blank home
and found no login there. That did not test the existing account. Live validation
was left unfinished because the investigation stopped at that isolation boundary;
there was no evidence establishing that existing authentication was unavailable.
This run used the existing home and authentication directly. Claude `auth status`
reported `loggedIn: true`, `authMethod: claude.ai`; Codex `login status` reported
`Logged in using ChatGPT`. Credentials were neither read nor copied.

Reproduce with `python3 scripts/install/evidence/live-hooks.py`. This is an
explicit manual, authenticated model test, excluded from automated checks.
It prints a temporary artifact directory. It creates no repository or remote in
the probe directory and verifies that Git cannot discover a repository above it.
The installer uses the same harmless force-push string for its adapter doctor.
An absent guard therefore yields a local Git error without contacting a remote.
The fixture supplies one additive project rule for `printf PROJECT_BLOCK_120`.

Claude Code `/home/agent/.local/bin/claude`, version **2.1.314**, resolved
`--model opus --effort medium` to **claude-opus-5-5** in the actual assistant
messages. The run used `--settings` with a temporary recording wrapper around
the checkout adapter, `--setting-sources ''`, Bash-only tools, exact Bash allow
permissions, no MCP servers and no session persistence. It used normal permission
checks, with no bypass. The wrapper recorded payloads and forwarded adapter output
unchanged. This is actual host invocation, not a direct adapter subprocess test:
the host emitted hook lifecycle events and returned hook rejection to its model.

Codex `/home/agent/.npm-global/bin/codex`, version **0.166.0**, used existing
user hook registration and its existing trust, with per-invocation read-only
sandbox and approval policy `never` (requests needing approval are denied).
No trust barrier occurred. Its text header reported **gpt-6.1-sol**, reasoning
**none**, provider **openai**. No delegate was launched; model and effort used the
host defaults. All installed adapter, engine and rule bytes matched the checkout.
The JSON run omitted denied tool events, so a second independent text-mode run
collected router errors and hook events as direct evidence.

## Observed results

- Claude: `PreToolUse:Bash` ran three times, each adapter exit 0. The core probe
  returned `deny` naming `git.force-push-default`; the host marked it rejected
  with source `hook`. `printf ALLOW_120` produced silent hook output and executed,
  returning `ALLOW_120`. The project probe returned `deny` naming `project.smoke`,
  with another hook-sourced host rejection.
- Codex: `hook: PreToolUse` followed by `hook: PreToolUse Blocked` for both core
  and project probes. The router reported `Command blocked by PreToolUse hook:
  Command guard: HUMAN-REQUIRED` and named the respective rule. The allow probe
  reported `hook: PreToolUse Completed` and executed with exit 0 and `ALLOW_120`.
- Explicit absent registration, Claude: a separate invocation omitted the
  temporary hook settings while keeping setting sources empty. No hook events
  occurred. Git returned exit 128, `fatal: not a git repository (or any parent up
  to mount point /)`. Both printf commands executed. This demonstrates absence,
  separately from a running guard's denial, without editing user settings.

Committed host evidence: [Claude active](evidence/live-hooks-120/claude-active.jsonl),
[Claude absent](evidence/live-hooks-120/claude-missing-overlay.jsonl), and
[Codex text trace](evidence/live-hooks-120/codex-text.txt). Claude evidence retains
hook events and tool results while omitting assistant thinking and unrelated
initialization metadata. The Codex warning about missing PATH bubblewrap says it
used bundled bubblewrap; it did not prevent these probes.

## Boundaries

These results establish effective adapter registration and actual covered tool
invocations on these installed Linux versions. They do not establish plugin
loading, branch-switch isolation, macOS/Windows behavior, crash/timeout behavior,
or human-run uninstall. No real push, destructive command, settings edit, trust
write, login or approval bypass was performed by the fixture. The CLI may write
its own ordinary runtime metadata. No human authentication/trust action was
needed for these probes. #121 plugin migration remains unverified; #120's full
install/doctor/uninstall acceptance is not claimed by these smoke results.

## Later live plugin acceptance

The [live plugin and lifecycle report](live-plugins-121.md) extends this evidence:
Claude loads the installed snapshot and fires hooks across a disposable source
branch switch; Codex host discovery identifies its cached plugin hook as
untrusted. The real temporary-home CLI lifecycle removes all newly owned files.
See that report for exact commands, evidence and remaining human acceptance.
