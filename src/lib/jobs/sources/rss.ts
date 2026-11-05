import { fetchWithTimeout } from "../http";
import { decodeEntities, stripHtml, toIsoDate, truncate } from "../text";
import type { RawJob } from "../types";
import type { JobSector } from "@/types/database";

// Minimal RSS 2.0 / Atom reader (no dependency). Used for official recruitment feeds
// configured via JOB_FEEDS. Only title/link/date/description are read.

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return null;
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

function atomLink(block: string): string | null {
  const m = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return m ? decodeEntities(m[1]) : null;
}

export function parseFeed(xml: string): { title: string; link: string; date: string | null; description: string }[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return items.map((block) => ({
    title: stripHtml(tag(block, "title") || ""),
    link: decodeEntities(tag(block, "link") || atomLink(block) || "").trim(),
    date: toIsoDate(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "dc:date")),
    description: stripHtml(tag(block, "description") || tag(block, "summary") || tag(block, "content") || ""),
  }));
}

export type FeedConfig = { name: string; url: string; sector: JobSector; organization?: string };

export async function fetchFeed(feed: FeedConfig): Promise<RawJob[]> {
  const res = await fetchWithTimeout(feed.url);
  const xml = await res.text();
  return parseFeed(xml)
    .filter((i) => i.title && i.link)
    .map((i) => ({
      source: feed.name,
      title: truncate(i.title, 300),
      organization: feed.organization || feed.name,
      url: new URL(i.link, feed.url).toString(),
      summary: i.description ? truncate(i.description, 280) : null,
      postedAt: i.date,
      sector: feed.sector,
    }));
}
