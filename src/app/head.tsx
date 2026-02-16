"use client";
import Script from "next/script";

// Client-side <head> additions (New Relic stubs only).
// SEO structured data (JSON-LD) is server-rendered in layout.tsx.

export default function Head() {
  const hasNR = !!(process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY && process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID);
  
  return (
    <>
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
    </>
  );
}