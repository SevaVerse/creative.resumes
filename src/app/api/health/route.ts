import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders } from '@/utils/cors'

// Health check endpoint for monitoring Vercel API routes

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'vercel-api-routes',
      version: '1.0.0',
      endpoints: {
        'export-pdf': true,
        'metrics': true,
        'pdf-data': true,
        'rewrite': true,
        'resumes': true,
        'parse-resume': true,
        'cron/jobs': true,
      },
      environment: {
        node_version: process.version,
        has_groq_key: !!process.env.GROQ_API_KEY,
        has_turso_url: !!process.env.TURSO_DATABASE_URL,
        has_auth_secret: !!process.env.AUTH_SECRET,
      }
    }

    return NextResponse.json(health, {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}
