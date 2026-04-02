import { useState, type ReactElement } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

const KPI_PLACEHOLDERS = [
  'Total Balance',
  'Total Income',
  'Total Expenses',
  'Savings Rate',
] as const

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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const openMobileNav = (): void => {
    setIsMobileNavOpen(true)
  }

  const closeMobileNav = (): void => {
    setIsMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar isOpen={isMobileNavOpen} onCloseMobileNav={closeMobileNav} />

        <div className="min-h-screen">
          <Header onOpenMobileNav={openMobileNav} />

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
                  Phase 1 delivers the architecture and semantic layout shell.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {KPI_PLACEHOLDERS.map((cardTitle) => (
                  <article key={cardTitle} className="surface-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                      {cardTitle}
                    </p>
                    <p className="mt-5 text-lg font-semibold text-[var(--color-text-primary)]">
                      Placeholder
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      Connected to state in upcoming phases.
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
                Table infrastructure, filters, sorting, and CRUD interactions
                are implemented in later phases.
              </p>
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
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]"
                      >
                        Data grid scaffolding complete. Transaction data wiring
                        starts in Phase 2 and Phase 3.
                      </td>
                    </tr>
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
