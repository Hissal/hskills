# Testing a document

The testing branch of [`writing-for-agents`](SKILL.md): how to learn from running a document on an agent. How to set up and count the runs (the bar, the fixture, the arms, the repetitions) belongs to the project's behavioural eval procedure when it has one; follow that for the runs, and this reference for reading them and acting on what they show.

## Read transcripts, not only outputs

The output shows what the agent produced; the transcript shows how it got there: which files and references it read, which pointers fired, which steps it skipped or reordered, where it hesitated or backtracked. Read every transcript end to end. A run whose output passes while its transcript shows it never read the document passed by luck, and two runs with the same output can take different paths through the document; that difference is the variance you are testing for.

## Bundle any script every run rebuilt

When the transcripts show the agent writing the same helper in run after run (a parser, a detection command, a formatting script), the document is missing that script. Bundle it beside the document and point to it, by the script rules in [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md). Every run then spends no tokens rebuilding it and no variance on rebuilding it differently.

## Classify a failure before rewriting text

A failing run is not yet evidence against the text. Give it one class first:

- **Fixture**: the scenario or the bar is wrong: an ambiguous prompt, a bar that rewards the wrong thing, other loaded material leaking guidance. Fix the fixture.
- **Harness**: the run never tested the document: a permission or sandbox denial, a tool error, a timeout, the document missing from what the harness loaded. Fix the setup.
- **Routing**: the agent never reached the material, because the pointer to it did not fire. Sharpen the pointer's wording.

Only a run where the agent read the material and still missed the bar is a fault in the text. Rewrite the text then, and rerun against the unchanged bar.

## Reader Testing

Before handing a document over, test it on a reader who has only the document:

1. **Predict the reader's questions.** Write down what the agent will need to know at each step: where to start, what done looks like, what to do when an input is missing or a step fails.
2. **Give a fresh subagent only the document.** No conversation history, no summary of your intent, no hints in the prompt: the document and the questions, or the document and the task. Compare its answers with yours.

Each wrong or missing answer marks a place where the document leaned on context only you held. Fix the document, never the prompt, and test again with a new subagent.
