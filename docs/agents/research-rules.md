# Research area rules

Use this when adding or updating `research/` notes and source ledgers. The [maintenance decision (#17)](https://github.com/Hissal/skill-collection/issues/17) assigns these rules to collection maintenance. The conventions below come from existing notes; they do not turn research recommendations into collection decisions.

## Research notes

- State the question or ticket, its connection to the blueprint, the read date and the report's status. Use the repository's vocabulary. Examples: [package-shipped vendor knowledge](../../research/package-shipped-knowledge.md) and [guard approval portability](../../research/guard-approval-portability.md); vocabulary: [GLOSSARY.md](../../GLOSSARY.md).
- Present findings with evidence, implications and remaining questions. Distinguish source observations, inference, proposals and owner decisions. A source-reading finding does not establish installed runtime behavior. The [package-shipped knowledge report's evidence boundaries](../../research/package-shipped-knowledge.md#evidence-and-boundaries) defines those distinctions; the [guard portability report](../../research/guard-approval-portability.md) separates findings, design inferences and remaining verification.
- Record what was inspected and what was executed, including important things not tested. Identify version and platform limits rather than generalizing a source snapshot to every release or installation. Both reports above do this; the package-shipped report also separates repository HEAD from published package contents.
- Keep recommendations explicitly proposed and unresolved policy with the owner. Link the deciding record when describing adoption. The [package-shipped report](../../research/package-shipped-knowledge.md) leaves adoption to the owner; the [maintenance ledger](../../research/ledgers/maintenance-tooling.md) labels all recommendations proposed. The [glossary's Ledger and Theme definitions](../../GLOSSARY.md#building-the-collection) distinguish investigation from decisions.

## Citations

- Link claims to the relevant primary source file or official documentation. Use full commit-SHA links for external repository files, and identify the read date for hosted documentation. A repository pin is a snapshot, not proof of published release contents. Follow the [package-shipped report's snapshot table and source references](../../research/package-shipped-knowledge.md#repository-snapshots).
- Keep citations near the claim or in identifiable reference links; name the repository, inspected revision and relevant path so evidence can be traced. The [maintenance ledger](../../research/ledgers/maintenance-tooling.md) uses pinned source links throughout; the [guard portability report](../../research/guard-approval-portability.md) links individual claims directly.
- Link related local research and decision tickets rather than treating earlier proposals as adopted facts. The [maintenance ledger](../../research/ledgers/maintenance-tooling.md) links loading-mechanics evidence and overlapping ledgers; the [package-shipped report](../../research/package-shipped-knowledge.md) names its local inputs and earlier discovery report.

## Source ledgers

Keep per-source candidate inventories in `research/ledgers/`. A ledger is a proposed input to theme decisions, not an adoption list. Follow the [maintenance ledger](../../research/ledgers/maintenance-tooling.md) and [pstack ledger](../../research/ledgers/pstack.md), using the [glossary's Ledger definition](../../GLOSSARY.md#building-the-collection):

- Open with the research ticket and destination theme, read date, repository pins and licences, inspection method and execution limits. Give an overview of what the sources ship and their relevance to the owner.
- Give candidates stable numbered entries and an index so later themes can cite them. For each candidate record what it is and its source, kind, proposed address, fit, misfit, copy/adapt/idea-only treatment, overlap, idle-context cost and a proposed recommendation. This is the repeated entry shape in both example ledgers.
- State how costs were measured or estimated and mark estimates as such. Record harness and platform assumptions, blockers, disagreements and open questions. Both example ledgers distinguish measured description characters from token estimates and call out portability limits.

A ledger is research evidence, not the installed-copy provenance record. [#17](https://github.com/Hissal/skill-collection/issues/17) assigns copied-skill provenance to `vendor.lock.json`, whole-folder baselines and licences, and gives idea-only takes no provenance record. [ADR 0002](../adr/0002-every-skill-lives-in-this-repo.md) records the fork's role as a source. Do not revive the ledger's proposed per-skill `SPEC.md`/`SOURCES.md` convention: #17 rejected it in favor of the shared provenance machinery.
