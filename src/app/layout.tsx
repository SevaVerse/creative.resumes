import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
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
  process.env.APP_BASE_URL ||
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* JSON-LD structured data */}
        <Script id="ld-json-resume-app" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Resume Builder",
            url: baseUrl,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            isAccessibleForFree: true,
            description:
              "Build an ATS‑friendly resume in minutes. Three templates (Minimalist, Onyx, AwesomeCV), PDF export, and privacy‑first.",
            featureList: [
              "Three professional templates",
              "Structured experience and skills",
              "Gamified guidance with score and badges",
              "Carbon footprint score",
              "One‑click PDF export",
              "Privacy‑first and free",
            ],
          })}
        </Script>
        <Script id="ld-json-breadcrumbs" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
              { "@type": "ListItem", position: 2, name: "Privacy", item: baseUrl + "/privacy" },
            ],
          })}
        </Script>
        <Script id="ld-json-faq" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Do you store my resume data?",
                acceptedAnswer: { "@type": "Answer", text: "No. Your data stays in your browser; only a transient payload is sent for PDF generation when you export." },
              },
              {
                "@type": "Question",
                name: "Is the resume builder free?",
                acceptedAnswer: { "@type": "Answer", text: "Yes. All core features are free with no trials or paywalls." },
              },
              {
                "@type": "Question",
                name: "What templates are available?",
                acceptedAnswer: { "@type": "Answer", text: "Minimalist, Onyx, AwesomeCV, and Subtle & Elegant templates are provided." },
              },
              {
                "@type": "Question",
                name: "Do you track users?",
                acceptedAnswer: { "@type": "Answer", text: "We do not use third‑party analytics scripts or trackers; optional lightweight in‑memory metrics are anonymous." },
              },
            ],
          })}
        </Script>
        {children}
      </body>
    </html>
  );
}
