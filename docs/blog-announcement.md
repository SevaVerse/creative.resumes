# Introducing the Privacy‑First Open Source Resume Builder

> Build a professional PDF resume in minutes—no tracking, no account creation, just focused writing.

## Why Another Resume Tool?
Most tools gate features behind paywalls or embed trackers. This project takes a different path:
- ✨ Three polished templates (Minimalist, Onyx, AwesomeCV)
- 🧩 Structured inputs for consistency
- 🏅 Light gamification (score + gentle badges)
- 🖨️ Accurate PDF export using headless Chromium
- 🌱 Carbon footprint indicator per template
- 🔒 No persistent account. Close the tab = session ends.
- 🛡️ Built‑in security headers + rate limiting

## Quick Start
```bash
git clone https://github.com/your-org/creative.resumes.git
cd creative.resumes
npm install
npm run dev
```
Then open: http://localhost:3000

Optional SMTP magic link login (privacy‑respecting, ephemeral): add `SMTP_*` vars in `.env.local`.

## Under the Hood
Next.js 15 (App Router) · React 19 · Tailwind CSS 4 · Puppeteer / puppeteer-core + @sparticuz/chromium · Nodemailer · In‑memory metrics & rate limiting.

## Want the Full Walkthrough?
Read the full guide with screenshots, architecture notes, and deployment tips:
[Full How‑To Guide](./blog-how-to-resume-builder.md)

## Roadmap Highlights
- Turnstile / hCaptcha integration
- Persistent metrics (KV / SQLite)
- Drag & drop ordering, accessibility upgrades, eco template variants

See the evolving [Roadmap](./roadmap.md).

## Contribute
PRs, issues, and ideas welcome. Star it if you want more open privacy‑friendly tools.

**Build something mindful. Ship a better resume.**

<!-- जय श्री राम -->
