# AI Agent Instructions for `resume_v4`

This file defines repository-specific guidance for AI coding agents working in this project.

## 1. Project Context

- Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4.
- Purpose: Privacy-first resume builder with resume editing, template rendering, AI rewrite, and PDF export.
- Key integrations:
  - Supabase (Auth, DB, Edge Functions)
  - Groq (AI rewrite)
  - Puppeteer + `@sparticuz/chromium(-min)` for server-side PDF generation
- Runtime split:
  - Next.js app + API routes under `src/app`
  - Supabase Edge Functions under `supabase/functions`

## 2. Important Paths

- App routes and API endpoints: `src/app/**`
- UI components: `src/components/**`
- Shared utilities: `src/utils/**`
- Supabase helpers: `src/utils/supabase/**`
- DB access helpers: `src/lib/db/**`
- SQL schema: `supabase-schema.sql`
- Docs: `docs/README.md`, `docs/ARCHITECTURE.md`

## 3. Working Agreements

- Keep changes minimal and scoped to the user request.
- Preserve privacy-first behavior; do not add user tracking or ad-related code.
- Do not leak secrets in code, logs, or commits.
- Prefer strict typing; avoid introducing `any` unless absolutely required.
- Reuse existing utilities before adding new abstractions.
- Keep API responses and error handling explicit and consistent.

## 4. API and Security Rules

- Protected API routes should verify Supabase auth (see `src/utils/supabase/jwt.ts` patterns).
- Respect existing CORS handling for API routes that are browser-called cross-origin.
- Preserve or improve rate limiting behavior (see `src/utils/rateLimit.ts`).
- Validate/sanitize untrusted input in route handlers and Edge Functions.
- Do not remove security headers, auth checks, or RLS assumptions.

## 5. Logging and Observability

- Use structured logger utilities from `src/utils/logger.ts`.
- Include request correlation IDs where available.
- Never log secrets, tokens, raw credentials, or sensitive personal data.
- Keep log messages concise and machine-readable.

## 6. PDF/Runtime Constraints

- PDF generation route (`src/app/api/export-pdf/route.ts`) must remain in Node runtime.
- Avoid changes that break `puppeteer-core` + Sparticuz Chromium behavior in serverless environments.
- Keep payload handling typed (`PrintPayload` and related types).

## 7. Style and Code Quality

- Follow existing TypeScript/React style in nearby files.
- Favor small, composable functions over large blocks.
- Add comments only where logic is non-obvious.
- Avoid broad refactors unless explicitly requested.

## 8. Commands Agents Should Run

Use npm scripts from `package.json`:

```bash
npm run dev
npm run lint
npm run build
```

For thumbnail generation:

```bash
npm run thumbnails
```

## 9. Validation Checklist Before Finishing

- Run `npm run lint` when changes affect TS/JS files.
- Run `npm run build` for changes that may affect runtime/build behavior.
- Confirm no secrets were introduced.
- Confirm no unrelated files were modified.
- Summarize changed files and behavior impact.

## 10. When Unsure

- Check `docs/ARCHITECTURE.md` for deployment/runtime constraints.
- Check `docs/README.md` and root `README.md` for setup expectations.
- Ask for clarification before making schema-level or auth-flow-breaking changes.
