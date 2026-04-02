import { useEffect, useMemo, type ReactElement } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  useInsights,
  usePermission,
  useRole,
  useTransactions,
  useUI,
} from '@/hooks'
import { formatINR } from '@/utils'

interface KpiCard {
  readonly title: string
  readonly value: string
  readonly helperText: string
}

const MODULE_PLACEHOLDERS = [
  {
    id: 'balance-trend',
    title: 'Balance Trend',
    description:
      'Time-series chart scaffold prepared for Recharts integration.',
  },
  {
    id: 'spending-breakdown',
    title: 'Spending Breakdown',
    description: 'Category chart scaffold prepared for interactive filtering.',
  },
] as const

export function AppShell(): ReactElement {
  const { currentRole, setRole } = useRole()
  const {
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
  } = useUI()

  const {
    summary,
    totalResults,
    rangeStart,
    rangeEnd,
    currentPage,
    totalPages,
    paginatedTransactions,
  } = useTransactions()
  const insights = useInsights()
  const canManageTransactions = usePermission('create')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const kpiCards = useMemo<readonly KpiCard[]>(
    () => [
      {
        title: 'Total Balance',
        value: formatINR(summary.totalBalance),
        helperText: 'Computed from all persisted transactions.',
      },
      {
        title: 'Total Income',
        value: formatINR(summary.totalIncome),
        helperText: 'Includes Salary, Freelance, and Investments.',
      },
      {
        title: 'Total Expenses',
        value: formatINR(summary.totalExpenses),
        helperText: 'Aggregated across all expense categories.',
      },
      {
        title: 'Savings Rate',
        value: `${(summary.savingsRate * 100).toFixed(1)}%`,
        helperText: 'Derived from net balance divided by income.',
      },
    ],
    [
      summary.savingsRate,
      summary.totalBalance,
      summary.totalExpenses,
      summary.totalIncome,
    ],
  )

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onCloseMobileNav={closeMobileSidebar}
        />

        <div className="min-h-screen">
          <Header
            onOpenMobileNav={openMobileSidebar}
            currentRole={currentRole}
            onRoleChange={setRole}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main
            id="main-content"
            className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 p-4 sm:p-6 lg:p-8"
          >
            <section
              id="dashboard-overview"
              aria-labelledby="dashboard-overview-title"
              className="space-y-4"
            >
              <div>
                <h2
                  id="dashboard-overview-title"
                  className="text-2xl font-bold tracking-tight"
                >
                  Dashboard Overview
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Phase 3 connects the shell to centralized Zustand state and
                  memoized hooks.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((card) => (
                  <article key={card.title} className="surface-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      {card.title}
                    </p>
                    <p className="mt-5 text-lg font-semibold text-[var(--color-text-primary)]">
                      {card.value}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {card.helperText}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="insights-overview"
              aria-label="Visualization module scaffold"
              className="grid gap-6 xl:grid-cols-2"
            >
              {MODULE_PLACEHOLDERS.map((module) => (
                <article key={module.id} className="surface-card p-5">
                  <h3 className="text-lg font-semibold">{module.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {module.description}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    {module.id === 'balance-trend'
                      ? insights.spendingTrend.summary
                      : `Top expense category: ${
                          insights.highestSpendingCategory.category ?? 'N/A'
                        }`}
                  </p>
                  <div
                    className="mt-5 h-64 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-background)]"
                    role="img"
                    aria-label={`${module.title} visualization placeholder`}
                  />
                </article>
              ))}
            </section>

            <section
              id="transactions-overview"
              aria-labelledby="transactions-overview-title"
              className="surface-card p-5"
            >
              <h3
                id="transactions-overview-title"
                className="text-lg font-semibold"
              >
                Transactions Module Skeleton
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Transaction pagination, role permissions, and derived views are
                now connected to Phase 3 state hooks.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="rounded-md border border-[var(--color-border)] px-2 py-1">
                  Active role: {currentRole}
                </span>
                <span className="rounded-md border border-[var(--color-border)] px-2 py-1">
                  Can manage transactions:{' '}
                  {canManageTransactions ? 'Yes' : 'No'}
                </span>
                <span className="rounded-md border border-[var(--color-border)] px-2 py-1">
                  Showing {rangeStart}-{rangeEnd} of {totalResults} results
                </span>
                <span className="rounded-md border border-[var(--color-border)] px-2 py-1">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--color-border)]">
                <table
                  className="min-w-full border-collapse"
                  aria-label="Transactions placeholder table"
                >
                  <thead className="bg-[var(--color-background)]">
                    <tr>
                      {[
                        'Date',
                        'Description',
                        'Category',
                        'Type',
                        'Amount',
                      ].map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"
                        >
                          No transactions match the active filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.slice(0, 3).map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-t border-[var(--color-border)]"
                        >
                          <td className="px-4 py-3 text-sm">
                            {transaction.date}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {transaction.category}
                          </td>
                          <td className="px-4 py-3 text-sm capitalize">
                            {transaction.type}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold">
                            {formatINR(transaction.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
