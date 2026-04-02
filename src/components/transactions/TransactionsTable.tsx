import type { AriaAttributes, ReactElement } from 'react'
import type { Transaction, TransactionSortKey } from '@/types'
import { formatDate, formatINR } from '@/utils'
import { TransactionsEmptyState } from './TransactionsEmptyState'
import type { TransactionRowAction, TransactionSortState } from './types'

interface TransactionsTableProps {
  readonly transactions: readonly Transaction[]
  readonly sortState: TransactionSortState
  readonly isAdmin: boolean
  readonly openMenuTransactionId: string | null
  readonly hasActiveFilters: boolean
  readonly onSortChange: (column: TransactionSortKey) => void
  readonly onRowAction: (
    action: TransactionRowAction,
    transactionId: string,
  ) => void
  readonly onResetFilters: () => void
}

interface TransactionRowActionsProps {
  readonly transactionId: string
  readonly isMenuOpen: boolean
  readonly onRowAction: (
    action: TransactionRowAction,
    transactionId: string,
  ) => void
}

function getAriaSort(
  sortState: TransactionSortState,
  column: TransactionSortKey,
): AriaAttributes['aria-sort'] {
  if (sortState.sortBy !== column) {
    return 'none'
  }

  return sortState.sortDirection === 'asc' ? 'ascending' : 'descending'
}

function getAmountClass(type: Transaction['type']): string {
  return type === 'income' ? 'text-emerald-700' : 'text-rose-700'
}

function getTypeBadgeClass(type: Transaction['type']): string {
  return type === 'income'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-rose-100 text-rose-800'
}

function getStatusDotClass(status: Transaction['status']): string {
  return status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
}

function SortIndicator({
  isActive,
  direction,
}: {
  readonly isActive: boolean
  readonly direction: 'asc' | 'desc'
}): ReactElement {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M5 6L8 3L11 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isActive && direction === 'asc' ? '' : 'opacity-35'}
      />
      <path
        d="M5 10L8 13L11 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isActive && direction === 'desc' ? '' : 'opacity-35'}
      />
    </svg>
  )
}

function TransactionRowActions({
  transactionId,
  isMenuOpen,
  onRowAction,
}: TransactionRowActionsProps): ReactElement {
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        data-row-action="toggle-menu"
        data-transaction-id={transactionId}
        onClick={() => onRowAction('toggle-menu', transactionId)}
        className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls={`transaction-actions-menu-${transactionId}`}
        aria-label="Open transaction actions menu"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M10 4.5C10.8 4.5 11.5 3.8 11.5 3C11.5 2.2 10.8 1.5 10 1.5C9.2 1.5 8.5 2.2 8.5 3C8.5 3.8 9.2 4.5 10 4.5Z"
            fill="currentColor"
          />
          <path
            d="M10 11.5C10.8 11.5 11.5 10.8 11.5 10C11.5 9.2 10.8 8.5 10 8.5C9.2 8.5 8.5 9.2 8.5 10C8.5 10.8 9.2 11.5 10 11.5Z"
            fill="currentColor"
          />
          <path
            d="M10 18.5C10.8 18.5 11.5 17.8 11.5 17C11.5 16.2 10.8 15.5 10 15.5C9.2 15.5 8.5 16.2 8.5 17C8.5 17.8 9.2 18.5 10 18.5Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isMenuOpen ? (
        <div
          id={`transaction-actions-menu-${transactionId}`}
          data-actions-menu="true"
          className="absolute right-0 z-20 mt-10 w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-card"
          role="menu"
          aria-label="Transaction actions"
        >
          <button
            type="button"
            data-row-action="edit"
            data-transaction-id={transactionId}
            onClick={() => onRowAction('edit', transactionId)}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
            role="menuitem"
          >
            Edit
          </button>
          <button
            type="button"
            data-row-action="delete"
            data-transaction-id={transactionId}
            onClick={() => onRowAction('delete', transactionId)}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50"
            role="menuitem"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Transactions table with sortable columns and delegated row actions.
 */
export function TransactionsTable({
  transactions,
  sortState,
  isAdmin,
  openMenuTransactionId,
  hasActiveFilters,
  onSortChange,
  onRowAction,
  onResetFilters,
}: TransactionsTableProps): ReactElement {
  if (transactions.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <TransactionsEmptyState
          hasActiveFilters={hasActiveFilters}
          onResetFilters={onResetFilters}
        />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 lg:hidden" aria-label="Transactions list">
        {transactions.map((transaction) => {
          const isMenuOpen = openMenuTransactionId === transaction.id

          return (
            <article
              key={transaction.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {transaction.description}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {isAdmin ? (
                  <TransactionRowActions
                    transactionId={transaction.id}
                    isMenuOpen={isMenuOpen}
                    onRowAction={onRowAction}
                  />
                ) : null}
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Category
                  </dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {transaction.category}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Type
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${getTypeBadgeClass(
                        transaction.type,
                      )}`}
                    >
                      {transaction.type}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Amount
                  </dt>
                  <dd
                    className={`mt-1 text-sm font-semibold ${getAmountClass(
                      transaction.type,
                    )}`}
                  >
                    {formatINR(transaction.amount)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                    Status
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${getStatusDotClass(
                        transaction.status,
                      )}`}
                      aria-hidden="true"
                    />
                    {transaction.status}
                  </dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--color-border)] lg:block">
        <table
          className="min-w-full border-collapse"
          aria-label="Transactions table"
        >
          <thead className="bg-[var(--color-background)]">
            <tr>
              {(
                ['date', 'description', 'category', 'type', 'amount'] as const
              ).map((column) => {
                if (column === 'description' || column === 'type') {
                  const staticLabel =
                    column === 'description' ? 'Description' : 'Type'

                  return (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                    >
                      {staticLabel}
                    </th>
                  )
                }

                const label =
                  column === 'date'
                    ? 'Date'
                    : column === 'category'
                      ? 'Category'
                      : 'Amount'
                const isColumnActive = sortState.sortBy === column

                return (
                  <th
                    key={column}
                    scope="col"
                    aria-sort={getAriaSort(sortState, column)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                  >
                    <button
                      type="button"
                      onClick={() => onSortChange(column)}
                      className="inline-flex items-center gap-1 transition hover:text-[var(--color-text-primary)]"
                      aria-label={`Sort by ${label}`}
                    >
                      <span>{label}</span>
                      <SortIndicator
                        isActive={isColumnActive}
                        direction={sortState.sortDirection}
                      />
                    </button>
                  </th>
                )
              })}
              {isAdmin ? (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                >
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => {
              const isMenuOpen = openMenuTransactionId === transaction.id

              return (
                <tr
                  key={transaction.id}
                  className="border-t border-[var(--color-border)] text-sm"
                >
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase ${getTypeBadgeClass(
                        transaction.type,
                      )}`}
                    >
                      {transaction.type}
                    </span>
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${getStatusDotClass(
                          transaction.status,
                        )}`}
                        aria-hidden="true"
                      />
                      {transaction.status}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${getAmountClass(
                      transaction.type,
                    )}`}
                  >
                    {formatINR(transaction.amount)}
                  </td>
                  {isAdmin ? (
                    <td className="relative px-4 py-3 text-right">
                      <TransactionRowActions
                        transactionId={transaction.id}
                        isMenuOpen={isMenuOpen}
                        onRowAction={onRowAction}
                      />
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
