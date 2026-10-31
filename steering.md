## Commit messages, PR titles, issue titles, branch names

Write all four in the repo's own convention, found in its docs (CONTRIBUTING, CLAUDE.md, AGENTS.md), its tooling (commitlint, commitizen, changesets config), or a consistent pattern in recent `git log`, `git branch -r`, `gh pr list` and `gh issue list`. Where the repo has none, or its convention skips the case, use [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

- Title (commit subject, PR title, issue title): `<type>(<optional scope>): <description>`, with a lowercase imperative description, no trailing period, at most 72 chars.
- Branch name: `<type>/<kebab-case-description>`, e.g. `fix/memory-leak-in-stat-application`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Breaking change: `!` after the type or scope, plus a `BREAKING CHANGE:` footer in the commit body.
- Commit body (optional): explain why, not what; wrap at 72.
