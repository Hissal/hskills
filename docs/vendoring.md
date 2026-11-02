# Vendoring and intake runbook

How to bring a skill in from a source and how to take a source's later updates. The files involved (lock, baseline, licence area, `NOTICE.md`) and their exact formats are in [Copied skills](skill-format.md#copied-skills); this runbook gives the order of work. Background: [research/vendoring.md](../research/vendoring.md), [ADR 0002](adr/0002-every-skill-lives-in-this-repo.md).

Placeholders: `<owner>/<repo>` is the source, `<path>` the skill folder inside it, `<sha>` the full commit you pin, `<skill>` the copy's folder in this tree (`skills/...`), `<name>` that folder's last segment, `<tmp>` a scratch directory outside the repository. Commands run from the repository root in bash (Git Bash on Windows).

## Copy or own words

Copy a source's line when it is good. Change it only where a change is warranted (the collection's format, a fix, an adaptation the skill needs), never for its own sake. The rules below decide what a copied line costs; the file formats are in [Copied skills](skill-format.md#copied-skills).

Decide first, per skill:

- **Copy**: the skill is mostly copied from one source, whose licence permits copying with its notice (MIT, Apache-2.0 and the like). It gets the full intake: lock entry, pin, baseline, licence-area file and generated `NOTICE.md`. Follow [Intake](#intake). If it also takes verbatim lines from a second permissive source, that source needs no pin, baseline or licence-area file of its own: name it in the lock entry's `changes` line with its full commit SHA, its licence and its copyright line.
- **Own words**: anything else. Write the skill in the collection's own words; verbatim lines from a permissive source may still come in where they are good, and need no pin. The skill gets no lock entry, no baseline, no licence-area file, and no `SPEC.md` or `SOURCES.md`. Record where it drew from in a hand-written `NOTICE.md`, as [Adapted skills](skill-format.md#copied-skills) describes: each source linked at its full commit SHA, so it can later be compared against its newer commits for changes worth taking, and each source of copied lines also named with its licence and copyright line. The intake ends here.
- **Copyleft sources** (CC-BY-SA and the like) stay idea-only, whichever kind the skill is: no text is copied from them.

## Intake

Every step lands in one commit; the intake is done when that commit passes the check, the drift report and the scan below.

1. **Fetch the source** and choose the pin:

   ```sh
   git clone -c core.autocrlf=false --filter=blob:none https://github.com/<owner>/<repo> <tmp>/src
   git -C <tmp>/src rev-parse HEAD
   git -C <tmp>/src checkout <sha>
   ```

   The pin is normally the default branch's head, the `rev-parse` output. Matt-derived skills differ: see [Matt-derived skills](#matt-derived-skills).
2. **Security read** of `<tmp>/src/<path>`, model-judged, before anything enters the tree. Follow the procedure in Sentry's [`skill-scanner` SKILL.md](https://github.com/getsentry/skills/blob/d12f250460ffd961f549dbebf7eeb0cf4afd4c2e/skills/skill-scanner/SKILL.md) (the commit the CI scan pins) over every file in the folder, scripts included. Any finding stops the intake: report it to the owner with the file and line. A finding the owner judges a false positive and the CI scan also flags is accepted with an entry in `scripts/security-scan/accepted.json`, reason included, so it shows in the pull request diff for review: see [Accepted findings](skill-format.md#security-scan).
3. **Baseline**: the source folder at the pin, every file, unedited:

   ```sh
   mkdir -p vendor/<owner>/<repo>
   cp -R <tmp>/src/<path> vendor/<owner>/<repo>/<name>
   ```

   The baseline's folder is named after the copy (`<name>`), not after the source folder.
4. **Copy**: the same folder into the tree, then make the local changes:

   ```sh
   cp -R <tmp>/src/<path> <skill>
   ```

   Local changes are whatever the collection's format needs ([Skill format](skill-format.md): frontmatter, metadata, harness gates) plus any adaptation. Fix every [copied file safety](skill-format.md#copied-file-safety) finding in the copy.
5. **Licence**: the source's licence file at the pin, in full, to `licenses/<owner>/<repo>.txt`. Once per source; a later skill from the same source reuses it.
6. **Lock entry**: append the skill's entry to `vendor.lock.json` (create it as `{ "skills": [] }` if absent). Fields and their meaning: [Copied skills](skill-format.md#copied-skills). `changes` is one line naming what the copy changes, or `none`.
7. **`NOTICE.md`**: generate it; never write it by hand:

   ```sh
   node scripts/vendor/notice.js
   ```

8. **Check and drift**:

   ```sh
   node scripts/check/check.js
   node scripts/vendor/drift.js
   ```

   The check passes; its messages name the script for each format fix. The drift report lists the new skill as `current` when the copy is unchanged and `local-drift` when it carries local changes (`update-available` or `both` when the pin is behind the source's head, as a [Matt-derived](#matt-derived-skills) pin can be). `baseline-corrupt` means the baseline was edited.

   A `crlf-line-ending` or `utf8-bom` failure in the baseline means the source committed CRLF or a BOM: convert those files to LF without a BOM, and change nothing else in the baseline. The drift script compares with line endings and BOM normalised, so this edit stays `current`; any other edit to the baseline reads as `baseline-corrupt`.
9. **Commit** copy, baseline, licence, lock and `NOTICE.md` together.
10. **Scan**, the deterministic half of the security read ([Security scan](skill-format.md#security-scan)). It reads committed changes, so it runs after step 9:

    ```sh
    uv run scripts/security-scan/scan.py --base origin/main
    ```

    A finding in the new skill stops the intake as in step 2.

## Matt-derived skills

A skill from Matt Pocock's set is copied straight from `mattpocock/skills`. It follows [Intake](#intake) with `<owner>/<repo>` set to `mattpocock/skills`, so the copy, the baseline (`vendor/mattpocock/skills/<name>/`), the licence (`licenses/mattpocock/skills.txt`), the lock's `source` and `NOTICE.md` all come from that repository at one commit. The only difference is the pin: the `mattpocock/skills` commit the owner or the ticket chooses, which may be behind the default branch's head. Check out that commit in Intake step 1 instead of the head. When it is behind, the drift report lists the new skill as `update-available` or `both`.

The fork (`Hissal/mattpocock-skills-unity`) is not a source for core skills: no fork clone, no merge-base, and none of its text enters a core skill. It differs from `mattpocock/skills` only by Unity lines that core skills drop anyway. Unity material from the fork reaches the Unity pack through ordinary [Intake](#intake), or as [own words](#copy-or-own-words), like any other source.

Lock entries made under the earlier fork procedure keep their pins and baselines; they take updates through [Taking an update](#taking-an-update) like any other entry.

## Taking an update

The monthly drift report, or `node scripts/vendor/drift.js` by hand, lists what changed (`node scripts/vendor/drift.js --help` explains each class and output line). An update is taken only when the owner asks, one skill at a time; skipping one is normal. The update's own security read is the CI scan plus code review of the pull request.

1. Note the source's head, then merge:

   ```sh
   git ls-remote https://github.com/<owner>/<repo> HEAD
   node scripts/vendor/drift.js --merge <skill>
   ```

2. Act on its `RESULT` line:
   - **`nothing-to-take`**: done.
   - **`clean`**: the script has moved the pin, the baseline and `NOTICE.md` to the head. Review the copy's diff.
   - **`conflict`**: resolve every file on a `CONFLICT:` line in the copy, keeping the intent of both sides. Delete/modify and binary conflicts left the copy untouched; their reason is on stderr. Then move the pin and baseline by hand to the head you noted, confirming it matches the 12-character prefix in the `>>>>>>>` marker labels (if the source moved meanwhile, discard and start again): replace `vendor/<owner>/<repo>/<name>/` with the source folder at that commit as in Intake step 3, set the entry's `sha`, and run `node scripts/vendor/notice.js`.
3. Run the check and the drift report (Intake step 8). The drift report now lists the skill as `current` or `local-drift`. Update `changes` if the local changes are now different.
4. **Commit** copy, baseline, lock and `NOTICE.md` in one commit, so the pin and baseline move together, then run the scan (Intake step 10).
