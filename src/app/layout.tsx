import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Head from "./head";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Resume Builder | Create a professional resume in minutes",
    template: "%s | Resume Builder",
  },
  description:
    "Build a professional, ATS‑friendly resume in minutes. Choose from Minimalist, Onyx, and AwesomeCV templates. PDF export, gamified guidance, and privacy‑first by design.",
  keywords: [
    "resume builder",
    "cv",
    "ATS",
    "PDF export resume",
    "Minimalist resume",
    "AwesomeCV",
    "Onyx template",
    "privacy first resume builder",
    "free resume generator",
    "download resume PDF",
  ],
  applicationName: "Resume Builder",
  authors: [{ name: "Resume Builder" }],
  creator: "Resume Builder",
  publisher: "Resume Builder",
  category: "business",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Resume Builder | Create a professional resume in minutes",
    description:
      "Build a professional, ATS‑friendly resume in minutes using Minimalist, Onyx, or AwesomeCV. Privacy‑first with one‑click PDF export.",
    siteName: "Resume Builder",
    images: [
      {
        url: "/vercel.svg",
        width: 1200,
        height: 630,
        alt: "Resume Builder Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Builder | Create a professional resume in minutes",
    description:
      "Build a professional, ATS‑friendly resume in minutes. Choose Minimalist, Onyx, or AwesomeCV and export to PDF.",
    images: ["/vercel.svg"],
    creator: "@resume_builder",
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
      <body>{children}</body>
    </html>
  );
}
