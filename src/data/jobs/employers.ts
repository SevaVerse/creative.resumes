// Verified registry of employers whose official careers boards are polled directly through their
// applicant-tracking system's public postings API. This is the main source of private-sector listings;
// Adzuna is supplementary.
//
// Admission rule: the board's public endpoint returned HTTP 200 and listed open roles located in India
// on `verifiedAt`. Entry-level filtering happens later in the pipeline, so a board may currently have no
// fresher roles and still belong here.
//
// To add one, open a job on the company's careers site and read the slug from its URL:
//   greenhouse       boards.greenhouse.io/<slug>/…  or job-boards.greenhouse.io/<slug>/…
//                    check: https://boards-api.greenhouse.io/v1/boards/<slug>/jobs
//   lever            jobs.lever.co/<slug>/…
//                    check: https://api.lever.co/v0/postings/<slug>?mode=json
//   ashby            jobs.ashbyhq.com/<slug>/…
//                    check: https://api.ashbyhq.com/posting-api/job-board/<slug>
//   smartrecruiters  jobs.smartrecruiters.com/<CompanyId>/…   (case-sensitive)
//                    check: https://api.smartrecruiters.com/v1/companies/<CompanyId>/postings?country=in
// Ashby responses include every job's full description, so skip very large Ashby boards with few
// India roles. When a company moves to another ATS its old board 404s; the run log reports it as
// a failed source, and the entry should then be updated or removed.

export type AtsProvider = "greenhouse" | "lever" | "ashby" | "smartrecruiters";

export type EmployerBoard = {
  ats: AtsProvider;
  /** Board identifier in the ATS (the URL slug / company id). */
  slug: string;
  /** Employer name shown on listings. */
  name: string;
  /** Date (YYYY-MM-DD) the endpoint was last checked by hand. */
  verifiedAt: string;
};

const V = "2026-11-06";

export const EMPLOYER_BOARDS: EmployerBoard[] = [
  // Greenhouse
  { ats: "greenhouse", slug: "razorpaysoftwareprivatelimited", name: "Razorpay", verifiedAt: V },
  { ats: "greenhouse", slug: "groww", name: "Groww", verifiedAt: V },
  { ats: "greenhouse", slug: "inmobi", name: "InMobi", verifiedAt: V },
  { ats: "greenhouse", slug: "sigmoid", name: "Sigmoid", verifiedAt: V },
  { ats: "greenhouse", slug: "hackerrank", name: "HackerRank", verifiedAt: V },
  { ats: "greenhouse", slug: "zetaglobal", name: "Zeta Global", verifiedAt: V },
  { ats: "greenhouse", slug: "druva", name: "Druva", verifiedAt: V },
  { ats: "greenhouse", slug: "observeai", name: "Observe.AI", verifiedAt: V },
  { ats: "greenhouse", slug: "rubrik", name: "Rubrik", verifiedAt: V },
  { ats: "greenhouse", slug: "stripe", name: "Stripe", verifiedAt: V },
  { ats: "greenhouse", slug: "mongodb", name: "MongoDB", verifiedAt: V },
  { ats: "greenhouse", slug: "databricks", name: "Databricks", verifiedAt: V },
  { ats: "greenhouse", slug: "okta", name: "Okta", verifiedAt: V },
  { ats: "greenhouse", slug: "zscaler", name: "Zscaler", verifiedAt: V },
  { ats: "greenhouse", slug: "purestorage", name: "Pure Storage", verifiedAt: V },
  { ats: "greenhouse", slug: "celonis", name: "Celonis", verifiedAt: V },
  { ats: "greenhouse", slug: "gitlab", name: "GitLab", verifiedAt: V },
  { ats: "greenhouse", slug: "elastic", name: "Elastic", verifiedAt: V },
  { ats: "greenhouse", slug: "twilio", name: "Twilio", verifiedAt: V },
  { ats: "greenhouse", slug: "coinbase", name: "Coinbase", verifiedAt: V },
  { ats: "greenhouse", slug: "datadog", name: "Datadog", verifiedAt: V },
  { ats: "greenhouse", slug: "airbnb", name: "Airbnb", verifiedAt: V },

  // Lever
  { ats: "lever", slug: "paytm", name: "Paytm", verifiedAt: V },
  { ats: "lever", slug: "meesho", name: "Meesho", verifiedAt: V },
  { ats: "lever", slug: "cred", name: "CRED", verifiedAt: V },
  { ats: "lever", slug: "hevodata", name: "Hevo Data", verifiedAt: V },
  { ats: "lever", slug: "mindtickle", name: "Mindtickle", verifiedAt: V },
  { ats: "lever", slug: "zeta", name: "Zeta", verifiedAt: V },

  // Ashby
  { ats: "ashby", slug: "sarvam", name: "Sarvam AI", verifiedAt: V },
  { ats: "ashby", slug: "atlan", name: "Atlan", verifiedAt: V },

  // SmartRecruiters (India postings only)
  { ats: "smartrecruiters", slug: "BoschGroup", name: "Bosch", verifiedAt: V },
  { ats: "smartrecruiters", slug: "Freshworks", name: "Freshworks", verifiedAt: V },
  { ats: "smartrecruiters", slug: "ServiceNow", name: "ServiceNow", verifiedAt: V },
  { ats: "smartrecruiters", slug: "NielsenIQ", name: "NielsenIQ", verifiedAt: V },
  { ats: "smartrecruiters", slug: "Sutherland", name: "Sutherland", verifiedAt: V },
  { ats: "smartrecruiters", slug: "Experian", name: "Experian", verifiedAt: V },
  { ats: "smartrecruiters", slug: "Continental", name: "Continental", verifiedAt: V },
  { ats: "smartrecruiters", slug: "Endava", name: "Endava", verifiedAt: V },
];
