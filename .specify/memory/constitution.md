<!--
  ═══════════════════════════════════════════════════════════════
  SYNC IMPACT REPORT
  ═══════════════════════════════════════════════════════════════
  Version change: 1.0.0 → 1.1.0  [MINOR — toolchain migration]

  Modified sections:
    - Technology Standards: Create React App → Vite + Vitest
    - II. Test-Driven Quality: Jest → Vitest reference

  Templates requiring updates:
    - .specify/templates/plan-template.md          ✅ compatible
    - .specify/templates/spec-template.md           ✅ compatible
    - .specify/templates/tasks-template.md          ✅ compatible
    - .specify/templates/checklist-template.md      ✅ compatible
    - .specify/templates/agent-file-template.md     ✅ compatible

  Follow-up TODOs: (none)
  ═══════════════════════════════════════════════════════════════
-->

# ClearDay Spec Constitution

## Core Principles

### I. Component-First Architecture

All UI features MUST be implemented as self-contained, reusable
React components before being composed into pages or flows.

- Every component MUST have a single, well-defined responsibility.
- Components MUST accept data and callbacks via props; avoid
  implicit coupling to global state unless managed through an
  explicit context or store.
- Shared components MUST live in a dedicated directory
  (e.g., `src/components/`) and MUST NOT import from feature
  modules that consume them.
- Page-level compositions MUST be assembled from smaller
  components — monolithic render trees are prohibited.

**Rationale**: Composability and isolation reduce defect surface
area, accelerate review cycles, and enable independent testing.

### II. Test-Driven Quality

Tests MUST be written or updated alongside every functional
change. The project uses React Testing Library and Vitest.

- New components MUST ship with at least one behavioral test
  that asserts user-visible outcomes (render output, interaction
  results), not implementation details.
- Bug fixes MUST include a regression test that fails before the
  fix and passes after.
- Tests MUST use `@testing-library/react` idioms: query by role,
  label, or text — never by internal class name or test-only
  selectors unless no accessible alternative exists.
- `npm test` MUST pass with zero failures before any code is
  merged.

**Rationale**: Testing from the user's perspective catches real
regressions while keeping tests resilient to refactors.

### III. Accessibility by Default

Every user-facing element MUST meet WCAG 2.1 Level AA criteria.

- Interactive elements MUST be reachable and operable via
  keyboard alone.
- All images and icons MUST include meaningful `alt` text or be
  explicitly marked decorative (`alt=""`).
- Form controls MUST have associated `<label>` elements or
  `aria-label` / `aria-labelledby` attributes.
- Color MUST NOT be the sole means of conveying information;
  contrast ratios MUST meet AA thresholds (4.5:1 normal text,
  3:1 large text).
- Semantic HTML elements (`<nav>`, `<main>`, `<button>`, etc.)
  MUST be preferred over generic `<div>` / `<span>` with ARIA
  roles.

**Rationale**: Accessibility is a baseline quality attribute, not
a post-launch enhancement. Building it in from the start avoids
costly retrofits and serves all users.

### IV. Performance & Responsiveness

The application MUST deliver a fast, responsive experience
across device classes.

- Production bundles MUST be code-split at the route level at
  minimum; lazy-load heavy components with `React.lazy` /
  `Suspense`.
- No single JS bundle chunk SHOULD exceed 200 KB gzipped
  without documented justification.
- Layout MUST be responsive and functional on viewports from
  320 px to 1920 px wide.
- Unnecessary re-renders MUST be avoided; use `React.memo`,
  `useMemo`, or `useCallback` where profiling shows measurable
  benefit — but do not pre-optimize without evidence.

**Rationale**: Performance directly impacts user retention and
perceived quality. Responsive layouts ensure reach across
devices.

### V. Simplicity & Maintainability

Prefer the simplest solution that satisfies requirements. YAGNI
(You Aren't Gonna Need It) is a governing heuristic.

- New dependencies MUST be justified: document why a built-in or
  existing dependency cannot fulfil the need before adding a
  package.
- Abstractions MUST be introduced only when duplication has been
  observed at least twice — no speculative generalization.
- File and directory naming MUST follow a consistent convention
  (`PascalCase` for components, `camelCase` for utilities).
- Comments MUST explain *why*, not *what*; self-documenting code
  is preferred.
- Dead code and unused imports MUST be removed before merge.

**Rationale**: Simplicity reduces onboarding time, review
burden, and long-term maintenance cost.

## Technology Standards

The project is a client-side React application built with Vite.

- **Runtime**: React 19 with functional components and hooks.
  Class components MUST NOT be introduced.
- **Toolchain**: Vite (with `@vitejs/plugin-react`). The Vite
  configuration lives in `vite.config.js` at the project root.
- **Testing**: Vitest + React Testing Library (`@testing-library/react`,
  `@testing-library/jest-dom`, `@testing-library/user-event`).
  Vitest configuration is co-located in `vite.config.js`.
- **Linting**: ESLint. All warnings MUST be resolved before
  merge; `eslint-disable` directives require an inline
  justification comment.
- **Styling**: CSS Modules or plain CSS imported per component.
  A CSS-in-JS library may be adopted via a governance amendment
  if the team decides.
- **Browser support**: Modern evergreen browsers (Chrome, Firefox,
  Safari, Edge). Changes to browser targets require a
  constitution patch amendment.

## Development Workflow

All changes follow a branch-based workflow with review gates.

1. **Branch**: Create a feature or fix branch from `main`.
2. **Implement**: Follow the principles above (component-first,
   test-driven, accessible, performant, simple).
3. **Validate locally**:
   - `npm test` — all tests pass.
   - `npm run build` — production build succeeds with no
     warnings.
   - Manual accessibility spot-check (keyboard navigation,
     screen-reader landmark audit).
4. **Pull Request**: Open a PR with a clear description mapping
   changes to the relevant spec or user story.
5. **Review**: At least one reviewer MUST confirm:
   - Constitution compliance (principles I–V).
   - Test coverage for new behavior.
   - No new lint warnings or accessibility regressions.
6. **Merge**: Squash-merge into `main`; delete the feature
   branch.

## Governance

This constitution is the authoritative source of project
standards. In any conflict between this document and other
guidance, this document prevails.

- **Amendments**: Any team member may propose a change by
  opening a PR that modifies this file. The PR MUST include:
  1. A description of the change and its rationale.
  2. An updated version number following the versioning policy.
  3. A migration plan if the change affects existing code.
- **Versioning policy**:
  - MAJOR — backward-incompatible principle removal or
    redefinition.
  - MINOR — new principle or materially expanded guidance.
  - PATCH — clarifications, typo fixes, non-semantic
    refinements.
- **Compliance review**: Every PR review MUST include a
  constitution compliance check. The plan template's
  "Constitution Check" gate references this document's
  principles.
- **Review cadence**: The team SHOULD revisit this constitution
  quarterly to evaluate whether principles remain aligned with
  project goals.

**Version**: 1.1.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
