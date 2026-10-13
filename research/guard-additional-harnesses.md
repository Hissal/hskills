# Guard approval in additional harnesses

Read on 2026-10-13 for [How does the guard enforce human-only approval in full access?](https://github.com/Hissal/skill-collection/issues/56). This quick survey extends [Guard approval portability](guard-approval-portability.md). It covers Pi, Cursor desktop and CLI separately, Gemini CLI, and GitHub Copilot CLI. No installations, runtime probes, or dangerous commands were executed. Documentation describes a contract; pinned source describes that revision, which may differ from an installed release.

## Pi

The requested `badlogic/pi-mono` repository currently redirects to `earendil-works/pi`. Its README explicitly says Pi has no built-in permission system and runs with the launching process's permissions. A permission extension is therefore an added gate, rather than an override of a native approval mode. [Upstream README](https://github.com/earendil-works/pi/blob/7d75a0e3eb273dff753d49c066ea29fbe7b3b6f6/README.md#permissions--containerization)

The official permission-gate example intercepts `tool_call`, checks Bash patterns, blocks when no UI is available, and asks through `ctx.ui.select` otherwise. A response other than `Yes` blocks. This is a narrow example, not comprehensive command analysis. [Pinned example](https://github.com/earendil-works/pi/blob/7d75a0e3eb273dff753d49c066ea29fbe7b3b6f6/packages/coding-agent/examples/extensions/permission-gate.ts)

Current extension documentation says a failed `tool_call` handler blocks the tool. It also says print/JSON modes have no UI, while RPC can forward dialogs. The runner returns immediately on a blocking handler and lets handler exceptions propagate. [Extension documentation](https://github.com/earendil-works/pi/blob/7d75a0e3eb273dff753d49c066ea29fbe7b3b6f6/packages/coding-agent/docs/extensions.md#errors-and-cleanup), [runner](https://github.com/earendil-works/pi/blob/7d75a0e3eb273dff753d49c066ea29fbe7b3b6f6/packages/coding-agent/src/core/extensions/runner.ts#L1249)

RPC accepts `extension_ui_response` messages from its client and resolves pending dialogs with them. **Inference:** `hasUI` and a positive dialog response do not establish that a human answered; an automated RPC client can provide the response. [RPC implementation](https://github.com/earendil-works/pi/blob/7d75a0e3eb273dff753d49c066ea29fbe7b3b6f6/packages/coding-agent/src/modes/rpc/rpc-mode.ts#L766)

## Cursor desktop

Generic `preToolUse` supports blocking, but its `ask` value is explicitly not enforced today. Separate `beforeShellExecution` and `beforeMCPExecution` hooks document `allow`, `deny`, and `ask`. Denial wins when hook responses merge. Exit 2 blocks; crashes/timeouts normally allow execution. `failClosed: true` covers failures and missing output; malformed permission responses already block. Hooks can come from project/user files or managed distribution. [Hook reference](https://cursor.com/docs/hooks)

Terminal run modes include an automatic reviewer; Cursor describes them as best-effort controls. **Unknown:** whether a shell/MCP hook's `ask` always reaches a person under every run mode. Do not extend the documented shell `ask` to generic `preToolUse`. [Agent security](https://cursor.com/docs/agent/security)

## Cursor CLI

`--force`/`--yolo` allows commands unless explicitly denied; `--sandbox disabled` is a separate option. Headless print mode is noninteractive, and force permits file changes without confirmation. [CLI parameters](https://cursor.com/docs/cli/reference/parameters), [headless guide](https://cursor.com/docs/cli/headless)

The CLI has global/project permission files, and deny rules outrank allows. **Unknown:** exact hook-event parity with desktop, `failClosed` support in a specific CLI release, and hook `ask` behavior under force/headless mode. The shared hook reference does not establish those combinations; verify CLI separately. [CLI permissions](https://cursor.com/docs/cli/reference/permissions), [shared hook reference](https://cursor.com/docs/hooks)

## Gemini CLI

The official hook reference documents `BeforeTool` denial and exit 2 blocking; it lists common decisions as allow/deny. Its overview says invalid JSON defaults to allow, other exit codes warn, hooks run with user privileges, and hooks can be disabled. **Unknown:** timeout behavior and all error combinations on a supported release. [Hook reference](https://geminicli.com/docs/hooks/reference/), [overview](https://geminicli.com/docs/hooks/)

Current source is richer than that reference: at `51617c1`, `isAskDecision()` recognizes `ask`; the scheduler checks hooks before policy and then replaces the policy result with `ASK_USER` for a hook ask. It passes a forced `ask_user` decision into confirmation. This is evidence of an approval route after an ordinary policy allow, including the default YOLO allow; it is not a runtime guarantee for installed versions. [Hook output types](https://github.com/google-gemini/gemini-cli/blob/51617c1bcbcb038291125b092501b4342f4e7f77/packages/core/src/hooks/types.ts#L218), [hook evaluation](https://github.com/google-gemini/gemini-cli/blob/51617c1bcbcb038291125b092501b4342f4e7f77/packages/core/src/scheduler/hook-utils.ts), [scheduler](https://github.com/google-gemini/gemini-cli/blob/51617c1bcbcb038291125b092501b4342f4e7f77/packages/core/src/scheduler/scheduler.ts#L615)

Separately, policies support `ask_user`, treated as deny in noninteractive mode. User/admin policies outrank defaults, including YOLO; rules can apply across modes. **Unknown:** whether hook-forced ask has identical headless behavior and whether every integration's approval responder is human-only. The policy docs contain inconsistent numeric tier examples, so do not encode their numbers without checking the supported version. [Policy engine](https://geminicli.com/docs/reference/policy-engine/)

## GitHub Copilot CLI

`preToolUse` supports allow/deny/ask. Command-hook crashes and nonzero exits deny, but **timeouts always fail open, including administrator hooks**. HTTP hook errors also fail open. `permissionRequest` hooks can programmatically allow before ordinary permission processing. **Unknown:** hook ask precedence under all CLI approval modes and behavior without an interactive client; cloud-agent ask-as-deny is documented separately. [Hook reference](https://docs.github.com/en/copilot/reference/hooks-reference)

`--allow-all`/`--yolo` enables automatic permissions; explicit deny rules retain precedence. Managed settings can disable bypass modes. Assisted approval can let an LLM approve requests, so a native permission flow is not necessarily human-only. [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

## Decision implications

These are design inferences from the cited evidence, not existing cross-harness guarantees:

- Distinguish tool interception, blocking, native prompting, and authenticated human approval. A harness can support one without supporting all four.
- Treat adapters as versioned capabilities. Pi's extension and Gemini's source-level ask are promising; neither establishes human identity across RPC or hosted integrations. Cursor generic ask is explicitly unsuitable today.
- A strongest-tier guarantee must survive missing interaction, hook failure, automatic reviewers, and changed input. Copilot's documented timeout behavior prevents an unconditional guarantee from that hook alone.
- Ordinary project/user hook files are not an independent trust boundary when the agent can modify them. Managed placement helps only if the agent cannot change the effective policy, scripts, approval state, or execution path. Full operating-system access makes that an architectural question, not a hook return value.
- Decide whether the guard promises accident prevention for a cooperative agent or enforcement against circumvention. For the latter, approval and execution authority must remain outside the agent's control; otherwise keep the strongest tier blocked and have the human execute it.

Before marking any adapter supported, probe harmless commands under its advertised full-access mode: deny, ask, reject, no UI, automated responder, timeout/crash/malformed output, modified invocation, configuration tampering, and alternate tool paths. The survey leaves those runtime checks open.

## Decision record

The owner resolved [How does the guard enforce human-only approval in full access?](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362) on 2026-10-13. That resolution holds the approved policy and recovery procedure. This report remains source evidence; it does not establish verified runtime behavior.
