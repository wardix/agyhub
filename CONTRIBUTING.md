# Contributing to ConvHub

Thank you for your interest in contributing to ConvHub! This guide will help you get started.

## Prerequisites

- [Bun](https://bun.sh/) (v1.1+) — runtime for both frontend and backend
- [Node.js](https://nodejs.org/) (v20+) — needed for some Vite tooling
- [PostgreSQL](https://www.postgresql.org/) (v15+) — database
- [Git](https://git-scm.com/)

## Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/wardix/convhub.git
cd convhub
```

### 2. Set up PostgreSQL

Create the database:

```bash
createdb convhub_dev
```

### 3. Set up the backend

```bash
cd backend
cp .env.example .env        # Copy and edit environment variables
bun install
bun run db:migrate           # Run database migrations
bun run dev                  # Start the API server (default: http://localhost:3000)
```

Required environment variables in `backend/.env`:
```
DATABASE_URL=postgres://localhost:5432/convhub_dev
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### 4. Set up the frontend

```bash
cd frontend
bun install
bun run dev                  # Start the dev server (default: http://localhost:5173)
```

The frontend proxies API requests to the backend automatically via Vite's proxy config.

## Development Workflow

### Branch naming

Use descriptive branch names prefixed with the type:
- `feat/upload-conversation` — new feature
- `fix/login-redirect` — bug fix
- `docs/api-endpoints` — documentation
- `refactor/auth-middleware` — code refactoring

### Making changes (TDD Workflow)

This project uses **Test-Driven Development**. Every feature and bug fix must follow this workflow:

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Write a failing test first** (Red):
   ```bash
   # Backend
   cd backend && bun test src/routes/auth.test.ts     # Should fail

   # Frontend
   cd frontend && bun run test src/utils/transcript.test.ts   # Should fail
   ```

3. **Write minimum code to pass the test** (Green):
   - Implement just enough to make the test pass
   - Run the test again to verify it passes

4. **Refactor** while keeping tests green:
   - Clean up the code
   - Run `bun test` (backend) or `bun run test` (frontend) to ensure nothing breaks

5. **Repeat** for the next piece of functionality.

6. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "test: add tests for auth register endpoint"
   git commit -m "feat: implement auth register endpoint"
   git commit -m "test: add tests for invalid email validation"
   git commit -m "fix: handle empty JSONL files gracefully"
   ```

7. Push and create a pull request:
   ```bash
   git push origin feat/your-feature-name
   ```

### Test Setup

#### Backend (Bun test runner)

Tests run with Bun's built-in test runner. No additional setup required.

```bash
cd backend
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test src/routes/        # Run tests in a specific directory
```

For integration tests that require a database, set up a test database:

```bash
createdb convhub_test
```

Set `DATABASE_URL` in your test environment to point to `convhub_test`.

#### Frontend (Vitest)

```bash
cd frontend
bun run test                # Run all tests
bun run test:watch          # Watch mode
bun run test:coverage       # With coverage report
```

### Pull Request Guidelines

- **Reference the issue number** in the PR title or description (e.g., `Closes #12`).
- **Describe what changed** and why.
- **List any new dependencies** added.
- **Include screenshots** for UI changes.
- Keep PRs focused — one feature or fix per PR.
- **PRs without tests will be rejected.** Every new function, endpoint, and component must have tests.
- Tests must have been written **before** the implementation code (TDD).

## Code Style (enforced by Biome.js)

This project uses [Biome.js](https://biomejs.dev/) for formatting and linting. All rules are defined in `biome.json` at the project root.

**Key style rules:**
- 2-space indentation, single quotes, no semicolons, trailing commas
- 80 character max line width
- `any` type is forbidden — use `unknown` with type guards
- Unused variables and imports are errors
- CSS Modules for frontend styling
- Raw SQL with parameterized queries on the backend
- Named exports for React components
- Conventional commit messages

**Available commands (run from project root):**

```bash
bun run check         # Check lint + formatting (report only)
bun run check:fix     # Auto-fix lint + formatting issues
bun run lint          # Lint only
bun run format        # Format check only
```

**Automated enforcement:**
- **Pre-commit hook** (Husky + lint-staged): automatically runs `biome check --write` on staged files. If unfixable errors exist, the commit is blocked.
- **Pre-push hook** (Husky): runs all tests. If tests fail, the push is blocked.

> After cloning, run `bun install` at the project root to set up Husky hooks automatically.

## Database Migrations

When modifying the database schema:

1. Create a new numbered SQL file in `backend/src/db/migrations/`:
   ```
   007_your_migration_name.sql
   ```

2. Write idempotent SQL (use `IF NOT EXISTS` where possible).

3. Test the migration locally before submitting.

## Need Help?

- Check existing issues for context
- Read the [AGENTS.md](.agents/AGENTS.md) for architecture decisions
- Open a discussion if you're unsure about an approach

Thank you for contributing! 🚀
