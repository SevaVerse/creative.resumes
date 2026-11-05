import type { JobRow } from "@/types/database";

// SEO helpers for the /jobs pages: crawlable category landing pages and
// schema.org JobPosting markup so listings are eligible for Google for Jobs.

export type FaqItem = { q: string; a: string };

export type JobCategory = {
  slug: string;
  /** Short label used in navigation and breadcrumbs. */
  label: string;
  /** Page <title> (the site template appends "| SecureCV"). */
  title: string;
  h1: string;
  description: string;
  intro: string;
  keywords: string[];
  faq: FaqItem[];
  match: (job: JobRow) => boolean;
};

const text = (j: JobRow) => `${j.title} ${j.organization} ${j.location ?? ""} ${j.employment_type ?? ""}`;
const hasTag = (tag: string) => (j: JobRow) => j.tags.includes(tag);
const inCity = (re: RegExp) => (j: JobRow) => re.test(j.location ?? "");

export const JOB_CATEGORIES: JobCategory[] = [
  {
    slug: "government",
    label: "Government jobs",
    title: "Government Jobs for Freshers — Latest Sarkari Naukri Vacancies",
    h1: "Government jobs for freshers",
    description:
      "Latest government jobs for freshers in India: central and state vacancies, PSU recruitment, banking, railways and defence notifications open to fresh graduates. Updated weekly.",
    intro:
      "Sarkari naukri openings that fresh graduates, diploma holders and 10th/12th pass candidates can apply for — collected from official recruitment feeds and refreshed every week. Always confirm eligibility and the last date in the official notification.",
    keywords: ["government jobs for freshers", "sarkari naukri", "govt jobs 2026", "PSU recruitment freshers", "latest government vacancies"],
    faq: [
      { q: "Can freshers apply for government jobs?", a: "Yes. Most government recruitments (SSC, UPSC, IBPS, RRB, state PSCs and PSUs) select through exams and do not require prior work experience — only the stated education and age limits." },
      { q: "Where are government vacancies announced first?", a: "On the official recruiting body's website and in the weekly Employment News. This page links to the official notice for every listing." },
      { q: "Do I have to pay to apply?", a: "Only the official application fee stated in the notification, paid on the official portal. Never pay an agent or a third-party site for a government job." },
    ],
    match: (j) => j.sector === "government",
  },
  {
    slug: "private",
    label: "Private jobs",
    title: "Private Jobs for Freshers — Entry-Level Openings at Companies in India",
    h1: "Private jobs for freshers",
    description:
      "Entry-level private sector jobs for freshers in India: graduate trainee, associate, junior developer and analyst roles from company career pages. Refreshed weekly.",
    intro:
      "Entry-level roles at private companies — graduate trainee programmes, associate and junior positions — pulled from public job APIs and company career pages. Senior roles are filtered out so every listing is fresher-friendly.",
    keywords: ["private jobs for freshers", "fresher jobs in India", "entry level jobs", "graduate trainee jobs", "jobs for freshers 2026"],
    faq: [
      { q: "What counts as a fresher job?", a: "A role open to candidates with 0–1 years of experience: trainee, intern, apprentice, junior or entry-level positions. Listings that ask for 3+ years or senior titles are excluded." },
      { q: "How often are these jobs updated?", a: "Every week. New listings are marked “New” and expired ones are removed automatically." },
    ],
    match: (j) => j.sector === "private",
  },
  {
    slug: "internships",
    label: "Internships",
    title: "Internships for Students & Freshers in India — Paid and Remote",
    h1: "Internships for students and freshers",
    description:
      "Latest internships in India for students and fresh graduates — engineering, data, business and government internships, including remote options. Updated every week.",
    intro:
      "Internships are the fastest way to get your first line of real experience on a resume. These openings come from company career pages and official programmes and are refreshed weekly.",
    keywords: ["internships for freshers", "internship in India", "remote internship", "paid internship", "summer internship 2026"],
    faq: [
      { q: "Can I get an internship after graduation?", a: "Yes. Many companies and government programmes accept recent graduates as interns, and internships often convert to full-time offers." },
      { q: "How should I list an internship on my resume?", a: "Put it under Experience with the organisation, dates and 2–3 bullet points describing what you built or improved, with numbers where possible." },
    ],
    match: hasTag("Internship"),
  },
  {
    slug: "apprenticeships",
    label: "Apprenticeships",
    title: "Apprenticeship Jobs for Freshers — Graduate, Diploma & ITI Apprentices",
    h1: "Apprenticeships for freshers",
    description:
      "Latest apprenticeship openings for graduates, diploma and ITI freshers in India, including PSU and NATS/NAPS apprentice recruitment. Updated weekly.",
    intro:
      "Apprenticeships pay a stipend while you train on the job, and many PSUs give preference to former apprentices in later recruitment. Register on the official NATS or Apprenticeship India portal before applying.",
    keywords: ["apprenticeship for freshers", "graduate apprentice", "diploma apprentice", "ITI apprentice", "NATS apprenticeship"],
    faq: [
      { q: "Who can apply for apprenticeships?", a: "Graduates and diploma holders apply through NATS; ITI and 10th/12th pass candidates apply through the Apprenticeship India (NAPS) portal. Eligibility is usually limited to recent pass-outs." },
      { q: "Do apprentices get paid?", a: "Yes. Apprentices receive a monthly stipend fixed by the government scheme or the employer." },
    ],
    match: hasTag("Apprenticeship"),
  },
  {
    slug: "trainee",
    label: "Trainee jobs",
    title: "Graduate & Management Trainee Jobs for Freshers",
    h1: "Trainee jobs for freshers",
    description:
      "Graduate trainee, engineering trainee and management trainee openings for freshers in India from PSUs and private companies. Refreshed every week.",
    intro:
      "Trainee programmes hire fresh graduates in batches and train them for a permanent role — a common entry route at PSUs, banks and large companies.",
    keywords: ["graduate trainee jobs", "management trainee", "engineering trainee", "GET recruitment", "trainee jobs for freshers"],
    faq: [
      { q: "What is a graduate engineer trainee (GET)?", a: "A GET is a fresh engineering graduate hired on a training period (usually 1 year) before being absorbed as an engineer. PSUs often recruit GETs through GATE scores." },
    ],
    match: hasTag("Trainee"),
  },
  {
    slug: "remote",
    label: "Remote jobs",
    title: "Remote Jobs for Freshers — Work From Home Entry-Level Roles",
    h1: "Remote jobs for freshers",
    description:
      "Entry-level remote and work-from-home jobs and internships for freshers in India. Verified links to company career pages, updated weekly.",
    intro:
      "Work-from-home roles open to freshers, from remote internships to junior positions. Legitimate employers never ask for a fee — be wary of any remote offer that does.",
    keywords: ["remote jobs for freshers", "work from home jobs freshers", "remote internship India", "wfh jobs freshers"],
    faq: [
      { q: "Are remote jobs for freshers genuine?", a: "Many are, but remote listings attract scams. Apply only on the company's own career page, and never pay for training, equipment or registration." },
    ],
    match: (j) => j.tags.includes("Remote") || /\bremote\b|work from home/i.test(text(j)),
  },
  {
    slug: "software-engineering",
    label: "Software & engineering",
    title: "Software Engineer & Developer Jobs for Freshers",
    h1: "Software and engineering jobs for freshers",
    description:
      "Fresher software engineer, developer, SDE-1 and engineering trainee jobs in India — from product companies, startups and PSUs. Updated weekly.",
    intro:
      "Entry-level roles for B.Tech, BE, BCA, MCA and diploma graduates: associate and junior developer jobs, SDE-1 openings and engineering trainee posts.",
    keywords: ["software engineer fresher jobs", "developer jobs for freshers", "SDE 1 jobs", "B.Tech fresher jobs", "IT jobs for freshers"],
    faq: [
      { q: "What should a fresher software engineer resume include?", a: "Education first, then projects with links, internships, technical skills grouped by category, and any competitive programming or hackathon results. Keep it to one page." },
    ],
    match: hasTag("Engineering"),
  },
  {
    slug: "data-analyst",
    label: "Data & analyst",
    title: "Data Analyst Jobs for Freshers — Entry-Level Data & Analytics Roles",
    h1: "Data analyst jobs for freshers",
    description:
      "Entry-level data analyst, business analyst and analytics jobs and internships for freshers in India. Refreshed every week.",
    intro:
      "Junior data, analytics and business analyst roles for fresh graduates. SQL, spreadsheets and one visualisation tool are the usual baseline skills.",
    keywords: ["data analyst fresher jobs", "business analyst fresher", "analytics jobs for freshers", "junior data analyst"],
    faq: [
      { q: "Can freshers get data analyst jobs?", a: "Yes. Many companies hire junior analysts straight out of college; a portfolio of 2–3 data projects with SQL and dashboards helps a lot." },
    ],
    match: hasTag("Data"),
  },
  {
    slug: "banking",
    label: "Bank jobs",
    title: "Bank Jobs for Freshers — PO, Clerk & Banking Vacancies",
    h1: "Bank jobs for freshers",
    description:
      "Latest bank jobs for freshers: IBPS, SBI and RBI PO, clerk and specialist officer vacancies plus private banking trainee roles. Updated weekly.",
    intro:
      "Banking recruitment for graduates — public sector bank exams (IBPS, SBI, RBI) and private bank trainee programmes. Exam notifications list exact eligibility and dates.",
    keywords: ["bank jobs for freshers", "IBPS PO", "SBI clerk", "RBI assistant", "bank recruitment 2026"],
    faq: [
      { q: "Which bank exams can freshers take?", a: "IBPS PO, IBPS Clerk, IBPS RRB, SBI PO, SBI Clerk and RBI Assistant/Grade B are all open to graduates without work experience." },
    ],
    match: hasTag("Banking"),
  },
  {
    slug: "railways",
    label: "Railway jobs",
    title: "Railway Jobs for Freshers — RRB & Indian Railways Recruitment",
    h1: "Railway jobs for freshers",
    description:
      "Latest Indian Railways and RRB recruitment for freshers: NTPC, Group D, ALP, JE and railway apprentice vacancies. Updated weekly.",
    intro:
      "Indian Railways is one of the largest recruiters of freshers. Openings are announced by the Railway Recruitment Boards (RRB/RRC) and listed here with links to the official notice.",
    keywords: ["railway jobs for freshers", "RRB recruitment", "RRB NTPC", "railway apprentice", "Group D railway"],
    faq: [
      { q: "Where do I apply for railway jobs?", a: "Only on the official RRB or RRC regional websites linked in the notification. Beware of fake railway recruitment sites." },
    ],
    match: hasTag("Railways"),
  },
  {
    slug: "defence",
    label: "Defence jobs",
    title: "Defence Jobs for Freshers — Army, Navy, Air Force & DRDO",
    h1: "Defence jobs for freshers",
    description:
      "Defence recruitment for freshers: Indian Army, Navy, Air Force, Agniveer, DRDO and defence PSU vacancies open to fresh candidates. Updated weekly.",
    intro:
      "Entry routes into the armed forces and defence research organisations — from Agniveer and technical entries to DRDO and defence PSU openings.",
    keywords: ["defence jobs for freshers", "Indian Army recruitment", "Navy recruitment", "Air Force jobs", "DRDO recruitment"],
    faq: [
      { q: "Can freshers join the Indian Army, Navy or Air Force?", a: "Yes. Entries such as Agniveer, NDA, CDS and technical graduate schemes are designed for candidates without prior work experience." },
    ],
    match: hasTag("Defence"),
  },
  {
    slug: "teaching",
    label: "Teaching jobs",
    title: "Teaching Jobs for Freshers — Teacher, TGT, PGT & Lecturer Vacancies",
    h1: "Teaching jobs for freshers",
    description:
      "Teaching jobs for freshers in India: TGT, PGT, primary teacher, lecturer and faculty vacancies in government and private schools and colleges.",
    intro:
      "Teacher and faculty openings for fresh B.Ed, M.Ed and postgraduate candidates, including Kendriya and Navodaya Vidyalaya recruitment.",
    keywords: ["teaching jobs for freshers", "TGT PGT vacancy", "teacher recruitment", "lecturer jobs freshers"],
    faq: [
      { q: "Do I need a TET to apply for teaching jobs?", a: "Most government school posts require CTET or a state TET plus B.Ed. Check the eligibility section of each notification." },
    ],
    match: hasTag("Teaching"),
  },
  {
    slug: "healthcare",
    label: "Healthcare jobs",
    title: "Healthcare Jobs for Freshers — Nursing, Pharmacy & Medical Vacancies",
    h1: "Healthcare jobs for freshers",
    description:
      "Entry-level healthcare jobs for freshers: staff nurse, pharmacist, lab technician and medical officer vacancies at AIIMS, NHM and hospitals.",
    intro:
      "Openings for fresh nursing, pharmacy, paramedical and medical graduates at government hospitals, health missions and private healthcare providers.",
    keywords: ["nursing jobs freshers", "pharmacist vacancy", "AIIMS recruitment", "NHM recruitment", "medical jobs for freshers"],
    faq: [
      { q: "Can fresh nursing graduates apply at AIIMS?", a: "Yes. AIIMS nursing officer recruitment (NORCET) is open to eligible B.Sc Nursing graduates, usually without experience requirements." },
    ],
    match: hasTag("Healthcare"),
  },
  {
    slug: "bangalore",
    label: "Bangalore",
    title: "Fresher Jobs in Bangalore (Bengaluru) — Entry-Level Openings",
    h1: "Fresher jobs in Bangalore",
    description: "Latest fresher and entry-level jobs and internships in Bangalore (Bengaluru), refreshed weekly.",
    intro: "Entry-level openings located in Bengaluru, India's largest tech hiring hub.",
    keywords: ["fresher jobs in Bangalore", "jobs in Bengaluru for freshers", "Bangalore internships"],
    faq: [],
    match: inCity(/bengaluru|bangalore/i),
  },
  {
    slug: "hyderabad",
    label: "Hyderabad",
    title: "Fresher Jobs in Hyderabad — Entry-Level Openings",
    h1: "Fresher jobs in Hyderabad",
    description: "Latest fresher and entry-level jobs and internships in Hyderabad, refreshed weekly.",
    intro: "Entry-level openings located in Hyderabad.",
    keywords: ["fresher jobs in Hyderabad", "Hyderabad jobs for freshers"],
    faq: [],
    match: inCity(/hyderabad/i),
  },
  {
    slug: "pune",
    label: "Pune",
    title: "Fresher Jobs in Pune — Entry-Level Openings",
    h1: "Fresher jobs in Pune",
    description: "Latest fresher and entry-level jobs and internships in Pune, refreshed weekly.",
    intro: "Entry-level openings located in Pune.",
    keywords: ["fresher jobs in Pune", "Pune jobs for freshers"],
    faq: [],
    match: inCity(/pune/i),
  },
  {
    slug: "chennai",
    label: "Chennai",
    title: "Fresher Jobs in Chennai — Entry-Level Openings",
    h1: "Fresher jobs in Chennai",
    description: "Latest fresher and entry-level jobs and internships in Chennai, refreshed weekly.",
    intro: "Entry-level openings located in Chennai.",
    keywords: ["fresher jobs in Chennai", "Chennai jobs for freshers"],
    faq: [],
    match: inCity(/chennai/i),
  },
  {
    slug: "mumbai",
    label: "Mumbai",
    title: "Fresher Jobs in Mumbai — Entry-Level Openings",
    h1: "Fresher jobs in Mumbai",
    description: "Latest fresher and entry-level jobs and internships in Mumbai, refreshed weekly.",
    intro: "Entry-level openings located in Mumbai.",
    keywords: ["fresher jobs in Mumbai", "Mumbai jobs for freshers"],
    faq: [],
    match: inCity(/mumbai|navi mumbai|thane/i),
  },
  {
    slug: "delhi-ncr",
    label: "Delhi NCR",
    title: "Fresher Jobs in Delhi NCR — Delhi, Noida & Gurgaon",
    h1: "Fresher jobs in Delhi NCR",
    description: "Latest fresher and entry-level jobs and internships in Delhi, Noida, Gurgaon (Gurugram) and the NCR, refreshed weekly.",
    intro: "Entry-level openings across Delhi, Noida, Gurugram and the wider National Capital Region.",
    keywords: ["fresher jobs in Delhi", "jobs in Noida for freshers", "Gurgaon fresher jobs", "Delhi NCR jobs"],
    faq: [],
    match: inCity(/delhi|ncr|noida|gurgaon|gurugram|ghaziabad|faridabad/i),
  },
];

export function getJobCategory(slug: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((c) => c.slug === slug);
}

export function jobDetailPath(id: string): string {
  return `/jobs/listing/${id}/`;
}

/** "November 2026" in IST, for fresh-looking titles. */
export function monthYear(date = new Date()): string {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

export function faqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbJsonLd(baseUrl: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${baseUrl}${it.path}` })),
  };
}

export function itemListJsonLd(baseUrl: string, jobs: JobRow[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 50).map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}${jobDetailPath(j.id)}`,
      name: `${j.title} — ${j.organization}`,
    })),
  };
}

function schemaEmploymentType(job: JobRow): string[] {
  const t = `${job.employment_type ?? ""} ${job.title}`.toLowerCase();
  const types = new Set<string>();
  if (/intern|apprentice|trainee/.test(t)) types.add("INTERN");
  if (/full[\s-]?time|permanent/.test(t)) types.add("FULL_TIME");
  if (/part[\s-]?time/.test(t)) types.add("PART_TIME");
  if (/contract|temporary|fixed[\s-]?term/.test(t)) types.add(/temporary/.test(t) ? "TEMPORARY" : "CONTRACTOR");
  if (types.size === 0) types.add("FULL_TIME");
  return [...types];
}

const DAY_MS = 86_400_000;

/** Listing expiry: the stated last date, otherwise when the weekly refresh would prune it. */
export function jobValidThrough(job: JobRow, retentionDays = 28): string {
  if (job.last_date) return job.last_date;
  return new Date(new Date(job.last_seen_at).getTime() + retentionDays * DAY_MS).toISOString();
}

export function jobDescription(job: JobRow): string {
  const sector = job.sector === "government" ? "government" : "private sector";
  const parts = [
    `${job.organization} is hiring for the ${sector} role of ${job.title}${job.location ? ` in ${job.location}` : ""}.`,
    "This opening is listed as suitable for freshers and entry-level candidates.",
    job.summary ?? "",
    job.last_date ? `Last date to apply: ${job.last_date.slice(0, 10)}.` : "",
    "Read the full details and apply on the official website.",
  ];
  return parts.filter(Boolean).join(" ");
}

/** schema.org JobPosting for Google for Jobs. Only used on the job's own detail page. */
export function jobPostingJsonLd(job: JobRow, baseUrl: string) {
  const location = job.location ?? "";
  const isRemote = /\bremote\b|work from home|\bwfh\b/i.test(`${location} ${job.title}`);
  const onsite = location && !/^remote$/i.test(location.trim());
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${escapeHtml(jobDescription(job))}</p>`,
    datePosted: job.posted_at ?? job.first_seen_at,
    validThrough: jobValidThrough(job),
    employmentType: schemaEmploymentType(job),
    hiringOrganization: { "@type": "Organization", name: job.organization },
    identifier: { "@type": "PropertyValue", name: "SecureCV", value: job.id },
    url: `${baseUrl}${jobDetailPath(job.id)}`,
    directApply: false,
    experienceRequirements: { "@type": "OccupationalExperienceRequirements", monthsOfExperience: 0 },
    ...(isRemote
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "India" } }
      : {}),
    ...(onsite || !isRemote
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              ...(onsite ? { addressLocality: location } : {}),
              addressCountry: "IN",
            },
          },
        }
      : {}),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Safe JSON for inline <script type="application/ld+json"> (prevents </script> breakout). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
