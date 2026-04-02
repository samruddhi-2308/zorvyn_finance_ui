import { useEffect, useState } from 'react'
import type { InsightsSnapshot } from '@/types'
import { formatINR } from '@/utils'
import { useInsights } from './useInsights'

interface UseInsightsOverviewResult extends InsightsSnapshot {
  readonly isLoading: boolean
  readonly hasAnyInsightData: boolean
  readonly monthlyComparisonAriaLabel: string
  readonly topExpenseCategoriesAriaLabel: string
}

function buildMonthlyComparisonAriaLabel(insights: InsightsSnapshot): string {
  if (insights.monthlyComparison.length === 0) {
    return 'Monthly comparison data is unavailable because there are no transactions grouped by month.'
  }

  const firstMonth = insights.monthlyComparison[0]
  const lastMonth =
    insights.monthlyComparison[insights.monthlyComparison.length - 1]

  if (!firstMonth || !lastMonth) {
    return 'Monthly comparison data is unavailable because there are no transactions grouped by month.'
  }

  const bestMonthSummary =
    insights.bestMonth !== null
      ? `Best net month is ${insights.bestMonth.monthLabel} at ${formatINR(insights.bestMonth.net)}.`
      : 'Best net month is unavailable.'

  const worstMonthSummary =
    insights.worstMonth !== null
      ? `Lowest net month is ${insights.worstMonth.monthLabel} at ${formatINR(insights.worstMonth.net)}.`
      : 'Lowest net month is unavailable.'

  return `Monthly comparison from ${firstMonth.monthLabel} to ${lastMonth.monthLabel}. ${bestMonthSummary} ${worstMonthSummary}`
}

function buildTopExpenseCategoriesAriaLabel(
  insights: InsightsSnapshot,
): string {
  if (insights.topExpenseCategories.length === 0) {
    return 'Top expense categories are unavailable because there are no expense transactions.'
  }

  const firstCategory = insights.topExpenseCategories[0]

  if (!firstCategory) {
    return 'Top expense categories are unavailable because there are no expense transactions.'
  }

  return `Top expense categories ranking. Rank one is ${firstCategory.category} at ${formatINR(firstCategory.totalSpent)}, which is ${firstCategory.percentageOfTotalExpenses.toFixed(1)} percent of total expenses.`
}

/**
 * Provides UI-ready insight view models and accessibility labels.
 */
export function useInsightsOverview(): UseInsightsOverviewResult {
  const [isLoading, setIsLoading] = useState(true)
  const insights = useInsights()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  const hasAnyInsightData =
    insights.monthlyComparison.length > 0 ||
    insights.topExpenseCategories.length > 0

  return {
    ...insights,
    isLoading,
    hasAnyInsightData,
    monthlyComparisonAriaLabel: buildMonthlyComparisonAriaLabel(insights),
    topExpenseCategoriesAriaLabel: buildTopExpenseCategoriesAriaLabel(insights),
  }
}
