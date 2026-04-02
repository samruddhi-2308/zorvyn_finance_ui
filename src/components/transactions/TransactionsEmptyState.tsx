import type { ReactElement } from 'react'

interface TransactionsEmptyStateProps {
  readonly hasActiveFilters: boolean
  readonly onResetFilters: () => void
}

/**
 * Empty state for transaction list view.
 */
export function TransactionsEmptyState({
  hasActiveFilters,
  onResetFilters,
}: TransactionsEmptyStateProps): ReactElement {
  return (
    <div className="m-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-10 text-center">
      <div
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M4 7H20M6 12H18M9 17H15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h4 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">
        {hasActiveFilters
          ? 'No Transactions Match These Filters'
          : 'No Transactions Yet'}
      </h4>
      <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
        {hasActiveFilters
          ? 'Try changing your search, date range, or category selections.'
          : 'Add a transaction to start tracking your income and expenses.'}
      </p>
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
        >
          Clear All Filters
        </button>
      ) : null}
    </div>
  )
}
