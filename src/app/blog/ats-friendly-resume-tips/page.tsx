import Link from "next/link";
import BlogPostLayout from "@/components/blog/BlogPostLayout";
import { postMetadata } from "@/lib/blog/posts";

const SLUG = "ats-friendly-resume-tips";
export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPostLayout slug={SLUG}>
      <p>
        Most mid-size and large employers run applications through an <strong>applicant tracking system (ATS)</strong>{" "}
        such as Workday, Greenhouse, Lever or Taleo. The ATS turns your resume into plain text, splits it into fields
        like name, experience and education, and lets recruiters search and filter candidates. If it can&apos;t read your
        resume, a recruiter may never see it, however strong your experience is.
      </p>
      <p>
        &quot;Beating the ATS&quot; isn&apos;t about tricks. It&apos;s about making your resume easy for software to
        read and easy for a human to scan. These 12 rules do both.
      </p>

      <h2>Formatting rules</h2>
      <h3>1. Use a single-column layout for the main content</h3>
      <p>
        Parsers read top to bottom and left to right. Complex multi-column layouts can come out in the wrong order, so
        your job titles end up next to the wrong dates. A single column is the safest choice. If you use a sidebar, keep
        only contact details and skills in it.
      </p>
      <h3>2. Use standard section headings</h3>
      <p>
        Write &quot;Experience&quot;, &quot;Education&quot;, &quot;Skills&quot;, &quot;Projects&quot; and
        &quot;Certifications&quot;. Creative headings like &quot;Where I&apos;ve Been&quot; may not map to the right
        field.
      </p>
      <h3>3. Keep text as real text</h3>
      <p>
        Don&apos;t put your name, contact details or skills inside images, icons or text boxes. Many parsers skip them.
        Logos, charts and skill bars add nothing an ATS can read.
      </p>
      <h3>4. Put contact details in the body, not the header or footer</h3>
      <p>Some older systems ignore document headers and footers entirely.</p>
      <h3>5. Use common fonts and simple bullets</h3>
      <p>
        Fonts like Arial, Calibri, Georgia, Helvetica or Times New Roman at 10–12 pt are safe. Plain round bullets are
        better than arrows or emoji.
      </p>
      <h3>6. Export a text-based PDF (or DOCX if they ask)</h3>
      <p>
        A PDF exported from a resume builder or word processor keeps real, selectable text and parses well. A scanned
        PDF or a photo of a printed resume doesn&apos;t. If the posting asks for .docx, send .docx.
      </p>

      <h2>Content and keyword rules</h2>
      <h3>7. Mirror the job description&apos;s wording</h3>
      <p>
        Recruiters search the ATS for keywords from the job description. If the posting says &quot;stakeholder
        management&quot; and &quot;SQL&quot;, use those exact phrases where they truthfully apply to you.
      </p>
      <h3>8. Include both the acronym and the full term</h3>
      <p>
        Write &quot;Search Engine Optimization (SEO)&quot; or &quot;Certified Public Accountant (CPA)&quot; once so you
        match either search.
      </p>
      <h3>9. Use a consistent date format</h3>
      <p>
        Pick one format, such as &quot;Jan 2024 – Mar 2025&quot; or &quot;01/2024 – 03/2025&quot;, and use it
        everywhere. The ATS uses dates to work out your years of experience.
      </p>
      <h3>10. Put the job title first</h3>
      <p>
        Lead each role with the job title, then the company. Recruiters often filter by title, and an ATS weights it
        heavily.
      </p>
      <h3>11. Don&apos;t keyword-stuff</h3>
      <p>
        Hidden white text and long keyword lists are easy to spot. Modern systems and every human reader penalise them.
        Work the keywords into real achievement bullets.
      </p>
      <h3>12. Tailor every application</h3>
      <p>
        A generic resume scores lower against every posting. Adjust your summary, reorder your skills and swap in the
        most relevant bullets each time. With a saved resume in a builder, this takes minutes.
      </p>

      <h2>Do ATS-friendly resumes have to look plain?</h2>
      <p>
        No. Colour accents, a clean serif name and good spacing don&apos;t hurt parsing. Problems come from layout
        tricks: tables, text boxes, columns that cross and important text inside graphics. In SecureCV,{" "}
        <strong>ATS Classic</strong>, <strong>Nordic</strong>, <strong>Campus</strong>, <strong>Developer</strong>,{" "}
        <strong>Executive</strong> and <strong>Minimalist</strong> are tagged <em>ATS-safe</em>. Use the
        &quot;ATS-safe&quot; filter in the template gallery to see them side by side.
      </p>

      <h2>How to test your resume</h2>
      <ol>
        <li>Open your PDF, select all the text and paste it into a plain text editor.</li>
        <li>Check the order. Does each job title sit next to its company and dates?</li>
        <li>Check that nothing is missing, especially your contact details and skills.</li>
        <li>Compare it against the job description and make sure the top five or six keywords appear.</li>
      </ol>
      <p>
        If the pasted text reads cleanly, an ATS will very likely read it cleanly too. New to resumes? Start with our{" "}
        <Link href="/blog/how-to-write-a-fresher-resume">fresher resume guide</Link>.
      </p>
    </BlogPostLayout>
  );
}
