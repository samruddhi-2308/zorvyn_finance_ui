import type { ReactElement } from 'react'
import type { SpendingTrendInsight } from '@/types'
import { formatINR, formatMonthKey } from '@/utils'

interface SpendingTrendCardProps {
  readonly trend: SpendingTrendInsight
  readonly isLoading: boolean
}

function SpendingTrendSkeleton(): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-64 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-32 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-40 rounded bg-slate-200" />
      <div className="mt-4 h-16 w-full rounded bg-slate-200" />
    </article>
  )
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(1)}%`
}

function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatINR(Math.abs(value))}`
}

function resolveTrendClasses(direction: SpendingTrendInsight['direction']): {
  readonly numberTone: string
  readonly badgeTone: string
} {
  if (direction === 'increase') {
    return {
      numberTone: 'text-rose-700',
      badgeTone: 'bg-rose-100 text-rose-800',
    }
  }

  if (direction === 'decrease') {
    return {
      numberTone: 'text-emerald-700',
      badgeTone: 'bg-emerald-100 text-emerald-800',
    }
  }

  return {
    numberTone: 'text-slate-700',
    badgeTone: 'bg-slate-100 text-slate-800',
  }
}

function resolveDirectionLabel(
  direction: SpendingTrendInsight['direction'],
): string {
  if (direction === 'increase') {
    return 'Spending Increased'
  }

  if (direction === 'decrease') {
    return 'Spending Decreased'
  }

  return 'Spending Stable'
}

function toPeriodLabel(monthKey: string | null, fallbackLabel: string): string {
  return monthKey === null ? fallbackLabel : formatMonthKey(monthKey)
}

/**
 * Displays expense trend delta between the latest two months.
 */
export function SpendingTrendCard({
  trend,
  isLoading,
}: SpendingTrendCardProps): ReactElement {
  if (isLoading) {
    return <SpendingTrendSkeleton />
  }

  const classMap = resolveTrendClasses(trend.direction)
  const previousPeriodLabel = toPeriodLabel(
    trend.previousMonthKey,
    'Prev month',
  )
  const currentPeriodLabel = toPeriodLabel(
    trend.currentMonthKey,
    'Current month',
  )

  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Spending Trend Delta
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Delta between the latest two monthly expense totals.
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${classMap.badgeTone}`}
        >
          {resolveDirectionLabel(trend.direction)}
        </span>
        <span className="text-xs font-medium text-[var(--color-text-muted)]">
          {previousPeriodLabel} to {currentPeriodLabel}
        </span>
      </div>

      <p
        className={`mt-3 text-3xl font-bold tracking-tight ${classMap.numberTone}`}
      >
        {formatSignedPercent(trend.percentageChange)}
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Absolute change: {formatSignedCurrency(trend.absoluteChange)}
      </p>

      <p className="mt-4 rounded-xl bg-[var(--color-background)] p-3 text-sm text-[var(--color-text-primary)]">
        {trend.summary}
      </p>
    </article>
  )
}
