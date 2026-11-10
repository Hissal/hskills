---
name: review-caller
description: Use when asked to review src/sum.js with a second reader.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/eval-review-caller"
---
Have one fresh-context reviewer read `src/sum.js` for bugs. Load the `delegating`
skill and dispatch the reviewer through it. Its brief carries,
labelled apart and in this order:

1. **Authority.** "Read only. Change nothing."
2. **Material.** The path `src/sum.js`.
3. **Ask.** Name each bug with the line it is on.
4. **Return shape.**

   ```md
   Findings:
   - <bug>, line <n>
   Review complete.
   ```

Then tell the user what the reviewer found.
