# Spec 01: No-Login Quick Mode

Superseded by `spec/tasks.md` (Epic E1).

- Status: `draft`
- Owner: Product + Frontend
- Last updated: 2026-03-11

## Problem Statement

Current flow requires login before users can fully interact with the builder. This adds friction for first-time visitors and likely reduces activation and exports.

## Goals

- Let users start building immediately without authentication.
- Preserve authenticated benefits (cloud save/sync, persistent history).
- Keep privacy-first behavior intact.

## Non-Goals

- Removing OAuth support.
- Rewriting existing resume persistence architecture.

## User Stories

- As a new visitor, I can choose a template and edit resume fields without signing in.
- As a new visitor, I can preview and export a PDF at least once before being prompted to sign in.
- As a returning user, I can sign in anytime and save my in-progress resume.

## Functional Requirements

1. Public Builder Access
- Unauthenticated users can access template selection, form filling, preview, and one-click export flow.

2. Save Gate
- Resume cloud save remains auth-gated.
- Show clear callout: "Sign in to save and sync across devices."

3. Soft Auth Prompt
- Trigger sign-in prompt after meaningful action (for example after first export or after N edits), not before first value.

4. Draft Persistence (Local)
- For unauthenticated users, save draft to local storage/session with explicit notice.
- Provide "Clear local draft" action.

5. Seamless Upgrade Path
- After login, allow importing current local draft into account resume.

## UX Copy Requirements

- Replace "Sign in to get started" with "Start now, sign in to save" style copy.
- Keep privacy and data handling statements consistent with actual behavior.

## Technical Notes

- Reuse existing form state and preview flow in `src/app/page.tsx`.
- Keep auth checks for save/load components (`ResumeSaveButton`, `ResumeLoader`) only.
- Ensure export API auth requirement is intentionally aligned with product policy.

## Analytics Events

- `quick_mode_start`
- `quick_mode_first_preview`
- `quick_mode_first_export`
- `quick_mode_auth_prompt_shown`
- `quick_mode_signup_completed`

## Acceptance Criteria

- Unauthenticated user can complete resume from template select to preview.
- Unauthenticated user can export at least one PDF without login (or if policy forbids this, spec must be amended explicitly).
- Save/load cloud actions remain unavailable until login.
- Draft survives refresh for unauthenticated user.
- No contradictory copy across homepage and privacy page.

## Rollout Plan

1. Enable public builder and preview.
2. Add local draft persistence.
3. Add soft sign-in prompts.
4. Run A/B or staged rollout and compare activation metrics.

## Risks and Mitigation

- Abuse risk on export endpoints.
: Keep/strengthen rate limits and bot checks.
- Increased compute cost.
: Add per-session caps and monitor export/event volume.
