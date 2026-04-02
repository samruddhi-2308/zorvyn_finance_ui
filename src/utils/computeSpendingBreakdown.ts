import type {
  ExpenseCategory,
  SpendingBreakdownPoint,
  Transaction,
} from '@/types'
import { EXPENSE_CATEGORIES } from '@/constants'

/**
 * Computes expense totals and percentages by category.
 * @param transactions - Source transaction list.
 * @returns Descending list of expense category totals.
 */
export function computeSpendingBreakdown(
  transactions: readonly Transaction[],
): SpendingBreakdownPoint[] {
  const categoryTotals = new Map<ExpenseCategory, number>()
  let overallExpenseTotal = 0

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue
    }

    if (
      !(EXPENSE_CATEGORIES as readonly string[]).includes(transaction.category)
    ) {
      continue
    }

    const category = transaction.category as ExpenseCategory
    overallExpenseTotal += transaction.amount
    categoryTotals.set(
      category,
      (categoryTotals.get(category) ?? 0) + transaction.amount,
    )
  }

  return [...categoryTotals.entries()]
    .map(([category, totalSpent]) => ({
      category,
      totalSpent,
      percentage:
        overallExpenseTotal > 0 ? (totalSpent / overallExpenseTotal) * 100 : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
}
