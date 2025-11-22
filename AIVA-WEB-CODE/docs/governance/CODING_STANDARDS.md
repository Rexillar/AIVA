## AIVA Coding Standards

This document defines the coding standards across the AIVA codebase. We use strict rules to ensure consistent, secure, maintainable code.

General
- Write clean and readable code.
- Keep functions small and focused; one responsibility per module.
- Follow the style guide for JavaScript, React, and Tailwind (see `STYLE_GUIDE.md`).

Backend (Node/Express)
- Use `const` by default, `let` when needed, and never use `var`.
- Keep controllers minimal; service files hold business logic.
- All async functions must use `try/catch` and throw structured errors.
- Validate input with `Joi` and sanitize outputs.
- Use `helmet`, `csurf`, and secure cookie settings.
- No secrets in the repo.
- Use `mongoose` models with clear validation.

Frontend (React + Redux Toolkit)
- Use functional components and hooks exclusively.
- Avoid side-effects inside components; use RTK Query or Manager services for API calls.
- Keep presentational and container components separate.
- Place reusable UI components under `/client/src/components`.
- Keep CSS/Tailwind classes grouped in the order: layout, spacing, typography, color, effects.

Testing
- Write unit and integration tests for critical flows: auth, socket events, tasks, workspaces.
- Use Jest for backend tests and Vitest or Jest for frontend tests.

Commits & Pull Requests
- Use Conventional Commits.
- Pull requests should be atomic, include tests and documentation, and link to an active issue.

