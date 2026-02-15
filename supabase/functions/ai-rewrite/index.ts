// जय श्री राम - Blessed Edge Function for AI rewriting

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RewriteType = 'job_summary' | 'experience' | 'skill_description' | 'summary' | 'projects'
type Tone = 'professional' | 'casual' | 'technical'
type Action = 'improve' | 'expand' | 'condense' | 'achievements'

interface RewriteRequest {
  text: string
  type: RewriteType
  tone?: Tone
  action?: Action
}

// Tone modifiers
const TONE_MODIFIERS: Record<Tone, string> = {
  professional: 'Use formal, corporate language with industry-standard terminology.',
  casual: 'Use conversational, friendly language while maintaining professionalism.',
  technical: 'Use precise technical terminology and emphasize technical skills and methodologies.'
}

// Action-specific instructions
const ACTION_INSTRUCTIONS: Record<Action, string> = {
  improve: 'Enhance clarity, impact, and professionalism. Use strong action verbs and quantify results.',
  expand: 'Add more detail and context. Elaborate on achievements, responsibilities, and technologies used. Aim for 50% more content.',
  condense: 'Make it more concise and punchy. Remove redundancy and focus on key points. Aim for 30% shorter.',
  achievements: 'Transform this into achievement-focused bullet points. Emphasize quantifiable results, impact, and value delivered. Start each point with a strong action verb.'
}

// Resume-specific prompts
const REWRITE_PROMPTS: Record<RewriteType, string> = {
  job_summary: 'Rewrite this job summary to be concise, impactful, and ATS-friendly. Focus on key achievements and quantifiable results. Keep it under 50 words and use strong action verbs:',
  experience: 'Rewrite this work experience description to be concise and achievement-focused. Use strong action verbs, quantify results where possible, and highlight impact. Keep under 80 words:',
  skill_description: 'Make this skill description more concise and professional. Focus on practical application and expertise level. Keep under 30 words:',
  summary: 'Rewrite this professional summary to be compelling and concise. Highlight key strengths, value proposition, and career focus. Keep under 100 words:',
  projects: 'Rewrite this project description to be concise and highlight technical skills, impact, and results. Use action verbs and quantify outcomes where possible. Keep under 60 words:'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: RewriteRequest = await req.json()
    const { text, type, tone = 'professional', action = 'improve' } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (text.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Text is too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Text is too short (minimum 10 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Groq API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    // Build prompt
    const basePrompt = REWRITE_PROMPTS[type]
    const toneModifier = TONE_MODIFIERS[tone]
    const actionInstruction = ACTION_INSTRUCTIONS[action]
    const fullPrompt = `${basePrompt}\n\nTone: ${toneModifier}\n\nAction: ${actionInstruction}\n\nOriginal text: "${text}"`

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('GROQ_MODEL') || 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and career coach. You help job seekers create compelling, ATS-friendly resume content that highlights achievements and value proposition. Always respond with only the rewritten text, no additional commentary.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: action === 'achievements' ? 0.8 : 0.7,
        max_tokens: action === 'expand' ? 300 : action === 'condense' ? 150 : 200,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const result = await response.json()
    const rewrittenText = result.choices[0]?.message?.content?.trim()

    if (!rewrittenText) {
      throw new Error('No rewritten text returned from API')
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        original: text,
        rewritten: rewrittenText,
        type,
        tone,
        action,
        stats: {
          originalLength: text.length,
          rewrittenLength: rewrittenText.length,
          savedChars: text.length - rewrittenText.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI rewrite error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
