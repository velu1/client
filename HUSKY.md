# Husky Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks. These hooks help maintain code quality by running automated checks before certain Git actions.

## Hooks Configuration

### pre-commit

Runs before you commit code to ensure it meets quality standards:

- Lints code with ESLint
- Builds the project to catch compilation errors

```bash
npm run lint && npm run build
```

### pre-push

Runs before you push to the remote repository:

- Lints code with ESLint

```bash
npm run lint
```

### commit-msg

Validates commit messages to ensure they follow the Conventional Commits format:

- Format: `type(scope): message`
- Example: `feat(auth): add login functionality`
- Valid types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert

## Installation

Husky is automatically installed when you run `npm install` thanks to the prepare script in package.json:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## Bypassing Hooks

If you need to bypass hooks in specific situations:

```bash
# Skip pre-commit hooks
git commit -m "message" --no-verify

# Skip pre-push hooks
git push --no-verify
```

Note: Bypassing hooks should be done only in exceptional cases.
