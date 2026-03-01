# Contributing to AIVA

**Last Updated**: March 2026

Thank you for contributing to AIVA! This guide covers the workflow, standards, and conventions to follow.

---

## Development Setup

See [Getting Started](./getting-started.md) for setting up your local development environment.

---

## Workflow

### 1. Create a Branch
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feat/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `chore/` — Tooling, dependencies, CI changes

### 2. Make Changes
- Write code following the conventions below
- Test your changes locally (both server and client)
- Ensure no ESLint errors: `npm run lint`

### 3. Commit
We enforce **Conventional Commits** via commitlint:

```bash
# Format
<type>(<scope>): <description>

# Examples
feat(notes): add AI formatting with Gemini
fix(encryption): handle nested field decryption in lean queries
docs(api): update API endpoints documentation
refactor(canvas): remove frame tool
chore(deps): update TipTap to v2.5
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

**Scopes** (optional): `auth`, `tasks`, `notes`, `canvas`, `chat`, `habits`, `workspace`, `encryption`, `ai`, `api`, `deps`, `docker`

### 4. Push & Create PR
```bash
git push origin feat/your-feature-name
```

Create a Pull Request with:
- Clear title following conventional commit format
- Description of what changed and why
- Screenshots for UI changes
- Testing steps

---

## Code Conventions

### General
- Use ES modules (`import`/`export`) — both server and client
- Use `async`/`await` over raw Promises
- Use `const` by default, `let` when needed, never `var`
- Keep functions focused and under 50 lines where possible

### Backend (Node.js/Express)
- Controllers handle HTTP concerns; services handle business logic
- Always wrap async route handlers with try/catch
- Use named exports for controller functions
- Add `authMiddleware` to all protected routes
- Use `validationMiddleware` for input validation
- Never use `.lean()` on encrypted models without `decryptDocument()`

### Frontend (React)
- Functional components with hooks only
- Use RTK Query for API calls (mutation + query hooks)
- Use Tailwind CSS utility classes; avoid inline styles
- Support dark mode — use `dark:` Tailwind variants
- Keep page components in `client/src/pages/`
- Keep reusable components in `client/src/components/`
- Add RTK Query API slices in `client/src/redux/slices/api/`

### File Naming
- React components: `PascalCase.jsx` (e.g., `TaskDetails.jsx`)
- Everything else: `camelCase.js` (e.g., `taskController.js`)
- Route files: `camelCase.js` with `Routes` suffix (e.g., `taskRoutes.js`)
- Model files: lowercase singular (e.g., `task.js`, `note.js`)

---

## Adding New Features Checklist

When adding a new feature, ensure all layers are covered:

- [ ] **Model** — Mongoose schema in `server/models/` (if new data)
- [ ] **Service** — Business logic in `server/services/` (if complex)
- [ ] **Controller** — Route handler in `server/controllers/`
- [ ] **Route** — Express route in `server/routes/`
- [ ] **Mount** — Route mounted in `server/routes/index.js` or `server/server.js`
- [ ] **RTK Query** — API slice in `client/src/redux/slices/api/`
- [ ] **Page/Component** — UI in `client/src/pages/` or `client/src/components/`
- [ ] **Sidebar** — Navigation link if user-facing page
- [ ] **Dark mode** — Test both light and dark themes
- [ ] **Encryption** — Encrypt sensitive fields if the model stores user content
- [ ] **Workspace scoping** — Scope queries to workspace if feature is workspace-aware
- [ ] **Documentation** — Update relevant docs

---

## Git Hooks

Configured via `commitlint.config.cjs` and `lint-staged.config.js`:

- **commitlint**: Validates commit message format on every commit
- **lint-staged**: Runs ESLint on staged `.js`/`.jsx` files before commit

To bypass hooks in emergencies (not recommended):
```bash
git commit --no-verify -m "emergency fix"
```

---

## Reporting Issues

When reporting bugs:
1. Describe the expected vs. actual behavior
2. Include steps to reproduce
3. Note the browser, Node.js version, and OS
4. Include console errors or screenshots if applicable
5. Tag with relevant labels (bug, enhancement, docs)

---

## Questions?

See [FAQ](./faq.md) or open a discussion on the repository.
