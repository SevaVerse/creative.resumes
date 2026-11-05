# Deployment Runbook: Supabase → Auth.js + Turso, and the /jobs board

Follow these steps in order. Steps 1–5 can be done before merging the PR. Nothing changes for
live users until step 7 (deploy). Budget about 60–90 minutes.

> **Hosting requirement:** sign-in, saved resumes and `/jobs` need the server-side API routes.
> `securecv.co.in` must point at the **Vercel** deployment of this Next.js app, not at a static export.

---

## 1. Create the Turso database (≈10 min)

1. Sign up at https://turso.tech (GitHub login is fine). The free plan is enough.
2. Install the CLI and log in:
   ```bash
   # macOS
   brew install tursodatabase/tap/turso
   # Linux / WSL
   curl -sSfL https://get.tur.so/install.sh | bash

   turso auth login
   ```
3. Pick the location closest to Vercel's `bom1` (Mumbai) region:
   ```bash
   turso db locations          # find the Mumbai entry, e.g. aws-ap-south-1
   turso db create securecv --location <mumbai-location-code>
   ```
4. Get the two values the app needs:
   ```bash
   turso db show securecv --url        # -> TURSO_DATABASE_URL (libsql://securecv-<org>.turso.io)
   turso db tokens create securecv     # -> TURSO_AUTH_TOKEN (keep secret)
   ```
   You don't need to create tables. The app creates them on first use.

## 2. Generate secrets (≈2 min)

```bash
npx auth secret            # or: openssl rand -base64 32   -> AUTH_SECRET
openssl rand -hex 32       # -> CRON_SECRET
```

## 3. Update the Google OAuth client (≈5 min)

Supabase handled the Google callback before. Now the app does.

1. Go to https://console.cloud.google.com/apis/credentials, then open your existing **OAuth 2.0 Client ID** (the one Supabase used).
2. Under **Authorized JavaScript origins**, add:
   - `https://securecv.co.in`
   - `https://www.securecv.co.in`
   - `http://localhost:3000`
3. Under **Authorized redirect URIs**, add these exactly as written (no trailing slash):
   - `https://securecv.co.in/api/auth/callback/google`
   - `https://www.securecv.co.in/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
4. Keep the old `https://<ref>.supabase.co/auth/v1/callback` entry until the cut-over is verified (step 10).
5. Copy the **Client ID** into `AUTH_GOOGLE_ID` and the **Client secret** into `AUTH_GOOGLE_SECRET`.
6. If the OAuth consent screen is still in "Testing", publish it. Otherwise only test users can sign in.

## 4. Update the GitHub OAuth app (≈5 min)

A GitHub OAuth app allows only one callback URL, so use two apps: one for production, one for local dev.

1. Go to https://github.com/settings/developers, then **OAuth Apps**, then your existing app (or create a new one).
2. Set **Homepage URL** to `https://securecv.co.in`.
3. Set **Authorization callback URL** to `https://securecv.co.in/api/auth/callback/github`.
4. Copy the **Client ID** into `AUTH_GITHUB_ID`. Generate a new client secret and put it in `AUTH_GITHUB_SECRET`.
5. Optional: create a second app for local dev with callback `http://localhost:3000/api/auth/callback/github`, and put its keys in `.env.local`.

> If the domain users actually land on is `www.securecv.co.in`, use that domain in the callback URL instead,
> or redirect `www` → apex in Vercel/Cloudflare (recommended).

## 5. Job source credentials (≈15 min, optional but recommended)

Without these, `/jobs` shows only the official-portals section and any hand-curated entries.

### Adzuna (main source of private-sector fresher jobs)
1. Register at https://developer.adzuna.com/ and create an application.
2. Copy the **Application ID** into `ADZUNA_APP_ID` and the **Application Key** into `ADZUNA_APP_KEY`.
   The weekly run makes 5 requests, which is well within the free allowance.

### Company job boards (Greenhouse / Lever, no key needed)
1. On a company's careers page, open a job. If the URL looks like one of these, note the slug:
   - `boards.greenhouse.io/<slug>/...` or `job-boards.greenhouse.io/<slug>/...` is a **Greenhouse** slug.
   - `jobs.lever.co/<slug>/...` is a **Lever** slug.
2. Check that the slug works by opening it in a browser. It should return JSON with jobs in it:
   - `https://boards-api.greenhouse.io/v1/boards/<slug>/jobs`
   - `https://api.lever.co/v0/postings/<slug>?mode=json`
3. Add the slugs as a comma-separated list, with an optional display name after `:`:
   ```
   GREENHOUSE_BOARDS=slugone:Company One,slugtwo:Company Two
   LEVER_COMPANIES=slugthree:Company Three
   ```
   Only roles that look entry-level and are in India or remote are kept. Large boards are fine.

### Government / other RSS feeds
1. On an official site, look for an RSS link (often a "RSS" icon or a "What's New" feed). Open it.
   It should show XML with `<item>` or `<entry>` tags.
2. Add feeds separated by `;`, each written as `sector|Display Name|URL`:
   ```
   JOB_FEEDS=government|Some Commission|https://example.gov.in/rss.xml;private|Some Board|https://example.com/jobs.rss
   ```

### Hand-curated listings
For important government notifications that have no feed, add entries to `src/data/jobs/curated.ts`
(there's an example in the file) and deploy. Always link to the **official** notice and set `lastDate`.
Entries drop off automatically after their last date.

## 6. Set environment variables in Vercel (≈10 min)

Go to Vercel, open the project, then **Settings → Environment Variables**. Add these for **Production**,
and for **Preview** too if you use preview deployments:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://securecv.co.in` |
| `TURSO_DATABASE_URL` | from step 1 |
| `TURSO_AUTH_TOKEN` | from step 1 |
| `AUTH_SECRET` | from step 2 |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | from step 3 |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | from step 4 |
| `GROQ_API_KEY` | your existing key |
| `CRON_SECRET` | from step 2 |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | from step 5 (optional) |
| `GREENHOUSE_BOARDS`, `LEVER_COMPANIES`, `JOB_FEEDS` | from step 5 (optional) |

Leave the old `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` variables in place for now. The new code
ignores them. You'll remove them in step 10.

> Preview deployments get a different URL, so OAuth sign-in won't work on them unless you also register those
> callback URLs. Everything else works.

## 7. Migrate existing data from Supabase (≈10 min)

Do this **just before** deploying, so very few resumes get saved on the old system in between.

1. In Supabase, go to **Project Settings → API**. Copy the **Project URL** and the **service_role** key.
   If the project is paused, click **Restore** first and wait for it to come back.
2. On your machine (Node **22.6+** is required), from the repo on the PR branch:
   ```bash
   npm install

   export SUPABASE_URL="https://<ref>.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="<service role key>"
   export TURSO_DATABASE_URL="libsql://securecv-<org>.turso.io"
   export TURSO_AUTH_TOKEN="<token>"

   npm run db:migrate-supabase -- --dry-run   # only prints counts
   npm run db:migrate-supabase                # copies data
   ```
3. Check that the counts match:
   ```bash
   turso db shell securecv "SELECT (SELECT COUNT(*) FROM users), (SELECT COUNT(*) FROM resumes), (SELECT COUNT(*) FROM analytics);"
   ```
   The script is safe to re-run (it skips rows already copied). It warns if any resume had no matching profile.
   Supabase data is **not** modified.

## 8. Merge and deploy (≈5 min)

1. Review and merge PR #22 (`feat/supabase-exit-templates-jobs`) into `refactor`.
2. Merge `refactor` into whichever branch Vercel deploys to production (or promote the deployment).
3. Wait for the Vercel build to finish (**Deployments** tab, status *Ready*).

Everyone signed in on the old system is signed out once and needs to sign in again. Their saved resumes
reappear after that, because accounts are linked by email.

## 9. Post-deploy checks (≈15 min)

Run the first jobs refresh by hand. Use your real `CRON_SECRET`, and note the trailing slash:
```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://securecv.co.in/api/cron/jobs/
```
The JSON shows, for each source, how many jobs were fetched or what error occurred, plus how many were accepted.
After that, Vercel runs it every **Monday 07:00 IST**. You can confirm the schedule under **Vercel → Settings → Cron Jobs**.
Cron jobs only run on production deployments.

Then click through:

- [ ] `https://securecv.co.in/api/health/` shows `has_turso_url: true`, `has_auth_secret: true` and `has_groq_key: true`
- [ ] Sign in with **Google**, then sign out, then sign in with **GitHub**
- [ ] As a migrated user, **My Resumes** lists your old resumes
- [ ] Create a resume, save it, reload the page, and load it again
- [ ] AI Rewrite works on the summary field
- [ ] Import a PDF and a DOCX resume
- [ ] **Download PDF** works for Campus, ATS Classic and Modern, and works twice in a row
- [ ] Logged out: you can build a resume, preview it and download a PDF
- [ ] `/jobs` shows listings and the Government/Private tabs work; `/jobs/feed.xml` returns RSS
- [ ] `/?template=campus` opens the builder with the Campus template selected

If something fails, check **Vercel → Logs**. The app logs structured JSON messages such as `resumes.create_failed`
and `jobs.source_failed`.

### Rollback
In **Vercel → Deployments**, pick the previous deployment and choose **Instant Rollback**. Supabase data was
only copied, never changed, so the old version keeps working. Resumes saved on the new system during the
window exist only in Turso.

## 10. Clean up (after about a week of stable running)

- Remove the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` variables from Vercel.
- Remove the `supabase.co` redirect URI from the Google OAuth client (and from the GitHub app if it's still there).
- Pause or delete the Supabase project. Optionally download a backup first (**Database → Backups**).
- Rotate the Supabase service_role key if you keep the project.

## Ongoing maintenance

- **Weekly:** look at `/jobs`. If a source keeps failing, check the latest run:
  `turso db shell securecv "SELECT finished_at, stats FROM job_runs ORDER BY finished_at DESC LIMIT 1;"`
- **More jobs:** add verified board slugs or feeds to the env vars (and redeploy), or add curated entries via a PR.
- **Backups:** Turso keeps point-in-time history on its free plan. For an extra copy, run
  `turso db shell securecv .dump > backup.sql`.
