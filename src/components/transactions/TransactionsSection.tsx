import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useCurrency, useFilters, usePermission, useTransactions } from '@/hooks'
import type { TransactionDraft, TransactionSortKey } from '@/types'
import {
  computeSummary,
  exportDashboardReport,
  logger,
  type ReportFormat,
} from '@/utils'
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

function TransactionsLoadingState(): ReactElement {
  return (
    <div className="space-y-6" aria-live="polite">
      <div className="surface-card loading-shimmer p-6">
        <div className="h-5 w-48 rounded bg-[var(--color-border)]" />
        <div className="mt-3 h-10 w-full rounded bg-[var(--color-border)]" />
      </div>
      <div className="surface-card loading-shimmer p-6">
        <div className="h-5 w-32 rounded bg-[var(--color-border)]" />
        <div className="mt-3 h-56 w-full rounded bg-[var(--color-border)]" />
      </div>
      <div className="h-8 w-56 rounded bg-[var(--color-border)]" />
    </div>
  )
}

/**
 * End-to-end transactions feature section: filters, table, pagination, and CRUD modal.
 */
export function TransactionsSection(): ReactElement {
  const canCreateTransactions = usePermission('create')
  const { currency } = useCurrency()

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
    filteredTransactions,
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
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>(
    'comfortable',
  )
  const [isSectionLoading, setIsSectionLoading] = useState(true)
  const [modalState, setModalState] =
    useState<TransactionModalState>(initialModalState)
  const [activeReportFormat, setActiveReportFormat] =
    useState<ReportFormat | null>(null)
  const [reportExportError, setReportExportError] = useState<string | null>(
    null,
  )

  const activeFilterState = useMemo<boolean>(
    () =>
      hasActiveFilters(searchQuery, activeTypes, activeCategories, dateRange),
    [activeCategories, activeTypes, dateRange, searchQuery],
  )

  const sortedState = useMemo(
    () => ({ sortBy, sortDirection }),
    [sortBy, sortDirection],
  )

  const reportSummary = useMemo(
    () => computeSummary(filteredTransactions),
    [filteredTransactions],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsSectionLoading(false)
    }, 320)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

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

  const exportCurrentResults = async (format: ReportFormat): Promise<void> => {
    if (filteredTransactions.length === 0 || activeReportFormat !== null) {
      return
    }

    setReportExportError(null)
    setActiveReportFormat(format)

    try {
      const dashboardSectionElement = document.getElementById('dashboard-overview')

      await exportDashboardReport(
        {
          transactions: filteredTransactions,
          summary: reportSummary,
          filters: {
            searchQuery,
            activeTypes,
            activeCategories,
            dateRange,
          },
          currency,
          dashboardSectionElement:
            dashboardSectionElement instanceof HTMLElement
              ? dashboardSectionElement
              : null,
        },
        format,
      )
    } catch (error) {
      setReportExportError(
        'Could not generate this report. Please try again in a moment.',
      )
      logger.error('Dashboard report export failed', {
        format,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setActiveReportFormat(null)
    }
  }

  const onExportCsvClick = (): void => {
    void exportCurrentResults('csv')
  }

  const onExportPdfClick = (): void => {
    void exportCurrentResults('pdf')
  }

  return (
    <section
      id="transactions-overview"
      aria-labelledby="transactions-overview-title"
      className="surface-card section-reveal p-6 sm:p-7 lg:p-8"
      aria-busy={isSectionLoading}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3
            id="transactions-overview-title"
            className="section-heading-dark-gradient inline-block text-lg font-semibold"
          >
            Transactions
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Search, filter, sort, and manage transaction records with role-aware
            controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
            {(['comfortable', 'compact'] as const).map((density) => {
              const isSelected = density === tableDensity

              return (
                <button
                  key={density}
                  type="button"
                  onClick={() => setTableDensity(density)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.05em] transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)]'
                  }`}
                  aria-pressed={isSelected}
                >
                  {density}
                </button>
              )
            })}
          </div>

          {canCreateTransactions ? (
            <div className="flex flex-col items-start gap-1">
              <div className="inline-flex overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <button
                  type="button"
                  onClick={onExportCsvClick}
                  disabled={
                    filteredTransactions.length === 0 ||
                    activeReportFormat !== null
                  }
                  className="border-r border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Export currently filtered dashboard report as CSV"
                >
                  {activeReportFormat === 'csv'
                    ? 'Generating CSV...'
                    : 'CSV Report'}
                </button>
                <button
                  type="button"
                  onClick={onExportPdfClick}
                  disabled={
                    filteredTransactions.length === 0 ||
                    activeReportFormat !== null
                  }
                  className="px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Export currently filtered dashboard report as PDF"
                >
                  {activeReportFormat === 'pdf'
                    ? 'Generating PDF...'
                    : 'PDF Report'}
                </button>
              </div>

              {activeReportFormat !== null ? (
                <p
                  className="text-xs text-[var(--color-text-muted)]"
                  aria-live="polite"
                >
                  Preparing {activeReportFormat.toUpperCase()} report in the
                  background...
                </p>
              ) : null}

              {reportExportError !== null ? (
                <p className="text-xs text-red-600" role="alert">
                  {reportExportError}
                </p>
              ) : null}
            </div>
          ) : null}

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
      </div>

      {isSectionLoading ? (
        <div className="mt-7">
          <TransactionsLoadingState />
        </div>
      ) : (
        <div className="mt-7 space-y-6">
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
            density={tableDensity}
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
      )}

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
