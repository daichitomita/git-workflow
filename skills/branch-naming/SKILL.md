---
name: branch-naming
description: >
  GitHub Flow と Conventional Commits のためのブランチ命名規則。
  ブランチ作成時やブランチ名の提案時に使用する。
  フォーマット: {type}/{kebab-case-description}。日本語から英語への変換に対応。
user-invocable: false
---

# ブランチ命名規則

## フォーマット

```
{type}/{kebab-case-description}
```

## タイプの選択

変更の性質からタイプを決定する:

| 変更内容 | type | 例 |
|---------|------|-----|
| 新機能、エンドポイント、コンポーネント、ページ | `feat` | `feat/add-user-auth` |
| バグ修正、エラー修正 | `fix` | `fix/resolve-login-error` |
| ドキュメントのみ（.md ファイル、コメント） | `docs` | `docs/update-api-readme` |
| フォーマット、空白文字、ロジック変更なし | `style` | `style/format-config-files` |
| コード構造の変更、動作変更なし | `refactor` | `refactor/extract-auth-service` |
| テストの追加・修正 | `test` | `test/add-login-unit-tests` |
| ビルドツール、依存関係、設定、CI/CD | `chore` | `chore/upgrade-dependencies` |
| パフォーマンス改善 | `perf` | `perf/optimize-query-execution` |

## 説明部分のルール

- 英語、命令形（add, fix, update, remove, implement）
- kebab-case のみ、すべて小文字
- 説明部分は最大30文字
- ブランチの目的を具体的に記述する

## 日本語から英語への変換

ユーザーが日本語で説明を入力した場合は、英語に変換する:

| 日本語入力 | ブランチ名 |
|-----------|-----------|
| ユーザー認証の追加 | `feat/add-user-auth` |
| ログインのバグ修正 | `fix/resolve-login-bug` |
| READMEの更新 | `docs/update-readme` |
| APIレスポンスの高速化 | `perf/optimize-api-response` |
| テストの追加 | `test/add-unit-tests` |
| 依存パッケージの更新 | `chore/update-dependencies` |
| コードのリファクタリング | `refactor/restructure-code` |

## アンチパターン

- ブランチ名に絵文字を使用しない
- 大文字を使用しない
- スペースやアンダースコアを使用しない（ハイフンを使う）
- `main`、`master`、`develop` のような名前を使用しない
- `feat/update`、`fix/bug` のような汎用的な名前を使用しない（具体的に記述する）
- `feat/123` のように Issue 番号だけを使用しない（説明を含める）
