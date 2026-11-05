# Spec 04: Funnel Analytics and Experiments

Superseded by `spec/tasks.md` (Epic E4).

- Status: `draft`
- Owner: Product + Engineering
- Last updated: 2026-03-11

## Problem Statement

Current analytics capture basic event counts but are not sufficient to explain where traffic and conversion drop-offs occur.

## Goals

- Build a clear acquisition-to-activation funnel.
- Support weekly experiment decisions with event data.
- Preserve privacy-first principles.

## Non-Goals

- User-level behavioral profiling.
- Ad-tech tracking or cross-site identity graphs.

## Funnel Definition

1. `landing_view`
2. `cta_start_builder`
3. `template_selected`
4. `first_section_completed`
5. `preview_generated`
6. `pdf_export_success`
7. `signup_prompt_shown`
8. `signup_completed`

## Attribution Dimensions (Privacy-Conscious)

- `landing_path`
- `referrer_domain` (coarse)
- `utm_source`, `utm_medium`, `utm_campaign` (if present)
- `device_class` (mobile/desktop)
- `is_authenticated`

## Event Schema Requirements

- Consistent event naming and JSON metadata shape.
- Client and server event parity where needed.
- Validation of required metadata fields before insert.

## Dashboard Requirements

- Daily funnel conversion rates.
- Drop-off between each step.
- Segment by landing page family.
- Segment by authenticated vs unauthenticated journeys.

## Experiment Framework (MVP)

- Feature flag for homepage CTA copy variants.
- Event metadata includes `experiment_id` and `variant`.
- Weekly report template for winner/loser decisions.

## Acceptance Criteria

- All funnel events fire in a full happy-path journey.
- At least one dashboard/report summarizes weekly conversion by step.
- UTM/referrer capture is visible for landing-to-start conversion.
- Event logging does not block UX on failures.

## Success Metrics

- Time to identify top funnel drop-off reduced to <1 day.
- At least one shipped experiment decision per 2 weeks.
- Activation uplift from winning variants.

## Risks and Mitigation

- Inconsistent event payloads.
: Introduce typed analytics event helpers and runtime guards.
- Privacy concerns.
: Keep aggregate-focused metadata and avoid sensitive content logging.
