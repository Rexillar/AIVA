# Security Policies

We take security seriously. Please follow these guidelines to keep the project and your data safe.

## 🚫 Never Commit Secrets

-   **Environment Variables**: Never commit `.env` files containing real API keys, database passwords, or JWT secrets. Use `.env.example` templates instead.
-   **Keys/Certificates**: Never commit private keys (SSH, SSL/TLS) to the repository.

## 🚫 Build Artifacts

We explicitly **DO NOT** commit build artifacts (folders like `dist/`, `build/`, `.next/`).
-   It bloats the repository history.
-   It creates a security risk (leaking old configs or code map details).
-   **Solution**: Builds should be generated fresh via Docker or your CI/CD pipeline.

## Reporting Vulnerabilities

If you discover a security vulnerability in AIVA, please **DO NOT** open a public issue.
Instead, please contact the maintainers directly or use GitHub's private vulnerability reporting feature if enabled.

## Dependency Updates

We monitor our dependencies (NPM packages, Docker base images) for known vulnerabilities. Please keep your dependencies up to date by running `npm audit` and rebuilding your Docker images regularly.
