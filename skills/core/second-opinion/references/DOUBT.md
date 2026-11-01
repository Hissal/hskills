# Doubt mode

Challenge a claim or decision until it holds, changes or reaches the owner: extract, doubt, reconcile, at most three cycles.

## Extract

State what is under doubt, apart from the case made for it:

- **Claim:** one sentence, neutral: what is asserted or decided, stated so it could be false.
- **Premises:** each thing that must be true for the claim to hold, numbered.
- **Material:** what the claim rests on, by path or quotation: code, output, documents, constraints. Capture changing material (command output, a diff) once, into a file in the OS temp directory, and send that same file every cycle.

Leave out the reasoning that produced the claim: the reader judges the premises from the material, not from the argument.

Done when the claim is one sentence and every premise points at material the reader can open.

## Doubt

Send the claim, premises and material through steps 3 to 5 of `SKILL.md` with this ask:

> Doubt this. For each premise, give the strongest evidence that it is false, quoting the material. Name one premise you think is wrong and what evidence would prove you right. Say what would settle each doubt you raise.

The mode's required answer in the return shape is **Wrong premise:** the premise and its evidence, or "none found" with what was checked.

Each cycle is a new dispatch to the same resolved reader, in a fresh context, with the current claim. An incomplete read ends the cycles: report it as step 5 of `SKILL.md` says.

## Reconcile

Check each doubt against the material yourself, then sort it, first match wins:

1. **Misread:** it rests on a misreading of the claim or the material. Answer it with the quote that shows the reading.
2. **Actionable:** the evidence holds and the claim or a premise must change. Write the change.
3. **Trade-off:** the evidence holds, and the choice between the costs is the owner's.
4. **Noise:** it cites no evidence and changes nothing.

**Doubt theatre:** a doubt that changes nothing and cites no evidence is noise, however forceful it sounds. It does not count as a cycle's result. A cycle whose doubts are all noise or misreads leaves the claim standing.

## Cycles

Run another cycle only on the changed claim, after an actionable doubt. Stop at the first of:

- the claim stands: no actionable doubt this cycle;
- a trade-off is open for the owner;
- three cycles have run.

Report each cycle in order, as step 6 of `SKILL.md` gives it: its dispatch summary (the first cycle's in full, later ones by what changed), the reader's output verbatim, then each doubt's sort with its evidence. After the last cycle, give the claim as it now stands, then the one recommendation line.
