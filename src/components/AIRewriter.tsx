'use client'

import { useState } from 'react'

export interface AIRewriterProps {
  text: string
  type: 'job_summary' | 'experience' | 'skill_description' | 'summary' | 'projects'
  onRewrite: (rewrittenText: string) => void
  className?: string
  disabled?: boolean
}

interface RewriteResponse {
  success: boolean
  original: string
  rewritten: string
  type: string
  tone?: string
  action?: string
  stats?: {
    originalLength: number
    rewrittenLength: number
    savedChars: number
    estimatedTokens: number
  }
  error?: string
}

type Tone = 'professional' | 'casual' | 'technical'
type Action = 'improve' | 'expand' | 'condense' | 'achievements'

export function AIRewriter({ text, type, onRewrite, className = '', disabled = false }: AIRewriterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string>('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [stats, setStats] = useState<RewriteResponse['stats'] | null>(null)
  const [error, setError] = useState<string>('')
  const [tone, setTone] = useState<Tone>('professional')
  const [action, setAction] = useState<Action>('improve')
  const [showOptions, setShowOptions] = useState(false)

  const copyToClipboard = async () => {
    if (!suggestion) return
    try {
      await navigator.clipboard.writeText(suggestion)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRewrite = async (forceVercel = false) => {
    if (!text?.trim() || isLoading || disabled) return
    
    setIsLoading(true)
    setError('')
    
    try {
      // Get Supabase session token if available
      let authToken: string | undefined;
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token;
      } catch {
        // Ignore auth errors, let API handle it
      }

      // Try Edge Function first (90% cost savings) unless forced to use Vercel
      const useEdgeFunction = !forceVercel && process.env.NEXT_PUBLIC_SUPABASE_URL && authToken;
      const endpoint = useEdgeFunction
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-rewrite`
        : '/api/rewrite';
      
      console.log(`Using ${useEdgeFunction ? 'Edge Function' : 'Vercel'} for AI rewrite`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ 
          text: text.trim(), 
          type,
          tone,
          action
        })
      })
      
      const data: RewriteResponse = await response.json()
      
      if (!response.ok) {
        // If Edge Function fails with server error and we haven't tried Vercel yet, fallback
        if (useEdgeFunction && response.status >= 500) {
          console.warn('Edge Function failed, falling back to Vercel endpoint');
          return handleRewrite(true); // Retry with Vercel
        }
        throw new Error(data.error || `HTTP ${response.status}`)
      }
      
      if (data.success && data.rewritten) {
        setSuggestion(data.rewritten)
        setStats(data.stats || null)
        setShowSuggestion(true)
        setShowOptions(false)
      } else {
        throw new Error(data.error || 'No rewritten text received')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rewrite text'
      console.error('Rewrite failed:', errorMessage)
      setError(errorMessage)
      
      // Show error for a few seconds then hide it
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptSuggestion = () => {
    if (suggestion) {
      onRewrite(suggestion)
      setShowSuggestion(false)
      setSuggestion('')
      setStats(null)
    }
  }

  const rejectSuggestion = () => {
    setShowSuggestion(false)
    setSuggestion('')
    setStats(null)
  }

  // Show error state
  if (error) {
    return (
      <div className={`text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-2 py-1 ${className}`}>
        ⚠️ {error}
      </div>
    )
  }

  // Show suggestion state
  if (showSuggestion) {
    return (
      <div className={`border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 ${className}`}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-purple-600 dark:text-purple-400">✨</span>
            <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">AI Suggestion</span>
          </div>
          {stats && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                {stats.originalLength} → {stats.rewrittenLength} chars
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                {stats.savedChars > 0 ? `-${stats.savedChars}` : `+${Math.abs(stats.savedChars)}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed bg-white/70 dark:bg-black/20 p-3 rounded border border-purple-100 dark:border-purple-800/50">
            {suggestion}
          </p>
        </div>
        
        <div className="flex gap-2 justify-end flex-wrap">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
          <button
            onClick={rejectSuggestion}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition-colors"
          >
            <span className="text-xs">✕</span>
            Reject
          </button>
          <button
            onClick={acceptSuggestion}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors shadow-sm"
          >
            <span className="text-xs">✓</span>
            Accept
          </button>
        </div>
      </div>
    )
  }

  // Main rewrite button with options
  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleRewrite()}
          disabled={isLoading || !text?.trim() || disabled}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 text-sm 
            bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200
            dark:from-purple-900/30 dark:to-blue-900/30 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50
            text-purple-700 dark:text-purple-300 
            border border-purple-200 dark:border-purple-700
            rounded-lg transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 hover:shadow-sm
          `}
          title={`Rewrite this ${type.replace('_', ' ')} using AI`}
        >
          {isLoading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs">Rewriting...</span>
            </>
          ) : (
            <>
              <span className="text-sm">✨</span>
              <span className="text-xs font-medium">AI Rewrite</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-2 py-1.5 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
          title="Show options"
        >
          ⚙️
        </button>
      </div>

      {showOptions && (
        <div className="flex gap-2 flex-wrap items-center p-2 bg-gray-50 dark:bg-neutral-900/50 rounded border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Tone:</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Action:</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as Action)}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
            >
              <option value="improve">Improve</option>
              <option value="expand">Expand</option>
              <option value="condense">Condense</option>
              <option value="achievements">Suggest Achievements</option>
            </select>
          </div>
        </div>
      )}
      
      {text && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {text.length} characters
        </span>
      )}
    </div>
  )
}