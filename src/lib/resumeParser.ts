import "server-only";
import { getGroq, GROQ_MODEL } from "@/utils/groq";
import type { ExperienceItem, SkillItem } from "@/types/resume";

export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications?: string;
  projects?: string;
};

export const PDF_TYPE = "application/pdf";
export const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractResumeText(buffer: Uint8Array, contentType: string): Promise<string> {
  if (contentType === PDF_TYPE) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim();
  }
  if (contentType === DOCX_TYPE) {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value.trim();
  }
  throw new Error("Unsupported file type");
}

const SYSTEM_PROMPT = `You are an expert resume parser. Extract structured data from resume text and return ONLY valid JSON with these exact fields:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "website": "string (optional)",
  "linkedin": "string (optional)",
  "summary": "string",
  "experiences": [{"company": "string", "title": "string", "startDate": "string", "endDate": "string or Present", "current": boolean, "details": "string with one achievement per line"}],
  "education": "string (one qualification per line)",
  "skills": [{"name": "string", "level": number 1-100}],
  "certifications": "string (optional)",
  "projects": "string (optional)"
}
If information is missing, use empty strings or empty arrays. Do not include any text outside the JSON.`;

function str(v: unknown, max = 4000): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

/** Coerces untrusted LLM output into the ParsedResume shape. */
function normalize(raw: Record<string, unknown>): ParsedResume {
  const experiences = Array.isArray(raw.experiences) ? raw.experiences.slice(0, 15) : [];
  const skills = Array.isArray(raw.skills) ? raw.skills.slice(0, 40) : [];
  return {
    name: str(raw.name, 200),
    email: str(raw.email, 200),
    phone: str(raw.phone, 50),
    website: str(raw.website, 300),
    linkedin: str(raw.linkedin, 300),
    summary: str(raw.summary),
    experiences: experiences.map((e) => {
      const x = (e ?? {}) as Record<string, unknown>;
      return {
        company: str(x.company, 200),
        title: str(x.title, 200),
        startDate: str(x.startDate, 40),
        endDate: str(x.endDate, 40),
        current: x.current === true,
        details: str(x.details),
      };
    }),
    education: str(raw.education),
    skills: skills
      .map((s) => {
        const x = (s ?? {}) as Record<string, unknown>;
        const level = Number(x.level);
        return { name: str(x.name, 80), level: Number.isFinite(level) ? Math.max(0, Math.min(100, level)) : 60 };
      })
      .filter((s) => s.name),
    certifications: str(raw.certifications),
    projects: str(raw.projects),
  };
}

export async function structureResume(text: string): Promise<ParsedResume> {
  const completion = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Parse this resume:\n\n${text.slice(0, 20_000)}` },
    ],
  });
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("No content returned from LLM");
  const parsed = JSON.parse(content) as Record<string, unknown>;
  return normalize(parsed);
}
