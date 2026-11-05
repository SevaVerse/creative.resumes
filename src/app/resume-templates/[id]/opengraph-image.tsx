import { TEMPLATES, carbonScore } from "@/components/templates/registry";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/ogImage";
import { isTemplateId } from "@/types/resume";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Free resume template on SecureCV";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = isTemplateId(id) ? TEMPLATES[id] : TEMPLATES.minimalist;
  return renderOgCard({
    eyebrow: `Free resume template · Carbon ${carbonScore(meta)}/10`,
    title: `${meta.label} resume template`,
    subtitle: meta.description,
  });
}
