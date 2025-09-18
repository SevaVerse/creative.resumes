## Resume Builder (Next.js + TypeScript)

<!-- जय श्री राम -->
A fast, privacy‑first resume builder with three professional templates, structured inputs, a gamified editor, carbon footprint scoring, server PDF export, and lightweight metrics.

### Highlights
- 3 templates: Minimalist, Onyx, AwesomeCV
- Structured Experience + Skills (with sliders)
- PDF Export (server‑side)
- Gamified Builder (score, badges, challenges)
- Carbon Footprint Score per template
- Privacy‑first (no ads/trackers; server renders PDF only on export)
- Forever free (no trials, no paywalls)
- Lightweight metrics: Page Hits and Resumes Downloaded

---

## Planned Enhancements
See the evolving roadmap in [`docs/roadmap.md`](docs/roadmap.md) for upcoming improvements, including:
- Rate limiting for login
- Optional Turnstile / hCaptcha via env flag
- Accessibility upgrades (aria-live captcha feedback)
- Remember last email option

### New Content & Docs
- Short announcement: [`docs/blog-announcement.md`](docs/blog-announcement.md)
- Full how‑to guide: [`docs/blog-how-to-resume-builder.md`](docs/blog-how-to-resume-builder.md)
- Live MDX preview page (dev runtime): `/blog/privacy-first-resume-builder`

---

## Support

If you find this project helpful, consider buying me a coffee! ☕

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/sevaverse)

Your support helps keep this project free and open source.

---

## Tech Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- ESLint (flat config)
- Puppeteer (local), puppeteer‑core + @sparticuz/chromium (serverless)
- Nodemailer (SMTP; Mailtrap‑friendly)

---

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Create `.env.local` (optional, for email/PDF origin)
```bash
# SMTP (optional: email login link route)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM="Resume Builder <no-reply@example.com>"

# Public origin used by server PDF export
# If deploying to Vercel, VERCEL_URL is used automatically when set.
APP_BASE_URL=http://localhost:3000
```

3) Run the dev server
```bash
npm run dev
```
Open http://localhost:3000 (dev may fall back to 3001 if 3000 is busy).

4) Production build (optional)
```bash
npm run build
npm start
```

---

## Features in Detail

### Templates
Three templates live under `src/components/`:
- `MinimalistTemplate.tsx` (simple, print‑friendly)
- `OnyxTemplate.tsx` (modern, with skill meters)
- `AwesomeCVTemplate.tsx` (timeline, colored sections, meters)

### Editor
The editor (`src/app/page.tsx`) supports:
- Experience items with dates and “current role” toggle
- Skills with level sliders
- Summary, Education, Certifications, Projects
- Optional profile picture upload

### Gamification
Live score, badges, and small challenges that encourage better content.

### Carbon Footprint Score
Each template shows a 0‑10 score (lower is greener) to guide eco‑conscious printing.

### PDF Export
- Client sends the filled data to `/api/export-pdf`.
- The route renders `/print` server‑side with Puppeteer and returns a PDF.
- Local dev uses `puppeteer`. On serverless platforms, it tries `puppeteer-core` + `@sparticuz/chromium`.

### Metrics
- `/api/metrics` keeps in‑memory counters for `page_hits` and `resume_downloads`.
The app exposes a simple `/api/metrics` endpoint used to collect page hits and resume download counts. By default, these are kept in-memory for simplicity.

### Persist metrics for free (Upstash Redis)

To persist metrics across deploys and scale-outs at zero cost, you can enable Upstash Redis:

1. Create a free database at https://console.upstash.com (Global location recommended).
2. Copy REST URL and Token into your local `.env` (see `.env.example`).
3. Install dependency: `npm i @upstash/redis`.

Set these variables:

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

When configured, `/api/metrics` will read/write counters in Redis. When not configured, it falls back to in-memory counters.
- After a successful export, “Resumes Downloaded” increments.
- Note: in‑memory counters reset on server restarts; switch to SQLite/KV for persistence.

---

## API Routes
- `POST /api/export-pdf` → returns PDF (application/pdf)
- `POST /api/send-login-link` → sends a magic link via SMTP (optional)
- `GET/POST /api/metrics` → read/update counters

---

## Project Structure
```
scripts/
	generate-thumbnails.mjs   # Create low‑res thumbs + manifest for screenshots
```

### MDX & Thumbnails
MDX support enabled (Next.js `mdxRs`). Create pages under `src/app/blog/` with `.mdx` extension.

Generate screenshot thumbnails (example expects raw images in `public/screenshots`):
```bash
npm run thumbnails
```
Outputs optimized images + `thumbnails.json` under `public/thumbs/`.

---

## Logging & Observability

Structured JSON logging is provided via `src/utils/logger.ts`:
- Levels: `debug`, `info`, `warn`, `error` filtered by `LOG_LEVEL` env (default `info`).
- Request correlation: `middleware` assigns `x-request-id` if absent.
- Rate limiting blocks emit `rate_limit.block` events.
- PDF + login routes emit start/end, duration, error events (`pdf.*`, `login.*`).

Example line (pretty printed):
```json
{ "time": "2025-09-13T12:34:56.789Z", "level": "info", "msg": "pdf.success", "durationMs": 842.31, "requestId": "..." }
```

### Environment
```bash
LOG_LEVEL=debug
```

### New Relic (Optional APM & Log Forwarding)

Security note: Never commit your `NEW_RELIC_LICENSE_KEY` (treat like a password). Keep it only in deployment env vars / secret manager. If it ever leaks, immediately rotate it in the New Relic UI and redeploy.

#### Option 1: Log Forwarding Only (Recommended - No Agent Installation)
Structured logs are automatically forwarded to New Relic via the Log API (buffered batches). This works in Node runtime only and requires `NEW_RELIC_LOG_API_KEY`.

1. Set env vars (example – do NOT commit these):
```bash
NEW_RELIC_LOG_API_KEY=your_ingest_key_or_license_key
NEW_RELIC_LOG_API_ENDPOINT=https://log-api.newrelic.com/log/v1
NEW_RELIC_APP_NAME=resume_builder
```
2. That's it! Logs will be forwarded automatically when your app runs.

- Batches up to 50 logs every 2 seconds.
- Includes `request.id` for correlation.
- Graceful failure handling (re-queues on error).
- Disable by omitting `NEW_RELIC_LOG_API_KEY`.

#### Option 2: Full APM + Agent (Optional)
For performance monitoring and tracing:

1. Install the agent (not committed by default):
```bash
npm install newrelic
```
2. Set additional env vars:
```bash
NEW_RELIC_LICENSE_KEY=xxxx
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
NEW_RELIC_LOG_LEVEL=info
```
3. Preload the agent for Node runtime only:
```bash
NODE_OPTIONS="-r ./newrelic.js" npm start
```
The `newrelic.js` file safely no-ops if the module isn't installed. Edge runtime code (middleware / edge routes) is not instrumented.

Rotation procedure:
1. In New Relic UI generate a new license key.
2. Update the secret in your hosting provider (e.g., Vercel project settings `NEW_RELIC_LICENSE_KEY`).
3. Redeploy. Confirm startup log: `[newrelic] agent initialized`.
4. Revoke the old key in New Relic.

You can forward logs to New Relic Log API or any collector by shipping stdout.

---
src/
	app/
		page.tsx           # Main UI (editor, preview, metrics)
		layout.tsx         # App layout
		print/page.tsx     # Printable renderer for server PDF
		api/
			export-pdf/route.ts      # PDF generation endpoint
			send-login-link/route.ts # SMTP login link (optional)
			metrics/route.ts         # In‑memory metrics
	components/
		MinimalistTemplate.tsx
		OnyxTemplate.tsx
		AwesomeCVTemplate.tsx
		PrintResume.tsx
	types/
		nodemailer.d.ts
		serverless-pdf.d.ts
```

---

## Deployment

### Vercel
- `src/app/api/export-pdf/route.ts` prefers `puppeteer-core` + `@sparticuz/chromium` when available.
- Ensure `APP_BASE_URL` or `VERCEL_URL` is set so the PDF route can render the `/print` page with the correct origin.
- `@sparticuz/chromium` and `puppeteer-core` are moved to `dependencies` for production runtime.
- `vercel.json` configures serverless function timeout (30s) for PDF generation.

### Node/VPS
- The route falls back to full `puppeteer` which is already included.

### Environment Variables for Production
```bash
# For Vercel deployment
VERCEL_URL=your-deployment-url.vercel.app
APP_BASE_URL=https://your-deployment-url.vercel.app

# SMTP (optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

---

## Linting & Type Checking
```bash
npm run lint
npm run build
```

---

## Troubleshooting

### ENOENT under `.next` on Windows
If you see a transient ENOENT (e.g., `_buildManifest.js.tmp.*`):
1. Stop the dev server.
2. Delete `.next/`.
3. Re‑run `npm run dev`.
Antivirus can occasionally lock temp files under `.next`; excluding the folder can help.

### Port 3000 in use
Dev will auto‑select 3001. Close other dev instances or free the port if needed.

### PDF export issues in production
Confirm `APP_BASE_URL`/`VERCEL_URL` and that `@sparticuz/chromium` + `puppeteer-core` are installed on serverless. Locally, ensure `puppeteer` can launch Chrome (no sandbox flags may be required in some environments).

### Vercel deployment issues
- Ensure `@sparticuz/chromium` and `puppeteer-core` are in `dependencies` (not `devDependencies`)
- Check that `vercel.json` is present with proper function configuration
- Monitor function logs for Puppeteer launch errors
- PDF generation may take 10-20 seconds in serverless environments

---

## License
MIT (or your preferred license)
