# Phase 4: API Separation & Authentication - Complete ✅

**Date:** February 9, 2026
**Status:** Completed

## Overview
Secured serverless API routes (PDF export, AI rewrite) with JWT authentication and CORS headers, preparing them for separation from the static app.

## Changes Implemented

### 1. JWT Verification Utility (`src/utils/supabase/jwt.ts`)
Created authentication utilities for API routes:
- ✅ `verifySupabaseAuth()` - Verifies Bearer tokens from Authorization header
- ✅ `getCorsHeaders()` - Generates CORS headers for cross-origin requests
- ✅ Supports Supabase JWT token validation
- ✅ Allows requests from Spaceship-hosted static app to Vercel-hosted APIs

**Allowed Origins:**
- `https://securecv.co.in`
- `https://www.securecv.co.in`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- Environment variable: `NEXT_PUBLIC_APP_URL`

### 2. PDF Export API (`src/app/api/export-pdf/route.ts`)
**Added Security:**
- ✅ JWT authentication required (401 if unauthorized)
- ✅ Rate limiting per authenticated user (not IP)
- ✅ CORS headers for cross-origin requests
- ✅ OPTIONS preflight handler
- ✅ Logs userId for monitoring

**Updated Logic:**
- Rate limit key changed from `pdf:<ip>` to `pdf:<userId>`
- Auth verification happens before rate limiting
- User-friendly error messages

### 3. AI Rewrite API (`src/app/api/rewrite/route.ts`)
**Added Security:**
- ✅ JWT authentication required (401 if unauthorized)
- ✅ Rate limiting per authenticated user (not IP)
- ✅ CORS headers for cross-origin requests
- ✅ OPTIONS preflight handler
- ✅ Logs userId for monitoring

**Updated Logic:**
- Rate limit key changed from `rewrite:<ip>` to `rewrite:<userId>`
- Auth verification happens before rate limiting
- All error responses include CORS headers

### 4. Frontend Updates

#### PDF Export (`src/app/page.tsx`)
```typescript
// Get Supabase session token
const { data: { session } } = await supabase.auth.getSession();
authToken = session?.access_token;

// Send token in Authorization header
headers: { 
  "Content-Type": "application/json",
  "Authorization": `Bearer ${authToken}`,
}
```

#### AI Rewriter (`src/components/AIRewriter.tsx`)
```typescript
// Get token before API call
const { createClient } = await import('@/utils/supabase/client');
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
authToken = session?.access_token;

// Include in request headers
headers: { 
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authToken}`,
}
```

## Architecture Benefits

### Current Setup (Monolithic)
```
┌─────────────────────────┐
│   Next.js App (Vercel)  │
│  ┌──────────────────┐   │
│  │  React Frontend  │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │   API Routes     │   │
│  │  - export-pdf    │   │
│  │  - rewrite       │   │
│  │  - auth/callback │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### Future Setup (Separated)
```
┌─────────────────────────┐       ┌──────────────────────┐
│  Static App (Spaceship) │       │  Serverless (Vercel) │
│  ┌──────────────────┐   │       │  ┌───────────────┐   │
│  │  HTML/CSS/JS     │───────────┼─→│  export-pdf   │   │
│  │  (React build)   │   │       │  └───────────────┘   │
│  └──────────────────┘   │       │  ┌───────────────┐   │
│                          │       │  │  rewrite      │   │
│  Calls with JWT token ──────────┼─→└───────────────┘   │
│  via Authorization header│       │                      │
└─────────────────────────┘       └──────────────────────┘
         │                                    │
         └────────────┬───────────────────────┘
                      ▼
              ┌───────────────┐
              │   Supabase    │
              │  - Auth       │
              │  - Database   │
              └───────────────┘
```

## Testing Checklist

- [ ] PDF export works with authenticated user
- [ ] PDF export returns 401 for unauthenticated requests
- [ ] AI rewrite works with authenticated user
- [ ] AI rewrite returns 401 for unauthenticated requests
- [ ] Rate limiting applies per user (not IP)
- [ ] CORS headers present in all responses
- [ ] OPTIONS preflight requests handled correctly
- [ ] Error messages are user-friendly

## Security Improvements

1. **Authentication Required**: Only signed-in users can use expensive APIs
2. **Per-User Rate Limiting**: Prevents single user from abusing system
3. **CORS Protection**: Only allowed origins can make requests
4. **JWT Verification**: Ensures requests are from legitimate authenticated sessions
5. **User Tracking**: Logs userId for monitoring and abuse detection

## Rate Limits

| API Endpoint | Limit | Window | Key |
|-------------|-------|--------|-----|
| `/api/export-pdf` | 10 requests | 60s | `pdf:<userId>` |
| `/api/rewrite` | 20 requests | 60s | `rewrite:<userId>` |

## Environment Variables Required

```env
# Supabase (already configured in Phase 1-3)
NEXT_PUBLIC_SUPABASE_URL=https://hoveczdmawakanxvlpxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional: Override allowed origin
NEXT_PUBLIC_APP_URL=https://securecv.co.in
```

## API Response Changes

### Success Responses (No Breaking Changes)
- Same payload structure
- Added CORS headers
- Added rate limit headers

### Error Responses
```json
// 401 Unauthorized
{
  "error": "Unauthorized. Please sign in to export PDFs."
}

// 429 Rate Limited
{
  "error": "Too many export requests",
  "retryAfterMs": 45000
}
```

## Next Steps

### Phase 5: Analytics Migration
- [ ] Replace Redis metrics with Supabase queries
- [ ] Create analytics aggregation Edge Function
- [ ] Update `/api/metrics` route

### Phase 6: Static Export Configuration
- [ ] Update `next.config.ts` with `output: 'export'`
- [ ] Configure dynamic routes strategy
- [ ] Test static build generation
- [ ] Verify API routes are excluded from export

### Phase 7-10: Remaining Work
- [ ] UX enhancements (onboarding, template preview, resume upload)
- [ ] Domain migration to Cloudflare
- [ ] Deployment to Spaceship
- [ ] Cleanup and optimization

## Notes

- **PDF Service**: Remains on Vercel due to Puppeteer Node.js requirement
- **Print Page**: Can be statically exported; PDF API calls it via URL
- **Auth Tokens**: Obtained from Supabase client SDK on frontend
- **Backward Compatibility**: Old magic link auth components still present but unused
- **Migration Path**: When moving to Spaceship, update CORS allowed origins

## Files Modified

### Created
- `src/utils/supabase/jwt.ts` - JWT verification utilities

### Modified
- `src/app/api/export-pdf/route.ts` - Added auth, CORS, OPTIONS
- `src/app/api/rewrite/route.ts` - Added auth, CORS, OPTIONS
- `src/app/page.tsx` - Send auth token in PDF export
- `src/components/AIRewriter.tsx` - Send auth token in rewrite requests

### Dependencies
No new dependencies required (uses existing `@supabase/ssr`)

---

✅ **Phase 4 Complete** - APIs are now secured and ready for separation!
