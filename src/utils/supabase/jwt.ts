/**
 * JWT verification utilities for Supabase authentication
 * Used by API routes to verify incoming requests
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function verifySupabaseAuth(request: NextRequest): Promise<{ 
  authenticated: boolean
  userId?: string 
  error?: string 
}> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      return { authenticated: false, error: 'Supabase configuration missing' }
    }

    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors in middleware
            }
          },
        },
      }
    )

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { authenticated: false, error: error?.message || 'Invalid token' }
    }

    return { authenticated: true, userId: user.id }
  } catch (error) {
    return { 
      authenticated: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}

/**
 * Get CORS headers for API routes
 * Allows static app on Spaceship to call Vercel-hosted APIs
 */
export function getCorsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://securecv.co.in',
    'https://www.securecv.co.in',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean)

  const isAllowed = origin && allowedOrigins.some(allowed => 
    allowed === origin || allowed === '*'
  )

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}
