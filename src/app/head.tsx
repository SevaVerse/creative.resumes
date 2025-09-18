"use client";
import Script from "next/script";

// Centralized <head> content for App Router with meta tags and structured data.
// Note: New Relic beforeInteractive scripts are now in layout.tsx root head.

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function Head() {
  const hasNR = !!(process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY && process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID);
  
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      
      {/* New Relic Browser RUM - Graceful fallback with stub functions */}
      {hasNR && (
        <Script
          id="newrelic-browser-stub"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // New Relic Browser RUM stub functions (graceful degradation)
              // Server-side APM agent is still active and working
              if (typeof window.newrelic === 'undefined') {
                window.newrelic = {
                  setCustomAttribute: function(key, value) {
                    console.log('[New Relic Stub] Custom Attribute:', key, value);
                  },
                  noticeError: function(error, customAttributes) {
                    console.log('[New Relic Stub] Error noticed:', error, customAttributes);
                  },
                  addPageAction: function(name, attributes) {
                    console.log('[New Relic Stub] Page Action:', name, attributes);
                  },
                  setPageViewName: function(name) {
                    console.log('[New Relic Stub] Page View:', name);
                  },
                  finished: function(time) {
                    console.log('[New Relic Stub] Finished:', time);
                  }
                };
                console.info('New Relic Browser RUM: Using stub functions (server-side APM active)');
              }
            `
          }}
        />
      )}
      
      {/* JSON-LD structured data for SEO */}
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
    </>
  );
}