---
name: pr-creation
description: >
  gh CLI を使用した Pull Request 作成のベストプラクティス。
  GitHub で PR を作成する際に使用する。リポジトリの PR テンプレートを検出し、
  コミット履歴からタイトルと本文を生成し、gh CLI のセットアップを処理する。
user-invocable: false
---

# Pull Request 作成

## 前提条件

PR を作成する前に以下を確認する:

1. **gh CLI が利用可能であること**:
```bash
gh --version
```
インストールされていない場合、ユーザーに以下を伝える:
```
PR 作成には gh CLI が必要です。インストール方法:
  macOS:   brew install gh
  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md を参照
認証: gh auth login
```

2. **認証済みであること**:
```bash
gh auth status
```
未認証の場合: `gh auth login`

3. **このブランチの PR が既に存在しないこと**:
```bash
gh pr view --json url -q '.url' 2>/dev/null
```
PR が既に存在する場合は、その URL を報告して作成をスキップする。

## デフォルトブランチの検出

```bash
git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}'
```

フォールバック: `main` を確認し、次に `master` を確認する。

## PR テンプレートの検出

`Glob` ツールでリポジトリの PR テンプレートを検索し、見つかったファイルを `Read` ツールで読み込む:

検索パターン:
- `**/*pull_request_template*`
- `**/*PULL_REQUEST_TEMPLATE*`

よくある配置場所:
1. `.github/pull_request_template.md`
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`
4. `docs/pull_request_template.md`
5. `pull_request_template.md`

テンプレートが見つかった場合は、実際の変更情報を記入する。

## PR タイトル

- Conventional Commits フォーマットを使用する: `<type>(<scope>): <description>`
- 最大70文字
- 絵文字は使用しない
- コミットが1つの場合: そのコミットメッセージをタイトルとして使用する
- コミットが複数の場合: 全体の変更を要約する

## PR 本文（テンプレートがない場合）

以下のデフォルト構造を使用する:

```markdown
## 概要
<!-- 全体の変更を1〜3文で説明 -->

## 変更内容
<!-- 具体的な変更のリスト -->
-
-

## テスト計画
<!-- 変更が正しく動作することの確認方法 -->
-
```

各セクションを `git log` と `git diff` の分析から記入する。

## PR の作成

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body content>
EOF
)" --base <default-branch>
```

本文には必ず HEREDOC を使用して、複数行のコンテンツや特殊文字を処理する。

## PR サイズガイドライン

変更サイズを確認する:
```bash
git diff origin/<default-branch>..HEAD --shortstat
```

| サイズ | 変更行数 | 対応 |
|-------|---------|------|
| Small | 〜200行 | 最適、PR を作成する |
| Medium | 200〜400行 | 良好、PR を作成する |
| Large | 400〜800行 | ユーザーに警告し、今後の分割を提案する |
| XL | 800行以上 | 強く警告し、分割を提案する |

サイズに関わらず PR は作成するが、大きな PR にはサイズに関する注記を含める。

## エラーハンドリング

- **gh 未インストール**: インストール手順を表示し、PR 作成をスキップする
- **未認証**: `gh auth login` を案内し、PR 作成をスキップする
- **PR が既に存在する**: 既存の PR URL を報告する
- **プッシュ未完了**: まずプッシュしてから PR を作成する
- **コミットなし**: 「PR に含める変更がありません」と報告する
