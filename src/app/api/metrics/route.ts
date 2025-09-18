import { NextRequest } from "next/server";
import { getRedis } from "@/utils/redis";

// Fallback in-memory counters (used when Redis is not configured)
const counters = {
  page_hits: 0,
  resume_downloads: 0,
};

export async function GET() {
  const redis = getRedis();
  if (redis) {
    const [page_hits, resume_downloads] = await Promise.all([
      redis.get<number>("page_hits").then((v: unknown) => Number((v as number) ?? 0)),
      redis.get<number>("resume_downloads").then((v: unknown) => Number((v as number) ?? 0)),
    ]);
    return Response.json({ page_hits, resume_downloads });
  }
  return Response.json({
    page_hits: counters.page_hits,
    resume_downloads: counters.resume_downloads,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json();
    if (type !== "page_hit" && type !== "resume_download") {
      return new Response("Invalid metric type", { status: 400 });
    }

    const redis = getRedis();
    if (redis) {
      const key = type === "page_hit" ? "page_hits" : "resume_downloads";
      await redis.incr(key);
      const [page_hits, resume_downloads] = await Promise.all([
        redis.get<number>("page_hits").then((v: unknown) => Number((v as number) ?? 0)),
        redis.get<number>("resume_downloads").then((v: unknown) => Number((v as number) ?? 0)),
      ]);
      return Response.json({ ok: true, page_hits, resume_downloads });
    }

    // Fallback to in-memory when Redis not configured
    if (type === "page_hit") counters.page_hits += 1;
    else counters.resume_downloads += 1;

    return Response.json({
      ok: true,
      page_hits: counters.page_hits,
      resume_downloads: counters.resume_downloads,
    });
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
}
