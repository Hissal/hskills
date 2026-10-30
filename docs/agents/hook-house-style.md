# Hook house style

Use this when maintaining collection hooks. The [maintenance decision (#17)](https://github.com/Hissal/skill-collection/issues/17) sets the general style; the later [guard approval resolution (#56)](https://github.com/Hissal/skill-collection/issues/56) controls the command guard's failure and recovery policy. This document records those decisions and the existing guard's structure, without adding rule families or claiming new harness support.

## Structure and cases

- Keep one tested engine with thin per-harness adapters; keep rules as data beside it. The guard's [layout](../../hooks/command-guard/README.md#layout) is the example: `engine/` classifies, `rules/core.json` declares command forms, and `adapters/` translates harness payloads and verdicts. This shape is retained by #56.
- Ship block and allow cases. Keep allowed and inapplicable calls silent, and never reinforce instructions on every turn. These are the [hook admission rules recorded in #17](https://github.com/Hissal/skill-collection/issues/17); its resolution also puts the guard cases in the collection check and CI.
- Follow the guard's [case harness](../../hooks/command-guard/test/run.js): classify command strings without executing dangerous commands, exercise rule families and shells, use scratch directories for real-filesystem cases, and test adapter payloads and failure behavior. Run it with `node hooks/command-guard/test/run.js`. See the [guard layout](../../hooks/command-guard/README.md#layout).

## Failure, output and disabling

Ordinary hooks fail open and carry one environment switch to disable them, as decided in [#17](https://github.com/Hissal/skill-collection/issues/17). The decision does not prescribe a shared variable name.

The command guard is the explicit exception: a crash, timeout or invalid verdict stops the affected covered call wherever the adapter can enforce that. Never turn failed evaluation into allow. Declare unenforceable cases and distinguish absent, untrusted, disabled, overridden or bypassed hooks from a running guard's verdict. These are [#56's failure rules](https://github.com/Hissal/skill-collection/issues/56); the [guard limits](../../hooks/command-guard/README.md#limits) record current adapter gaps.

For guard recovery, the agent reports the error and may inspect or explain a repair; it must not disable the guard, loosen rules or create bypass state to continue. The human stops the session, repairs or disables the guard, and restarts. State when protection is absent. Disabling is not approval for a dangerous command. Follow [#56](https://github.com/Hissal/skill-collection/issues/56) and the [existing recovery procedure](../../hooks/command-guard/README.md#when-the-guard-breaks-or-blocks-something-you-want); do not infer an agent-operated guard bypass from the general environment-switch rule.

Human-required verdicts remain denied in agent execution. Explain the exact command, working directory, resolved targets, purpose, effects and recoverability, including unknowns, for separate human execution. Reflection, retries, prompts and automatic reviewers cannot grant human authority. The guard is local accident prevention, not a security boundary against a full-access agent. Source: [#56's scope and authority resolution](https://github.com/Hissal/skill-collection/issues/56).

## Portability and evidence

The general admission gate requires Claude Code and Codex support or an intentional Claude-only declaration ([#17](https://github.com/Hissal/skill-collection/issues/17)). The guard's target set is Claude Code, Codex and OpenCode; surveys of other harnesses do not declare support ([#56](https://github.com/Hissal/skill-collection/issues/56)).

Record adapter and version limitations separately from Linux, macOS and Windows shell/path coverage. Before claiming runtime behavior, verify installed versions with harmless substitutes, including denial, retries, automatic responders, absent humans, crashes, timeouts, malformed output, changed commands/targets, other hooks/plugins and uncovered paths. Source reading and simulated paths are not live verification. This follows [#56's verification requirements](https://github.com/Hissal/skill-collection/issues/56); the [guard README](../../hooks/command-guard/README.md#limits) demonstrates reporting the remaining limits.
