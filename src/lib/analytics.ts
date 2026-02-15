import { createClient } from '@/utils/supabase/client'
import type { AnalyticsInsert } from '@/types/database'

export async function trackEvent(
  eventType: AnalyticsInsert['event_type'],
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('analytics').insert({
      user_id: user?.id || null,
      event_type: eventType,
      metadata: metadata || null,
    })
  } catch (error) {
    // Silently fail analytics - don't block user experience
    console.debug('Analytics tracking failed:', error)
  }
}

export async function trackPageView(): Promise<void> {
  if (typeof window === 'undefined') return
  
  await trackEvent('page_view', {
    path: window.location.pathname,
    referrer: document.referrer || null,
    timestamp: new Date().toISOString(),
  })
}

export async function trackDownload(template: string, resumeId?: string): Promise<void> {
  await trackEvent('resume_download', {
    template,
    resume_id: resumeId || null,
    timestamp: new Date().toISOString(),
  })
}

export async function trackAIRewrite(fieldType: string, tone?: string): Promise<void> {
  await trackEvent('ai_rewrite', {
    field_type: fieldType,
    tone: tone || 'default',
    timestamp: new Date().toISOString(),
  })
}

export async function trackTemplateChange(from: string, to: string): Promise<void> {
  await trackEvent('template_change', {
    from_template: from,
    to_template: to,
    timestamp: new Date().toISOString(),
  })
}

export async function trackResumeSave(resumeId: string, isNew: boolean): Promise<void> {
  await trackEvent('resume_save', {
    resume_id: resumeId,
    is_new: isNew,
    timestamp: new Date().toISOString(),
  })
}

export async function trackResumeLoad(resumeId: string): Promise<void> {
  await trackEvent('resume_load', {
    resume_id: resumeId,
    timestamp: new Date().toISOString(),
  })
}
