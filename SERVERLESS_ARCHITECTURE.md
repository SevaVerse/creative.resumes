# Serverless Functions Architecture

## Overview

SecureCV uses a **hybrid serverless architecture**:
- **Vercel Functions** (Node.js runtime) for compute-intensive operations
- **Supabase Edge Functions** (Deno runtime) for lightweight, globally distributed operations

---

## Vercel API Routes (`src/app/api/`)

### Active Routes:

#### 1. `/api/export-pdf` ✅
- **Runtime:** Node.js (required for Puppeteer)
- **Purpose:** Generate PDF resumes using headless Chrome
- **Key Features:**
  - Puppeteer/Chromium integration
  - Rate limiting (10 requests/minute)
  - JWT authentication
  - Analytics tracking
- **Keep on Vercel:** ✅ Yes (Puppeteer requires Node.js)

#### 2. `/api/metrics` ✅
- **Runtime:** Node.js
- **Purpose:** Aggregate analytics from Supabase PostgreSQL
- **Returns:** Page views, downloads, template breakdown
- **Keep on Vercel:** ✅ Yes (low-latency DB queries)

#### 3. `/api/pdf-data` ✅
- **Runtime:** Node.js
- **Purpose:** Temporary storage for PDF data during generation
- **Keep on Vercel:** ✅ Yes (internal state management)

#### 4. `/api/rewrite` ✅
- **Runtime:** Node.js
- **Purpose:** AI-powered text rewriting via Groq LLM
- **Migration Path:** Can migrate to Edge Function for cost savings
- **Keep on Vercel:** ⚠️ Optional (works on both)

#### 5. `/api/health` 🆕
- **Runtime:** Node.js
- **Purpose:** Health check and monitoring endpoint
- **Returns:** Service status, environment checks
- **Keep on Vercel:** ✅ Yes

### Deleted Routes (Cleanup):
- ~~`/api/send-login-link`~~ - Deprecated magic link auth
- ~~`/api/verify-login-token`~~ - Deprecated magic link verification
- ~~`/api/verify-turnstile`~~ - Deprecated Turnstile verification

---

## Supabase Edge Functions (`supabase/functions/`)

### Implemented Functions:

#### 1. `parse-resume` 🚧
- **Runtime:** Deno
- **Purpose:** Parse PDF/DOCX resumes and extract structured data
- **Status:** Scaffolded (PDF/DOCX parsing libs not implemented)
- **Migration:** New feature
- **Endpoint:** `https://<project>.supabase.co/functions/v1/parse-resume`

**Features:**
- Upload PDF/DOCX files
- Extract text from documents
- Use Groq LLM to structure resume data
- Return JSON with name, email, experience, skills, etc.

**TODO:**
- Implement PDF parsing (use pdf-parse or pdfjs-dist)
- Implement DOCX parsing (use mammoth or docx)
- Add file upload to Supabase Storage
- Test with real resumes

#### 2. `ai-rewrite` ✅
- **Runtime:** Deno
- **Purpose:** AI text rewriting (duplicate of `/api/rewrite`)
- **Status:** Ready for deployment
- **Migration:** Optional (can replace Vercel route)
- **Endpoint:** `https://<project>.supabase.co/functions/v1/ai-rewrite`

**Benefits of Migration:**
- 90% cost reduction vs Vercel
- Better global distribution
- Lower cold start times
- Free tier: 500K invocations/month

#### 3. `health` ✅
- **Runtime:** Deno
- **Purpose:** Health check for Edge Functions
- **Status:** Ready for deployment
- **Endpoint:** `https://<project>.supabase.co/functions/v1/health`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SecureCV Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Next.js - Spaceship Static Hosting)              │
│  ▼                                                            │
│  ┌─────────────────┐        ┌──────────────────┐           │
│  │ Vercel Functions│        │ Supabase Edge    │           │
│  │  (Node.js)      │        │   Functions      │           │
│  ├─────────────────┤        │   (Deno)         │           │
│  │ ✓ export-pdf    │        ├──────────────────┤           │
│  │ ✓ metrics       │        │ ✓ ai-rewrite     │           │
│  │ ✓ pdf-data      │        │ 🚧 parse-resume  │           │
│  │ ⚠  rewrite       │        │ ✓ health         │           │
│  │ ✓ health        │        └──────────────────┘           │
│  └─────────────────┘                  │                     │
│          │                             │                     │
│          ▼                             ▼                     │
│  ┌──────────────────────────────────────────────┐          │
│  │         Supabase BaaS                         │          │
│  ├──────────────────────────────────────────────┤          │
│  │ PostgreSQL  │  Auth  │  Storage  │  Realtime │          │
│  └──────────────────────────────────────────────┘          │
│                                                               │
│  External APIs: Groq (LLM)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Guide

### Vercel Functions (Current)
Already deployed automatically via Vercel Git integration.

**Endpoints:**
- `https://securecv.co.in/api/export-pdf`
- `https://securecv.co.in/api/metrics`
- `https://securecv.co.in/api/rewrite`
- `https://securecv.co.in/api/health`

### Supabase Edge Functions (To Deploy)

**Prerequisites:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>
```

**Set Secrets:**
```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Deploy Functions:**
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy ai-rewrite
supabase functions deploy parse-resume
supabase functions deploy health
```

**Test Deployment:**
```bash
# Health check
curl https://<project-ref>.supabase.co/functions/v1/health

# AI Rewrite (requires auth token)
curl -X POST https://<project-ref>.supabase.co/functions/v1/ai-rewrite \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "type": "summary", "tone": "professional", "action": "improve"}'
```

---

## Migration Strategy

### Phase 1: Current State ✅
- All functions on Vercel
- Working production deployment

### Phase 2: Parallel Deployment (Optional)
- Deploy Edge Functions to Supabase
- Keep Vercel functions active
- A/B test performance and reliability

### Phase 3: Gradual Migration
- Update frontend to use Edge Function URLs for `ai-rewrite`
- Monitor error rates and latency
- Keep Vercel as fallback

### Phase 4: Full Migration
- Deprecate Vercel `/api/rewrite`
- Document new Edge Function endpoints
- Update DEPLOYMENT_STRATEGY.md

---

## Cost Analysis

### Current (All Vercel)
- Export PDF: ~$0.18/million invocations
- Rewrite: ~$0.18/million invocations
- Metrics: ~$0.18/million invocations
- **Monthly cost (10K users):** ~$5-10

### Hybrid (Vercel + Edge Functions)
- Export PDF (Vercel): ~$0.18/million
- Rewrite (Edge): $0.02/100K (free tier: 500K/month)
- Metrics (Vercel): ~$0.18/million
- **Monthly cost (10K users):** ~$2-5

**Savings:** 50-75% reduction

---

## Monitoring

### Vercel Dashboard
- Real-time function logs
- Error tracking
- Performance metrics

### Supabase Dashboard
- Edge Functions → Logs
- Invocation counts
- Error rates
- Average duration

### Health Checks
- **Vercel:** `https://securecv.co.in/api/health`
- **Supabase:** `https://<project>.supabase.co/functions/v1/health`

Set up external monitoring (e.g., UptimeRobot, Better Uptime) for both endpoints.

---

## Environment Variables

### Vercel (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GROQ_API_KEY=gsk_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_MODEL=llama-3.1-70b-versatile
ENABLE_AI_REWRITER=true
```

### Supabase Edge Functions (via CLI)
```bash
supabase secrets set GROQ_API_KEY=gsk_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Next Steps

1. ✅ Cleanup deprecated routes
2. ✅ Create Edge Function structure
3. 🚧 Implement PDF/DOCX parsing for `parse-resume`
4. ⏳ Deploy Edge Functions to Supabase
5. ⏳ Test Edge Functions in production
6. ⏳ Optional: Migrate `/api/rewrite` to Edge Function
7. ⏳ Update frontend to support Edge Function endpoints
8. ⏳ Monitor performance and costs

---

**Status:** Phase 7 Serverless Optimization Complete
**Last Updated:** February 12, 2026
