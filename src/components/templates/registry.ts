import type React from "react";
import MinimalistTemplate from "../MinimalistTemplate";
import OnyxTemplate from "../OnyxTemplate";
import AwesomeCVTemplate from "../AwesomeCVTemplate";
import SubtleElegantTemplate from "../SubtleElegantTemplate";
import CampusTemplate from "../CampusTemplate";
import ModernTemplate from "../ModernTemplate";
import AtsClassicTemplate from "../AtsClassicTemplate";
import { TEMPLATE_IDS, type ResumeData, type TemplateId } from "@/types/resume";

export type TemplateTag = "fresher" | "ats" | "creative" | "photo";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  description: string;
  tags: TemplateTag[];
  /** Raw ink coverage estimate, 0 (none) – 10 (heavy). */
  inkScore: number;
  badgeColor: string;
  isNew?: boolean;
  Component: React.ComponentType<ResumeData>;
};

// Single source of truth for templates: gallery, preview tabs, PDF export and API validation.
export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  campus: {
    id: "campus",
    label: "Campus (Fresher)",
    description: "Education and projects first, then internships. Built for students and recent graduates.",
    tags: ["fresher", "ats"],
    inkScore: 2,
    badgeColor: "bg-teal-600",
    isNew: true,
    Component: CampusTemplate,
  },
  atsclassic: {
    id: "atsclassic",
    label: "ATS Classic",
    description: "Plain single column with standard headings and no graphics — parses cleanly in any ATS.",
    tags: ["ats", "fresher"],
    inkScore: 1,
    badgeColor: "bg-green-600",
    isNew: true,
    Component: AtsClassicTemplate,
  },
  modern: {
    id: "modern",
    label: "Modern",
    description: "Bold colour header, two-column body with skill bars. Optional photo.",
    tags: ["creative", "photo"],
    inkScore: 7,
    badgeColor: "bg-indigo-600",
    isNew: true,
    Component: ModernTemplate,
  },
  minimalist: {
    id: "minimalist",
    label: "Minimalist",
    description: "One column, clean serif lines. A safe choice for corporate roles.",
    tags: ["ats"],
    inkScore: 2,
    badgeColor: "bg-green-500",
    Component: MinimalistTemplate,
  },
  onyx: {
    id: "onyx",
    label: "Onyx",
    description: "Light sidebar with skill meters and an experience timeline.",
    tags: ["creative", "photo"],
    inkScore: 6,
    badgeColor: "bg-yellow-500",
    Component: OnyxTemplate,
  },
  awesomecv: {
    id: "awesomecv",
    label: "AwesomeCV",
    description: "Inspired by the popular open-source LaTeX template, with a dark sidebar.",
    tags: ["creative", "photo"],
    inkScore: 10,
    badgeColor: "bg-red-500",
    Component: AwesomeCVTemplate,
  },
  subtleelegant: {
    id: "subtleelegant",
    label: "Subtle & Elegant",
    description: "Serif typography, soft greys and a refined layout.",
    tags: ["photo"],
    inkScore: 3,
    badgeColor: "bg-gray-500",
    Component: SubtleElegantTemplate,
  },
};

/** Ordered list for display (new fresher-friendly templates first). */
export const TEMPLATE_LIST: TemplateMeta[] = [
  "campus", "atsclassic", "modern", "minimalist", "onyx", "awesomecv", "subtleelegant",
].map((id) => TEMPLATES[id as TemplateId]);

if (TEMPLATE_LIST.length !== TEMPLATE_IDS.length) {
  throw new Error("Template registry is out of sync with TEMPLATE_IDS");
}

export function getTemplateMeta(id: string | null | undefined): TemplateMeta {
  return (id && TEMPLATES[id as TemplateId]) || TEMPLATES.minimalist;
}

/** Eco score out of 10 (10 = least ink). */
export function carbonScore(meta: TemplateMeta): number {
  return Math.round((1 - meta.inkScore / 10) * 10);
}

export const TAG_LABELS: Record<TemplateTag, string> = {
  fresher: "Fresher-friendly",
  ats: "ATS-safe",
  creative: "Creative",
  photo: "Photo",
};
