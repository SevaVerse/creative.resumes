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
/** Eligibility is usually stated in the title or summary ("10th pass", "ITI", "any graduate"). */
const needsQualification = (re: RegExp) => (j: JobRow) => re.test(`${j.title} ${j.summary ?? ""}`);

export const JOB_CATEGORIES: JobCategory[] = [
  {
    slug: "government",
    label: "Government jobs",
    title: "Government Jobs for Freshers — Latest Sarkari Naukri Vacancies",
    h1: "Government jobs for freshers",
    description:
      "Latest government jobs for freshers in India: central and state vacancies, PSU recruitment, banking, railways and defence notifications open to fresh graduates. Updated monthly.",
    intro:
      "Sarkari naukri openings that fresh graduates, diploma holders and 10th/12th pass candidates can apply for — collected from official recruitment feeds and refreshed every month. Always confirm eligibility and the last date in the official notification.",
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
      "Entry-level private sector jobs for freshers in India: graduate trainee, associate, junior developer and analyst roles from company career pages. Refreshed monthly.",
    intro:
      "Entry-level roles at private companies — graduate trainee programmes, associate and junior positions — pulled from public job APIs and company career pages. Senior roles are filtered out so every listing is fresher-friendly.",
    keywords: ["private jobs for freshers", "fresher jobs in India", "entry level jobs", "graduate trainee jobs", "jobs for freshers 2026"],
    faq: [
      { q: "What counts as a fresher job?", a: "A role open to candidates with 0–1 years of experience: trainee, intern, apprentice, junior or entry-level positions. Listings that ask for 3+ years or senior titles are excluded." },
      { q: "How often are these jobs updated?", a: "Every month. New listings are marked “New” and expired ones are removed automatically." },
    ],
    match: (j) => j.sector === "private",
  },
  {
    slug: "internships",
    label: "Internships",
    title: "Internships for Students & Freshers in India — Paid and Remote",
    h1: "Internships for students and freshers",
    description:
      "Latest internships in India for students and fresh graduates — engineering, data, business and government internships, including remote options. Updated every month.",
    intro:
      "Internships are the fastest way to get your first line of real experience on a resume. These openings come from company career pages and official programmes and are refreshed monthly.",
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
      "Latest apprenticeship openings for graduates, diploma and ITI freshers in India, including PSU and NATS/NAPS apprentice recruitment. Updated monthly.",
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
      "Graduate trainee, engineering trainee and management trainee openings for freshers in India from PSUs and private companies. Refreshed every month.",
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
      "Entry-level remote and work-from-home jobs and internships for freshers in India. Verified links to company career pages, updated monthly.",
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
      "Fresher software engineer, developer, SDE-1 and engineering trainee jobs in India — from product companies, startups and PSUs. Updated monthly.",
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
      "Entry-level data analyst, business analyst and analytics jobs and internships for freshers in India. Refreshed every month.",
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
      "Latest bank jobs for freshers: IBPS, SBI and RBI PO, clerk and specialist officer vacancies plus private banking trainee roles. Updated monthly.",
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
      "Latest Indian Railways and RRB recruitment for freshers: NTPC, Group D, ALP, JE and railway apprentice vacancies. Updated monthly.",
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
      "Defence recruitment for freshers: Indian Army, Navy, Air Force, Agniveer, DRDO and defence PSU vacancies open to fresh candidates. Updated monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Bangalore (Bengaluru), refreshed monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Hyderabad, refreshed monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Pune, refreshed monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Chennai, refreshed monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Mumbai, refreshed monthly.",
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
    description: "Latest fresher and entry-level jobs and internships in Delhi, Noida, Gurgaon (Gurugram) and the NCR, refreshed monthly.",
    intro: "Entry-level openings across Delhi, Noida, Gurugram and the wider National Capital Region.",
    keywords: ["fresher jobs in Delhi", "jobs in Noida for freshers", "Gurgaon fresher jobs", "Delhi NCR jobs"],
    faq: [],
    match: inCity(/delhi|ncr|noida|gurgaon|gurugram|ghaziabad|faridabad/i),
  },
  // Eligibility-based pages: how most people search for government jobs. Bare "SSC" is avoided
  // because it usually means the Staff Selection Commission, not the Class X exam.
  {
    slug: "10th-pass",
    label: "10th pass jobs",
    title: "10th Pass Jobs — Latest Govt & Private Vacancies for Matric Pass",
    h1: "Jobs for 10th pass candidates",
    description: "Latest 10th pass (matriculation / SSLC) government and private jobs: MTS, peon, constable, apprentice and helper vacancies. Refreshed monthly with official links.",
    intro: "Openings where Class 10 (matriculation, SSLC) is the stated minimum qualification. Always confirm age limits, physical standards and the last date in the official notification.",
    keywords: ["10th pass jobs", "10th pass govt jobs", "matric pass jobs", "SSLC jobs", "MTS jobs"],
    faq: [
      { q: "Which government jobs can I get after 10th?", a: "Multi-tasking staff (MTS), constable, railway Group D/Level 1, postal Gramin Dak Sevak and many apprenticeships accept Class 10 as the minimum. Each notification lists the exact eligibility." },
      { q: "Do I need a resume for a 10th pass job?", a: "Government exams use an online form instead. For private jobs and apprenticeships, a simple one-page resume with your marks, skills and any training helps you stand out." },
    ],
    match: needsQualification(/\b10th\b|\bmatric(ulation)?\b|\bsslc\b|\bclass\s*(x|10)\b/i),
  },
  {
    slug: "12th-pass",
    label: "12th pass jobs",
    title: "12th Pass Jobs — Latest Govt & Private Vacancies After 12th",
    h1: "Jobs for 12th pass candidates",
    description: "Latest 12th pass (10+2 / HSC) government and private jobs: clerk, data entry, constable, stenographer and trainee openings. Refreshed monthly with official links.",
    intro: "Openings where Class 12 (10+2, HSC, higher secondary) is the stated minimum qualification, from official recruitment feeds and company career pages.",
    keywords: ["12th pass jobs", "12th pass govt jobs", "jobs after 12th", "10+2 jobs", "HSC pass jobs"],
    faq: [
      { q: "Which government jobs can I get after 12th?", a: "SSC CHSL (clerk, data entry operator), state police constable, stenographer, railway non-technical posts and defence entries such as Agniveer accept 10+2. Check each notice for age and subject requirements." },
      { q: "Can I get a private job after 12th?", a: "Yes — customer support, sales, data entry and retail roles often accept 12th pass candidates, and many offer training. A short resume that highlights communication and computer skills helps." },
    ],
    match: needsQualification(/\b12th\b|\bhsc\b|\bclass\s*(xii|12)\b|higher secondary|10\s*\+\s*2/i),
  },
  {
    slug: "iti",
    label: "ITI jobs",
    title: "ITI Jobs — Latest Apprentice & Technician Vacancies for ITI Pass",
    h1: "Jobs for ITI pass candidates",
    description: "Latest ITI jobs and apprenticeships for electricians, fitters, welders, mechanics and other NCVT/SCVT trades in government and private companies. Refreshed monthly.",
    intro: "Openings that ask for an ITI certificate (NCVT or SCVT) — apprenticeships, technician and operator roles in PSUs, railways and manufacturing.",
    keywords: ["ITI jobs", "ITI apprentice", "ITI pass govt jobs", "NCVT jobs", "fitter electrician jobs"],
    faq: [
      { q: "Which trades are most in demand?", a: "Electrician, fitter, welder, mechanic (motor vehicle and diesel), COPA and machinist trades appear most often in PSU and railway apprenticeship notices." },
      { q: "Is an apprenticeship worth it after ITI?", a: "Usually yes: it pays a stipend, adds a National Apprenticeship Certificate to your resume, and some employers reserve permanent posts for their former apprentices." },
    ],
    match: needsQualification(/\biti\b|industrial training institute|\bncvt\b|\bscvt\b/i),
  },
  {
    slug: "diploma",
    label: "Diploma jobs",
    title: "Diploma Jobs — Latest Jobs for Polytechnic Diploma Holders",
    h1: "Jobs for diploma holders",
    description: "Latest jobs for diploma and polytechnic holders: junior engineer, technician, supervisor and apprentice roles in government and private sectors. Refreshed monthly.",
    intro: "Openings that ask for a diploma (usually a three-year polytechnic diploma in engineering) — junior engineer, technician and supervisor roles.",
    keywords: ["diploma jobs", "polytechnic jobs", "junior engineer jobs", "diploma engineer fresher jobs", "diploma apprentice"],
    faq: [
      { q: "Can diploma holders apply for junior engineer posts?", a: "Yes. SSC JE, railway JE and many state JE recruitments accept a diploma in the relevant engineering branch." },
      { q: "What should a diploma holder put on a resume?", a: "Your branch and percentage, your final-year project, any industrial training or apprenticeship, and the tools and machines you have used." },
    ],
    match: needsQualification(/\bdiploma\b|\bpolytechnic\b/i),
  },
  {
    slug: "graduate",
    label: "Graduate jobs",
    title: "Jobs for Graduates — Any Graduate Fresher Vacancies (Govt & Private)",
    h1: "Jobs for graduates",
    description: "Latest jobs open to fresh graduates — any graduate, B.Tech, B.Com, B.Sc, BCA and BBA — in government and private sectors. Refreshed monthly.",
    intro: "Openings that ask for a bachelor's degree, including “any graduate” government posts, graduate trainee programmes and entry-level private roles.",
    keywords: ["jobs for graduates", "any graduate jobs", "graduate fresher jobs", "B.Com fresher jobs", "BCA fresher jobs"],
    faq: [
      { q: "Which government jobs are open to any graduate?", a: "SSC CGL, bank PO and clerk exams (IBPS, SBI), UPSC civil services and many state PSC posts accept a degree in any subject." },
      { q: "How should a fresh graduate format a resume?", a: "Lead with your degree, then projects and internships, then skills. Keep it to one page — see our fresher resume format guide." },
    ],
    match: needsQualification(/\bany graduate\b|\bgraduat(e|es|ion)\b|\bb\.?\s?tech\b|\bb\.?\s?sc\b|\bb\.?\s?com\b|\bbca\b|\bbba\b|\bbachelor'?s?\b/i),
  },
];

export function getJobCategory(slug: string): JobCategory | undefined {
  return JOB_CATEGORIES.find((c) => c.slug === slug);
}

export function jobDetailPath(id: string): string {
  return `/jobs/listing/${id}/`;
}

// Sources whose apply URL goes through a job-board redirect rather than the employer's own page.
const AGGREGATOR_SOURCES = new Set(["Adzuna"]);

/** Apply-button label that doesn't claim an employer site when the link goes via an aggregator. */
export function applyLinkLabel(job: Pick<JobRow, "source">): string {
  return AGGREGATOR_SOURCES.has(job.source) ? `View & apply via ${job.source}` : "View & apply on official site";
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

/**
 * Listing expiry: the stated last date, otherwise the next monthly refresh (1st of the
 * month, see vercel.json), which prunes listings the sources no longer return.
 */
export function jobValidThrough(job: JobRow): string {
  if (job.last_date) return job.last_date;
  const seen = new Date(job.last_seen_at);
  return new Date(Date.UTC(seen.getUTCFullYear(), seen.getUTCMonth() + 1, 1, 2, 0, 0)).toISOString();
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
