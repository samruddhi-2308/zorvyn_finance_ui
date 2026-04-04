import { useMemo, useState, type ReactElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCurrency } from '@/hooks'
import {
  Area,
  AreaChart,
  Brush,
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

interface BrushWindow {
  readonly startIndex: number
  readonly endIndex: number
}

interface YAxisDomain {
  readonly min: number
  readonly max: number
}

const DEFAULT_BRUSH_START_MONTH_DAY = '02-03'
const DEFAULT_BRUSH_END_MONTH_DAY = '09-15'
const DEFAULT_BRUSH_FALLBACK_SPAN = 171

interface BalanceTrendTooltipEntry {
  readonly dataKey?: string | number
  readonly value?: number | string
}

interface BalanceTrendTooltipPointPayload {
  readonly fullLabel?: string
  readonly net?: number
  readonly transactionCount?: number
  readonly incomeTransactionCount?: number
  readonly expenseTransactionCount?: number
  readonly sampleTransactions?: readonly {
    readonly id: string
    readonly description: string
    readonly type: 'income' | 'expense'
    readonly amount: number
  }[]
}

interface BalanceTrendTooltipProps {
  readonly active?: boolean
  readonly label?: string | number
  readonly payload?: readonly BalanceTrendTooltipEntry[]
  readonly formatAmount: (value: number) => string
}

function BalanceTrendTooltip({
  active,
  payload,
  formatAmount,
}: BalanceTrendTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const firstPayload = payload[0]
  const balancePoint = payload.find(
    (entry) => entry.dataKey === 'cumulativeBalance',
  )
  const incomePoint = payload.find((entry) => entry.dataKey === 'income')
  const expensePoint = payload.find((entry) => entry.dataKey === 'expenses')
  const pointPayload =
    (firstPayload as { readonly payload?: BalanceTrendTooltipPointPayload } | undefined)
      ?.payload
  const pointLabel = pointPayload?.fullLabel ?? 'Selected day'
  const netAmount = Number(pointPayload?.net ?? 0)
  const transactionCount = Number(pointPayload?.transactionCount ?? 0)
  const incomeTransactionCount = Number(
    pointPayload?.incomeTransactionCount ?? 0,
  )
  const expenseTransactionCount = Number(
    pointPayload?.expenseTransactionCount ?? 0,
  )
  const sampleTransactions = pointPayload?.sampleTransactions ?? []

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/96 px-3 py-2 text-xs text-[var(--color-text-primary)] shadow-card backdrop-blur-xl">
      <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">
        {pointLabel}
      </p>
      <p className="mb-1 text-[11px] text-[var(--color-text-muted)]">
        Transactions: {transactionCount} ({incomeTransactionCount} income,{' '}
        {expenseTransactionCount} expense)
      </p>
      <p className="text-[13px] font-medium text-rose-500">
        Day Expense: {formatAmount(Number(expensePoint?.value ?? 0))}
      </p>
      <p className="text-[13px] font-medium text-emerald-500">
        Day Income: {formatAmount(Number(incomePoint?.value ?? 0))}
      </p>
      <p className="text-[13px] font-medium text-[var(--color-text-muted)]">
        Day Net: {formatAmount(netAmount)}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
        Total Balance: {formatAmount(Number(balancePoint?.value ?? 0))}
      </p>
      {sampleTransactions.length > 0 ? (
        <div className="mt-2 border-t border-[var(--color-border)] pt-2">
          <p className="mb-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
            Largest transactions that day
          </p>
          {sampleTransactions.map((transaction) => (
            <p
              key={transaction.id}
              className="flex items-center justify-between gap-3 text-[11px]"
            >
              <span className="truncate text-[var(--color-text-primary)]">
                {transaction.description}
              </span>
              <span
                className={
                  transaction.type === 'income'
                    ? 'font-semibold text-emerald-500'
                    : 'font-semibold text-rose-500'
                }
              >
                {formatAmount(transaction.amount)}
              </span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function formatAxisDateLabel(value: string | number): string {
  const normalizedValue = String(value)
  const parsedDate = new Date(`${normalizedValue}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(parsedDate)
}

function getDefaultBrushWindow(data: readonly BalanceTrendPoint[]): BrushWindow {
  if (data.length === 0) {
    return {
      startIndex: 0,
      endIndex: 0,
    }
  }

  const marchWindowStartByYear = new Map<string, number>()

  for (const [index, point] of data.entries()) {
    const monthDay = point.monthKey.slice(5)
    if (monthDay !== DEFAULT_BRUSH_START_MONTH_DAY) {
      continue
    }

    marchWindowStartByYear.set(point.monthKey.slice(0, 4), index)
  }

  for (let index = data.length - 1; index >= 0; index -= 1) {
    const point = data[index]
    if (!point) {
      continue
    }

    const monthDay = point.monthKey.slice(5)
    if (monthDay !== DEFAULT_BRUSH_END_MONTH_DAY) {
      continue
    }

    const startIndex = marchWindowStartByYear.get(point.monthKey.slice(0, 4))

    if (startIndex !== undefined && startIndex < index) {
      return {
        startIndex,
        endIndex: index,
      }
    }
  }

  const endIndex = data.length - 1

  return {
    startIndex: Math.max(0, endIndex - DEFAULT_BRUSH_FALLBACK_SPAN),
    endIndex,
  }
}

function getPaddedYAxisDomain(data: readonly BalanceTrendPoint[]): YAxisDomain {
  if (data.length === 0) {
    return {
      min: 0,
      max: 0,
    }
  }

  let minValue = Number.POSITIVE_INFINITY
  let maxValue = Number.NEGATIVE_INFINITY

  for (const point of data) {
    if (point.cumulativeBalance < minValue) {
      minValue = point.cumulativeBalance
    }

    if (point.cumulativeBalance > maxValue) {
      maxValue = point.cumulativeBalance
    }
  }

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return {
      min: 0,
      max: 0,
    }
  }

  const spread = maxValue - minValue
  const baseForPadding = spread === 0 ? Math.max(1, Math.abs(maxValue)) : spread
  const padding = baseForPadding * 0.1

  return {
    min: minValue - padding,
    max: maxValue + padding,
  }
}

function BalanceTrendSkeleton(): ReactElement {
  return (
    <article className="surface-card loading-shimmer p-6">
      <div className="h-5 w-44 rounded bg-[var(--color-border)]" />
      <div className="mt-2 h-4 w-72 rounded bg-[var(--color-border)]" />
      <div className="mt-6 h-64 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}

function BalanceTrendEmptyState(): ReactElement {
  return (
    <article className="surface-card p-6">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Cumulative Balance Runway
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Cumulative daily balance over time will appear here once transactions are available.
      </p>
      <div className="mt-5 flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)]">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">
          No balance runway data available
        </p>
      </div>
    </article>
  )
}

/**
 * Time-based dashboard chart showing cumulative balance runway behavior.
 */
export function BalanceTrendChart({
  data,
  isLoading,
  ariaLabel,
}: BalanceTrendChartProps): ReactElement {
  const { formatAmount, formatCompactAmount } = useCurrency()
  const shouldReduceMotion = useReducedMotion()
  const hoverScale = shouldReduceMotion ? 1 : 1.01
  const isDenseSeries = data.length > 365
  const yAxisDomain = useMemo(() => getPaddedYAxisDomain(data), [data])
  const [brushWindow, setBrushWindow] = useState<BrushWindow>(() =>
    getDefaultBrushWindow(data),
  )

  const brushWindowForRender = useMemo<BrushWindow>(() => {
    const maxIndex = Math.max(0, data.length - 1)
    const boundedStart = Math.max(0, Math.min(brushWindow.startIndex, maxIndex))
    const boundedEnd = Math.max(0, Math.min(brushWindow.endIndex, maxIndex))

    return {
      startIndex: Math.min(boundedStart, boundedEnd),
      endIndex: Math.max(boundedStart, boundedEnd),
    }
  }, [brushWindow.endIndex, brushWindow.startIndex, data.length])

  const onBrushChange = (nextWindow: {
    readonly startIndex?: number
    readonly endIndex?: number
  }): void => {
    if (
      nextWindow.startIndex === undefined ||
      nextWindow.endIndex === undefined
    ) {
      return
    }

    const boundedStart = Math.max(
      0,
      Math.min(nextWindow.startIndex, data.length - 1),
    )
    const boundedEnd = Math.max(0, Math.min(nextWindow.endIndex, data.length - 1))

    setBrushWindow({
      startIndex: Math.min(boundedStart, boundedEnd),
      endIndex: Math.max(boundedStart, boundedEnd),
    })
  }

  if (isLoading) {
    return <BalanceTrendSkeleton />
  }

  if (data.length === 0) {
    return <BalanceTrendEmptyState />
  }

  return (
    <motion.article
      className="scroll-swipe-skip surface-card p-6"
      initial={shouldReduceMotion ? false : { opacity: 0, x: -56, y: 18 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Cumulative Balance Runway
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Running total balance across two years based on daily net cash movement.
        Use the brush to zoom into specific periods.
      </p>

      <div
        className="balance-runway-chart mt-5 h-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3"
        role="img"
        aria-label={ariaLabel}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceRunwayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeOpacity={0.45}
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="monthKey"
              tickFormatter={formatAxisDateLabel}
              minTickGap={20}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCompactAmount(Number(value))}
              dataKey="cumulativeBalance"
              domain={[yAxisDomain.min, yAxisDomain.max]}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip content={<BalanceTrendTooltip formatAmount={formatAmount} />} />
            <Legend
              iconType="circle"
              formatter={() => (
                <span className="text-xs text-[var(--color-text-muted)]">
                  Cumulative Total Balance
                </span>
              )}
            />
            <Area
              type="monotoneX"
              dataKey="cumulativeBalance"
              fill="url(#balanceRunwayGradient)"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!isDenseSeries}
              activeDot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
            />
            <Brush
              dataKey="monthKey"
              startIndex={brushWindowForRender.startIndex}
              endIndex={brushWindowForRender.endIndex}
              onChange={onBrushChange}
              height={28}
              stroke="var(--color-primary)"
              fill="var(--color-primary-soft)"
              travellerWidth={10}
              tickFormatter={formatAxisDateLabel}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.article>
  )
}
