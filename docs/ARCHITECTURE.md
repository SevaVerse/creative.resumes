# SecureCV Architecture & Deployment Guide

## Overview

SecureCV uses a modern **hybrid JAMstack architecture** combining static hosting with serverless functions for optimal performance, cost, and scalability.

```
┌─────────────────────────────────────────────────────────────┐
│                      securecv.co.in                         │
│                    (Cloudflare DNS/CDN)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌─────────────────┐
│   Spaceship    │ │ Supabase │ │ Vercel Functions│
│ Static Hosting │ │   BaaS   │ │  (PDF Service)  │
├────────────────┤ ├──────────┤ ├─────────────────┤
│ • HTML/CSS/JS  │ │ • Auth   │ │ • Puppeteer     │
│ • React (CSR)  │ │ • PostDB │ │ • Chromium      │
│ • No server    │ │ • Storage│ │ • Node runtime  │
│ • CDN cached   │ │ • Edge Fn│ └─────────────────┘
└────────────────┘ └──────────┘         │
         │               │               │
         └───────────────┼───────────────┘
                      ┌─────────────────┐
                      │   Groq API      │
                      │   (AI Models)   │
                      └─────────────────┘
```

---

## Architecture Components

### Frontend (Spaceship Static Hosting)

**Technology:** Next.js with static export
**Purpose:** User interface, client-side logic, routing
**Features:**
- React 19 with TypeScript
- Tailwind CSS for styling
- Client-side authentication state
- Resume builder interface
- Template selection and preview

**Build Process:**
```bash
npm run build  # Creates static HTML/CSS/JS in out/
```

### Backend Services

#### Supabase (Primary Backend)
**Services:**
- **Authentication:** OAuth via Google/GitHub
- **Database:** PostgreSQL with Row-Level Security
- **Edge Functions:** Lightweight serverless functions
- **Storage:** File uploads (future feature)

**Database Schema:**
```sql
-- Users (managed by Supabase Auth)
-- Resumes table for persistence
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics (privacy-preserving)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Vercel Functions (Compute-Intensive Tasks)
**Purpose:** Handle operations requiring Node.js runtime
**Functions:**
- `/api/export-pdf` - PDF generation with Puppeteer
- `/api/metrics` - Analytics aggregation
- `/api/pdf-data` - Temporary PDF storage
- `/api/health` - Health checks

**Why Vercel:** Puppeteer requires Node.js (not available in Edge Runtime)

#### Supabase Edge Functions (Lightweight Operations)
**Runtime:** Deno (similar to Node.js but optimized)
**Functions:**
- `ai-rewrite` - AI text rewriting (primary)
- `parse-resume` - Resume upload parsing
- `health` - Edge function health checks

**Benefits:**
- 90% cost reduction vs Vercel ($0.35M vs $0.18M after free tier)
- Global CDN distribution
- Automatic fallback to Vercel on failures

### External APIs

#### Groq API
**Purpose:** Large Language Model for AI text rewriting
**Integration:** Called from Supabase Edge Functions
**Models:** llama-3.1-70b-versatile, llama-3.1-8b-instant

---

## Deployment Strategy

### Current Deployment (Hybrid)

**Frontend:** Spaceship static hosting
- Static HTML/CSS/JS files
- CDN cached globally via Cloudflare
- No server-side rendering

**APIs:** Vercel serverless functions
- PDF generation service
- Analytics aggregation
- Health monitoring

**Edge Functions:** Supabase Edge Runtime
- AI rewriting (primary endpoint)
- Resume parsing (future feature)

### Domain & CDN

**Cloudflare Configuration:**
- DNS management for securecv.co.in
- CDN with global edge caching
- Bot protection (replaces Turnstile)
- SSL/TLS encryption

**DNS Records:**
```
A      @        <spaceship-ip>     Proxied
CNAME  api      <vercel-url>       Proxied
CNAME  www      securecv.co.in     Proxied
```

---

## Authentication Flow

### OAuth Implementation

1. **User clicks "Sign In"** → Redirects to Supabase Auth
2. **Supabase Auth** → OAuth provider (Google/GitHub)
3. **Provider callback** → Supabase processes token
4. **Supabase redirects** → `/auth/callback` with authorization code
5. **Client-side callback** → Exchanges code for session
6. **Session established** → User authenticated

### API Authentication

**Frontend to API calls:**
```typescript
// Get user session
const { data: { session } } = await supabase.auth.getSession()

// Include JWT in requests
const response = await fetch('/api/export-pdf', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
})
```

**API Route Protection:**
```typescript
import { verifySupabaseAuth } from '@/utils/supabase/jwt'

export async function POST(request: Request) {
  // Verify JWT token
  const { userId, error } = await verifySupabaseAuth(request)
  if (error) return Response.json({ error }, { status: 401 })

  // Proceed with authenticated request
}
```

---

## AI Integration

### Primary Flow (Edge Function)

```typescript
// Frontend calls Edge Function
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/ai-rewrite`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Original text',
      type: 'summary',
      tone: 'professional',
      action: 'improve'
    })
  }
)

// Edge Function calls Groq API
const groq = new Groq({ apiKey: GROQ_API_KEY })
const completion = await groq.chat.completions.create({
  model: 'llama-3.1-70b-versatile',
  messages: [{ role: 'user', content: prompt }]
})
```

### Fallback Flow (Vercel)

If Edge Function fails (5xx error), automatically retry with Vercel endpoint.

### Cost Optimization

| Service | Cost | Free Tier | Notes |
|---------|------|-----------|-------|
| Vercel Functions | $0.18/M invocations | 100K/month | Used as fallback |
| Supabase Edge | $0.35/M invocations | 500K/month | Primary endpoint |
| Groq API | Variable | Credits-based | LLM usage |

**Savings:** ~90% reduction using Edge Functions for AI operations.

---

## Security Implementation

### Authentication Security
- JWT tokens with short expiration
- Row-Level Security (RLS) on database
- OAuth 2.0 PKCE flow
- Secure token storage in client

### API Security
- JWT verification on all protected routes
- CORS restrictions to allowed origins
- Rate limiting per authenticated user
- Input validation and sanitization

### Infrastructure Security
- Cloudflare WAF and bot protection
- HTTPS everywhere (Cloudflare SSL)
- Secure headers (CSP, HSTS, etc.)
- Environment variable encryption

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Deployment

**Frontend (Static):**
```bash
npm run build  # Creates out/ directory
# Deploy out/ to Spaceship via FTP
```

**APIs (Vercel):**
- Automatic deployment via Git integration
- Environment variables set in Vercel dashboard

**Edge Functions (Supabase):**
```bash
supabase functions deploy
```

---

## Monitoring & Analytics

### Application Metrics
- Page views and user interactions
- Template usage statistics
- PDF export counts
- AI rewrite usage

### Performance Monitoring
- Vercel function execution times
- Supabase Edge Function latency
- Database query performance
- CDN cache hit rates

### Error Tracking
- Vercel function errors
- Supabase function logs
- Client-side error reporting
- API failure rates

---

## Migration History

### Phase 1-3: Core Infrastructure
- Supabase setup and OAuth integration
- Database schema and RLS policies
- Basic authentication flow

### Phase 4: API Security
- JWT authentication on API routes
- CORS headers for cross-origin requests
- Rate limiting per user (not IP)

### Phase 5: Analytics Migration
- Replaced Redis with Supabase PostgreSQL
- Privacy-preserving analytics collection
- Real-time dashboard data

### Phase 6: Static Export Preparation
- Next.js configuration for static builds
- Client-side authentication handling
- Hybrid deployment architecture

### Phase 7: Edge Functions
- AI rewrite migration to Edge Functions
- 90% cost reduction achieved
- Automatic fallback mechanism

### Phase 8: Domain Migration (In Progress)
- Cloudflare DNS setup
- SSL certificate configuration
- CDN optimization

### Phase 9-10: Production Deployment
- Spaceship hosting setup
- Vercel API deployment
- Final testing and monitoring

---

## Troubleshooting

### Common Issues

**Authentication Problems:**
- Check OAuth provider configuration in Supabase
- Verify redirect URLs match exactly
- Ensure environment variables are set correctly

**API Errors:**
- Verify JWT tokens are included in requests
- Check CORS allowed origins
- Monitor rate limiting

**Build Issues:**
- Ensure all environment variables are set
- Check TypeScript compilation errors
- Verify Edge Function deployments

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Documentation](https://developers.cloudflare.com)

---

## Future Enhancements

- Resume upload with AI parsing
- Advanced analytics dashboard
- Email notifications
- Multi-language support
- Template marketplace
- Collaboration features

---

*Last Updated: February 15, 2026*</content>
<parameter name="filePath">c:\workspace\os\v1\resume_v4\docs\ARCHITECTURE.md