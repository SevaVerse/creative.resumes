'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { saveResume, updateResume } from '@/lib/db/resumes'
import { trackResumeSave } from '@/lib/analytics'

interface Props {
  currentResumeId?: string
  currentResumeName?: string
  template: string
  data: Record<string, unknown>
  onSaveSuccess: (resumeId: string, name: string) => void
}

export function ResumeSaveButton({ 
  currentResumeId, 
  currentResumeName,
  template, 
  data, 
  onSaveSuccess 
}: Props) {
  const { user } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [resumeName, setResumeName] = useState(currentResumeName || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  const handleSave = async () => {
    if (!resumeName.trim()) {
      setError('Please enter a resume name')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      if (currentResumeId) {
        // Update existing resume
        await updateResume(currentResumeId, { 
          name: resumeName.trim(), 
          template: template as 'minimalist' | 'onyx' | 'awesomecv' | 'subtleelegant', 
          data 
        })
        await trackResumeSave(currentResumeId, false)
        onSaveSuccess(currentResumeId, resumeName.trim())
      } else {
        // Create new resume
        const resume = await saveResume(user.id, resumeName.trim(), template, data)
        await trackResumeSave(resume.id, true)
        onSaveSuccess(resume.id, resume.name)
      }
      setShowDialog(false)
      setResumeName('')
    } catch (error) {
      console.error('Failed to save resume:', error)
      setError('Failed to save resume. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDialog = () => {
    setResumeName(currentResumeName || '')
    setError(null)
    setShowDialog(true)
  }

  return (
    <>
      <button
        data-save-button
        onClick={handleOpenDialog}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        title={currentResumeId ? 'Save changes (Ctrl+S)' : 'Save resume (Ctrl+S)'}
      >
        {currentResumeId ? '💾 Save' : '💾 Save Resume'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {currentResumeId ? 'Update Resume' : 'Save Resume'}
            </h2>
            <div className="mb-4">
              <label htmlFor="resume-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume Name
              </label>
              <input
                id="resume-name"
                type="text"
                placeholder="e.g., Software Engineer - Google"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !saving && handleSave()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={saving}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={saving || !resumeName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
