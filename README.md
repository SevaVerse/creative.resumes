# Creative Resumes - A Privacy-First, AI-Powered Resume Builder

![Creative Resumes Hero Image](https://raw.githubusercontent.com/SevaVerse/creative.resumes/develop/public/og-image.png)

A fast, privacy-first resume builder with professional templates, AI-powered writing assistance, and a focus on user data protection. Build a polished, ATS-friendly resume in minutes, for free.

**[Live Demo](https://your-live-url.com)**

---

## ☕ Support This Project

If this tool helps you, please consider supporting its development. Your contribution keeps the servers running and ensures the project remains free and open-source for everyone.

<a href="https://www.buymeacoffee.com/sevaverse" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

---

## ✨ Core Features

*   **Privacy-First by Design:** No user tracking, ads, or data selling. PDF generation is handled securely.
*   **Four Professional Templates:** Choose from Minimalist, Onyx, AwesomeCV, and Subtle & Elegant designs.
*   **AI-Powered Rewrites:** Enhance your resume summary, experience, and project descriptions with integrated AI assistance from Groq.
*   **Modern Bot Protection:** Uses Cloudflare Turnstile, a privacy-respecting CAPTCHA alternative.
*   **One-Click PDF Export:** Download a print-ready, optimized PDF of your resume instantly.
*   **Gamified Resume Score:** Get instant feedback on your resume's quality to improve your chances with recruiters.
*   **Eco-Friendly Carbon Score:** Each template includes a "Carbon Score" to promote environmentally conscious choices.

---

## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router) & React
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI:** Groq API
*   **Authentication:** HMAC-signed Magic Links
*   **PDF Generation:** Puppeteer / @sparticuz/chromium
*   **Deployment:** Vercel / Netlify / Node.js

---

## 🚀 Quick Start

### Prerequisites
* Node.js (v18.x or later)
* npm or yarn

### Installation

```bash
git clone https://github.com/SevaVerse/creative.resumes.git
cd creative.resumes
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📚 Documentation

For detailed documentation, see the [`docs/`](./docs/) directory:

- **[Setup Guide](./docs/README.md)** - Complete installation and configuration
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture and deployment

---

## 🤝 Contributing

Contributions are welcome! If you have a feature request, find a bug, or want to improve the code, please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

*   Node.js (v18.x or later)
*   npm or yarn

### 2. Clone the Repository

```bash
git clone https://github.com/SevaVerse/creative.resumes.git
cd creative.resumes
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root by copying `.env.example` (if it exists) or by creating a new file. Fill in the required variables.

```env
# --- Security ---
# Generate a 32-character secret: openssl rand -hex 32
MAGIC_LINK_SECRET=

# Cloudflare Turnstile keys (get from https://dash.cloudflare.com/)
# For local dev, you can use test keys: https://developers.cloudflare.com/turnstile/reference/testing/
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# --- Services ---
# Groq API Key for AI rewrites (get from https://console.groq.com/keys)
GROQ_API_KEY=

# --- Email (for Magic Links) ---
# Use a service like Mailtrap or a local tool like smtp4dev
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL="noreply@yourdomain.com"

# --- Application ---
# The base URL of your deployed application
APP_BASE_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🤝 Contributing

Contributions are welcome! If you have a feature request, find a bug, or want to improve the code, please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
