import type { MetadataRoute } from "next";
import { SITE_NAME, TEMPLATE_COUNT } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Free AI Resume Builder`,
    short_name: SITE_NAME,
    description: `Build a professional resume for free: ${TEMPLATE_COUNT} templates, AI rewrite, ATS checker and instant PDF export. Privacy-first by design.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Build a resume", url: "/" },
      { name: "ATS resume checker", url: "/ats-checker/" },
      { name: "Fresher jobs", url: "/jobs/" },
    ],
  };
}
