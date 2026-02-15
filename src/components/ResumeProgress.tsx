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
  const getBarColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getTextColor = () => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-grow bg-gray-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums whitespace-nowrap ${getTextColor()}`}>
        {completed}/{total}
      </span>
      {percentage === 100 && <span className="text-base">🎉</span>}
    </div>
  )
}
