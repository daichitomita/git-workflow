---
name: github-flow
description: >
  GitHub Flow development workflow. When implementing features, fixing bugs,
  or making any code changes in a git repository, follow this workflow automatically:
  check branch state, create a feature branch if needed, implement changes,
  commit with Conventional Commits, push to remote, and create a Pull Request.
  Applies whenever the user asks to implement, fix, add, update, refactor, or change code.
user-invocable: false
---

# GitHub Flow Development Workflow

When you receive a development task (implement, fix, add, update, refactor, or change code) in a git repository, follow this workflow automatically. Do NOT wait for the user to ask you to commit, push, or create a PR -- do it proactively as part of completing the task.

## Step 0: Pre-Work Branch Check (MANDATORY)

Before making ANY code changes, always check the current branch state:

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

If not in a git repository, skip the entire workflow and just implement the changes normally.

If in a git repository:

```bash
git fetch origin 2>/dev/null
git branch --show-current
git status
```

### Decision Tree

**Case A: On main/master and up to date with remote**
1. Create a feature branch based on the task description
2. Use the branch-naming conventions (see branch-naming skill)
3. Start working on the new branch

```bash
git checkout -b <type>/<kebab-case-description>
```

**Case B: On main/master but NOT up to date**
1. Pull the latest changes first
2. Then create a feature branch

```bash
git pull origin main
git checkout -b <type>/<kebab-case-description>
```

**Case C: On a feature branch (not main/master)**
1. Tell the user the current branch name
2. Ask: "Currently on branch `<branch-name>`. Should I continue working on this branch, or create a new branch?"
3. Wait for the user's response before proceeding

### Detecting the Default Branch

```bash
git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}'
```

Fallback: check if `main` exists, then `master`.

## Step 1: Implement Changes

Proceed with the actual development work the user requested. Write code, edit files, run tests, etc.

## Step 2: Commit

After completing the implementation:

1. Review what changed:
```bash
git diff --stat
git diff --staged --stat
```

2. Stage the changes. Prefer staging specific files over `git add -A`:
```bash
git add <specific-files>
```

3. Create a commit using Conventional Commits format (see commit-convention skill):
```bash
git commit -m "<type>(<scope>): <description>"
```

Rules:
- One commit per logical change
- If changes span multiple unrelated areas, split into multiple commits
- Never include a Co-Authored-By header (Claude Code adds this automatically)

## Step 3: Push

Push the branch to the remote:

```bash
git push -u origin $(git branch --show-current)
```

If the push is rejected due to remote changes:
```bash
git pull --rebase origin $(git branch --show-current)
git push -u origin $(git branch --show-current)
```

Rules:
- NEVER use `git push --force` or `git push -f`
- Always use `-u` to set up tracking on the first push

## Step 4: Create Pull Request

Create a PR using the `gh` CLI:

1. Check for a repository PR template:
```bash
cat .github/pull_request_template.md 2>/dev/null || \
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || \
echo ""
```

2. Generate the PR title and body (see pr-creation skill)

3. Create the PR:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)" --base <default-branch>
```

4. Report the PR URL to the user

## Safety Rules

- NEVER push directly to main/master
- NEVER use `git push --force`
- NEVER use `git reset --hard`
- NEVER use `git clean -f`
- If a merge conflict occurs, stop and explain it to the user
- If `gh` CLI is not installed, tell the user to install it and skip PR creation

## When to Ask the User

- **Always ask**: When on a feature branch and need to decide whether to continue or create new branch (Step 0 Case C)
- **Don't ask**: Branch creation from main, committing, pushing, PR creation -- just do it
- **Ask if unsure**: Branch name when the task description is ambiguous
