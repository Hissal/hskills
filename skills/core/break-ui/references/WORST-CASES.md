# Worst-case catalog

Values and conditions that real users and real systems produce, grouped by what the UI renders or calls. Take the rows that fit the fields and calls in your surface map. Each note says what the value tends to break. Stack-specific environment checks (screen sizes, text scaling, themes, writing direction) come from the project's pack guides, not from here.

Use reserved domains (`example.com`, `example.org`, `.test`) for addresses and links, so a fixture never reaches a real inbox or site.

- [Names and people](#names-and-people)
- [Identifiers, addresses and file names](#identifiers-addresses-and-file-names)
- [Labels and text from data](#labels-and-text-from-data)
- [Numbers and money](#numbers-and-money)
- [Lists](#lists)
- [Time](#time)
- [Images and media](#images-and-media)
- [States](#states)
- [Network failures](#network-failures)
- [Permission failures](#permission-failures)

## Names and people

| Value | Tends to break |
|---|---|
| `Maximiliane Schöllkopf-Brandenburger` | Long, hyphenated, with an umlaut: wraps, overflows one-line rows, splits at the hyphen |
| `Bo` / `Q` | Very short: a mostly empty column, one-letter initials, a tiny click target when the name is the link |
| `Dr. Nnamdi Okonkwo-Adeyemi Jr.` | Title and suffix: initials taken from `Dr.` and `Jr.` |
| `Nguyễn Thị Bích Phượng` | Stacked diacritics: clipped by tight line height with hidden overflow |
| `李明` / `佐藤 花子` | CJK, with and without a space: "first and last word" logic, line breaks anywhere |
| `يوسف بن خالد` | Right-to-left: punctuation and icons land on the wrong side |
| `Aoife Ní Mhaoláin` / `Jean-Luc d'Aubigné` | Lowercase particles and apostrophes: initials, sorting by surname, escaping, search |
| `🌻 Marisol` / `👨🏿‍🍳 Kofi` | Emoji first, or a joined emoji sequence: the first "character" is half a code point, slicing splits the sequence |
| ` Ana   Ruiz ` | Leading, trailing and repeated spaces: empty words, odd gaps |
| `ANA RUIZ` / `ana ruiz` | Case as typed: case-sensitive sorting, initials that should still be capitals |
| *(missing)* | No name, only an address or ID: the UI needs a fallback |
| Two people with the same name | Lists where the name is the only thing that tells rows apart |

## Identifiers, addresses and file names

Strings with no spaces leave no place to wrap.

| Value | Tends to break |
|---|---|
| `procurement.notifications.emea@finance-operations-division.example.com` | Long address with no break point: pushes every sibling out of the row |
| `x@y.io` | Shortest realistic address: a layout sized for long ones looks empty |
| `sam+invoices-2026@example.org` | Plus addressing: validation that rejects `+`, truncation that hides the tag |
| `https://example.com/org/acme/projects/spring-launch/boards/7b3e91?view=list&sort=updated` | Long link: overflow, and cutting the end hides the part that differs |
| `3f2a9c7e-41d8-4b6a-9e15-c0d8a7f63b20` | Opaque ID: wide, and only the middle or end tells two apart |
| `Budget 2026 – DRAFT (v7) [do not share].xlsx` | File name: cutting the end hides version and extension; brackets and dashes |
| `PXL_20260412_071533918.RAW-02.ORIGINAL.dng` | Device file name: unbreakable, upper-case extension |
| `@k` / `@the_longest_handle_the_service_allows` | Handle extremes, at the real length limit |

## Labels and text from data

| Value | Tends to break |
|---|---|
| `Principal Customer Success Manager, Strategic Accounts EMEA` | Long role in a secondary slot: three lines where one was planned |
| `Awaiting approval from finance for 9 days` | Long status text: the badge wraps or squeezes the main column |
| `Datenschutzgrundverordnung` | Long compound word with no spaces: a label that cannot wrap |
| A label in a longer language (often a third or more longer than the source text) | Fixed-width buttons and tabs |
| Fifteen tags on one item | A tag row that becomes a wall; needs an overflow count |
| One tag longer than its container | A single item wider than the space it gets |
| Empty string / only spaces / `Untitled` | A collapsed heading or zero-height row |
| `<em>hi</em>` / `&lt;` / `*not bold*` | Escaping: must render as the literal text |
| Two lines pasted into a one-line field | Doubled row height, or the second line silently lost |
| A few thousand characters pasted as a description | Clamping, "show more", growing input fields |

## Numbers and money

| Value | Tends to break |
|---|---|
| `0` | Zero states, empty meters, division by zero in a percentage |
| `1` | Plurals: "1 items", "1 days ago" |
| `48213` | Missing thousands separator |
| `7300000` | A count badge's width; whether a compact form fits |
| `98765432.1` as a currency amount | Totals columns overflowing |
| `-17.25` | Sign, colour logic, accounting formats |
| `0.1 + 0.2` computed and shown | Floating-point noise shown raw |
| `131%` / `-8%` | Meters and progress past their bounds |
| `null` / missing / not-a-number | Shown literally |
| The same amount in two locales | Hard-coded separators and symbols |
| A value that changes live (`999` → `1000`) | Width jumps and jitter |

## Lists

| Value | Tends to break |
|---|---|
| No items | Whether an empty state exists at all, and what it says |
| One item | Grids that look broken with one card; "1 of 1" |
| Exactly a page, and a page plus one | Off-by-one counts, an empty last page |
| The realistic upper bound, unpaginated (often 1,000 or more) | Render time, scrolling, memory, and copy such as "Showing 50 of 4,812" |
| One item far larger than the rest | Rows or cards stretching to the tallest |
| Every enum value at once | Badge widths that vary; a status the UI has no style for |

## Time

| Value | Tends to break |
|---|---|
| Now | "0 seconds ago" |
| Days, months and years ago | Relative-time thresholds; when to switch to a date |
| A future date | "in 3 days" against "-3 days ago" |
| The zero timestamp (`1970-01-01`) | An unset time shown as a real date |
| Late evening in a timezone behind UTC | A different calendar day for the user and the server |
| A very long duration | Durations that never roll up into larger units |

## Images and media

| Value | Tends to break |
|---|---|
| An image link that fails | A broken-image marker where a fallback belongs |
| No image at all | The fallback itself: initials, colour, same size as real images |
| Very wide or very tall images | Distortion without cropping; cards blown out of shape |
| A dark or transparent logo on a dark background | Invisible content |
| A slow image | Layout shift without reserved dimensions |

## States

| Value | Tends to break |
|---|---|
| Loading | Placeholders that do not match the final layout; content that shifts |
| Partial data | Some optional fields filled and others not, in one list: misaligned rows |
| The current user in the list | "You" labels; actions that should not apply to yourself |
| Data changed elsewhere while open | Stale rows, an edit saved over a newer one, an item deleted under the cursor |
| A server-side validation error | A rule the form did not check: where the message shows, whether input survives |

## Network failures

Enter each through the stub or mock that answers the call.

| Condition | Tends to break |
|---|---|
| Offline when the UI loads | A blank screen or an endless spinner |
| Offline or dropped mid-action | A save that looks done but was not; a lost draft; a double submit on retry |
| A very slow response | No progress shown; the user acts twice; a timeout with no message |
| A timeout | No retry; a raw error |
| A server error (5xx) | A raw error message or stack trace shown to the user |
| A malformed, truncated or empty response body | A crash on a missing field; "undefined" on screen |
| Rate limited (429) | A retry storm, or an error with no "try again later" |
| Two responses arriving out of order | An older result overwriting a newer one |

## Permission failures

| Condition | Tends to break |
|---|---|
| Session expired (401) mid-flow | Work lost on the redirect to sign in; a loop between pages |
| Forbidden (403) on an action the UI offered | An enabled button that fails with no explanation |
| A read-only or limited role | Actions shown that cannot be used; layout gaps where hidden actions were |
| Access removed while the page is open | Stale data still shown; the next action fails silently |
| A resource visible in a list but not openable | A link that leads to an error page |
