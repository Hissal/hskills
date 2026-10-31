# Install and plugin evidence index

Where each spec [#78](https://github.com/Hissal/skill-collection/issues/78) install and plugin
claim is evidenced. Reports carry the method, versions, exact models and limits; their record
folders carry the transcripts. Runners live in `scripts/install/evidence/`.

## Claims

| Claim | Linux | Native Windows |
| --- | --- | --- |
| Mixed-scope requirement loads (both directions) and duplicate-caller precedence (#127, #116) | [6 cells](issue-127-cross-scope.md), `issue-127/` | [12 cells, symlink and junction arms](windows-install-2026-10-31.md#cross-scope-link-matrix-127-116) |
| Owner steering: three targets, remembered opt-in, conflict, copy drift (#119) | Native OpenCode global target: [present/absent control](../../research/opencode-install-125.md#approved-native-global-steering-2026-10-31) | [Link, rerun, conflict, injected copy, drift](windows-install-2026-10-31.md#owner-steering-119) |
| Adapter registration and real host hook decisions: Claude, Codex, OpenCode (#120) | [Smoke probes and OpenCode host lifecycle](../../research/live-hooks-120.md) | Claude and Codex in the plugin rows below; OpenCode not run |
| Plugin-source-labelled core deny, project deny, allow, same-session source branch switch (#121) | Claude: [live plugins](../../research/live-plugins-121.md); Codex: [post-review acceptance](../../research/codex-acceptance-121.md) | [Claude and Codex, run B](windows-guard-followup.md#live-probes-run-b) |
| Codex pending trust and human review boundary (#121) | [Normal-profile registration](../../research/human-review-auth-121.md) | [Pending, review, migration, run A](windows-guard-followup.md#pending-trust-and-migration-run-a) |
| Guard install, doctor, uninstall preserving unrelated hooks (#120) | [Temporary-home lifecycle](../../research/live-plugins-121.md#installed-lifecycle) | [Two trusted cycles with trust and preference preservation, run C](windows-guard-followup.md#trusted-lifecycle-acceptance-run-c) |
| OpenCode discovery, gate suppression, explicit and ungated body loads (#125) | [Discovery controls](../../research/opencode-install-125.md#resolved-discovery-controls-2026-10-31), 13 gated requests | Not run |
| Plugin guide reach, bare and qualified, with plugin-disabled controls (#123) | [Guide reach](../../research/plugin-guide-reach.md) | Not run |
| Generated plugin load chains (#124) | [Plugin generation](../../research/plugin-generation-124.md) | Not run |

No claim has macOS evidence.

## Record layout

- `manifest.json` in a record folder lists each step with its `command` (the exact argv, `cwd`,
  environment overrides or mounts, verbatim from the run), `exit`, and `stdout`/`stderr` files.
  An empty stream is `''`. Where repeated steps printed byte-identical output, the file is stored
  once and each step keeps its own `stdoutSha256`.
- A file named `*-extract.json` is a labelled extract: it names its original file and hash and says what it omits.
- Transcripts (`.jsonl`) are sanitized host streams: tool calls and results, hook events, model identity
  and usage, without assistant thinking or credentials. Plain-text installer output is `.log`.
- Superseded attempts and intermediate diagnostics were pruned after
  [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence);
  each report names what it removed and links the originals there.
