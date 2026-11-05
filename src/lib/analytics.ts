// Privacy-preserving, first-party event counts (no third-party trackers).
import type { AnalyticsEventType } from '@/types/database'

export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch('/api/analytics/', {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, metadata: metadata || null }),
    })
  } catch (error) {
    // Silently fail analytics - don't block user experience
    console.debug('Analytics tracking failed:', error)
  }
}

export async function trackPageView(): Promise<void> {
  if (typeof window === 'undefined') return
  await trackEvent('page_view', { path: window.location.pathname })
}

export async function trackDownload(template: string, resumeId?: string): Promise<void> {
  await trackEvent('resume_download', { template, resume_id: resumeId || null })
}

export async function trackAIRewrite(fieldType: string, tone?: string): Promise<void> {
  await trackEvent('ai_rewrite', { field_type: fieldType, tone: tone || 'default' })
}

export async function trackTemplateChange(from: string, to: string): Promise<void> {
  await trackEvent('template_change', { from_template: from, to_template: to })
}

export async function trackResumeSave(resumeId: string, isNew: boolean): Promise<void> {
  await trackEvent('resume_save', { resume_id: resumeId, is_new: isNew })
}

export async function trackResumeLoad(resumeId: string): Promise<void> {
  await trackEvent('resume_load', { resume_id: resumeId })
}
