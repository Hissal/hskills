# Live command guard smoke tests (#120)

Executed 2026-10-30 on Linux from integration base `6c99b5a` for
[#120](https://github.com/Hissal/skill-collection/issues/120), under spec
[#78](https://github.com/Hissal/skill-collection/issues/78). Status: live Claude
and Codex smoke probes pass. The later OpenCode section completes its installed
host and temporary lifecycle validation on Linux; cross-platform acceptance
remains broader.

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

## Installed OpenCode host and lifecycle (2026-10-31)

The outstanding OpenCode part of #120 passes on Linux, **OpenCode v2.2.3**,
using exactly **opencode-go/claude-haiku-5-5**, without a variant. Integration
`e0aa7ee` was already included. The existing bundled V2 adapter works; no engine,
rule policy, adapter, installed runtime or packaging change was necessary.
[Host tool events](evidence/live-hooks-120/opencode/host.jsonl) and
[selection, snapshot digest and outcomes](evidence/live-hooks-120/opencode/summary.json)
record the accepted run.

The existing install entry point ran with Node **v22.23.4** and a real temporary
`--home`. A temporary `--source` held only an empty `collection.json`
(`core: [], packs: {}, expensive: []`), excluding skill delivery and the already
verified Claude/Codex plugin migration from this test. In this mode the existing
installer delegates to the checkout's guard installer. It copied the real guard
snapshot and installed its actual plugin at scratch
`.config/opencode/plugins/command-guard.js`; bytes matched the bundled adapter.
No substitute or recording plugin was used. The installer also exercises its
ordinary adapter doctor; those simulated verdicts are separate from host evidence.

The ordered lifecycle was:

1. `node scripts/install/install.js install --home <scratch-home> --source <fixture-source>`:
   exit 0, snapshot and plugin installed, automatic doctor passed.
2. The same entry point with `doctor`: exit 0, tool block/allow and shell permission
   probes passed. [Install](evidence/live-hooks-120/opencode/install.log) and
   [doctor](evidence/live-hooks-120/opencode/doctor.log) retain exact output.
3. In an empty scratch project, a fresh `opencode run --standalone --format json
   --model opencode-go/claude-haiku-5-5` request returned exit 0 and exactly three
   actual host `shell` tool events: `git push --force origin main` errored with
   `HUMAN-REQUIRED` / `git.force-push-default`; `printf ALLOW_120` completed with
   output `ALLOW_120` and exit 0; `printf PROJECT_BLOCK_120` errored with
   `HUMAN-REQUIRED` / `project.smoke`. Both errors identify the scratch project
   as working directory. No denied command was retried or rephrased in the session.
   The allow and project calls were batched after the first denial; event order
   and verdicts above are observed, not a claim of serial execution of that batch.
4. The same entry point with `uninstall`: exit 0; all **10** recorded installed
   guard files were absent afterward, including the host plugin and snapshot
   adapters, engine and rules. [Uninstall](evidence/live-hooks-120/opencode/uninstall.log).
   Ownership records and empty directories may remain. Real user guard files
   were never installation or removal targets.

For reproduction, create `<scratch-home>/.config/opencode` before installing.
Set only per-process `OPENCODE_TEST_HOME=<scratch-home>`,
`OPENCODE_CONFIG_DIR=<scratch-home>/.config/opencode`,
`COMMAND_GUARD_HOME=<scratch-home>/.agents/command-guard`,
`COMMAND_GUARD_STATE=<scratch-home>/.agents/command-guard/state`, and
`PWD=<scratch-project>`; also set the subprocess working directory to that project.
HOME, XDG data roots and normal authentication stay inherited. On this machine
normal config contains `service.json` and the existing guard plugin, with no
`opencode.json` or `opencode.jsonc` settings file to overlay. The scratch config
isolates plugin discovery without copying credentials or changing real settings.
Normal model/provider authentication succeeds under these overrides.

Verify `git rev-parse --git-dir` fails in the scratch project before the host run;
no repository or remote is created. Add only this project rule at scratch
`.agents/config/command-guard.json`:

```json
{"rules":[{"id":"project.smoke","family":"smoke","tier":"human-required","command":["printf"],"anyArg":"PROJECT_BLOCK_120","effect":"harmless smoke marker"}]}
```

Ask the model to invoke the three exact commands above once each, independently,
report each result, continue only to the next independent probe after a denial,
and perform no retries, rephrasing, configuration changes or other commands.
No permission bypass or auto approval flag is used.

An initial diagnostic subprocess inherited the checkout's `PWD` despite its
scratch OS working directory: the host's denial named the checkout. That run
was rejected as outside-repository evidence. Setting both cwd and `PWD` corrected
host location and allowed the additive scratch project rule to be tested.
An intermediate doctor used mismatched plugin-mode installation and ordinary
mode diagnostics and correctly reported missing scratch Claude registration;
it is not the accepted lifecycle above.

[Official V2 plugin documentation](https://opencode.ai/v2/docs/plugins/), read
2026-10-31, documents direct `.js` discovery in the global config's `plugins/`
directory. Actual tool errors naming both core and additive project rules,
together with successful shell execution for the allow case, establish effective
loading here; mere discovery or an empty setup would not satisfy the test.
The earlier [#125 activation investigation](opencode-install-125.md) concerns
registry listing; this test uses model-triggered tool execution on a fresh private
server, not an unactivated registry listing or a direct adapter subprocess.

This completes the requested installed OpenCode validation and temporary
install/doctor/uninstall evidence. It does not add macOS/Windows evidence or
extend Spec 8's rule scope. Claude/Codex actual host tests were not repeated.

Validation used Node 22 after `npm ci`: guard cases **611 passed, 0 failed**;
collection fixtures **218 passed, 0 failed**; installer CLI **38 cases, 0
failures**. No executable code changed, so no new case harness behavior or
compatibility fix needed a red/green cycle. Integration merge reported already
up to date. No agents, PR, push, trust write or merge into integration occurred.
Collection check: **317 files, 0 failures, 4 existing agnix warnings** (fixture
name and marketplace metadata). `git diff --check` passed.
