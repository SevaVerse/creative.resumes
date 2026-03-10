# Spec Directory

This directory contains the source of truth for spec-driven development in `resume_v4`.

Primary source of truth: `tasks.md`

## How to Use

1. Create or update a spec before implementation.
2. Get sign-off on goals, non-goals, scope, and acceptance criteria.
3. Implement in small PRs that reference a spec ID.
4. Validate against measurable outcomes and acceptance criteria.

## Spec Status Model

- `draft`: Being written or revised.
- `approved`: Ready for implementation.
- `in-progress`: Implementation started.
- `done`: Acceptance criteria met and validated.
- `superseded`: Replaced by a newer spec.

## Naming Convention

Use numeric prefixes for ordering and stable references.

- `00-...` foundational strategy specs
- `01-...`, `02-...` feature specs in rollout order

## Current Specs

- `00-growth-offerings-strategy.md` (strategy context)
- `tasks.md` (canonical execution backlog)

## Legacy Specs (Superseded By `tasks.md`)

- `01-no-login-quick-mode.md`
- `02-ats-checker-and-job-match.md`
- `03-programmatic-seo-landing-pages.md`
- `04-funnel-analytics-and-experiments.md`

## Delivery Principle

Prioritize in this order:

1. Reduce first-visit friction.
2. Increase discoverable pages and linkable tools.
3. Instrument funnels for evidence-based iteration.

## Definition of Done (Global)

A spec can be marked `done` only when:

- All listed acceptance criteria are satisfied.
- Tracking events required by the spec are emitted.
- Privacy constraints are preserved.
- No contradictory product copy remains in affected pages.
