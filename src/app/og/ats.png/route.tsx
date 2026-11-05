import { renderOgCard } from "@/lib/ogImage";

// Served at /og/ats.png. The file extension exempts it from the trailing-slash redirect,
// which some link-preview crawlers do not follow.
export const dynamic = "force-static";

export function GET() {
  return renderOgCard({
    eyebrow: "Free ATS resume checker",
    title: "Will your resume pass the ATS?",
    subtitle: "Score + missing keywords from any job description. Runs in your browser — nothing uploaded.",
    accent: "#9333ea",
  });
}
