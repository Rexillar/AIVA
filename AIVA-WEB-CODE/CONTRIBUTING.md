## Contributing to AIVA

This file has moved. Please see `docs/governance/CONTRIBUTING.md` for the canonical contribution guidelines.

If you prefer to edit these files directly, they are stored in `docs/governance/` for versioning and editing.

Before contributing, please read these guidelines and ensure your contribution follows our standards.

1. Follow the code style and commit message rules in `CODING_STANDARDS.md`.
2. Open an issue before working on a large feature so maintainers can provide feedback.
3. Create a focused branch named `feat/<short-description>` or `fix/<short-description>`.
4. If your change affects functionality, include tests in the appropriate place (client/server).
5. Open a Pull Request with a clear description, related issue, and a short summary of changes.
6. All PRs should include any documentation updates required for the change.

We enforce Conventional Commits; please read `CODING_STANDARDS.md` for examples.

When contributing security-related issues, please follow the `SECURITY.md` process.
Developer Setup
1. Install dependencies and bootstrap the workspace (recommended) to enable husky pre-commit hooks and lint-staged:

```pwsh
cd "D:\\final\\secured\\AIVA - Copy\\AIVA-WEB-CODE"
npm run setup
```

2. If you want to enable hooks manually, run:

```pwsh
npm run prepare
```

3. Install server and client dependencies (alternative):

```pwsh
cd "D:\\final\\secured\\AIVA - Copy\\AIVA-WEB-CODE"
npm --prefix server ci
npm --prefix client ci
```

Note: When running `npm --prefix` from inside the `AIVA-WEB-CODE` folder, use `server`/`client` instead of `AIVA-WEB-CODE/server`. If you're running commands from the workspace root (outside `AIVA-WEB-CODE`), you can specify the path relative to the workspace root: `npm --prefix AIVA-WEB-CODE/server ci`.

If `npm run setup` errors with lockfile mismatch (EUSAGE), run the following to refresh the top-level lockfile and retry:

```pwsh
cd "D:\\final\\secured\\AIVA - Copy\\AIVA-WEB-CODE"
npm install
npm run setup
```


Thanks for helping keep AIVA high-quality and secure!
