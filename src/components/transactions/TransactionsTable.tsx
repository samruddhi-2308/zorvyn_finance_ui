import type { KeyboardEvent, MouseEvent, ReactElement } from 'react'
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

function getSortIndicator(
  sortState: TransactionSortState,
  column: TransactionSortKey,
): string {
  if (sortState.sortBy !== column) {
    return '<>'
  }

  return sortState.sortDirection === 'asc' ? '^' : 'v'
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
  const onTableClick = (event: MouseEvent<HTMLTableElement>): void => {
    const target = event.target as HTMLElement
    const actionElement = target.closest<HTMLElement>('[data-row-action]')

    if (!actionElement) {
      return
    }

    const action = actionElement.dataset['rowAction'] as
      | TransactionRowAction
      | undefined
    const transactionId = actionElement.dataset['transactionId']

    if (!action || !transactionId) {
      return
    }

    onRowAction(action, transactionId)
  }

  const onTableKeyDown = (event: KeyboardEvent<HTMLTableElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    const target = event.target as HTMLElement
    const actionElement = target.closest<HTMLElement>('[data-row-action]')

    if (!actionElement) {
      return
    }

    event.preventDefault()
    actionElement.click()
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table
        className="min-w-full border-collapse"
        aria-label="Transactions table"
        role="grid"
        onClick={onTableClick}
        onKeyDown={onTableKeyDown}
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

              return (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
                >
                  <button
                    type="button"
                    onClick={() => onSortChange(column)}
                    className="inline-flex items-center gap-1 transition hover:text-[var(--color-text-primary)]"
                    aria-label={`Sort by ${label}`}
                  >
                    <span>{label}</span>
                    <span aria-hidden="true">
                      {getSortIndicator(sortState, column)}
                    </span>
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="p-0">
                <TransactionsEmptyState
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={onResetFilters}
                />
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => {
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
                      <button
                        type="button"
                        data-row-action="toggle-menu"
                        data-transaction-id={transaction.id}
                        className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        aria-label="Open transaction actions menu"
                      >
                        ...
                      </button>

                      {isMenuOpen ? (
                        <div
                          data-actions-menu="true"
                          className="absolute right-4 z-20 mt-2 w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-card"
                          role="menu"
                          aria-label="Transaction actions"
                        >
                          <button
                            type="button"
                            data-row-action="edit"
                            data-transaction-id={transaction.id}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
                            role="menuitem"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            data-row-action="delete"
                            data-transaction-id={transaction.id}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50"
                            role="menuitem"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
