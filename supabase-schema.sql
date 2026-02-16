-- SecureCV Database Schema
-- Run this in Supabase SQL Editor
-- Phase 1: Core Tables and Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Resumes Table
-- ========================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template TEXT NOT NULL CHECK (template IN ('minimalist', 'onyx', 'awesomecv', 'subtleelegant')),
  data JSONB NOT NULL,
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Analytics Table (Privacy-Preserving)
-- ========================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view', 
    'resume_download', 
    'ai_rewrite', 
    'template_change',
    'resume_upload', 
    'resume_save', 
    'resume_load'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_last_edited ON resumes(last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_created ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id) WHERE user_id IS NOT NULL;

-- ========================================
-- Trigger: Auto-update last_edited_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON resumes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;
DROP POLICY IF EXISTS "Service role can read analytics" ON analytics;

-- Resumes policies (users can only access their own)
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics policies (insert-only for users, read for service role)
CREATE POLICY "Users can insert own analytics"
  ON analytics FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Service role can read analytics"
  ON analytics FOR SELECT
  USING (
    auth.jwt() IS NULL OR 
    (auth.jwt()->>'role')::text = 'service_role'
  );

-- ========================================
-- Profiles Table (synced from auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can read all profiles (for admin/analytics)
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
CREATE POLICY "Service role can read all profiles"
  ON profiles FOR SELECT
  USING ((auth.jwt()->>'role')::text = 'service_role');

-- Auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Trigger: Auto-create profile on signup
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Trigger on auth.users update (e.g., email change, metadata update)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ========================================
-- Backfill: Populate profiles for existing users
-- ========================================
INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  COALESCE(raw_app_meta_data->>'provider', '')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  provider = EXCLUDED.provider,
  updated_at = NOW();

-- ========================================
-- Success Message
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: resumes, analytics, profiles';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Enable OAuth providers (Google, GitHub) in Supabase Auth';
  RAISE NOTICE '   2. Add your environment variables to .env.local';
  RAISE NOTICE '   3. Test authentication flow';
END $$;
