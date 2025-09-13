# End-to-End Guide: Crafting and Exporting a Privacy‑First Resume with the Open Source Resume Builder

> Build a professional PDF resume in minutes—no tracking, no account creation, no clutter.

## Table of Contents
1. Introduction
2. Features at a Glance
3. Quick Start (Local Setup)
4. App Layout Overview
5. Filling In Your Resume
6. Gamified Scoring & Badges
7. Switching Templates + Carbon Footprint
8. Optional Magic Link Login (Privacy Model)
9. Exporting to PDF (Behind the Scenes)
10. Under the Hood (Developer Deep Dive)
11. Deploying to Vercel
12. Optional SMTP Magic Link Email
13. Extending the App (Roadmap Highlights)
14. Troubleshooting
15. Conclusion & Next Steps

---

## 1. Introduction
Most resume tools are noisy: trackers, paywalls, and bloated UIs. This open source Next.js app takes the opposite approach—privacy‑first, fast, and intentional. You edit structured fields, see live scoring hints, and export a clean PDF rendered server‑side with Puppeteer.

![Editor landing](./images/howto/editor-initial.png "Initial editor view with empty fields and preview pane")

## 2. Features at a Glance
| Feature | Why It Matters |
|---------|----------------|
| Multiple Templates (Minimalist, Onyx, AwesomeCV) | Style variety without re-entering data |
| Structured Inputs | Consistent formatting and easier editing |
| Gamified Score & Badges | Nudges toward stronger content |
| Carbon Footprint Score | Encourages eco‑conscious printing choices |
| Server PDF Export | Accurate print layout via headless Chrome |
| Privacy‑First Session | No persistent account; close tab = session ends |
| In‑Memory Metrics | Lightweight, resets on deploy, optional to persist |
| Rate Limiting & Security Headers | Abuse mitigation and baseline hardening |

![Template selector](./images/howto/template-switcher.png "Template selector open showing available layouts")

## 3. Quick Start (Local Setup)
Clone, install, run:
```bash
git clone https://github.com/your-org/creative.resumes.git
cd creative.resumes
npm install
npm run dev
```
Open: http://localhost:3000

Optional env (`.env.local`):
```bash
APP_BASE_URL=http://localhost:3000
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM="Resume Builder <no-reply@example.com>"
```

![Dev server running](./images/howto/dev-server.png "Terminal with dev server listening on localhost:3000")

## 4. App Layout Overview
Core file: `src/app/page.tsx`
- Left: Structured form (Summary, Experience, Skills, Projects, Education, Certifications)
- Right: Live template preview
- Header: Metrics (Page Hits, Resumes Downloaded) and Template Switcher

![Editor annotated](./images/howto/editor-annotated.png "Annotated layout showing form, preview, metrics, and template switcher")

## 5. Filling In Your Resume
### Experience
- Add accomplishments using action verbs ("Reduced", "Delivered", "Optimized")
- Use metrics: “Improved PDF generation speed by 35%”
- Toggle “Current Role” to omit end date

### Skills
- Slider-based levels keep visual consistency
- Balance depth (fewer expert) vs breadth

### Summary & Projects
Concise, high‑signal writing. Focus outcomes, not task lists.

![Experience entry](./images/howto/experience-item.png "Expanded experience item with fields populated")

## 6. Gamified Scoring & Badges
The score encourages:
- Filling all core sections
- Using quantified achievements
- Diverse skill set

Badges may hint at missing context (e.g., no summary yet). Treat it as gentle guidance, not a strict rubric.

![Score panel](./images/howto/score-badges.png "Score and badges panel visible above the editor")

## 7. Switching Templates + Carbon Footprint
Switch templates seamlessly—data persists. Carbon score (0–10) estimates relative ink density and layout impact.

Templates:
- Minimalist: Clean, print‑friendly
- Onyx: Modern accent sections
- AwesomeCV: Structured timeline + highlight styling

![Template comparison](./images/howto/templates-comparison.png "Side-by-side preview of all three templates")

## 8. Optional Magic Link Login (Privacy Model)
The app can operate completely anonymous. If enabled via SMTP config, a magic link email lets you rehydrate a transient session in the same browser context—no password, no stored account.

Security Layers:
- Simple math captcha (client) to discourage scripts
- In-memory rate limiting per IP/email for login
- No persistent user database

![Login captcha](./images/howto/login-captcha.png "Login modal with math captcha before requesting magic link")

## 9. Exporting to PDF (Behind the Scenes)
When you click Export:
1. Client serializes form data and POSTs to `/api/export-pdf`
2. Server launches headless Chromium (prefers `puppeteer-core` + `@sparticuz/chromium` in serverless; falls back to `puppeteer` locally)
3. It loads `/print` with your data (base64 encoded in query)
4. Renders A4 PDF and returns bytes

Rate limiting helps protect server resources (per-IP window).

![PDF export success](./images/howto/pdf-export.png "Browser showing successful PDF download notification")

### PDF Route Snippet
```ts
// src/app/api/export-pdf/route.ts (excerpt)
const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const rlKey = buildKey(["pdf", ip]);
const rl = pdfLimiter.check(rlKey);
if (!rl.allowed) {
  return new Response(JSON.stringify({ error: "Too many export requests", retryAfterMs: rl.retryAfterMs }), { status: 429 });
}
```

## 10. Under the Hood (Developer Deep Dive)
### Tech Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Puppeteer / puppeteer-core + @sparticuz/chromium
- Nodemailer (optional magic link)
- In-memory metrics + rate limiter

### Rate Limiting Utility
```ts
// src/utils/rateLimit.ts (excerpt)
export function createRateLimiter(windowMs: number, max: number) {
  const store = new Map<string, { hits: number[] }>();
  return {
    check(key: string) {
      const now = Date.now();
      let bucket = store.get(key) || { hits: [] };
      store.set(key, bucket);
      bucket.hits = bucket.hits.filter(t => t > now - windowMs);
      if (bucket.hits.length >= max) {
        const retryAfterMs = (bucket.hits[0] + windowMs) - now;
        return { allowed: false, remaining: 0, retryAfterMs };
      }
      bucket.hits.push(now);
      return { allowed: true, remaining: max - bucket.hits.length };
    }
  };
}
```

### Security Middleware
```ts
// src/middleware.ts (excerpt)
response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'); // prod
```

## 11. Deploying to Vercel
1. Push repo to GitHub
2. Import into Vercel dashboard
3. Set env vars (`APP_BASE_URL`, optionally SMTP + VERCEL_URL)
4. Build triggers automatic function deployment

Performance Note: Cold start PDF export may take a few seconds; rate limiting helps shield burst traffic.

![Vercel deploy](./images/howto/vercel-deploy.png "Vercel dashboard showing successful deployment")

## 12. Optional SMTP Magic Link Email
Minimal config for Mailtrap / dev:
```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM="Resume Builder <no-reply@example.com>"
```

Email template lives inside `src/app/api/send-login-link/route.ts` and includes a styled button plus plaintext fallback.

![Magic link email](./images/howto/magic-email.png "Sample magic link email rendered in a mailbox")

## 13. Extending the App (Roadmap Highlights)
From `docs/roadmap.md`:
- Turnstile / hCaptcha integration
- Persistent metrics (KV or SQLite)
- Accessibility (aria-live regions)
- Drag & drop reordering
- Service worker offline mode (exploratory)

Link: `[View full roadmap](./roadmap.md)`

## 14. Troubleshooting
| Issue | Suggestion |
|-------|------------|
| 429 on export | Wait for retry window; reduce rapid clicks |
| Puppeteer launch fails (serverless) | Ensure `@sparticuz/chromium` + `puppeteer-core` in dependencies |
| Blank PDF | Confirm `APP_BASE_URL` correct; check `/print?data=...` renders in browser |
| Lost session | Keep tab open until you export; no persistence by design |
| Windows ENOENT in `.next` | Delete `.next/` and restart dev server |

Sample 429 JSON:
```json
{
  "error": "Too many export requests",
  "retryAfterMs": 24000
}
```

## 15. Conclusion & Next Steps
You now have a fast, privacy‑respectful workflow for producing polished resumes. Fork it, adjust templates, or wire in persistence if you need it—and if you improve it, consider opening a PR.

**Star the repo • Share feedback • Build mindfully.**

---

### SEO Meta (Optional for Blog Host)
- Title: End-to-End Guide: Crafting a Privacy‑First Resume with an Open Source Next.js Builder
- Description: Build a professional, privacy‑first resume with structured inputs, live scoring, and Puppeteer PDF export using an open source Next.js app.
- Keywords: privacy first resume builder, next.js pdf export, open source resume generator, puppeteer resume pdf

---

### Screenshot Production Notes
Use consistent 16:9 aspect where possible, prefer light mode (unless showing dark template contrast). Annotations: minimal labels, subtle arrows (1–2px, neutral gray).

<!-- जय श्री राम -->
