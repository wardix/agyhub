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

### Making changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes, following the code style rules in [.agents/AGENTS.md](.agents/AGENTS.md).

3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add conversation upload endpoint"
   git commit -m "fix: handle empty JSONL files gracefully"
   git commit -m "docs: add API endpoint documentation"
   ```

4. Push and create a pull request:
   ```bash
   git push origin feat/your-feature-name
   ```

### Pull Request Guidelines

- **Reference the issue number** in the PR title or description (e.g., `Closes #12`).
- **Describe what changed** and why.
- **List any new dependencies** added.
- **Include screenshots** for UI changes.
- Keep PRs focused — one feature or fix per PR.

## Code Style

See [.agents/AGENTS.md](.agents/AGENTS.md) for detailed code style rules. Key points:

- TypeScript strict mode, no `any` types
- CSS Modules for frontend styling
- Raw SQL with parameterized queries on the backend
- Named exports for React components
- Conventional commit messages

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
