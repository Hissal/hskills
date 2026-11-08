# How a delegated child waits on background work (#314)

Read and run on 2026-11-08 on Linux for [#314](https://github.com/Hissal/skill-collection/issues/314), which asks for a rule in `delegating`'s brief contract on how a child waits on its own background work and when it ends its turn. Status: answered for all three harnesses; the rule adopted from it is verified on T3 by run D. T3 and Claude Code answers rest on observed runs as well as source; the Codex answers rest on source reading only.

The problem, from the ticket: children that start long work (an eval batch, an Editor run, the collection check) end their turn to wait, and every turn end that reaches the parent wakes it with its whole context. In the spec #85 build, 76 of the orchestrator's 110 turns did almost nothing but say "still waiting".

Versions: T3 Code server **0.1.7** (`~/.t3/runtime/versions/0.1.7/t3`, the process running `t3 serve`), Claude Code **2.1.319**, Codex CLI **0.167.0** (tag `rust-v0.167.0`, commit [`086ccc8`](https://github.com/openai/codex/tree/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a)).

## Contents

- [Answers](#answers)
- [T3 `delegate_task`](#t3-delegate_task)
- [Claude Code native `Agent`](#claude-code-native-agent)
- [Codex `spawn_agent`](#codex-spawn_agent)
- [What the rule follows from](#what-the-rule-follows-from)
- [Not tested](#not-tested)

## Answers

| Harness | Does every child turn end reach the parent? | How a child waits inside its turn, and the limits |
| --- | --- | --- |
| T3 `delegate_task`, Claude child | Yes. Each finished run is delivered. `t3_background_wait` holds a run's delivery while the marked job runs, but releases it when the job exits, so the held interim still arrives, just before the final report. Observed: held and unheld runs each gave two notifications; a run that waited inside its turn gave one. | Keep the turn open, as for Claude Code below. `t3_background_wait` takes up to 20 task IDs and sets no time limit, but it does not save the interim wake-up. |
| T3 `delegate_task`, Codex child | Yes, by the same delivery code. `t3_background_wait` is Claude-only, so nothing holds a Codex run. | Inside the turn only, as for Codex below. |
| Claude Code `Agent`, background | Yes. The parent is notified at the interim turn end and again when the child resumes and stops. Observed. | No hold exists. Wait in the foreground: one Bash call runs at most 10 minutes, and a condition loop (`until <done>; do sleep 5; done`) is allowed within that limit; chain such calls for longer jobs. |
| Claude Code `Agent`, foreground | The first turn end *is* the result: the call returns with the interim text, and the child's background command is killed. Observed. | As for background: foreground calls of at most 10 minutes each. |
| Codex `spawn_agent` | Only the first: the parent gets one completion notification at the child's first final status, and that notification starts no parent turn. Nothing resumes the child when a background process exits. Source. | Inside the turn only: poll the running process with `write_stdin` (each empty poll waits up to 5 minutes by default) or run it with a long command timeout. |

## T3 `delegate_task`

**Source.** The T3 server binary embeds its JavaScript. In 0.1.7:

- `delegatedTaskProgress` returns `result_available` when the child's latest run is terminal and no work holds completion, and `waiting_for_children` when work does. A child's provider thread holds completion while `backgroundWorkHoldsCompletion` is true for its `pendingBackgroundTasks`.
- `backgroundWorkHoldsCompletion` is true for any task marked `awaited`, and for task kinds `subagent` and `background_task`. Kinds `command` and `monitor` hold only when awaited.
- `finalizeAppOwnedSubagentTask` writes one `subagent_result` context transfer per child run (it skips a run that already has one). So each run the child finishes while nothing holds it reaches the parent as its own result and wake-up.
- `t3_background_wait` calls `ThreadManagementService.awaitBackgroundTasks`, which adds the IDs to `awaitedBackgroundTasksByNativeThread`. Its schema takes 1 to 20 `taskIds` and an optional `waiting` (`false` clears the mark); the service call itself times out at 15 seconds, and no limit on the wait's length appears. Only `ClaudeAdapterV2` implements `awaitBackgroundTasks`; other adapters return `unsupported`, matching the tool description's "Claude only".

**Runs.** Four Claude Haiku 5.5 children on T3 0.1.7; briefs and timelines in the [run record on #314](https://github.com/Hissal/skill-collection/issues/314#issuecomment-6715463885):

- **Run A (held).** The child started `sleep 660` (11 minutes) as a background Bash command, called `t3_background_wait` with its task ID (`matched`), and ended its turn with "waiting" at 00:46:25. The parent heard nothing during the wait. At 00:57:20 the job exited and the parent got two notifications: first run 1's "waiting" as a completed result, then the final report from run 2 (started 00:57:21, completed 00:57:26). Inference from the source above: clearing the hold re-runs `finalizeAppOwnedSubagent` before run 2 exists, so `delegatedTaskProgress` reports run 1 as `result_available`.
- **Run B (control, not held).** The child started `sleep 90` in the background and ended its turn with an interim line. The parent got two notifications: the interim line as a completed result at once, then the final report from a second, continuation run started when the command exited.
- **Run C (first draft of the rule).** Told to keep its turn open with foreground calls, the child armed a Monitor and ended its turn anyway. Three notifications: the interim line, the final report when the job exited, and another when the Monitor fired. The adopted line therefore names Monitor and `t3_background_wait` as not waiting.
- **Run D (adopted rule).** The child got the adopted `Waiting:` line verbatim and the same 11-minute job (00:59:44 to 01:10:44). It waited with two foreground loops and sent one notification, its final report; the child thread shows one run, 00:59:33 to 01:11:00.

## Claude Code native `Agent`

**Source.** The session's live tool schemas in 2.1.319: a foreground Bash call takes `timeout` up to 600000 ms; a background Bash call (`run_in_background`) "re-invokes you when it exits" and runs for up to 7200000 ms (2 hours, default 30 minutes); a `Monitor` expires after at most 30 minutes and notifies once per output line. A foreground `sleep 50` followed by more commands was refused with "To wait for a condition, use Monitor with an until-loop … or run_in_background"; a foreground `until` loop on a condition ran.

**Runs.** Two Haiku probes from this session, each told to start `sleep 45` as a background Bash command and end its turn at once with an interim line:

- **Foreground** (`run_in_background: false`): the `Agent` call returned in 4 seconds with the interim line as the subagent's final report. The child's background command output ends `[killed]`; the child never resumed.
- **Background**: the parent was notified at 00:46:44 with the interim line, under the note "This agent stopped with background work of its own still running … the same task-id notifies again". The command exited at 00:47:28; the child resumed at 00:48:05 and the parent was notified a second time with the final line.

So on Claude Code the parent sees every turn end, and in foreground mode an early turn end loses the work.

## Codex `spawn_agent`

Source reading only at [`086ccc8`](https://github.com/openai/codex/tree/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a); no Codex run, to spare the quota the ticket warns about.

- **Completion notification.** [`maybe_start_completion_watcher`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/agent/control.rs#L440-L570) subscribes to the child's status, stops at the first status that [`is_final`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/agent/status.rs#L26-L31) (anything but `PendingInit`, `Running` or `Interrupted`, so a finished turn counts), and sends the parent one notification: `inject_fragment_without_turn` for multi-agent v1, and an inter-agent message with `trigger_turn: false` for v2. The parent is never woken by it; it reads it on its next turn or through `wait_agent`. The watcher has exited, so later child turns send nothing.
- **Parent's wait.** `wait_agent` clamps `timeout_ms` to 10 seconds minimum and 1 hour maximum, default 30 seconds ([`multi_agents_common.rs`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/tools/handlers/multi_agents_common.rs#L22-L24), [`config/mod.rs`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/config/mod.rs#L262-L269)).
- **Child's wait.** Unified exec yields a running command back to the model after at most 30 seconds (`MAX_YIELD_TIME_MS`), and an empty `write_stdin` poll waits up to `background_terminal_max_timeout`, default 300000 ms ([`unified_exec/mod.rs`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/unified_exec/mod.rs#L66-L75), [`config/mod.rs`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/config/mod.rs#L1142-L1144)). The exit watcher in [`async_watcher.rs`](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/core/src/unified_exec/async_watcher.rs#L155-L243) only emits an exec-end event; it starts no turn. Inference: a Codex child that ends its turn while a process runs has returned, and the process's result never reaches it.

## What the rule follows from

Inference, from the answers above:

- No harness lets a child end its turn without the parent hearing of it: T3's hold only moves the wake-up to the job's end. Waiting inside the turn is the only way to give the parent one return.
- Waiting inside the turn works on every harness: chained foreground calls within the shell tool's limit on Claude Code (and so on T3), `write_stdin` polls on Codex.
- When a child still ends its turn early, what the parent should do depends on whether the child comes back. It does on T3 while the child has a run queued or running, and with a background Claude Code `Agent` whose notice says background work is still running: the parent ends its turn without acting. It does not with a foreground `Agent`, on Codex, or for a T3 Codex child: that return is a failed dispatch, and the parent continues the child or dispatches again.

Adopted in [#314](https://github.com/Hissal/skill-collection/issues/314) by the change that adds this note; the wording is in `delegating`'s [brief contract](../skills/core/delegating/SKILL.md#5-write-the-brief).

## Not tested

- No Codex run; the Codex answers are source reading at one commit.
- A Codex child under T3 was not run; the answer follows from the shared delivery code and the Claude-only adapter method.
- T3 server restarts during a held wait (the source has a restart note path, `restartCancelledBackgroundWorkNote`) and jobs over 2 hours.
- Windows and macOS.
