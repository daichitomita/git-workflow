---
name: github-flow
description: >
  GitHub Flow 開発ワークフロー。機能実装、バグ修正、その他のコード変更を git リポジトリで行う際に、
  このワークフローを自動的に実行する: ブランチ状態の確認、フィーチャーブランチの作成、変更の実装、
  Conventional Commits でのコミット、リモートへのプッシュ、Pull Request の作成。
  ユーザーが実装・修正・追加・更新・リファクタリング・コード変更を依頼した場合に適用する。
  「コードを書いて」「作って」「直して」「変えて」「機能追加して」「バグを直して」などの依頼にも適用する。
user-invocable: false
allowed-tools: Bash(git:*), Bash(gh:*)
---

# GitHub Flow 開発ワークフロー

開発タスク（実装、修正、追加、更新、リファクタリング、コード変更）を git リポジトリで受け取った場合、このワークフローを自動的に実行する。ユーザーにコミット、プッシュ、PR 作成を求めるのを待たず、タスク完了の一環として主体的に行うこと。

## Step 0: 作業前のブランチ確認（必須）

以下は現在の git 状態（スキル読み込み時に自動取得）:

- **現在のブランチ**: !`git branch --show-current 2>/dev/null || echo '(git リポジトリではない)'`
- **ステータス**: !`git status --short 2>/dev/null || echo '(git リポジトリではない)'`
- **デフォルトブランチ**: !`git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}' || echo 'main'`

git リポジトリでない場合は、ワークフロー全体をスキップし、通常通り変更を実装する。

git リポジトリの場合、上記の状態から判断フローに進む。必要に応じて `git fetch origin` を実行する。

### 判断フロー

**ケースA: main/master 上でリモートと同期済み**
1. タスク内容に基づいてフィーチャーブランチを作成する
2. ブランチ命名規則を使用する（branch-naming スキルを参照）
3. 新しいブランチで作業を開始する

```bash
git checkout -b <type>/<kebab-case-description>
```

**ケースB: main/master 上だがリモートと同期されていない**
1. まず最新の変更をプルする
2. その後フィーチャーブランチを作成する

```bash
git pull origin main
git checkout -b <type>/<kebab-case-description>
```

**ケースC: フィーチャーブランチ上（main/master ではない）**
1. 現在のブランチ名をユーザーに伝える
2. 質問する: 「現在ブランチ `<branch-name>` にいます。このブランチで作業を続けますか？それとも新しいブランチを作成しますか？」
3. ユーザーの回答を待ってから次に進む

## Step 1: 変更の実装

ユーザーが依頼した実際の開発作業を進める。コードの記述、ファイルの編集、テストの実行などを行う。

## Step 2: コミット

実装完了後:

1. 変更内容を確認する:
```bash
git diff --stat
git diff --staged --stat
```

2. 変更をステージングする。`git add -A` よりも特定のファイルを指定してステージングすること:
```bash
git add <specific-files>
```

3. Conventional Commits フォーマットでコミットを作成する（commit-convention スキルを参照）:
```bash
git commit -m "<type>(<scope>): <description>"
```

ルール:
- 論理的な変更ごとに1コミット
- 変更が複数の無関係な領域にまたがる場合は、複数のコミットに分割する
- Co-Authored-By ヘッダーは追加しない（Claude Code が自動的に付与する）

## Step 3: プッシュ

ブランチをリモートにプッシュする:

```bash
git push -u origin $(git branch --show-current)
```

リモートの変更によりプッシュが拒否された場合:
```bash
git pull --rebase origin $(git branch --show-current)
git push -u origin $(git branch --show-current)
```

ルール:
- `git push --force` や `git push -f` は絶対に使用しない
- 初回プッシュ時は必ず `-u` を使用してトラッキングを設定する

## Step 4: Pull Request の作成

`gh` CLI を使用して PR を作成する:

1. リポジトリの PR テンプレートを確認する（`Read` ツールで以下の順に探索する）:
   - `.github/pull_request_template.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`

2. PR のタイトルと本文を生成する（pr-creation スキルを参照）

3. PR を作成する:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)" --base <default-branch>
```

4. PR の URL をユーザーに報告する

## セーフティルール

- main/master への直接プッシュは絶対にしない
- `git push --force` は絶対に使用しない
- `git reset --hard` は絶対に使用しない
- `git clean -f` は絶対に使用しない
- マージコンフリクトが発生した場合は、停止してユーザーに説明する
- `gh` CLI がインストールされていない場合は、インストールを案内し PR 作成をスキップする

## ユーザーに確認するタイミング

- **必ず確認する**: フィーチャーブランチ上で、作業を続行するか新しいブランチを作成するかの判断時（Step 0 ケースC）
- **確認不要**: main からのブランチ作成、コミット、プッシュ、PR 作成 -- そのまま実行する
- **不明な場合は確認する**: タスクの説明が曖昧な場合のブランチ名
