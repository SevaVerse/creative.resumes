// Browser-side helpers for the /api/resumes endpoints (session cookie auth).
import type { Resume, ResumeUpdate } from '@/types/database'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string } & T
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
  return body
}

export async function saveResume(
  name: string,
  template: string,
  data: Record<string, unknown>
): Promise<Resume> {
  const { resume } = await request<{ resume: Resume }>('/api/resumes/', {
    method: 'POST',
    body: JSON.stringify({ name, template, data }),
  })
  return resume
}

export async function updateResume(resumeId: string, updates: ResumeUpdate): Promise<Resume> {
  const { resume } = await request<{ resume: Resume }>(`/api/resumes/${encodeURIComponent(resumeId)}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return resume
}

export async function loadResume(resumeId: string): Promise<Resume> {
  const { resume } = await request<{ resume: Resume }>(`/api/resumes/${encodeURIComponent(resumeId)}/`)
  return resume
}

export async function listResumes(): Promise<Resume[]> {
  const { resumes } = await request<{ resumes: Resume[] }>('/api/resumes/')
  return resumes
}

export async function deleteResume(resumeId: string): Promise<void> {
  await request<{ ok: true }>(`/api/resumes/${encodeURIComponent(resumeId)}/`, { method: 'DELETE' })
}

// Debounced autosave implementation
let autosaveTimeout: ReturnType<typeof setTimeout> | null = null

export function scheduleAutoSave(
  resumeId: string,
  data: Record<string, unknown>,
  onSave: () => void,
  delay: number = 30000
): void {
  if (autosaveTimeout) clearTimeout(autosaveTimeout)
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
