import type { Metadata } from "next";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  updated?: string;
  readingMinutes: number;
  keywords: string[];
};

// Newest first. Add an entry here when adding a post under src/app/blog/<slug>/page.tsx;
// the blog index, sitemap and per-post metadata all read from this list.
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-a-fresher-resume",
    title: "How to Write a Fresher Resume With No Experience (Step-by-Step Guide)",
    description:
      "A practical guide to writing your first resume as a student or fresher: what sections to include, how to show projects and internships, and examples you can copy.",
    published: "2026-11-05",
    readingMinutes: 8,
    keywords: [
      "fresher resume",
      "resume for freshers",
      "resume with no experience",
      "first resume",
      "student resume",
      "graduate resume format",
    ],
  },
  {
    slug: "ats-friendly-resume-tips",
    title: "ATS-Friendly Resume: 12 Rules to Get Past Applicant Tracking Systems",
    description:
      "How applicant tracking systems read your resume, and 12 formatting and keyword rules that keep your resume parseable without making it boring.",
    published: "2026-11-05",
    readingMinutes: 7,
    keywords: [
      "ATS friendly resume",
      "applicant tracking system",
      "ATS resume format",
      "resume keywords",
      "ATS resume checker",
    ],
  },
  {
    slug: "how-to-choose-a-resume-template",
    title: "How to Choose the Right Resume Template for Your Career Stage",
    description:
      "Single column or two columns? Photo or no photo? A simple framework for picking a resume template that suits your industry, experience level and the way you apply.",
    published: "2026-11-05",
    readingMinutes: 6,
    keywords: [
      "resume template",
      "best resume template",
      "free resume templates",
      "resume format",
      "two column resume",
    ],
  },
  {
    slug: "resume-carbon-footprint",
    title: "What Is the Carbon Footprint of a Printed Resume? (And How to Shrink It)",
    description:
      "We estimate the grams of CO₂e behind every printed resume page — paper, printer energy and ink — and show how template choice changes the number.",
    published: "2026-11-05",
    readingMinutes: 5,
    keywords: [
      "eco-friendly resume",
      "resume carbon footprint",
      "sustainable job search",
      "printing carbon footprint",
      "green resume",
    ],
  },
  {
    slug: "privacy-first-resume-builder",
    title: "Privacy-First Open Source Resume Builder — Build for Free with AI",
    description:
      "How SecureCV builds resumes without trackers: structured editing, clean templates, AI rewrite and real PDF output.",
    published: "2025-06-01",
    updated: "2026-11-05",
    readingMinutes: 4,
    keywords: ["privacy-first resume builder", "open source resume builder", "free AI resume builder"],
  },
];

export function getPost(slug: string): BlogPost {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown blog post: ${slug}`);
  return post;
}

export function postMetadata(slug: string): Metadata {
  const post = getPost(slug);
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: ["Seva"],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.png"],
    },
  };
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
