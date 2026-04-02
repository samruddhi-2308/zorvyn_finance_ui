import type { Transaction, TransactionFilterOptions } from '@/types/finance'
import { sortTransactions } from '@/utils/sortTransactions'
import { toTimestamp } from '@/utils/formatDate'

/**
 * Filters and sorts transactions based on query options.
 * @param transactions - Input transactions array.
 * @param options - Filter and sorting configuration.
 * @returns Filtered and sorted transaction list.
 */
export function filterTransactions(
  transactions: readonly Transaction[],
  options: TransactionFilterOptions = {},
): Transaction[] {
  const normalizedSearch = options.searchQuery?.trim().toLocaleLowerCase() ?? ''
  const startTimestamp = options.dateRange?.startDate
    ? toTimestamp(options.dateRange.startDate)
    : Number.NEGATIVE_INFINITY
  const endTimestamp = options.dateRange?.endDate
    ? toTimestamp(options.dateRange.endDate)
    : Number.POSITIVE_INFINITY

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionTimestamp = toTimestamp(transaction.date)

    const matchesSearch =
      normalizedSearch.length === 0 ||
      transaction.description.toLocaleLowerCase().includes(normalizedSearch) ||
      transaction.category.toLocaleLowerCase().includes(normalizedSearch)

    const matchesType =
      !options.types?.length || options.types.includes(transaction.type)

    const matchesCategory =
      !options.categories?.length ||
      options.categories.includes(transaction.category)

    const matchesStatus =
      !options.statuses?.length || options.statuses.includes(transaction.status)

    const matchesDateRange =
      transactionTimestamp >= startTimestamp &&
      transactionTimestamp <= endTimestamp

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesStatus &&
      matchesDateRange
    )
  })

  return sortTransactions(
    filteredTransactions,
    options.sortBy ?? 'date',
    options.sortDirection ?? 'desc',
  )
}
