# Assessing a security finding

A security finding is a claim that someone can make the code do what it must not. Confirm or refute it on evidence: an unsafe-looking call is a lead, not a verdict. Done when all five steps below carry evidence or a named gap, and the finding has one verdict: **confirmed**, **refuted** or **inconclusive**.

Ask the project's listed pack guides for this stack's threats, controls and checks.

The assessment stays inside the caller's job. A read-only caller reads code and states the check it would run; it runs or writes nothing. Any input you run goes to the project's own local or test setup, never to a live system or a third-party service.

## 1. Reachability

Trace untrusted input from where it enters (a request, a message, a file, an argument, stored data someone else wrote) to the flagged code, at the revision the finding concerns. Name the source, each hop and the sink with file and line. Code nothing untrusted reaches is not exploitable today; say who can call it, and treat a public API of a library as reachable by its consumers.

## 2. Attacker path

Tell the attack as one chain: who the attacker is, what they control, which privileges and preconditions they need, which control they get past, and what they gain (data read, data changed, service denied, code run). An attacker who already needs the capability they would gain has no path.

## 3. Counterevidence

Look for what would make the claim false: validation, parameterisation, encoding, type constraints, an authorisation check, a framework default, deployment configuration. Cite each control's line, and confirm it covers this input on this path; a control on a sibling path protects nothing here. When you claim no control exists, say how far you searched.

## 4. Sibling bypasses

Find the same root cause elsewhere: other entry points into the same sink, other representations of the same input (another encoding, an alternate route, an older API version), other sinks fed the same way. Start from the known instance, vary one feature at a time, and record what you searched and ruled out. Judge whether a proposed fix closes the shared boundary or only this site.

## 5. Negative control

Show that the check tells the cases apart. A malicious input is rejected or neutralised, and a legitimate input still works. For a confirmed finding, a test or reproduction fails before the fix and passes after it. For a refuted finding, the attack input is shown to be handled safely. When you cannot run it, state the exact control you would run and record its absence as a gap.

## Verdict

- **Confirmed**: a reachable path, an attacker who gains something, and no control that holds. A negative control that a read-only caller could not run is a named gap; on its own it does not make the finding inconclusive.
- **Refuted**: the path is unreachable, the attacker gains nothing, or a cited control holds for this input; the negative control agrees.
- **Inconclusive**: anything short of either, with each gap named. An inconclusive finding stays open; a missing proof never turns it into refuted.
