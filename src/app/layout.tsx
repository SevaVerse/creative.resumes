import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Head from "./head";
import "./globals.css";
import { getBaseUrl } from "@/utils/baseUrl";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/components/AuthProvider";
import { LoginButton } from "@/components/LoginButton";

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
    default: "Free AI Resume Builder | Privacy-First with Pro Templates",
    template: "%s | AI Resume Builder",
  },
  description:
    "Build a standout resume for free with our AI-powered resume builder. Features AI rewrite capabilities, a carbon score calculator for eco-friendly templates, and is privacy-first by design. Choose from 4 pro templates and export to PDF instantly.",
  keywords: [
    "resume builder",
    "free resume builder",
    "AI resume builder",
    "resume rewrite",
    "professional resume templates",
    "privacy-first resume",
    "carbon-friendly resume",
    "eco-friendly resume",
    "cv builder",
    "ATS resume",
    "PDF resume",
    "Onyx resume template",
    "AwesomeCV resume template",
    "Subtle Elegant resume template",
    "Minimalist resume template",
    "AI resume writer",
    "free cv maker",
    "carbon score calculator resume",
  ],
  applicationName: "AI Resume Builder",
  authors: [{ name: "Seva" }],
  creator: "Seva",
  publisher: "Seva",
  category: "business",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Free AI Resume Builder | Privacy-First with Pro Templates",
    description:
      "Build a standout resume for free with our AI-powered resume builder, featuring AI rewrite, carbon score calculator, and 4 pro templates. Privacy-first by design.",
    siteName: "AI Resume Builder",
    images: [
      {
        url: "/og-image.png", // Assuming you will create this image
        width: 1200,
        height: 630,
        alt: "Free AI Resume Builder with Pro Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume Builder | Privacy-First with Pro Templates",
    description:
      "Build a standout resume for free with our AI-powered resume builder. Features AI rewrite, carbon score calculator, and 4 pro templates.",
    images: ["/og-image.png"], // Assuming you will create this image
    creator: "@sevadeveer", // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasNR = !!(process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY && process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID);
  
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Head />
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
          <header className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">SecureCV</h1>
              <LoginButton />
            </div>
          </header>
          <SpeedInsights />
          <Analytics />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
