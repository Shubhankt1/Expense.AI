# Contributing to Expense.AI

Thanks for your interest in contributing! This guide explains how to set up the project, make changes, and submit high‑quality pull requests.

---

## Code of Conduct

Be respectful, constructive, and inclusive. Harassment or abusive behavior will not be tolerated.

---

## Getting Started

### 1) Fork and clone

```bash
git clone https://github.com/<your-username>/Expense.AI.git
cd Expense.AI
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create `.env.local` and set:

```env
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 4) Run locally

```bash
npm run dev
```

---

## Development Workflow

1. Create a branch: `feat/<short-name>` or `fix/<short-name>`.
2. Make changes and keep commits focused.
3. Run checks:

```bash
npm run lint
npm run build
```

---

## Assignment Policy (Required)

To avoid duplicate work, every change **must** be tied to an issue and assigned before work begins.

### How assignment works

1. **Create or find an issue** describing the work.
2. **Comment on the issue** requesting assignment (e.g., “Requesting assignment”).
3. **Wait for a maintainer to assign you**.

### Enforcement

- PRs **without an assigned issue** will be closed without review.
- PRs **not linked to an issue** will be closed without review.
- If multiple contributors start work without assignment, **only the assignee’s PR** will be accepted.

### Link the issue in your PR

Include: `Closes #<issue-number>` in the PR description.

---

## Coding Standards

- Use TypeScript with strict typing.
- Keep components small and focused.
- Avoid `any` unless absolutely necessary.
- Prefer descriptive names and clear intent.
- Follow existing patterns in `src/` and `convex/`.

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples

```
feat: add monthly summary widget
feat(budgets): add budget limit notifications
fix: correct budget calculation logic
docs: update installation instructions
refactor(transactions): simplify date filtering
perf: optimize spending chart rendering
test: add unit tests for date utils
chore: update dependencies
```

---

## Pull Requests

- Explain **what** changed and **why**.
- Include screenshots for UI changes.
- Link related issues if applicable.
- Ensure all checks pass.

---

## Reporting Issues

If you find a bug, open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Logs or screenshots (if relevant)

---

Thanks for helping make Expense.AI better!
