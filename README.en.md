**English** | [日本語](./README.md)

# git-workflow

A Claude Code plugin that automates GitHub Flow and Conventional Commits.

## Overview

Once enabled, this plugin makes Claude automatically follow the GitHub Flow workflow during development:

1. **Branch check** -- Before making code changes, check the current branch state and create a feature branch if needed
2. **Implementation** -- Execute the requested code changes
3. **Commit** -- Create commits in Conventional Commits format (`feat:`, `fix:`, etc.)
4. **Push** -- Push the branch to origin
5. **PR creation** -- Create a Pull Request using the `gh` CLI

No slash commands needed. Just ask Claude to implement a feature or fix a bug, and it will handle the entire git workflow automatically.

## Requirements

- [gh CLI](https://cli.github.com/) installed and authenticated (`gh auth login`)
- A Git repository with a configured remote

## Installation

### From Marketplace

```bash
# 1. Add the marketplace
/plugin marketplace add daichitomita/git-workflow

# 2. Install the plugin
/plugin install git-workflow@daichitomita-plugins
```

### Local Testing

```bash
claude --plugin-dir /path/to/git-workflow
```

## Components

### Skills (Auto-triggered)

| Skill | Role |
|-------|------|
| `github-flow` | Orchestrates the entire workflow -- teaches Claude the branch/commit/push/PR flow |
| `branch-naming` | Branch naming convention: `{type}/{kebab-case-description}` |
| `commit-convention` | Conventional Commits format: `<type>(<scope>): <description>` |
| `pr-creation` | PR creation via `gh` CLI, template detection, title/body generation |

All skills are `user-invocable: false`. Claude loads them automatically as needed, so no slash commands are required.

### Hooks

| Event | Role |
|-------|------|
| `PreToolUse` (Bash) | Blocks dangerous git commands: `--force`, `reset --hard`, `clean -f`, direct push to main |
| `Stop` | Prevents Claude from stopping with uncommitted changes, unpushed commits, or uncreated PRs |

### Safety Guards

The following dangerous operations are blocked:

- `git push --force` / `git push -f`
- `git reset --hard`
- `git checkout -- .`
- `git clean -f`
- `git branch -D`
- Direct push to `main` / `master`

## Conventions

### Branch Names

```
feat/add-user-auth
fix/resolve-login-bug
docs/update-readme
chore/upgrade-dependencies
```

### Commit Messages

```
feat(auth): add JWT token validation
fix: resolve null pointer in user lookup
docs: update API endpoint documentation
```

### Supported Types

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`

## License

MIT
