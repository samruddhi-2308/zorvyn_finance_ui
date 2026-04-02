import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore, useTransactionStore } from '@/store'
import type {
  SummaryMetrics,
  Transaction,
  TransactionDraft,
  TransactionUpdate,
} from '@/types'
import { computeSummary, filterTransactions } from '@/utils'
import { useFilters } from './useFilters'

interface UseTransactionsResult {
  readonly transactions: readonly Transaction[]
  readonly filteredTransactions: readonly Transaction[]
  readonly paginatedTransactions: readonly Transaction[]
  readonly summary: SummaryMetrics
  readonly totalResults: number
  readonly totalPages: number
  readonly currentPage: number
  readonly pageSize: number
  readonly rangeStart: number
  readonly rangeEnd: number
  readonly setPage: (page: number) => void
  readonly setPageSize: (pageSize: number) => void
  readonly setTransactions: (transactions: readonly Transaction[]) => void
  readonly addTransaction: (draft: TransactionDraft) => Transaction | null
  readonly updateTransaction: (
    id: string,
    updates: TransactionUpdate,
  ) => boolean
  readonly deleteTransaction: (id: string) => boolean
  readonly resetTransactions: () => void
}

/**
 * Provides source transactions plus filtered, paginated, and summarized views.
 */
export function useTransactions(): UseTransactionsResult {
  const {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetTransactions,
  } = useTransactionStore(
    useShallow((state) => ({
      transactions: state.transactions,
      setTransactions: state.setTransactions,
      addTransaction: state.addTransaction,
      updateTransaction: state.updateTransaction,
      deleteTransaction: state.deleteTransaction,
      resetTransactions: state.resetTransactions,
    })),
  )

  const { filterOptions, currentPage, pageSize } = useFilters()
  const setPage = useFilterStore((state) => state.setPage)
  const setPageSize = useFilterStore((state) => state.setPageSize)

  const filteredTransactions = useMemo<readonly Transaction[]>(
    () => filterTransactions(transactions, filterOptions),
    [filterOptions, transactions],
  )

  const summary = useMemo<SummaryMetrics>(
    () => computeSummary(transactions),
    [transactions],
  )

  const totalResults = filteredTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages)
    }
  }, [currentPage, setPage, totalPages])

  const effectivePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (effectivePage - 1) * pageSize
  const pageEndIndexExclusive = pageStartIndex + pageSize

  const paginatedTransactions = useMemo<readonly Transaction[]>(
    () => filteredTransactions.slice(pageStartIndex, pageEndIndexExclusive),
    [filteredTransactions, pageEndIndexExclusive, pageStartIndex],
  )

  const rangeStart = totalResults === 0 ? 0 : pageStartIndex + 1
  const rangeEnd = Math.min(pageEndIndexExclusive, totalResults)

  return {
    transactions,
    filteredTransactions,
    paginatedTransactions,
    summary,
    totalResults,
    totalPages,
    currentPage: effectivePage,
    pageSize,
    rangeStart,
    rangeEnd,
    setPage,
    setPageSize,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetTransactions,
  }
}
