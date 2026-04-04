import { lazy, Suspense, useMemo, type ReactElement } from 'react'
import { SummaryCardsGrid } from '@/components/cards'
import { useCurrency, useDashboardOverview } from '@/hooks'
import type { BalanceTrendPoint, SpendingBreakdownPoint } from '@/types'

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
    <article className="surface-card section-reveal border-dashed p-7 text-center">
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
    <article className="surface-card loading-shimmer p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <div className="mt-4 h-64 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}

interface RunwaySnapshotPanelProps {
  readonly isLoading: boolean
  readonly balanceTrendData: readonly BalanceTrendPoint[]
  readonly spendingBreakdownData: readonly SpendingBreakdownPoint[]
}

interface RunwayHighlights {
  readonly currentBalance: number
  readonly runwayNetShift: number
  readonly strongestDay: BalanceTrendPoint
  readonly weakestDay: BalanceTrendPoint
}

function getRunwayHighlights(
  balanceTrendData: readonly BalanceTrendPoint[],
): RunwayHighlights | null {
  const firstPoint = balanceTrendData[0]
  const lastPoint = balanceTrendData[balanceTrendData.length - 1]

  if (!firstPoint || !lastPoint) {
    return null
  }

  let strongestDay = firstPoint
  let weakestDay = firstPoint

  for (const point of balanceTrendData) {
    if (point.net > strongestDay.net) {
      strongestDay = point
    }

    if (point.net < weakestDay.net) {
      weakestDay = point
    }
  }

  return {
    currentBalance: lastPoint.cumulativeBalance,
    runwayNetShift: lastPoint.cumulativeBalance - firstPoint.cumulativeBalance,
    strongestDay,
    weakestDay,
  }
}

function RunwaySnapshotPanel({
  isLoading,
  balanceTrendData,
  spendingBreakdownData,
}: RunwaySnapshotPanelProps): ReactElement {
  const { formatAmount } = useCurrency()
  const highlights = useMemo(
    () => getRunwayHighlights(balanceTrendData),
    [balanceTrendData],
  )
  const topSpendingCategories = useMemo(
    () => spendingBreakdownData.slice(0, 4),
    [spendingBreakdownData],
  )

  if (isLoading) {
    return <ChartFallbackCard title="Runway Snapshot" />
  }

  if (!highlights) {
    return (
      <article className="surface-card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Runway Snapshot
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Snapshot metrics appear once runway data is available.
        </p>
      </article>
    )
  }

  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Runway Snapshot
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Fast context next to the runway chart for current trajectory and risk.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/55 px-3 py-2">
          <dt className="text-xs text-[var(--color-text-muted)]">Current balance</dt>
          <dd className="mt-1 font-semibold text-[var(--color-text-primary)]">
            {formatAmount(highlights.currentBalance)}
          </dd>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/55 px-3 py-2">
          <dt className="text-xs text-[var(--color-text-muted)]">Runway shift</dt>
          <dd
            className={`mt-1 font-semibold ${
              highlights.runwayNetShift >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {formatAmount(highlights.runwayNetShift)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/45 px-3 py-3 text-xs">
        <p className="flex items-center justify-between gap-2">
          <span className="text-[var(--color-text-muted)]">Strongest day</span>
          <span className="font-semibold text-emerald-500">
            {formatAmount(highlights.strongestDay.net)}
          </span>
        </p>
        <p className="flex items-center justify-between gap-2">
          <span className="text-[var(--color-text-muted)]">Weakest day</span>
          <span className="font-semibold text-rose-500">
            {formatAmount(highlights.weakestDay.net)}
          </span>
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Expense intensity preview
        </p>
        {topSpendingCategories.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Add expense transactions to reveal category pressure.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {topSpendingCategories.map((category) => (
              <div key={category.category}>
                <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span className="truncate pr-2">{category.category}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {category.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-background)]">
                  <div
                    className="h-2 rounded-full bg-[var(--color-primary)]/70"
                    style={{ width: `${Math.max(category.percentage, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
      className="section-reveal space-y-5"
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
        <div className="grid auto-rows-[minmax(8rem,auto)] gap-5 xl:grid-cols-12">
          <div className="xl:col-span-12">
            <SummaryCardsGrid cards={summaryCards} isLoading={isLoading} />

            <div className="mt-6 border-t border-[var(--color-border)] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Runway and allocation detail
              </p>
            </div>
          </div>

          <div className="xl:col-span-8">
            <Suspense fallback={<ChartFallbackCard title="Balance Trend" />}>
              <BalanceTrendChart
                data={balanceTrendData}
                isLoading={isLoading}
                ariaLabel={balanceTrendAriaLabel}
              />
            </Suspense>
          </div>

          <div className="xl:col-span-4">
            <RunwaySnapshotPanel
              isLoading={isLoading}
              balanceTrendData={balanceTrendData}
              spendingBreakdownData={spendingBreakdownData}
            />
          </div>

          <div className="xl:col-span-12">
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
        </div>
      )}
    </section>
  )
}
