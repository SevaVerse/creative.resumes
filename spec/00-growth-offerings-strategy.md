# Spec 00: Growth Offerings Strategy

- Status: `draft`
- Owner: Product/Founder
- Last updated: 2026-03-11

## Problem Statement

The product has strong core functionality but low traffic and likely low visitor-to-activation conversion. Discovery surface is limited, and first-time users face login friction before value realization.

## Goals

- Increase qualified organic traffic.
- Increase activation rate from visitor to first successful output (resume preview/export).
- Create repeatable feature pipeline for acquisition and retention.

## Non-Goals

- Re-platforming the app architecture.
- Broad visual redesign of the full app.
- Paid acquisition campaigns.

## Strategy Pillars

1. Acquisition Surface Expansion
- Add high-intent landing pages and tools that rank and get shared.

2. Time-to-Value Reduction
- Allow first value without account creation.

3. Conversion Loop Reinforcement
- Add clear paths from tool usage to full resume workflow.

4. Measurement Maturity
- Instrument the funnel to make prioritization data-driven.

## Priority Feature Offerings

P0:
- No-login quick mode for resume creation.
- ATS checker + job description keyword match.
- Programmatic SEO landing pages for templates and role-specific examples.

P1:
- Cover letter generator from resume + job description.
- Shareable feedback link for resume review.
- Template recommendation quiz.

P2:
- Resume versioning by target company.
- Lightweight job application tracker.

## Success Metrics (90 days)

- Organic sessions: +150% from baseline.
- New visitor activation rate: +50% relative lift.
- First PDF export rate (from landing traffic): +40% relative lift.
- Signup conversion after first value event: +30% relative lift.

## Dependencies

- Stable analytics event pipeline.
- Content production workflow for landing pages.
- Copy consistency across home/privacy/metadata pages.

## Risks

- SEO pages may underperform without quality differentiation.
- Privacy messaging can be undermined by contradictory implementation.
- Quick mode may increase infra cost if abuse controls are weak.

## Milestones

1. M1: Quick mode + instrumentation baseline.
2. M2: ATS checker MVP + 10 landing pages.
3. M3: Scale to 30-50 landing pages + first experiment cycle.
