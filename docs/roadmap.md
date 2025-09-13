# Roadmap / Future Enhancements

This document tracks planned improvements and exploratory ideas for the Resume Builder. Items are intentionally lightweight and incremental.

## 🎯 Pending Enhancements

### 1. Login & Security
- [ ] Add basic in-memory rate limiting (throttle magic link requests per IP/session/tab)
  - Simple map of key => timestamps; prune periodically
  - Config via env: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- [ ] Optional production captcha providers behind env flags
  - Support Cloudflare Turnstile (preferred privacy-friendly)
  - Support hCaptcha as fallback
  - Controlled via: `CAPTCHA_PROVIDER=turnstile|hcaptcha|none`
  - Graceful no-op in local/dev
- [ ] Persist last used email in `localStorage` (opt-in) with a clear button
  - Key: `rb_last_email`
  - Add small "Remember email" checkbox
- [ ] Accessibility upgrade: `aria-live="polite"` region for captcha validation feedback
  - Announce new captcha and errors
  - Consider focus management on refresh/error

### 2. Captcha UX Evolutions
- [ ] Add keyboard shortcut (Enter) to submit once captcha is valid
- [ ] Provide alternate challenge if user fails N times (e.g., different math style)
- [ ] Add subtle progress animation for sending link (skeleton pulse or shimmer)

### 3. Metrics & Observability
- [ ] Make metrics persistence pluggable (SQLite / Vercel KV / Upstash Redis)
- [ ] Add basic health endpoint (e.g., `/api/health`)
- [ ] Log anonymized export durations for perf tuning (in-memory rolling window)

### 4. PDF Export Enhancements
- [ ] Add retry with exponential backoff client-side on transient failures
- [ ] Show file size + timestamp in download toast
- [ ] Optionally embed minimal metadata (title/author) into PDF

### 5. Templates & Editor
- [ ] Add reorder (drag & drop) for experience & skills
- [ ] Provide inline suggestions (quantifiable verbs library)
- [ ] Dark-mode preview toggle independent of system theme

### 6. Sustainability
- [ ] Compute approximate ink coverage more accurately (SVG → area analysis)
- [ ] Add optional “Eco Mode” template variant (monochrome minimal)

### 7. Developer Experience
- [ ] Add unit tests for PDF route (stub chromium)
- [ ] Add automated accessibility checks (axe) in preview mode
- [ ] Add storybook (optional) for template components

## 🧪 Experimental / Maybe Later
- [ ] Offline-ready via service worker (manifest + caching)
- [ ] WASM-based PDF generation entirely client-side
- [ ] AI-enhanced bullet improvement suggestions (local model or API-optional)

## 📝 Contributing Notes
When implementing any feature:
1. Prefer progressive enhancement; no blocking of core resume flow.
2. Preserve privacy-first defaults (no silent external calls).
3. Keep dependencies minimal and justify any new third-party package.
4. Add small docs snippet or inline comments for future maintainers.

---
This roadmap is iterative—feel free to prune or reprioritize as needs evolve.
