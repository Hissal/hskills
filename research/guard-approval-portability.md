# Guard approval portability

Read on 2026-10-13 for [core guard rule set #43](https://github.com/Hissal/skill-collection/issues/43) and [human-only approval in full access #56](https://github.com/Hissal/skill-collection/issues/56). This is source research, not an installation or runtime verification. No donor scripts or dangerous commands were executed.

## Findings

### Claude Code

`PreToolUse` supports `deny` and `ask`. A denial blocks before permission-mode checks, including `bypassPermissions` and `--dangerously-skip-permissions`. An installed mod handling `tool.check` can override a denial from a non-managed hook. The documentation exempts managed-hook denials from that override. [Official hook guide](https://code.claude.com/docs/en/hooks-guide#hooks-and-permission-modes)

`ask` presents a permission prompt and its reason. That does not establish human-only authority. `PermissionRequest` hooks can approve on the user's behalf, and an SDK host can answer permission requests through its callback. The strongest tier must account for those other decision makers rather than assuming that a prompt always reaches a person. [Hook reference](https://code.claude.com/docs/en/hooks#pretooluse-decision-control), [SDK permission flow](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated)

### Codex

The current official reference supports `PreToolUse` denial JSON and exit code 2. `permissionDecision: "ask"` is unsupported: Codex reports hook failure and continues the call. `PermissionRequest` only runs when normal execution already needs approval, and an allowing hook can suppress its prompt. Local hook coverage includes shell calls, `apply_patch`, MCP calls and most local function tools. Hosted tools and some specialized paths bypass it. Sending input through `write_stdin` does not run `PreToolUse` again. [Official hook reference](https://learn.chatgpt.com/docs/hooks#pretooluse), [tool coverage](https://learn.chatgpt.com/docs/hooks#tool-coverage)

Full access combines `danger-full-access` with approval policy `never`. It removes sandbox restrictions and ordinary approval prompts. Interactive approvals can use either a human reviewer or automatic review. A guard must not translate a human-required decision to unsupported `ask` and expect safety. [Official sandbox documentation](https://learn.chatgpt.com/docs/sandboxing)

### OpenCode

The published plugin guide shows blocking a tool by throwing from `tool.execute.before`. Normal permissions offer `allow`, `ask` and `deny`, including an allow-all configuration. The permission UI offers `once`, `always` and `reject`; broad approval can affect later requests. [Official plugin guide](https://opencode.ai/docs/plugins/#env-protection), [official permissions guide](https://opencode.ai/docs/permissions/)

Current source differs from the older plugin examples. At [`df63a72`](https://github.com/anomalyco/opencode/tree/df63a72da4b84c9983b6ddca46cd19f10caf4575), the V2 plugin API exposes a `permission.evaluate` hook with mutable `effect` and `message`. Core permission evaluation invokes it after configured and saved allows; `assert` returns on `allow`, blocks on `deny`, or waits for a reply on `ask`. This provides a native approval route even when configuration would allow the request. It is version-specific source evidence, not proof that the owner's installed version supports it. The plugin API also exposes permission replies, so native approval is not automatically restricted to humans. [Plugin permission types](https://github.com/anomalyco/opencode/blob/df63a72da4b84c9983b6ddca46cd19f10caf4575/packages/plugin/src/promise/permission.ts), [permission implementation](https://github.com/anomalyco/opencode/blob/df63a72da4b84c9983b6ddca46cd19f10caf4575/packages/core/src/permission.ts)

## David Ondrej's published guard tests

The pinned tests are more selective than a blanket password-manager CLI ban. They allow `op --version`, `op whoami`, `op signout` and `op account list`. They expect blocks for secret reads, exports, environment injection and some login operations across `op`, `bw`, `bws`, `lpass`, `keepassxc-cli`, `rbw`, `nordpass` and `pass`. The tests also allow targeted macOS keychain password queries while blocking a keychain dump, and allow listing GPG secret keys while blocking their export. This is evidence of expected outcomes, not the unpublished matching rules. [Pinned test source](https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/hooks/test-guard.sh)

## Implications for the proposed design

The following are design inferences, not existing guarantees:

- Keep reflection, ordinary native approval and human-only approval distinct. A denied first attempt followed by an automatically allowed identical retry can prompt reconsideration. It cannot authenticate human consent.
- For human-only approval, require a review that shows the exact command, working directory, resolved targets, why the task needs it and its effect in plain language. Bind the approval to that exact invocation and reject changed input, expired approval and automatic substitutes.
- A file or environment variable that the full-access agent can write cannot prove human approval. Hooks, rules and approval state writable by that agent also cannot guarantee enforcement against circumvention. An enforceable guarantee needs an approval channel and execution boundary outside the agent's control. Until that exists, deny the strongest tier and leave the user to perform the action manually.
- Fail-open remains an accident-prevention tradeoff. It cannot also promise that the strongest tier never runs after hook failure. This requires a separate decision in #56.
- Operating-system coverage and agent-app coverage are separate. Specify and test Linux, macOS and Windows path resolution and command spellings, plus Bash/POSIX shells, PowerShell and `cmd.exe`, independently of each adapter's approval behavior. For example, Claude's Windows PowerShell tool needs a matcher as well as Bash. [Official Windows hook guidance](https://code.claude.com/docs/en/hooks#windows-powershell-tool)

## Remaining verification

Before adoption, test supported versions with harmless substitute commands under their full-access modes. Check denial, user approval, rejection, no interactive user, automatic reviewers, other plugins/hooks, expired approval and modified command input. Source reading here does not prove those behaviors on the owner's installed applications.
