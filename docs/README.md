# SecureCV - Privacy-First Resume Builder

![SecureCV Hero](https://raw.githubusercontent.com/SevaVerse/creative.resumes/develop/public/og-image.png)

A fast, privacy-first resume builder with professional templates, AI-powered writing assistance, and a focus on user data protection. Build a polished, ATS-friendly resume in minutes, for free.

**[Live Demo](https://securecv.co.in)**

---

## ☕ Support This Project

If this tool helps you, please consider supporting its development. Your contribution keeps the servers running and ensures the project remains free and open-source for everyone.

<a href="https://www.buymeacoffee.com/sevaverse" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

---

## ✨ Core Features

* **Privacy-First by Design:** No user tracking, ads, or data selling. PDF generation is handled securely.
* **Four Professional Templates:** Choose from Minimalist, Onyx, AwesomeCV, and Subtle & Elegant designs.
* **AI-Powered Rewrites:** Enhance your resume summary, experience, and project descriptions with integrated AI assistance from Groq.
* **OAuth Authentication:** Secure sign-in with Google or GitHub accounts.
* **Secure PDF Export:** Download a print-ready, optimized PDF of your resume instantly.
* **Resume Persistence:** Save and load your resumes with automatic cloud backup.
* **Gamified Resume Score:** Get instant feedback on your resume's quality to improve your chances with recruiters.
* **Eco-Friendly Carbon Score:** Each template includes a "Carbon Score" to promote environmentally conscious choices.
* **Resume Upload & Parsing:** Upload existing resumes (PDF/DOCX) and automatically extract structured data.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router) & React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **AI:** Groq API (via Supabase Edge Functions)
* **Authentication:** Supabase OAuth (Google, GitHub)
* **Database:** Supabase PostgreSQL with Row-Level Security
* **PDF Generation:** Puppeteer / @sparticuz/chromium (Vercel Functions)
* **Hosting:** Spaceship (static) + Vercel (serverless APIs) + Supabase (Edge Functions)
* **CDN:** Cloudflare
* **Domain:** securecv.co.in

---

## 🚀 Getting Started

Follow these instructions to set up the project for local development.

### Prerequisites

* Node.js (v18.x or later)
* npm or yarn
* Supabase account
* Groq API key

### 1. Clone the Repository

```bash
git clone https://github.com/SevaVerse/securecv.git
cd securecv
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name like `securecv-prod`
3. Select region closest to your users

#### Configure OAuth Providers

**Google OAuth:**
1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Create OAuth 2.0 Client ID with redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

**GitHub OAuth:**
1. In Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
3. Create new OAuth App with callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to Supabase

#### Set Up Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Run the schema from `supabase-schema.sql`:

```sql
-- Create resumes table
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies (privacy-preserving)
CREATE POLICY "Users can insert analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can read analytics" ON analytics
  FOR SELECT USING (auth.role() = 'service_role');
```

### 4. Set Up Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (Groq)
GROQ_API_KEY=your-groq-api-key

# Optional: Override app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GROQ_API_KEY=your-groq-api-key
supabase secrets set SERVICE_ROLE_KEY=your-service-role-key

# Deploy functions
supabase functions deploy
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
securecv/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # Vercel API routes
│   │   ├── auth/           # OAuth callback
│   │   ├── blog/           # MDX blog posts
│   │   └── components/     # React components
│   ├── utils/              # Utilities (Supabase, baseUrl, etc.)
│   └── types/              # TypeScript definitions
├── supabase/
│   └── functions/          # Edge Functions
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push and create a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🆘 Support

- **Documentation:** Check the `docs/` directory
- **Issues:** [GitHub Issues](https://github.com/SevaVerse/securecv/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SevaVerse/securecv/discussions)

---

## 📊 Architecture Overview

SecureCV uses a modern JAMstack architecture:

- **Frontend:** Static Next.js app hosted on Spaceship
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **APIs:** Vercel Functions for compute-intensive tasks (PDF generation)
- **CDN:** Cloudflare for global distribution and security

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.</content>
<parameter name="filePath">c:\workspace\os\v1\resume_v4\docs\README.md