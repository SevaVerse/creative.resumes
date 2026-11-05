import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { getBaseUrl } from "@/utils/baseUrl";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/AuthProvider";
import { LoginButton } from "@/components/LoginButton";
import { TEMPLATE_COUNT } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `SecureCV — Free AI Resume Builder, ATS Checker & Fresher Jobs | ${TEMPLATE_COUNT} Templates`,
    template: "%s | SecureCV",
  },
  description:
    `Build a professional resume for free with SecureCV's AI-powered resume builder. AI text rewrite, ${TEMPLATE_COUNT} pro templates including fresher-friendly Campus and ATS Classic, a free ATS checker, instant PDF export with no paywall, and a monthly board of entry-level govt and private jobs. No tracking, no ads — privacy-first by design.`,
  keywords: [
    "resume builder",
    "free resume builder",
    "AI resume builder",
    "AI resume writer",
    "resume rewrite",
    "professional resume templates",
    "privacy-first resume",
    "ATS checker",
    "ATS resume checker",
    "resume keyword match",
    "free resume builder no paywall",
    "resume format for freshers",
    "carbon-friendly resume",
    "eco-friendly resume",
    "cv builder",
    "free cv maker",
    "ATS resume",
    "ATS-friendly resume builder",
    "PDF resume export",
    "Onyx resume template",
    "AwesomeCV resume template",
    "Subtle Elegant resume template",
    "Minimalist resume template",
    "carbon score calculator resume",
    "secure resume builder",
    "no tracking resume",
    "open source resume builder",
    "fresher resume template",
    "fresher jobs",
    "entry level jobs India",
    "government jobs for freshers",
  ],
  applicationName: "SecureCV",
  authors: [{ name: "Seva" }],
  creator: "Seva",
  publisher: "Seva",
  category: "business",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "SecureCV — Free AI Resume Builder | Privacy-First",
    description:
      `Build a standout resume for free with AI rewrite, a free ATS checker, carbon footprint estimates, ${TEMPLATE_COUNT} pro templates and monthly fresher jobs. No tracking, no ads, no paywall at download.`,
    siteName: "SecureCV",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecureCV — Free AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureCV — Free AI Resume Builder | Privacy-First",
    description:
      `Build a standout resume for free with AI rewrite, a free ATS checker, ${TEMPLATE_COUNT} pro templates and monthly fresher jobs. No tracking, no ads.`,
    images: ["/og-image.png"],
    creator: "@sevadeveer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Search console ownership tags, set via env so codes stay out of the repo.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } } : {}),
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "apple-mobile-web-app-title": "SecureCV",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasNR = !!(process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY && process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID);
  
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Server-rendered JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SecureCV",
              url: baseUrl,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              isAccessibleForFree: true,
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                `Build a professional, ATS-friendly resume in minutes with AI-powered text rewrite, a free ATS checker, carbon footprint estimates, and ${TEMPLATE_COUNT} pro templates including fresher-friendly designs. Privacy-first and free.`,
              featureList: [
                `${TEMPLATE_COUNT} professional templates incl. Campus (fresher), ATS Classic, Developer and Executive`,
                "Free in-browser ATS checker with job-description keyword match",
                "Monthly fresher jobs board (government and private)",
                "AI-powered resume text rewriting",
                "Structured experience and skills editor",
                "Gamified score and badge guidance",
                "Carbon footprint estimate (g CO2e per printed page) per template",
                "One-click PDF export via headless Chrome",
                "Privacy-first — no tracking, no ads",
                "Import from existing PDF/DOCX resume",
              ],
              creator: {
                "@type": "Person",
                name: "Seva",
              },
              sameAs: ["https://github.com/SevaVerse/creative.resumes"],
            }),
          }}
        />
        {/* New Relic Browser RUM Configuration - Server-side APM is active */}
        {hasNR && (
          <Script id="newrelic-browser-config" strategy="beforeInteractive">
            {`
              // New Relic Browser RUM configuration (server-side APM agent handles monitoring)
              window.NREUM=window.NREUM||{};
              window.NREUM.loader_config=window.NREUM.loader_config||{};
              window.NREUM.loader_config.licenseKey='${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY}';
              window.NREUM.loader_config.accountID='${process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID}';
              ${process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID ? `window.NREUM.loader_config.applicationID='${process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID}';` : ""}
              
              console.info('New Relic configuration loaded (server-side APM active)');
            `}
          </Script>
        )}
      </head>
      <body>
        <AuthProvider>
          <header className="border-b border-gray-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" aria-label="SecureCV — Home">SecureCV</Link>
              <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
                <Link href="/resume-templates/" className="hidden sm:inline whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300">Templates</Link>
                <Link href="/ats-checker/" className="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300"><span className="sm:hidden">ATS</span><span className="hidden sm:inline">ATS Checker</span></Link>
                <Link href="/jobs/" className="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300"><span className="sm:hidden">Jobs</span><span className="hidden sm:inline">Fresher Jobs</span></Link>
                <LoginButton />
              </nav>
            </div>
          </header>
          <Analytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
