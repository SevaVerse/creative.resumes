'use client'

import { useEffect, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  status: SaveStatus
  lastSaved?: Date
  resumeName?: string
}

export function AutosaveIndicator({ status, lastSaved, resumeName }: Props) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      
      if (seconds < 10) {
        setTimeAgo('just now')
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      } else if (seconds < 86400) {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 86400)}d ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [lastSaved])

  if (status === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <div className="relative">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-gray-600">Saving{resumeName ? ` "${resumeName}"` : ''}...</span>
        </>
      )}
      {status === 'saved' && lastSaved && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-gray-600">
            Saved {timeAgo}
            {resumeName && <span className="text-gray-400 ml-1">• {resumeName}</span>}
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-white rounded-full" />
          </div>
          <span className="text-red-600">Failed to save</span>
        </>
      )}
    </div>
  )
}
