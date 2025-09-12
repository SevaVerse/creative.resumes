## Resume Builder (Next.js + TypeScript)

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

## Support

If you find this project helpful, consider buying me a coffee! ☕

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/yourusername)

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
- The homepage sends one page‑hit per tab session (guarded via `sessionStorage`) and displays counters in the header.
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
