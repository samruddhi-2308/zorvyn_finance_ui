import type { ReactElement } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { ExpenseCategory, SpendingBreakdownPoint } from '@/types'
import { formatINR } from '@/utils'

interface SpendingBreakdownChartProps {
  readonly data: readonly SpendingBreakdownPoint[]
  readonly isLoading: boolean
  readonly selectedCategory: ExpenseCategory | null
  readonly ariaLabel: string
  readonly onSelectCategory: (category: ExpenseCategory) => void
}

const CHART_COLORS = [
  '#1D4ED8',
  '#16A34A',
  '#F97316',
  '#DC2626',
  '#0EA5E9',
  '#7C3AED',
] as const

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] ?? '#1D4ED8'
}

function SpendingBreakdownSkeleton(): ReactElement {
  return (
    <article className="surface-card loading-shimmer p-6">
      <div className="h-5 w-48 rounded bg-[var(--color-border)]" />
      <div className="mt-2 h-4 w-72 rounded bg-[var(--color-border)]" />
      <div className="mt-6 h-64 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}

function SpendingBreakdownEmptyState(): ReactElement {
  return (
    <article className="surface-card p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Spending Breakdown
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Category distribution appears when expense transactions are present.
      </p>
      <div className="mt-5 flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          No expense data available
        </p>
      </div>
    </article>
  )
}

/**
 * Categorical expense chart with click interaction that drives transaction filtering.
 */
export function SpendingBreakdownChart({
  data,
  isLoading,
  selectedCategory,
  ariaLabel,
  onSelectCategory,
}: SpendingBreakdownChartProps): ReactElement {
  if (isLoading) {
    return <SpendingBreakdownSkeleton />
  }

  if (data.length === 0) {
    return <SpendingBreakdownEmptyState />
  }

  return (
    <article className="surface-card p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Spending Breakdown
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Click a slice to filter the transaction list by expense category.
      </p>

      {selectedCategory ? (
        <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          Active chart filter: {selectedCategory}
        </p>
      ) : null}

      <div
        className="mt-5 h-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3"
        role="img"
        aria-label={ariaLabel}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalSpent"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={45}
              paddingAngle={2}
              onClick={(_, index) => {
                if (typeof index !== 'number') {
                  return
                }

                const selectedItem = data[index]

                if (!selectedItem) {
                  return
                }

                onSelectCategory(selectedItem.category)
              }}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={getChartColor(index)}
                  stroke={
                    selectedCategory === entry.category ? '#0F172A' : '#FFFFFF'
                  }
                  strokeWidth={selectedCategory === entry.category ? 2 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #CFDAE9',
                backgroundColor: '#FFFFFF',
              }}
            />
            <Legend
              iconType="circle"
              formatter={(label) => <span className="text-xs">{label}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {data.map((item, index) => {
          const isSelected = selectedCategory === item.category

          return (
            <li key={item.category}>
              <button
                type="button"
                onClick={() => onSelectCategory(item.category)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-soft)]'
                }`}
                aria-pressed={isSelected}
                aria-label={`Filter transactions by ${item.category}`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: getChartColor(index),
                    }}
                    aria-hidden="true"
                  />
                  {item.category}
                </span>
                <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                  {formatINR(item.totalSpent)} ({item.percentage.toFixed(1)}%)
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
