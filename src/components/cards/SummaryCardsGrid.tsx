import type { ReactElement } from 'react'
import type { SummaryCardModel } from '@/types'
import { SummaryCard } from './SummaryCard'

interface SummaryCardsGridProps {
  readonly cards: readonly SummaryCardModel[]
  readonly isLoading: boolean
}

function SummaryCardSkeleton(): ReactElement {
  return (
    <article
      className="surface-card loading-shimmer border p-5"
      aria-label="Loading dashboard summary card"
    >
      <div className="h-3 w-28 rounded bg-[var(--color-border)]" />
      <div className="mt-4 h-8 w-36 rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-5 w-40 rounded bg-[var(--color-border)]" />
    </article>
  )
}

/**
 * Responsive grid for top-level dashboard summary cards.
 */
export function SummaryCardsGrid({
  cards,
  isLoading,
}: SummaryCardsGridProps): ReactElement {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="stagger-rise"
            style={{ animationDelay: `${index * 85}ms` }}
          >
            <SummaryCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="stagger-rise"
          style={{ animationDelay: `${index * 85}ms` }}
        >
          <SummaryCard
            title={card.title}
            value={card.value}
            trendDirection={card.trendDirection}
            trendValue={card.trendValue}
            trendLabel={card.trendLabel}
            colorVariant={card.colorVariant}
          />
        </div>
      ))}
    </div>
  )
}
