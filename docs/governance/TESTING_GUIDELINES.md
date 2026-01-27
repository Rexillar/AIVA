# Testing Guidelines

We use automated tests to protect core functionality and maintain confidence during refactors.

Frameworks
- Backend: Jest + Supertest for API/Integration tests.
- Frontend: Vitest or Jest + React Testing Library.
- E2E: Playwright or Cypress if needed for major UI flows.

Writing Tests
- Unit tests should be small and cover logic paths, edge cases, and error conditions.
- Integration tests should run against test database instances and mock external APIs.
- Include tests for authentication flows, authorization (role-based), socket event stability, and storage/file upload flows.

CI
- Run unit and integration test suites in GitHub Actions before merging PRs.

Test Data
- Use fixtures and factories for consistent test data.

Coverage
- No hard coverage % mandated, but critical flows must be covered by tests.

