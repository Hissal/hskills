---
name: blast-radius
description: "Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code instead of writing it up. Use for 'blast radius of X', 'what could this break', or reviewing a small diff you don't trust."
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/blast-radius"
  agent-skills-sync.requires: '["hissal.skill-collection/verifying"]'
  opencode/autoinvoke: "false"
---

# Blast radius

Find what a change breaks somewhere else, before it ships. Use for "blast radius of X", "what could this break", or reviewing a small diff you don't trust yet.

Listing the callers is not the job. The agent can grep those in a second. The job is the breakage grep won't show you.

Before doing any work, load verifying (hissal.skill-collection/verifying) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill verifying (hissal.skill-collection/verifying) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Done when every consumer and effect outside the diff that you found is either a risk or cleared, each with its evidence; the one fact the change is safe because of has run in code on a named tree or is marked **unvalidated**; every claim carries its rung on verifying's [evidence ladder](../verifying/SKILL.md#evidence-ladder); and every place you did not search is named with the reason.

The change is what the human names: a diff, a branch, a commit or a pull request. With nothing named, take the working tree and the branch against its base. You examine the change and report on it; the change itself stays as it is.

## Don't trust your own writeup

A blast-radius writeup that sounds right is worthless. It reads as convincing whether or not it's true. So don't hand back the writeup. Find the one or two facts the whole thing depends on and prove them by running code.

### How sure are you

For each claim about what the code does, and above all each fact the change's safety depends on, get it as far up verifying's [evidence ladder](../verifying/SKILL.md#evidence-ladder) as is cheap, and say where it stopped: the rung it reached and verifying's status word. A fact shown only by reading stays below "ran it", however convincing the reading.

"Ran it" is usually one small script that imports the same library the project ships and calls the exact function you're worried about.

## Steps

1. Read the change. The diff, the symbols it adds, changes, and deletes, and what it now does differently, including the part the diff doesn't spell out. When a pull request or commit messages came with the change, read them as well.
2. Find the one fact it's safe because of. Most changes that look risky are safe because of a single fact, like "this call only drops already-dead cache entries and does nothing else". Find that fact and write it as one sentence a run could show to be false. If it holds, most risky cases are cleared at once. Spend your time here, not on a long list of maybes.
3. Look where grep stops. Read the source of the library you call, and check its pinned version and any local patch. Work out when things run: callbacks and deferred work, ordering between asynchronous steps, startup, shutdown and teardown, retries, and code that runs twice or never. Follow what a symbol search misses: the JSON an API returns, a DB column, a wire format, a cache or queued message, another language reading the same bytes, a configuration key, a string or reflection lookup, a feature flag, code three hops downstream, other repositories and published users you cannot see. Ask the project's listed pack guides for *what a change can break outside the diff for this stack*, and search the places the answer names as well; when no guide answers, carry on with this step. Name every place you did not search, with the reason.
4. Be honest about each risk. Give it a real chance of happening and a real cost if it does. Keep the risks you confirmed. List the ones you checked and cleared separately. Cite a real `file:line`, in the project or in the library's source at the version in use. A search that finds nothing is still an answer: record the query and the paths it covered. Never make up a caller or an API.
5. Prove the one fact. Write a script or test that runs the real code and fails loud if the fact is false, run it, and paste what happened. Capture the run by verifying's rules: the command, the tree it ran on and the real exit code. Keep the script outside the change, in a scratch location, unless the owner chooses to keep it as a test. When the fact cannot be run (no runtime available, or the code needs a live system you cannot reach), mark it **unvalidated**, give the highest rung it reached, and say what a run would need. When a run is cheap, prove the risks that matter most the same way.

## What to hand back

- **What it does.** What changed, including the part that isn't obvious.
- **The one fact it's safe because of.** State it, give its rung and status word, and show the proof (command, tree, exit code, output). If you couldn't run it, write **unvalidated** and why.
- **Risks.** Each names how it breaks, the `file:line`, how likely and how bad, how to check, and its rung. Paste the proof for the ones that matter.
- **Cleared.** What you checked, why it's fine, and its rung.
- **Before you merge.** The cheapest test or repro that catches the real bug, including the script you wrote.
- **Not searched.** Each place you left unsearched, and why.

Cite real code, and strip anything private (credentials, internal hosts, customer data) before it goes anywhere public.

**Reply:** the writeup above, with the one safety fact either verified by a run or marked **unvalidated**.

When the owner chooses to defer the remaining investigation or pass it to someone else, and the evidence gathered so far (traced consumers, the proving script, dependency reading) would be costly to rebuild, offer `/handoff` with that reason. The owner starts it; you never run it.

When you run for a parent agent, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.
