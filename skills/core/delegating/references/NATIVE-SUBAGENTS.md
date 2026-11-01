# Native subagents

The subagent tool each harness ships. Observed on 2026-11-01; each section names what was read and whether a dispatch was tried. Before relying on a fact, check the harness's current documentation and its live tool list: hosts change faster than this file.

## Claude Code

Read: [sub-agents](https://code.claude.com/docs/en/sub-agents) and [model configuration](https://code.claude.com/docs/en/model-config), 2026-11-01. Tried: one dispatch through the `Agent` tool on Claude Code 2.1.316 (parent `claude-sonnet-5-5` at effort low, child requested as `haiku`, ran as `claude-haiku-5-5`).

- **Tool**: `Agent` (`Task` is an older alias). A non-fork subagent starts in a fresh context with only the prompt you pass; a fork inherits the whole conversation. Use a non-fork subagent for a brief.
- **Model**: the call's `model` takes an alias only (`haiku`, `sonnet`, `opus`, `fable`). A full model ID needs a subagent definition (`model:` in `.claude/agents/<name>.md` or `~/.claude/agents/<name>.md`, or `--agents` JSON). `inherit` uses the session's model. `CLAUDE_CODE_SUBAGENT_MODEL` and its `_FORCE` variant can override what you ask for: report the model that actually ran.
- **Models reachable**: Claude models only.
- **Effort**: set in a definition's `effort` field; the docs read list no per-call effort. `CLAUDE_CODE_EFFORT_LEVEL` overrides it. Levels per model: [effort mappings](EFFORT.md).
- **Isolation**: `isolation: worktree` (definition field, or on the call) runs the agent in a temporary git worktree branched from the default branch.
- **Permissions**: a definition's `permissionMode` (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`); plugin subagents ignore it. Limit tools with `tools` or `disallowedTools`.
- **Limits**: 20 running subagents by default (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`); nesting up to three layers below the main conversation (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Subagents start in the background by default from the main conversation.

## Codex

Read: source of `openai/codex` at `cb1bc0ae4ed996c67a6e118bf79a7435f0d3f0d2` (2026-11-01): the multi-agent tool spec and the config schema. The hosted docs were not reachable from the build environment. Not tried: **unverified**.

- **Tool**: `spawn_agent` with `message`, optional `agent_type`, `fork_context` (leave false for a fresh context), and `model` and `reasoning_effort` overrides where the session exposes them. Spawned agents inherit the parent's model by default. Follow up with `send_input` or `followup_task`; collect with `wait`.
- **Models reachable**: the session's provider catalog. Effort values are whatever the model advertises.
- **Roles**: `[agents.<role>]` in `config.toml`, with a `description` and an optional `config_file` layer.
- **Defaults and limits**: `agents.default_subagent_model`, `agents.default_subagent_reasoning_effort`, `agents.max_concurrent_threads_per_session` (unset: the backend's default), `agents.max_depth` (V1 only).
- **Sandbox**: from the session and role config (`read-only`, `workspace-write`, `danger-full-access`); not a per-call field.

## OpenCode

Read: docs source of `anomalyco/opencode` at `8bca5329293a34f4bdd7fdc4f4020be80c1eb477` (`agents.mdx`, `models.mdx`, 2026-11-01). Not tried: **unverified**.

- **Tool**: the Task tool starts any agent with `mode: subagent` or `all` (built-in `general` and `explore`). Each runs as a child session.
- **Models reachable**: every provider configured in OpenCode, as `provider/model-id`, so one OpenCode session can reach several model families. A subagent without a `model` uses the invoking agent's model. `opencode models` lists what is configured.
- **Effort**: per agent through a `variant` or a provider option such as `reasoningEffort`; see [effort mappings](EFFORT.md).
- **Permissions**: `permission` per agent; `permission.task` limits which subagents an agent may start.
- **Limits**: no concurrency limit found in the docs read.

## Other harnesses

No facts were checked for any other harness. Treat its subagent tool as unverified: read its current documentation and live tool list, and apply the same selection, brief and return rules.
