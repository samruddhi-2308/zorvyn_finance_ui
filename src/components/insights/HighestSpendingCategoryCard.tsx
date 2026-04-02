import type { ReactElement } from 'react'
import type { HighestSpendingCategoryInsight } from '@/types'
import { formatINR } from '@/utils'

interface HighestSpendingCategoryCardProps {
  readonly insight: HighestSpendingCategoryInsight
  readonly isLoading: boolean
}

function HighestSpendingCategorySkeleton(): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <div className="h-5 w-52 rounded bg-[var(--color-border)]" />
      <div className="mt-2 h-4 w-48 rounded bg-[var(--color-border)]" />
      <div className="mt-4 h-8 w-36 rounded bg-[var(--color-border)]" />
      <div className="mt-4 h-2.5 w-full rounded bg-[var(--color-border)]" />
    </article>
  )
}

function HighestSpendingCategoryEmptyState(): ReactElement {
  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Highest Spending Category
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Expense insights will appear once expense transactions are available.
      </p>
      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text-muted)]">
        No expense category data to rank yet.
      </div>
    </article>
  )
}

/**
 * Highlights the single largest expense category contribution.
 */
export function HighestSpendingCategoryCard({
  insight,
  isLoading,
}: HighestSpendingCategoryCardProps): ReactElement {
  if (isLoading) {
    return <HighestSpendingCategorySkeleton />
  }

  if (insight.category === null) {
    return <HighestSpendingCategoryEmptyState />
  }

  const clampedPercentage = Math.min(
    100,
    Math.max(0, insight.percentageOfTotalExpenses),
  )

  return (
    <article
      className="surface-card p-5"
      aria-label={`Highest spending category is ${insight.category} at ${formatINR(insight.totalSpent)}`}
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Highest Spending Category
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Category with the largest share of total expenses.
      </p>

      <p className="mt-4 text-sm font-semibold text-[var(--color-primary)]">
        {insight.category}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {formatINR(insight.totalSpent)}
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {insight.percentageOfTotalExpenses.toFixed(1)}% of all expense volume
      </p>

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--color-primary-soft)]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
          style={{
            width: `${clampedPercentage}%`,
          }}
        />
      </div>
    </article>
  )
}
