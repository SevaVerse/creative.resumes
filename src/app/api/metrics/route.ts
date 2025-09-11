import { NextRequest } from "next/server";

// Simple in-memory counters (resets on server restart or scale-out)
const counters = {
  page_hits: 0,
  resume_downloads: 0,
};

export async function GET() {
  return Response.json({
    page_hits: counters.page_hits,
    resume_downloads: counters.resume_downloads,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    if (type === "page_hit") counters.page_hits += 1;
    else if (type === "resume_download") counters.resume_downloads += 1;
    else return new Response("Invalid metric type", { status: 400 });

    return Response.json({
      ok: true,
      page_hits: counters.page_hits,
      resume_downloads: counters.resume_downloads,
    });
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
}
