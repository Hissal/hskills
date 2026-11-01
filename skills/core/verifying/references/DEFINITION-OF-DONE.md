# Definition of done

One fixed bar, the same for every change, checked before anyone says done. A task's acceptance criteria ask whether this is the right thing; this bar asks whether it is finished. Done needs both, and deadline pressure does not move the bar.

Ship and release claims add the project's ship-readiness answer from its pack guides (step 2 of the skill) on top of this bar.

## Correctness

- Every acceptance criterion of the task is checked against the diff or a run.
- The changed behaviour was seen running; a compile or type check alone does not show it.
- When the change alters behaviour, a test for the new behaviour went red before the change and green after it.
- The existing checks that cover the change are green on the final tree.
- The failure paths and boundary inputs the change touches behave correctly too.

## Scope

- The diff is the task's change only: leftovers from the work (debug prints, unused code, disabled blocks) and drive-by refactors are gone.
- A pre-existing failure stays out of the change; it is recorded or settled as the skill's red-check step says.

## Integration

- The change was exercised together with the code that calls it and the code it calls.
- Any migration, configuration or flag the change depends on ships with it.
- Existing consumers of a changed public interface still work, or the break is stated.

## Documentation

- Public interfaces and user-facing behaviour are documented as they now are.
- A decision worth keeping is recorded where the project records decisions.

## Evidence

- Every claim in the handback carries a status word and names its tree.
- The floor guard ran on the final tree, or the report says none is configured.
- What was not checked is named, with the reason.
- A change that needs a person's approval before merge or release has it, or the handback says it is pending.
