// जय श्री राम - Blessed Edge Function for resume parsing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @deno-types="npm:@types/pdfjs-dist"
import * as pdfjsLib from 'npm:pdfjs-dist@4.0.379'
import mammoth from 'npm:mammoth@1.6.0'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParseRequest {
  fileUrl?: string
  fileName?: string
  fileContent?: string
  contentType?: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

interface ParsedResume {
  name: string
  email: string
  phone: string
  website?: string
  linkedin?: string
  summary: string
  experiences: Array<{
    company: string
    title: string
    startDate: string
    endDate?: string
    current?: boolean
    details: string
  }>
  education: string
  skills: Array<{ name: string; level: number }>
  certifications?: string
  projects?: string
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
    const body: ParseRequest = await req.json()
    
    let extractedText = ''

    // Step 1: Extract text from document
    if (body.fileContent) {
      // Base64 encoded file content
      const fileBuffer = Uint8Array.from(atob(body.fileContent), c => c.charCodeAt(0))
      
      if (body.contentType === 'application/pdf') {
        // TODO: Implement PDF text extraction
        // For now, we'll use a placeholder
        extractedText = await extractTextFromPDF(fileBuffer)
      } else if (body.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // TODO: Implement DOCX text extraction
        extractedText = await extractTextFromDOCX(fileBuffer)
      } else {
        throw new Error('Unsupported file type')
      }
    } else if (body.fileUrl) {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('resume-uploads')
        .download(body.fileName || '')

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`)
      }

      const fileBuffer = await fileData.arrayBuffer()
      
      if (body.contentType === 'application/pdf') {
        extractedText = await extractTextFromPDF(new Uint8Array(fileBuffer))
      } else {
        extractedText = await extractTextFromDOCX(new Uint8Array(fileBuffer))
      }
    } else {
      throw new Error('No file provided')
    }

    // Step 2: Use Groq LLM to structure the data
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    const structuredData = await structureResumeData(extractedText, groqApiKey)

    // Step 3: Return structured data
    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        rawText: extractedText.substring(0, 500), // First 500 chars for verification
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Parse resume error:', error)
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

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer: Uint8Array): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    
    let fullText = ''
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: { str?: string }) => item.str || '')
        .join(' ')
      fullText += pageText + '\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to extract text from DOCX
async function extractTextFromDOCX(buffer: Uint8Array): Promise<string> {
  try {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    )
    
    const result = await mammoth.extractRawText({ arrayBuffer })
    
    if (!result.value) {
      throw new Error('No text extracted from DOCX file')
    }
    
    return result.value.trim()
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to structure resume data using Groq LLM
async function structureResumeData(text: string, apiKey: string): Promise<ParsedResume> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('GROQ_MODEL') || 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume parser. Extract structured data from resume text and return ONLY valid JSON with these exact fields:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "website": "string (optional)",
  "linkedin": "string (optional)",
  "summary": "string",
  "experiences": [{"company": "string", "title": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "current": boolean, "details": "string"}],
  "education": "string",
  "skills": [{"name": "string", "level": number 1-100}],
  "certifications": "string (optional)",
  "projects": "string (optional)"
}

Extract skills with estimated proficiency levels (1-100). If information is missing, use empty strings or empty arrays. Do not include any text outside the JSON.`,
        },
        {
          role: 'user',
          content: `Parse this resume:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content?.trim()
  
  if (!content) {
    throw new Error('No content returned from LLM')
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(content)
    return parsed as ParsedResume
  } catch (e) {
    console.error('Failed to parse LLM response:', content)
    throw new Error('Failed to parse resume data from LLM response')
  }
}
