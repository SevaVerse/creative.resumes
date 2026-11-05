import { TEMPLATE_IDS } from "@/types/resume";

// Site-wide constants shared by metadata, structured data and copy, so counts never drift.

export const SITE_NAME = "SecureCV";

/** Number of resume templates, derived from the registry ids. */
export const TEMPLATE_COUNT = TEMPLATE_IDS.length;

export const SITE_TAGLINE = `Free AI resume builder with ${TEMPLATE_COUNT} templates, an ATS checker and fresher jobs — privacy-first, no sign-up, no paywall at download.`;
