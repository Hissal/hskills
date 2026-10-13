# Freeze behavior prototype

Throwaway evidence for [Prototype: validate project/session-scoped freeze](https://github.com/Hissal/skill-collection/issues/57). The owner has not accepted the behavior. This is not an installed guard or a supported adapter.

Open `index.html` directly. It is self-contained, changes imaginary files only, and stores state in memory. Its free-play controls and six guided walkthroughs show multiple directories, atomic edits, links, project/session isolation, resume, explicit finish, user authority and the shell gap. Switching path models resets the demo. The macOS model is explicitly case-sensitive and unverified on a Mac.

`node prototypes/freeze-prototype/probe.cjs` runs native filesystem observations in a newly created `PROTOTYPE-freeze-wipe-me-*` temporary directory. It leaves scratch files for inspection. It installs no hooks and changes no real project files. On this machine the Linux run was `wsl -d Ubuntu -- node /mnt/c/dev/skills/skill-collection/prototypes/freeze-prototype/probe.cjs`.

## Evidence and its limits

Captured on 2026-10-13:

- `evidence.json`: Windows, Node 22.23.2, 19 observations.
- `evidence-linux.json`: Ubuntu under WSL, Node 18.19.1, 19 observations on the Linux `/tmp` filesystem.
- `browser-observations.json`: the actual guided buttons were driven in T3's headless HTML preview across the three virtual path models. These are model observations, not OS or harness support checks.

Native block/allow pairs cover an existing relative file, an outside file, directory-prefix collision, parent traversal, a new leaf, multiple roots, all-or-nothing target checks, move endpoints and directory links. Ordinary Windows case aliases resolve to the existing file. Alternate case on the Linux directory stops as unsupported. Missing intermediate directories and multiply linked files stop as unsupported. This temporary checker supports new leaf files only; it does not claim full new-directory support.

One important OS difference was observed. For `src/escape/../a.txt`, with `escape` pointing to another project, Win32 resolved the original source directory's file. Linux followed the link before the parent traversal and reached a file in the scratch root. The prototype preserves traversal before native resolution. A production adapter must match its tool's actual resolution and mutation semantics. Its checker must not approve one physical target while the tool edits another.

The probe wrote an outside scratch file through PowerShell on Windows and `/bin/sh` on Linux. Those shell paths deliberately do not call the edit checker. This demonstrates the stated coverage gap; it is not a bypass test against an installed hook. Supported edit tools can catch accidental scope drift, while arbitrary scripts can still write elsewhere.

The state reload uses two real Node processes with invented adapter/project/session IDs. It proves a small file can retain keyed state across processes. It does not verify harness identity, lifecycle events, concurrent hook updates, state-file authority or human invocation. Concurrent sessions and other projects are separate synthetic keys. Browser authority buttons are fixtures.

Git Bash independently reported `/c/dev/skills/skill-collection` and `cygpath -w` translated it to the Windows checkout. Ubuntu read the probe from `/mnt/c/dev/skills/skill-collection`. These observations establish those mappings only. They do not establish general WSL mount, Git Bash or cross-environment containment. No macOS run occurred.

## Adapter facts and gaps

The sources were fetched on 2026-10-13. They are current, unversioned documentation, not pinned adapter source. No harness was launched for a model task and no adapter was installed. Version inventory found Claude Code 2.1.296 and codex-cli 0.162.1. OpenCode's local package metadata reports `@opencode/cli` 2.0.27; its version command failed to open its log inside the sandbox, so that package number is not runtime verification.

- **Claude Code.** Hook payloads have `session_id` and `cwd`; the project-root environment value can differ from a worktree's current directory. Skill expansion has a dedicated event. `SessionEnd` also fires on exit and interactive conversation switching. Deleting state on every event would break later resume. The reference documents `onFailure: block` for command/http hooks from 2.1.295. Actual payloads, failure handling and invocation wiring remain unverified. [Hook reference](https://code.claude.com/docs/en/hooks)
- **Codex.** Hooks expose `session_id` and `cwd`; subagents use the parent's session ID. Covered patches arrive through `tool_input.command`. `SessionEnd` includes normal closure and inactivity, so it does not establish permanent abandonment. No verified explicit freeze invocation signal was established. Patch parsing, lifecycle and failure handling remain unverified. [Hook reference](https://learn.chatgpt.com/docs/hooks)
- **OpenCode.** The documented plugin context includes project, directory and worktree. The guide lists tool-before hooks and session events. It does not establish the complete current installed edit payload contract or a permanent-finish signal. Session ID wiring, user-command authority and fail-closed behavior remain unverified. [Plugin guide](https://opencode.ai/docs/plugins/)

All three real adapters are unsupported by this prototype. Source-documented identity is an implementation input, not proof of enforcement. Shell tools, unknown MCP editors and specialized execution paths are not declared covered. A worktree needs a deliberately selected physical project identity; a mutable current directory must not silently produce a new unrestricted key.

## Assumed guard policy

The prototype assumes the closed [human-only approval decision](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362). Human-required commands remain denied for separate human execution. A failed covered evaluation stops where the installed adapter can enforce that. Guard recovery is human stop, repair or disable, then restart. A missing or bypassed hook has no guarantee. Freeze offers local accident prevention and does not authenticate human authority through an agent-writable file.

## Proposed behavior for the owner to judge

1. Treat pause, app closure and later resume as one logical conversation. Keep its boundary until explicit human unfreeze or finish. A fresh conversation gets a new identity and no inherited boundary. The demo retires an explicitly finished identity. This differs from blindly using a harness event named `SessionEnd`.
2. Freeze replaces the selected list with the union of one or more resolved directories. A patch with any outside target stops before changing any file. A move checks both old and new targets. An alias into a chosen physical directory is allowed; a link out is blocked.
3. Failed resolution and unsupported covered edit targets stop. Hard-link aliases, missing intermediate directories and link races need further implementation work before support is claimed. Directories chosen as roots must be checked for retargeting as well as files beneath them.
4. Keep the edit-tool mechanism only if catching accidental edit drift is useful despite unrestricted shell writes. It cannot alone contain an unattended run.

Windows case-sensitive directories, UNC/device/drive-relative paths, custom mounts, live link changes and race-resistant tool execution remain unverified. Each supported adapter also needs harmless installed full-access probes for edit interception, atomic patches, user invocations, project/session isolation, restart/resume and failure handling. The ticket remains open for the owner's reaction and these explicit support limits.
