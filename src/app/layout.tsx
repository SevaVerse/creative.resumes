import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { getBaseUrl } from "@/utils/baseUrl";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/AuthProvider";
import { LoginButton } from "@/components/LoginButton";
import { TEMPLATE_COUNT, TEMPLATE_LIST } from "@/components/templates/registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();
const templateNames = TEMPLATE_LIST.map((t) => t.label.replace(/ \(.*\)$/, ""));

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `SecureCV — Free AI Resume Builder & Fresher Jobs | Privacy-First, ${TEMPLATE_COUNT} Templates`,
    template: "%s | SecureCV",
  },
  description:
    `Build a professional resume for free with SecureCV's AI-powered resume builder. AI text rewrite, ${TEMPLATE_COUNT} pro templates including fresher-friendly Campus and ATS Classic, instant PDF export, and a monthly board of entry-level govt and private jobs. No tracking, no ads — privacy-first by design.`,
  keywords: [
    "resume builder",
    "free resume builder",
    "AI resume builder",
    "AI resume writer",
    "resume rewrite",
    "professional resume templates",
    "privacy-first resume",
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
      `Build a standout resume for free with AI rewrite, carbon footprint estimates, ${TEMPLATE_COUNT} pro templates and monthly fresher jobs. No tracking, no ads — privacy-first by design.`,
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
      `Build a standout resume for free with AI rewrite, carbon footprint estimates, ${TEMPLATE_COUNT} pro templates and monthly fresher jobs. No tracking, no ads.`,
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
  verification: {
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
  manifest: "/manifest.json",
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
                `Build a professional, ATS-friendly resume in minutes with AI-powered text rewrite, carbon footprint estimates, and ${TEMPLATE_COUNT} pro templates including fresher-friendly designs. Privacy-first and free.`,
              featureList: [
                `${TEMPLATE_COUNT} professional templates incl. Campus (fresher), ATS Classic, Developer and Executive`,
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
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
                { "@type": "ListItem", position: 2, name: "Privacy", item: `${baseUrl}/privacy` },
                { "@type": "ListItem", position: 3, name: "Blog", item: `${baseUrl}/blog` },
                { "@type": "ListItem", position: 4, name: "Fresher Jobs", item: `${baseUrl}/jobs` },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is SecureCV really free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `Yes. All core features — ${TEMPLATE_COUNT} templates, AI rewrite, PDF export, the fresher jobs board and the carbon footprint estimates — are completely free with no trials or paywalls.`,
                  },
                },
                {
                  "@type": "Question",
                  name: "Do you store my resume data?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Your data stays in your browser by default. If you sign in, you can optionally save resumes to your account. PDF rendering is transient and nothing is persisted without your consent.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What resume templates are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `SecureCV offers ${TEMPLATE_COUNT} templates: ${templateNames.slice(0, -1).join(", ")} and ${templateNames[templateNames.length - 1]}. Campus, ATS Classic, Nordic and Developer suit freshers; ATS Classic and Nordic are the most parser-safe.`,
                  },
                },
                {
                  "@type": "Question",
                  name: "Does SecureCV track users or show ads?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. SecureCV does not use third-party analytics scripts, trackers, or ads. Only anonymous page-view counts are kept in-memory for display purposes.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I import my existing resume?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Upload a PDF or DOCX file and SecureCV's AI will parse it and auto-fill your resume details, saving you time.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the carbon score calculator?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Each template gets a carbon score based on ink usage, color coverage, and print area. A lower score means less environmental impact when printed — helping you make eco-conscious choices.",
                  },
                },
              ],
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
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" aria-label="SecureCV — Home">SecureCV</Link>
              <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-4">
                <Link href="/jobs" className="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300">Fresher Jobs</Link>
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
