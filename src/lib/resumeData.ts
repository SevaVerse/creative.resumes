import type { ExperienceItem, ResumeData, SkillItem } from "@/types/resume";

// Turns stored resume JSON (untrusted shape) into template props with safe defaults.

const str = (v: unknown, max = 5000): string => (typeof v === "string" ? v.slice(0, max) : "");

function experiences(v: unknown): ExperienceItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 30).flatMap((e) => {
    if (typeof e !== "object" || e === null) return [];
    const o = e as Record<string, unknown>;
    return [{ company: str(o.company, 200), title: str(o.title, 200), startDate: str(o.startDate, 40), endDate: str(o.endDate, 40), current: o.current === true, details: str(o.details) }];
  });
}

function skills(v: unknown): SkillItem[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, 60).flatMap((s) => {
    if (typeof s !== "object" || s === null) return [];
    const o = s as Record<string, unknown>;
    const level = typeof o.level === "number" && Number.isFinite(o.level) ? Math.max(0, Math.min(100, o.level)) : 50;
    return [{ name: str(o.name, 100), level }];
  });
}

/** Only inline images or https URLs are allowed as the photo source. */
function photo(v: unknown): string {
  const s = str(v, 2_500_000);
  return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(s) || /^https:\/\//i.test(s) ? s : "";
}

export function toResumeData(data: Record<string, unknown>, opts: { hideContact?: boolean } = {}): ResumeData {
  return {
    name: str(data.name, 200),
    email: opts.hideContact ? "" : str(data.email, 200),
    phone: opts.hideContact ? "" : str(data.phone, 60),
    website: str(data.website, 300),
    linkedin: str(data.linkedin, 300),
    summary: str(data.summary),
    experiences: experiences(data.experiences),
    education: str(data.education),
    skills: skills(data.skills),
    certifications: str(data.certifications),
    projects: str(data.projects),
    profilePictureUrl: photo(data.profilePictureUrl),
  };
}
