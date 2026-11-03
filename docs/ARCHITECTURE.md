# SecureCV Architecture & Deployment Guide

## Overview

```
                    securecv.co.in (Cloudflare DNS/CDN)
                                 │
                    ┌────────────▼─────────────┐
                    │   Vercel (Next.js, bom1)  │
                    │  pages · API routes · cron│
                    └──┬──────────┬─────────┬───┘
                       │          │         │
              ┌────────▼───┐ ┌────▼────┐ ┌──▼────────────────────────┐
              │ Turso      │ │ Groq    │ │ Job sources (weekly)       │
              │ (libSQL)   │ │ LLM API │ │ Adzuna · Greenhouse · Lever│
              │ HTTP client│ └─────────┘ │ RSS/Atom feeds · curated   │
              └────────────┘             └────────────────────────────┘
         OAuth: Google / GitHub via Auth.js (JWT cookie sessions)
```

Everything runs as one Next.js app. There are no separate edge functions or BaaS SDKs in the browser:
the browser only talks to same-origin API routes, which hold all credentials.

## Why we moved off Supabase

The Supabase free tier pauses projects after a week of inactivity and caps the project count — painful for a
low-traffic side project. The replacement keeps costs at zero with fewer moving parts:

| Supabase feature | Replacement |
|---|---|
| Auth (Google/GitHub OAuth) | Auth.js v5, stateless JWT session cookie (`src/auth.ts`) |
| Postgres + RLS | Turso libSQL; ownership enforced in repositories (`WHERE user_id = ?`) |
| `profiles` trigger | `upsertOAuthUser` in the Auth.js `jwt` callback (`src/lib/db/users.ts`) |
| Edge Function `ai-rewrite` | Existing `/api/rewrite` route (the fallback path became the only path) |
| Edge Function `parse-resume` | `/api/parse-resume` (unpdf + mammoth + Groq JSON mode) |
| Browser-side DB writes | `/api/resumes`, `/api/analytics` (validated, size-limited, rate-limited) |

## Data model (`src/lib/db/schema.ts`)

* `users`, `accounts` — local identity; accounts link `(provider, provider_account_id)` → user.
* `resumes` — JSON `data`, `template` validated against the template registry.
* `analytics` — first-party counts only; no IP or user-agent is stored.
* `jobs`, `job_runs` — weekly fresher job listings and refresh run stats.

Schema creation is idempotent and runs once per server instance on first DB access.

## Auth flow

1. `signIn('google' | 'github')` (next-auth/react) → provider → `/api/auth/callback/<provider>`.
2. The `jwt` callback upserts the user (linking by verified email for migrated users) and stores `uid` in the token.
3. API routes call `getSessionUserId()` (`src/utils/auth/session.ts`); anonymous users can still build, preview and
   export (lower PDF rate limit).

## Templates

`src/components/templates/registry.ts` is the single source of truth (labels, tags, carbon score, component).
The gallery, editor live preview, preview tabs, PDF export and API validation all read from it. To add a template:
create the component, add its id to `TEMPLATE_IDS` (`src/types/resume.ts`) and an entry to the registry.

## Fresher jobs pipeline

`/api/cron/jobs/` (Vercel Cron, Monday 01:30 UTC) → `refreshJobs()` (`src/lib/jobs/aggregate.ts`):

1. Fetch all configured sources in parallel; one failing source never fails the run.
2. Classify sector (government/private) and keep only entry-level roles (`src/lib/jobs/classify.ts`);
   private roles must be in India or remote.
3. Normalize (strip tracking params, decode HTML), dedupe by URL hash, upsert, prune stale/expired rows.
4. Record stats in `job_runs` and revalidate `/jobs` + `/jobs/feed.xml` (ISR, 1h).

## Security notes

* All protected routes resolve the user server-side from the session cookie; IDs from the client are never trusted.
* Request bodies are size-limited (`readJsonBody`) and validated; uploads are type/size checked (5 MB).
* In-memory rate limits per user/IP (`src/utils/rateLimit.ts`).
* Cron endpoint uses a constant-time bearer comparison against `CRON_SECRET`.
* Security headers / CSP in `src/middleware.ts` (Supabase origins removed).

## Runtime constraints

* `/api/export-pdf` must stay on the Node runtime (Puppeteer).
* The DB client uses `@libsql/client/web` (HTTP) in production. The native client is loaded only for local
  `file:` databases and is hidden from the bundler.

*Last updated: November 3, 2026*
