import Link from "next/link";
import BlogPostLayout from "@/components/blog/BlogPostLayout";
import { postMetadata } from "@/lib/blog/posts";
import { TAG_LABELS, TEMPLATE_COUNT, TEMPLATE_LIST, carbonScore } from "@/components/templates/registry";

const SLUG = "how-to-choose-a-resume-template";
export const metadata = postMetadata(SLUG);

export default function Post() {
  return (
    <BlogPostLayout slug={SLUG}>
      <p>
        A template can&apos;t make up for weak content, but the wrong one can hide strong content. It can confuse an
        applicant tracking system, push your best project below the fold or look out of place in your industry. Here is
        a simple way to choose.
      </p>

      <h2>Step 1: Who reads it first — software or a person?</h2>
      <p>
        If you apply through job portals or large company career sites, an ATS almost certainly reads your resume
        first. Pick a single-column, ATS-safe layout. If you&apos;re handing your resume to a person, through a
        referral, a campus drive, an email to a founder or a design portfolio review, you have more room for colour and
        a two-column layout.
      </p>

      <h2>Step 2: Match your career stage</h2>
      <ul>
        <li>
          <strong>Students and freshers:</strong> use an education-first layout that gives projects room. A plain,
          confident design looks better than a flashy one with little in it.
        </li>
        <li>
          <strong>Early to mid-career:</strong> use an experience-first layout with clear dates. A timeline layout
          works well if you have changed roles a few times.
        </li>
        <li>
          <strong>Senior and executive:</strong> use serif typography, a core-competencies block and restrained colour.
          Leave plenty of white space and avoid gimmicks.
        </li>
      </ul>

      <h2>Step 3: Match your industry</h2>
      <ul>
        <li><strong>Finance, law, government, consulting:</strong> conservative, single column, little colour.</li>
        <li><strong>Software and data:</strong> clean and technical. A visible tech-stack line helps.</li>
        <li><strong>Design, marketing, media:</strong> colour and a photo are fine and can help, as long as the content still leads.</li>
      </ul>

      <h2>Step 4: Photo or no photo?</h2>
      <p>
        In the US, UK and Canada, leave the photo off. Many employers prefer it that way to reduce bias. In much of
        Europe, the Middle East and parts of Asia, a professional photo is common. When in doubt, follow the posting or
        the norms of the company&apos;s country.
      </p>

      <h2>Step 5: Think about printing</h2>
      <p>
        Heavy colour blocks and dark sidebars use far more ink or toner when printed. If you expect to print copies for
        walk-in interviews or job fairs, a lighter template is cheaper and{" "}
        <Link href="/blog/resume-carbon-footprint">has a smaller carbon footprint</Link>.
      </p>

      <h2>All {TEMPLATE_COUNT} SecureCV templates at a glance</h2>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Best for</th>
            <th>Eco score</th>
          </tr>
        </thead>
        <tbody>
          {TEMPLATE_LIST.map((t) => (
            <tr key={t.id}>
              <td>
                <strong>{t.label}</strong>
                <br />
                <span className="text-gray-600 dark:text-gray-400">{t.description}</span>
              </td>
              <td>{t.tags.map((tag) => TAG_LABELS[tag]).join(", ")}</td>
              <td>{carbonScore(t)}/10</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Our quick picks</h2>
      <ul>
        <li><strong>First job or internship:</strong> Campus, or Developer for engineering roles.</li>
        <li><strong>Applying through big job portals:</strong> ATS Classic or Nordic.</li>
        <li><strong>Senior and corporate roles:</strong> Executive or Minimalist.</li>
        <li><strong>Creative roles, or a resume going straight to a person:</strong> Aurora, Modern, Horizon or Timeline.</li>
      </ul>
      <p>
        You don&apos;t have to commit. In the <Link href="/">SecureCV builder</Link>, your details carry over when you
        switch templates, so you can try several in a minute and export the one that looks best.
      </p>
    </BlogPostLayout>
  );
}
