import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/ogImage";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Free ATS resume checker";

export default function Image() {
  return renderOgCard({
    eyebrow: "Free ATS resume checker",
    title: "Will your resume pass the ATS?",
    subtitle: "Score + missing keywords from any job description. Runs in your browser — nothing uploaded.",
    accent: "#9333ea",
  });
}
