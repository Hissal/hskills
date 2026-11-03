# Guard extensions

Project guard extensions are extra blocks for the command guard. A pack's `SETUP.md` offers them, and the guard rules decide what they may do: they can only add blocks, never loosen the core rules. This skill records the selection. It writes no rule of its own.

## Record the selection

1. Show each offered case with what it blocks, and ask which to add. The default is none, so a declined offer writes nothing.
2. Add the selected rules to `.agents/config/command-guard.json`. The guard reads this file, so this fact lives in the configuration folder rather than `docs/agents/`. Keep every rule already there, and skip a rule whose `id` is already present.
3. A new file takes this shape, with the rules exactly as the `SETUP.md` gives them:

   ```json
   {
     "$comment": "A missing field means the owning skill's default.",
     "rules": []
   }
   ```

4. Parse the file after writing and confirm `rules` is an array. A malformed file stops every covered command in the project, so restore the previous contents if the parse fails, and report it.
5. Add the `### Guard extensions` sub-block: one line naming the file and the cases it adds.

On a re-run, offer only the cases of a pack selected since the last run. Removing a recorded rule happens only when the user asks. Whether the guard is installed changes nothing here. The final report says so when you can see it is not.
