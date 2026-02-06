#!/usr/bin/env node

/**
 * Stop フック: Claude が停止する前に git ワークフローが完了しているか確認する。
 *
 * チェック内容（順序通り）:
 *   1. stop_hook_active が true か？ → 停止を許可（無限ループ防止）
 *   2. git リポジトリか？
 *   3. フィーチャーブランチ上か？（main/master ではスキップ）
 *   4. コミットされていない変更があるか？
 *   5. 未追跡ファイルがあるか？
 *   6. プッシュされていないコミットがあるか？
 *   7. このブランチにオープンな PR があるか？
 *
 * 終了コード:
 *   0 = 停止を許可
 *   2 = 停止をブロック（stderr のメッセージが Claude に表示される）
 */

import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

function blockStop(message) {
  process.stderr.write(message);
  process.exit(2);
}

async function main() {
  // 標準入力を読み取る
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    process.exit(0);
  }

  // 無限ループ防止: stop フックが既にアクティブな場合は停止を許可
  if (input?.stop_hook_active === true) {
    process.exit(0);
  }

  // git リポジトリでない場合は停止を許可
  if (run("git rev-parse --is-inside-work-tree") === null) {
    process.exit(0);
  }

  const branch = run("git rev-parse --abbrev-ref HEAD");

  // main/master 上またはデタッチド HEAD の場合は停止を許可
  if (!branch || ["main", "master", "HEAD"].includes(branch)) {
    process.exit(0);
  }

  // コミットされていない変更をチェック（ステージ済み・未ステージ）
  const hasStagedChanges = run("git diff --cached --quiet") === null;
  const hasUnstagedChanges = run("git diff --quiet") === null;

  if (hasStagedChanges || hasUnstagedChanges) {
    blockStop(
      `ブランチ '${branch}' にコミットされていない変更があります。` +
        `完了前に Conventional Commits フォーマットで変更をコミットしてください。`
    );
  }

  // 未追跡ファイルをチェック
  const untracked = run("git ls-files --others --exclude-standard");
  if (untracked) {
    blockStop(
      `ブランチ '${branch}' に未追跡ファイルがあります。` +
        `完了前にステージしてコミットするか、.gitignore に追加してください。`
    );
  }

  // プッシュされていないコミットをチェック
  const remoteBranchExists = run(`git rev-parse --verify origin/${branch}`) !== null;

  if (!remoteBranchExists) {
    // リモートブランチが存在しない → 確実にプッシュされていない
    const hasLocalCommits = run("git log --oneline -1");
    if (hasLocalCommits) {
      blockStop(
        `ブランチ '${branch}' は origin にプッシュされていません。` +
          `'git push -u origin ${branch}' でプッシュし、Pull Request を作成してください。`
      );
    }
  } else {
    const unpushed = run(`git log origin/${branch}..HEAD --oneline`);
    if (unpushed) {
      blockStop(
        `ブランチ '${branch}' にプッシュされていないコミットがあります。` +
          `プッシュして Pull Request を作成してください。`
      );
    }
  }

  // このブランチに PR が存在するかチェック（gh CLI が利用可能な場合のみ）
  const ghAvailable = run("gh --version") !== null;
  if (ghAvailable) {
    const prUrl = run("gh pr view --json url -q '.url'");
    if (!prUrl) {
      blockStop(
        `ブランチ '${branch}' の Pull Request が存在しません。` +
          `'gh pr create' で PR を作成してください。`
      );
    }
  }

  // すべてのチェックに合格
  process.exit(0);
}

main();
