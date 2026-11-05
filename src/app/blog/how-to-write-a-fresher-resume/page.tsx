import Link from "next/link";
import BlogPostLayout from "@/components/blog/BlogPostLayout";
import { postMetadata } from "@/lib/blog/posts";

const SLUG = "how-to-write-a-fresher-resume";
export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPostLayout slug={SLUG}>
      <p>
        Writing your first resume feels like a trap: every job asks for experience, and you need a job to get
        experience. The good news is that recruiters hiring freshers know this. They aren&apos;t looking for a long work
        history. They want proof that you can learn quickly, finish what you start and do the basics of the role. This
        guide shows you how to put that proof on one page.
      </p>

      <h2>1. Use a one-page, education-first layout</h2>
      <p>
        For a fresher, your education and projects are your strongest evidence, so put them near the top. A good order
        is:
      </p>
      <ol>
        <li><strong>Header</strong> — name, phone, professional email, city, LinkedIn and GitHub or portfolio link.</li>
        <li><strong>Summary</strong> — two or three lines aimed at the role you want.</li>
        <li><strong>Education</strong> — degree, college, year, and your CGPA or percentage if it helps you.</li>
        <li><strong>Projects</strong> — two to four, each with what you built and the result.</li>
        <li><strong>Internships and experience</strong> — internships, freelance work, part-time jobs, volunteering.</li>
        <li><strong>Skills</strong> — grouped, e.g. Languages, Tools, Frameworks.</li>
        <li><strong>Certifications and achievements</strong> — hackathons, ranks, scholarships, relevant courses.</li>
      </ol>
      <p>
        Keep it to a single page. If something does not help you get <em>this</em> job, cut it.
      </p>

      <h2>2. Write a summary that names the job</h2>
      <p>
        Skip &quot;Hard-working individual seeking a challenging position.&quot; Every resume says that. State what you
        are, what you can do and what you want:
      </p>
      <blockquote>
        Computer Science graduate (2026) with hands-on projects in React and Node.js, including a library app used by
        300+ students. Looking for a junior front-end developer role.
      </blockquote>

      <h2>3. Turn projects into experience</h2>
      <p>
        Projects are the fresher&apos;s work history, so write them the same way. Use an action verb, say what you
        built, name the tools and add a number wherever you honestly can:
      </p>
      <ul>
        <li><strong>Weak:</strong> &quot;Made a website for college fest.&quot;</li>
        <li>
          <strong>Strong:</strong> &quot;Built and deployed the college fest website (Next.js, Tailwind) that handled
          2,000+ registrations in a week with zero downtime.&quot;
        </li>
      </ul>
      <p>
        Academic projects, final-year projects, open-source contributions, personal apps and even well-documented
        coursework all count. Link to the code or a live demo.
      </p>

      <h2>4. Count everything that looks like work</h2>
      <p>
        Internships are the obvious ones, but recruiters also value tutoring, running a college club, organising events,
        freelance gigs, family-business work and volunteering. Each one shows reliability and responsibility. Write them
        with the same action-verb-plus-result pattern.
      </p>

      <h2>5. Match your skills to the job description</h2>
      <p>
        Read the job posting and list the skills it mentions that you actually have. Use the same words it uses: if the
        posting says &quot;MS Excel&quot;, don&apos;t write only &quot;spreadsheets&quot;. Many companies use applicant
        tracking systems (ATS) to filter resumes by keywords. Our{" "}
        <Link href="/blog/ats-friendly-resume-tips">ATS-friendly resume guide</Link> covers this in detail.
      </p>
      <p>Avoid skill bars and percentages on a fresher resume. &quot;Python — 80%&quot; tells a recruiter nothing.</p>

      <h2>6. Common fresher resume mistakes</h2>
      <ul>
        <li>Using an unprofessional email address. Make a simple firstname.lastname one.</li>
        <li>Adding personal details nobody asked for, such as father&apos;s name, marital status or religion.</li>
        <li>Listing school marks in more detail than your degree.</li>
        <li>Writing a three-page resume, or one with tiny fonts to squeeze onto one page.</li>
        <li>Spelling and grammar errors. Read it aloud before you send it.</li>
        <li>Sending the same resume to every job. Adjust the summary and skills for each application.</li>
      </ul>

      <h2>7. Pick a template built for freshers</h2>
      <p>
        A clean single-column layout keeps the focus on content and parses well in ATS software. In SecureCV, the{" "}
        <strong>Campus</strong> template puts education and projects first. <strong>ATS Classic</strong> and{" "}
        <strong>Nordic</strong> are minimal and parser-safe, and <strong>Developer</strong> adds a tech-stack strip for
        engineering roles. All of them are free, and you can switch between them without retyping anything. Not sure
        which to pick? See{" "}
        <Link href="/blog/how-to-choose-a-resume-template">how to choose a resume template</Link>.
      </p>

      <h2>Quick checklist before you apply</h2>
      <ul>
        <li>One page, a readable 10–12 pt font and consistent dates.</li>
        <li>A summary that names the role you want.</li>
        <li>Two to four projects with tools and results.</li>
        <li>Skills that match the job description&apos;s keywords.</li>
        <li>Working links to GitHub, LinkedIn or your portfolio.</li>
        <li>Exported as a PDF named like <code>Firstname-Lastname-Resume.pdf</code>.</li>
      </ul>
      <p>
        Once your resume is ready, browse the <Link href="/jobs">fresher jobs board</Link> for entry-level government and
        private openings, refreshed every month.
      </p>
    </BlogPostLayout>
  );
}
