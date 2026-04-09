import type { ReactElement } from 'react'

interface SectionFallbackCardProps {
  readonly title: string
}

export function SectionFallbackCard({
  title,
}: SectionFallbackCardProps): ReactElement {
  return (
    <article
      className="surface-card section-reveal loading-shimmer p-7"
      aria-live="polite"
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Loading {title}
      </h3>
      <div className="mt-4 h-4 w-40 rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-40 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}
