# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

GitHub Flow と Conventional Commits を自動化する **Claude Code プラグイン**（バージョン 1.1.0）。
プラグインとしてインストールされると、Claude がコード変更時にブランチ作成 → 実装 → コミット → プッシュ → PR作成の一連のワークフローを自動実行する。

## アーキテクチャ

```
.claude-plugin/
  plugin.json        ... プラグインのメタデータ（名前、バージョン、説明）
  marketplace.json   ... マーケットプレイス公開用の設定

skills/              ... Claude が自動読み込みするスキル（すべて user-invocable: false）
  github-flow/       ... ワークフロー全体の統括（Step 0〜4）
  branch-naming/     ... ブランチ命名規則: {type}/{kebab-case-description}
  commit-convention/ ... Conventional Commits: <type>(<scope>): <description>
  pr-creation/       ... gh CLI による PR 作成、テンプレート検出

hooks/
  hooks.json         ... フック定義（PreToolUse, Stop イベント）

scripts/             ... フックから呼ばれる Node.js スクリプト
  block-dangerous-git.mjs  ... PreToolUse フック: 危険な git コマンドをブロック
  stop-check.mjs           ... Stop フック: ワークフロー未完了時の停止を防止
```

### コンポーネント間の関係

- **skills** はプロンプトに注入される Markdown ファイル（SKILL.md）で、Claude の振る舞いを制御する
- **hooks** はツール実行前（PreToolUse）とタスク終了時（Stop）に自動実行される Node.js スクリプト
- `github-flow` スキルが他の3スキル（branch-naming, commit-convention, pr-creation）を参照する親スキル

## 開発コマンド

ビルドシステムやテストフレームワークは使用していない。ローカルテストはClaude CLIのプラグインディレクトリ指定で行う:

```bash
claude --plugin-dir /path/to/git-workflow
```

## 必要要件

- Node.js（scripts/ 内の .mjs ファイル実行用）
- [gh CLI](https://cli.github.com/) がインストール・認証済み（PR 作成機能用）

## 規約

- **ブランチ名**: `{type}/{kebab-case-description}`（例: `feat/add-user-auth`）
- **コミット**: `<type>(<scope>): <description>`（例: `feat(auth): add JWT token validation`）
- **タイプ**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`
- ブランチ名・コミットメッセージは英語、命令形（add, fix, update）
- Co-Authored-By ヘッダーは追加しない（Claude Code が自動付与）

## セーフティガード

`block-dangerous-git.mjs` が以下をブロック:
- `git push --force` / `-f`、`git reset --hard`、`git checkout -- .`、`git restore .`、`git clean -f`、`git branch -D`
- `main` / `master` への直接プッシュ

`stop-check.mjs` がフィーチャーブランチ上で以下を検出し停止をブロック:
- 未コミットの変更、未追跡ファイル、未プッシュのコミット、PR未作成
