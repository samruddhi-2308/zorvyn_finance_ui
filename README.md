# Zorvyn Finance Dashboard UI

Enterprise-grade frontend implementation of a finance dashboard for the internship assessment, built phase-by-phase with production standards.

## Current Status

- Planning complete
- Phase 1 complete: **Foundation and Architecture**
- Phase 2 complete: **Data Model and Utilities**
- Phase 3 complete: **State Layer and Hooks**
- Awaiting approval to start **Phase 4: Dashboard Overview Feature**

## Delivery Model

- We are implementing in controlled phases (see [plan.md](./plan.md)).
- We do **not** implement all features at once.
- At the end of each phase:
  - this README is updated
  - [IMPLEMENTATION_LOG.md](./IMPLEMENTATION_LOG.md) is updated

## Planned Tech Stack

- React 18 + Vite
- TypeScript (strict mode)
- Zustand (persist middleware)
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

## Phase 3 Completed Scope

- Added Zustand state slices:
  - [transaction.store.ts](./src/store/transaction.store.ts)
  - [filter.store.ts](./src/store/filter.store.ts)
  - [role.store.ts](./src/store/role.store.ts)
  - [ui.store.ts](./src/store/ui.store.ts)
- Added persistence middleware for transactions, filters, role, and UI preferences.
- Added custom hooks:
  - [useTransactions.ts](./src/hooks/useTransactions.ts)
  - [useFilters.ts](./src/hooks/useFilters.ts)
  - [useInsights.ts](./src/hooks/useInsights.ts)
  - [usePermission.ts](./src/hooks/usePermission.ts)
  - [useDebounce.ts](./src/hooks/useDebounce.ts)
  - [useRole.ts](./src/hooks/useRole.ts)
  - [useUI.ts](./src/hooks/useUI.ts)
- Added centralized exports:
  - [src/store/index.ts](./src/store/index.ts)
  - [src/hooks/index.ts](./src/hooks/index.ts)
- Added production-friendly logger utility:
  - [logger.ts](./src/utils/logger.ts)
- Wired app shell/header to state layer:
  - role switching
  - theme toggle with DOM theme sync
  - sidebar open/close state in store
  - transaction summary/insight data surfaced from hooks
- Validation complete:
  - `npm run format:check`
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
- [x] Phase 3 complete
- [ ] Phase 4 complete
- [ ] Phase 5 complete
- [ ] Phase 6 complete
- [ ] Phase 7 complete
- [ ] Phase 8 complete
