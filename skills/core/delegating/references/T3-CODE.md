# T3 Code delegation

T3 Code exposes its own orchestration tools (server key `t3-code`) to every provider session it runs. Observed on 2026-11-01 from `pingdotgg/t3code` at `fa31b66bbb2ae5234205a8628a78e038d917202f`: [`docs/orchestration-v2/orchestrator-mcp-server.md`](https://github.com/pingdotgg/t3code/blob/fa31b66bbb2ae5234205a8628a78e038d917202f/docs/orchestration-v2/orchestrator-mcp-server.md) and the orchestration instructions T3 injects into its sessions (`packages/provider-core/src/server/orchestrationInstructions.ts`). Not tried: T3 Code was not running in the build environment, so every fact here is **unverified** by dispatch.

T3's injected instructions are the host's guidance and win over this file. Re-read them, and call `orchestrator_capabilities`, rather than trusting the facts below.

## When to use it

T3's guidance as read:

- **Native subagent** when the child uses your provider, a model the native tool offers, no settings beyond yours, and finishes in this turn.
- **`delegate_task`** for another provider's model, settings the user asked for (such as effort), a separate checkout, background work, or when the user names it.
- A provider or model T3 reports unavailable: say so. T3's guidance forbids switching unasked or falling back to native tools, workflows or CLIs, so inside T3 that choice is unavailable.
- A child does its own work and starts no agent unless its task says to.
- `t3_thread_launch` and `create_threads` make top-level threads, only when the user asks for a new thread. "Subagent", "delegate" and "parallel" never mean one.

## Capabilities

Call `orchestrator_capabilities` once per thread, before the first `delegate_task`, and again only after an error or a provider change the user names. It returns the inherited provider and model, the parent's runtime and interaction modes, each registered provider instance with its advertised models and options, whether each can run a child task, and why an unavailable one cannot. The model list is short on purpose: use its `search` input for a model it omits. Providers differ per user (one has OpenCode, another Antigravity): never assume a provider is present.

## `delegate_task`

- `task`: the full brief. The child receives only this and an optional `role` (`implementation`, `research`, `review`, `design`, `test`, `general`); no parent history.
- `target`: `providerInstanceId`, `driverKind`, `model`, and `options` from the capability listing (effort goes here, for example `{effort: 'high'}`). Omitted fields inherit from the parent. A different provider with no model takes that provider's first advertised model, so always name the model.
- `isolation`: `shared` (default, the parent checkout) or `worktree` (a new checkout from the parent commit; uncommitted edits stay out, so give the dirty-tree warning).
- `runtimeMode`: `inherit`, `approval-required`, `auto-accept-edits`, `full-access`. A child never runs broader than its parent. A mode the target provider does not offer is refused when explicit, and an inherited one steps down to the broadest it offers.
- `interactionMode`: `inherit`, `plan`, `default`; it may narrow to `plan`, never widen.
- `mode`: `async` returns at once; `wait` returns the result or times out without cancelling. A pending question from the child ends the wait.
- `clientRequestId`: stable across retries of one request; distinct for each review round.

## Review rounds and follow-ups

Each fresh review or re-check is a new `delegate_task` carrying the brief, prior findings, responses and open objections. `t3_thread_send` to a `childThreadId` continues that child's conversation and is for follow-ups that need it, not fresh rounds.

## Waiting and stopping

Follow a running delegate's `next` instead of polling it. Stop a delegate you no longer need with `task_cancel`, which also stops what that child started.
