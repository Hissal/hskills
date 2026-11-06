# `unslop` pattern catalogue: merge and Vercel comparison

Ticket: [#132](https://github.com/Hissal/skill-collection/issues/132), spec 7 ([#83](https://github.com/Hissal/skill-collection/issues/83)). Read 2026-11-06. Status: build record for the catalogue in [`skills/core/unslop/references/patterns.md`](../skills/core/unslop/references/patterns.md); the ticket asks for the Vercel comparison to be recorded on the issue, and this note is the text for that.

## Sources read

| Source | Revision | Licence | Read |
|---|---|---|---|
| compound-engineering `ce-noslop` ([`SKILL.md`][noslop], [`patterns.md`][noslop-patterns], [`terminology.md`][noslop-terms]) | `173bd337fa639aac19ce7363d288836a074231a5` (default-branch head; last `ce-noslop` change `c1c176e0`) | MIT, Copyright (c) 2025 Every | every file, in full |
| pstack `unslop` ([`SKILL.md`][pstack]) | `2776ddd2355d6d6c8747d3964600f28daf62f049` (default-branch head; last `unslop` change `bc697d0`) | MIT, Copyright (c) 2026 Lauren Tan | in full |
| Vercel `writing-guidelines`, "AI-generated tells" ([`command.md` L47-L54][vercel]) | `83e2316b034cf572400513538e4e4da01c4cc742` (head, same pin as the [web-frontend ledger](ledgers/web-frontend-skills.md)) | MIT, Copyright (c) 2026 Vercel Labs | that section; idea-only |

Nothing was run: the sources are prose with no scripts.

## Merge

The catalogue is noslop's `patterns.md` with its rule numbers kept (they are stable ids), and every pstack rule folded into the noslop rule that names the same pattern. Where pstack carried an example word or phrase noslop lacked, the word was added to that rule. The catalogue's last section maps each pstack number to its merged rule, so a citation of a pstack number still resolves.

| pstack rule | Merged rule | Added from pstack |
|---|---|---|
| 3 Superficial -ing phrases | 2 | "fostering"; back the significance with a real source |
| 5 Vague attributions | 4 | "some critics argue" |
| 7 AI vocabulary | 10 and 3 | none ("vibrant" is in rule 3) |
| 8 Fancy ways to say "is" | 11 | "stands as", "features" |
| 9 "Not just X, but Y" | 12 | the phrase itself |
| 10 Rule of three | 13 | none |
| 11 Synonym cycling | 14 | none |
| 12 False ranges | 15 | none |
| 13 Em dash overuse | 29 | the owner's stricter rule: any em dash used as punctuation is a finding, and parentheses, en dashes and hyphens are not substitutes (noslop already excluded semicolons). Noted in the false-positive floor as its one exception |
| 14 Colon overuse | 28 | "or an example", and a worked example in our own words |
| 15 Boldface overuse | 31 | none |
| 16 Inline-header lists | 30 | none |
| 17 Title case headings | 32 | none |
| 18 Decorative emojis | 33 | none |
| 19 Curly quotes | 35 | none |
| 20 Chatbot phrases | 36 | "Of course", "I hope this helps", "Found the smoking gun" |
| 22 Sycophantic tone | 37 | "Great question!" |
| 23 Filler phrases | 16 | "in the event that" is "if" |
| 24 Excessive hedging | 17 | none |
| 25 Generic conclusions | 5 | "the future looks bright" |
| 26 Abstract metaphor nouns | 20 | "wedge in", "locus", "vantage", "nexus", "bedrock", "modality", "paradigm", "harness" and "scaffolding" as metaphors |
| 27 Say what it does | 21, tests 1 and 2 | none |
| 28 Dense sentences | 22 | none |
| 29 Active voice | 23 | none |
| 30 Adverbs | 18 | none |
| 31 Prefer the plain word | 10 | the plain-word replacements ("use", "help", "many") |
| 32 Mannered prose | 43, 27, 7 | "stands on" as a borrowed verb; a figure for a plain quantity; stock framing phrases (rule 7) |
| 33 Over-compression | 42 | none |

pstack has no rules 1, 2, 4, 6 or 21 (removed rules leave gaps). Every noslop rule (1 to 43) is kept.

## Vercel comparison

Vercel's list names six tells. Two were already in the merged catalogue; four were missing and are added as rules 44 to 47, in our own words with our own examples.

| Vercel tell | Result |
|---|---|
| Summary-style transitions (a paragraph opening by recapping the last) | missing; added as 44, recap opener. Rule 26 covers only the closing recap |
| Stop-start sentences (one dependent idea split into choppy sentences) | missing; added as 45, chopped sentences. Rule 27 covers verbless fragments, not full short sentences |
| Spec-sheet voice ("provides", "is configurable") | missing; added as 46, datasheet voice. Rule 11 covers "offers" for "has", not property lists |
| Cold-open paragraphs (a first sentence that works as a standalone heading) | missing; added as 47, cold-open paragraph |
| Personified artifacts (machines doing human physical actions) | covered by rule 43 (code given intent; verbs borrowed from physical action) |
| Reused framing (an angle from a template, not this page) | covered by rule 7 (faux insight, now naming stock framing phrases) and test 2 (portability) |

[noslop]: https://github.com/EveryInc/compound-engineering-plugin/blob/173bd337fa639aac19ce7363d288836a074231a5/skills/ce-noslop/SKILL.md
[noslop-patterns]: https://github.com/EveryInc/compound-engineering-plugin/blob/173bd337fa639aac19ce7363d288836a074231a5/skills/ce-noslop/references/patterns.md
[noslop-terms]: https://github.com/EveryInc/compound-engineering-plugin/blob/173bd337fa639aac19ce7363d288836a074231a5/skills/ce-noslop/references/terminology.md
[pstack]: https://github.com/cursor/plugins/blob/2776ddd2355d6d6c8747d3964600f28daf62f049/pstack/skills/unslop/SKILL.md
[vercel]: https://github.com/vercel-labs/writing-guidelines/blob/83e2316b034cf572400513538e4e4da01c4cc742/command.md#L47-L54
