# Behavior Prototype

A **working thing in a form like the real one**: a single, self-contained HTML file that someone can pick up and use within seconds, or start and watch run. Use this when the question is about **how something behaves in use, or left to run**: how an interaction feels, what a process does over time, whether the rules still hold when real input arrives in a real order.

It is the Logic branch with a real face. The model is the same pure module, in the same single file; what changes is the page around it, which looks and responds like the real thing instead of a panel of buttons.

## When this is the right shape

- "Let me try how drag-to-reorder feels before we build it."
- "What does this queue do after ten minutes of steady traffic?"
- "Is the turn order in this board game still fair when one side keeps passing?"
- Anything where someone wants to **use it, or leave it running, and see what happens**.

If the question is whether the rules themselves are right, stepped one action at a time, use [LOGIC.md](LOGIC.md). If it is "what should this look like", use [UI.md](UI.md).

## Process

### 1. Write the module the Logic way

Read step 2 of [LOGIC.md](LOGIC.md) and build the module exactly as it describes: pure, deterministic, its state plain data, the seed and the clock coming in as inputs. Behavior adds two things the module answers:

- **What can be done now, and why not**: a pure function from state to every action with whether it is allowed and, when it is not, the reason in domain language.
- **Time**, when something moves on its own: a `tick` action carrying a fixed time step. Each tick advances the model by that step, so a run is the same sequence of ticks wherever it plays.

### 2. Build the working thing

One file, plain HTML/CSS/JS, under the same single-file rule as every prototype: no build step, no library, everything inline, so it opens offline by double-click.

- **A form like the real one.** Render the model the way the real thing will look and respond: a list that drags, a form that fills, a queue that drains, a board with pieces on it. Rough is fine; recognisable is required.
- **Usable within seconds.** It opens on the working thing, already in a sensible starting state, with the obvious first action in view. The brief sits at the top, collapsed to one line that expands.
- **One action map.** Every input from outside the module (clicks, drags, keys, timers) goes through a single table that turns it into an action and calls `dispatch`. No handler touches the module or the state directly, so the person, the run controls and the agent all drive the same path.
- **What can be done now, always visible.** Render the module's allowed actions: available ones look available, the rest are shown disabled with their reason beside them. An input the map rejects shows its reason where the person is looking, never silently nothing.
- **Run controls** for anything automated: play, pause, step (one tick) and speed. Speed changes how often ticks are sent, never the step each tick advances, so a run at four times speed reaches the same states as one at normal speed.
- **The seed, always shown** in a corner of the page and editable: setting it restarts from the initial state with that seed.
- **A debug panel behind a toggle or menu**, closed by default so it stays out of the way: the full state as a labelled panel, the knobs, and the Copy state button. The `prototype` object with `getState()` and `dispatch(action)` is there whether the panel is open or not.

### 3. Add variants, then knobs

Build the bottom bar and the knobs as the SKILL's [Variants and knobs](SKILL.md#variants-and-knobs) describes. Variants come first; here a variant can be a different rule (two ways to resolve a conflict) or a set of knob values (a calm and a busy traffic pattern). Knobs reach what the variants can't, from the debug panel.

### 4. Hand it over

Run the skill's hand-over check, which applies to this file in full. The main actions include each run control and each input in the action map. Then send the file, or open it for them. The interesting moments are the ones where using it surprises them ("I expected it to snap back", "it jams after a minute"): those are the bugs in the _idea_. If they want a new rule or a new knob, add it.

### 5. Capture the answer and the prototype

Capture the answer, then the prototype, the way the [SKILL](SKILL.md) describes. As in the Logic branch, the validated module lifts into the real code; the working page stays on the throwaway branch as the primary source, and replays exactly from its seed there.

## Anti-patterns

- **Don't let time or chance in through the side door.** The module reads the clock and the seed only from its inputs; a frame timer's real elapsed time or a stray `Math.random()` makes a run impossible to replay.
- **Don't wire inputs straight to the state.** A handler that edits state outside the action map is a path the agent can't drive and the replay can't repeat.
- **Don't hide why something can't be done.** A greyed-out control with no reason leaves the person guessing whether it's a rule or a bug.
- **Don't polish the look.** Like the real thing, not finished: the question is how it behaves.
- **Don't reach for an engine, framework or library.** If the behaviour can't be tested for real in one plain file, the medium is wrong: step up as the SKILL's medium rule says.
