import type { ResumeData } from "@/types/resume";

// Example content used for template thumbnails and the "Start from an example" option.

export const SAMPLE_FRESHER: ResumeData = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  website: "github.com/priyasharma",
  linkedin: "linkedin.com/in/priyasharma",
  summary:
    "Final-year B.Tech (Computer Science) student with hands-on experience building full-stack web apps. Looking for an entry-level software engineering role where I can contribute to production systems and keep learning.",
  experiences: [
    {
      company: "Acme Analytics Pvt. Ltd.",
      title: "Software Engineering Intern",
      startDate: "May 2025",
      endDate: "Jul 2025",
      current: false,
      details:
        "Built 3 internal dashboards in React and Node.js used by 40+ analysts\nReduced report generation time by 35% by adding SQL indexes and caching",
    },
  ],
  education:
    "B.Tech, Computer Science — ABC Institute of Technology, 2022–2026 · CGPA 8.4/10\nClass XII (CBSE) — 92% · 2022\nClass X (CBSE) — 94% · 2020",
  skills: [
    { name: "Java", level: 80 },
    { name: "Python", level: 75 },
    { name: "React", level: 70 },
    { name: "SQL", level: 70 },
    { name: "Git", level: 75 },
    { name: "Data Structures", level: 80 },
  ],
  certifications:
    "AWS Certified Cloud Practitioner (2025)\nTop 5% in college coding contest (200+ participants)",
  projects:
    "Campus Placement Portal — Next.js + PostgreSQL app used by 500+ students for drive registrations\nExpense Splitter — Android app with offline sync; 1k+ downloads on Play Store",
  profilePictureUrl: "",
};

export const SAMPLE_EXPERIENCED: ResumeData = {
  ...SAMPLE_FRESHER,
  name: "Rahul Verma",
  email: "rahul.verma@example.com",
  summary:
    "Software engineer with 5+ years building scalable web platforms. Led teams of 4–6 engineers and shipped products used by millions.",
  experiences: [
    {
      company: "Tech Company Inc.",
      title: "Senior Software Engineer",
      startDate: "Jan 2022",
      current: true,
      details: "Led migration to microservices, cutting deploy time by 60%\nMentored 5 junior developers",
    },
    {
      company: "Startup Co.",
      title: "Software Engineer",
      startDate: "Mar 2019",
      endDate: "Dec 2021",
      details: "Built REST APIs in Node.js serving 2M requests/day\nImplemented CI/CD pipelines",
    },
  ],
  education: "B.E. Computer Engineering — XYZ University, 2019",
};
