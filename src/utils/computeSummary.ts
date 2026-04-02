import type { SummaryMetrics, Transaction } from '@/types/finance'

/**
 * Computes core summary metrics from the full transaction set.
 * @param transactions - Input transactions.
 * @returns Aggregated balance, income, expenses, and savings rate.
 */
export function computeSummary(
  transactions: readonly Transaction[],
): SummaryMetrics {
  const totalIncome = transactions.reduce<number>(
    (sum, transaction) =>
      transaction.type === 'income' ? sum + transaction.amount : sum,
    0,
  )

  const totalExpenses = transactions.reduce<number>(
    (sum, transaction) =>
      transaction.type === 'expense' ? sum + transaction.amount : sum,
    0,
  )

  const totalBalance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? totalBalance / totalIncome : 0

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
  }
}
