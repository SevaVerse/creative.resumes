# Tasks Backlog (Epics and Stories)

- Status: `active`
- Owner: Product + Engineering
- Last updated: 2026-11-05
- Source consolidation: `01-no-login-quick-mode.md`, `02-ats-checker-and-job-match.md`, `03-programmatic-seo-landing-pages.md`, `04-funnel-analytics-and-experiments.md`

This file is the implementation source of truth going forward.

## Working Rules

- Every story has a stable ID, status, owner, and acceptance criteria.
- Update status in this file as work progresses.
- Any new feature must be added here before implementation.

## Status Legend

- `todo`: Not started.
- `in-progress`: Started and actively being implemented.
- `blocked`: Started but waiting on dependency/decision.
- `done`: Implemented and acceptance criteria validated.
- `deferred`: Intentionally postponed.

## Epic E1: No-Login Quick Mode

Goal: reduce first-visit friction and improve activation.

### Story E1-S1: Public builder access without auth
- Status: `in-progress`
- Priority: `P0`
- Owner: Frontend
- Description: Unauthenticated visitors can choose templates, fill form data, and generate preview.
- Acceptance criteria:
1. Logged-out users can access template selection and full form editing.
2. Logged-out users can generate preview.
3. Existing authenticated flow remains functional.
- Dependencies: none

### Story E1-S2: Keep save/load cloud features auth-gated
- Status: `in-progress`
- Priority: `P0`
- Owner: Frontend
- Description: Preserve `ResumeSaveButton` and `ResumeLoader` only for authenticated users.
- Acceptance criteria:
1. Logged-out users do not see cloud save/load controls.
2. Logged-in users retain full save/load behavior.
- Dependencies: E1-S1

### Story E1-S3: Soft sign-in prompt after first value event
- Status: `todo`
- Priority: `P1`
- Owner: Frontend/Product
- Description: Prompt sign-in after first export or meaningful milestone rather than before start.
- Acceptance criteria:
1. No forced login before first preview/export.
2. Prompt appears after configured trigger.
3. Prompt copy explains save/sync value.
- Dependencies: E1-S1

### Story E1-S4: Local draft persistence for logged-out users
- Status: `in-progress`
- Priority: `P0`
- Owner: Frontend
- Description: Save draft locally and restore on refresh for unauthenticated users.
- Acceptance criteria:
1. Draft survives refresh/reopen in same browser.
2. User can clear local draft manually.
3. Privacy copy explains local-only storage.
- Dependencies: E1-S1

### Story E1-S5: Local draft import after login
- Status: `todo`
- Priority: `P1`
- Owner: Frontend + DB
- Description: Offer one-click import of local draft into authenticated account.
- Acceptance criteria:
1. After login, user can import local draft to cloud resume.
2. Import does not silently overwrite existing resume without user confirmation.
- Dependencies: E1-S4

### Story E1-S6: Export policy alignment
- Status: `in-progress`
- Priority: `P0`
- Owner: Product + Backend
- Description: Decide and implement whether first PDF export is allowed without login.
- Policy: Allow anonymous PDF export with stricter per-client rate limits than authenticated export.
- Acceptance criteria:
1. Policy is documented in this file.
2. API and UI behavior match policy exactly.
3. Rate-limit and abuse safeguards remain active.
- Dependencies: E1-S1

## Epic E2: ATS Checker and Job Match

Goal: add a high-intent, linkable utility that brings top-of-funnel traffic.

### Story E2-S1: Build public ATS checker page
- Status: `done`
- Priority: `P0`
- Owner: Frontend
- Description: Add indexable route `/ats-checker` with metadata and FAQ. Shipped at `/ats-checker` (`src/app/ats-checker/page.tsx`).
- Acceptance criteria:
1. Route is publicly accessible and indexable.
2. Metadata (title/description/canonical) is unique.
3. CTA to open builder appears above fold and after results.
- Dependencies: none

### Story E2-S2: Resume text analysis engine (MVP)
- Status: `done`
- Priority: `P0`
- Owner: Backend/AI
- Description: Compute ATS readiness with deterministic checks + optional AI enhancement. Rule-based engine in `src/lib/ats/analyze.ts`; runs in the browser with no model calls.
- Acceptance criteria:
1. Returns overall score with sub-scores: keyword, readability, section completeness, impact language.
2. Typical input completes under 10s.
3. Includes transparent scoring disclaimer.
- Dependencies: E2-S1

### Story E2-S3: Job description keyword match
- Status: `done`
- Priority: `P0`
- Owner: Backend/AI
- Description: Extract key JD terms, show matched and missing keywords. Matched/missing lists with high/medium priority.
- Acceptance criteria:
1. Output includes matched and missing lists.
2. Confidence tiers or prioritization are shown.
- Dependencies: E2-S2

### Story E2-S4: Suggestion application into builder
- Status: `todo`
- Priority: `P1`
- Owner: Frontend
- Description: Allow one-click application of ATS suggestions to summary/experience/skills.
- Acceptance criteria:
1. User can apply a suggestion to a target section.
2. Applied content is visible and editable before export.
- Dependencies: E2-S3

### Story E2-S5: ATS cost and abuse controls
- Status: `done`
- Priority: `P1`
- Owner: Backend
- Description: Add caching/rate controls to prevent AI cost spikes. Satisfied by design: the checker makes no server or AI calls, so there is no cost or abuse surface.
- Acceptance criteria:
1. Repeated analyses are cached where feasible.
2. Rate limits return clear error messaging.
3. System remains responsive under burst traffic.
- Dependencies: E2-S2

## Epic E3: Programmatic SEO Landing Pages

Goal: expand high-intent indexed surface area for organic traffic.

### Story E3-S1: Scalable landing page content model
- Status: `todo`
- Priority: `P0`
- Owner: Frontend/Content
- Description: Create structured content source to generate multiple page families.
- Acceptance criteria:
1. Content model supports template pages, role pages, and utility pages.
2. Routes can be generated without hardcoding every page component.
- Dependencies: none

### Story E3-S2: Ship phase-1 template pages
- Status: `done`
- Priority: `P0`
- Owner: Frontend/Content
- Description: Publish `/resume-templates/*` pages for existing templates. Generated from the registry for all 13 templates (`src/app/resume-templates/`, copy in `src/data/templateContent.ts`).
- Acceptance criteria:
1. Pages exist for minimalist, onyx, awesomecv, subtle-elegant.
2. Each page has unique copy, FAQs, and builder CTA.
3. Each page has at least 2 internal links in and 2 links out.
- Dependencies: E3-S1

### Story E3-S3: Ship phase-1 role example pages
- Status: `todo`
- Priority: `P0`
- Owner: Frontend/Content
- Description: Publish role-targeted example pages.
- Acceptance criteria:
1. Initial pages for software-engineer, data-analyst, product-manager, fresher.
2. Each page contains sample snippet blocks and common mistakes section.
- Dependencies: E3-S1

### Story E3-S4: Utility landing pages and internal linking
- Status: `todo`
- Priority: `P1`
- Owner: Frontend/Content
- Description: Publish utility-intent pages and interlink with builder/tools.
- Acceptance criteria:
1. Utility pages include ats-checker, resume-keyword-matcher, resume-bullet-generator.
2. No orphan pages after crawl check.
- Dependencies: E2-S1, E3-S1

### Story E3-S5: Sitemap and structured data coverage
- Status: `in-progress`
- Priority: `P0`
- Owner: Frontend
- Description: Ensure all new pages are in sitemap and use suitable JSON-LD. Sitemap and JSON-LD done for /ats-checker and /resume-templates; Lighthouse SEO sampling still to run.
- Acceptance criteria:
1. New pages appear in `src/app/sitemap.ts` output.
2. Page-level metadata is unique and valid.
3. Sampled pages pass Lighthouse SEO checks.
- Dependencies: E3-S2, E3-S3

## Epic E4: Funnel Analytics and Experiments

Goal: create reliable decision-making instrumentation from acquisition to activation.

### Story E4-S1: Define typed event schema and helper contracts
- Status: `todo`
- Priority: `P0`
- Owner: Frontend/Backend
- Description: Standardize event names and metadata shape with type safety.
- Acceptance criteria:
1. Event helper enforces required fields.
2. Invalid payloads are rejected or normalized.
3. Existing analytics calls migrate to typed helpers.
- Dependencies: none

### Story E4-S2: Implement funnel event coverage
- Status: `todo`
- Priority: `P0`
- Owner: Frontend
- Description: Track core funnel events end-to-end.
- Acceptance criteria:
1. Events covered: `landing_view`, `cta_start_builder`, `template_selected`, `first_section_completed`, `preview_generated`, `pdf_export_success`, `signup_prompt_shown`, `signup_completed`.
2. Full happy-path test emits all events.
3. Tracking failures do not block UX.
- Dependencies: E4-S1

### Story E4-S3: Attribution metadata capture
- Status: `todo`
- Priority: `P0`
- Owner: Frontend
- Description: Capture lightweight attribution context.
- Acceptance criteria:
1. Captures landing path, coarse referrer domain, UTM fields, device class, auth state.
2. No sensitive resume content is logged.
- Dependencies: E4-S1

### Story E4-S4: Funnel reporting dashboard or report pipeline
- Status: `todo`
- Priority: `P1`
- Owner: Data/Product
- Description: Daily/weekly conversion reporting by funnel step and segment.
- Acceptance criteria:
1. Report shows step conversion and drop-off.
2. Segments include landing page family and auth state.
3. Time-to-insight for top drop-off is under 1 day.
- Dependencies: E4-S2, E4-S3

### Story E4-S5: Experiment framework MVP
- Status: `todo`
- Priority: `P1`
- Owner: Product/Frontend
- Description: Feature-flag simple CTA copy experiments with variant tracking.
- Acceptance criteria:
1. Experiment ID and variant are attached to funnel events.
2. Weekly winner/loser decision template is documented and used.
- Dependencies: E4-S2

## Epic E5: Platform Cost Exit, Templates and Fresher Jobs

Goal: remove Supabase free-tier limits, strengthen the builder, and add a weekly fresher jobs board for traffic.

### Story E5-S1: Replace Supabase with Auth.js + Turso
- Status: `done`
- Priority: `P0`
- Owner: Engineering
- Description: Auth.js v5 (Google/GitHub, JWT) and Turso/libSQL; server API routes replace browser-side DB access and Edge Functions.
- Acceptance criteria:
1. No Supabase SDK or env vars are required at build or runtime.
2. Saved resumes are only readable/writable by their owner (server-side checks).
3. Migration script copies existing profiles/resumes/analytics; users are linked by email on next sign-in.
- Dependencies: none

### Story E5-S2: New templates and builder UX
- Status: `done`
- Priority: `P0`
- Owner: Frontend
- Description: Campus (fresher), ATS Classic and Modern templates; template registry; gallery thumbnails with filters; live split-screen preview; fresher example data; `?template=` deep link.
- Acceptance criteria:
1. All templates render in gallery, live preview, preview tabs and PDF export from one registry.
2. Users can switch templates while editing without losing data.
- Dependencies: none

### Story E5-S3: Weekly fresher jobs board
- Status: `in-progress`
- Priority: `P0`
- Owner: Engineering/Product
- Description: `/jobs` page + RSS feed of entry-level government and private jobs, refreshed weekly via Vercel Cron.
- Acceptance criteria:
1. Cron endpoint is secret-protected and tolerant of individual source failures.
2. Only entry-level roles are listed; expired/stale rows are pruned.
3. Production sources configured (Adzuna keys, verified ATS boards, official RSS feeds) — **pending owner setup**.
- Dependencies: E5-S1

## Epic E6: Shareability and Discoverability

Goal: give visitors reasons and one-tap ways to share, and make every page previewable and citable.

### Story E6-S1: Share buttons and per-page social cards
- Status: `done`
- Priority: `P0`
- Owner: Frontend
- Description: `ShareButtons` (WhatsApp, Telegram, LinkedIn, X, native, copy) on job, template and ATS result views; WhatsApp share on job cards; 1200x630 cards at `/og/ats.png`, `/og/template/<id>.png`, `/og/job/<id>.png`.
- Acceptance criteria:
1. Shared links preview the page's own title, with no redirect on the image URL.
2. No third-party share SDKs or trackers.
- Dependencies: none

### Story E6-S2: Site metadata hygiene
- Status: `done`
- Priority: `P0`
- Owner: Frontend
- Description: Template counts derived from the registry; FAQ JSON-LD moved from the root layout to the homepage with visible FAQ; invalid global breadcrumb removed; search console verification via env; installable PWA manifest and icons; MIT LICENSE file; `/llms.txt`.
- Dependencies: none

### Story E6-S3: Fun shareable resume feedback ("roast my resume")
- Status: `todo`
- Priority: `P1`
- Owner: Frontend/AI
- Description: Light-hearted AI critique that produces a share card with the score and no personal data.
- Acceptance criteria:
1. Share card contains no resume text or contact details.
2. Rate-limited like `/api/rewrite`.
- Dependencies: E2-S2

### Story E6-S4: Opt-in public resume links
- Status: `todo`
- Priority: `P1`
- Owner: Frontend + DB
- Description: `/r/<id>` links that are off by default, noindex unless opted in, revocable and expiring, with a small "Made with SecureCV" label.
- Acceptance criteria:
1. Owner-only create/revoke, scoped by `user_id`.
2. Default `noindex`; expiry enforced server-side.
- Dependencies: E5-S1

### Story E6-S5: Job alerts channel
- Status: `todo`
- Priority: `P1`
- Owner: Engineering
- Description: Monthly cron posts new listings to a Telegram channel / WhatsApp Channel.
- Dependencies: E5-S3

### Story E6-S6: India-specific landing pages
- Status: `todo`
- Priority: `P1`
- Owner: Content/Frontend
- Description: Resume format pages (fresher, B.Tech, BCom, government jobs, biodata), job pages by qualification (10th, 12th, ITI, diploma, graduate) and "free resume builder with no paywall" comparison pages.
- Dependencies: E3-S1

## Cross-Epic Tasks

### Story X-S1: Copy and privacy consistency audit
- Status: `todo`
- Priority: `P0`
- Owner: Product/Frontend
- Description: Align claims across home, privacy, metadata, and implementation.
- Acceptance criteria:
1. No contradictory analytics/tracking claims remain.
2. Privacy claims match actual runtime behavior.
- Dependencies: none

### Story X-S2: Spec hygiene and backlog maintenance cadence
- Status: `todo`
- Priority: `P0`
- Owner: Product
- Description: Keep this file current as canonical source.
- Acceptance criteria:
1. Story status updated at least weekly while active work exists.
2. New work is added here before implementation starts.
- Dependencies: none

## Suggested Execution Order

1. E1-S1, E1-S2, E1-S4, E1-S6
2. E4-S1, E4-S2, E4-S3
3. E2-S1, E2-S2, E2-S3
4. E3-S1, E3-S2, E3-S3, E3-S5
5. E1-S3, E1-S5, E2-S4, E2-S5, E4-S4, E4-S5

## Change Log

- 2026-03-11: Initial consolidation from specs 01-04 into single backlog file.
- 2026-03-11: Started Epic E1 implementation for anonymous builder access, local drafts, and anonymous export policy.
- 2026-11-03: Added Epic E5 (Supabase exit, new templates/builder UX, weekly fresher jobs board).
- 2026-11-05: Shipped ATS checker (E2-S1/S2/S3/S5), template landing pages (E3-S2), sitemap coverage (E3-S5 partial); added Epic E6 (shareability and discoverability).
