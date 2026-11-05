import React from "react";
import type { ExperienceItem } from "@/types/resume";

/** Splits free text into trimmed, non-empty lines; strips leading bullet glyphs. */
export function toLines(text?: string): string[] {
  return (text || "")
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-*–]\s*/, "").trim())
    .filter(Boolean);
}

export function dateRange(exp: ExperienceItem): string {
  const end = exp.current ? "Present" : exp.endDate || "";
  return [exp.startDate, end].filter(Boolean).join(" – ");
}

export function hasExperience(experiences?: ExperienceItem[]): boolean {
  return !!experiences?.some((e) => e.title || e.company || e.details);
}

export function Bullets({ text, className = "" }: { text?: string; className?: string }) {
  const lines = toLines(text);
  if (lines.length === 0) return null;
  if (lines.length === 1) return <p className={className}>{lines[0]}</p>;
  return (
    <ul className={`list-disc pl-5 ${className}`}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

/**
 * Profile photo as a plain <img>. Templates are also rendered to static HTML on the server for PDF
 * export, where next/image (a client component) cannot run; images are unoptimized anyway (next.config),
 * and eager loading keeps the photo from being missing in the printed page.
 */
export function ProfilePhoto({ src, alt = "Profile picture", size, className }: { src: string; alt?: string; size: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={size} height={size} className={className} />;
}
