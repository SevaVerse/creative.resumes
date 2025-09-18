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
  stats?: {
    originalLength: number
    rewrittenLength: number
    savedChars: number
    estimatedTokens: number
  }
  error?: string
}

export function AIRewriter({ text, type, onRewrite, className = '', disabled = false }: AIRewriterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string>('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [stats, setStats] = useState<RewriteResponse['stats'] | null>(null)
  const [error, setError] = useState<string>('')

  const handleRewrite = async () => {
    if (!text?.trim() || isLoading || disabled) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), type })
      })
      
      const data: RewriteResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }
      
      if (data.success && data.rewritten) {
        setSuggestion(data.rewritten)
        setStats(data.stats || null)
        setShowSuggestion(true)
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
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-purple-600 dark:text-purple-400">✨</span>
            <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">AI Suggestion</span>
          </div>
          {stats && (
            <span className="text-xs text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
              {stats.savedChars > 0 ? `-${stats.savedChars}` : `+${Math.abs(stats.savedChars)}`} chars
            </span>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed bg-white/70 dark:bg-black/20 p-3 rounded border border-purple-100 dark:border-purple-800/50">
            {suggestion}
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
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

  // Main rewrite button
  return (
    <button
      onClick={handleRewrite}
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
        ${className}
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
  )
}