[English](./README.en.md) | **日本語**

# git-workflow

GitHub Flow と Conventional Commits を自動化する Claude Code プラグイン。

## 概要

このプラグインを有効にすると、Claude が開発中に GitHub Flow ワークフローを自動的に実行します:

1. **ブランチ確認** -- コード変更前に現在のブランチ状態を確認し、必要に応じてフィーチャーブランチを作成
2. **実装** -- 依頼されたコード変更を実行
3. **コミット** -- Conventional Commits 形式（`feat:`, `fix:` 等）でコミットを作成
4. **プッシュ** -- ブランチを origin にプッシュ
5. **PR 作成** -- `gh` CLI を使って Pull Request を作成

スラッシュコマンドは不要です。機能の実装やバグ修正を依頼するだけで、Claude が git ワークフロー全体を自動的に処理します。

## 必要要件

- [gh CLI](https://cli.github.com/) がインストール・認証済み（`gh auth login`）
- リモートが設定された Git リポジトリ

## インストール

### マーケットプレイスから

```bash
# 1. マーケットプレイスを追加
/plugin marketplace add daichitomita/git-workflow

# 2. プラグインをインストール
/plugin install git-workflow@daichitomita-plugins
```

### ローカルテスト

```bash
claude --plugin-dir /path/to/git-workflow
```

## コンポーネント

### スキル（自動起動）

| スキル | 役割 |
|-------|------|
| `github-flow` | ワークフロー全体の統括 -- ブランチ/コミット/プッシュ/PR の一連の流れを Claude に教える |
| `branch-naming` | ブランチ命名規則: `{type}/{kebab-case-description}` |
| `commit-convention` | Conventional Commits 形式: `<type>(<scope>): <description>` |
| `pr-creation` | `gh` CLI による PR 作成、テンプレート検出、タイトル/本文の生成 |

すべてのスキルは `user-invocable: false` です。Claude が必要に応じて自動的に読み込むため、スラッシュコマンドは不要です。

### フック

| イベント | 役割 |
|---------|------|
| `PreToolUse` (Bash) | 危険な git コマンドをブロック: `--force`, `reset --hard`, `clean -f`, main への直接プッシュ |
| `Stop` | 未コミットの変更、未プッシュのコミット、PR 未作成の状態で Claude が停止するのを防止 |

### セーフティガード

以下の危険な操作をブロックします:

- `git push --force` / `git push -f`
- `git reset --hard`
- `git checkout -- .`
- `git clean -f`
- `git branch -D`
- `main` / `master` への直接プッシュ

## 規約

### ブランチ名

```
feat/add-user-auth
fix/resolve-login-bug
docs/update-readme
chore/upgrade-dependencies
```

### コミットメッセージ

```
feat(auth): add JWT token validation
fix: resolve null pointer in user lookup
docs: update API endpoint documentation
```

### サポートするタイプ

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`

## ライセンス

MIT
