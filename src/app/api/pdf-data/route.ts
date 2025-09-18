import { NextRequest } from "next/server";

// Add type declaration for global temp storage
declare global {
  var tempPdfData: Map<string, string> | undefined;
}

// API route to retrieve temporary PDF data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing ID parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Retrieve data from temporary storage
  const tempData = globalThis.tempPdfData?.get(id);

  if (!tempData) {
    return new Response(JSON.stringify({ error: 'Data not found or expired' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(tempData, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}