# Zorvyn Finance Dashboard UI

Frontend Developer Internship Assignment Submission

Finance dashboard application focused on UI quality, structured frontend architecture, and role-based interactions using mock data only.

## 1. Assignment Context

This project was built for the Finance Dashboard UI assignment brief. The app is frontend-only (no backend dependency) and demonstrates:

- dashboard summary and visual analytics
- transactions exploration and management
- basic role-based behavior simulation
- computed insights from transaction data
- responsive and accessible UX patterns

## 2. Live Demo

- Live URL: Add Netlify URL here after deployment
- Local URL: http://localhost:5173/

Netlify deployment is pre-configured through netlify.toml.

## 3. Requirement Coverage (Assignment Crosswalk)

### 3.1 Dashboard Overview

- Implemented summary cards: Total Balance, Total Income, Total Expenses, Savings Rate
- Implemented time-based chart: monthly balance trend (income vs expense)
- Implemented categorical chart: spending breakdown with chart-to-filter interaction

### 3.2 Transactions Section

- Transaction list includes date, amount, category, type, status
- Implemented search and sorting
- Implemented composable filters: type, category, date range
- Implemented pagination when result count is high

### 3.3 Basic Role-Based UI

- Role switcher in header (Viewer/Admin)
- Viewer: read-only access
- Admin: add/edit/delete transactions through modal/actions/menu
- Admin-only CSV export action in transactions toolbar

### 3.4 Insights Section

- Highest spending category
- Monthly comparison
- Spending trend observation
- Top expense categories ranking

### 3.5 State Management

- Zustand stores for transactions, filters, role, UI preferences
- Derived state via feature hooks and memoized selectors

### 3.6 UI/UX Expectations

- Responsive layout for mobile/tablet/desktop
- Desktop sidebar supports icon-only collapse mode
- Empty and loading states across sections
- Accessibility enhancements (keyboard flow, ARIA labels, focus handling)

## 4. Optional Enhancements Implemented

- Dark mode with persistence
- Local storage persistence for key state slices
- CSV export for filtered transactions
- Animated transitions and skeleton loading patterns
- Floating help panel and keyboard shortcuts
- Quick actions strip for navigation and search acceleration

## 5. Tech Stack

- React + Vite
- TypeScript (strict)
- Zustand
- Recharts
- Tailwind CSS + CSS variables
- ESLint + Prettier

## 6. Project Structure

```text
src/
  components/
    cards/
    charts/
    insights/
    layout/
    transactions/
  constants/
  data/
  hooks/
  store/
  types/
  utils/
```

Architecture intent:

- components: presentation and interaction surfaces
- hooks: orchestration and derived-view logic
- store: global state slices + persistence
- utils: deterministic data transforms and formatting helpers
- data: static transaction dataset and typed exports

## 7. Local Setup

```bash
git clone <your-repo-url>
cd Zorvyn_Finance_UI
npm install
npm run dev
```

## 8. Scripts

- npm run dev: run Vite dev server
- npm run build: type-check + production build
- npm run preview: preview production build locally
- npm run lint: lint with zero warnings
- npm run typecheck: TypeScript project checks
- npm run test: run unit tests (Vitest)
- npm run test:watch: run Vitest in watch mode
- npm run format: format repository
- npm run format:check: validate formatting

## 9. Quality Gates

- Unit test suite with Vitest
- CI workflow at .github/workflows/ci.yml
- Pull request and push checks run lint
- Pull request and push checks run typecheck
- Pull request and push checks run unit tests
- Pull request and push checks run production build

## 10. Role Switching Guide

- Use the Role dropdown in the top header
- Viewer role can browse dashboards, transactions, and insights
- Viewer role cannot create/edit/delete records
- Admin role can add transactions
- Admin role can edit/delete existing transactions
- Admin role can export filtered transactions as CSV

## 11. Branding Handoff

Place company logo at:

- public/branding/zorvyn-logo.png

The shared branding component is already wired to this path and used across header/sidebar.

## 12. Design and Engineering Decisions

- Zustand over Redux:
  - lower boilerplate for assignment scope
  - strong fit for slice-based frontend state with persistence
- Recharts for visualizations:
  - fast implementation with responsive containers
  - good balance between customization and readability
- In-page section architecture instead of full route split:
  - simplifies stakeholder demos
  - keeps navigation fast and predictable for assignment review
- TypeScript strict mode:
  - safer refactors
  - explicit contracts across feature modules

## 13. Accessibility and UX Notes

- Semantic sectioning and skip link
- ARIA labels on major controls and charts
- Focus trap patterns on overlays
- ESC handling in overlays and menus
- Reduced-motion support fallback

## 14. Performance Notes

- Lazy loading for heavier sections/charts
- Memoized derived state in hooks
- Skeleton loading patterns to improve perceived responsiveness

## 15. Known Limitations

- No backend integration (assignment intentionally frontend-only)
- No authentication/authorization service (role simulation only)
- E2E/browser integration tests are not yet included
- No telemetry/error monitoring integration

## 16. Assignment/PRD Delta Notes (Transparency)

The core assignment requirements are met. The following are known deltas versus stricter PRD-style standards:

- React version is 19.x instead of PRD-suggested React 18
- ESLint config is modern flat config, not Airbnb preset
- README includes deployment placeholder until live URL is added

## 17. Handoff Checklist

- Update live demo link after Netlify deploy
- Add final company logo at public branding path
- Perform final UI pass on target stakeholder screen resolutions
