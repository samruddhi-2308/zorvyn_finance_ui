import type { ReactElement } from 'react'

/**
 * Empty-state fallback for the entire insights section.
 */
export function InsightsEmptyState(): ReactElement {
  return (
    <article className="surface-card section-reveal border-dashed p-7 text-center">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Insights Not Available
      </h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Add more transactions to unlock monthly comparisons and category
        intelligence.
      </p>
    </article>
  )
}
