'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { listResumes, deleteResume } from '@/lib/db/resumes'
import { trackResumeLoad } from '@/lib/analytics'
import type { Resume } from '@/types/database'

interface Props {
  onLoadResume: (resume: Resume) => void
  currentResumeId?: string
}

export function ResumeLoader({ onLoadResume, currentResumeId }: Props) {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadResumesData = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const data = await listResumes(user.id)
        setResumes(data)
      } catch (error) {
        console.error('Failed to load resumes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && showDialog) {
      loadResumesData()
    }
  }, [user, showDialog])

  const handleLoad = async (resume: Resume) => {
    await trackResumeLoad(resume.id)
    onLoadResume(resume)
    setShowDialog(false)
  }

  const handleDelete = async (e: React.MouseEvent, resumeId: string) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    setDeletingId(resumeId)
    try {
      await deleteResume(resumeId)
      setResumes(resumes.filter(r => r.id !== resumeId))
    } catch (error) {
      console.error('Failed to delete resume:', error)
      alert('Failed to delete resume. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        📂 Load Resume
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-lg w-full max-h-[70vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Resumes</h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 min-h-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-500 dark:text-gray-400">No saved resumes yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Create and save your first resume!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`relative group border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer ${
                      resume.id === currentResumeId ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-neutral-700'
                    }`}
                    onClick={() => handleLoad(resume)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {resume.name}
                          {resume.id === currentResumeId && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">(Current)</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{resume.template.replace('-', ' ')}</span>
                          <span>•</span>
                          <span>Edited {new Date(resume.last_edited_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, resume.id)}
                        disabled={deletingId === resume.id}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Delete resume"
                        title="Delete resume"
                      >
                        {deletingId === resume.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
