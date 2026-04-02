import type { ReactElement } from 'react'

interface TransactionsPaginationProps {
  readonly shouldPaginate: boolean
  readonly currentPage: number
  readonly totalPages: number
  readonly rangeStart: number
  readonly rangeEnd: number
  readonly totalResults: number
  readonly onPageChange: (page: number) => void
}

/**
 * Pagination controls and results range for transactions.
 */
export function TransactionsPagination({
  shouldPaginate,
  currentPage,
  totalPages,
  rangeStart,
  rangeEnd,
  totalResults,
  onPageChange,
}: TransactionsPaginationProps): ReactElement {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--color-text-muted)]">
        Showing {rangeStart}-{rangeEnd} of {totalResults} results
      </p>

      {shouldPaginate ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Go to previous page"
          >
            Prev
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}
