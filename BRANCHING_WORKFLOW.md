# Git Branching Workflow Guide

## Overview
This project uses a simple feature branch workflow to keep `main` stable and allow parallel development.

## Branch Types

### `main`
- **Purpose**: Production-ready code
- **Rule**: Always deployable, never commit directly
- **Protection**: Merge only via pull requests or after review

### `feature/*`
- **Purpose**: New features or enhancements
- **Examples**: 
	- `feature/rate-limiting`
	- `feature/input-validation`
	- `feature/user-dashboard`

### `bugfix/*`
- **Purpose**: Bug fixes
- **Examples**:
	- `bugfix/auth-session-timeout`
	- `bugfix/employee-deletion-error`

### `refactor/*`
- **Purpose**: Code improvements without changing functionality
- **Examples**:
	- `refactor/error-handling`
	- `refactor/api-response-format`

## Common Workflow

### 1. Starting a New Feature
```bash
# Make sure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to new feature branch
git checkout -b feature/your-feature-name

# Start working...
```

### 2. Working on Your Branch
```bash
# Make changes, then commit
git add .
git commit -m "feat: add rate limiting to auth routes"

# Push your branch (first time)
git push -u origin feature/your-feature-name

# Continue working and pushing
git add .
git commit -m "fix: adjust rate limit window"
git push
```

### 3. Merging Back to Main
```bash
# Option A: Merge locally (for simple changes)
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main

# Option B: Create Pull Request on GitHub (recommended)
# 1. Push your branch
# 2. Go to GitHub and create a Pull Request
# 3. Review and merge via GitHub UI
```

### 4. Cleaning Up
```bash
# After merging, delete the branch
git checkout main
git branch -d feature/your-feature-name  # local
git push origin --delete feature/your-feature-name  # remote
```

## Best Practices

1. **Keep branches small**: One feature per branch
2. **Update frequently**: Rebase or merge `main` into your branch regularly
	 ```bash
	 git checkout feature/your-feature
	 git fetch origin
	 git rebase origin/main
	 ```
3. **Use descriptive names**: `feature/rate-limiting` not `feature/stuff`
4. **Commit often**: Small, logical commits are easier to review
5. **Test before merging**: Make sure your branch works before merging to `main`

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Adding or updating tests

Examples:
```
feat: add rate limiting to authentication routes
fix: resolve session timeout issue for province admins
refactor: extract HttpError to shared utility module
```

## Handling Conflicts

If you encounter conflicts when merging:

```bash
# Update your branch with latest main
git checkout feature/your-feature
git fetch origin
git rebase origin/main

# Resolve conflicts in your editor
# Then continue rebase
git add .
git rebase --continue

# Force push (only on your feature branch!)
git push --force-with-lease origin feature/your-feature
```

## Quick Reference

```bash
# List all branches
git branch -a

# Switch branches
git checkout branch-name

# Create and switch to new branch
git checkout -b feature/new-feature

# See what branch you're on
git branch

# See branch status
git status
```

---

**Remember**: `main` should always be stable and deployable. Use branches for all development work!

