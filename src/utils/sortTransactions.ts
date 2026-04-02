import type {
  SortDirection,
  Transaction,
  TransactionSortKey,
} from '@/types/finance'
import { toTimestamp } from '@/utils/formatDate'

function compareByDate(a: Transaction, b: Transaction): number {
  return toTimestamp(a.date) - toTimestamp(b.date)
}

function compareByAmount(a: Transaction, b: Transaction): number {
  return a.amount - b.amount
}

function compareByCategory(a: Transaction, b: Transaction): number {
  return a.category.localeCompare(b.category, 'en-IN')
}

/**
 * Sorts transactions by selected key and direction.
 * @param transactions - Input transactions.
 * @param sortBy - Sort key (`date`, `amount`, `category`).
 * @param sortDirection - Sort direction (`asc`, `desc`).
 * @returns A new sorted array.
 */
export function sortTransactions(
  transactions: readonly Transaction[],
  sortBy: TransactionSortKey = 'date',
  sortDirection: SortDirection = 'desc',
): Transaction[] {
  const sortedTransactions = [...transactions]

  const comparator: (a: Transaction, b: Transaction) => number =
    sortBy === 'amount'
      ? compareByAmount
      : sortBy === 'category'
        ? compareByCategory
        : compareByDate

  sortedTransactions.sort((a, b) => comparator(a, b))

  return sortDirection === 'asc'
    ? sortedTransactions
    : sortedTransactions.reverse()
}
