# Zorvyn Finance Dashboard UI

Enterprise-grade frontend implementation of a finance dashboard for the internship assessment, built phase-by-phase with production standards.

## Current Status

- Planning complete
- Phase 1 complete: **Foundation and Architecture**
- Phase 2 complete: **Data Model and Utilities**
- Awaiting approval to start **Phase 3: State Layer and Hooks**

## Delivery Model

- We are implementing in controlled phases (see [plan.md](./plan.md)).
- We do **not** implement all features at once.
- At the end of each phase:
  - this README is updated
  - [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md) is updated

## Planned Tech Stack

- React 18 + Vite
- TypeScript (strict mode)
- Zustand
- Recharts
- Tailwind CSS + CSS variables
- ESLint + Prettier

## Phase 1 Completed Scope

- Scaffolded Vite + React + TypeScript project in repository root
- Configured strict TypeScript compiler options and `@/*` import alias
- Added Tailwind CSS + PostCSS with theme token integration
- Hardened ESLint (TypeScript strict + accessibility + Prettier compatibility)
- Added Prettier configuration and scripts
- Implemented semantic base app shell:
  - responsive sidebar + header layout
  - dashboard/visualization/transactions module placeholders
  - skip link and ARIA-friendly landmarks
- Created modular architecture folders:
  - `src/components/{cards,charts,transactions,insights,layout}`
  - `src/store`, `src/hooks`, `src/utils`, `src/constants`, `src/data`, `src/types`
- Validation complete:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

## Phase 2 Completed Scope

- Added realistic mock dataset with 46 transactions across April-June 2025:
  - [transactions.json](./src/data/transactions.json)
- Added strict finance domain typing:
  - [finance.ts](./src/types/finance.ts)
- Added finance constants for categories, status, types, and payment methods:
  - [finance.ts](./src/constants/finance.ts)
- Added typed transaction data export with runtime validation:
  - [transactions.ts](./src/data/transactions.ts)
  - [validateTransactions.ts](./src/utils/validateTransactions.ts)
- Implemented reusable utility layer:
  - currency/date formatters
  - grouping and sorting
  - composable filtering
  - summary computation
  - insights computation
- Utility exports consolidated through:
  - [index.ts](./src/utils/index.ts)
- Validation complete:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`

## Local Setup

```bash
npm install
npm run dev
```

## Planned Feature Set

- Dashboard overview (summary cards + charts)
- Transactions (search, filter, sort, pagination)
- Role-based UI (Viewer/Admin simulation)
- Insights panel (computed analytics)
- Responsive layout + accessibility
- Optional: dark mode + persisted preferences

## Progress Checklist

- [x] Requirements review complete
- [x] PRD review complete
- [x] Execution plan documented
- [x] Phase 1 complete
- [x] Phase 2 complete
- [ ] Phase 3 complete
- [ ] Phase 4 complete
- [ ] Phase 5 complete
- [ ] Phase 6 complete
- [ ] Phase 7 complete
- [ ] Phase 8 complete
