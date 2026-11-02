# Threat model

Controls bolted on without a threat model are guesses. Model the threats while the design is still open, so each control lands in the interface instead of on top of it. A threat is argued from evidence, not asserted, and every threat ends in a control and a test.

Done when every trust boundary the design crosses is named, every threat on it has an attacker path with evidence or a named gap, and the trace table has one row per threat. If you can't name the trust boundaries for a feature, you're not ready to secure it.

For *this stack's threats, controls and checks*, ask the pack guides this project lists; add each threat, control and check that answers to the model below as its own row, and carry on silently when none answers.

## 1. Assets

What's worth stealing or breaking? Credentials, personal data, payment data, admin actions, money movement. Count integrity (data an attacker could change) and availability (a resource or bill an attacker could exhaust) as assets too.

## 2. Actors

Name everyone who can act on the design: anonymous callers, signed-in users, other tenants, operators and admins, third-party services, other processes on the same machine, and agents or tools acting on model output. For each, record what they control and what they are allowed to do. An actor's allowed actions are the starting point of every attacker path that actor can take.

## 3. Trust boundaries

A trust boundary is where a value written by one actor reaches code that acts for another. Where does untrusted data cross into your system? Requests, messages and queues, uploaded files, callbacks from third-party services, stored data another actor wrote, and **LLM output**, plus the local values that look internal because the OS handed them to you: another process's command line or environment, filenames on a shared volume, a path in a job payload. Trust follows who *wrote* a value, not which channel delivered it. Every boundary is attack surface.

For each boundary, name what crosses it, who wrote it, and the seam where the design first acts on it. Then ask each question below at that boundary, as a quick lens, not a ceremony:

| Threat | Ask |
|---|---|
| **S**poofing | Can someone impersonate a user/service? |
| **T**ampering | Can data be altered in transit or at rest? |
| **R**epudiation | Can an action be denied later? |
| **I**nformation disclosure | Can data leak? |
| **D**enial of service | Can it be overwhelmed? |
| **E**levation of privilege | Can a user gain rights they shouldn't? |

## 4. Threats

Record each threat with these fields:

- **Attacker path**: one chain. Who the attacker is, what they control, the privileges and preconditions they need, the control they get past, and what they gain (data read, data changed, service denied, code run). An attacker who already holds what they would gain has no path.
- **Evidence**: what shows the path exists, with file and line, configuration key or document section.
- **Counterevidence**: what would make the threat false: validation, a type that cannot hold the bad value, an authorisation check, a framework default, deployment configuration. Cite each one and confirm it covers this input on this path. When you claim none exists, say how far you searched.
- **Assumptions**: what the threat takes as true that nobody has checked, such as a deployment setting, a caller's behaviour or an upstream guarantee. An assumption is a named gap, never evidence.
- **Freshness**: the commit or date the evidence was read at. When the code or configuration behind that evidence changes, re-read it; until then, treat it as an assumption.

### Attack trees (optional)

For a threat that takes several steps, draw a qualitative attack tree. The attacker's goal is the root; each node's children are the steps that reach it, joined by AND (every child needed) or OR (any child suffices). Label each step with its evidence or its assumption. Use no numbers: no probabilities, costs or risk scores. One control on an AND child blocks its parent; an OR node stays open until every child is blocked.

## 5. Threat → control → test

Trace every threat in one table:

| Threat | Control | Test |
|---|---|---|
| The attacker path, in one line | What stops it, and where it sits in the design | What shows the control holds |

- **Control**: place it at the seam the untrusted value crosses, inside the module's interface, so every caller passes through it. A control each caller must remember to apply has split ownership; move it behind the interface.
- **Test**: write abuse cases next to use cases. For each feature, ask "how would I misuse this?", then make that your first test. The test drives the attack input through the interface and expects it rejected or neutralised, beside a legitimate input that still works. It fails when the control is removed.
- **Gaps**: a threat with no control or no test keeps its row, with `none` in the empty cell and the reason beside it. Every gap stays visible in the table.
