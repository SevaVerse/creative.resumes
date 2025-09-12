import { NextRequest } from "next/server";

// Simple in-memory counters (resets on server restart or scale-out)
// TODO: Persist to DB using DATABASE_URL
const counters = {
  page_hits: 0,
  resume_downloads: 0,
};

// Load from DB if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  // Example: Use better-sqlite3 or similar
  // const db = new Database(process.env.DATABASE_URL);
  // counters.page_hits = db.prepare("SELECT value FROM metrics WHERE key = ?").get("page_hits")?.value || 0;
  // counters.resume_downloads = db.prepare("SELECT value FROM metrics WHERE key = ?").get("resume_downloads")?.value || 0;
}

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

    // Save to DB if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      // Example: db.prepare("INSERT OR REPLACE INTO metrics (key, value) VALUES (?, ?)").run(type, counters[type]);
    }

    return Response.json({
      ok: true,
      page_hits: counters.page_hits,
      resume_downloads: counters.resume_downloads,
    });
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
}
