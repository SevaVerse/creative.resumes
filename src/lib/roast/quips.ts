import type { AtsResult } from "@/lib/ats/analyze";

// Shared, content-free pieces of the "roast my resume" feature. Nothing here ever includes
// resume text, so it is safe to use for share cards and public score pages.

export type RoastTier = { label: string; emoji: string; blurb: string; colour: string };

export function roastTier(score: number): RoastTier {
  if (score >= 80) return { label: "Chef's kiss", emoji: "👨‍🍳", blurb: "Barely anything to roast. Recruiters will be impressed.", colour: "#16a34a" };
  if (score >= 60) return { label: "Medium rare", emoji: "🔥", blurb: "Solid, with a few spots still a little raw.", colour: "#ca8a04" };
  if (score >= 40) return { label: "Medium well", emoji: "🔥🔥", blurb: "Some real flavour, but a few parts are overcooked.", colour: "#ea580c" };
  return { label: "Extra crispy", emoji: "🔥🔥🔥", blurb: "Thoroughly roasted. Good news: every fix is easy.", colour: "#dc2626" };
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Local, deterministic roast lines used when the AI roast is unavailable. Based only on the analysis. */
export function fallbackRoast(result: AtsResult): string[] {
  const lines: string[] = [];
  const { stats, sectionsMissing, scores } = result;
  if (stats.words < 200) lines.push(`At ${stats.words} words, this resume is less a story and more a tweet with a phone number.`);
  if (stats.words > 1100) lines.push(`${stats.words} words? Recruiters spend about seven seconds per resume. This one needs a lunch break.`);
  if (stats.bullets > 0 && stats.quantifiedBullets === 0) lines.push("Not a single number anywhere. Did you achieve things, or did things just happen near you?");
  else if (stats.bullets > 0 && stats.quantifiedBullets / stats.bullets < 0.3) lines.push("Your bullets have the confidence of someone who forgot what they actually achieved. Numbers, please.");
  if (stats.weakPhrases.length > 0) lines.push(`“${stats.weakPhrases[0]}” is resume-speak for “I was in the room when it happened”.`);
  if (stats.bullets > 0 && stats.actionBullets / stats.bullets < 0.4) lines.push("Most of your lines start politely. Start them with verbs that actually did something: built, led, cut, shipped.");
  if (sectionsMissing.includes("Skills")) lines.push("No skills section. Bold strategy: let the recruiter guess.");
  if (sectionsMissing.includes("Contact details")) lines.push("Great resume, but how exactly is anyone supposed to hire you? Carrier pigeon?");
  if (scores.keywords !== null && scores.keywords < 40) lines.push("You and this job description are clearly not on speaking terms. Borrow some of its words.");
  if (lines.length === 0) lines.push("Honestly, there's not much to roast here. Annoyingly competent.");
  return lines.slice(0, 4);
}

/** Path of the public, content-free score page for sharing. */
export function roastSharePath(score: number): string {
  return `/roast-my-resume/score/${clampScore(score)}/`;
}
