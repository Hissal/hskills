# Planning and environment answers

What a core workflow asks when planning work on a Unity repo, or when looking back at a session. Each section answers one need.

## Check tools and their cost classes (`constraints`)

The commands and the project's cost tiers live in project configuration: the check-commands file from the `## Agent skills` block. These are the costs those tiers have to fit:

| Class | Tools | Cost |
|---|---|---|
| No Unity | Text checks | Seconds, anywhere |
| Connected Editor | Compile, tests, inspection in an Editor already open | No start cost. Needs the Editor and Pipeline, and it blocks on a modal dialog |
| Batch launch | Compile, tests, `-executeMethod` | An Editor start per run, and the project must be free |
| Player build | One per target | A batch launch plus the build. Dearest of the routine checks, so only where the risk calls for it |
| Cold import | The first open of a checkout with no `Library/` | Can be many minutes, needs permission, one at a time |
| CI | Whatever the workflow runs | The repo's CI minutes. Only the owner pushes |

Report a tier the project has not recorded as unset. It stays the project's to choose.

## Parallel work: shared resources and isolation (`delegating`, `implement-spec`)

What workers cannot share, and how to isolate them:

- **Project locks.** One Editor holds a project folder. A batch run against a held project refuses within seconds, so two workers cannot run Unity in one checkout, and the user's open Editor keeps its checkout. Give each worker that runs Unity its own checkout. Workers that only need text checks can skip Unity altogether.
- **Per-checkout generated state.** `Library/`, `Temp/`, `Logs/` and `obj/` belong to one checkout and are never shared or linked. Fill a new checkout's `Library/` by the [warm copy](../SKILL.md#new-checkout), including its marker cleanup.
- **One cold import at a time.** Ask once for the whole batch and run them in sequence, per [New checkout](../SKILL.md#new-checkout). Warm runs in separate checkouts can run side by side, within the memory the machine has.
- **A connected Editor is one shared state.** A recompile or a Play session one worker starts reaches every other worker driving it, so give live-Editor work to one worker.
- **Player builds** are batch launches with their own cost: one checkout each, and they count toward the machine's memory.

## Slicing work (`to-tickets`)

A ticket's acceptance criteria name the checks it needs and whether any needs a connected Editor. What runs where:

- **Anywhere, cloud agents included:** text checks.
- **With a local Editor, headless or connected:** compile, tests, Player builds.
- **Only with a connected Editor:** driving live scenes.
- **Only with a human:** judging feel, visuals, audio or a device. Those tickets take the `ready-for-human` role.

An agent claiming a ticket first checks it can reach the named checks, and passes the ticket up when it cannot.

Surfaces that cannot be worked in parallel, and renames that need expand-contract, are in the guide's Serialization and Assembly rules.

## Environment gaps (`retro`)

Pull these from the session's reports, under `environment gap:`. Each cost a check, not a verdict on the code:

- No Editor, or the project's Editor version not installed.
- An Editor open without Pipeline, so nothing could drive it.
- A locked project, or an Editor stuck in Safe Mode or pending.
- No licence.
- A cold import declined, or no warm copy source.
- CI not triggered.

For each, say what it blocked and how often it recurred, and name the fix a person can choose: recording an allowed environment or a cold-import permission, or keeping a warm source. A gap that recurs is worth a project fact or a ticket; the retro decides.
