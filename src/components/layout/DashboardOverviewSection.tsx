import { lazy, Suspense, type ReactElement } from 'react'
import { SummaryCardsGrid } from '@/components/cards'
import { useDashboardOverview } from '@/hooks'

const BalanceTrendChart = lazy(async () => {
  const module = await import('@/components/charts/BalanceTrendChart')
  return { default: module.BalanceTrendChart }
})

const SpendingBreakdownChart = lazy(async () => {
  const module = await import('@/components/charts/SpendingBreakdownChart')
  return { default: module.SpendingBreakdownChart }
})

function DashboardEmptyState(): ReactElement {
  return (
    <article className="surface-card border-dashed p-6 text-center">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Dashboard Data Unavailable
      </h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Add transactions to view summary metrics and chart insights.
      </p>
    </article>
  )
}

function ChartFallbackCard({
  title,
}: {
  readonly title: string
}): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <div className="mt-4 h-64 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}

/**
 * Dashboard overview section containing KPI cards and primary visualizations.
 */
export function DashboardOverviewSection(): ReactElement {
  const {
    isLoading,
    transactionCount,
    summaryCards,
    balanceTrendData,
    spendingBreakdownData,
    selectedSpendingCategory,
    balanceTrendAriaLabel,
    spendingBreakdownAriaLabel,
    selectSpendingCategory,
  } = useDashboardOverview()

  return (
    <section
      id="dashboard-overview"
      aria-labelledby="dashboard-overview-title"
      className="section-reveal space-y-4"
    >
      <div>
        <h2
          id="dashboard-overview-title"
          className="text-2xl font-bold tracking-tight"
        >
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          KPI summary and visual analytics are now powered by store-backed data.
        </p>
      </div>

      {!isLoading && transactionCount === 0 ? (
        <DashboardEmptyState />
      ) : (
        <>
          <SummaryCardsGrid cards={summaryCards} isLoading={isLoading} />

          <div className="grid gap-6 xl:grid-cols-2">
            <Suspense fallback={<ChartFallbackCard title="Balance Trend" />}>
              <BalanceTrendChart
                data={balanceTrendData}
                isLoading={isLoading}
                ariaLabel={balanceTrendAriaLabel}
              />
            </Suspense>
            <Suspense
              fallback={<ChartFallbackCard title="Spending Breakdown" />}
            >
              <SpendingBreakdownChart
                data={spendingBreakdownData}
                isLoading={isLoading}
                selectedCategory={selectedSpendingCategory}
                onSelectCategory={selectSpendingCategory}
                ariaLabel={spendingBreakdownAriaLabel}
              />
            </Suspense>
          </div>
        </>
      )}
    </section>
  )
}
