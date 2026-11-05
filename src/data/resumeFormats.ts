import type { TemplateId } from "@/types/resume";

// Content for /resume-format/<slug>/: India-specific resume format guides. Each page has its own
// section order, sample, mistakes and FAQ so the pages answer different searches.

export type ResumeFormat = {
  slug: string;
  /** <title> (the site template appends "| SecureCV"). */
  title: string;
  h1: string;
  description: string;
  intro: string;
  /** Recommended section order with what to write in each. */
  sections: { name: string; what: string }[];
  /** Short plain-text sample of the key part of the resume. */
  sample: string;
  mistakes: string[];
  template: TemplateId;
  faq: { q: string; a: string }[];
  keywords: string[];
};

export const RESUME_FORMATS: ResumeFormat[] = [
  {
    slug: "fresher",
    title: "Resume Format for Freshers (2026) — Free Template & Example",
    h1: "Resume format for freshers",
    description: "The resume format Indian recruiters expect from freshers: section order, what to write in each, a sample and common mistakes. Free template, PDF download, no sign-up.",
    intro: "As a fresher, your resume has one job: prove you can learn and deliver without years of experience. That means education and projects go first, every line shows something you did, and the whole thing fits on one page.",
    sections: [
      { name: "Header", what: "Name, phone, a professional email, city, and LinkedIn or GitHub. No photo unless the job asks for one." },
      { name: "Career objective (2 lines)", what: "The role you want and what you bring — e.g. “Final-year B.Com student seeking an accounts trainee role; strong in Tally and GST filing.”" },
      { name: "Education", what: "Degree, college, years and CGPA/percentage; then Class XII and Class X with board, year and marks." },
      { name: "Projects", what: "Two or three projects, each with what you built, the tools used and one number (users, accuracy, time saved)." },
      { name: "Internships / training", what: "Organisation, dates and two bullets on what you did. Industrial training and NSS/NCC leadership count." },
      { name: "Skills", what: "Only skills you can be interviewed on, grouped (e.g. Languages, Tools). Add typing speed for clerical roles." },
      { name: "Certifications & achievements", what: "Online courses, hackathons, ranks and scholarships, with the year." },
    ],
    sample: `EDUCATION
B.Tech, Computer Science — ABC Institute of Technology, 2022–2026 · CGPA 8.4/10
Class XII (CBSE) — 92% · 2022   |   Class X (CBSE) — 94% · 2020

PROJECTS
Campus Placement Portal — Next.js, PostgreSQL
• Built a drive-registration portal used by 500+ students in two placement seasons
• Cut manual spreadsheet work for the placement cell by about 10 hours a week`,
    mistakes: [
      "Writing an objective that says nothing (“seeking a challenging position in a reputed organisation”).",
      "Listing every subject studied instead of two or three real projects.",
      "Two pages for a fresher — keep it to one.",
      "Including father's name, date of birth and religion when the job did not ask for them.",
      "Using a heavily designed template for an online portal; ATS software may misread columns and icons.",
    ],
    template: "campus",
    faq: [
      { q: "Which resume format is best for freshers?", a: "Reverse-chronological, one page, with education and projects at the top. Recruiters scan for your degree, marks and what you have built." },
      { q: "Should a fresher write a career objective or a summary?", a: "A two-line objective naming the role and your strongest skill works well. Skip it if it would be generic." },
      { q: "How do I make a resume with no experience?", a: "Replace experience with projects, internships, industrial training, college societies and certifications. Each still gets bullets with results." },
    ],
    keywords: ["resume format for freshers", "fresher resume format", "resume for freshers", "fresher resume pdf", "first job resume"],
  },
  {
    slug: "engineering-fresher",
    title: "B.Tech / B.E. Fresher Resume Format — Engineering Template & Example",
    h1: "Resume format for B.Tech and B.E. freshers",
    description: "Engineering fresher resume format for B.Tech and B.E. students: technical skills, projects, internships and placement tips, with a sample. Free ATS-friendly template.",
    intro: "Campus placements and off-campus drives for engineers are filtered first by CGPA and skills, then by projects. An engineering fresher resume should make your branch, tech stack and two strongest projects visible in the top half of the page.",
    sections: [
      { name: "Header", what: "Name, phone, email, GitHub and LinkedIn. A portfolio or deployed project link is a strong signal." },
      { name: "Technical skills", what: "Grouped: Languages (Java, Python), Web/Frameworks, Databases, Tools (Git, Docker). Keep only what you can code in an interview." },
      { name: "Education", what: "B.Tech/B.E. branch, college, years, CGPA; Class XII and X marks. Add JEE or GATE rank only if it is strong." },
      { name: "Projects", what: "Two or three, each with the stack, your role in a team project, and a measurable result or scale." },
      { name: "Internships", what: "Company, role, dates, and what you shipped. Research internships and summer training count." },
      { name: "Achievements", what: "Hackathons, competitive programming ratings (Codeforces, LeetCode), papers and certifications." },
    ],
    sample: `TECHNICAL SKILLS
Languages: Java, Python, C++  ·  Web: React, Node.js, Spring Boot  ·  Data: SQL, MongoDB  ·  Tools: Git, Docker, AWS

PROJECTS
Smart Attendance System — Python, OpenCV, Flask
• Face-recognition attendance for 3 classrooms; 96% accuracy on 120 students
• Reduced roll-call time from 10 minutes to under 1 minute per lecture`,
    mistakes: [
      "Listing 20 technologies after one tutorial each — interviewers will ask about all of them.",
      "Describing projects by the syllabus topic rather than what you built and how well it worked.",
      "Leaving out GitHub links for code you are proud of.",
      "Hiding a good CGPA at the bottom or a weak one in a big font at the top — keep education in its standard place.",
    ],
    template: "developer",
    faq: [
      { q: "Should I mention my CGPA if it is low?", a: "Most campus drives have a cut-off and ask anyway, so include it. Put projects and skills first so they carry the page." },
      { q: "How many projects should an engineering fresher list?", a: "Two or three good ones beat six thin ones. Pick projects with a clear result or real users." },
      { q: "Is the same resume fine for service and product companies?", a: "Mostly, but reorder: service companies value CGPA and breadth; product companies look harder at projects, DSA and GitHub." },
    ],
    keywords: ["B.Tech fresher resume", "engineering fresher resume format", "BE fresher resume", "computer science fresher resume", "resume for campus placement"],
  },
  {
    slug: "bcom-fresher",
    title: "B.Com Fresher Resume Format — Accounts & Finance Template",
    h1: "Resume format for B.Com freshers",
    description: "B.Com fresher resume format for accounts, finance, banking and audit roles: Tally, GST and Excel skills, articleship and internships, with a sample. Free template.",
    intro: "Accounts and finance recruiters look for accuracy and practical tools: Tally, GST returns, Excel and, increasingly, basic data skills. A B.Com resume should show you have used them, not just studied them.",
    sections: [
      { name: "Header", what: "Name, phone, email, city. LinkedIn is useful for finance roles." },
      { name: "Career objective", what: "Target role (accounts executive, audit assistant, banking) and your strongest tool or certification." },
      { name: "Education", what: "B.Com (specialisation), college, year and percentage; Class XII (Commerce) and Class X. CA/CMA/CS levels cleared, if any." },
      { name: "Skills", what: "Tally Prime, GST filing, TDS basics, MS Excel (VLOOKUP, pivot tables), bank reconciliation, typing speed." },
      { name: "Internships / articleship", what: "Firm, dates and the work you handled: vouchers, reconciliations, GST returns filed, audits assisted." },
      { name: "Certifications", what: "Tally, NISM, GST practitioner or Excel courses, with the year." },
    ],
    sample: `SKILLS
Tally Prime · GST returns (GSTR-1, 3B) · TDS basics · Bank reconciliation · MS Excel (pivot tables, VLOOKUP) · 40 wpm typing

INTERNSHIP
Accounts Intern — Sharma & Co. Chartered Accountants, May–Jul 2025
• Recorded 600+ vouchers in Tally and reconciled 3 client bank accounts monthly
• Prepared GSTR-1 data for 8 small-business clients ahead of filing deadlines`,
    mistakes: [
      "Writing “knowledge of accounting” instead of naming the tools and returns you have actually handled.",
      "Skipping Excel — almost every finance role tests it.",
      "Leaving out articleship or internship work because it felt routine; volume and accuracy are achievements here.",
    ],
    template: "atsclassic",
    faq: [
      { q: "What skills should a B.Com fresher put on a resume?", a: "Tally, GST and TDS basics, Excel, bank reconciliation and communication. Add certifications that prove them." },
      { q: "Should I mention CA Inter or CMA levels?", a: "Yes — list levels cleared with the attempt year. They signal discipline even for non-CA roles." },
      { q: "Which template suits finance roles?", a: "A plain, single-column layout such as ATS Classic or Minimalist. Finance recruiters prefer conservative formatting." },
    ],
    keywords: ["B.Com fresher resume", "BCom fresher resume format", "accounts fresher resume", "commerce fresher resume", "Tally resume"],
  },
  {
    slug: "government-job",
    title: "Resume Format for Government Jobs in India — Template & Tips",
    h1: "Resume format for government jobs",
    description: "How to format a resume for government jobs, PSUs and contractual posts in India: what details to include, declaration, document checklist and a sample. Free template.",
    intro: "Most government recruitments use an online application form, but many posts still ask for a resume or bio-data: contractual and consultant roles, PSU lateral hiring, project positions in institutes, and document verification. These readers check eligibility line by line, so clarity beats design.",
    sections: [
      { name: "Header", what: "Full name exactly as in your certificates, phone, email and correspondence address." },
      { name: "Personal details (if asked)", what: "Date of birth, category, nationality and languages known. Include only what the notification requires." },
      { name: "Educational qualifications", what: "A clear list (or table) of each qualification with board/university, year, subjects and percentage or CGPA." },
      { name: "Experience", what: "Post, organisation, pay level or scale (for government service), dates and duties — with exact dates, as eligibility often depends on them." },
      { name: "Skills & certifications", what: "Computer certificates (CCC, O-Level), typing or shorthand speed, and language skills." },
      { name: "Declaration", what: "A one-line declaration that the information is true, with place, date and signature." },
    ],
    sample: `EDUCATIONAL QUALIFICATIONS
B.A. (Economics) — University of Delhi, 2025 — 72.4%
Class XII (CBSE, Humanities) — 2022 — 85.0%
Class X (CBSE) — 2020 — 88.6%

DECLARATION
I hereby declare that the information given above is true to the best of my knowledge and belief.
Place: New Delhi        Date: 05/11/2026        (Signature)`,
    mistakes: [
      "Name spelt differently from the certificates — it causes trouble at document verification.",
      "Rounded or missing dates for experience when the post has an experience cut-off.",
      "Decorative layouts and colours; reviewers prefer a plain, printable page.",
      "Paying an agent to “prepare” an application — only pay the official fee on the official portal.",
    ],
    template: "atsclassic",
    faq: [
      { q: "Do government jobs need a resume?", a: "Exam-based recruitments use an online form. Contractual, consultant, project and lateral PSU posts often ask for a resume or bio-data with the application." },
      { q: "Should I add a photo?", a: "Only if the notification asks for one. Online forms collect the photo separately." },
      { q: "Is a declaration necessary?", a: "It is customary on Indian government applications and costs one line, so include it when applying to government bodies." },
    ],
    keywords: ["resume format for government job", "government job resume", "resume for govt job India", "PSU resume format", "sarkari naukri resume"],
  },
  {
    slug: "biodata",
    title: "Biodata Format for Job — Free Template (and When to Use a Resume)",
    h1: "Biodata format for a job",
    description: "Biodata format for job applications in India: what personal details to include, how it differs from a resume and CV, a sample and a free template you can download as PDF.",
    intro: "In India “biodata” usually means a short document focused on personal details, still requested by some small businesses, schools, local offices and government contractual posts. Corporate jobs expect a resume instead. Use biodata only when it is asked for, and keep it factual.",
    sections: [
      { name: "Personal details", what: "Name, date of birth, gender, nationality, languages known, address and contact. Father's name and marital status only if requested." },
      { name: "Educational qualifications", what: "Each qualification with board/university, year and marks." },
      { name: "Work experience", what: "Organisation, designation and dates, most recent first." },
      { name: "Skills", what: "Computer skills, typing speed, driving licence, languages — whatever the job needs." },
      { name: "Declaration", what: "One line confirming the details are true, with place, date and signature." },
    ],
    sample: `PERSONAL DETAILS
Name: Ravi Kumar           Date of birth: 14/08/2003
Nationality: Indian        Languages: Hindi, English, Telugu
Address: 12-3, Main Road, Warangal, Telangana 506002
Phone: +91 9XXXX XXXXX     Email: ravi.kumar@example.com

EDUCATIONAL QUALIFICATIONS
Diploma in Mechanical Engineering — SBTET Telangana, 2024 — 78%`,
    mistakes: [
      "Sending a biodata for a corporate or IT job — use a resume there.",
      "Adding religion, caste, height or other sensitive details nobody asked for.",
      "Out-of-date contact details or a casual email address.",
    ],
    template: "minimalist",
    faq: [
      { q: "What is the difference between a biodata, resume and CV?", a: "A biodata focuses on personal details and is used mainly in India for some local and government posts. A resume is a one-to-two page summary of skills and experience for most jobs. A CV is a longer, complete academic and professional record, used for research and academia." },
      { q: "Can I make a biodata with SecureCV?", a: "Yes. Pick the Minimalist or ATS Classic template, put personal details in the summary section and education and experience in their sections, then download the PDF." },
      { q: "Should a biodata include a photo?", a: "Only if requested. Many biodata formats include a passport-size photo, so templates with photo support are available." },
    ],
    keywords: ["biodata format for job", "biodata for job", "job biodata format", "biodata vs resume", "simple biodata format"],
  },
  {
    slug: "internship",
    title: "Resume Format for Internship — Student Template & Example",
    h1: "Resume format for an internship",
    description: "How to write an internship resume as a student: what to include with no work experience, a sample, mistakes to avoid and a free one-page template.",
    intro: "Internship recruiters know you are still studying. They are looking for curiosity, coursework applied to real problems and the ability to finish what you start. A one-page resume with projects, relevant courses and activities does that.",
    sections: [
      { name: "Header", what: "Name, phone, college email or personal email, LinkedIn/GitHub/portfolio." },
      { name: "Objective", what: "The internship you want and the dates you are available — recruiters filter on availability." },
      { name: "Education", what: "Current degree, year of study and CGPA; relevant coursework in one line." },
      { name: "Projects", what: "Course, personal or hackathon projects with tools and an outcome." },
      { name: "Activities & leadership", what: "Clubs, fests, NSS/NCC, volunteering — with what you organised or led, and scale." },
      { name: "Skills", what: "Tools and languages you have used in those projects and activities." },
    ],
    sample: `OBJECTIVE
Second-year BBA student seeking a 2-month marketing internship (May–June 2026).

ACTIVITIES
Marketing Head — Annual College Fest, 2025
• Ran Instagram campaign that grew followers from 1.2k to 4.8k in six weeks
• Secured ₹1.5 lakh in sponsorship from 6 local businesses`,
    mistakes: [
      "Not stating availability dates.",
      "Leaving out college activities, which are often the best evidence of initiative at this stage.",
      "Sending the same resume for a coding and a marketing internship — reorder projects and skills for each.",
    ],
    template: "nordic",
    faq: [
      { q: "What should I put on an internship resume with no experience?", a: "Projects, relevant coursework, college activities, volunteering and certifications. Each gets one or two bullets about what you did." },
      { q: "How long should an internship resume be?", a: "One page." },
      { q: "Do I need a cover letter for an internship?", a: "Not always, but a short message on why that company and that role noticeably improves response rates." },
    ],
    keywords: ["resume format for internship", "internship resume", "student resume for internship", "internship resume with no experience", "college student resume"],
  },
];

export function getResumeFormat(slug: string): ResumeFormat | undefined {
  return RESUME_FORMATS.find((f) => f.slug === slug);
}
