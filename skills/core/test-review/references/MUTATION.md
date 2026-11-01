# Mutation results

How to read mutation results the project already has. A mutation tool changes production code one small edit at a time (a mutant) and reruns the tests: a mutant some test fails is killed; one every test passes survived. A survivor marks a place to look. Triage decides whether it is a gap.

## Before triage

- **Match the snapshot.** Results for an older revision, or for other files, describe other code. Say which mutants still apply to the reviewed code and that the rest are stale.
- **Inconclusive is not caught.** A mutant that timed out, crashed the run or produced no result is inconclusive: it shows neither that a test catches it nor that one is missing. Count these separately.
- **Not run is not survived.** A mutant on a line no test executes is a coverage gap; report it as one.

## Classify each survivor

Take the first class that fits, with the evidence it needs:

- **Unreachable**: no caller can reach the mutated code. That is a finding about the code, as an out-of-scope observation, not a gap in the tests.
- **Equivalent**: the mutant behaves exactly as the original for every input that reaches it. Claim this only after all five checks: what values the types allow; which inputs reach the line; where a differing value would be used downstream; a side-by-side reading of both versions; and an honest attempt to build an input that tells them apart, which failed. When any check is uncertain, the survivor is **unresolved**, not equivalent.
- **Not caller-visible**: the change touches only what no caller relies on (log wording, debug output). Say what it touches and why nobody relies on it.
- **Gap**: a caller-visible change the tests miss. Report it as a mutation-survivor finding: the mutant, the input that exposes it, and the bug it would let through.
- **Unresolved**: anything you cannot settle by reading. It goes in the declined-to-judge slot, with what would settle it.

## Rating survivors

- **Rate the change, not the neighbourhood.** A gap's severity comes from what that specific mutant would do to a caller, never from how risky the surrounding module feels or how many survivors sit near it.
- **One cause, one finding.** When one weak assertion or one untested branch lets many mutants live, report the cause once and list the mutants as its instances.
- **Results are a tool finding**, read after your own judgement as `reviewing`'s evidence rules require. Rerunning the tool is the owner's check, never part of the review.
