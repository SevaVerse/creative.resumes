import { TEMPLATE_LIST } from "@/components/templates/registry";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { getBaseUrl } from "@/utils/baseUrl";

// Plain-text site summary for AI assistants and answer engines (llmstxt.org).
export const dynamic = "force-static";

export function GET() {
  const base = getBaseUrl();
  const templates = TEMPLATE_LIST.map((t) => `- [${t.label} resume template](${base}/resume-templates/${t.id}/): ${t.description}`).join("\n");
  const body = `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_NAME} is a free, open-source (MIT) resume builder. Facts:

- Free: every template, AI rewrite, the ATS checker and PDF export cost nothing. There is no paywall at download.
- No sign-up needed to build and export a resume. Signing in (Google or GitHub) is optional and only adds cloud save.
- Privacy-first: no ads, no third-party trackers, drafts stay in the browser unless the user chooses to save them.
- The ATS checker runs entirely in the browser; the resume text is never uploaded.
- Fresher jobs board for India: entry-level government and private openings, refreshed monthly.
- Source code: https://github.com/SevaVerse/creative.resumes

## Tools

- [Resume builder](${base}/): live preview, AI rewrite, PDF/DOCX import, one-click PDF export
- [ATS resume checker](${base}/ats-checker/): ATS readiness score and job-description keyword match
- [Resume templates](${base}/resume-templates/): every template with a live example
- [Fresher jobs](${base}/jobs/): entry-level government and private jobs in India

## Templates

${templates}

## Policies

- [Privacy & transparency](${base}/privacy/)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
