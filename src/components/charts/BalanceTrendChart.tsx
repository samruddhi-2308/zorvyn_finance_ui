import type { ReactElement } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BalanceTrendPoint } from '@/types'

interface BalanceTrendChartProps {
  readonly data: readonly BalanceTrendPoint[]
  readonly isLoading: boolean
  readonly ariaLabel: string
}

const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function BalanceTrendSkeleton(): ReactElement {
  return (
    <article className="surface-card animate-pulse p-5">
      <div className="h-5 w-44 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 rounded bg-slate-200" />
      <div className="mt-6 h-64 rounded-xl bg-slate-200" />
    </article>
  )
}

function BalanceTrendEmptyState(): ReactElement {
  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Balance Trend
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Monthly income and expenses will appear here once transactions are
        available.
      </p>
      <div className="mt-5 flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          No monthly data available
        </p>
      </div>
    </article>
  )
}

/**
 * Time-based dashboard chart showing monthly income and expenses.
 */
export function BalanceTrendChart({
  data,
  isLoading,
  ariaLabel,
}: BalanceTrendChartProps): ReactElement {
  if (isLoading) {
    return <BalanceTrendSkeleton />
  }

  if (data.length === 0) {
    return <BalanceTrendEmptyState />
  }

  return (
    <article className="surface-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Balance Trend
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Income versus expense trend across months.
      </p>

      <div
        className="mt-5 h-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3"
        role="img"
        aria-label={ariaLabel}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#C8D4E3" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) =>
                compactCurrencyFormatter.format(Number(value))
              }
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              labelStyle={{ color: '#0F172A', fontWeight: 600 }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #CFDAE9',
                backgroundColor: '#FFFFFF',
              }}
            />
            <Legend
              iconType="circle"
              formatter={(label) =>
                label === 'income' ? 'Income' : 'Expenses'
              }
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#16A34A"
              fill="url(#incomeGradient)"
              strokeWidth={2}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#DC2626"
              fill="url(#expenseGradient)"
              strokeWidth={2}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}
