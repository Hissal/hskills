# Scaffolding

Fill what the intended outcome needs and the project lacks, with the vendor's own generator or the project's own tooling. Choose in step 3, run in step 5, after the selected guidance is in place.

## Choose

List each gap between the intended outcome and what step 1 found. For each, read the current documentation and `--help` of the generator the stack's vendor names, and find its non-interactive form and its options. Recommend one command, ask one question for the gap, and put the command in the draft.

A choice that adds to the stack brings step 2 back for what is new. Declining a gap leaves it in the report, with the steps it holds back.

## Run

1. **Use the guidance.** Read the delivered style guide and each delivered skill or pointer that covers this work. Let them set the generator's options and shape any first files, and say what each one changed, or that it changed nothing. When that changes a command the draft showed, tell the owner the new command and why, and ask only if it goes against something they chose.
2. **Keep what is done.** Step 4's files are in the project, and a generator can refuse a folder with files in it or overwrite them. Run a whole-project generator in a new empty folder outside the project, passing the project's name where the generator takes one from its folder, and move each file into the project. A file the project already has stays as it is: name each one in the report with what the generator's copy adds, and merge it on the owner's yes. Tooling made to add to an existing project runs in place; list what it changed.
3. **Restore dependencies**, with the package manager the generator set up, so step 6 can run the commands.

The generator's starter is this step's result. Name what the outcome still needs built as later work in the report.

A generator that fails goes through [Open questions](../SKILL.md#open-questions) with its command and output, and the other gaps carry on.
