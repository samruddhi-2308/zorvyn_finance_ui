import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useFilters, usePermission, useTransactions } from '@/hooks'
import type { TransactionDraft, TransactionSortKey } from '@/types'
import { TransactionModal } from './TransactionModal'
import { TransactionsFilters } from './TransactionsFilters'
import { TransactionsPagination } from './TransactionsPagination'
import { TransactionsTable } from './TransactionsTable'
import type { TransactionModalState, TransactionRowAction } from './types'

const initialModalState: TransactionModalState = {
  isOpen: false,
  mode: 'create',
  transaction: null,
}

function hasActiveFilters(
  searchQuery: string,
  activeTypes: readonly string[],
  activeCategories: readonly string[],
  dateRange: { readonly startDate?: string; readonly endDate?: string },
): boolean {
  return (
    searchQuery.trim().length > 0 ||
    activeTypes.length > 0 ||
    activeCategories.length > 0 ||
    dateRange.startDate !== undefined ||
    dateRange.endDate !== undefined
  )
}

/**
 * End-to-end transactions feature section: filters, table, pagination, and CRUD modal.
 */
export function TransactionsSection(): ReactElement {
  const canCreateTransactions = usePermission('create')

  const {
    searchQuery,
    activeTypes,
    activeCategories,
    dateRange,
    sortBy,
    sortDirection,
    setSearchQuery,
    setTypeFilter,
    setCategoryFilter,
    setDateRange,
    setSort,
    resetFilters,
  } = useFilters()

  const {
    transactions,
    paginatedTransactions,
    totalResults,
    totalPages,
    shouldPaginate,
    currentPage,
    rangeStart,
    rangeEnd,
    setPage,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()

  const [openMenuTransactionId, setOpenMenuTransactionId] = useState<
    string | null
  >(null)
  const [modalState, setModalState] =
    useState<TransactionModalState>(initialModalState)

  const activeFilterState = useMemo<boolean>(
    () =>
      hasActiveFilters(searchQuery, activeTypes, activeCategories, dateRange),
    [activeCategories, activeTypes, dateRange, searchQuery],
  )

  const sortedState = useMemo(
    () => ({ sortBy, sortDirection }),
    [sortBy, sortDirection],
  )

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      const target = event.target as HTMLElement
      const isInsideMenu = target.closest('[data-actions-menu]')
      const isMenuTrigger = target.closest('[data-row-action="toggle-menu"]')

      if (!isInsideMenu && !isMenuTrigger) {
        setOpenMenuTransactionId(null)
      }
    }

    window.addEventListener('click', handleDocumentClick)

    return () => {
      window.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  useEffect(() => {
    if (openMenuTransactionId === null) {
      return
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return
      }

      setOpenMenuTransactionId(null)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenuTransactionId])

  const openCreateModal = (): void => {
    setModalState({
      isOpen: true,
      mode: 'create',
      transaction: null,
    })
  }

  const closeModal = (): void => {
    setModalState(initialModalState)
    setOpenMenuTransactionId(null)
  }

  const onCreateTransaction = (draft: TransactionDraft): boolean =>
    addTransaction(draft) !== null

  const onUpdateTransaction = (id: string, draft: TransactionDraft): boolean =>
    updateTransaction(id, {
      description: draft.description,
      amount: draft.amount,
      type: draft.type,
      category: draft.category,
      date: draft.date,
      paymentMethod: draft.paymentMethod,
      ...(draft.status !== undefined ? { status: draft.status } : {}),
    })

  const onSortChange = (column: TransactionSortKey): void => {
    if (sortBy === column) {
      setSort(column, sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    const nextDirection =
      column === 'amount' || column === 'date' ? 'desc' : 'asc'
    setSort(column, nextDirection)
  }

  const onRowAction = (
    action: TransactionRowAction,
    transactionId: string,
  ): void => {
    if (!canCreateTransactions) {
      return
    }

    switch (action) {
      case 'toggle-menu':
        setOpenMenuTransactionId((current) =>
          current === transactionId ? null : transactionId,
        )
        return

      case 'edit': {
        const transactionToEdit = transactions.find(
          (transaction) => transaction.id === transactionId,
        )

        if (!transactionToEdit) {
          return
        }

        setModalState({
          isOpen: true,
          mode: 'edit',
          transaction: transactionToEdit,
        })
        setOpenMenuTransactionId(null)
        return
      }

      case 'delete': {
        const shouldDelete = window.confirm(
          'Delete this transaction? This action cannot be undone.',
        )

        if (!shouldDelete) {
          return
        }

        deleteTransaction(transactionId)
        setOpenMenuTransactionId(null)
        return
      }
    }
  }

  return (
    <section
      id="transactions-overview"
      aria-labelledby="transactions-overview-title"
      className="surface-card section-reveal p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="transactions-overview-title"
            className="text-lg font-semibold"
          >
            Transactions
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Search, filter, sort, and manage transaction records with role-aware
            controls.
          </p>
        </div>

        {canCreateTransactions ? (
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            aria-label="Add transaction"
          >
            Add Transaction
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <TransactionsFilters
          searchQuery={searchQuery}
          activeTypes={activeTypes}
          activeCategories={activeCategories}
          dateRange={dateRange}
          onSearchChange={setSearchQuery}
          onTypeFilterChange={setTypeFilter}
          onCategoryFilterChange={setCategoryFilter}
          onDateRangeChange={setDateRange}
          onResetFilters={resetFilters}
        />

        <TransactionsTable
          transactions={paginatedTransactions}
          sortState={sortedState}
          isAdmin={canCreateTransactions}
          openMenuTransactionId={openMenuTransactionId}
          hasActiveFilters={activeFilterState}
          onSortChange={onSortChange}
          onRowAction={onRowAction}
          onResetFilters={resetFilters}
        />

        <TransactionsPagination
          shouldPaginate={shouldPaginate}
          currentPage={currentPage}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalResults={totalResults}
          onPageChange={setPage}
        />
      </div>

      <TransactionModal
        key={`${modalState.mode}-${modalState.transaction?.id ?? 'new'}-${String(modalState.isOpen)}`}
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        transaction={modalState.transaction}
        onClose={closeModal}
        onCreate={onCreateTransaction}
        onUpdate={onUpdateTransaction}
      />
    </section>
  )
}
