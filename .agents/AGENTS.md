# ConvHub — Agent & Contributor Rules

## Project Overview

**ConvHub** is a community platform where users share their Antigravity (AI coding assistant) conversation experiences by uploading JSONL transcript files. Think of it as "GitHub Gists for AI conversations" with full social features.

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite + TypeScript | SPA with React Router v7 |
| Backend | Hono + Bun + TypeScript | Lightweight, fast API server |
| Database | PostgreSQL | Raw SQL via Bun's built-in `Bun.sql` |
| Styling | CSS Modules | Dark mode default, light mode toggle |
| Auth | JWT (httpOnly cookies) | Email/password + Google OAuth |
| Markdown | react-markdown + remark-gfm | For rendering AI responses |
| Syntax Highlighting | highlight.js | For code blocks in transcripts |

## Project Structure

```
convhub/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── api/       # API client (all backend calls go through here)
│       ├── components/# Reusable UI components
│       ├── pages/     # Route page components
│       ├── hooks/     # Custom React hooks
│       ├── context/   # React contexts (Auth, Theme)
│       ├── types/     # Shared TypeScript types
│       └── utils/     # Utility functions
├── backend/           # Hono + Bun API server
│   └── src/
│       ├── db/        # Database connection + migrations
│       ├── routes/    # API route handlers
│       ├── middleware/ # Auth, CORS middleware
│       ├── utils/     # JWT, password hashing, validation
│       └── types/     # Shared TypeScript types
└── .agents/           # This file
```

## Code Style Rules

This project uses **Biome.js** for formatting and linting. All style rules are enforced automatically via `biome.json` at the project root.

### Formatting (enforced by Biome)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'hello'`), double quotes for JSX attributes
- **Semicolons**: None (ASI — Automatic Semicolon Insertion)
- **Trailing commas**: Always (ES5 style)
- **Line width**: 80 characters max
- **Line endings**: LF (Unix)
- **Arrow parentheses**: Always (`(x) => x`)
- **Bracket spacing**: Yes (`{ a, b }`)

### Linting (enforced by Biome)
- `noExplicitAny` — **error**: never use `any` (use `unknown` + type guards)
- `useConst` — **error**: use `const` if variable is not reassigned
- `noUnusedVariables` — **error**: no unused variables
- `noUnusedImports` — **error**: no unused imports
- `noVar` — **error**: never use `var`
- `noDoubleEquals` — **error**: use `===` instead of `==`
- `useImportType` — **error**: use `import type` for type-only imports
- `useTemplate` — **error**: use template literals over string concatenation

> **Note:** Test files (`*.test.ts`, `*.test.tsx`) are allowed to use `any` for mocking purposes.

### General
- **TypeScript strict mode** — enforced by both `tsconfig.json` and Biome.
- Use `async/await` over `.then()` chains.
- Use **conventional commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- **Always run `bun run check:fix` before committing** to auto-fix formatting and lint issues. The pre-commit hook does this automatically for staged files.

### Frontend
- **One component per file**, using named exports (not default exports).
- **File naming**: PascalCase for components (`ConversationCard.tsx`), camelCase for utilities (`formatDate.ts`).
- **CSS Modules** for all component styling — create `ComponentName.module.css` alongside each component.
- **No inline styles** except for truly dynamic values (e.g., computed positions).
- All API calls must go through `frontend/src/api/client.ts` — never call `fetch()` directly from components.
- Use React Router v7 for routing. Define all routes in `App.tsx`.
- Theme colors are defined as CSS custom properties in `index.css`. Components must use these variables, not hardcoded colors.

### Backend
- **Raw SQL only** — no ORMs. Use Bun's built-in `Bun.sql` for PostgreSQL queries.
- **Always use parameterized queries** to prevent SQL injection. Never interpolate user input into SQL strings.
- **Always wrap async route handlers** in try/catch with proper error responses.
- Return consistent JSON error responses: `{ error: string, status: number }`.
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500).
- Auth middleware must be applied to all routes that require authentication.
- Database queries live directly in route handler files (no separate repository layer needed).

### Database
- Migration files are numbered SQL files in `backend/src/db/migrations/`.
- Table names are lowercase, plural (e.g., `users`, `conversations`, `comments`).
- Use `UUID` for primary keys with `gen_random_uuid()`.
- Use `TIMESTAMPTZ` for all timestamp columns.
- JSONL transcript data is stored as `JSONB` in the `conversations.transcript` column.
- Add appropriate indexes for frequently queried columns.

## Architecture Rules

1. **Frontend ↔ Backend communication**: The frontend communicates with the backend exclusively via REST API calls through `api/client.ts`. The API client handles auth token refresh automatically.

2. **Authentication flow**: 
   - Access tokens (short-lived JWT) and refresh tokens are stored in httpOnly cookies.
   - The auth middleware on the backend extracts and verifies the JWT from the cookie.
   - On 401 responses, the API client attempts a token refresh before retrying.

3. **JSONL Transcript handling**:
   - Users upload `.jsonl` files from their `~/.gemini/antigravity-cli/brain/<id>/.system_generated/logs/` directory.
   - The backend parses the JSONL (line-by-line JSON parsing) and stores it as a JSON array in the `JSONB` column.
   - The frontend renders the transcript entries based on their `type` field (`USER_INPUT`, `PLANNER_RESPONSE`, etc.).

4. **Denormalized counters**: `like_count`, `comment_count`, and `view_count` on the `conversations` table are denormalized for performance. They must be updated atomically when likes/comments are added or removed (use `UPDATE ... SET like_count = like_count + 1`).

## Testing — MANDATORY (TDD)

This project enforces **Test-Driven Development (TDD)**. Every feature and bug fix **must** follow the Red-Green-Refactor cycle:

1. **Red** — Write a failing test that describes the expected behavior.
2. **Green** — Write the minimum implementation code to make the test pass.
3. **Refactor** — Clean up the code while keeping all tests passing.

**PRs without tests will be rejected.** No exceptions.

### Test Frameworks

| Layer | Framework | Config |
|-------|-----------|--------|
| Frontend | Vitest + React Testing Library + jsdom | `frontend/vitest.config.ts` |
| Backend | Bun's built-in test runner (`bun test`) | N/A (built-in) |

### File Naming & Location

- **Backend tests**: Place test files next to the source file with `.test.ts` suffix.
  ```
  backend/src/routes/auth.ts        → backend/src/routes/auth.test.ts
  backend/src/utils/jwt.ts          → backend/src/utils/jwt.test.ts
  backend/src/utils/validation.ts   → backend/src/utils/validation.test.ts
  ```

- **Frontend tests**: Place test files next to the component/module with `.test.ts` or `.test.tsx` suffix.
  ```
  frontend/src/utils/transcript.ts       → frontend/src/utils/transcript.test.ts
  frontend/src/components/LikeButton/    → frontend/src/components/LikeButton/LikeButton.test.tsx
  frontend/src/api/client.ts             → frontend/src/api/client.test.ts
  ```

### What MUST Be Tested

#### Backend
- **Route handlers**: Test every API endpoint for success and error cases (400, 401, 403, 404, 500).
- **Middleware**: Test auth middleware with valid tokens, expired tokens, missing tokens, and malformed tokens.
- **Utilities**: Test all utility functions (JWT sign/verify, password hashing, validation, JSONL parsing).
- **Database queries**: Test that queries return expected results and handle edge cases (duplicates, not found, constraint violations).

#### Frontend
- **Utility functions**: Test all pure functions (transcript parsing, formatters, validators).
- **Components**: Test rendering, user interactions (click, type, submit), loading states, error states, and conditional rendering.
- **API client**: Test request formation, error handling, and 401 retry logic (mock fetch).
- **Hooks**: Test custom hooks with `renderHook()` from React Testing Library.

### Test Structure

Use the **Arrange-Act-Assert** pattern:

```typescript
// Backend (Bun test runner)
import { describe, it, expect, beforeEach } from "bun:test";

describe("POST /api/auth/register", () => {
  it("should create a new user with valid data", async () => {
    // Arrange
    const userData = { email: "test@example.com", username: "testuser", password: "securepass123" };

    // Act
    const response = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // Assert
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.user.email).toBe(userData.email);
  });

  it("should return 400 for invalid email", async () => {
    // ...
  });

  it("should return 409 for duplicate email", async () => {
    // ...
  });
});
```

```typescript
// Frontend (Vitest + React Testing Library)
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

describe("LikeButton", () => {
  it("should render the like count", () => {
    render(<LikeButton conversationId="1" likeCount={42} hasLiked={false} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should call onLikeChange when clicked", async () => {
    const onLikeChange = vi.fn();
    render(<LikeButton conversationId="1" likeCount={0} hasLiked={false} onLikeChange={onLikeChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onLikeChange).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Backend
cd backend && bun test                # Run all tests
cd backend && bun test --watch        # Watch mode
cd backend && bun test src/routes/    # Run specific directory

# Frontend
cd frontend && bun run test           # Run all tests (via Vitest)
cd frontend && bun run test:watch     # Watch mode
cd frontend && bun run test:coverage  # With coverage report
```

### PR Checklist for Tests

Every PR **must** satisfy:
- [ ] Tests were written **before** implementation (TDD).
- [ ] All new functions/endpoints have corresponding test files.
- [ ] Tests cover both success and error/edge cases.
- [ ] All existing tests still pass (`bun test` / `bun run test`).
- [ ] No skipped tests (`.skip`) without a linked issue explaining why.

## Biome & Husky (Automated Quality Gates)

This project uses **Biome.js** for formatting/linting and **Husky** for git hooks. These are enforced automatically — you cannot skip them.

### Git Hooks (via Husky)

| Hook | What it does | When it runs |
|------|--------------|--------------|
| `pre-commit` | Runs `lint-staged` → Biome check on staged files only | Every `git commit` |
| `pre-push` | Runs all tests (backend `bun test` + frontend `bun run test`) | Every `git push` |

### Available Scripts (root `package.json`)

```bash
bun run lint          # Lint all files (report only)
bun run lint:fix      # Lint and auto-fix
bun run format        # Check formatting (report only)
bun run format:fix    # Auto-format all files
bun run check         # Lint + format check combined
bun run check:fix     # Lint + format auto-fix combined
```

### How lint-staged Works

On `git commit`, only staged files are checked:
- `*.{ts,tsx,js,jsx}` → `biome check --write` (lint + format + auto-fix)
- `*.{json,css,md}` → `biome format --write` (format only)

If Biome finds unfixable errors (e.g., `noExplicitAny`), the commit is **blocked**.

### Setup After Cloning

After cloning the repo, run `bun install` at the root to set up Husky hooks:

```bash
git clone https://github.com/wardix/convhub.git
cd convhub
bun install          # Installs deps + sets up Husky hooks via "prepare" script
```

## Important Notes

- Do NOT add any npm packages without mentioning it in the PR description.
- Do NOT modify the database schema without creating a new migration file.
- Do NOT disable Biome rules with `// biome-ignore` without a linked issue explaining why.
- Preserve all existing comments and docstrings unrelated to your changes.
- When in doubt, check existing code patterns and follow them.
