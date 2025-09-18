import Groq from 'groq-sdk';
import { logger } from '@/utils/logger';

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

// Define supported text rewrite types for resume content
export type RewriteType = 'job_summary' | 'experience' | 'skill_description' | 'summary' | 'projects';

// Resume-specific prompts for different content types
const REWRITE_PROMPTS: Record<RewriteType, string> = {
  job_summary: `Rewrite this job summary to be concise, impactful, and ATS-friendly. Focus on key achievements and quantifiable results. Keep it under 50 words and use strong action verbs:`,
  
  experience: `Rewrite this work experience description to be concise and achievement-focused. Use strong action verbs, quantify results where possible, and highlight impact. Keep under 80 words:`,
  
  skill_description: `Make this skill description more concise and professional. Focus on practical application and expertise level. Keep under 30 words:`,
  
  summary: `Rewrite this professional summary to be compelling and concise. Highlight key strengths, value proposition, and career focus. Keep under 100 words:`,
  
  projects: `Rewrite this project description to be concise and highlight technical skills, impact, and results. Use action verbs and quantify outcomes where possible. Keep under 60 words:`
};

/**
 * Rewrite text using Groq's Llama model with resume-specific prompts
 * @param text - The original text to rewrite
 * @param type - The type of content being rewritten
 * @returns Promise<string> - The rewritten text
 */
export async function rewriteText(text: string, type: RewriteType): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  if (!text?.trim()) {
    throw new Error('Text cannot be empty');
  }

  // Log the rewrite attempt
  logger.info('groq.rewrite.start', { 
    type, 
    originalLength: text.length,
    originalPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
  });

  try {
    const prompt = REWRITE_PROMPTS[type];
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. You help job seekers create compelling, ATS-friendly resume content that highlights achievements and value proposition. Always respond with only the rewritten text, no additional commentary.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nOriginal text: "${text}"`
        }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 200,
      top_p: 0.9
    });

    const rewrittenText = response.choices[0]?.message?.content?.trim();
    
    if (!rewrittenText) {
      throw new Error('No rewritten text returned from API');
    }

    // Log successful rewrite
    logger.info('groq.rewrite.success', {
      type,
      originalLength: text.length,
      rewrittenLength: rewrittenText.length,
      savedChars: text.length - rewrittenText.length,
      rewrittenPreview: rewrittenText.substring(0, 50) + (rewrittenText.length > 50 ? '...' : '')
    });

    return rewrittenText;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('groq.rewrite.error', {
      type,
      originalLength: text.length,
      error: errorMessage
    });

    throw new Error(`Failed to rewrite text: ${errorMessage}`);
  }
}

/**
 * Check if AI rewriting is enabled via environment variables
 */
export function isAIRewriterEnabled(): boolean {
  return !!(
    process.env.GROQ_API_KEY && 
    process.env.ENABLE_AI_REWRITER !== 'false'
  );
}

/**
 * Estimate token usage for cost tracking (approximate)
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}