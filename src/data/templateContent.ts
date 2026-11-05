import type { TemplateId } from "@/types/resume";

// Landing-page copy for /resume-templates/[id]. Each entry is written for the template's
// real audience so the pages are not interchangeable boilerplate.

export type TemplateContent = {
  /** Short phrase used in the <title>, e.g. "ATS-friendly resume template". */
  headline: string;
  intro: string;
  bestFor: string[];
  highlights: string[];
  tip: string;
  faq: { q: string; a: string }[];
};

export const TEMPLATE_CONTENT: Record<TemplateId, TemplateContent> = {
  campus: {
    headline: "Fresher resume template for students and recent graduates",
    intro:
      "Campus puts what freshers actually have — education, projects and internships — above work history. It follows the format campus placement cells and Indian recruiters expect: degree with CGPA, Class XII and Class X scores, then projects.",
    bestFor: ["Final-year B.Tech, BCA, BCom and BSc students", "Campus placements and off-campus drives", "First internship applications"],
    highlights: ["Education and projects first", "Single column that ATS software reads cleanly", "Low ink, prints well in black and white"],
    tip: "List two or three projects with a number in each line (users, accuracy, time saved). Recruiters skim freshers' resumes for evidence that you built something real.",
    faq: [
      { q: "What is the best resume format for freshers?", a: "A reverse-chronological, one-page resume that leads with education and projects. Campus follows that order, so your strongest material is at the top." },
      { q: "Should a fresher include Class X and XII marks?", a: "In India, yes — many recruiters and government forms ask for them. Campus has room for them under education without crowding the page." },
    ],
  },
  atsclassic: {
    headline: "ATS-friendly resume template (plain, parser-safe)",
    intro:
      "ATS Classic is deliberately plain: one column, standard section headings and no graphics, tables or icons. Applicant tracking systems such as Workday, Taleo and Greenhouse read it exactly as written.",
    bestFor: ["Large companies that screen with an ATS", "Government and PSU applications", "Anyone whose fancy resume gets no replies"],
    highlights: ["Standard headings (Experience, Education, Skills)", "No columns, tables or images to confuse parsers", "Lowest ink use of any template"],
    tip: "Mirror the exact wording of the job description for skills you really have. Run it through the free ATS checker to see which keywords are missing.",
    faq: [
      { q: "What makes a resume ATS-friendly?", a: "Plain text structure, standard headings, no text inside images, and the job description's keywords used naturally. ATS Classic handles the structure; the ATS checker helps with keywords." },
      { q: "Is a plain resume less likely to impress?", a: "Not for screened applications. The ATS reads it first, and recruiters spend seconds per resume, so clarity beats decoration." },
    ],
  },
  modern: {
    headline: "Modern resume template with colour header and skill bars",
    intro:
      "Modern pairs a bold colour header with a two-column body and visual skill bars. It stands out in a stack of printed resumes and suits roles where presentation matters.",
    bestFor: ["Marketing, design and sales roles", "Startups and small companies", "Career fairs and printed handouts"],
    highlights: ["Colour header with optional photo", "Two-column layout with skill bars", "Clear visual hierarchy"],
    tip: "Two-column layouts can trip older ATS software. Use Modern when you are emailing a recruiter or handing it over in person; use ATS Classic for online portals.",
    faq: [
      { q: "Can I add a photo?", a: "Yes, Modern supports an optional photo. Leave it out for jobs in the US, UK and Canada, where photos are usually discouraged." },
      { q: "Is Modern ATS-friendly?", a: "Mostly, but two-column designs are riskier with older ATS software. Check it with the ATS checker or switch templates in one click." },
    ],
  },
  minimalist: {
    headline: "Minimalist resume template (clean, one column)",
    intro:
      "Minimalist is a single column of clean serif lines with generous spacing. Nothing competes with your content, which makes it a safe choice for conservative industries.",
    bestFor: ["Banking, finance and consulting", "Law and corporate roles", "Experienced professionals with a strong track record"],
    highlights: ["One column, easy to scan", "Serif typography that reads as formal", "ATS-safe structure"],
    tip: "With so little decoration, the first line of each job does the work. Start bullets with a verb and end them with a result.",
    faq: [
      { q: "Is a minimalist resume better?", a: "For most corporate roles, yes: recruiters find information faster and ATS software parses it reliably." },
      { q: "How long should it be?", a: "One page up to about ten years of experience, two pages beyond that." },
    ],
  },
  onyx: {
    headline: "Onyx resume template with sidebar and experience timeline",
    intro:
      "Onyx uses a light sidebar for contact details and skill meters, with an experience timeline in the main column. It shows career progression at a glance.",
    bestFor: ["Mid-career professionals with several roles", "Product, operations and project management", "Showing steady promotions"],
    highlights: ["Experience timeline", "Sidebar with skill meters and optional photo", "Balanced use of colour"],
    tip: "Keep the sidebar for facts (contact, skills, languages) and the main column for achievements, so recruiters know where to look.",
    faq: [
      { q: "Who should use a timeline resume?", a: "People whose story is progression — promotions or growing scope across roles. The timeline makes that obvious without extra words." },
      { q: "Does Onyx work with ATS?", a: "The sidebar makes it less safe than a single-column design. Use it for direct applications and referrals." },
    ],
  },
  awesomecv: {
    headline: "AwesomeCV-style resume template with dark sidebar",
    intro:
      "Inspired by the popular open-source LaTeX template, this design pairs a dark sidebar with crisp typography — the look many engineers and researchers already know, without writing LaTeX.",
    bestFor: ["Engineers and researchers", "Academic and technical CVs", "People who like the LaTeX look"],
    highlights: ["LaTeX-inspired typography", "Dark sidebar with photo support", "Strong visual identity"],
    tip: "This is the most ink-heavy template. Send the PDF digitally and pick a lighter template if you will be printing many copies.",
    faq: [
      { q: "Do I need LaTeX?", a: "No. Fill in the form and download a PDF — SecureCV handles the layout." },
      { q: "Why is its carbon score low?", a: "The dark sidebar uses a lot of ink when printed. It looks great on screen; choose Nordic or ATS Classic for printing." },
    ],
  },
  subtleelegant: {
    headline: "Subtle & Elegant resume template (serif, soft greys)",
    intro:
      "Subtle & Elegant uses serif typography, soft greys and a refined layout. It feels polished without being loud, which suits client-facing and hospitality roles.",
    bestFor: ["Hospitality, HR and client-facing roles", "Teaching and education", "Anyone wanting a classic but warm look"],
    highlights: ["Refined serif typography", "Soft grey accents", "Optional photo"],
    tip: "Keep your summary to two or three lines — the elegant spacing works best when the page is not crowded.",
    faq: [
      { q: "Is it suitable for corporate jobs?", a: "Yes. The palette is restrained enough for most corporate settings while looking more personal than a plain template." },
      { q: "Can I remove the photo?", a: "Yes, the photo is optional and the layout adjusts without it." },
    ],
  },
  executive: {
    headline: "Executive resume template for senior and corporate roles",
    intro:
      "Executive uses navy and gold, a serif name and a core-competency grid. It is built for senior professionals who need to show leadership and scope in the first few seconds.",
    bestFor: ["Managers, directors and senior leaders", "Board, consulting and finance roles", "Ten or more years of experience"],
    highlights: ["Core-competency grid up top", "Formal navy-and-gold palette", "ATS-safe single main column"],
    tip: "Lead each role with scope (team size, budget, revenue) before achievements. Senior readers want scale first.",
    faq: [
      { q: "Should an executive resume be two pages?", a: "Often, yes. Two pages are normal for senior roles as long as the first half-page sums up your value." },
      { q: "What goes in the competency grid?", a: "Six to nine areas of expertise, such as P&L ownership or stakeholder management, matching the roles you target." },
    ],
  },
  nordic: {
    headline: "Nordic minimal resume template (low ink, airy)",
    intro:
      "Nordic is an airy, Scandinavian-style layout with section labels in a narrow side column. It is calm, very readable and uses almost no ink.",
    bestFor: ["Freshers who want something calmer than plain", "UX, research and writing roles", "Printing many copies"],
    highlights: ["Labels in a side column, content in one flow", "Very low ink", "Fresher and ATS friendly"],
    tip: "White space is the design. Cut any bullet that does not add something new rather than shrinking the font.",
    faq: [
      { q: "Is Nordic ATS-friendly?", a: "Yes. The labels sit beside the content, but the text flows in one column that ATS software reads in order." },
      { q: "Is it good for freshers?", a: "Yes. It looks considered without needing a long work history to fill it." },
    ],
  },
  aurora: {
    headline: "Aurora creative resume template with gradient header",
    intro:
      "Aurora has a violet-to-pink gradient header, card-style experience entries and skill chips. It is the boldest template here, made to be remembered.",
    bestFor: ["Designers, content creators and social media roles", "Startups with a creative culture", "Portfolio-style applications"],
    highlights: ["Gradient header with optional photo", "Card-style experience", "Skill chips"],
    tip: "Pair Aurora with a portfolio link in the header. A creative resume works best when it points to your work.",
    faq: [
      { q: "Is a colourful resume unprofessional?", a: "Not in creative fields, where it can show taste. For banking or government roles choose Minimalist or ATS Classic." },
      { q: "Will Aurora pass an ATS?", a: "Text is real text, not images, but heavy design is riskier with older ATS software. Check it with the ATS checker first." },
    ],
  },
  timeline: {
    headline: "Timeline resume template with dates in the margin",
    intro:
      "Timeline puts dates in a gutter beside each role, with emerald accents and a skills rail. Readers see your career path at a glance.",
    bestFor: ["Steady career progression", "Explaining job changes or gaps clearly", "Operations, logistics and project roles"],
    highlights: ["Dates in a dedicated gutter", "Skills rail", "Optional photo"],
    tip: "If you have a gap, add a one-line entry for it (course, caregiving, freelance) so the timeline stays unbroken.",
    faq: [
      { q: "How do I show a career gap?", a: "Add a short entry for the gap period with what you did. Timeline makes an explained gap look intentional." },
      { q: "Is it good for freshers?", a: "It works best with two or more roles or internships. With less, Campus or Nordic will look fuller." },
    ],
  },
  developer: {
    headline: "Software developer resume template with tech-stack strip",
    intro:
      "Developer has monospace accents and a tech-stack chip strip at the top, so recruiters see your languages and frameworks before anything else. It is single-column and ATS-safe.",
    bestFor: ["Software engineers, freshers to senior", "Data, DevOps and QA roles", "Applications on job portals with ATS screening"],
    highlights: ["Tech-stack strip at the top", "Monospace accents", "ATS-safe single column"],
    tip: "Link to GitHub or a live project in the header, and list only the stack you could be interviewed on.",
    faq: [
      { q: "What should a software engineer resume include?", a: "Your stack, two or three projects or roles with measurable impact, and links to code. Developer's layout gives each of these a clear place." },
      { q: "Is this good for fresher developers?", a: "Yes. Put projects and internships under experience and the stack strip fills the top of the page." },
    ],
  },
  horizon: {
    headline: "Horizon resume template with teal sidebar and monogram",
    intro:
      "Horizon has a deep teal sidebar with a monogram or photo, contact details and skills, next to a clean main column. It looks distinctive while staying easy to read.",
    bestFor: ["Consultants and freelancers", "Client-facing and business development roles", "Personal-brand resumes"],
    highlights: ["Monogram or photo in the sidebar", "Deep teal accent", "Clean main column"],
    tip: "Without a photo, Horizon shows your initials as a monogram — a neat way to look personal without a picture.",
    faq: [
      { q: "What is a monogram resume?", a: "A resume that uses your initials as a small logo. Horizon creates it automatically when you skip the photo." },
      { q: "Is Horizon ATS-friendly?", a: "The sidebar makes it less safe than single-column templates. It is best for direct applications and networking." },
    ],
  },
};
