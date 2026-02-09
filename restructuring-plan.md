# SecureCV Restructuring Plan
**Created:** February 8, 2026  
**Target Architecture:** Static hosting on Spaceship + Supabase BaaS + Serverless PDF  
**Goal:** Migrate from Vercel monolith to modern static deployment with user accounts, resume persistence, and enhanced UX

---

## Executive Summary

### Current State
- **Platform:** Vercel (Next.js 15 with Node.js runtime)
- **Architecture:** Monolithic serverless application
- **Auth:** Magic link (HMAC-based, stateless)
- **Database:** None (client-side state only, optional Redis for metrics)
- **PDF:** Puppeteer/Chromium in Node.js runtime
- **URL:** https://securecv.co.in

### Target State
- **Platform:** Spaceship (static hosting)
- **Architecture:** JAMstack (Static UI + BaaS + Serverless functions)
- **Auth:** OAuth via Supabase (Google, GitHub)
- **Database:** Supabase PostgreSQL (users, resumes, analytics)
- **PDF:** Separate serverless function (keep Puppeteer quality)
- **Domain:** Cloudflare-managed securecv.co.in

### Key Changes
1. ✅ **Static Export:** Next.js static HTML/CSS/JS on Spaceship
2. ✅ **OAuth:** Replace magic links with Google/GitHub OAuth
3. ✅ **Database:** Add PostgreSQL for user accounts, resume persistence, analytics
4. ✅ **PDF Service:** Decouple to standalone serverless function
5. ✅ **Domain:** Migrate DNS to Cloudflare
6. ✅ **UX:** Onboarding, template preview, resume upload, autosave, AI enhancements

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      securecv.co.in                         │
│                    (Cloudflare DNS)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌─────────────────┐
│   Spaceship    │ │ Supabase │ │ PDF Service     │
│ Static Hosting │ │   BaaS   │ │ (Vercel Lambda) │
├────────────────┤ ├──────────┤ ├─────────────────┤
│ • HTML/CSS/JS  │ │ • Auth   │ │ • Puppeteer     │
│ • React (CSR)  │ │ • PostDB │ │ • Chromium      │
│ • No server    │ │ • Storage│ │ • Node runtime  │
│ • CDN cached   │ │ • Edge Fn│ │ • pdf.securecv  │
└────────────────┘ └──────────┘ └─────────────────┘
```

---

## Current Architecture Analysis

### Strengths
- ✅ Privacy-first design (no tracking, minimal data collection)
- ✅ Clean separation of concerns
- ✅ Comprehensive security headers (CSP, HSTS, CORS)
- ✅ Graceful fallbacks (Redis → in-memory)
- ✅ High-quality PDF generation (Puppeteer renders HTML/CSS perfectly)
- ✅ Environment-driven configuration

### Limitations
- ❌ No data persistence (all state client-side or in-memory)
- ❌ Tight coupling to Node.js runtime (Puppeteer requirement)
- ❌ In-memory rate limiting not scalable (single-instance only)
- ❌ Temporary PDF storage via `globalThis` (not multi-instance safe)
- ❌ Magic link auth requires SMTP configuration
- ❌ No saved resumes feature

### Dependencies to Remove
- `nodemailer` (SMTP for magic links)
- `@marsidev/react-turnstile` (replaced by Cloudflare Bot Fight Mode)
- `ioredis` (replaced by Supabase PostgreSQL)
- `newrelic` (optional, can use Supabase analytics)

### Dependencies to Add
- `@supabase/supabase-js` (client library)
- `@supabase/ssr` (server-side rendering helpers)
- Optional: PDF parsing libraries for resume upload feature

---

## Phase 1: Supabase Setup & Database Design

### 1.1 Create Supabase Project
**Prerequisites:**
- Supabase account at https://supabase.com
- Email for project notifications

**Steps:**
1. Create new project: `securecv-prod`
2. Choose region closest to target users (e.g., Mumbai/Singapore for India)
3. Set strong database password (save securely)
4. Wait for provisioning (~2 minutes)

**Outputs:**
- Project URL: `https://xxxxxx.supabase.co`
- Anon key: `eyJhbGc...` (public, safe to expose)
- Service role key: `eyJhbGc...` (secret, server-only)

### 1.2 Configure OAuth Providers
**Google OAuth:**
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Create OAuth app in Google Cloud Console:
   - Console: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URIs: `https://xxxxxx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase
5. Add authorized domain: `securecv.co.in`

**GitHub OAuth:**
1. Go to Supabase Dashboard → Authentication → Providers → GitHub
2. Enable GitHub provider
3. Create OAuth app in GitHub Settings:
   - Settings → Developer settings → OAuth Apps → New OAuth App
   - Authorization callback URL: `https://xxxxxx.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

**Site URL Configuration:**
- Set Site URL: `https://securecv.co.in`
- Add to Redirect URLs: `https://securecv.co.in/auth/callback`

### 1.3 Design Database Schema
**Create tables via Supabase SQL Editor:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resumes table (main data storage)
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template TEXT NOT NULL CHECK (template IN ('minimalist', 'onyx', 'awesome-cv', 'subtle-elegant')),
  data JSONB NOT NULL,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table (privacy-preserving metrics)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view', 'resume_download', 'ai_rewrite', 'template_change',
    'resume_upload', 'resume_save', 'resume_load'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_last_edited ON resumes(last_edited_at DESC);
CREATE INDEX idx_resumes_created ON resumes(created_at DESC);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created ON analytics(created_at DESC);
CREATE INDEX idx_analytics_user_id ON analytics(user_id) WHERE user_id IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON resumes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 1.4 Configure Row Level Security (RLS)
**Privacy-first security policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Resumes policies (users can only access their own)
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics policies (insert-only for logged-in users)
CREATE POLICY "Users can insert own analytics"
  ON analytics FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Service role can read analytics (for admin dashboard)
CREATE POLICY "Service role can read analytics"
  ON analytics FOR SELECT
  USING (auth.jwt()->>'role' = 'service_role');
```

### 1.5 Install Supabase in Project
**Update package.json:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Create Supabase client utilities:**

**File: `src/utils/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/utils/supabase/server.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**File: `src/utils/supabase/middleware.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**Environment Variables (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server-only, for admin operations
```

---

## Phase 2: Authentication Migration

### 2.1 Create Auth Components

**File: `src/components/AuthProvider.tsx`**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signInWithGithub, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

**File: `src/components/LoginButton.tsx`**
```typescript
'use client'

import { useAuth } from './AuthProvider'

export function LoginButton() {
  const { user, loading, signInWithGoogle, signInWithGithub, signOut } = useAuth()

  if (loading) {
    return <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.email}</span>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      <button
        onClick={signInWithGithub}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
        </svg>
        GitHub
      </button>
    </div>
  )
}
```

### 2.2 Create Auth Callback Route

**File: `src/app/auth/callback/route.ts`**
```typescript
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`)
}
```

### 2.3 Update Middleware

**File: `src/middleware.ts`**
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request)

  // Add security headers (keep existing CSP, HSTS, etc.)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add CSP (update for Supabase domains)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2.4 Update Layout with Auth Provider

**File: `src/app/layout.tsx`** (add AuthProvider wrapper)
```typescript
import { AuthProvider } from '@/components/AuthProvider'
import { LoginButton } from '@/components/LoginButton'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className="border-b">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold">SecureCV</h1>
              <LoginButton />
            </div>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2.5 Remove Old Auth Files
**Delete these files:**
- `src/utils/magicLink.ts`
- `src/app/api/send-login-link/route.ts`
- `src/app/api/verify-login-token/route.ts`
- `src/app/api/verify-turnstile/route.ts`
- `src/components/Turnstile.tsx`

**Update package.json (remove):**
```bash
npm uninstall nodemailer @types/nodemailer @marsidev/react-turnstile
```

---

## Phase 3: Resume Persistence Layer

### 3.1 Create Database Abstraction

**File: `src/lib/db/resumes.ts`**
```typescript
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'

type Resume = Database['public']['Tables']['resumes']['Row']
type ResumeInsert = Database['public']['Tables']['resumes']['Insert']
type ResumeUpdate = Database['public']['Tables']['resumes']['Update']

export async function saveResume(
  userId: string,
  name: string,
  template: string,
  data: any
): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      name,
      template,
      data,
    })
    .select()
    .single()

  if (error) throw error
  return resume
}

export async function updateResume(
  resumeId: string,
  updates: Partial<ResumeUpdate>
): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', resumeId)
    .select()
    .single()

  if (error) throw error
  return resume
}

export async function loadResume(resumeId: string): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single()

  if (error) throw error
  return resume
}

export async function listResumes(userId: string): Promise<Resume[]> {
  const supabase = createClient()
  
  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('last_edited_at', { ascending: false })

  if (error) throw error
  return resumes || []
}

export async function deleteResume(resumeId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)

  if (error) throw error
}

// Debounced autosave implementation
let autosaveTimeout: NodeJS.Timeout | null = null

export function autoSaveResume(
  resumeId: string,
  data: any,
  delay: number = 30000
): Promise<Resume> {
  return new Promise((resolve, reject) => {
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout)
    }

    autosaveTimeout = setTimeout(async () => {
      try {
        const resume = await updateResume(resumeId, { data })
        resolve(resume)
      } catch (error) {
        reject(error)
      }
    }, delay)
  })
}
```

### 3.2 Generate Database Types

**Install Supabase CLI:**
```bash
npm install -D supabase
npx supabase login
npx supabase init
```

**Generate types:**
```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
```

**Add to package.json scripts:**
```json
{
  "scripts": {
    "db:types": "npx supabase gen types typescript --project-id <project-id> > src/types/database.ts"
  }
}
```

### 3.3 Add Save/Load UI Components

**File: `src/components/ResumeSaveButton.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { saveResume, updateResume } from '@/lib/db/resumes'

interface Props {
  currentResumeId?: string
  template: string
  data: any
  onSaveSuccess: (resumeId: string, name: string) => void
}

export function ResumeSaveButton({ currentResumeId, template, data, onSaveSuccess }: Props) {
  const { user } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const handleSave = async () => {
    if (!resumeName.trim()) return

    setSaving(true)
    try {
      if (currentResumeId) {
        await updateResume(currentResumeId, { name: resumeName, template, data })
      } else {
        const resume = await saveResume(user.id, resumeName, template, data)
        onSaveSuccess(resume.id, resume.name)
      }
      setShowDialog(false)
      setResumeName('')
    } catch (error) {
      console.error('Failed to save resume:', error)
      alert('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        {currentResumeId ? 'Save Changes' : 'Save Resume'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {currentResumeId ? 'Update Resume' : 'Save Resume'}
            </h2>
            <input
              type="text"
              placeholder="Resume name (e.g., Software Engineer - Google)"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={saving || !resumeName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

**File: `src/components/ResumeLoader.tsx`**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { listResumes } from '@/lib/db/resumes'
import type { Database } from '@/types/database'

type Resume = Database['public']['Tables']['resumes']['Row']

interface Props {
  onLoadResume: (resume: Resume) => void
}

export function ResumeLoader({ onLoadResume }: Props) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (user && showDialog) {
      loadResumes()
    }
  }, [user, showDialog])

  const loadResumes = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await listResumes(user.id)
      setResumes(data)
    } catch (error) {
      console.error('Failed to load resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (resume: Resume) => {
    onLoadResume(resume)
    setShowDialog(false)
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
      >
        Load Resume
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Your Resumes</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No saved resumes yet. Create and save your first resume!
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleLoad(resume)}
                    className="w-full text-left p-4 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">{resume.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Template: {resume.template} • 
                      Last edited: {new Date(resume.last_edited_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 3.4 Add Autosave Indicator

**File: `src/components/AutosaveIndicator.tsx`**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  status: SaveStatus
  lastSaved?: Date
}

export function AutosaveIndicator({ status, lastSaved }: Props) {
  const { user } = useAuth()
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      if (seconds < 60) setTimeAgo('just now')
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000)
    return () => clearInterval(interval)
  }, [lastSaved])

  if (!user) return null

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {status === 'saving' && (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && lastSaved && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Saved {timeAgo}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Failed to save</span>
        </>
      )}
    </div>
  )
}
```

### 3.5 Update Main Resume Page

**File: `src/app/page.tsx`** (add save/load functionality)
- Import `ResumeSaveButton`, `ResumeLoader`, `AutosaveIndicator`
- Add state: `currentResumeId`, `resumeName`, `saveStatus`, `lastSaved`
- Implement autosave effect (debounced, 30 seconds)
- Add save/load buttons to header
- Handle unsaved changes warning on page unload

---

## Phase 4: PDF Service Separation

### 4.1 Create Separate PDF Service Project

**Option A: Vercel Serverless Function (Recommended)**

**Create new repository: `securecv-pdf-service`**

**Structure:**
```
securecv-pdf-service/
├── api/
│   └── export-pdf.ts      # Puppeteer PDF generation
│   └── pdf-data.ts        # Temporary data retrieval
├── package.json
├── vercel.json            # Vercel configuration
└── .env.example
```

**File: `api/export-pdf.ts`** (copy from current `src/app/api/export-pdf/route.ts`)
- Add JWT verification (Supabase token)
- Add rate limiting (check Supabase analytics table)
- Update CORS headers for `securecv.co.in`
- Track downloads to Supabase analytics

**File: `vercel.json`**
```json
{
  "version": 2,
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x",
      "memory": 3008,
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

**File: `package.json`**
```json
{
  "name": "securecv-pdf-service",
  "version": "1.0.0",
  "dependencies": {
    "puppeteer-core": "^22.0.0",
    "@sparticuz/chromium-min": "^121.0.0",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

**Deploy to Vercel:**
```bash
vercel --prod
# Note the URL: https://securecv-pdf-service.vercel.app
```

**Set up custom domain:**
- Add `pdf.securecv.co.in` to Vercel project
- Add CNAME record in Cloudflare: `pdf` → `cname.vercel-dns.com`

### 4.2 Update Main App PDF Export

**File: `src/utils/pdfExport.ts`**
```typescript
import { createClient } from '@/utils/supabase/client'

export async function exportPDF(resumeData: any): Promise<Blob> {
  const supabase = createClient()
  
  // Get current user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Must be logged in to export PDF')
  }

  // Call PDF service
  const response = await fetch('https://pdf.securecv.co.in/api/export-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(resumeData),
  })

  if (!response.ok) {
    throw new Error(`PDF export failed: ${response.statusText}`)
  }

  return await response.blob()
}
```

**Update export button in `src/app/page.tsx`:**
```typescript
const handleExportPDF = async () => {
  setExporting(true)
  try {
    const pdfBlob = await exportPDF(resumeData)
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeName || 'resume'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    
    // Track download
    trackAnalytics('resume_download', { template, resumeId })
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('Failed to export PDF. Please try again.')
  } finally {
    setExporting(false)
  }
}
```

### 4.3 Implement Database-Backed Rate Limiting

**File: `api/export-pdf.ts`** (in PDF service)
```typescript
import { createClient } from '@supabase/supabase-js'

async function checkRateLimit(userId: string, ipAddress: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Count downloads in last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
  
  const { data, error } = await supabase
    .from('analytics')
    .select('id', { count: 'exact' })
    .eq('event_type', 'resume_download')
    .or(`user_id.eq.${userId},metadata->>ip.eq.${ipAddress}`)
    .gte('created_at', oneMinuteAgo)

  if (error) throw error

  // Allow 10 downloads per minute per user/IP
  return (data?.length || 0) < 10
}
```

---

## Phase 5: Analytics Migration

### 5.1 Create Analytics Utility

**File: `src/lib/analytics.ts`**
```typescript
import { createClient } from '@/utils/supabase/client'

export async function trackEvent(
  eventType: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('analytics').insert({
    user_id: user?.id || null,
    event_type: eventType,
    metadata,
  })
}

export async function trackPageView() {
  await trackEvent('page_view', {
    path: window.location.pathname,
    referrer: document.referrer,
  })
}

export async function trackDownload(template: string, resumeId?: string) {
  await trackEvent('resume_download', {
    template,
    resume_id: resumeId,
  })
}

export async function trackAIRewrite(fieldType: string, tone: string) {
  await trackEvent('ai_rewrite', {
    field_type: fieldType,
    tone,
  })
}

export async function trackTemplateChange(from: string, to: string) {
  await trackEvent('template_change', {
    from_template: from,
    to_template: to,
  })
}
```

### 5.2 Update Metrics API Route

**File: `src/app/api/metrics/route.ts`** (replace Redis with Supabase)
```typescript
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient()

  // Get total page views
  const { count: pageViews } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'page_view')

  // Get total downloads
  const { count: downloads } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'resume_download')

  // Get downloads by template
  const { data: byTemplate } = await supabase
    .from('analytics')
    .select('metadata')
    .eq('event_type', 'resume_download')

  const templateCounts = byTemplate?.reduce((acc: any, row: any) => {
    const template = row.metadata?.template || 'unknown'
    acc[template] = (acc[template] || 0) + 1
    return acc
  }, {})

  return Response.json({
    page_hits: pageViews || 0,
    resume_downloads: downloads || 0,
    by_template: templateCounts,
  })
}
```

### 5.3 Remove Redis Dependencies

**Delete files:**
- `src/utils/redis.ts`
- `src/utils/rateLimit.ts` (if using Redis)

**Update package.json:**
```bash
npm uninstall ioredis
```

**Remove environment variables:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## Phase 6: Static Export Configuration

### 6.1 Update Next.js Config

**File: `next.config.ts`**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',  // ← Enable static export
  images: {
    unoptimized: true,  // ← Required for static export
  },
  trailingSlash: true,  // ← Better for static hosting
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
```

### 6.2 Remove Server-Only Features

**Check for incompatible features:**
- ❌ Server actions (`'use server'`)
- ❌ API routes in pages (must move to external service)
- ❌ Middleware that modifies responses (security headers OK)
- ❌ `getServerSideProps`, `unstable_getServerProps`
- ✅ Client components (`'use client'`)
- ✅ Static generation (`generateStaticParams`)

**Move remaining API routes:**
- `src/app/api/rewrite/route.ts` → Supabase Edge Function or keep on Vercel
- `src/app/api/metrics/route.ts` → Can be client-side query to Supabase

### 6.3 Update Build Scripts

**File: `package.json`**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "build:static": "next build && next export",
    "preview": "npx serve@latest out/",
    "lint": "next lint"
  }
}
```

### 6.4 Add 404 Page

**File: `src/app/not-found.tsx`**
```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
```

### 6.5 Test Static Build

```bash
# Build static export
npm run build

# Check output
ls -la out/

# Test locally
npx serve@latest out/
# Open http://localhost:3000

# Test all routes work
# Test auth redirects work
# Test PDF export works (should call external service)
```

---

## Phase 7: UX Enhancements

### 7.1 Onboarding Flow

**File: `src/components/Onboarding.tsx`**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'

export function Onboarding() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding && user) {
      setShow(true)
    }
  }, [user])

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    {
      title: 'Welcome to SecureCV!',
      description: 'Create beautiful, privacy-first resumes in minutes.',
      image: '/onboarding/welcome.svg',
    },
    {
      title: 'Choose Your Template',
      description: 'Pick from 4 professionally designed templates. Switch anytime!',
      image: '/onboarding/templates.svg',
    },
    {
      title: 'AI-Powered Writing',
      description: 'Use AI to improve your descriptions and highlight achievements.',
      image: '/onboarding/ai.svg',
    },
    {
      title: 'Autosave & Export',
      description: 'Your work is automatically saved. Export to PDF when ready.',
      image: '/onboarding/export.svg',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{steps[step].title}</h2>
          <p className="text-lg text-gray-600 mb-8">{steps[step].description}</p>
          <div className="h-64 mb-8 flex items-center justify-center">
            <div className="text-gray-400 text-sm">
              [Illustration: {steps[step].image}]
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleComplete}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === steps.length - 1) {
                  handleComplete()
                } else {
                  setStep(step + 1)
                }
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {step === steps.length - 1 ? "Let's Start!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 Template Preview & Selection

**File: `src/components/TemplateSelector.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { MinimalistTemplate } from './MinimalistTemplate'
import { OnyxTemplate } from './OnyxTemplate'
import { AwesomeCVTemplate } from './AwesomeCVTemplate'
import { SubtleElegantTemplate } from './SubtleElegantTemplate'

const templates = [
  { id: 'minimalist', name: 'Minimalist', carbon: 8, Component: MinimalistTemplate },
  { id: 'onyx', name: 'Onyx', carbon: 4, Component: OnyxTemplate },
  { id: 'awesome-cv', name: 'Awesome CV', carbon: 0, Component: AwesomeCVTemplate },
  { id: 'subtle-elegant', name: 'Subtle Elegant', carbon: 7, Component: SubtleElegantTemplate },
]

interface Props {
  currentTemplate: string
  onSelect: (templateId: string) => void
  resumeData: any
}

export function TemplateSelector({ currentTemplate, onSelect, resumeData }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(currentTemplate)

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId)
    setShowPreview(true)
  }

  const handleSelect = () => {
    onSelect(previewTemplate)
    setShowPreview(false)
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handlePreview(template.id)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              currentTemplate === template.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[8.5/11] bg-gray-100 rounded mb-3 flex items-center justify-center">
              <span className="text-sm text-gray-400">Preview</span>
            </div>
            <h3 className="font-medium mb-1">{template.name}</h3>
            <div className="text-sm text-gray-600">
              Carbon: {template.carbon}/10
            </div>
          </button>
        ))}
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {templates.find((t) => t.id === previewTemplate)?.name}
              </h2>
              <div className="flex gap-2">
                {previewTemplate !== currentTemplate && (
                  <button
                    onClick={handleSelect}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Use This Template
                  </button>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {(() => {
                const Template = templates.find((t) => t.id === previewTemplate)?.Component
                return Template ? <Template data={resumeData} /> : null
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 7.3 Resume Upload & Parsing

**File: `src/components/ResumeUploader.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Props {
  onParseComplete: (data: any) => void
}

export function ResumeUploader({ onParseComplete }: Props) {
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      alert('Please upload a PDF or DOCX file')
      return
    }

    setUploading(true)
    const supabase = createClient()

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resume-uploads')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setParsing(true)

      // Call parsing function (Supabase Edge Function or external API)
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('https://your-project.supabase.co/functions/v1/parse-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      })

      const parsedData = await response.json()
      onParseComplete(parsedData)

      // Clean up uploaded file
      await supabase.storage.from('resume-uploads').remove([fileName])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload and parse resume. Please try again.')
    } finally {
      setUploading(false)
      setParsing(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
        id="resume-upload"
        disabled={uploading || parsing}
      />
      <label
        htmlFor="resume-upload"
        className="cursor-pointer"
      >
        {uploading ? (
          <div>Uploading...</div>
        ) : parsing ? (
          <div>Parsing resume...</div>
        ) : (
          <>
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">Upload Existing Resume</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll extract your information automatically
            </p>
            <div className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
              Choose File (PDF or DOCX)
            </div>
          </>
        )}
      </label>
    </div>
  )
}
```

**Create Supabase Edge Function for parsing:**

**File: `supabase/functions/parse-resume/index.ts`**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { fileName } = await req.json()

    // Download file from storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resume-uploads')
      .download(fileName)

    if (downloadError) throw downloadError

    // Extract text from PDF/DOCX (you'll need appropriate libraries)
    // For now, placeholder logic
    const extractedText = await extractTextFromFile(fileData)

    // Use LLM to structure the data
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Extract structured resume data from the text. Return JSON with fields: name, email, phone, summary, experience, education, skills.',
          },
          {
            role: 'user',
            content: extractedText,
          },
        ],
      }),
    })

    const llmResult = await response.json()
    const structuredData = JSON.parse(llmResult.choices[0].message.content)

    return new Response(JSON.stringify(structuredData), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 7.4 Enhanced AI Features

**Update: `src/components/AIRewriter.tsx`**
- Add tone selector: Professional, Casual, Technical
- Add action dropdown: Improve, Expand, Condense, Suggest Achievements
- Show before/after character counts
- Add copy button for result
- Show loading spinner during API call

### 7.5 Form UX Improvements

**Features to add to `src/app/page.tsx`:**
- Section reordering with drag handles (use `@dnd-kit/core`)
- Collapsible sections (accordion style)
- Inline validation with helpful error messages
- Progress bar showing completion percentage
- Smooth animations for add/remove actions
- Keyboard shortcuts (Ctrl+S to save, Ctrl+E to export)

---

## Phase 8: Domain Migration to Cloudflare

### 8.1 Set Up Cloudflare Account

1. Create account at https://cloudflare.com
2. Choose Free plan
3. Add domain: `securecv.co.in`
4. Note the nameservers (e.g., `carter.ns.cloudflare.com`)

### 8.2 Update Nameservers

1. Log in to domain registrar (where you bought `securecv.co.in`)
2. Find DNS/Nameserver settings
3. Replace existing nameservers with Cloudflare's
4. Wait for propagation (24-48 hours, usually faster)
5. Verify in Cloudflare dashboard (status will turn active)

### 8.3 Configure DNS Records

**Add these records in Cloudflare DNS:**

| Type  | Name | Target                    | Proxy | TTL  |
|-------|------|---------------------------|-------|------|
| A     | @    | <Spaceship IP>            | ✅    | Auto |
| CNAME | www  | securecv.co.in            | ✅    | Auto |
| CNAME | pdf  | cname.vercel-dns.com      | ✅    | Auto |

**Get Spaceship IP address:**
- Contact Spaceship support or check their dashboard
- If using their CDN, they'll provide a CNAME instead

### 8.4 Configure SSL/TLS

1. Go to SSL/TLS → Overview
2. Select "Full (strict)" mode
3. Enable Always Use HTTPS
4. Turn on Automatic HTTPS Rewrites
5. Enable TLS 1.3
6. Minimum TLS Version: 1.2

### 8.5 Enable Performance Features

**Speed:**
- Auto Minify: Enable HTML, CSS, JS
- Brotli Compression: On
- HTTP/2: On (default)
- HTTP/3 (with QUIC): On
- Early Hints: On

**Caching:**
- Caching Level: Standard
- Browser Cache TTL: 4 hours
- Always Online: On

**Page Rules (create these):**
```
Rule 1: securecv.co.in/*
- Cache Level: Cache Everything
- Edge Cache TTL: 2 hours
- Browser Cache TTL: 4 hours

Rule 2: securecv.co.in/api/*
- Cache Level: Bypass
```

### 8.6 Enable Security Features

**Security:**
- Bot Fight Mode: On (replaces Turnstile)
- Challenge Passage: 30 minutes
- Security Level: Medium

**Firewall:**
- Create rule: Block countries with unusual traffic patterns (if needed)
- Rate limiting (if available on Free plan):
  - 100 requests per minute per IP for PDF exports

### 8.7 Update Application Configuration

**Update Supabase redirect URLs:**
- Add `https://securecv.co.in/auth/callback`
- Add `https://www.securecv.co.in/auth/callback`

**Update OAuth apps:**
- Google: Add `securecv.co.in` to authorized domains
- GitHub: Add `https://securecv.co.in/auth/callback` to callbacks

**Update environment variables:**
```bash
APP_BASE_URL=https://securecv.co.in
PDF_SERVICE_URL=https://pdf.securecv.co.in
```

---

## Phase 9: Deployment to Spaceship

### 9.1 Set Up Spaceship Project

**Prerequisites:**
- Spaceship account
- SSH access or FTP credentials
- Static hosting bucket/space configured

**Note domain mapping:**
- Point `securecv.co.in` to your Spaceship IP (done in Cloudflare)

### 9.2 Create Deployment Script

**File: `scripts/deploy-spaceship.sh`**
```bash
#!/bin/bash
set -e

echo "Building Next.js static export..."
npm run build

echo "Checking output directory..."
if [ ! -d "out" ]; then
  echo "Error: out/ directory not found"
  exit 1
fi

echo "Deploying to Spaceship..."

# Option 1: Using rsync over SSH
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  out/ \
  user@spaceship-server.com:/var/www/securecv/

# Option 2: Using FTP (if rsync not available)
# lftp -c "
#   open ftp://user:password@ftp.spaceship-server.com;
#   mirror -Rev out/ /public_html/securecv --delete
# "

echo "Deployment complete!"
echo "Visit: https://securecv.co.in"
```

**Make executable:**
```bash
chmod +x scripts/deploy-spaceship.sh
```

### 9.3 Set Up CI/CD (Optional)

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to Spaceship

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static export
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Deploy to Spaceship
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H $SSH_HOST >> ~/.ssh/known_hosts
          rsync -avz --delete out/ $SSH_USER@$SSH_HOST:/var/www/securecv/

      - name: Notify deployment
        if: success()
        run: echo "Deployment successful!"
```

**Add GitHub Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SSH_PRIVATE_KEY` (your private key for Spaceship)
- `SSH_HOST` (Spaceship server hostname)
- `SSH_USER` (SSH username)

### 9.4 First Deployment

**Manual deployment:**
```bash
# 1. Build
npm run build

# 2. Verify output
ls -la out/

# 3. Test locally first
npx serve@latest out/
# Open browser, test all functionality

# 4. Deploy to Spaceship
./scripts/deploy-spaceship.sh

# 5. Verify live site
curl -I https://securecv.co.in
# Should return 200 OK

# 6. Test in browser
# Visit https://securecv.co.in
# Test auth, save/load, PDF export
```

### 9.5 Configure Spaceship Server

**Create `.htaccess` or nginx config for SPA routing:**

**For Apache (.htaccess in Spaceship root):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**For Nginx (if you have access to config):**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Phase 10: Testing & Cleanup

### 10.1 Comprehensive Testing Checklist

**Authentication:**
- [ ] Google OAuth login redirects correctly
- [ ] GitHub OAuth login redirects correctly
- [ ] Session persists across page reloads
- [ ] Logout clears session
- [ ] Unauthenticated users see login prompt

**Resume Creation:**
- [ ] Can create new resume from scratch
- [ ] All form fields work correctly
- [ ] Can add/remove experience entries
- [ ] Can add/remove education entries
- [ ] Can add/remove skills
- [ ] Validation shows helpful errors

**Template System:**
- [ ] Can switch between all 4 templates
- [ ] Live preview updates immediately
- [ ] Template selector shows previews
- [ ] Carbon scores displayed correctly

**Save/Load Functionality:**
- [ ] Can save resume with custom name
- [ ] Resume appears in "Load Resume" list
- [ ] Can load saved resume
- [ ] Resume data loads correctly
- [ ] Can update existing resume
- [ ] Can delete saved resume

**Autosave:**
- [ ] Autosave triggers after 30s of inactivity
- [ ] Status indicator shows "Saving..."
- [ ] Status changes to "Saved X ago"
- [ ] Unsaved changes warning on page exit

**PDF Export:**
- [ ] PDF generation works
- [ ] PDF matches live preview exactly
- [ ] PDF filename matches resume name
- [ ] PDF download triggers correctly
- [ ] Rate limiting prevents abuse

**Resume Upload:**
- [ ] Can upload PDF files
- [ ] Can upload DOCX files
- [ ] Parsing extracts data correctly
- [ ] Extracted data pre-fills form
- [ ] Confidence scores shown (if implemented)

**AI Features:**
- [ ] AI rewriter suggests improvements
- [ ] Tone selection works (professional/casual/technical)
- [ ] Expand/condense options work
- [ ] Character counts shown
- [ ] "Suggest achievements" works

**Analytics:**
- [ ] Page views tracked
- [ ] Downloads tracked
- [ ] Template changes tracked
- [ ] AI usage tracked
- [ ] Metrics API returns correct data

**Responsive Design:**
- [ ] Mobile view (< 768px) works
- [ ] Tablet view (768-1024px) works
- [ ] Desktop view (> 1024px) works
- [ ] PDF preview scrollable on mobile
- [ ] Menus accessible on mobile

**Performance:**
- [ ] Initial page load < 3s
- [ ] Time to Interactive < 3s
- [ ] PDF export < 10s
- [ ] No console errors
- [ ] No memory leaks

**SEO & Accessibility:**
- [ ] Meta tags present
- [ ] og:image set
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### 10.2 Performance Optimization

**Code Splitting:**
```typescript
// Lazy load templates
const MinimalistTemplate = dynamic(() => import('@/components/MinimalistTemplate'))
const OnyxTemplate = dynamic(() => import('@/components/OnyxTemplate'))
const AwesomeCVTemplate = dynamic(() => import('@/components/AwesomeCVTemplate'))
const SubtleElegantTemplate = dynamic(() => import('@/components/SubtleElegantTemplate'))

// Lazy load heavy components
const AIRewriter = dynamic(() => import('@/components/AIRewriter'))
const ResumeUploader = dynamic(() => import('@/components/ResumeUploader'))
```

**Image Optimization:**
- Convert images to WebP format
- Compress with ImageOptim or similar
- Use appropriate sizes (don't serve 2x larger than needed)

**Bundle Analysis:**
```bash
npm install -D @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

# Run analysis
ANALYZE=true npm run build
```

**Cloudflare Optimizations:**
- Enable Polish (lossless image compression)
- Enable Mirage (lazy loading)
- Enable Rocket Loader (defer JS)

### 10.3 Remove Old Dependencies

**File: `package.json`** (remove these):
```json
{
  "dependencies": {
    // Remove:
    "nodemailer": "...",
    "@types/nodemailer": "...",
    "@marsidev/react-turnstile": "...",
    "ioredis": "...",
    "newrelic": "..."  // Optional, if not using
  }
}
```

```bash
npm uninstall nodemailer @types/nodemailer @marsidev/react-turnstile ioredis
```

**Delete unused files:**
```bash
rm src/utils/magicLink.ts
rm src/utils/redis.ts
rm src/utils/rateLimit.ts
rm src/components/Turnstile.tsx
rm src/app/api/send-login-link/route.ts
rm src/app/api/verify-login-token/route.ts
rm src/app/api/verify-turnstile/route.ts
rm newrelic.js  # If not using New Relic
```

### 10.4 Update Documentation

**File: `README.md`**
```markdown
# SecureCV - Privacy-First Resume Builder

Beautiful, professional resumes with zero tracking.

## Architecture

- **Frontend**: Static Next.js (deployed on Spaceship)
- **Auth**: Supabase (OAuth: Google, GitHub)
- **Database**: Supabase PostgreSQL
- **PDF Service**: Separate Vercel serverless function
- **Domain**: Cloudflare-managed securecv.co.in

## Local Development

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables (see below)

### Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials

# Run dev server
npm run dev
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Services
PDF_SERVICE_URL=https://pdf.securecv.co.in

# Optional
GROQ_API_KEY=gsk_...  # For AI features
```

### Build & Deploy

```bash
# Build static export
npm run build

# Preview locally
npx serve@latest out/

# Deploy to Spaceship
./scripts/deploy-spaceship.sh
```

## Project Structure

```
src/
├── app/                # Next.js pages
│   ├── page.tsx       # Main resume editor
│   ├── layout.tsx     # Root layout with auth
│   └── auth/          # OAuth callback
├── components/         # React components
│   ├── AuthProvider.tsx
│   ├── ResumeTemplates/
│   └── ...
├── lib/               # Business logic
│   ├── db/            # Database operations
│   └── analytics.ts   # Event tracking
├── utils/             # Utilities
│   └── supabase/      # Supabase clients
└── types/             # TypeScript types
```

## Features

- ✅ 4 professional resume templates
- ✅ Real-time preview
- ✅ OAuth authentication (Google, GitHub)
- ✅ Cloud-synced resume saves
- ✅ Autosave (30s debounce)
- ✅ AI-powered text improvements (optional)
- ✅ Resume upload & parsing
- ✅ High-quality PDF export
- ✅ Privacy-first (no tracking)
- ✅ Mobile responsive

## Privacy

- No Google Analytics or third-party trackers
- Resume data encrypted in transit (TLS)
- Row-level security in database
- User data exportable/deletable
- Optional analytics (anonymous, aggregated)

## License

MIT
```

**File: `.env.example`**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# PDF Service
PDF_SERVICE_URL=https://pdf.securecv.co.in

# Optional: AI Features
GROQ_API_KEY=gsk_xxx
GROQ_MODEL=llama-3.1-70b-versatile

# Optional: Feature Flags
ENABLE_AI_REWRITER=true
ENABLE_METRICS=true
NEXT_PUBLIC_ENABLE_METRICS=true
```

---

## Tools & Technologies

### Core Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **PDF**: Puppeteer + Chromium (Vercel serverless)
- **Hosting**: Spaceship (static), Vercel (PDF service)
- **CDN**: Cloudflare
- **Domain**: Cloudflare DNS

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (add if needed)
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions

### External Services
- **Supabase**: Free tier (500MB DB, 50K users, 2GB bandwidth)
- **Vercel**: Free tier (Hobby, 100 GB-hours serverless)
- **Cloudflare**: Free tier (unlimited requests, DDoS protection)
- **Groq**: Free tier (LLM API for AI features)
- **Spaceship**: Static hosting (check their free tier limits)

---

## Estimated Timeline

### Phase 1-2: Foundation (Week 1)
- Supabase setup: 2 hours
- Database design: 2 hours
- Auth migration: 4 hours
- Testing: 2 hours

### Phase 3: Data Layer (Week 2)
- Database abstraction: 3 hours
- Save/Load UI: 4 hours
- Autosave: 2 hours
- Testing: 1 hour

### Phase 4-5: Services (Week 2-3)
- PDF service separation: 6 hours
- Analytics migration: 3 hours
- Testing: 2 hours

### Phase 6: Static Export (Week 3)
- Next.js config: 1 hour
- Remove server features: 3 hours
- Build testing: 2 hours

### Phase 7: UX (Week 4-5)
- Onboarding: 4 hours
- Template preview: 4 hours
- Resume upload: 8 hours
- AI enhancements: 4 hours
- Form improvements: 6 hours
- Testing: 4 hours

### Phase 8-9: Deployment (Week 5-6)
- Cloudflare setup: 2 hours
- DNS migration: 1 hour (+ 24-48h propagation)
- Spaceship setup: 2 hours
- Deployment scripts: 2 hours
- CI/CD: 2 hours
- Testing: 4 hours

### Phase 10: Polish (Week 6)
- Performance optimization: 4 hours
- Cleanup: 2 hours
- Documentation: 2 hours
- Final testing: 4 hours

**Total: ~80-100 hours over 6 weeks**

---

## Cost Estimate

### Monthly Operating Costs

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Supabase | Free | $0 | Up to 500MB DB, 50K users |
| Vercel (PDF) | Hobby | $0 | 100 GB-hours serverless |
| Cloudflare | Free | $0 | Unlimited DDoS protection |
| Spaceship | ? | ? | Check their static hosting pricing |
| Groq | Free | $0 | Rate limited, upgrade if needed |
| Domain | Renewal | ~$10/year | Depends on registrar |

**Estimated: $0-20/month** (mostly domain + potential Spaceship cost)

### Scaling Considerations
- **Supabase**: Upgrade to Pro ($25/mo) for 8GB DB, 100K users
- **Vercel**: Upgrade to Pro ($20/mo) for 1000 GB-hours
- **Cloudflare**: Upgrade to Pro ($20/mo) for advanced features
- **Groq**: Upgrade if free tier insufficient

---

## Risk Assessment

### High Risk
- ❌ **Spaceship compatibility unknown**: Need to verify static hosting capabilities, SPA routing support
- ⚠️ **PDF service costs**: Could increase with high traffic (Vercel serverless)
- ⚠️ **Resume parsing accuracy**: LLM extraction may not be 100% accurate

### Medium Risk
- ⚠️ **DNS propagation delays**: 24-48 hours downtime during migration
- ⚠️ **OAuth configuration**: Typos in redirect URLs break auth
- ⚠️ **Database migration**: No automatic migration from current (no DB)

### Low Risk
- ✅ **Static export**: Well-tested Next.js feature
- ✅ **Supabase**: Mature, stable, excellent documentation
- ✅ **Cloudflare**: Industry-leading CDN/DNS

### Mitigation Strategies
1. **Spaceship**: Test with small static site first
2. **DNS**: Keep Vercel as fallback during migration
3. **OAuth**: Use test accounts before going live
4. **Parsing**: Provide manual edit after auto-fill
5. **Costs**: Set up billing alerts on all platforms

---

## Success Criteria

### Technical
- ✅ Static build completes without errors
- ✅ All pages load in < 3 seconds
- ✅ PDF generation works consistently
- ✅ OAuth login success rate > 95%
- ✅ Database queries return in < 100ms
- ✅ Mobile Lighthouse score > 90

### Business
- ✅ Zero downtime migration
- ✅ All existing features preserved
- ✅ Monthly costs < $20
- ✅ Resume data successfully migrated (if any)
- ✅ SEO rankings maintained

### User Experience
- ✅ Onboarding completion rate > 50%
- ✅ Resume save rate > 30%
- ✅ PDF export success rate > 98%
- ✅ No critical bugs reported in first week
- ✅ Mobile usability improved (based on analytics)

---

## Rollback Plan

If critical issues arise:

1. **Revert DNS**: Point `securecv.co.in` back to Vercel
2. **Restore codebase**: Git checkout previous working commit
3. **Redeploy to Vercel**: `vercel --prod`
4. **Notify users**: Email if auth issues occurred
5. **Post-mortem**: Document what went wrong

**Keep Vercel deployment active for 2 weeks** after Spaceship migration as safety net.

---

## Next Steps

1. ✅ Review this plan
2. ⬜ Set up Supabase project
3. ⬜ Configure OAuth providers
4. ⬜ Create database schema
5. ⬜ Begin Phase 1 implementation

**Questions? Contact:** [Your email/Slack]

**Last Updated:** February 8, 2026
