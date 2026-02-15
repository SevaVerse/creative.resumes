// Database types for Supabase tables
// Generated from schema

export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          template: 'minimalist' | 'onyx' | 'awesome-cv' | 'subtle-elegant'
          data: Record<string, unknown>
          last_edited_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template: 'minimalist' | 'onyx' | 'awesome-cv' | 'subtle-elegant'
          data: Record<string, unknown>
          last_edited_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template?: 'minimalist' | 'onyx' | 'awesome-cv' | 'subtle-elegant'
          data?: Record<string, unknown>
          last_edited_at?: string
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: 'page_view' | 'resume_download' | 'ai_rewrite' | 'template_change' | 'resume_upload' | 'resume_save' | 'resume_load'
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: 'page_view' | 'resume_download' | 'ai_rewrite' | 'template_change' | 'resume_upload' | 'resume_save' | 'resume_load'
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: 'page_view' | 'resume_download' | 'ai_rewrite' | 'template_change' | 'resume_upload' | 'resume_save' | 'resume_load'
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
      }
    }
  }
}

export type Resume = Database['public']['Tables']['resumes']['Row']
export type ResumeInsert = Database['public']['Tables']['resumes']['Insert']
export type ResumeUpdate = Database['public']['Tables']['resumes']['Update']
export type AnalyticsEvent = Database['public']['Tables']['analytics']['Row']
export type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert']
