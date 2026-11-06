# Which values a run really used

A measurement is about the values the run used, and an edited default is often not one of them. Done when each value the claim depends on is named with where it came from, and the context below sits with the observation.

## What supersedes an edited default

- **Serialized data.** A C# field initializer only seeds a newly created instance or a field the object has not saved. Anything already saved keeps its value, in this order of winning: the scene or prefab instance override, then a prefab variant, then the prefab or asset. Read the override in the scene or prefab YAML: `propertyPath` and `value` under `m_Modifications`.
- **Runtime writers.** Code that sets the value after load: bootstrap code, tuning overlays, save-data restore. `unity-debugging` traces these, and owns how to measure.
- **Remote configuration.** A fetched value can replace any of the above, and differs per environment and over time.

## Establish it

1. List the values the claim depends on and each candidate source above.
2. Observe the value in the run: a probe log, a read in Play mode, a test assertion. File reading says what should load; only the run says what did.
3. State the result as `Ran with <field> = <value> from <source>`. When that is not the edited value, say the edit did not reach this measurement. A flat result is then no evidence that the change has no effect, and a real effect needs a run that uses the new value.

Changing an override, prefab or remote value to make the measurement move is the owner's decision: report it as the next step.

## Pick evidence that includes the change

The run has to exercise the engine behaviour the change touched, in the build kind it ships in. Editor numbers say nothing about a Player, and scripted state says nothing about real input. Use [Choose the check](../SKILL.md#choose-the-check) to name what the evidence is.

## Record with the observation

- The scene or content the run loaded.
- The Unity version and package versions.
- The build kind and backend, or that it ran in the Editor.
- The configuration: overrides, remote values, feature flags.

An RNG seed is one recorded input and no guarantee of identical execution: frame timing, physics and order of execution still vary.
