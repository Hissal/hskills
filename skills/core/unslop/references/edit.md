# Edit mode

Rewrite only the sentences a test fails on, and return the text. A sentence that passes stays as written, so a second pass on the returned text changes nothing.

- Read [patterns.md](patterns.md) before the rewrite. The tests in `SKILL.md` decide whether a passage is a finding; the catalogue names what to look for and what to write instead.
- In the user's own writing, the register's limits hold: sentence splits and actor restoration that keep the user's word choice.
- Say what changed in one line only when the user asks for it, and keep that line outside the rewritten text and out of any artifact.
