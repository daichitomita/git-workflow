---
name: branch-naming
description: >
  Branch naming conventions for GitHub Flow with Conventional Commits.
  Use when creating branches or suggesting branch names.
  Format: {type}/{kebab-case-description}. Supports Japanese to English translation.
user-invocable: false
---

# Branch Naming Conventions

## Format

```
{type}/{kebab-case-description}
```

## Type Selection

Determine the type from the nature of the change:

| Change Type | type | Example |
|------------|------|--------|
| New feature, endpoint, component, page | `feat` | `feat/add-user-auth` |
| Bug fix, error correction | `fix` | `fix/resolve-login-error` |
| Documentation only (.md files, comments) | `docs` | `docs/update-api-readme` |
| Formatting, whitespace, no logic change | `style` | `style/format-config-files` |
| Code restructuring, no behavior change | `refactor` | `refactor/extract-auth-service` |
| Adding or fixing tests | `test` | `test/add-login-unit-tests` |
| Build tools, deps, config, CI/CD | `chore` | `chore/upgrade-dependencies` |
| Performance improvement | `perf` | `perf/optimize-query-execution` |

## Description Rules

- English, imperative form (add, fix, update, remove, implement)
- kebab-case only, all lowercase
- Maximum 30 characters for the description part
- Be specific about what the branch does

## Japanese to English Conversion

When the user provides a description in Japanese, translate it:

| Japanese Input | Branch Name |
|---------------|------------|
| ユーザー認証の追加 | `feat/add-user-auth` |
| ログインのバグ修正 | `fix/resolve-login-bug` |
| READMEの更新 | `docs/update-readme` |
| APIレスポンスの高速化 | `perf/optimize-api-response` |
| テストの追加 | `test/add-unit-tests` |
| 依存パッケージの更新 | `chore/update-dependencies` |
| コードのリファクタリング | `refactor/restructure-code` |

## Anti-Patterns

- No emoji in branch names
- No uppercase letters
- No spaces or underscores (use hyphens)
- No branch names like `main`, `master`, `develop`
- No generic names like `feat/update`, `fix/bug` (be specific)
- No issue numbers only like `feat/123` (include a description)
