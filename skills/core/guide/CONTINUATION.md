# Continuation

How to answer when the owner asks how to carry the work on: continue here, clear the context, hand off, delegate or compact. You recommend the move; the owner makes it. Never run a clear or compact command, start a thread or a subagent, or invoke `/handoff` yourself.

A **phase** is a chunk of work inside a session: the grilling, the implementation, the QA. It ends when the owner would say "ok, we're done with that". The **phase boundary** is the gap between two phases, and it is the only place this decision belongs. Mid-phase there is no decision to make: continue, or split the work that's left into subagents. Compacting mid-phase makes the agent lose the thread. When the question comes mid-phase, say so and recommend continuing.

## The five moves

| Move | What it does | Recommend |
|---|---|---|
| **Continue** | Stay in this session. No context switch at all. | No invocation: carry on here. |
| **Clear** | Empty the context window and start from nothing. | The host's own command: `/clear` on Claude Code; elsewhere, its command for a new conversation. |
| **Hand off** | Write a document that seeds another session, thread, harness or person. | `/handoff`, with the destination below. |
| **Delegate** | Send a task to its own context window and get a result back. | `/handoff subagent`. |
| **Compact** | Compress this context in place, keeping a summary. | The host's own command: `/compact` on Claude Code, with an instruction for what to keep. |

`/handoff` has these forms; read its file (step 5 of the guide) before writing the invocation, since it defines the argument grammar:

- **Continuation document** (plain `/handoff`): written to a file, ending with one copyable resume line for a fresh session anywhere.
- **`thread`** (`/handoff thread`): starts a fresh top-level conversation seeded with the document.
- **`subagent`** (`/handoff subagent`): hands the document to a subagent as its brief; the result comes back to this thread.
- **Work brief** (`/handoff brief <what>`): a brief for a teammate or for parking the work, recorded in the tracker or a file.

After `thread` or `subagent`, `/handoff` takes an optional harness, model and reasoning level, such as `/handoff thread codex high`; add them only when the request names them.

## Assess the context available

Judge from the context actually available, never from a fixed size. In order:

1. **The host's indicator.** When the host shows you how full your context is, use that.
2. **What is visible.** Otherwise judge from the conversation itself: how much of it the next phase needs, whether a compaction has already happened (a summary standing in for earlier turns), and whether the next phase's primary sources (the spec, the issue, the diff, the files) can simply be re-read from disk.
3. **The owner's indicator.** When neither settles it, ask the owner to check the context indicator their own tool shows, and let that decide question 1 below.

## The tree

Work top to bottom at the boundary. The first **yes** wins.

1. **Can you continue in this session?** Yes when the next phase needs this phase as a **primary source**, or when the assessment above leaves room for the next phase to fit. Grilling → implementation is the standard yes: the implementation wants the reasoning verbatim, not a summary of it. Continuing costs nothing and loses nothing, so rule it out before anything else.
2. **Is the context irrelevant to what comes next?** If everything in this session (the exploration, the decisions, the dead ends) is disposable, **clear**. It is the cheapest move: it takes no time and hands back the whole window. The cost of getting this wrong is one-way: clear a relevant context and the **why** behind what was built is gone, and reading the diff back does not return it.
3. **Does the work travel?** Hand off when it moves to a **new harness**, a **new directory** or repo, a **colleague** (a work brief), or is **parked** for later (a work brief), or when a side task found mid-phase should leave without derailing this one. Plain `/handoff` gives the resume line for a fresh session; `/handoff thread` starts that session for the owner. What a handoff buys is a document that travels; if nothing travels, the next question decides.
4. **Can the task run without steering?** When it is scoped tightly enough to finish with the owner away and nothing in this session needs their input meanwhile, **delegate** it with `/handoff subagent` and leave this session untouched. An automated review is the standard case.
5. **Otherwise, compact.** Relevant context, same harness, same directory, and the owner needs to stay in the loop: the tree lands here often. Recommend an instruction with it (`/compact we're going to QA this area`) so the summary keeps what the next phase needs. When a decision the summary might flatten would be costly to get wrong, offer `/handoff thread` as the alternative: its document records decisions and how each was known, where a summary may not.

Compact is the **default, not the first reach**. It sits at the bottom because the four questions above it are all cheaper or more precise. The failure when people start here is a fresh session that is confidently wrong about a decision the summary flattened.

## Primary and secondary sources

Every move except **Continue** turns a **primary source** into a **secondary source**: the session as it happened, replaced by a summary or a document about it. The trade is always the same shape:

| Source | Information | Noise | Room to move |
|---|---|---|---|
| Primary (continue) | Full | Lots | Little |
| Secondary (compact, hand off, delegate) | Lossy | Less | Lots |

This is why question 1 comes first: pay the lossiness only when staying costs more than it saves. A primary source that sits on disk is not lost by moving; one that lives only in this conversation is.

## Answer

Answer in the guide's template. **Recommended** is the move the tree reaches, with the question that decided it and what you judged the context from. For continue, write the move in words; for clear or compact, give the host's command and say no skill file backs it; for a handoff or delegation, give the `/handoff` invocation and describe it from its file. Name the runner-up under **Alternatives** when the boundary could go either way: these are judgement calls, and the same boundary can go two ways on two days. The value is in asking the questions **in order**, at the boundary rather than in the middle of the work.
