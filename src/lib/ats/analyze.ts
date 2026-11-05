// Deterministic ATS-readiness analysis. Pure functions with no network calls, so the
// checker runs entirely in the browser and resume text never leaves the device.

export type Severity = "high" | "medium" | "low";

export type AtsIssue = { severity: Severity; message: string; fix: string };

export type KeywordHit = { term: string; priority: "high" | "medium"; inResume: boolean };

export type AtsResult = {
  overall: number;
  scores: {
    /** null when no job description was given. */
    keywords: number | null;
    sections: number;
    impact: number;
    readability: number;
  };
  keywords: KeywordHit[];
  sectionsFound: string[];
  sectionsMissing: string[];
  stats: { words: number; bullets: number; quantifiedBullets: number; actionBullets: number; weakPhrases: string[] };
  issues: AtsIssue[];
};

const SECTIONS: { name: string; required: boolean; re: RegExp }[] = [
  { name: "Contact details", required: true, re: /$^/ }, // handled separately
  { name: "Summary", required: false, re: /^(professional\s+)?(summary|profile|objective|about me|career objective)\b/im },
  { name: "Experience", required: true, re: /^(work\s+|professional\s+)?(experience|employment|work history|internships?)\b/im },
  { name: "Education", required: true, re: /^(education|academic|qualifications?)\b/im },
  { name: "Skills", required: true, re: /^(technical\s+|key\s+|core\s+)?(skills|competencies|tech stack|technologies)\b/im },
  { name: "Projects", required: false, re: /^(academic\s+|personal\s+|key\s+)?projects?\b/im },
  { name: "Certifications", required: false, re: /^(certifications?|licenses|courses|achievements|awards)\b/im },
];

const ACTION_VERBS = new Set(
  (
    "achieved accelerated added analyzed architected automated boosted built championed collaborated completed conducted " +
    "configured coordinated created cut debugged decreased delivered deployed designed developed directed drove eliminated " +
    "enabled engineered established exceeded executed expanded facilitated generated grew guided handled implemented improved " +
    "increased initiated integrated introduced launched led maintained managed mentored migrated modernized negotiated " +
    "optimized orchestrated organized owned pioneered planned presented prototyped published raised redesigned reduced " +
    "refactored resolved restructured revamped saved scaled secured shipped simplified spearheaded streamlined strengthened " +
    "supervised taught tested trained transformed tripled doubled upgraded won wrote"
  ).split(" "),
);

const WEAK_PHRASES = ["responsible for", "worked on", "helped with", "duties included", "involved in", "tasked with", "assisted in", "hard worker", "team player", "go-getter"];

const STOPWORDS = new Set(
  (
    "a about above after again all also am an and any are as at be because been before being below between both but by can " +
    "could did do does doing down during each etc few for from further had has have having he her here hers him his how i if in " +
    "into is it its itself just me more most my no nor not now of off on once only or other our ours out over own per same she " +
    "should so some such than that the their them then there these they this those through to too under until up very was we " +
    "were what when where which while who whom why will with would you your yours " +
    // Job-ad filler that is never a useful keyword.
    "ability able across apply applicant applicants candidate candidates company opportunity opportunities role roles position " +
    "responsibilities responsibility requirements required preferred plus join looking seeking work working team teams year years " +
    "experience experienced job jobs including include includes strong excellent good great new must based well within using use " +
    "skills skill knowledge understanding familiarity etc ideal day days time full part related relevant like make ensure help " +
    "environment environments across various other others us we're you'll you're who'll will can may want need needs " +
    "hiring hire hired valued value values write build building junior senior engineer engineers services service " +
    "following desired essential bonus nice offer offers benefits salary location remote hybrid office apply now"
  ).split(" "),
);

/** Multi-word terms recognised as single keywords when present in the job description. */
const KNOWN_PHRASES = [
  "machine learning", "deep learning", "data analysis", "data science", "data structures", "computer science", "power bi",
  "project management", "product management", "stakeholder management", "customer service", "problem solving",
  "communication skills", "rest api", "rest apis", "spring boot", "node.js", "react native", "next.js", "google cloud",
  "unit testing", "test automation", "ci/cd", "version control", "object oriented", "object-oriented", "system design",
  "digital marketing", "content writing", "financial analysis", "financial modelling", "financial modeling", "ms excel",
  "microsoft excel", "sales strategy", "business development", "supply chain", "quality assurance", "user research",
  "a/b testing", "natural language processing", "computer vision", "big data", "cloud computing", "agile methodology",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
}

function tokens(text: string): string[] {
  return normalize(text).match(/[a-z][a-z0-9+#./-]*[a-z0-9+#]|[a-z]/g) ?? [];
}

function containsTerm(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(haystack);
}

/** Top keywords of a job description, ranked by frequency, with known phrases first. */
export function extractKeywords(jobText: string, limit = 25): { term: string; count: number }[] {
  const norm = normalize(jobText);
  const counts = new Map<string, number>();
  const covered = new Set<string>();

  for (const phrase of KNOWN_PHRASES) {
    const re = new RegExp(`(^|[^a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`, "g");
    const n = norm.match(re)?.length ?? 0;
    if (n > 0) {
      counts.set(phrase, n + 1); // boost recognised phrases
      phrase.split(/\s+/).forEach((w) => covered.add(w));
    }
  }

  for (const t of tokens(jobText)) {
    const word = t.replace(/[./-]+$/, "");
    if (word.length < 2 || STOPWORDS.has(word) || covered.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  // Strong signals: repeated words, recognised phrases and tech tokens like c++, c#, node.js.
  const isStrong = ([term, n]: [string, number]) => n >= 2 || KNOWN_PHRASES.includes(term) || /[+#.]/.test(term);
  const strong = ranked.filter(isStrong);
  // Short job ads repeat little, so top up with single mentions.
  const picked = strong.length >= 10 ? strong : [...strong, ...ranked.filter((e) => !isStrong(e))];
  return picked.slice(0, limit).map(([term, count]) => ({ term, count }));
}

const BULLET_RE = /^[-•*●▪◦·–]\s*/;

/** Achievement lines: marked bullets when the resume uses them, otherwise sentence-length lines. */
function bulletLines(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const marked = lines.filter((l) => BULLET_RE.test(l));
  const source = marked.length >= 3 ? marked : lines.filter((l) => l.split(/\s+/).length >= 6 && !/@|\|/.test(l));
  return source.map((l) => l.replace(BULLET_RE, "")).filter((l) => l.length > 15);
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function analyzeResume(resumeText: string, jobText = ""): AtsResult {
  const text = resumeText.replace(/\r/g, "");
  const norm = normalize(text);
  const words = tokens(text).length;
  const issues: AtsIssue[] = [];

  // --- Sections ---
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{8,}\d)/.test(text);
  const sectionsFound: string[] = [];
  const sectionsMissing: string[] = [];
  for (const s of SECTIONS) {
    const found = s.name === "Contact details" ? hasEmail && hasPhone : s.re.test(text);
    (found ? sectionsFound : sectionsMissing).push(s.name);
  }
  const required = SECTIONS.filter((s) => s.required);
  const requiredFound = required.filter((s) => sectionsFound.includes(s.name)).length;
  const optionalFound = SECTIONS.filter((s) => !s.required && sectionsFound.includes(s.name)).length;
  const sections = clamp((requiredFound / required.length) * 80 + (optionalFound / 3) * 20);
  if (!hasEmail) issues.push({ severity: "high", message: "No email address found.", fix: "Add a professional email at the top so recruiters can reach you." });
  if (!hasPhone) issues.push({ severity: "medium", message: "No phone number found.", fix: "Add a phone number with country code, e.g. +91 98765 43210." });
  for (const s of required) {
    if (s.name !== "Contact details" && !sectionsFound.includes(s.name)) {
      issues.push({ severity: "high", message: `No “${s.name}” heading detected.`, fix: `Add a section titled “${s.name}”. ATS software looks for standard headings.` });
    }
  }

  // --- Impact language ---
  const bullets = bulletLines(text);
  const actionBullets = bullets.filter((b) => ACTION_VERBS.has(b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "")).length;
  const quantifiedBullets = bullets.filter((b) => /\d|%|₹|\$|lakh|crore/i.test(b)).length;
  const weakPhrases = WEAK_PHRASES.filter((p) => norm.includes(p));
  const bulletBase = Math.max(bullets.length, 1);
  const impact = clamp((actionBullets / bulletBase) * 50 + Math.min(quantifiedBullets / bulletBase / 0.5, 1) * 50 - weakPhrases.length * 8);
  if (bullets.length > 0 && quantifiedBullets / bulletBase < 0.3) {
    issues.push({ severity: "medium", message: `Only ${quantifiedBullets} of ${bullets.length} lines include a number.`, fix: "Quantify results: users, %, time saved, ₹ saved, team size. Aim for numbers in at least a third of your bullets." });
  }
  if (bullets.length > 0 && actionBullets / bulletBase < 0.4) {
    issues.push({ severity: "medium", message: "Few lines start with an action verb.", fix: "Start bullets with verbs like Built, Led, Reduced, Launched or Automated." });
  }
  if (weakPhrases.length > 0) {
    issues.push({ severity: "low", message: `Weak phrases found: ${weakPhrases.map((p) => `“${p}”`).join(", ")}.`, fix: "Replace them with what you achieved, e.g. “Responsible for testing” → “Tested 40+ releases, cutting bugs in production by 30%”." });
  }

  // --- Readability ---
  let readability = 100;
  if (words < 150) {
    readability -= 40;
    issues.push({ severity: "high", message: `Your resume is very short (${words} words).`, fix: "Most one-page resumes have 300–700 words. Add projects, internships or achievements." });
  } else if (words < 300) {
    readability -= 15;
    issues.push({ severity: "low", message: `Your resume is on the short side (${words} words).`, fix: "Add detail to experience and projects; 300–700 words fits one page." });
  } else if (words > 1100) {
    readability -= 20;
    issues.push({ severity: "medium", message: `Your resume is long (${words} words).`, fix: "Trim to the most relevant points. Recruiters skim; two pages is the usual maximum." });
  }
  const longLines = bullets.filter((b) => b.split(/\s+/).length > 35).length;
  if (longLines > 0) {
    readability -= Math.min(longLines * 8, 30);
    issues.push({ severity: "low", message: `${longLines} line(s) are over 35 words.`, fix: "Split long paragraphs into short bullets of one or two lines each." });
  }
  if (/[│┃║■◆★✓✔➤►]/.test(text)) {
    readability -= 10;
    issues.push({ severity: "low", message: "Decorative symbols or table characters found.", fix: "Some ATS software garbles special symbols. Use plain dashes or simple bullets." });
  }
  readability = clamp(readability);

  // --- Keywords ---
  let keywordScore: number | null = null;
  const keywords: KeywordHit[] = [];
  if (jobText.trim().length > 40) {
    const extracted = extractKeywords(jobText);
    const topCount = extracted[0]?.count ?? 1;
    for (const k of extracted) {
      keywords.push({ term: k.term, priority: k.count >= Math.max(2, topCount / 2) ? "high" : "medium", inResume: containsTerm(norm, k.term) });
    }
    if (keywords.length > 0) {
      const weight = (k: KeywordHit) => (k.priority === "high" ? 2 : 1);
      const total = keywords.reduce((s, k) => s + weight(k), 0);
      const hit = keywords.filter((k) => k.inResume).reduce((s, k) => s + weight(k), 0);
      keywordScore = clamp((hit / total) * 100);
      const missingHigh = keywords.filter((k) => !k.inResume && k.priority === "high").map((k) => k.term);
      if (missingHigh.length > 0) {
        issues.unshift({ severity: "high", message: `Important job keywords missing: ${missingHigh.slice(0, 6).join(", ")}.`, fix: "If you have these skills, add them in the exact wording of the job description — in Skills and in a relevant bullet." });
      }
    }
  }

  const overall =
    keywordScore === null
      ? clamp(sections * 0.35 + impact * 0.4 + readability * 0.25)
      : clamp(keywordScore * 0.35 + sections * 0.25 + impact * 0.25 + readability * 0.15);

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    overall,
    scores: { keywords: keywordScore, sections, impact, readability },
    keywords,
    sectionsFound,
    sectionsMissing,
    stats: { words, bullets: bullets.length, quantifiedBullets, actionBullets, weakPhrases },
    issues,
  };
}
