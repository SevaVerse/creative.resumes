# Deployment Strategy for SecureCV

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           securecv.co.in (Cloudflare DNS)               │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌───────────────────┐
│   Spaceship     │       │  Vercel Serverless│
│ Static Frontend │       │    API Routes     │
├─────────────────┤       ├───────────────────┤
│ /               │       │ /api/export-pdf   │
│ /privacy        │       │ /api/rewrite      │
│ /blog/*         │       │ /api/metrics      │
│ /print          │       └───────────────────┘
└─────────────────┘                │
         │                         │
         └────────────┬────────────┘
                      ▼
              ┌───────────────┐
              │   Supabase    │
              │  PostgreSQL   │
              │  Auth (OAuth) │
              └───────────────┘
```

## Current Status (Phase 1-5 Complete)

### ✅ Implemented
- **Authentication:** Supabase OAuth (Google, GitHub)
- **Database:** PostgreSQL with Row-Level Security
- **Resume Persistence:** Save, load, autosave functionality
- **API Security:** JWT authentication + CORS headers
- **Analytics:** Migrated from Redis to Supabase

### 🔄 In Progress (Phase 6)
- **Next.js Configuration:** Prepared for static export
- **API Routes:** Secured with CORS for cross-origin access
- **Build Strategy:** Hybrid deployment ready

## Hybrid Deployment Approach

Since Next.js `output: 'export'` cannot include API routes, we use a **hybrid deployment**:

### Frontend (Static)
- **Platform:** Spaceship (or any static host)
- **Build:** `npm run build` → `out/` directory
- **Content:** All pages, components, styles, client-side JS
- **Hosting:** CDN-optimized static files

### Backend (Serverless)
- **Platform:** Vercel (or similar serverless platform)
- **Routes:** `/api/export-pdf`, `/api/rewrite`, `/api/metrics`
- **Runtime:** Node.js (Puppeteer requires Node runtime)
- **Authentication:** JWT validation on every request

## Deployment Steps (Phase 9)

### 1. Frontend Deployment to Spaceship

```bash
# Build static files
npm run build

# Output directory: out/
# Deploy out/ directory to Spaceship

# OR if using output: 'export' in next.config.ts:
# Note: Must remove API routes first
```

### 2. API Routes Deployment to Vercel

**Option A:** Keep current monorepo, deploy selectively
- Deploy to Vercel with default Next.js config
- Vercel automatically handles `/api/*` as serverless functions
- Update frontend URL to point to Vercel API domain

**Option B:** Separate API repository
```bash
# Create separate Next.js app with only API routes
mkdir securecv-api
cd securecv-api
npm create next-app@latest .

# Copy API routes
cp -r ../resume_v4/src/app/api ./src/app/
cp -r ../resume_v4/src/utils ./src/utils

# Deploy to Vercel
vercel deploy --prod
```

### 3. Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hoveczdmawakanxvlpxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=https://api.securecv.co.in  # Vercel API domain
```

**Backend (Vercel Environment Variables)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hoveczdmawakanxvlpxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
GROQ_API_KEY=<groq-key>
NEW_RELIC_LICENSE_KEY=<nr-key>
```

### 4. DNS Configuration (Cloudflare)

```
securecv.co.in           A     <Spaceship IP>        (Frontend)
www.securecv.co.in       CNAME securecv.co.in       (Redirect)
api.securecv.co.in       CNAME cname.vercel-dns.com (API)
```

### 5. CORS Update

Update [src/utils/supabase/jwt.ts](src/utils/supabase/jwt.ts) allowed origins:

```typescript
const allowedOrigins = [
  'https://securecv.co.in',
  'https://www.securecv.co.in',
  'http://localhost:3000',  // Development
];
```

## Testing Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] OAuth callback URLs updated in Supabase
- [ ] Environment variables documented
- [ ] API routes tested with CORS from localhost

### After Frontend Deployment
- [ ] Static pages load correctly
- [ ] Client-side routing works
- [ ] OAuth flow completes successfully
- [ ] Supabase auth persists across sessions

### After API Deployment
- [ ] PDF export works from frontend
- [ ] AI rewriter works from frontend
- [ ] Metrics display correctly
- [ ] Rate limiting functions properly
- [ ] JWT authentication blocks unauthorized requests

### Integration Testing
- [ ] Save resume (frontend → API → Supabase)
- [ ] Load resume (frontend ← Supabase)
- [ ] Download PDF (frontend → Vercel API → frontend)
- [ ] AI rewrite (frontend → Vercel API → Groq → frontend)
- [ ] Analytics tracking (frontend → Supabase)

## Rollback Plan

If issues arise:
1. **Frontend:** Revert DNS to point to Vercel monolith
2. **API:** Keep Vercel deployment as backup
3. **Database:** Supabase data is unaffected

## Cost Optimization

| Service | Current (Vercel Monolith) | After (Hybrid) | Savings |
|---------|---------------------------|----------------|---------|
| Hosting | $20/mo (Vercel Pro) | Free (Spaceship) | $20/mo |
| Serverless | Included | ~$5/mo (API only) | $15/mo |
| Database | $25/mo (Supabase) | $25/mo | $0 |
| **Total** | **$45/mo** | **$30/mo** | **$15/mo** |

## Performance Benefits

- **Static CDN:** Faster page loads (no server rendering)
- **Edge Caching:** Cloudflare caches static assets globally
- **Reduced Cold Starts:** Only API routes need warm-up
- **Better Scalability:** Static files scale infinitely

## Security Considerations

- **Auth:** OAuth via Supabase (secure by default)
- **API:** JWT validation prevents unauthorized access
- **CORS:** Strict origin checking
- **RLS:** Database-level security via Supabase Row-Level Security
- **No Secrets in Frontend:** All API keys server-side only

## Future Enhancements (Phase 7-10)

- [ ] Resume upload with AI parsing
- [ ] Onboarding flow
- [ ] Template preview modal
- [ ] Advanced analytics dashboard
- [ ] Email notifications (optional)

---

**Last Updated:** February 12, 2026  
**Status:** Phase 6 - Configuration Complete, Deployment Pending (Phase 9)
