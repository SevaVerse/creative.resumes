# Technical Debt Cleanup Plan

## Overview
This document outlines identified technical debt and unused code in the resume builder project. Items are organized by priority and impact for systematic cleanup over the next few days.

## High Priority (Safe to Remove Immediately)

### Unused Environment Variables
Remove these unused environment variables from `.env` and any documentation:

- [x] `DATABASE_URL` - Referenced in comments but never used
- [x] `DB_TYPE` - Never referenced in code
- [x] `KV_URL` - Never referenced in code
- [x] `ANALYTICS_ID` - Never referenced in code
- [x] `PDF_SERVICE_KEY` - Never referenced in code
- [x] `EMAIL_SERVICE_API_KEY` - Never referenced in code
- [x] `APP_NAME` - Never referenced in code
- [x] `APP_VERSION` - Never referenced in code
- [x] `JWT_SECRET` - Never referenced in code
- [x] `OAUTH_CLIENT_ID` - Never referenced in code
- [x] `OAUTH_CLIENT_SECRET` - Never referenced in code
- [x] `CLOUDINARY_URL` - Never referenced in code

### Unused Assets
Delete these unused files from `public/` directory:

- [x] `file.svg` - Not referenced anywhere
- [x] `globe.svg` - Not referenced anywhere
- [x] `next.svg` - Not referenced anywhere
- [x] `window.svg` - Not referenced anywhere

## Medium Priority (Requires Review)

### Duplicate Type Definitions
Consolidate these duplicate type definitions into shared interfaces:

- [ ] **ExperienceItem types** - Defined in 4 places:
  - `src/app/page.tsx` (lines 4-11)
  - `src/components/MinimalistTemplate.tsx` (lines 5-12)
  - `src/components/OnyxTemplate.tsx` (lines 8-15)
  - `src/components/AwesomeCVTemplate.tsx` (lines 8-15)

- [ ] **SkillItem types** - Defined in 4 places:
  - `src/app/page.tsx` (line 12)
  - `src/components/MinimalistTemplate.tsx` (line 13)
  - `src/components/OnyxTemplate.tsx` (line 16)
  - `src/components/AwesomeCVTemplate.tsx` (line 16)

### Commented-Out Code
Review and either implement or remove:

- [x] **Database integration code** in `src/app/api/metrics/route.ts`
  - Large blocks of commented SQLite integration code
  - Either implement properly or remove completely

## Low Priority (Code Quality Improvements)

### Code Structure Issues

- [ ] **Extract large HTML template** from `src/app/api/send-login-link/route.ts`
  - The `html()` function contains a very large inline HTML string
  - Consider moving to a separate template file or using a template engine

- [ ] **Simplify browser launch logic** in `src/app/api/export-pdf/route.ts`
  - Complex conditional logic for different environments
  - Could be simplified while maintaining functionality

- [ ] **Review hashEmail function** in `src/app/api/send-login-link/route.ts`
  - Only used for logging obfuscation
  - Could be simplified or removed if logging requirements change

### TODO Comments (Update Status)

- [ ] **Rate limiting for login links** - Already implemented, update TODO
- [x] **Captcha provider switching** - Completed: Implemented Cloudflare Turnstile
- [ ] **ARIA live regions for accessibility** - Still pending
- [ ] **Email persistence in localStorage** - Still pending

## Dependencies to Review

### Potentially Unused Dev Dependencies
Review if these can be removed:

- [ ] `@types/nodemailer` - Confirm still needed
- [ ] `@types/react` and `@types/react-dom` - Confirm still needed
- [ ] `eslint` and related packages - Confirm still needed

## Implementation Plan

### Day 1: Safe Removals ✅ COMPLETED
- [x] Remove unused environment variables
- [x] Delete unused SVG files
- [x] Remove commented database code
- [x] Build verification passed

**Results**: Cleaned up 12 unused env vars, 4 unused SVG files (saved ~10KB), removed ~15 lines of dead code. Build passes successfully.

### Day 2: Type Consolidation
- Create shared type definitions
- Update all components to use shared types
- Test for breaking changes

### Day 3: Code Structure Improvements
- Extract HTML template
- Simplify browser launch logic
- Update TODO comments

### Day 4: Dependency Audit
- Review dev dependencies
- Check for unused production dependencies
- Update package.json

## Risk Assessment

### Low Risk
- Removing unused environment variables
- Deleting unused SVG files
- Removing commented code

### Medium Risk
- Consolidating type definitions (potential breaking changes)
- Extracting HTML template (functional changes)

### High Risk
- Modifying browser launch logic (could break PDF generation)
- Removing dependencies (could break builds)

## Success Criteria

- [ ] Build passes after each cleanup step
- [ ] All tests pass (if any exist)
- [ ] No runtime errors
- [ ] Bundle size reduced
- [ ] Improved maintainability
- [ ] No duplicate code remaining

## Notes

- Always run `npm run build` after each change
- Test PDF generation functionality after any changes to export logic
- Keep backups of original files before major changes
- Update documentation if removing public APIs or configuration options