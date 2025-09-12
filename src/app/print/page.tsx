"use client";
// Metadata export cannot be used in a client component; inject minimal head tags inline.
import React, { useEffect, useState } from "react";
import PrintResume, { PrintPayload } from "@/components/PrintResume";

function decodePayload(searchParams: URLSearchParams): PrintPayload | null {
  const data = searchParams.get("data");
  if (!data) return null;
  try {
    const json = atob(data);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function PrintPage() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const parsed = decodePayload(sp);
    if (parsed) setPayload(parsed);
  }, []);

  if (!payload) {
    return (
      <div className="p-6 text-sm text-gray-700">
  No data provided. Please navigate with a base64-encoded &quot;data&quot; query string.
      </div>
    );
  }

  return (
    <>
      <head>
        <title>Print Resume (Session Render)</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Temporary print rendering page for generating a PDF of your selected resume template." />
      </head>
      <div className="min-h-screen bg-white flex items-start justify-center p-6">
        <PrintResume {...payload} />
      </div>
    </>
  );
}
