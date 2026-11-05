import type { RawJob } from "@/lib/jobs/types";

// Hand-curated listings, e.g. major government notifications copied from the
// official notice. Add entries here (via PR) when a source has no feed.
// Always link to the OFFICIAL notification URL and include the last date.
//
// Example:
// {
//   source: "Curated",
//   title: "Combined Graduate Level Examination 20XX",
//   organization: "Staff Selection Commission (SSC)",
//   url: "https://ssc.gov.in/...",
//   location: "All India",
//   lastDate: "20XX-07-24",
//   sector: "government",
//   trustedEntryLevel: true,
// },
export const CURATED_JOBS: RawJob[] = [];
