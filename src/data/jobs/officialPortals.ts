// Evergreen official portals where government vacancies for freshers are first announced.
export type OfficialPortal = { name: string; url: string; description: string };

export const OFFICIAL_PORTALS: OfficialPortal[] = [
  { name: "UPSC", url: "https://upsc.gov.in", description: "Civil Services, ESE, CDS, NDA and other central exams" },
  { name: "SSC", url: "https://ssc.gov.in", description: "CGL, CHSL, MTS, GD Constable, JE and Stenographer exams" },
  { name: "IBPS", url: "https://www.ibps.in", description: "PO, Clerk, SO and RRB posts in public sector banks" },
  { name: "National Career Service", url: "https://www.ncs.gov.in", description: "Ministry of Labour job portal for public and private vacancies" },
  { name: "Apprenticeship India", url: "https://www.apprenticeshipindia.gov.in", description: "Government apprenticeship scheme (NAPS) for freshers" },
  { name: "NATS (Graduate apprentices)", url: "https://nats.education.gov.in", description: "National Apprenticeship Training Scheme for graduates and diploma holders" },
  { name: "Employment News", url: "https://www.employmentnews.gov.in", description: "Weekly Government of India gazette of central vacancies" },
];
