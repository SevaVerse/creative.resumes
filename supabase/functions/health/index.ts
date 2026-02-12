// Health check endpoint for monitoring

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'supabase-edge-functions',
      version: '1.0.0',
      checks: {
        groq_api: !!Deno.env.get('GROQ_API_KEY'),
        supabase_url: !!Deno.env.get('SUPABASE_URL'),
        supabase_key: !!Deno.env.get('SERVICE_ROLE_KEY'),
      }
    }

    return new Response(
      JSON.stringify(health),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
