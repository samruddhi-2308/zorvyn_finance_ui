import type { ReactElement, ReactNode } from 'react'
import type { SummaryCardModel } from '@/types'

interface SummaryCardProps {
  readonly title: string
  readonly value: string
  readonly trendDirection: SummaryCardModel['trendDirection']
  readonly trendValue: string
  readonly trendLabel: string
  readonly colorVariant: SummaryCardModel['colorVariant']
}

const variantStyles: Record<
  SummaryCardModel['colorVariant'],
  {
    readonly accent: string
    readonly iconBg: string
    readonly iconFg: string
  }
> = {
  indigo: {
    accent: 'from-blue-600/15 to-indigo-500/15 border-blue-200/70',
    iconBg: 'bg-blue-100',
    iconFg: 'text-blue-700',
  },
  green: {
    accent: 'from-emerald-600/15 to-green-500/15 border-emerald-200/80',
    iconBg: 'bg-emerald-100',
    iconFg: 'text-emerald-700',
  },
  red: {
    accent: 'from-rose-600/15 to-red-500/15 border-rose-200/80',
    iconBg: 'bg-rose-100',
    iconFg: 'text-rose-700',
  },
  blue: {
    accent: 'from-cyan-600/15 to-sky-500/15 border-cyan-200/80',
    iconBg: 'bg-cyan-100',
    iconFg: 'text-cyan-700',
  },
}

function renderTrendIcon(
  direction: SummaryCardModel['trendDirection'],
): ReactNode {
  if (direction === 'up') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          d="M4 13L10 7L16 13M10 7V17"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (direction === 'down') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          d="M4 7L10 13L16 7M10 13V3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M4 10H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function getDirectionClass(
  direction: SummaryCardModel['trendDirection'],
): string {
  if (direction === 'up') {
    return 'text-emerald-700 bg-emerald-100'
  }

  if (direction === 'down') {
    return 'text-rose-700 bg-rose-100'
  }

  return 'text-slate-700 bg-slate-100'
}

/**
 * KPI summary card for dashboard overview metrics.
 */
export function SummaryCard({
  title,
  value,
  trendDirection,
  trendValue,
  trendLabel,
  colorVariant,
}: SummaryCardProps): ReactElement {
  const style = variantStyles[colorVariant]

  return (
    <article
      className={`surface-card relative overflow-hidden border bg-gradient-to-br p-4 ${style.accent}`}
      aria-label={`${title}: ${value}`}
    >
      <div
        className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg ${style.iconBg} ${style.iconFg}`}
        aria-hidden="true"
      >
        <span className="text-sm font-bold">₹</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {title}
      </p>
      <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getDirectionClass(trendDirection)}`}
        >
          {renderTrendIcon(trendDirection)}
          {trendValue}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {trendLabel}
        </span>
      </div>
    </article>
  )
}
