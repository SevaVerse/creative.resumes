'use client'

interface ResumeProgressProps {
  formData: {
    name: string
    email: string
    phone: string
    summary: string
    experiences: Array<{ company: string; title: string; details: string }>
    education: string
    skills: Array<{ name: string; level: number }>
  }
}

export function ResumeProgress({ formData }: ResumeProgressProps) {
  // Calculate completion percentage
  const calculateProgress = (): { percentage: number; completed: number; total: number } => {
    let completed = 0
    const total = 7 // Total number of sections to check

    // Check each section
    if (formData.name?.trim()) completed++
    if (formData.email?.trim()) completed++
    if (formData.phone?.trim()) completed++
    if (formData.summary?.trim()) completed++
    if (formData.experiences.some(exp => exp.company || exp.title || exp.details)) completed++
    if (formData.education?.trim()) completed++
    if (formData.skills.length > 0 && formData.skills.some(skill => skill.name?.trim())) completed++

    const percentage = Math.round((completed / total) * 100)
    return { percentage, completed, total }
  }

  const { percentage, completed, total } = calculateProgress()

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-600'
    if (percentage >= 50) return 'bg-yellow-600'
    return 'bg-blue-600'
  }

  const getTextColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="sticky top-20 z-10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-neutral-800/50 p-4 shadow-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className={`text-2xl font-bold ${getTextColor()}`}>
              {percentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume Progress
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {completed} of {total} sections
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          {percentage === 100 && (
            <div className="flex-shrink-0 animate-bounce">
              <span className="text-2xl">🎉</span>
            </div>
          )}
        </div>

        {percentage < 100 && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {percentage < 30 && "Just getting started! Fill in your basic info."}
            {percentage >= 30 && percentage < 60 && "Good progress! Add your work experience."}
            {percentage >= 60 && percentage < 80 && "Almost there! Complete the remaining sections."}
            {percentage >= 80 && percentage < 100 && "Looking great! Just a few more details."}
          </div>
        )}
      </div>
    </div>
  )
}
