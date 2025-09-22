# Creative Resumes - A Privacy-First, AI-Powered Resume Builder## Resume Builder (Next.js + TypeScript)



![Creative Resumes Hero Image](https://raw.githubusercontent.com/SevaVerse/creative.resumes/develop/public/og-image.png)<!-- जय श्री राम -->

A fast, privacy‑first resume builder with three professional templates, structured inputs, a gamified editor, carbon footprint scoring, server PDF export, and lightweight metrics.

Build a professional, polished resume in minutes. No ads, no trackers, just your data and our tools. This is a free, open-source resume builder focused on privacy, speed, and a great user experience.

### Highlights

**[Live Demo](https://your-live-url.com)**- 4 templates: Minimalist, Onyx, AwesomeCV, SubtleElegant

- Structured Experience + Skills (with sliders)

---- **AI-powered text rewriting** (Groq integration)

- PDF Export (server‑side)

## ✨ Features- Gamified Builder (score, badges, challenges)

- Carbon Footprint Score per template

*   **Privacy-First by Design:** No user tracking, no ads, and no data selling. PDF generation happens on your device.- Privacy‑first (no ads/trackers; server renders PDF only on export)

*   **Four Professional Templates:** Choose from four beautifully designed templates: Minimalist, Onyx, AwesomeCV, and Subtle & Elegant.- Forever free (no trials, no paywalls)

*   **AI-Powered Rewrites:** Enhance your resume summary, experience, and project descriptions with integrated AI assistance.- Lightweight metrics: Page Hits and Resumes Downloaded

*   **Secure Magic Link Authentication:** No passwords to remember. Secure, one-time login links are sent to your email.

*   **Modern Bot Protection:** Uses Cloudflare Turnstile, a privacy-respecting alternative to traditional CAPTCHAs.---

*   **One-Click PDF Export:** Download a print-ready, optimized PDF of your resume with a single click.

*   **Gamified Resume Score:** Get instant feedback on your resume's completeness and quality to improve your chances.## Planned Enhancements

*   **Eco-Friendly Carbon Score:** Each template has a "Carbon Score" to help you make an environmentally conscious choice.See the evolving roadmap in [`docs/roadmap.md`](docs/roadmap.md) for upcoming improvements, including:

- Rate limiting for login

## ☕ Support The Project- Accessibility upgrades (aria-live Turnstile feedback)

- Remember last email option

If this project saves you time or helps you land your next job, please consider supporting its development. Your support helps keep the servers running and the project free and open-source for everyone.

### New Content & Docs

<a href="https://www.buymeacoffee.com/sevaverse" target="_blank">- Short announcement: [`docs/blog-announcement.md`](docs/blog-announcement.md)

  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >- Full how‑to guide: [`docs/blog-how-to-resume-builder.md`](docs/blog-how-to-resume-builder.md)

</a>- Live MDX preview page (dev runtime): `/blog/privacy-first-resume-builder`



## 🚀 Getting Started---



Follow these instructions to set up the project locally for development and testing.## Support



### 1. PrerequisitesIf you find this project helpful, consider buying me a coffee! ☕



*   [Node.js](https://nodejs.org/) (v18.x or later recommended)[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/sevaverse)

*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

Your support helps keep this project free and open source.

### 2. Clone the Repository

---

```bash

git clone https://github.com/SevaVerse/creative.resumes.git## Tech Stack

cd creative.resumes- Next.js 15 (App Router) + React 19 + TypeScript

```- Tailwind CSS 4

- ESLint (flat config)

### 3. Install Dependencies- Puppeteer (local), puppeteer‑core + @sparticuz/chromium (serverless)

- Nodemailer (SMTP; Mailtrap‑friendly)

```bash

npm install---

```

## Getting Started

### 4. Set Up Environment Variables

1) Install dependencies

Create a new file named `.env.local` in the root of your project and add the following environment variables.```bash

npm install

```env```

# --- Security ---

# A 32-character secret string for signing magic link tokens2) Create `.env.local` (optional, for email/PDF origin)

MAGIC_LINK_SECRET=```bash

# Cloudflare Turnstile keys (get from https://dash.cloudflare.com/)# SMTP (optional: email login link route)

NEXT_PUBLIC_TURNSTILE_SITE_KEY=SMTP_HOST=sandbox.smtp.mailtrap.io

TURNSTILE_SECRET_KEY=SMTP_PORT=2525

SMTP_USER=your_user

# --- Services ---SMTP_PASS=your_pass

# Groq API Key for AI rewrites (get from https://console.groq.com/keys)SMTP_FROM="Resume Builder <no-reply@example.com>"

GROQ_API_KEY=

# AI Text Rewriting (Groq) - Get free API key from https://console.groq.com

# --- Email (Nodemailer) ---GROQ_API_KEY=your_groq_api_key_here

# Use a service like smtp4dev for local testing or your production SMTP providerGROQ_MODEL=llama-3.1-70b-versatile

SMTP_HOST=ENABLE_AI_REWRITER=true

SMTP_PORT=

SMTP_USER=# Cloudflare Turnstile (Security) - Get keys from https://dash.cloudflare.com/

SMTP_PASS=NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here

SMTP_FROM_EMAIL="noreply@yourdomain.com"TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here



# --- Application ---# Magic Link Authentication (HMAC-signed tokens)

# The base URL of your deployed application (e.g., http://localhost:3000 for dev)# Generate a random 32+ char value: e.g. `openssl rand -hex 32`

APP_BASE_URL=http://localhost:3000MAGIC_LINK_SECRET=replace_with_random_hex_string

```

# Public origin used by server PDF export

**Note:** For local development, you can use the public Turnstile "test keys" and a local SMTP server like [smtp4dev](https://github.com/rnwood/smtp4dev).# If deploying to Vercel, VERCEL_URL is used automatically when set.

APP_BASE_URL=http://localhost:3000

### 5. Run the Development Server```



```bash3) Run the dev server

npm run dev```bash

```npm run dev

```

The application should now be running at [http://localhost:3000](http://localhost:3000).Open http://localhost:3000 (dev may fall back to 3001 if 3000 is busy).



## 🛠️ Tech Stack4) Production build (optional)

```bash

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)npm run build

*   **Language:** [TypeScript](https://www.typescriptlang.org/)npm start

*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)```

*   **AI:** [Groq API](https://groq.com/)

*   **Authentication:** Magic Links (HMAC-signed JWTs)---

*   **Database:** None! It's database-free for maximum privacy.

*   **Deployment:** Vercel, Netlify, or any Node.js-compatible host.## Features in Detail



## 🤝 Contributing### Templates

Four templates live under `src/components/`:

Contributions are welcome! If you have a feature request, find a bug, or want to improve the code, please open an issue or submit a pull request.- `MinimalistTemplate.tsx` (simple, print‑friendly)

- `OnyxTemplate.tsx` (modern, with skill meters)

1.  Fork the repository.- `AwesomeCVTemplate.tsx` (timeline, colored sections, meters)

2.  Create your feature branch (`git checkout -b feature/YourAmazingFeature`).- `SubtleElegantTemplate.tsx` (clean, professional design)

3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).

4.  Push to the branch (`git push origin feature/YourAmazingFeature`).### AI-Powered Text Rewriting

5.  Open a Pull Request.**Zero-cost AI enhancement using Groq's free tier**

- Smart text optimization for all resume sections

## 📄 License- Professional summary refinement

- Experience bullet point enhancement  

This project is licensed under the MIT License. See the `LICENSE` file for details.- Education and project descriptions

- Maintains user control with suggestion/accept workflow
- 14,400+ free API calls per day via Groq

Setup:
1. Get free API key from [Groq Console](https://console.groq.com)
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Optional: `ENABLE_AI_REWRITER=true` (enabled by default)

Features:
- **Resume-specific prompts** for each content type
- **Conciseness focus** with character count optimization
- **ATS-friendly** rewriting suggestions
- **Rate limiting** (20 requests/minute per IP)
- **Error handling** with graceful fallbacks

### Security (Cloudflare Turnstile)
The application uses Cloudflare Turnstile for bot protection on the login form - a privacy-friendly, often invisible CAPTCHA alternative.

Setup:
1. Create free Cloudflare account at https://dash.cloudflare.com
2. Navigate to Turnstile and create a new site widget
3. Add site key and secret to `.env`: 
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here`
   - `TURNSTILE_SECRET_KEY=your_secret_key_here`

Features:
- **Privacy-first** (no personal data collection)
- **Often invisible** to legitimate users
- **Server-side verification** via `/api/verify-turnstile`
- **Graceful fallback** if keys are not configured

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
- `POST /api/send-login-link` → sends an HMAC-signed magic link (email optional)
- `POST /api/verify-login-token` → verifies the magic link token & sets session cookie
- `POST /api/rewrite` → AI text rewriting (Groq integration)
- `GET/POST /api/metrics` → read/update counters

### Magic Link Security (Simplified Variant)
This project uses a lightweight, stateless HMAC token instead of placing raw emails in the URL:
- Token contains: email (lowercased), issued time, expiry (15m), random nonce
- Signed with `MAGIC_LINK_SECRET` (HS256 style)
- Frontend exchanges `?token=` via `/api/verify-login-token` then stores email locally

Benefits:
- Email not exposed directly in link parameters
- Tamper detection via HMAC signature
- Automatic expiry enforcement

Trade‑offs (Accepted for MVP):
- No server-side single-use revocation (replay within 15m possible)
- No device/IP binding
- Session is basic (opaque cookie + local email cache)

Future hardening ideas (optional):
- Redis-backed one-time token invalidation (jti blacklist)
- Bind partial user-agent hash in payload
- Shorter expiry (e.g., 5m) + refresh mechanism

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
