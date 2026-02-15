'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

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

interface ResumeUploaderProps {
  onResumeImported: (resume: ParsedResume) => void
}

export default function ResumeUploader({ onResumeImported }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null)
  const supabase = createClient()

  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF or DOCX file'
    }
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }
    
    return null
  }

  const handleFileChange = (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }
    
    setFile(selectedFile)
    setError(null)
    setParsedData(null)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }, [])

  const handleParseResume = async () => {
    if (!file) return
    
    setError(null)
    setIsParsing(true)
    
    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to parse resumes')
      }

      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove data URL prefix
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
      })
      
      reader.readAsDataURL(file)
      const base64Content = await base64Promise

      // Call Edge Function via Supabase client (handles auth automatically)
      const { data: result, error: fnError } = await supabase.functions.invoke('parse-resume', {
        body: {
          fileContent: base64Content,
          fileName: file.name,
          contentType: file.type,
        },
      })

      if (fnError) {
        throw new Error(fnError.message || 'Failed to parse resume')
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to parse resume')
      }

      setParsedData(result.data)
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse resume')
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    if (parsedData) {
      onResumeImported(parsedData)
      setFile(null)
      setParsedData(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-file"
          accept=".pdf,.docx"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0]
            if (selectedFile) handleFileChange(selectedFile)
          }}
          className="hidden"
        />
        
        {!file ? (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label
                htmlFor="resume-file"
                className="cursor-pointer text-blue-600 hover:text-blue-500"
              >
                <span className="font-medium">Upload a resume</span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">PDF or DOCX up to 10MB</p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="h-8 w-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null)
                setParsedData(null)
              }}
              className="text-sm text-red-600 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Parse Button */}
      {file && !parsedData && (
        <button
          onClick={handleParseResume}
          disabled={isParsing}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isParsing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Parsing Resume...
            </span>
          ) : (
            'Parse Resume with AI'
          )}
        </button>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Parsed Resume Data
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Successfully Parsed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Name</p>
              <p className="text-gray-900">{parsedData.name || 'Not found'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{parsedData.email || 'Not found'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Phone</p>
              <p className="text-gray-900">{parsedData.phone || 'Not found'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Experience</p>
              <p className="text-gray-900">
                {parsedData.experiences?.length || 0} positions
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Skills</p>
              <p className="text-gray-900">
                {parsedData.skills?.length || 0} skills
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Summary</p>
              <p className="text-gray-900 line-clamp-2">
                {parsedData.summary
                  ? parsedData.summary.substring(0, 50) + '...'
                  : 'Not found'}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleImport}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Import to Resume Builder
            </button>
            <button
              onClick={() => {
                setFile(null)
                setParsedData(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
