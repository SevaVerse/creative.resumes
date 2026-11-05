# Spec 03: Programmatic SEO Landing Pages

Superseded by `spec/tasks.md` (Epic E3).

- Status: `draft`
- Owner: Product + Content
- Last updated: 2026-03-11

## Problem Statement

Current public page count is too small to capture long-tail intent, limiting organic discovery.

## Goals

- Expand indexable, useful, non-thin pages for high-intent queries.
- Improve rankings for template, role, and resume guidance keywords.

## Non-Goals

- Publishing low-quality spun pages.
- Static copy duplication across pages.

## Page Families

1. Template Pages
- `/resume-templates/minimalist`
- `/resume-templates/onyx`
- `/resume-templates/awesomecv`
- `/resume-templates/subtle-elegant`

2. Role-Specific Examples
- `/resume-examples/software-engineer`
- `/resume-examples/data-analyst`
- `/resume-examples/product-manager`
- `/resume-examples/fresher`

3. Utility Landing Pages
- `/ats-checker`
- `/resume-keyword-matcher`
- `/resume-bullet-generator`

## Content Requirements Per Page

- Unique intro aligned to search intent.
- Example snippets or mini mock resume blocks.
- Common mistakes section.
- FAQ section.
- Strong CTA into builder or tool.
- Internal links to related pages.

## SEO Requirements

- Unique `title`, `description`, canonical URL.
- JSON-LD where appropriate (FAQ, HowTo, WebPage).
- Inclusion in `sitemap.ts`.
- No orphan pages.

## Technical Requirements

- Create scalable content config (JSON/TS data source) to generate routes.
- Ensure pages are static or cache-friendly.
- Keep consistent design and fast Largest Contentful Paint.

## Acceptance Criteria

- Ship at least 10 new high-intent pages in phase 1.
- Every new page appears in sitemap.
- Every page has at least 2 internal links in and 2 links out.
- Lighthouse SEO checks pass for sampled pages.

## Success Metrics

- Indexed pages count.
- Organic impressions by page family.
- Organic CTR and average ranking position.
- Landing page to builder click-through.

## Risks and Mitigation

- Thin content penalties.
: Enforce editorial checklist and minimum uniqueness threshold.
- Maintenance burden.
: Use shared templates and structured content source.
