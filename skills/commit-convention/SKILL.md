---
name: commit-convention
description: >
  Conventional Commits message format for git commits.
  Use when committing changes. Analyzes diffs to automatically determine
  the commit type, scope, and description.
user-invocable: false
---

# Conventional Commits Format

## Message Format

```
<type>(<scope>): <description>
```

Or without scope:

```
<type>: <description>
```

## Type Determination from Diff

Analyze `git diff --staged` to determine the type:

| Diff Pattern | type |
|-------------|------|
| New files with functional code | `feat` |
| New functions, classes, endpoints, components | `feat` |
| Fixing conditionals, error handling, edge cases | `fix` |
| Only .md or documentation file changes | `docs` |
| Only whitespace, formatting, semicolons | `style` |
| Restructuring code without changing behavior | `refactor` |
| Test file additions or modifications (*test*, *spec*) | `test` |
| package.json, Makefile, config, Dockerfile changes | `chore` |
| Algorithm optimization, caching, query tuning | `perf` |
| .github/workflows/, CI config changes | `ci` |
| Reverting a previous commit | `revert` |

When multiple types apply, use the primary purpose of the change.

## Scope Determination

1. Changes concentrated in one directory/module → use that name
   - `src/auth/` → scope: `auth`
   - `components/Button/` → scope: `button`
   - `api/users/` → scope: `users`
2. Changes span multiple unrelated areas → omit scope
3. Keep scope names short: `auth`, `api`, `ui`, `db`, `config`

## Description Rules

- English imperative form: add, fix, update, remove, implement, refactor
- Start with lowercase
- No period at the end
- No emoji
- Maximum 50 characters (ideally 30-40)
- Describe what the change does, not what was done

Good:
- `feat(auth): add JWT token validation`
- `fix: resolve null pointer in user lookup`
- `docs: update API endpoint documentation`

Bad:
- `feat: updated the code` (past tense, vague)
- `fix: Fixed bug` (past tense, capitalized, vague)
- `feat: :sparkles: add feature` (emoji)

## Commit Splitting Criteria

Split into multiple commits when:
- Changes include both a bug fix AND a new feature
- Changes span unrelated functional areas
- More than 10 files are changed for different reasons
- Test changes are mixed with implementation changes

How to split:
1. `git reset HEAD` to unstage all
2. `git add <related-files>` for the first logical group
3. `git commit -m "<type>(<scope>): <description>"`
4. Repeat for each logical group

## Important

- Never add a `Co-Authored-By` header -- Claude Code adds this automatically
- One commit = one logical change
- Prefer smaller, focused commits over large multi-purpose ones
