import React from "react";
import PrintResume, { PrintPayload } from "@/components/PrintResume";

// Server component that fetches data from API using temporary ID
export default async function PrintPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  let payload: PrintPayload | null = null;

  try {
    const params = await searchParams;
    const id = params?.id;

    if (typeof id === 'string') {
      // Fetch data from API route
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pdf-data?id=${id}`);
      if (response.ok) {
        const jsonString = await response.text();
        payload = JSON.parse(jsonString);
      }
    }
  } catch (error) {
    console.error('Error fetching resume data:', error);
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Print Resume</h1>
          <p className="text-gray-600">No resume data provided. Please try exporting again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-6">
      <PrintResume {...payload} />
    </div>
  );
}
