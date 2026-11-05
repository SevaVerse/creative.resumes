# Spec 02: ATS Checker and Job Match

Superseded by `spec/tasks.md` (Epic E2).

- Status: `draft`
- Owner: Product + AI/Backend
- Last updated: 2026-03-11

## Problem Statement

The product currently offers resume creation and rewriting, but lacks a high-intent, linkable utility that directly answers job-seeker search intent like "ATS score" and "resume keyword match".

## Goals

- Launch a standalone ATS utility that attracts top-of-funnel traffic.
- Convert utility users into builder users.
- Provide actionable gap analysis against a pasted job description.

## Non-Goals

- Certified ATS emulation claims.
- Deep parsing of all ATS vendors.

## User Stories

- As a user, I can paste resume text and get an ATS-readiness score.
- As a user, I can paste a job description and see missing keyword coverage.
- As a user, I can apply suggestions back into my resume sections.

## Feature Scope (MVP)

1. Resume Input
- Paste text input and optional upload-derived text from existing flow.

2. Score Breakdown
- Overall score plus sub-scores:
  - keyword coverage
  - readability
  - section completeness
  - impact language quality

3. Job Match
- Extract top keywords from JD.
- Show matched vs missing keywords with confidence tiers.

4. Suggestions
- Section-level rewrite suggestions for summary, experience, and skills.
- One-click "apply suggestion" into builder form fields when in-session.

5. Landing Route
- Public route like `/ats-checker` with SEO metadata and FAQs.

## Suggested Architecture

- Route/UI in Next.js app.
- Use existing AI rewrite pipeline where possible.
- Keep deterministic checks local/server-side without model calls when feasible.

## Analytics Events

- `ats_page_view`
- `ats_analysis_started`
- `ats_analysis_completed`
- `ats_job_match_completed`
- `ats_suggestion_applied`
- `ats_to_builder_clicked`

## Acceptance Criteria

- User can complete ATS analysis in under 10 seconds for typical text length.
- Job match output includes explicit matched/missing keyword lists.
- At least one CTA to "Open in Builder" is present above the fold and after results.
- Results page is indexable and has unique metadata.

## Success Metrics

- ATS tool page impressions and CTR.
- ATS completion rate.
- ATS-to-builder click-through rate.
- Builder conversion from ATS entrants.

## Risks and Mitigation

- Users may over-trust score.
: Add transparent scoring methodology and disclaimer.
- API cost spikes from AI overuse.
: Cache repeated analyses and cap expensive operations.
