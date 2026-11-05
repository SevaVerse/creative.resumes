// Shared resume data shapes used by the builder, templates, and PDF export.

export type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};

export type SkillItem = { name: string; level: number };

export type ResumeData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications?: string;
  projects?: string;
  profilePictureUrl?: string;
};

export const TEMPLATE_IDS = [
  "minimalist",
  "onyx",
  "awesomecv",
  "subtleelegant",
  "campus",
  "modern",
  "atsclassic",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);
}
