---
name: pr-creation
description: >
  Pull Request creation best practices using gh CLI.
  Use when creating PRs on GitHub. Detects repository PR templates,
  generates title and body from commit history, handles gh CLI setup.
user-invocable: false
---

# Pull Request Creation

## Prerequisites

Before creating a PR, verify:

1. **gh CLI is available**:
```bash
gh --version
```
If not installed, tell the user:
```
gh CLI is required for PR creation. Install it:
  macOS:   brew install gh
  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
Then authenticate: gh auth login
```

2. **Authentication**:
```bash
gh auth status
```
If not authenticated: `gh auth login`

3. **No existing PR for this branch**:
```bash
gh pr view --json url -q '.url' 2>/dev/null
```
If a PR already exists, report its URL and skip creation.

## Detect Default Branch

```bash
git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}'
```

Fallback: check for `main`, then `master`.

## PR Template Detection

Check for repository PR templates in order:

```bash
cat .github/pull_request_template.md 2>/dev/null || \
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || \
cat .github/PULL_REQUEST_TEMPLATE/pull_request_template.md 2>/dev/null || \
cat docs/pull_request_template.md 2>/dev/null || \
cat pull_request_template.md 2>/dev/null || \
echo ""
```

If a template is found, fill it in with the actual change information.

## PR Title

- Use Conventional Commits format: `<type>(<scope>): <description>`
- Maximum 70 characters
- No emoji
- If single commit: use that commit message as the title
- If multiple commits: summarize the overall change

## PR Body (when no template)

Use this default structure:

```markdown
## Summary
<!-- 1-3 sentences describing the overall change -->

## Changes
<!-- Bullet list of specific changes -->
-
-

## Test Plan
<!-- How to verify the changes work -->
-
```

Fill in each section from `git log` and `git diff` analysis.

## Creating the PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<body content>
EOF
)" --base <default-branch>
```

Always use a HEREDOC for the body to handle multiline content and special characters.

## PR Size Guidelines

Check the change size:
```bash
git diff origin/<default-branch>..HEAD --shortstat
```

| Size | Lines Changed | Action |
|------|--------------|--------|
| Small | ~200 | Optimal, create PR |
| Medium | 200-400 | Good, create PR |
| Large | 400-800 | Warn user, suggest splitting in future |
| XL | 800+ | Strongly warn, suggest splitting |

Create the PR regardless of size, but include a note about size in large PRs.

## Error Handling

- **gh not installed**: Show installation instructions, skip PR creation
- **Not authenticated**: Show `gh auth login`, skip PR creation
- **PR already exists**: Report existing PR URL
- **Push not done yet**: Push first, then create PR
- **No commits**: Report "No changes to include in PR"
