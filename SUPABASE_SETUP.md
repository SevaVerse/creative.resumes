# SecureCV Supabase Setup Guide

## ✅ Phase 1 Complete: Core Setup

You've successfully installed:
- Supabase client libraries
- Authentication components (AuthProvider, LoginButton)
- Middleware integration
- Auth callback route

## 📋 Next Steps

### 1. Run Database Schema

Open your Supabase project dashboard:
1. Go to https://supabase.com/dashboard/project/hoveczdmawakanxvlpxp
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and click **Run**

This will create:
- `resumes` table (for saving user resumes)
- `analytics` table (privacy-preserving metrics)
- Row Level Security policies
- Indexes for performance

### 2. Configure OAuth Providers

#### Google OAuth:
1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable the provider
3. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `https://hoveczdmawakanxvlpxp.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth:
1. In Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Enable the provider
3. Go to GitHub Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers)
4. Click **New OAuth App**:
   - Homepage URL: `https://securecv.co.in` (or `http://localhost:3000` for dev)
   - Authorization callback URL: `https://hoveczdmawakanxvlpxp.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

#### Configure Site URL:
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add to **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://securecv.co.in/auth/callback` (for production)

### 3. Get Your API Keys

1. In Supabase Dashboard → **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://hoveczdmawakanxvlpxp.supabase.co`
   - **anon public key**: (starts with `eyJhbGc...`)
   - **service_role key**: (starts with `eyJhbGc...`) - Keep this secret!

### 4. Update Environment Variables

Edit `.env.local` and replace:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hoveczdmawakanxvlpxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Your anon key here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # Your service role key here
```

### 5. Test the Setup

```bash
# Start the development server
npm run dev

# Open browser to http://localhost:3000
# You should see:
# - "SecureCV" header with Google/GitHub login buttons
# - Click login → OAuth flow should work
# - After login, see your email in header with "Sign Out" button
```

## 🧪 Testing Checklist

- [ ] Database schema created (check Supabase Table Editor)
- [ ] Google OAuth configured and working
- [ ] GitHub OAuth configured and working
- [ ] Login redirects to `/auth/callback` then back to `/`
- [ ] User email shows in header after login
- [ ] Sign out works correctly
- [ ] Session persists on page reload

## 🔍 Troubleshooting

### "Invalid login credentials"
- Check OAuth provider configuration in Supabase
- Verify redirect URLs are correct
- Check browser console for errors

### "Cannot read properties of undefined"
- Verify environment variables are set correctly
- Restart dev server after changing `.env.local`

### OAuth popup closes immediately
- Check redirect URLs match exactly (http vs https)
- Verify OAuth app is active (Google/GitHub)

### Middleware errors
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- These MUST start with `NEXT_PUBLIC_` to be available in middleware

## 📚 What's Next?

After authentication is working:
- **Phase 3**: Resume persistence (save/load functionality)
- **Phase 4**: PDF service separation
- **Phase 7**: UX enhancements (onboarding, template preview)

See `restructuring-plan.md` for the full roadmap.

## 🆘 Need Help?

- Supabase Docs: https://supabase.com/docs
- OAuth Setup Guide: https://supabase.com/docs/guides/auth/social-login
- Contact: Check the restructuring plan for next steps

---

**Status**: ✅ Code ready, ⏳ Awaiting configuration
