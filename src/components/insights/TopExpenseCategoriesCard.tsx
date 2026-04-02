import type { ReactElement } from 'react'
import type { TopExpenseCategoryInsight } from '@/types'
import { formatINR } from '@/utils'

interface TopExpenseCategoriesCardProps {
  readonly categories: readonly TopExpenseCategoryInsight[]
  readonly ariaLabel: string
  readonly isLoading: boolean
}

function TopExpenseCategoriesSkeleton(): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <div className="h-5 w-48 rounded bg-[var(--color-border)]" />
      <div className="mt-2 h-4 w-64 rounded bg-[var(--color-border)]" />
      <div className="mt-4 h-14 w-full rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-14 w-full rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-14 w-full rounded bg-[var(--color-border)]" />
    </article>
  )
}

function TopExpenseCategoriesEmptyState(): ReactElement {
  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Top Expense Categories
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Category ranking appears when expense transactions are available.
      </p>
      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text-muted)]">
        No top categories to rank yet.
      </div>
    </article>
  )
}

/**
 * Ranked top-three expense categories with relative contribution bars.
 */
export function TopExpenseCategoriesCard({
  categories,
  ariaLabel,
  isLoading,
}: TopExpenseCategoriesCardProps): ReactElement {
  if (isLoading) {
    return <TopExpenseCategoriesSkeleton />
  }

  if (categories.length === 0) {
    return <TopExpenseCategoriesEmptyState />
  }

  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Top Expense Categories
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Top three categories ranked by total expense contribution.
      </p>

      <p id="top-expense-categories-aria" className="sr-only">
        {ariaLabel}
      </p>

      <ol
        className="mt-4 space-y-3"
        aria-describedby="top-expense-categories-aria"
      >
        {categories.map((category) => {
          const clampedPercent = Math.min(
            100,
            Math.max(0, category.percentageOfTotalExpenses),
          )

          return (
            <li
              key={category.category}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-xs font-bold text-[var(--color-primary)]">
                    {category.rank}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {category.category}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {formatINR(category.totalSpent)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {category.percentageOfTotalExpenses.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{
                    width: `${clampedPercent}%`,
                  }}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </article>
  )
}
