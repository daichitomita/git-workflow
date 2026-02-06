#!/usr/bin/env node

/**
 * PreToolUse hook: blocks dangerous git commands.
 *
 * Reads hook input JSON from stdin, checks the Bash command against
 * a list of dangerous patterns, and outputs a deny decision if matched.
 *
 * Blocked operations:
 *   - git push --force / -f
 *   - git reset --hard
 *   - git checkout -- .
 *   - git restore .
 *   - git clean -f
 *   - git branch -D
 *   - Direct push to main/master
 */

const DANGEROUS_PATTERNS = [
  {
    pattern: /git\s+push\s+.*(-f\b|--force)/,
    reason:
      "git push --force is blocked. Force pushing can destroy remote history. Use normal push instead.",
  },
  {
    pattern: /git\s+reset\s+--hard/,
    reason:
      "git reset --hard is blocked. This irreversibly destroys local changes. Use git stash or git reset --soft instead.",
  },
  {
    pattern: /git\s+checkout\s+--\s*\./,
    reason:
      "git checkout -- . is blocked. This irreversibly discards all uncommitted changes. Use git stash instead.",
  },
  {
    pattern: /git\s+restore\s+\.$|git\s+restore\s+--staged\s+--worktree\s+\./,
    reason:
      "git restore . is blocked. This irreversibly discards all uncommitted changes. Use git stash instead.",
  },
  {
    pattern: /git\s+clean\s+-[a-zA-Z]*f/,
    reason: "git clean -f is blocked. This irreversibly deletes untracked files.",
  },
  {
    pattern: /git\s+branch\s+-D\b/,
    reason:
      "git branch -D is blocked. Use git branch -d (lowercase) for safe branch deletion.",
  },
];

function checkDirectPushToMain(command) {
  if (/git\s+push\s+(origin\s+)?(main|master)\b/.test(command)) {
    // Allow diff references like origin/main..HEAD
    if (!/origin\/(main|master)\.\./.test(command)) {
      return "Direct push to main/master is blocked. Create a feature branch and use a Pull Request instead.";
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
  // Read stdin
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

  // Check each dangerous pattern
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      deny(reason);
    }
  }

  // Check direct push to main/master
  const mainPushReason = checkDirectPushToMain(command);
  if (mainPushReason) {
    deny(mainPushReason);
  }

  process.exit(0);
}

main();
