import Link from "next/link";
import BlogPostLayout from "@/components/blog/BlogPostLayout";
import { postMetadata } from "@/lib/blog/posts";
import { TEMPLATE_LIST, carbonFootprint } from "@/components/templates/registry";

const SLUG = "resume-carbon-footprint";
export const metadata = postMetadata(SLUG);

export default function Post() {
  const rows = TEMPLATE_LIST.map((t) => ({ t, fp: carbonFootprint(t) })).sort((a, b) => a.fp.totalG - b.fp.totalG);
  const lightest = rows[0];
  const heaviest = rows[rows.length - 1];
  // A typical job search: ~50 applications with a printed copy for ~20 interviews, 2 pages each.
  const pagesPrinted = 20 * 2;

  return (
    <BlogPostLayout slug={SLUG}>
      <p>
        One printed resume won&apos;t change the climate. But job seekers print a lot of them, recruiters print more,
        and job fairs get through stacks. We wanted to put a real number on it, so every template in SecureCV now shows
        an estimated <strong>grams of CO₂-equivalent (g CO₂e) per printed page</strong>. Here is how we work it out.
      </p>

      <h2>What goes into a printed page</h2>
      <ul>
        <li>
          <strong>Paper (~4.5 g CO₂e).</strong> An 80 gsm A4 sheet weighs about 5 g. Making virgin office paper emits
          roughly 0.9 kg CO₂e per kg, which comes to about 4.5 g per sheet. Recycled paper is lower.
        </li>
        <li>
          <strong>Printer energy (~0.5 g CO₂e).</strong> A typical office laser printer uses around 0.01 kWh per page,
          counting its share of warm-up. At an average grid intensity of about 0.4 kg CO₂e per kWh, that&apos;s about
          0.5 g.
        </li>
        <li>
          <strong>Ink or toner (~0.5 g CO₂e per 1% of the page covered).</strong> A cartridge&apos;s life-cycle
          footprint, spread over its rated yield, comes to roughly 2.5 g per page at the industry-standard 5% coverage.
          It scales roughly with how much of the page is inked.
        </li>
      </ul>
      <p>
        Paper is the fixed cost. <strong>Ink is the part your template choice controls.</strong> A plain text resume
        covers about 3–6% of the page. A design with a solid dark sidebar or a full-width colour header can go above
        25%.
      </p>

      <h2>Estimated footprint of each template</h2>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Est. ink coverage</th>
            <th>g CO₂e / printed page</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ t, fp }) => (
            <tr key={t.id}>
              <td>{t.label}</td>
              <td>~{fp.coveragePct}%</td>
              <td>≈ {fp.totalG.toFixed(1)} g</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        The lightest template, {lightest.t.label}, comes in at about {lightest.fp.totalG.toFixed(1)} g per page. The
        heaviest, {heaviest.t.label}, is about {heaviest.fp.totalG.toFixed(1)} g, roughly{" "}
        {(heaviest.fp.totalG / lightest.fp.totalG).toFixed(1)}× as much. Print {pagesPrinted} pages over a job search
        and the gap is about {((heaviest.fp.totalG - lightest.fp.totalG) * pagesPrinted).toFixed(0)} g CO₂e. That is
        small on its own, but it is also a lot of toner you pay for.
      </p>

      <h2>These are estimates</h2>
      <p>
        Real numbers depend on your printer, your paper, your local electricity mix and the content you add. A long
        experience section adds ink to any template. We use published industry averages and a coverage estimate for
        each template&apos;s design. Treat the figures as a fair way to compare templates, not as a precise
        measurement.
      </p>

      <h2>How to shrink your resume&apos;s footprint</h2>
      <ol>
        <li><strong>Send a PDF instead of printing.</strong> A download or email attachment is a tiny fraction of a gram.</li>
        <li><strong>Pick a low-ink template</strong> if you will print. Look for a high eco score in the gallery.</li>
        <li><strong>Keep it to one page</strong> when you can. That roughly halves the footprint and is usually better for readers too.</li>
        <li><strong>Print only what you need</strong> for each interview or fair, on recycled paper and in grayscale.</li>
        <li><strong>Recycle old copies</strong> and refill toner cartridges where you can.</li>
      </ol>
      <p>
        You can see the estimate on every template card and in the preview tabs of the{" "}
        <Link href="/">SecureCV builder</Link>. To weigh design against other factors, read{" "}
        <Link href="/blog/how-to-choose-a-resume-template">how to choose a resume template</Link>.
      </p>
    </BlogPostLayout>
  );
}
