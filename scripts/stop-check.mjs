#!/usr/bin/env node

/**
 * Stop hook: checks if the git workflow is complete before allowing Claude to stop.
 *
 * Checks (in order):
 *   1. Is stop_hook_active true? → allow stop (prevent infinite loop)
 *   2. Is this a git repository?
 *   3. Are we on a feature branch? (skip on main/master)
 *   4. Are there uncommitted changes?
 *   5. Are there untracked files?
 *   6. Are there unpushed commits?
 *   7. Is there an open PR for this branch?
 *
 * Exit codes:
 *   0 = allow stop
 *   2 = block stop (stderr message is shown to Claude)
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

  // Prevent infinite loop: if stop hook is already active, allow stop
  if (input?.stop_hook_active === true) {
    process.exit(0);
  }

  // Not a git repo? Allow stop
  if (run("git rev-parse --is-inside-work-tree") === null) {
    process.exit(0);
  }

  const branch = run("git rev-parse --abbrev-ref HEAD");

  // On main/master or detached HEAD? Allow stop
  if (!branch || ["main", "master", "HEAD"].includes(branch)) {
    process.exit(0);
  }

  // Check for uncommitted changes (staged or unstaged)
  const hasStagedChanges = run("git diff --cached --quiet") === null;
  const hasUnstagedChanges = run("git diff --quiet") === null;

  if (hasStagedChanges || hasUnstagedChanges) {
    blockStop(
      `There are uncommitted changes on branch '${branch}'. ` +
        `Please commit your changes using Conventional Commits format before finishing.`
    );
  }

  // Check for untracked files
  const untracked = run("git ls-files --others --exclude-standard");
  if (untracked) {
    blockStop(
      `There are untracked files on branch '${branch}'. ` +
        `Please stage and commit them, or add them to .gitignore, before finishing.`
    );
  }

  // Check for unpushed commits
  const remoteBranchExists = run(`git rev-parse --verify origin/${branch}`) !== null;

  if (!remoteBranchExists) {
    // Remote branch doesn't exist → definitely unpushed
    const hasLocalCommits = run("git log --oneline -1");
    if (hasLocalCommits) {
      blockStop(
        `Branch '${branch}' has not been pushed to origin. ` +
          `Please push with 'git push -u origin ${branch}' and create a Pull Request.`
      );
    }
  } else {
    const unpushed = run(`git log origin/${branch}..HEAD --oneline`);
    if (unpushed) {
      blockStop(
        `There are unpushed commits on branch '${branch}'. ` +
          `Please push and create a Pull Request.`
      );
    }
  }

  // Check if PR exists for this branch (only if gh CLI is available)
  const ghAvailable = run("gh --version") !== null;
  if (ghAvailable) {
    const prUrl = run("gh pr view --json url -q '.url'");
    if (!prUrl) {
      blockStop(
        `No Pull Request exists for branch '${branch}'. ` +
          `Please create a PR with 'gh pr create'.`
      );
    }
  }

  // All checks passed
  process.exit(0);
}

main();
