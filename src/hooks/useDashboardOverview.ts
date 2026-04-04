import { useEffect, useMemo, useState } from 'react'
import { useCurrency } from '@/hooks/useCurrency'
import { useFilters } from '@/hooks/useFilters'
import { useInsights } from '@/hooks/useInsights'
import { useTransactions } from '@/hooks/useTransactions'
import type {
  BalanceTrendPoint,
  ExpenseCategory,
  SpendingBreakdownPoint,
  SummaryCardModel,
  TrendDirection,
} from '@/types'
import {
  computeDailyBalanceTrend,
  computeSpendingBreakdown,
} from '@/utils'

interface DashboardOverviewState {
  readonly isLoading: boolean
  readonly transactionCount: number
  readonly summaryCards: readonly SummaryCardModel[]
  readonly balanceTrendData: readonly BalanceTrendPoint[]
  readonly spendingBreakdownData: readonly SpendingBreakdownPoint[]
  readonly selectedSpendingCategory: ExpenseCategory | null
  readonly balanceTrendAriaLabel: string
  readonly spendingBreakdownAriaLabel: string
  selectSpendingCategory: (category: ExpenseCategory) => void
}

function toTrendDirection(value: number): TrendDirection {
  if (value > 0) {
    return 'up'
  }

  if (value < 0) {
    return 'down'
  }

  return 'neutral'
}

function toTrendPercent(currentValue: number, previousValue: number): number {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100
  }

  return ((currentValue - previousValue) / previousValue) * 100
}

function formatTrendPercent(value: number): string {
  const roundedValue = Number.isFinite(value) ? value : 0
  const sign = roundedValue > 0 ? '+' : ''

  return `${sign}${roundedValue.toFixed(1)}%`
}

/**
 * Provides summary card models and chart data for the dashboard overview.
 */
export function useDashboardOverview(): DashboardOverviewState {
  const [isLoading, setIsLoading] = useState(true)
  const { formatAmount } = useCurrency()

  const { summary, transactions } = useTransactions()
  const insights = useInsights()
  const { activeCategories, setCategoryFilter } = useFilters()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, 450)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  const latestMonth = insights.monthlyComparison.at(-1) ?? null
  const previousMonth = insights.monthlyComparison.at(-2) ?? null

  const balanceChange = useMemo<number>(() => {
    if (!latestMonth || !previousMonth) {
      return 0
    }

    return toTrendPercent(latestMonth.net, previousMonth.net)
  }, [latestMonth, previousMonth])

  const incomeChange = useMemo<number>(() => {
    if (!latestMonth || !previousMonth) {
      return 0
    }

    return toTrendPercent(latestMonth.income, previousMonth.income)
  }, [latestMonth, previousMonth])

  const expenseChange = useMemo<number>(() => {
    if (!latestMonth || !previousMonth) {
      return 0
    }

    return toTrendPercent(latestMonth.expenses, previousMonth.expenses)
  }, [latestMonth, previousMonth])

  const savingsRateChange = useMemo<number>(() => {
    if (!latestMonth || !previousMonth) {
      return 0
    }

    const currentSavingsRate =
      latestMonth.income > 0 ? latestMonth.net / latestMonth.income : 0
    const previousSavingsRate =
      previousMonth.income > 0 ? previousMonth.net / previousMonth.income : 0

    return (currentSavingsRate - previousSavingsRate) * 100
  }, [latestMonth, previousMonth])

  const summaryCards = useMemo<readonly SummaryCardModel[]>(
    () => [
      {
        title: 'Total Balance',
        value: summary.totalBalance,
        valueKind: 'currency',
        trendDirection: toTrendDirection(balanceChange),
        trendValue: formatTrendPercent(balanceChange),
        trendLabel: 'vs last month net',
        colorVariant: 'indigo',
      },
      {
        title: 'Total Income',
        value: summary.totalIncome,
        valueKind: 'currency',
        trendDirection: toTrendDirection(incomeChange),
        trendValue: formatTrendPercent(incomeChange),
        trendLabel: 'vs last month income',
        colorVariant: 'green',
      },
      {
        title: 'Total Expenses',
        value: summary.totalExpenses,
        valueKind: 'currency',
        trendDirection: toTrendDirection(expenseChange),
        trendValue: formatTrendPercent(expenseChange),
        trendLabel: 'vs last month expenses',
        colorVariant: 'red',
      },
      {
        title: 'Savings Rate',
        value: summary.savingsRate * 100,
        valueKind: 'percent',
        trendDirection: toTrendDirection(savingsRateChange),
        trendValue: formatTrendPercent(savingsRateChange),
        trendLabel: 'vs last month savings',
        colorVariant: 'blue',
      },
    ],
    [
      balanceChange,
      expenseChange,
      incomeChange,
      savingsRateChange,
      summary.savingsRate,
      summary.totalBalance,
      summary.totalExpenses,
      summary.totalIncome,
    ],
  )

  const balanceTrendData = useMemo<readonly BalanceTrendPoint[]>(
    () => computeDailyBalanceTrend(transactions, 730),
    [transactions],
  )

  const spendingBreakdownData = useMemo<readonly SpendingBreakdownPoint[]>(
    () => computeSpendingBreakdown(transactions),
    [transactions],
  )

  const selectedSpendingCategory = useMemo<ExpenseCategory | null>(() => {
    if (activeCategories.length !== 1) {
      return null
    }

    const onlyCategory = activeCategories[0]

    const matchedCategory = spendingBreakdownData.find(
      (item) => item.category === onlyCategory,
    )

    return matchedCategory?.category ?? null
  }, [activeCategories, spendingBreakdownData])

  const balanceTrendAriaLabel = useMemo<string>(() => {
    if (balanceTrendData.length === 0) {
      return 'Cumulative balance runway chart unavailable because no daily transaction data exists.'
    }

    const firstDay = balanceTrendData[0]
    const lastDay = balanceTrendData[balanceTrendData.length - 1]

    if (!firstDay || !lastDay) {
      return 'Cumulative balance runway chart unavailable because no daily transaction data exists.'
    }

    return `Cumulative balance runway chart from ${firstDay.fullLabel} to ${lastDay.fullLabel}. Latest total balance is ${formatAmount(lastDay.cumulativeBalance)} with latest day net movement of ${formatAmount(lastDay.net)}.`
  }, [balanceTrendData, formatAmount])

  const spendingBreakdownAriaLabel = useMemo<string>(() => {
    if (spendingBreakdownData.length === 0) {
      return 'Spending breakdown chart unavailable because there are no expense transactions.'
    }

    const topCategory = spendingBreakdownData[0]

    if (!topCategory) {
      return 'Spending breakdown chart unavailable because there are no expense transactions.'
    }

    return `Spending breakdown chart by expense category. Highest spend category is ${topCategory.category} at ${formatAmount(topCategory.totalSpent)}, representing ${topCategory.percentage.toFixed(1)} percent of total expenses.`
  }, [spendingBreakdownData, formatAmount])

  const selectSpendingCategory = (category: ExpenseCategory): void => {
    if (selectedSpendingCategory === category) {
      setCategoryFilter([])
      return
    }

    setCategoryFilter([category])
  }

  return {
    isLoading,
    transactionCount: transactions.length,
    summaryCards,
    balanceTrendData,
    spendingBreakdownData,
    selectedSpendingCategory,
    balanceTrendAriaLabel,
    spendingBreakdownAriaLabel,
    selectSpendingCategory,
  }
}
