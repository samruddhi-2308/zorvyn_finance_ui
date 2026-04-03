import type { ReactElement } from 'react'
import {
  HighestSpendingCategoryCard,
  InsightsEmptyState,
  MonthlyComparisonPanel,
  SpendingTrendCard,
  TopExpenseCategoriesCard,
} from '@/components/insights'
import { useInsightsOverview } from '@/hooks'

/**
 * Insights section composed from memoized, store-driven analytics.
 */
export function InsightsSection(): ReactElement {
  const {
    isLoading,
    hasAnyInsightData,
    highestSpendingCategory,
    monthlyComparison,
    bestMonth,
    worstMonth,
    spendingTrend,
    topExpenseCategories,
    monthlyComparisonAriaLabel,
    topExpenseCategoriesAriaLabel,
  } = useInsightsOverview()

  return (
    <section
      id="insights-overview"
      aria-labelledby="insights-overview-title"
      className="section-reveal space-y-7"
    >
      <div>
        <h2
          id="insights-overview-title"
          className="text-2xl font-bold tracking-tight"
        >
          Insights
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Data-driven highlights across spending concentration, monthly health,
          and expense momentum.
        </p>
      </div>

      {!isLoading && !hasAnyInsightData ? (
        <InsightsEmptyState />
      ) : (
        <div className="grid gap-8 xl:grid-cols-12">
          <div className="space-y-8 xl:col-span-4">
            <HighestSpendingCategoryCard
              insight={highestSpendingCategory}
              isLoading={isLoading}
            />
            <SpendingTrendCard trend={spendingTrend} isLoading={isLoading} />
          </div>

          <div className="space-y-8 xl:col-span-8">
            <MonthlyComparisonPanel
              entries={monthlyComparison}
              bestMonth={bestMonth}
              worstMonth={worstMonth}
              ariaLabel={monthlyComparisonAriaLabel}
              isLoading={isLoading}
            />
            <TopExpenseCategoriesCard
              categories={topExpenseCategories}
              ariaLabel={topExpenseCategoriesAriaLabel}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </section>
  )
}
