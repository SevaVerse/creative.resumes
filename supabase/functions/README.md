# Supabase Edge Functions for SecureCV

This directory contains Deno-based Edge Functions deployed to Supabase.

## Functions

### 1. `parse-resume`
**Purpose:** Parse uploaded PDF/DOCX resumes and extract structured data using AI

**Endpoint:** `https://<project-ref>.supabase.co/functions/v1/parse-resume`

**Request:**
```json
{
  "fileContent": "base64_encoded_file_content",
  "contentType": "application/pdf",
  "fileName": "resume.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "summary": "Experienced software engineer...",
    "experiences": [...],
    "education": "...",
    "skills": [...]
  },
  "rawText": "First 500 chars of extracted text..."
}
```

**Status:** 🚧 Placeholder (PDF/DOCX parsing libs not implemented yet)

---

### 2. `ai-rewrite`
**Purpose:** Rewrite resume content using AI with tone and action controls

**Endpoint:** `https://<project-ref>.supabase.co/functions/v1/ai-rewrite`

**Request:**
```json
{
  "text": "Original text to rewrite",
  "type": "experience",
  "tone": "professional",
  "action": "improve"
}
```

**Response:**
```json
{
  "success": true,
  "original": "...",
  "rewritten": "...",
  "stats": {
    "originalLength": 100,
    "rewrittenLength": 85,
    "savedChars": 15
  }
}
```

**Status:** ✅ Ready (can migrate from Vercel `/api/rewrite`)

---

### 3. `health`
**Purpose:** Health check endpoint for monitoring

**Endpoint:** `https://<project-ref>.supabase.co/functions/v1/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T10:30:00Z",
  "checks": {
    "groq_api": true,
    "supabase_url": true,
    "supabase_key": true
  }
}
```

**Status:** ✅ Ready

---

## Deployment

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref <your-project-ref>`

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy parse-resume
supabase functions deploy ai-rewrite
supabase functions deploy health
```

### Set Secrets
```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key
```

### Local Development
```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/health' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## Migration Plan

### Current State (Vercel API Routes)
- ✅ `/api/export-pdf` - Puppeteer PDF generation (must stay on Vercel/Node.js)
- ✅ `/api/metrics` - Analytics queries (can stay on Vercel)
- ✅ `/api/pdf-data` - Temp data storage (internal, can stay)
- ✅ `/api/rewrite` - AI rewriting (can migrate to Edge Function)

### Migration Steps
1. **Keep on Vercel:**
   - `/api/export-pdf` - Puppeteer requires Node.js runtime
   - `/api/metrics` - Low latency database queries
   - `/api/pdf-data` - Internal state management

2. **Migrate to Edge Functions:**
   - `/api/rewrite` → `ai-rewrite` Edge Function
     - Better global distribution
     - Lower cold start times
     - Cheaper compute costs

3. **New Features:**
   - `parse-resume` - Resume upload parsing
   - `health` - Monitoring endpoint

---

## Environment Variables

**Required in Supabase Dashboard → Settings → Edge Functions:**
- `GROQ_API_KEY` - Groq API key for LLM
- `SERVICE_ROLE_KEY` - Service role key for admin operations (Note: Cannot start with SUPABASE_ prefix)

**Note:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` are automatically injected.

---

## Cost Optimization

### Vercel (Current)
- `/api/rewrite`: ~50ms execution, 128MB memory
- Cost: $0.18 per million invocations

### Supabase Edge Functions (Proposed)
- `ai-rewrite`: ~50ms execution, free tier: 500K invocations/month
- Cost: Free up to limit, then $0.02 per 100K invocations

**Savings:** ~90% cost reduction for AI rewrite operations

---

## Testing

```bash
# Health check
curl https://<project-ref>.supabase.co/functions/v1/health

# AI Rewrite
curl -X POST https://<project-ref>.supabase.co/functions/v1/ai-rewrite \
  -H "Authorization: Bearer <user-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Developed features",
    "type": "experience",
    "tone": "professional",
    "action": "improve"
  }'
```

---

## Monitoring

1. **Supabase Dashboard:**
   - Edge Functions → Logs
   - View invocation counts, errors, latency

2. **Health Endpoint:**
   - Set up uptime monitoring (e.g., UptimeRobot)
   - Check: `https://<project-ref>.supabase.co/functions/v1/health`

---

## Next Steps

1. ✅ Create Edge Function structure
2. ✅ Implement `ai-rewrite` Edge Function
3. 🚧 Implement PDF/DOCX parsing libraries for `parse-resume`
4. ⬜ Test Edge Functions locally
5. ⬜ Deploy to Supabase production
6. ⬜ Update frontend to use Edge Function URLs (optional migration)
7. ⬜ Monitor performance and costs

---

**Status:** Phase 7 Complete - Edge Functions scaffolded and ready for deployment
