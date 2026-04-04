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

- Live URL: https://zorvynfinanceui.netlify.app/ 
- Local URL: http://localhost:5173/


## 3. Requirement Coverage (Assignment Crosswalk)

### 3.1 Dashboard Overview

- Implemented summary cards: Total Balance, Total Income, Total Expenses, and Savings Rate
- Implemented a time-based visualization: Cumulative Balance Runway (daily series over two years) with an interactive brush window
- Default runway brush period is set to 3 February through 15 September; users can move and resize the period as needed
- Implemented a categorical visualization: Spending Breakdown Treemap with a companion category panel
- Treemap and category panel support click-to-filter behavior for faster transaction exploration

### 3.2 Transactions Section

- Transaction list includes date, amount, category, type, status
- Implemented search and sorting
- Implemented composable filters: type, category, and quick temporal windows (Month-to-Date, Year-to-Date, Last 30 Days, Previous Quarter)
- Implemented pagination when result count is high (5 rows per page)

### 3.3 Basic Role-Based UI

- Role switcher in header (Viewer/Admin)
- Default role is Admin on first load
- Viewer: read-only access
- Admin: add/edit/delete transactions through modal/actions/menu

### 3.4 Insights Section

- Highest spending category
- Monthly comparison
- Spending trend observation
- Top expense categories ranking

### 3.5 State Management

- Zustand stores for transactions, filters, role, and UI preferences
- Derived state is composed through feature hooks and memoized selectors

### 3.6 UI/UX Expectations

- Responsive layout for mobile/tablet/desktop
- Clean, readable interface with a fixed top header and clear section hierarchy
- Header includes brand logo plus a menu dropdown for Dashboard, Transactions, and Insights navigation
- Empty and loading states across dashboard, transactions, and insights
- Accessibility support: keyboard flow, ARIA labels, focus handling, and reduced-motion fallbacks

## 4. Features Added Beyond Assignment Scope (Own Additions)

These enhancements were added intentionally beyond the mandatory assignment brief:

- Dark mode with persistence
- Currency mode switcher (INR default, with USD/EUR/GBP options)
- Local storage persistence for key state slices (transactions, filters, role, and UI preferences)
- Admin-only report export actions in transactions toolbar (CSV and PDF)
- Animated interactions (count-up metrics, hover transitions, section reveal-on-scroll)
- Floating help panel and keyboard shortcuts
- Quick actions strip for jump navigation and search focus
- Dense daily balance runway model with detailed custom tooltips and brush-driven exploration
- Enhanced Spending Breakdown experience with compact Treemap + category control panel

## 5. Tech Stack

- React + Vite
- TypeScript (strict)
- Zustand
- Recharts
- Framer Motion
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
- Use the Currency dropdown in the top header to switch between INR, USD, EUR, and GBP
- Viewer role can browse dashboards, transactions, and insights
- Viewer role cannot create/edit/delete records
- Admin role can add transactions
- Admin role can edit/delete existing transactions
- Admin role can export filtered dashboard state as CSV or PDF reports


## 11. Design and Engineering Decisions

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

## 12. Accessibility and UX Notes

- Semantic sectioning and skip link
- ARIA labels on major controls and charts
- Focus trap patterns on overlays
- ESC handling in overlays and menus
- Reduced-motion support fallback

## 13. Performance Notes

- Lazy loading for heavier sections/charts
- Memoized derived state in hooks
- Skeleton loading patterns to improve perceived responsiveness

## 14. Known Limitations

- No backend integration (assignment intentionally frontend-only)
- No authentication/authorization service (role simulation only)
- E2E/browser integration tests are not yet included
- No telemetry/error monitoring integration

## 15. Assignment/PRD Delta Notes (Transparency)

The core assignment requirements are met.

## 16. Handoff Checklist

- Update live demo link after Netlify deploy
- Add final company logo at public branding path
- Perform final UI pass on target stakeholder screen resolutions
