import { EXPENSE_CATEGORIES } from '@/constants/finance'
import type {
  ExpenseCategory,
  InsightsSnapshot,
  MonthlyComparisonEntry,
  Transaction,
  TransactionCategory,
} from '@/types/finance'
import { formatMonthKey, getMonthKey } from '@/utils/formatDate'

interface MonthlyAccumulator {
  income: number
  expenses: number
}

function isExpenseCategory(
  category: TransactionCategory,
): category is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(category)
}

function buildMonthlyComparison(
  transactions: readonly Transaction[],
): MonthlyComparisonEntry[] {
  const monthlyMap = new Map<string, MonthlyAccumulator>()

  for (const transaction of transactions) {
    const monthKey = getMonthKey(transaction.date)
    const currentTotals = monthlyMap.get(monthKey) ?? { income: 0, expenses: 0 }

    if (transaction.type === 'income') {
      currentTotals.income += transaction.amount
    } else {
      currentTotals.expenses += transaction.amount
    }

    monthlyMap.set(monthKey, currentTotals)
  }

  return [...monthlyMap.entries()]
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([monthKey, totals]) => ({
      monthKey,
      monthLabel: formatMonthKey(monthKey),
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses,
    }))
}

function buildSpendingTrend(
  monthlyComparison: readonly MonthlyComparisonEntry[],
): InsightsSnapshot['spendingTrend'] {
  if (monthlyComparison.length < 2) {
    return {
      direction: 'neutral',
      percentageChange: 0,
      absoluteChange: 0,
      previousMonthKey: null,
      currentMonthKey: null,
      summary: 'Not enough monthly data to compute a spending trend.',
    }
  }

  const previousMonth = monthlyComparison.at(-2)
  const currentMonth = monthlyComparison.at(-1)

  if (!previousMonth || !currentMonth) {
    return {
      direction: 'neutral',
      percentageChange: 0,
      absoluteChange: 0,
      previousMonthKey: null,
      currentMonthKey: null,
      summary: 'Not enough monthly data to compute a spending trend.',
    }
  }

  const absoluteChange = currentMonth.expenses - previousMonth.expenses
  const percentageChange =
    previousMonth.expenses === 0
      ? 0
      : (absoluteChange / previousMonth.expenses) * 100

  const direction =
    absoluteChange > 0
      ? 'increase'
      : absoluteChange < 0
        ? 'decrease'
        : 'neutral'

  const formattedChange = Math.abs(percentageChange).toFixed(1)

  const summary =
    direction === 'increase'
      ? `Spending increased by ${formattedChange}% compared to last month.`
      : direction === 'decrease'
        ? `Spending decreased by ${formattedChange}% compared to last month.`
        : 'Spending is unchanged compared to last month.'

  return {
    direction,
    percentageChange,
    absoluteChange,
    previousMonthKey: previousMonth.monthKey,
    currentMonthKey: currentMonth.monthKey,
    summary,
  }
}

/**
 * Computes dashboard insight objects from transaction data.
 * @param transactions - Input transactions.
 * @returns Highest spend category, monthly comparison, trend, and top categories.
 */
export function computeInsights(
  transactions: readonly Transaction[],
): InsightsSnapshot {
  const monthlyComparison = buildMonthlyComparison(transactions)

  const expenseTotalsByCategory = new Map<ExpenseCategory, number>()
  let totalExpenses = 0

  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      !isExpenseCategory(transaction.category)
    ) {
      continue
    }

    totalExpenses += transaction.amount

    const existingTotal = expenseTotalsByCategory.get(transaction.category) ?? 0
    expenseTotalsByCategory.set(
      transaction.category,
      existingTotal + transaction.amount,
    )
  }

  const rankedExpenseCategories = [...expenseTotalsByCategory.entries()]
    .sort(([, totalA], [, totalB]) => totalB - totalA)
    .map(([category, totalSpent], index) => ({
      category,
      totalSpent,
      percentageOfTotalExpenses:
        totalExpenses > 0 ? (totalSpent / totalExpenses) * 100 : 0,
      rank: index + 1,
    }))

  const highestSpendingCategory = rankedExpenseCategories[0]
    ? {
        category: rankedExpenseCategories[0].category,
        totalSpent: rankedExpenseCategories[0].totalSpent,
        percentageOfTotalExpenses:
          rankedExpenseCategories[0].percentageOfTotalExpenses,
      }
    : {
        category: null,
        totalSpent: 0,
        percentageOfTotalExpenses: 0,
      }

  const sortedByNet = [...monthlyComparison].sort((a, b) => b.net - a.net)
  const bestMonth = sortedByNet[0] ?? null
  const worstMonth = sortedByNet[sortedByNet.length - 1] ?? null

  return {
    highestSpendingCategory,
    monthlyComparison,
    bestMonth,
    worstMonth,
    spendingTrend: buildSpendingTrend(monthlyComparison),
    topExpenseCategories: rankedExpenseCategories.slice(0, 3),
  }
}
