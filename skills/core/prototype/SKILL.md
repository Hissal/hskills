---
name: prototype
description: "Build a throwaway prototype to answer a design question. Use when the user wants to check a state model or logic, explore what a UI should look like, or try how something works in use."
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/prototype"
  opencode/autoinvoke: "true"
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

Project facts come from project configuration: the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. `verifying` is named below for its status words, not as a requirement: when it is not installed, use the word as defined here.

## Write the brief

Before any code, write the brief:

- **Question**: the one design question the prototype answers.
- **Dimension**: what is being tested, such as how it looks, whether the state model holds, or how it feels in use.
- **Keep-if**: the result that keeps the idea.
- **Kill**: the result that drops it.

Ask the user for anything you can't infer; when they are away, write your best reading and mark it as an assumption. The brief goes at the top of the prototype and, when there is one, in the draft PR.

Then settle the draft PR (see [Place and capture](#place-and-capture)): when project configuration says always or never, follow it; otherwise offer it to the user once, now.

## Pick a branch

Identify which question is being answered, using the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a single shareable HTML file (free-play buttons plus tabbed guided walkthroughs) that pushes the state machine through cases that are hard to reason about on paper, and that a non-developer can drive.
- **"What should this look like?"** → [UI.md](UI.md), the default for a web UI. Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

Read exactly one branch reference. The two branches produce very different artifacts, so getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Pick the medium

Build in the cheapest medium that still tests the brief's dimension for real. A static mock answers how a layout reads but fakes how a drag feels; a state panel answers whether the rules hold but fakes how fast a screen responds. When a cheaper medium would fake the dimension, step up to the one that doesn't.

A single-file prototype stays strict: no build step, no library, everything inline, so it works offline.

For *where a prototype lives, how it runs and is removed, and which medium fits this stack*, ask the pack guides this project lists; carry on silently when none answers. With no pack listed, the branches apply as written.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious, but name it so a casual reader can see it's a prototype, not production. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.
2. **Trivial to run.** A UI prototype starts from one command in the project's task runner: `pnpm <name>`, `python <path>`, `bun <path>`, etc. A logic demo is a single HTML file the user double-clicks. Either way, no thinking required to start it.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE, wipe me" name.
4. **Skip the polish.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. The point is to learn something fast.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Capture it when done.** Fold any validated decision into the real code, then capture the prototype itself as a **primary source** on its throwaway branch, as [Place and capture](#place-and-capture) describes. Capture the answer too (the verdict and the question it settled). The main branch keeps only the validated decision.

## Place and capture

**Place.** Before the first file, create the throwaway branch, named by the repo's branch convention, and place the prototype near its code on that branch. When the checkout holds unrelated uncommitted work, create the branch in a separate worktree instead.

**Draft PR.** When it applies, push the branch at the first commit and open a draft PR to the default branch. Title it by the repo's convention, marked as a prototype. The body carries the brief, says the PR never merges, and says how to run the prototype. Update the PR as the prototype changes.

**Capture.** Commit the prototype to its throwaway branch and push that branch: the main branch and an archive folder never hold it. Then return to the branch or worktree where work started. The verdict records the question it settled and whether the keep-if criteria were met. Put it on the implementation issue with a context pointer to the draft PR, or to the branch when there is no PR. With a draft PR, record the keep-if result in it too and close it unmerged; the branch stays as the record.

## Hand-over check

Check every HTML prototype in a browser before you hand it over: open it, reach the first actionable screen, press each main action, run each walkthrough or switch each variant, take screenshots, and read the console. Fix what fails and check again. The check is done when every main action, walkthrough and variant has run and the console shows no error the prototype caused.

With no browser tool, hand it over reported as **unvalidated**: `verifying`'s word for a claim no run backs.

## Share it

A prototype stays local to the user by default. When the user asks to share it, use the sharing route project configuration names; with none configured, ask which route to use. The pushed throwaway branch always works as a fallback.

## Reach the verdict

Test-drive the prototype against the brief: its question, then each keep-if and kill criterion. The user's own reactions while driving it are the strongest evidence.

## Port it

Before rewriting a prototype in another language, write a semantics summary: the guarantees it makes, which choices were deliberate and which incidental, and what won't translate. Confirm it with the user, then use it as the rewrite's spec.

## Suggest at the stopping point

At handback or the verdict, offer a follow-up only when its condition was observed here, giving the concrete reason and the invocation. Each one offers; none runs:

- `/break-ui` at handback, after the hand-over check, when observed behaviour exposes broader risk from extreme content, layout constraints or failure states beyond the current checks. Name the weakness and the conditions that exposed it.
- `/wayfinder` when several connected decisions have an unresolved shape that exceeds one session. Name the destination and the blocking decisions, and finish the independent work that is useful now.

Repeat an offer only when circumstances change materially. With no condition observed, end without one.

When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.
