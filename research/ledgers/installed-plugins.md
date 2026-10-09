# Ledger: installed plugins (karpathy-skills, caveman, vibe-wise)

Ideas only (ticket #9). All three plugins are installed at user scope on the owner's machine and will not be recreated; the owner can enable any of them. They were read from the local plugin cache (read only), and nothing was executed. The pins are the installed commits, with current `main` checked through `gh api` on 2026-10-09:

| Source | Installed (read) | `main` on 2026-10-09 | State on this machine |
|---|---|---|---|
| `forrestchang/andrej-karpathy-skills` | [`2c60614`][ks] (1.0.0) | same | Claude: disabled |
| `JuliusBrussee/caveman` | [`0d95a81`][cv] | [`2e08b91`][cvm] (962 commits ahead) | Claude: disabled |
| `nykooi1/vibe-wise` | [`1135f4a`][vw] (0.1.43) | `eefb53d` (6 commits ahead, adds Codex packaging) | Claude: **enabled** |

The enablement states are from `~/.claude/settings.json` and the installed SHAs from `~/.claude/plugins/installed_plugins.json`. Token figures come from `claude plugin details <name>` (read-only) unless they are marked as inference. Vocabulary follows `GLOSSARY.md`, and the cost rules follow [`research/loading-mechanics.md`](../loading-mechanics.md): hook definitions are free, and only what hooks print is paid. Everything below is **proposed**.

## Overview

- **karpathy-skills never loaded its guidelines.** Its always-on text sits in a plugin-root `CLAUDE.md`, which Claude Code does not load. Only one model-invoked skill shipped, and no surviving transcript shows that skill being invoked. The four principles are worth a few lines in the always-on discussion (#14). The plugin itself is not worth keeping.
- **caveman's cost was real and measurable.** The local transcripts show about 2.5k tokens at every session start (descriptions plus a SessionStart ruleset), plus a reminder on every prompt. caveman's own docs concede it is net-negative for terse coding Q&A. The lesson for #14: inject a style rule once, keep it short, and don't reinforce it on every turn. The token-saving idea survives as a "lite" rule of one or two lines.
- **vibe-wise is the good counter-example.** Its SessionStart hook stays silent unless the project has opted in, and both of its skills are user-invoked. Transferable ideas: hand decisions back to the user, a "Proposed additions" table that separates the user's decisions from the agent's fill-ins, and pending decisions that survive compaction.

---

## karpathy-skills

**What it is.** One skill, [`karpathy-guidelines`][ks-skill]: four principles ("Think Before Coding", "Simplicity First", "Surgical Changes", "Goal-Driven Execution"), about 2.5 KB. The same text is duplicated as a root [`CLAUDE.md`][ks-claude] and a Cursor rule. The [manifest][ks-manifest] declares only `"skills": ["./skills/karpathy-guidelines"]`. It has no hooks.

**Would it ever have loaded anything?**
- The root `CLAUDE.md` never loads through the plugin. In the Claude Code docs' words, a "`CLAUDE.md` at the plugin root isn't loaded as context" (`plugins-reference.md`, Standard layout, fetched 2026-10-09). The README's "Option A: Claude Code Plugin (recommended)" therefore only gives you the skill. The always-on behaviour needs "Option B", copying `CLAUDE.md` into a project ([README L99-125][ks-readme]).
- While the plugin was enabled, the skill's description cost about 105 idle tokens (`claude plugin details`). Its body (about 850 tokens) would load only if the model chose to invoke it, and its description ("Use when writing, reviewing, or refactoring code") is generic.
- A grep of `~/.claude/projects/**/*.jsonl` for `"skill":"…karpathy…"` found **0 invocations**. For comparison, the same grep counts 110 for `pr` and 82 for `code-review`. Caveat: the oldest surviving transcript that mentions the skill is from 2026-08-23, while the plugin was installed on 2026-04-24, so earlier sessions are gone. The owner's suspicion holds in effect: the guidelines were listed, but no surviving record shows them in use.

| Field | Entry |
|---|---|
| Kind | convention doc (packaged as a skill) |
| Proposed address | idea-only input to #14 (always-on), as a few lines of core always-on text |
| Why it could fit | "Surgical changes" ("Every changed line should trace directly to the user's request") and "surface assumptions, don't pick silently" are cheap, general rules. Each costs about 20-40 tokens as one line (inference) |
| Why it might not | "If uncertain, ask" overlaps the fork's `grilling`. "Goal-driven: write a test first" overlaps `tdd`. The whole file biases "toward caution over speed" ([skill][ks-skill]), which could slow AFK runs |
| Copy / adapt / idea-only | Idea-only. The full file is about 850 tokens, too much for always-on. Distil it to 2-3 lines if #14 wants any of it |
| Overlap | fork `grilling`, `tdd`, `diagnosing-bugs`; superpowers `verification-before-completion` (ledger #7) |
| Idle context cost | ~105 tok as published (model-invoked). 0 if disabled |
| Recommendation | *Proposed:* keep the plugin disabled (or uninstall it). Carry "surgical changes" and "state assumptions" as candidate one-liners into #14 |

---

## caveman

**What it is.** An output-compression mode ("Respond terse like smart caveman") delivered by two hooks and seven skills, plus commands and three `cavecrew-*` subagents ([`plugin.json`][cv-manifest], [`skills/caveman/SKILL.md`][cv-skill]).

**What it injects (installed `0d95a81`).**

| Piece | When | Size | Source |
|---|---|---|---|
| Skill and agent descriptions (12 skill entries, because `skills/` and `commands/` are both listed, plus 3 agents) | every session | ~1,420 tok | `claude plugin details caveman` |
| SessionStart: the full `caveman/SKILL.md` body, filtered to the active level. It has no matcher, so it also fires on resume, clear and compact | every session start | ~3.2k chars ≈ **~1.1k tok** | [`caveman-activate.js`][cv-activate] L39-140, L172; transcripts below |
| SessionStart extra: a "STATUSLINE SETUP NEEDED … Proactively offer to set this up" nudge, appended when `settings.json` has no `statusLine` | until configured | ~400 chars | [`caveman-activate.js`][cv-activate] L142-170 |
| UserPromptSubmit `additionalContext`: "CAVEMAN MODE ACTIVE (full). Drop articles/…" | **every prompt** while active | 121 chars ≈ ~35-40 tok, and each one stays in history | [`caveman-mode-tracker.js`][cv-tracker] L163-202 |

The chars-to-tokens ratio is inference, using `plugin details`' own figure for `caveman/SKILL.md` (5,304 chars ≈ 1.8k tok, about 2.9 chars/token). The plugin's estimator labels both hooks "harness-only — no model context cost", which is the same blind spot found for superpowers ([loading-mechanics §4](../loading-mechanics.md)).

**Measured on this machine.** A read-only script over `~/.claude/projects/**/*.jsonl` found the ruleset in **121 sessions** (118 with the SessionStart block, median 3,240 chars, range 2,364-3,728). It found **783** per-prompt reminders in total, median 5 and max 32 per session. The count is string occurrences, so it may double-count (inference). **Estimate per session: ~2.5k tokens of context before the first reply, plus ~40 per prompt.** In a 30-turn session that is roughly 3.7k tokens (inference). Because the whole context is re-sent on every request, this is the basis for caveman's own claim of "~1–1.5k input tokens every turn" ([HONEST-NUMBERS][cv-honest]). That doc also states the net loss: "If your normal replies are ~150 output tokens … Net loss", and it puts session-level savings at "14–21%" on output-heavy work and "below zero on terse ones". Current `main` makes this worse: it adds a `SubagentStart` hook that runs the same activation script with `--subagent` ([`main` plugin.json][cvm-manifest]). Inference: every subagent then pays the ruleset as well.

**Leftover on this machine.** `~/.claude/settings.json` still sets `statusLine` to `caveman-statusline.ps1` inside the disabled plugin's cache folder. It has no context cost (the statusline is harness-only), but it depends on a disabled plugin's files. That belongs in the migration item on the map.

**Hard text gets harder.** The skill hedges this itself. "Auto-Clarity" drops the style for security warnings, irreversible actions and multi-step sequences, and for cases where "Compression itself creates technical ambiguity" ([skill][cv-skill]). The per-turn reminder exists because "models drifted back to verbose mid-conversation" ([`caveman-activate.js`][cv-activate] L39-44). The style fights the model's defaults and has to be re-asserted all the time, which is why it costs so much (inference).

| Candidate | Kind | Proposed address | Fit / misfit | Copy / adapt / idea | Idle cost | Recommendation (*proposed*) |
|---|---|---|---|---|---|---|
| **Lesson: always-on injection** | — | input to #14 | Shows the three ways always-on cost adds up: a large SessionStart body, a per-prompt reminder that accumulates in history, and descriptions duplicated across skills and commands. vibe-wise (below) shows the opposite pattern | idea | — | Record as a #14 rule: an always-on style rule is paid once, short, no per-turn reinforcement, silent where it doesn't apply |
| **Brevity rule ("lite" level)** | convention doc | core always-on (one or two lines) | The lite row keeps grammar ("No filler/hedging. Keep articles + full sentences"). Its rules "no tool-call narration, no decorative tables/emoji, no long raw error-log dumps unless asked" address real waste without the readability cost | idea-only: rewrite as ≤40 tokens. The full skill is ~1.8k | ~30-40 tok (inference) | Candidate for #14. Skip `full`/`ultra` |
| `caveman-compress` (rewrites memory files into caveman prose, keeps a `.original.md` backup) | skill + script | — | Shrinks always-on files, but in caveman prose that people and models must decode. It overwrites the file in place | reject | 0 if user-invoked | *Proposed reject.* `writing-for-agents` already trims always-on text without degrading it |
| `caveman-commit`, `caveman-review` | skill | — | Overlap fork `pr` / `code-review` and the owner's Conventional Commits rule | reject | ~140/~120 each | *Proposed reject* |
| `cavecrew` (terse subagent reports, "~60% smaller" tool results) | skill + agents | idea for #15 | Keeping subagent hand-backs short does save main context | idea-only | — | Fold "subagents return compact reports" into subagent prompt templates, not a mode |
| `caveman-stats` (real token counts from the session log, with the estimated baseline labelled `est.`) | hook + script | idea for #17 | Honest measurement: it separates measured figures from estimated ones | idea-only | — | Note as prior art for any cost tooling in #17 |

---

## vibe-wise

**What it is.** A "learning-first" mode in which "The learner is the engineer and owns the design" and Claude writes the agreed code ([`behavior.md`][vw-behavior]). It ships two skills, `learn` and `reset`. Both set `disable-model-invocation: true` ([`learn/SKILL.md`][vw-learn], [`reset/SKILL.md`][vw-reset]). It also has one SessionStart hook ([`hooks.json`][vw-hooks]).

**Cost.** Idle cost is about 0 in an ordinary repo. The skills are user-invoked: `plugin details` reported ~108 tokens, but its estimator counts flagged skills anyway (loading-mechanics §6, inference). The hook prints **nothing** unless a `.vibe-wise/profile.md` exists inside the current repo and is not paused. It does not cross the `.git` boundary ([`session_start.py`][vw-hook] `state_directory`, `profile_is_active`, `restore`). When the hook is active, it prints ~1k chars (~300 tok, inference). Those chars direct Claude to Read `SKILL.md` and `behavior.md`, about 11k chars (≈3k tok, inference), on every startup, resume, clear, compact and fork. No `.vibe-wise/` directory exists under `C:\dev\*\` or `C:\dev\*\*\`, so the hook has printed nothing so far.

| Candidate | Kind | Proposed address | Why it could fit | Why it might not | Copy / adapt / idea | Recommendation (*proposed*) |
|---|---|---|---|---|---|---|
| **Opt-in, silent-by-default hook** | hook | pattern for #14 / #18 | The model for any always-on pack piece: zero output unless project state opts in. It "Bootstrap[s] from source files … Output size is independent of the amount of learning history" ([hook][vw-hook]) | When active, it pays ~3k tokens of reads each time | idea | Adopt as the #14 pattern. It is caveman's mirror image |
| **Decision hand-back** | convention doc | idea for the fork's `grilling` / `to-spec` (#15) | "Ask for their approach and wait"; "Don't fill in consequential design choices on their behalf" ([behavior][vw-behavior]). It fits the owner's no-blind-picks way of working | In learning mode it is meant to slow work. Ordinary work wants it only for consequential choices | idea-only | Borrow the rule "consequential design choices belong to the user; the agent proposes" |
| **"Proposed additions" table** | convention doc | idea for `to-spec` / ledgers | At each confirmation: "Separate the learner's decisions from details you propose adding", using a **Detail / Proposal / Why it matters** table ([behavior][vw-behavior]). It surfaces silent fill-ins | — | idea-only | Strong small candidate. Consider it for spec and plan hand-offs |
| **Pending decisions survive compaction** | convention doc | idea for #16 / fork workflows | `progress.md` keeps a `## Pending decision`, and the hook repeats "Restarting or compacting is not approval" ([hook][vw-hook], [templates][vw-templates]) | Needs a local state file per project | idea-only | Note for long-running fork workflows (`implement`) |
| **Separate build, design and implementation approval** | convention doc | — | "Confirm and continue … does not authorize code changes" ([behavior][vw-behavior]): approving a design is not approving code | Overlaps the fork's spec → tickets → implement gates | idea-only | Owner's call |
| `learn` mode itself | skill | — | The owner can enable it when learning a new stack | Out of scope to recreate (map) | — | Keep it as an installed plugin. Nothing to carry |

[ks]: https://github.com/forrestchang/andrej-karpathy-skills/tree/2c606141936f1eeef17fa3043a72095b4765b9c2
[ks-skill]: https://github.com/forrestchang/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/skills/karpathy-guidelines/SKILL.md
[ks-claude]: https://github.com/forrestchang/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/CLAUDE.md
[ks-manifest]: https://github.com/forrestchang/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/.claude-plugin/plugin.json
[ks-readme]: https://github.com/forrestchang/andrej-karpathy-skills/blob/2c606141936f1eeef17fa3043a72095b4765b9c2/README.md#L99-L125
[cv]: https://github.com/JuliusBrussee/caveman/tree/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0
[cv-manifest]: https://github.com/JuliusBrussee/caveman/blob/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0/.claude-plugin/plugin.json
[cv-skill]: https://github.com/JuliusBrussee/caveman/blob/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0/skills/caveman/SKILL.md
[cv-activate]: https://github.com/JuliusBrussee/caveman/blob/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0/src/hooks/caveman-activate.js
[cv-tracker]: https://github.com/JuliusBrussee/caveman/blob/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0/src/hooks/caveman-mode-tracker.js
[cv-honest]: https://github.com/JuliusBrussee/caveman/blob/0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0/docs/HONEST-NUMBERS.md
[cvm]: https://github.com/JuliusBrussee/caveman/tree/2e08b9177c07bb7249a8a2d1a6758e5db281d002
[cvm-manifest]: https://github.com/JuliusBrussee/caveman/blob/2e08b9177c07bb7249a8a2d1a6758e5db281d002/.claude-plugin/plugin.json
[vw]: https://github.com/nykooi1/vibe-wise/tree/1135f4ae8205da78404a71e85f567d5911da4e4d
[vw-behavior]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/skills/learn/behavior.md
[vw-learn]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/skills/learn/SKILL.md
[vw-reset]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/skills/reset/SKILL.md
[vw-hooks]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/hooks/hooks.json
[vw-hook]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/hooks/session_start.py
[vw-templates]: https://github.com/nykooi1/vibe-wise/blob/1135f4ae8205da78404a71e85f567d5911da4e4d/skills/learn/state-templates.md
