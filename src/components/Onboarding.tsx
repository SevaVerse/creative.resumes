'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'

export function Onboarding() {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding && user) {
      // Delay showing for a moment to avoid flash on page load
      const timer = setTimeout(() => setShow(true), 500)
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShow(false)
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    {
      title: 'Welcome to SecureCV! 👋',
      description: 'Create beautiful, privacy-first resumes in minutes. Your data never leaves your control.',
      icon: '🎉',
    },
    {
      title: 'Choose Your Template 🎨',
      description: 'Pick from 4 professionally designed templates. Switch anytime without losing your progress!',
      icon: '📄',
    },
    {
      title: 'AI-Powered Writing ✨',
      description: 'Use AI to improve your descriptions and highlight achievements. Make every word count.',
      icon: '🤖',
    },
    {
      title: 'Autosave & Export 💾',
      description: 'Your work is automatically saved to your account. Export to PDF whenever you\'re ready.',
      icon: '📥',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full animate-fade-in">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>
          <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">{steps[step].icon}</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {steps[step].title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {steps[step].description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === steps.length - 1) {
                  handleComplete()
                } else {
                  setStep(step + 1)
                }
              }}
              className="px-8 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              {step === steps.length - 1 ? "Let's Start! 🚀" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
