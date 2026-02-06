# git-workflow

Claude Code plugin for automated GitHub Flow with Conventional Commits.

## What it does

When this plugin is active, Claude automatically follows the GitHub Flow workflow during development:

1. **Branch check** -- Before any code change, checks the current branch state and creates a feature branch if needed
2. **Implement** -- Makes the requested code changes
3. **Commit** -- Creates commits using Conventional Commits format (`feat:`, `fix:`, etc.)
4. **Push** -- Pushes the branch to origin
5. **Create PR** -- Creates a Pull Request using `gh` CLI

You don't need to run any slash commands. Just ask Claude to implement a feature or fix a bug, and it handles the entire git workflow automatically.

## Requirements

- [gh CLI](https://cli.github.com/) installed and authenticated (`gh auth login`)
- Git repository with a remote configured

## Installation

### From this marketplace

```bash
# 1. マーケットプレイスを追加
/plugin marketplace add daichitomita/git-workflow

# 2. プラグインをインストール
/plugin install git-workflow@daichitomita-plugins
```

### Local testing

```bash
claude --plugin-dir /path/to/git-workflow
```

## Components

### Skills (auto-invoked)

| Skill | Purpose |
|-------|--------|
| `github-flow` | Core workflow orchestration -- teaches Claude the full branch/commit/push/PR flow |
| `branch-naming` | Branch naming conventions: `{type}/{kebab-case-description}` |
| `commit-convention` | Conventional Commits format: `<type>(<scope>): <description>` |
| `pr-creation` | PR creation with `gh` CLI, template detection, title/body generation |

All skills are `user-invocable: false` -- Claude loads them automatically when relevant. No slash commands needed.

### Hooks

| Event | Purpose |
|-------|--------|
| `PreToolUse` (Bash) | Blocks dangerous git commands: `--force`, `reset --hard`, `clean -f`, direct push to main |
| `Stop` | Prevents Claude from stopping with uncommitted changes, unpushed commits, or missing PR |

### Safety Guards

The plugin blocks these dangerous operations:
- `git push --force` / `git push -f`
- `git reset --hard`
- `git checkout -- .`
- `git clean -f`
- `git branch -D`
- Direct push to `main` / `master`

## Conventions

### Branch Naming
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
