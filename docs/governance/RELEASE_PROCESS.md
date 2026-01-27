# Release Process

We follow Semantic Versioning (MAJOR.MINOR.PATCH) and a GitHub-release driven process.

Process:
1. All releases should be linked to a milestone.
2. Use Conventional Commits to generate changelogs and to determine version bumps.
3. For major changes, create a draft release and request a release review from `@mohitrajsinhjadeja` and `@core-team`.
4. Tag releases using GitHub release UI or `git tag -a v1.2.3 -m "Release notes"`.

Changelog
- Changelogs must be produced using the Conventional Commit history either manually or via tools (e.g., `standard-version` or `release-drafter`).

Hotfixes
- Quick-fix patches follow the same process but must be accompanied by a test confirming the fix.

Branching and Releases
- `main` always contains the latest stable release code.
- `develop` for integration and PR merging.
- Feature branches: `feat/<short-description>`, Bugfix: `fix/<short-description>`.

