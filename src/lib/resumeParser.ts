import "server-only";
import { getGroq, GROQ_MODEL, GROQ_REASONING_PARAMS, GROQ_REASONING_TOKENS } from "@/utils/groq";
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

// The import route has a 30s budget: bound each step so a stall returns an error, not a gateway 504.
const EXTRACT_TIMEOUT_MS = 10_000;
const LLM_TIMEOUT_MS = 18_000;

// unpdf bundles pdf.js 5, which calls Promise.try (Node 24+). Without it, pdf.js rejects inside its
// worker setup and getDocumentProxy never settles, so the request hangs. Polyfill for older Node.
function ensurePromiseTry(): void {
  const P = Promise as PromiseConstructor & { try?: unknown };
  if (typeof P.try === "function") return;
  Object.defineProperty(Promise, "try", {
    configurable: true,
    writable: true,
    value: function <T>(fn: (...args: unknown[]) => T | PromiseLike<T>, ...args: unknown[]): Promise<T> {
      return new Promise<T>((resolve) => resolve(fn(...args)));
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function extractResumeText(buffer: Uint8Array, contentType: string): Promise<string> {
  return withTimeout(readText(buffer, contentType), EXTRACT_TIMEOUT_MS, "text extraction");
}

async function readText(buffer: Uint8Array, contentType: string): Promise<string> {
  if (contentType === PDF_TYPE) {
    ensurePromiseTry();
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
  const completion = await getGroq().chat.completions.create(
    {
      model: GROQ_MODEL,
      ...GROQ_REASONING_PARAMS,
      temperature: 0.2,
      max_tokens: 2500 + GROQ_REASONING_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Parse this resume:\n\n${text.slice(0, 20_000)}` },
      ],
    },
    { timeout: LLM_TIMEOUT_MS, maxRetries: 0 },
  );
  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("No content returned from LLM");
  const parsed = JSON.parse(content) as Record<string, unknown>;
  return normalize(parsed);
}
