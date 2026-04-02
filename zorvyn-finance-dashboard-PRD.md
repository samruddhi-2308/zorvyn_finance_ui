# 📋 Product Requirements Document

## Zorvyn — Finance Dashboard UI

**For:** GitHub Copilot / AI-assisted development  
**Author:** Principal Frontend Engineer  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## 1. Project Overview

Build a **Finance Dashboard UI** as a frontend-only, single-page application. The product simulates a personal finance tracker for a fintech company (Zorvyn). It must be evaluated as enterprise-grade code — not a toy prototype.

**This is not a design exercise. It is an engineering exercise that also looks good.**

---

## 2. Technology Stack

| Concern          | Decision                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Framework        | **React 18** (functional components + hooks only, no class components)       |
| Styling          | **Tailwind CSS** + CSS custom properties (`--var`) for theming               |
| State Management | **Zustand** (lightweight, no boilerplate)                                    |
| Charts           | **Recharts** (composable, declarative)                                       |
| Language         | **JavaScript (ES2022+)** — no TypeScript required but JSDoc types encouraged |
| Data             | **Static mock data** — JSON files, no backend                                |
| Routing          | **React Router v6** (optional, or conditional rendering)                     |
| Build Tool       | **Vite**                                                                     |
| Linting          | **ESLint** with Airbnb config                                                |

---

## 3. Architecture Constraints (Non-Negotiable)

These mirror Zorvyn's enterprise engineering standards:

### 3.1 Component Modularity

- Every UI element is a **reusable, single-responsibility component**
- Folder structure enforces separation:
  ```
  src/
  ├── components/        # Pure UI components (no business logic)
  │   ├── cards/
  │   ├── charts/
  │   ├── transactions/
  │   ├── insights/
  │   └── layout/
  ├── store/             # Zustand state slices
  ├── data/              # Mock JSON datasets
  ├── hooks/             # Custom hooks (useTransactions, useFilters, useRole)
  ├── utils/             # Pure utility functions (formatCurrency, groupByCategory, etc.)
  └── constants/         # Enums, role definitions, category lists
  ```

### 3.2 State Management

- **All app state lives in Zustand store** — never in scattered local `useState` unless strictly component-local (e.g., tooltip hover)
- State slices:
  - `transactionStore` — raw transactions array, CRUD operations
  - `filterStore` — active filters, search query, sort direction
  - `roleStore` — current active role (`VIEWER` | `ADMIN`)
  - `uiStore` — theme, sidebar open/close

### 3.3 Data Flow

- Components **never fetch or transform data directly**
- All data access via **custom hooks** that talk to the Zustand store
- Utilities handle all formatting and computation — components only render

### 3.4 Performance

- Use **`useMemo`** for derived data (filtered lists, computed totals, grouped categories)
- Use **`useCallback`** for event handlers passed as props
- Use **event delegation** for transaction list interactions — do not attach per-row listeners
- Use **`DocumentFragment`** pattern (or React's virtual DOM batching) for large list renders

### 3.5 Accessibility

- All interactive elements have ARIA labels: `aria-label`, `aria-describedby`, `role`
- Semantic HTML5 tags throughout: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`, `<aside>`
- Keyboard navigable: `Tab`, `Enter`, `Escape` work everywhere
- Sufficient color contrast (WCAG AA minimum)
- Charts have `aria-label` descriptions with text summaries

### 3.6 Error Handling

- Every data operation wrapped in try/catch
- UI never crashes — always renders a graceful empty state or error message
- Empty states: illustrated, not blank (icon + message + optional CTA)

### 3.7 CSS Architecture

- **CSS custom properties** for all colors, spacing, font sizes:
  ```css
  :root {
    --color-primary: #6366f1;
    --color-success: #22c55e;
    --color-danger: #ef4444;
    --color-surface: #ffffff;
    --color-background: #f8fafc;
    --color-text-primary: #0f172a;
    --color-text-muted: #64748b;
    --radius-card: 12px;
    --shadow-card:
      0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  }
  ```
- No magic numbers in components — always reference a variable or a Tailwind token

---

## 4. Mock Data Specification

Create a realistic dataset at `src/data/transactions.json`.

### Transaction Object Schema

```json
{
  "id": "txn_001",
  "date": "2025-06-14",
  "description": "Grocery Store - BigBasket",
  "amount": 2340.5,
  "type": "expense",
  "category": "Food & Groceries",
  "paymentMethod": "UPI",
  "status": "completed"
}
```

### Required Mock Data

- **Minimum 40 transactions** spanning 3 months (April–June 2025)
- Categories: `Food & Groceries`, `Transport`, `Entertainment`, `Utilities`, `Healthcare`, `Shopping`, `Salary`, `Freelance`, `Investments`
- Mix of income (`Salary`, `Freelance`) and expenses
- Varying amounts: small (₹50) to large (₹85,000 salary)
- At least 2–3 recurring patterns (monthly salary, weekly groceries)
- Currency: **Indian Rupee (₹)**

### Summary Data

```json
{
  "totalBalance": 142650.0,
  "totalIncome": 210000.0,
  "totalExpenses": 67350.0,
  "savingsRate": 0.32
}
```

---

## 5. Feature Specifications

---

### 5.1 Feature: Dashboard Overview

**Route/View:** `/` or default view (Dashboard)

#### 5.1.1 Summary Cards

Render 4 KPI cards at the top:

| Card           | Icon       | Value     | Color accent |
| -------------- | ---------- | --------- | ------------ |
| Total Balance  | Wallet     | ₹1,42,650 | Indigo       |
| Total Income   | Arrow Up   | ₹2,10,000 | Green        |
| Total Expenses | Arrow Down | ₹67,350   | Red          |
| Savings Rate   | Percent    | 32%       | Blue         |

**Card Component Props:**

```js
// SummaryCard.jsx
// Props: { title, value, icon, trend, trendValue, colorVariant }
// trend: 'up' | 'down' | 'neutral'
// Renders: icon, title, formatted value, trend badge (e.g., "+12% vs last month")
```

#### 5.1.2 Time-Based Visualization — Balance Trend Chart

- **Chart type:** `AreaChart` (Recharts)
- **X-axis:** Month (Apr, May, Jun)
- **Y-axis:** Balance in ₹
- **Two series:** Income line (green) and Expenses line (red) overlaid
- **Tooltip:** Shows exact values on hover
- **Responsive:** Uses `ResponsiveContainer` with `width="100%" height={280}`

#### 5.1.3 Categorical Visualization — Spending Breakdown Chart

- **Chart type:** `PieChart` with `Cell` components for colors OR `BarChart` — your choice
- **Data:** Total spend per category
- **Legend:** Color-coded, positioned right or bottom
- **Click interaction:** Clicking a segment filters the transaction list to that category

---

### 5.2 Feature: Transactions Section

**Route/View:** `/transactions` or in-page section

#### 5.2.1 Transaction List

Render transactions in a styled table or card list. Each row must show:

- Date (formatted: `14 Jun 2025`)
- Description
- Category (badge/pill styled)
- Type badge (`Income` in green, `Expense` in red)
- Amount (right-aligned, color-coded)
- Status dot (`completed`, `pending`)

#### 5.2.2 Search

- Real-time search input
- Searches across: `description`, `category`
- Debounced — use a `useDebounce` custom hook (300ms delay) — do **not** filter on every keystroke without debounce

#### 5.2.3 Filters

Provide filter controls for:

- **Type:** All | Income | Expense (button group)
- **Category:** Dropdown multi-select
- **Date Range:** Start date + End date (native `<input type="date">`)

All filters are composable — they AND together.

#### 5.2.4 Sorting

Column headers for Date, Amount, Category must be clickable to sort ascending/descending. Show a sort indicator arrow.

#### 5.2.5 Pagination or Virtual Scroll

If > 20 transactions match filters, paginate (10 per page) with prev/next controls. Show "Showing 1–10 of 34 results".

#### 5.2.6 Admin-only: Add Transaction Modal

Visible only when role = `ADMIN`. A "Add Transaction" button opens a modal form with fields:

- Description (text, required)
- Amount (number, required, > 0)
- Type (radio: Income / Expense)
- Category (select dropdown)
- Date (date picker, defaults to today)

Validation: All required fields checked before submission. Errors shown inline below each field. On submit, dispatch to Zustand store — new transaction appears instantly.

#### 5.2.7 Admin-only: Edit / Delete

Each row has an actions menu (three-dot icon) with Edit and Delete when role = `ADMIN`. Viewer role sees no action column.

---

### 5.3 Feature: Role-Based UI

**No backend or auth needed. This is purely a frontend simulation.**

#### Roles

```js
export const ROLES = {
  VIEWER: 'VIEWER',
  ADMIN: 'ADMIN',
}
```

#### Role Switcher

A `<select>` dropdown in the header/navbar:

```
Role: [Viewer ▼]  ← switches between Viewer / Admin
```

Changing the role updates `roleStore.currentRole` and triggers re-renders.

#### Behavioral Differences

| Feature            | Viewer      | Admin         |
| ------------------ | ----------- | ------------- |
| View dashboard     | ✅          | ✅            |
| View transactions  | ✅          | ✅            |
| Search & filter    | ✅          | ✅            |
| Add transaction    | ❌ (hidden) | ✅            |
| Edit transaction   | ❌ (hidden) | ✅            |
| Delete transaction | ❌ (hidden) | ✅            |
| Export data        | ❌ (hidden) | ✅ (optional) |

Use a `useRole` hook or `usePermission(action)` utility that returns `true/false` — never inline the role check directly in JSX everywhere.

```js
// hooks/usePermission.js
export function usePermission(action) {
  const role = useRoleStore((s) => s.currentRole)
  const permissions = {
    ADMIN: ['read', 'create', 'update', 'delete'],
    VIEWER: ['read'],
  }
  return permissions[role]?.includes(action) ?? false
}
```

---

### 5.4 Feature: Insights Section

**Route/View:** `/insights` or in-page section

Show 4 insight cards computed from transaction data:

#### Insight 1 — Highest Spending Category

- Category name + icon
- Total spent: ₹XX,XXX
- % of total expenses: XX%
- Visual: horizontal progress bar

#### Insight 2 — Monthly Comparison

- Table or grouped bar chart: April vs May vs June
- Columns: Income, Expenses, Net
- Highlight the best and worst month

#### Insight 3 — Spending Trend

- "Your spending increased by 18% compared to last month" (derived from data)
- Color: green if decreased, red if increased

#### Insight 4 — Top 3 Expense Categories

- Ranked list with amounts and bars
- Each shows percentage of total spend

All insights are **computed in a `useInsights` hook** using `useMemo` — never computed in the component body.

---

### 5.5 Feature: Responsive Layout

#### Breakpoints (Tailwind)

| Breakpoint            | Layout                                      |
| --------------------- | ------------------------------------------- |
| `< 640px` (mobile)    | Single column, bottom nav or hamburger menu |
| `640–1024px` (tablet) | Two-column cards, collapsible sidebar       |
| `> 1024px` (desktop)  | Sidebar + main content, 3–4 column cards    |

#### Sidebar Navigation

- Desktop: fixed left sidebar, 240px wide
- Mobile: drawer (slides in from left), triggered by hamburger icon
- Navigation items: Dashboard, Transactions, Insights
- Active state highlighted
- Sidebar collapses to icon-only mode on toggle

---

### 5.6 Feature: Dark Mode (Optional but Strongly Recommended)

Toggle in header. Switches between light/dark via CSS custom property overrides:

```css
[data-theme='dark'] {
  --color-surface: #1e293b;
  --color-background: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-text-muted: #94a3b8;
}
```

Persists to `localStorage` key `zorvyn_theme`.

---

### 5.7 Feature: Data Persistence (Optional but Recommended)

Persist Zustand store to `localStorage`:

- Transactions (including admin-added ones)
- Active role
- Theme preference
- Active filters

Use Zustand's `persist` middleware:

```js
import { persist } from 'zustand/middleware';
const useTransactionStore = create(persist((set) => ({ ... }), { name: 'zorvyn-transactions' }));
```

---

## 6. UI/UX Design Direction

**Aesthetic:** Clean, professional, fintech-grade. Think Razorpay Dashboard or Groww — not a beginner project.

- **Font:** Inter (Google Fonts)
- **Color palette:** Indigo primary, slate gray backgrounds, green/red for income/expense
- **Cards:** Subtle shadow, 12px border radius, white background (dark: slate-800)
- **Charts:** Recharts with custom colors matching CSS variables
- **Micro-interactions:** Hover states on cards (lift shadow), smooth filter transitions, modal fade-in
- **Empty states:** Icon + descriptive message + action button (e.g., "No transactions found. Try adjusting your filters.")
- **Loading states:** Skeleton shimmer placeholders (even for mock data — show briefly on mount)

---

## 7. File & Code Quality Standards

### File Naming

- Components: `PascalCase.jsx` (e.g., `SummaryCard.jsx`)
- Hooks: `camelCase.js` prefixed with `use` (e.g., `useTransactions.js`)
- Utils: `camelCase.js` (e.g., `formatCurrency.js`)
- Store slices: `camelCase.store.js` (e.g., `transaction.store.js`)

### Code Standards

- **No `any`-equivalent patterns** — always handle the undefined/null case
- **No inline styles** — Tailwind classes or CSS variables only
- **No `console.log` in production code** — use a `logger` utility
- **JSDoc for all exported functions:**
  ```js
  /**
   * Formats a number as Indian Rupee currency string
   * @param {number} amount
   * @returns {string} e.g., "₹1,42,650.00"
   */
  export function formatINR(amount) { ... }
  ```
- **`PropTypes`** defined for all components (or JSDoc `@type` annotations)

### Utility Functions Required

```
utils/
├── formatCurrency.js      # formatINR(amount) → "₹1,42,650"
├── formatDate.js          # formatDate(iso) → "14 Jun 2025"
├── groupBy.js             # groupBy(arr, key) → { [key]: [...items] }
├── computeSummary.js      # computeSummary(transactions) → { totalBalance, income, expenses, savingsRate }
├── computeInsights.js     # computeInsights(transactions) → { topCategory, monthlyComparison, trend }
└── filterTransactions.js  # filterTransactions(transactions, filters) → filtered[]
```

---

## 8. README Requirements

The README.md must include:

1. **Project title + one-line description**
2. **Live demo link** (if deployed to Vercel/Netlify)
3. **Tech stack list**
4. **Setup instructions:**
   ```bash
   git clone <repo>
   cd zorvyn-dashboard
   npm install
   npm run dev
   ```
5. **Architecture overview** — folder structure with brief descriptions
6. **Feature list** — what's implemented
7. **Role switching instructions** — how to toggle roles
8. **Design decisions** — why Zustand over Redux, why Recharts, any trade-offs
9. **Optional features implemented** — which of the optional items were built
10. **Known limitations** — be honest about what wasn't completed and why

---

## 9. Evaluation Rubric (Mapped to Implementation)

| Criterion           | What Copilot Must Produce                                        |
| ------------------- | ---------------------------------------------------------------- |
| Design & Creativity | Polished Tailwind UI, consistent spacing, professional color use |
| Responsiveness      | Sidebar collapses on mobile, cards reflow, charts resize         |
| Functionality       | All 6 core features work, role switching changes UI correctly    |
| User Experience     | Smooth filters, clear empty states, intuitive navigation         |
| Technical Quality   | Modular components, no prop drilling, clean hooks                |
| State Management    | Zustand store, derived state via `useMemo`, persist middleware   |
| Documentation       | Comprehensive README, JSDoc on all utils                         |
| Attention to Detail | ARIA labels, debounced search, skeleton loading, error fallbacks |

---

## 10. Out of Scope

- Backend / API server
- Authentication / JWT
- Real database
- SSR / Next.js (Vite SPA only)
- Testing (unit/integration) — not required for submission but code should be testable

---

## 11. Deliverables

| Deliverable                      | Required                |
| -------------------------------- | ----------------------- |
| GitHub repository (public)       | ✅                      |
| Live deployment (Vercel/Netlify) | ✅ Strongly recommended |
| README.md                        | ✅                      |
| Source code in `/src`            | ✅                      |
| Mock data in `src/data/`         | ✅                      |

---

## 12. Implementation Order for Copilot

Follow this order to avoid dependency issues:

1. **Project scaffold** — `npm create vite@latest`, install dependencies, set up Tailwind, configure folder structure
2. **Mock data** — create `transactions.json` with 40+ entries
3. **Zustand stores** — transaction, filter, role, ui slices
4. **Utility functions** — format, compute, filter utils
5. **Custom hooks** — `useTransactions`, `useFilters`, `useInsights`, `usePermission`
6. **Layout components** — Sidebar, Header, RoleSwitcher, Layout wrapper
7. **Summary Cards** — SummaryCard component + dashboard grid
8. **Charts** — BalanceTrendChart, SpendingPieChart
9. **Transaction list** — table, search, filters, sort, pagination
10. **Add/Edit modal** — form with validation (admin only)
11. **Insights section** — 4 insight cards with computed data
12. **Responsiveness** — mobile sidebar drawer, breakpoint adjustments
13. **Dark mode** — CSS variable swap, toggle, persistence
14. **Data persistence** — Zustand persist middleware
15. **README** — document everything
16. **Polish** — empty states, loading skeletons, ARIA labels, hover micro-interactions

---

_End of PRD — This document is the single source of truth for the Zorvyn Finance Dashboard UI assignment._
