#!/usr/bin/env node

/**
 * PreToolUse フック: 危険な git コマンドをブロックする。
 *
 * 標準入力からフック入力の JSON を読み取り、Bash コマンドを
 * 危険なパターンのリストと照合し、一致した場合は拒否の判定を出力する。
 *
 * ブロックされる操作:
 *   - git push --force / -f
 *   - git reset --hard
 *   - git checkout -- .
 *   - git restore .
 *   - git clean -f
 *   - git branch -D
 *   - main/master への直接プッシュ
 */

const DANGEROUS_PATTERNS = [
  {
    pattern: /git\s+push\s+.*(-f\b|--force)/,
    reason:
      "git push --force はブロックされました。強制プッシュはリモート履歴を破壊する可能性があります。通常の push を使用してください。",
  },
  {
    pattern: /git\s+reset\s+--hard/,
    reason:
      "git reset --hard はブロックされました。ローカルの変更が不可逆的に失われます。git stash または git reset --soft を使用してください。",
  },
  {
    pattern: /git\s+checkout\s+--\s*\./,
    reason:
      "git checkout -- . はブロックされました。コミットされていない変更がすべて不可逆的に失われます。git stash を使用してください。",
  },
  {
    pattern: /git\s+restore\s+\.$|git\s+restore\s+--staged\s+--worktree\s+\./,
    reason:
      "git restore . はブロックされました。コミットされていない変更がすべて不可逆的に失われます。git stash を使用してください。",
  },
  {
    pattern: /git\s+clean\s+-[a-zA-Z]*f/,
    reason: "git clean -f はブロックされました。未追跡ファイルが不可逆的に削除されます。",
  },
  {
    pattern: /git\s+branch\s+-D\b/,
    reason:
      "git branch -D はブロックされました。安全なブランチ削除には git branch -d（小文字）を使用してください。",
  },
];

function checkDirectPushToMain(command) {
  if (/git\s+push\s+(origin\s+)?(main|master)\b/.test(command)) {
    // origin/main..HEAD のような diff 参照を許可する
    if (!/origin\/(main|master)\.\./.test(command)) {
      return "main/master への直接プッシュはブロックされました。フィーチャーブランチを作成し、Pull Request を使用してください。";
    }
  }
  return null;
}

function deny(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(output));
  process.exit(0);
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

  const command = input?.tool_input?.command ?? "";
  if (!command) {
    process.exit(0);
  }

  // 各危険パターンをチェック
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      deny(reason);
    }
  }

  // main/master への直接プッシュをチェック
  const mainPushReason = checkDirectPushToMain(command);
  if (mainPushReason) {
    deny(mainPushReason);
  }

  process.exit(0);
}

main();
