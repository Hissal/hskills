# Effort mappings

How the collection's effort intent (low, medium, high, xhigh, max) reaches each harness's own control. Observed on 2026-11-01 from the sources named in [native subagents](NATIVE-SUBAGENTS.md), [T3 Code delegation](T3-CODE.md) and [CLI transports](CLI-TRANSPORTS.md). Read the model's live list of levels before choosing: levels vary by model and change between releases. No harness or provider here is assumed present: each user's set differs.

A matching name is not matching effort or cost: `high` on one harness is not `high` on another. When the intent has no exact control:

- **Automatic default**: take the nearest documented level, or the model's fixed behaviour, and report the approximation in the dispatch summary.
- **Explicit effort**: no supported equivalent makes that choice unavailable.
- **Never upward to max**: an approximation never lands on max unless max was asked for.

## Claude Code

Levels `low`, `medium`, `high`, `xhigh`, `max`, per model (read at [model configuration](https://code.claude.com/docs/en/model-config)): the 5.x models and Opus 4.7 and 4.8 take all five; Opus 4.6 and Sonnet 4.6 have no `xhigh`; models outside the docs' table take no effort. Defaults: `medium` on Opus, Sonnet and Haiku 5.5, `high` on most others.

- Set it with `--effort`, a subagent definition's `effort`, or `CLAUDE_CODE_EFFORT_LEVEL`, which overrides the others.
- Claude Code silently runs an unsupported level as the highest supported level below it (`xhigh` runs as `high` on Opus 4.6). Check the model's levels first: an explicit level it lacks is unavailable, not stepped down.

## Codex

Effort is `model_reasoning_effort` (or `reasoning_effort` on `spawn_agent`), a non-empty string the model advertises in its catalog; the source read fixes no list of values. Map intent to the same-named advertised value; an intent the model does not advertise follows the rules above. Tried on 2026-11-02 (Codex CLI 0.166.0): `gpt-6.1-sol` ran at `low` and `medium` through both, and an unadvertised value failed the request, which listed `none`, `minimal`, `low`, `medium`, `high`, `xhigh` and `max`.

## OpenCode

Effort is a model variant (`#<variant>` after the model, in `opencode run -m` or the subagent tool's `model`, or a variant in config) or a provider option such as `reasoningEffort`. Built-in variants per the docs: Anthropic `high` (default) and `max`; OpenAI roughly `none`, `minimal`, `low`, `medium`, `high`, `xhigh`; Google `low` and `high`. Other providers have their own; a custom variant can add a level. Through OpenCode an Anthropic model has no built-in low or medium: an automatic default approximates with `high` and reports it; an explicit low or medium needs a custom variant or is unavailable. A gateway provider lists its own variants: OpenCode Go's `claude-haiku-5-5` listed `none` to `max`. Tried on 2026-11-02 (OpenCode 2.2.5): `opencode-go/gpt-6-luna` ran at variants `low` and `medium`.

## T3 Code

Effort goes in `delegate_task`'s `target.options`, using the option names and values `orchestrator_capabilities` lists for that provider and model. Those values come from the underlying provider, so the provider's own row above still says what they mean. Tried on 2026-11-02: `reasoningEffort: 'low'` on Codex's `gpt-6.1-sol` reached the child.
