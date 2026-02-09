import { createClient } from '@/utils/supabase/client'
import type { Resume, ResumeUpdate } from '@/types/database'

export async function saveResume(
  userId: string,
  name: string,
  template: string,
  data: Record<string, unknown>
): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      name,
      template,
      data,
    })
    .select()
    .single()

  if (error) throw error
  return resume
}

export async function updateResume(
  resumeId: string,
  updates: Partial<ResumeUpdate>
): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', resumeId)
    .select()
    .single()

  if (error) throw error
  return resume
}

export async function loadResume(resumeId: string): Promise<Resume> {
  const supabase = createClient()
  
  const { data: resume, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single()

  if (error) throw error
  return resume
}

export async function listResumes(userId: string): Promise<Resume[]> {
  const supabase = createClient()
  
  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('last_edited_at', { ascending: false })

  if (error) throw error
  return resumes || []
}

export async function deleteResume(resumeId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)

  if (error) throw error
}

// Debounced autosave implementation
let autosaveTimeout: NodeJS.Timeout | null = null

export function scheduleAutoSave(
  resumeId: string,
  data: Record<string, unknown>,
  onSave: () => void,
  delay: number = 30000
): void {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout)
  }

  autosaveTimeout = setTimeout(async () => {
    try {
      await updateResume(resumeId, { data })
      onSave()
    } catch (error) {
      console.error('Autosave failed:', error)
    }
  }, delay)
}

export function cancelAutoSave(): void {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout)
    autosaveTimeout = null
  }
}
