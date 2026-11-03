# UI worst cases

A fixture and evidence checklist for a Unity UI: what to exercise, and what the result may claim. The official `ui-uitk`, `ui-ugui` and `localization` skills own building and configuring the UI. The caller owns the workflow and the report; this file adds the conditions and the evidence labels.

The checklist is done when every item ends as **exercised**, **not exercised** with the reason, or **unsupported** with where the product says so. Read support from the product's docs, Player settings and localization settings. When they do not settle an item, it is not exercised and the report says the support is unknown.

## The real UI

- **Target.** The actual scene, prefab or Editor tool, in the UI stack it ships with.
- **Execution.** The project's configured execution: `docs/agents/check-commands.md`, and `unity-verification` when installed. With nothing that can run it, every finding is inferred and the report says so.
- **Data.** Load it through the live binding, the path production data takes. A value typed into a text component tests the typing.
- **Timing.** Layout resolves after the data changes, so a reading taken straight after binding can show the old layout. Force the rebuild in uGUI (`LayoutRebuilder.ForceRebuildLayoutImmediate`) and wait for the panel's layout pass in UI Toolkit (`GeometryChangedEvent`). Check once after the first layout and again after a data update at the same viewport: a row added and removed, a string changed.

## Fixture

**Viewports:**

- The widest and narrowest supported aspect ratios.
- The smallest supported viewport.
- Safe-area cutouts.
- Each supported UI-scale setting and split-screen layout.

**Data in the live bound UI:**

- The longest real string in each supported locale.
- Names with no break opportunity.
- The largest numbers, formatted as the UI formats them.
- The densest collection the product allows.
- CJK and RTL text only when the product ships those locales.

## Look for

After layout and after each data update, in both UI Toolkit and uGUI:

- **Wrapping:** a line break that hides or misleads, or a string that cannot break.
- **Clipping:** text or a control cut by its container or a mask.
- **Missing glyphs:** look at the rendered text. Layout numbers cannot show a missing glyph.
- **Scroll reachability:** scrolled to the end, the last item is fully on screen. Its presence in the hierarchy shows nothing.
- **Overlap:** one element drawn across another, or covering a control.

## Focus

Where the product supports a controller or keyboard, traverse with each, and read which element holds focus after every step: `EventSystem.currentSelectedGameObject` in uGUI, `focusController.focusedElement` in UI Toolkit. While a UI Toolkit element holds focus, the `EventSystem` reports only the panel's object.

- Every control can be reached, in a sensible order.
- An offscreen selection scrolls into view.
- A disabled control is skipped or says why it holds focus.
- Removing the selected item leaves focus on a live control.
- A popup takes focus when it opens, and takes it again when it reopens.
- Closing a popup returns focus to what opened it.

Use the input the project already has: real devices at hand, or its existing input tests. With no such means, a throwaway script may set a selection and read its navigation links (`Selectable.FindSelectableOnDown`), as injected state. List each focus item still without input as not exercised, with the steps for a human run. An input harness built to complete this checklist is out of scope.

## Evidence

Label every result with how it was driven, in the caller's report format: a column, or a label on each row. Observed or inferred does not say this, so these labels sit beside them.

- **Injected state:** code set the data or the selection, or sent synthetic events. Worst-case data bound by a script is injected state. It shows how the UI responds to that state, not that input can reach it.
- **Actual input:** input went through the project's real input path, from a device or an existing project test. Give the sequence and the focus after each step.
- **Human run:** a person operated it. Give who ran what, and what they reported.

Say in the result that **screenshots alone cannot establish navigation**: a screenshot shows one frame, not how focus got there or where it goes next.

Name where each result ran: Editor, Player or device. The Game view and Device Simulator are Editor evidence, and a safe area there is simulated. Claim device behaviour only with a run on that device or a Player for that platform, naming it. Otherwise the result says `Device behaviour: not established`, and what would establish it.
