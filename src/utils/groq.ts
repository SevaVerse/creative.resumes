import Groq from 'groq-sdk';
import { logger } from '@/utils/logger';

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

// Define supported text rewrite types for resume content
export type RewriteType = 'job_summary' | 'experience' | 'skill_description' | 'summary' | 'projects';
export type Tone = 'professional' | 'casual' | 'technical';
export type Action = 'improve' | 'expand' | 'condense' | 'achievements';

// Tone modifiers
const TONE_MODIFIERS: Record<Tone, string> = {
  professional: 'Use formal, corporate language with industry-standard terminology.',
  casual: 'Use conversational, friendly language while maintaining professionalism.',
  technical: 'Use precise technical terminology and emphasize technical skills and methodologies.'
};

// Action-specific instructions
const ACTION_INSTRUCTIONS: Record<Action, string> = {
  improve: 'Enhance clarity, impact, and professionalism. Use strong action verbs and quantify results.',
  expand: 'Add more detail and context. Elaborate on achievements, responsibilities, and technologies used. Aim for 50% more content.',
  condense: 'Make it more concise and punchy. Remove redundancy and focus on key points. Aim for 30% shorter.',
  achievements: 'Transform this into achievement-focused bullet points. Emphasize quantifiable results, impact, and value delivered. Start each point with a strong action verb.'
};

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
 * @param tone - The tone to use (professional, casual, technical)
 * @param action - The action to perform (improve, expand, condense, achievements)
 * @returns Promise<string> - The rewritten text
 */
export async function rewriteText(
  text: string, 
  type: RewriteType,
  tone: Tone = 'professional',
  action: Action = 'improve'
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  if (!text?.trim()) {
    throw new Error('Text cannot be empty');
  }

  // Log the rewrite attempt
  logger.info('groq.rewrite.start', { 
    type, 
    tone,
    action,
    originalLength: text.length,
    originalPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
  });

  try {
    const basePrompt = REWRITE_PROMPTS[type];
    const toneModifier = TONE_MODIFIERS[tone];
    const actionInstruction = ACTION_INSTRUCTIONS[action];
    
    const fullPrompt = `${basePrompt}\n\nTone: ${toneModifier}\n\nAction: ${actionInstruction}\n\nOriginal text: "${text}"`;
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career coach. You help job seekers create compelling, ATS-friendly resume content that highlights achievements and value proposition. Always respond with only the rewritten text, no additional commentary.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      temperature: action === 'achievements' ? 0.8 : 0.7,
      max_tokens: action === 'expand' ? 300 : action === 'condense' ? 150 : 200,
      top_p: 0.9
    });

    const rewrittenText = response.choices[0]?.message?.content?.trim();
    
    if (!rewrittenText) {
      throw new Error('No rewritten text returned from API');
    }

    // Log successful rewrite
    logger.info('groq.rewrite.success', {
      type,
      tone,
      action,
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
      tone,
      action,
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