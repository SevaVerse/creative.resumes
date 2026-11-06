import type { JobSector } from "@/types/database";
import type { RawJob } from "./types";

// Heuristics for "entry level / fresher" roles. Tuned to favour precision:
// a role must match an entry-level signal AND must not look senior.

const ENTRY_SIGNALS = [
  /\bfreshers?\b/i,
  /\bentry[\s-]?level\b/i,
  /\bgraduate (?:trainee|engineer|apprentice|program(?:me)?)\b/i,
  /\b(?:management|engineer(?:ing)?|technical|executive|officer|apprentice) trainee\b/i,
  /\btrainee\b/i,
  /\bapprentice(?:ship)?\b/i,
  /\bintern(?:ship)?s?\b/i,
  /\bnew[\s-]?grad(?:uate)?s?\b/i,
  /\bcampus (?:hire|hiring|recruit\w*)\b/i,
  /\bjunior\b|\bjr\.?\s/i,
  /\bassociate (?:software|engineer|developer|analyst|consultant)\b/i,
  /\b(?:engineer|developer|analyst)\s*(?:-|–)?\s*i\b(?!i)/i, // "Software Engineer I"
  /\b0\s*(?:-|–|to)\s*[12]\s*(?:years?|yrs?)\b/i,
  /\bno experience (?:required|needed)\b/i,
];

const SENIOR_SIGNALS = [
  /\bsenior\b|\bsr\.?\s/i,
  /\blead\b|\bprincipal\b|\bstaff\b|\barchitect\b/i,
  /\bmanager\b|\bdirector\b|\bhead of\b|\bvp\b|\bvice president\b|\bchief\b/i,
  /\b(?:[3-9]|1\d)\s*\+?\s*(?:-|–|to)?\s*\d*\s*(?:years?|yrs?)\b/i,
];

// Government recruitment notices rarely say "fresher"; instead they name exams/posts.
const GOVT_RECRUITMENT_SIGNALS = [
  /\brecruit(?:ment)?\b/i, /\bvacanc(?:y|ies)\b/i, /\bapprentice/i, /\bnotification\b/i,
  /\badvertisement\b/i, /\bexamination\b|\bexam\b/i, /\bposts?\b/i, /\bwalk[\s-]?in\b/i,
];

const GOVT_ORG = /\b(?:govt|government|ministry|department of|public sector|psu|railway|rrb|municipal|nagar nigam|commission|upsc|ssc|ibps|rbi|sbi|nabard|sebi|drdo|isro|barc|bsnl|ongc|ntpc|bhel|sail|gail|iocl|hpcl|bpcl|aiims|nhm|indian (?:army|navy|air force|post|oil|bank)|india post|high court|district court|police|cpsu|central university|kendriya|navodaya|state bank|bank of (?:india|baroda|maharashtra)|punjab national|canara bank|union bank|ministry of)\b/i;

const INDIA_LOCATION = /\b(?:india|bengaluru|bangalore|mumbai|delhi|new delhi|ncr|gurgaon|gurugram|noida|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|kochi|cochin|chandigarh|indore|coimbatore|thiruvananthapuram|trivandrum|lucknow|bhubaneswar|nagpur|vadodara|visakhapatnam|mysuru|mysore)\b/i;
// Location words that don't name a country; a "remote" posting made only of these is open to India.
const UNRESTRICTED_REMOTE = /\b(?:remote|anywhere|worldwide|global|work from home|wfh|apac|asia(?: pacific)?|hybrid)\b/gi;

export function looksSenior(text: string): boolean {
  // Some ATS titles use underscores as separators ("IN_RBAI_Senior Engineer"), which hide words from \b.
  const normalized = text.replace(/_/g, " ");
  return SENIOR_SIGNALS.some((re) => re.test(normalized));
}

export function isEntryLevel(job: RawJob, sector: JobSector): boolean {
  const title = job.title || "";
  if (looksSenior(title)) return false;
  if (job.trustedEntryLevel) return true;
  const haystack = `${title} ${job.employmentType ?? ""} ${job.summary ?? ""}`;
  if (ENTRY_SIGNALS.some((re) => re.test(haystack))) return true;
  // Most government notices are open to fresh graduates via exams.
  return sector === "government" && GOVT_RECRUITMENT_SIGNALS.some((re) => re.test(title));
}

export function classifySector(job: RawJob): JobSector {
  if (job.sector) return job.sector;
  return GOVT_ORG.test(`${job.organization} ${job.title}`) ? "government" : "private";
}

export function isIndiaOrRemote(location?: string | null): boolean {
  if (!location) return true; // many govt feeds omit location; they are India-only sources
  if (INDIA_LOCATION.test(location)) return true;
  // "Remote" alone is fine; "Remote - US" or "San Francisco; Remote" is not open to India.
  return /\bremote\b/i.test(location) && !/[a-z]/i.test(location.replace(UNRESTRICTED_REMOTE, ""));
}

const TAG_RULES: [string, RegExp][] = [
  ["Internship", /\bintern(?:ship)?s?\b/i],
  ["Apprenticeship", /\bapprentice/i],
  ["Trainee", /\btrainee\b/i],
  ["Remote", /\bremote\b|\bwork from home\b|\bwfh\b/i],
  ["Engineering", /\bengineer|developer|software|sde\b/i],
  ["Data", /\bdata\b|\banalyst\b|\banalytics\b/i],
  ["Banking", /\bbank|ibps|rbi|sbi\b/i],
  ["Railways", /\brailway|rrb\b/i],
  ["Defence", /\barmy|navy|air force|defence|defense|drdo\b/i],
  ["Teaching", /\bteacher|faculty|lecturer|tgt|pgt\b/i],
  ["Healthcare", /\bnurse|medical|pharmac|aiims|health\b/i],
];

export function deriveTags(job: RawJob): string[] {
  const text = `${job.title} ${job.organization} ${job.location ?? ""} ${job.employmentType ?? ""}`;
  return TAG_RULES.filter(([, re]) => re.test(text)).map(([tag]) => tag).slice(0, 4);
}
