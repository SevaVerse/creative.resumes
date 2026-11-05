import { renderOgCard } from "@/lib/ogImage";
import { roastTier } from "@/lib/roast/quips";

// Served at /og/roast/<score>.png (0–100) and /og/roast/start.png. Content-free: score and tier only.
// No emoji: next/og would need to fetch an emoji font at runtime to draw them.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ file: "start.png" }, ...Array.from({ length: 101 }, (_, i) => ({ file: `${i}.png` }))];
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const key = (await params).file.replace(/\.png$/, "");
  if (key === "start") {
    return renderOgCard({
      eyebrow: "Roast my resume",
      title: "Will your resume survive the roast?",
      subtitle: "A funny, honest AI critique plus the fixes that matter. Free, no sign-up.",
      accent: "#ea580c",
    });
  }
  const n = Number(key);
  const tier = roastTier(n);
  return renderOgCard({
    eyebrow: `Resume roast · ${tier.label}`,
    title: `This resume scored ${n}/100`,
    subtitle: `${tier.blurb} Think yours would do better?`,
    accent: tier.colour,
  });
}
