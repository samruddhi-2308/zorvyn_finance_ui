import { useEffect, type ReactElement } from 'react'
import { DashboardOverviewSection } from '@/components/layout/DashboardOverviewSection'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { usePermission, useRole, useTransactions, useUI } from '@/hooks'
import { formatDate, formatINR } from '@/utils'

/**
 * Top-level application shell that composes layout and section containers.
 */
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
    totalResults,
    rangeStart,
    rangeEnd,
    currentPage,
    totalPages,
    paginatedTransactions,
  } = useTransactions()

  const canManageTransactions = usePermission('create')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
            <DashboardOverviewSection />

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
                connected. Full filters and controls arrive in Phase 5.
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
                            {formatDate(transaction.date)}
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
