# Command guard

A first working version of the core command guard, built ahead of the blueprint so it can run now. It follows the decisions in [Theme: core guard rule set](https://github.com/Hissal/skill-collection/issues/43) and [How does the guard enforce human-only approval in full access?](https://github.com/Hissal/skill-collection/issues/56). The build that follows the finished map may replace it.

It is local accident prevention. It is not a security boundary: an agent with full access can change files or pick an execution path no hook sees.

## What it does

A `PreToolUse` hook classifies each shell command before it runs:

- **Allow**: no rule applies. The hook prints nothing.
- **Reflection pause**: `git reset --hard`, bulk `git restore` / `git checkout`, forced checkout, destructive `git clean`. The first call is denied with a request to state purpose, targets, losses and recovery. One identical retry from the same directory in the same session, within 15 minutes, goes through.
- **Human-required**: denied every time. The agent hands the human the exact command and its effects; the human runs it themselves. The ten families are listed in the rule-set decision; `rules/core.json` holds the command forms.

One exception to the protected locations, decided by the owner after the rule-set ticket closed: a repository root inside the OS temp directory is a throwaway clone and may be deleted. Its `.git` directory on its own, the temp directory itself, and a link in temp that leads to a repository elsewhere stay protected.

A guard that cannot produce a verdict denies the call.

## Layout

- `engine/`: one Node engine with no dependencies. `lex.js` holds lexers for bash, PowerShell and cmd.exe, `paths.js` resolves targets and decides what is protected, `index.js` matches rules and holds the checks rules name.
- `rules/core.json`: the core rule set as data.
- `adapters/`: one thin file per harness over a shared hook body.
- `test/`: `node hooks/command-guard/test/run.js`. Block/allow pairs per family and shell, real-filesystem cases in a scratch directory, and adapter payload tests. No dangerous command is executed; strings are only classified.

## Install

Use the collection entry point. Its [per-harness table, doctor states and
ownership/recovery contract](../../docs/user-install.md#command-guard-and-recovery)
cover this delegated installer. Live host hand runs for #120 remain missing.

```
node scripts/install/install.js install
```

This copies a snapshot to `~/.agents/command-guard`, fires each adapter once, and registers the hooks only when that check passes:

- **Claude Code**: hooks-only plugin registered from a content-addressed snapshot.
- **Codex**: the same snapshot through its plugin API. Review new or changed hooks in `/hooks`; installation grants no trust.
- **OpenCode**: `~/.config/opencode/plugins/command-guard.js`, a v2 plugin that rejects the call in `tool.execute.before` and, for human-required commands, also denies the `shell` permission in `permission.evaluate`. A running OpenCode server picks it up on restart.

The installed guard is a copy, so switching branches here cannot break running sessions. Rerun the installer after changing the guard. The first write to each settings file leaves a `.before-command-guard` copy beside it.

## When the guard breaks or blocks something you want

The agent reports the error or the blocked command. It does not disable the guard, loosen rules or route around it.

To recover, stop the agent session, then either repair the guard and rerun the installer, or remove it:

```
node scripts/install/install.js uninstall
```

Restart the session afterwards. After an uninstall, sessions have no guard protection. Removing the guard is not approval for any single command.

## Project rules

A project may add rules in `.agents/config/command-guard.json`, shaped like `rules/core.json`'s `rules` array. They can only add blocks. A malformed file stops covered calls in that project until it is fixed.

## Limits

- **Covered**: Claude Code's `Bash`, `PowerShell` and `Monitor` tools; Codex shell calls; OpenCode's `shell` tool and any other OpenCode tool whose input carries a `command`. Commands are read as text: literal and decodable nested commands (`bash -c`, `cmd /c`, `powershell -Command`, `-EncodedCommand`, `wsl`, `eval`, `Invoke-Expression`) are inspected.
- **Not covered**: edit tools (freeze is not built yet), MCP tools that run commands, scripts and interpreters that delete from inside (`python -c`, a `.ps1` or `.sh` file's contents), .NET calls such as `[IO.Directory]::Delete`, commands sent over `ssh`, and input fed to an already running process.
- **Codex**: a hook that fails to start or times out does not stop the call, and `ask` is unsupported, so this adapter only ever denies or stays silent.
- **OpenCode**: written against the v2 plugin API and checked on 2.0.27; the published plugin docs describe an older API this plugin does not use. OpenCode skips a plugin file it cannot load, so the guard is then absent without notice; the file is kept minimal for that reason, and a guard engine that fails to load denies every shell call. OpenCode's default configuration allows shell calls with no prompt, so there the guard is the only check.
- Earlier runtime evidence covered Windows tests and installed Claude Code/OpenCode probes. Linux temporary-home installer and direct adapter checks are now recorded in [plugin evidence](../../research/guard-plugin-install.md). These checks establish neither effective host hook loading nor live Codex trust; macOS validation remains missing. Installed executables are `/home/agent/.local/bin/claude`, `/home/agent/.npm-global/bin/codex` and `/home/agent/.opencode/bin/opencode`; PATH misses do not establish absence. #120, #121 and #125 retain their documented acceptance limits.

## Plugin delivery

The hooks-only guard is listed in this repository's marketplace. For snapshot
preparation, use [the install command](../../docs/user-install.md#prepare-the-guard-plugin).
When implementing registration, migration, or live acceptance, read
[guard plugin evidence and completion criteria](../../research/guard-plugin-install.md).
Normal installs register against the prepared snapshot, then remove only recorded legacy handlers for each successfully registered host. Registration and direct probes leave live host invocation pending validation.
