import type { ReactElement } from 'react'
import type { MonthlyComparisonEntry } from '@/types'
import { formatINR } from '@/utils'

interface MonthlyComparisonPanelProps {
  readonly entries: readonly MonthlyComparisonEntry[]
  readonly bestMonth: MonthlyComparisonEntry | null
  readonly worstMonth: MonthlyComparisonEntry | null
  readonly ariaLabel: string
  readonly isLoading: boolean
}

function getNetTextColor(net: number): string {
  if (net > 0) {
    return 'text-emerald-700'
  }

  if (net < 0) {
    return 'text-rose-700'
  }

  return 'text-slate-700'
}

function MonthlyComparisonSkeleton(): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-64 rounded bg-slate-200" />
      <div className="mt-4 h-7 w-full rounded bg-slate-200" />
      <div className="mt-2 h-7 w-full rounded bg-slate-200" />
      <div className="mt-2 h-7 w-full rounded bg-slate-200" />
    </article>
  )
}

function MonthlyComparisonEmptyState(): ReactElement {
  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Monthly Comparison
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Income, expense, and net flow comparison appears when monthly data
        exists.
      </p>
      <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-text-muted)]">
        No month-level data available.
      </div>
    </article>
  )
}

/**
 * Compares monthly income, expenses, and net cash flow in a tabular panel.
 */
export function MonthlyComparisonPanel({
  entries,
  bestMonth,
  worstMonth,
  ariaLabel,
  isLoading,
}: MonthlyComparisonPanelProps): ReactElement {
  if (isLoading) {
    return <MonthlyComparisonSkeleton />
  }

  if (entries.length === 0) {
    return <MonthlyComparisonEmptyState />
  }

  return (
    <article className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Monthly Comparison
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Month-over-month income and expense outcomes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {bestMonth !== null ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
              Best net: {bestMonth.monthLabel}
            </span>
          ) : null}
          {worstMonth !== null ? (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-800">
              Lowest net: {worstMonth.monthLabel}
            </span>
          ) : null}
        </div>
      </div>

      <p id="monthly-comparison-aria" className="sr-only">
        {ariaLabel}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table
          className="min-w-full border-separate border-spacing-0 text-sm"
          aria-describedby="monthly-comparison-aria"
        >
          <caption className="sr-only">
            Monthly income, expense, and net comparison
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="border-b border-[var(--color-border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Month
              </th>
              <th
                scope="col"
                className="border-b border-[var(--color-border)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Income
              </th>
              <th
                scope="col"
                className="border-b border-[var(--color-border)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Expenses
              </th>
              <th
                scope="col"
                className="border-b border-[var(--color-border)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Net
              </th>
              <th
                scope="col"
                className="border-b border-[var(--color-border)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]"
              >
                Tag
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isBest = bestMonth?.monthKey === entry.monthKey
              const isWorst = worstMonth?.monthKey === entry.monthKey
              const rowToneClass = isBest
                ? 'bg-emerald-50/70'
                : isWorst
                  ? 'bg-rose-50/70'
                  : ''

              const tagLabel =
                isBest && isWorst
                  ? 'Only month'
                  : isBest
                    ? 'Best net'
                    : isWorst
                      ? 'Lowest net'
                      : '-'

              return (
                <tr key={entry.monthKey} className={rowToneClass}>
                  <th
                    scope="row"
                    className="border-b border-[var(--color-border)] px-3 py-2 text-left font-medium text-[var(--color-text-primary)]"
                  >
                    {entry.monthLabel}
                  </th>
                  <td className="border-b border-[var(--color-border)] px-3 py-2 text-right text-[var(--color-text-primary)]">
                    {formatINR(entry.income)}
                  </td>
                  <td className="border-b border-[var(--color-border)] px-3 py-2 text-right text-[var(--color-text-primary)]">
                    {formatINR(entry.expenses)}
                  </td>
                  <td
                    className={`border-b border-[var(--color-border)] px-3 py-2 text-right font-semibold ${getNetTextColor(entry.net)}`}
                  >
                    {formatINR(entry.net)}
                  </td>
                  <td className="border-b border-[var(--color-border)] px-3 py-2 text-right text-xs font-semibold text-[var(--color-text-muted)]">
                    {tagLabel}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </article>
  )
}
