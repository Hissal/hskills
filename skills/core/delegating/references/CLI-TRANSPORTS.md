# CLI transports

A harness's headless command, used only when no host delegation reaches an allowed choice. Observed on 2026-11-01; each section names what was read and whether a run was tried. Check the command's current `--help` before the first run in a session: flags change between versions. No CLI here is assumed installed: each user's set differs.

## Rules for every CLI run

- Write the brief to a file outside the checkout (the OS temp directory) and pass it whole: the CLI agent sees nothing else.
- Capture the final output to a file and keep the exit code. A non-zero exit, an empty output or output outside the return shape is a failed dispatch, not a result.
- Run it where the brief says: the right checkout or worktree, and no wider than the brief's Authority. Each CLI has its own permission and sandbox controls; never map one to another by its label.
- A quota or rate-limit failure makes that choice unavailable for now: report it and move on, never retry in a loop.
- The parent checks the real tree afterwards, as for any agent.

## Claude Code: `claude -p`

Read: [CLI reference](https://code.claude.com/docs/en/cli-reference), 2026-11-01. Tried: Claude Code 2.1.316, `claude -p "<prompt>" --model haiku --effort low --output-format json --no-session-persistence`, ran as `claude-haiku-5-5`.

- `--model <alias or full ID>`, `--effort <low|medium|high|xhigh|max>` (levels depend on the model).
- `--output-format json` gives the result and `modelUsage`, which names the model that actually ran.
- `--permission-mode <default|acceptEdits|plan|auto|dontAsk|bypassPermissions>`; `--allowedTools` and `--tools` narrow tools. `--allowedTools` takes several values, so put the prompt before it or write `--allowedTools=<list>`.
- `--worktree <name>` starts in a new git worktree; `--max-turns` and `--max-budget-usd` bound a run.
- `--append-system-prompt-file <file>` adds standing instructions from a file.

## Codex: `codex exec`

Read: source of `openai/codex` at `cb1bc0ae4ed996c67a6e118bf79a7435f0d3f0d2` (`codex-rs/exec/src/cli.rs`, `codex-rs/utils/cli/src/shared_options.rs`), 2026-11-01. Tried on 2026-11-02 with Codex CLI 0.166.0: `codex exec -m gpt-6.1-sol -c model_reasoning_effort="low" -s read-only -C <dir> --ephemeral -o <file> - < <brief file>` ran `gpt-6.1-sol` at effort `low`.

- Prompt as an argument, or `-` to read it from stdin. With the prompt as an argument, close stdin (`< /dev/null`): an open stdin is read as additional input, and the run waits on it.
- `-m <model>`; effort through `-c model_reasoning_effort="<level>"` (a value the model advertises). A value the model lacks fails the run with the supported list; it is not stepped down.
- Without `--json`, the run's header names the model, provider, sandbox and effort that ran; the JSONL events do not.
- `-s read-only | workspace-write | danger-full-access` sets the sandbox.
- `-o <file>` writes the agent's last message to a file; `--json` prints events as JSONL.
- `-C <dir>` sets the working root; `--worktree` runs in a new managed git worktree; `--ephemeral` keeps no session files.

## OpenCode: `opencode run`

Read: docs source of `anomalyco/opencode` at `8bca5329293a34f4bdd7fdc4f4020be80c1eb477` (`cli.mdx`), 2026-11-01, and `opencode run --help` of 2.2.5, 2026-11-02. Tried on 2026-11-02 with OpenCode 2.2.5: `opencode run --format json -m 'opencode-go/gpt-6-luna#low' "<brief>"` from the target directory; the session recorded `gpt-6-luna`, variant `low`.

- `-m <provider/model>`, or `-m <provider/model#variant>` for the provider's reasoning effort; `--agent <name>`. 2.2.5 has no `--variant` or `--dir` flag: run it from the target directory.
- `--format json` prints raw JSON events (`step_start`, `tool_use`, `text`, `step_finish`); they do not name the model.
- `--auto` auto-approves permissions that are not explicitly denied: use it only when the brief's Authority covers every such action.
- `opencode models` lists the configured models.
- Give every run a time limit: one run on 2026-11-02 hung for 500 s with no output and no session, and the same command then finished in 29 s. The cause was not found.

## Other CLIs

No facts were checked for any other harness's CLI. Treat it as unverified: read its current documentation and `--help`, and use it only under the rules above.
