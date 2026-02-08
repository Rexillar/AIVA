# Contributing to AIVA

Thank you for your interest in contributing! We welcome contributions from the community.

## Workflow

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally.
3.  **Create a branch** for your specific feature or fix (`git checkout -b feature/amazing-feature`).
4.  **Make your changes**. Refer to the [Development Guide](./development.md).
5.  **Commit your changes**.
6.  **Push to your fork**.
7.  **Open a Pull Request (PR)** against the `main` branch of the original repository.

## Commit Guidelines

We use **Conventional Commits** to ensure our versioning and changelogs are automated and clean.

**Format**: `type(scope): subject`

**Common Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `chore`: Maintenance tasks

**Examples**:
- `feat(tasks): add priority sorting to task list`
- `fix(auth): resolve token expiration issue`
- `docs: update installation instructions`

## Pull Request Guidelines

-   Provide a clear description of what changed and why.
-   Link to any relevant Issues (`Fixes #123`).
-   Ensure CI checks pass.
