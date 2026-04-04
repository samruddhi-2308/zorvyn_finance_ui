import type { CSSProperties, ReactElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCurrency, useUI } from '@/hooks'
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts'
import type { TreemapNode } from 'recharts'
import type { ExpenseCategory, SpendingBreakdownPoint } from '@/types'

interface SpendingBreakdownChartProps {
  readonly data: readonly SpendingBreakdownPoint[]
  readonly isLoading: boolean
  readonly selectedCategory: ExpenseCategory | null
  readonly ariaLabel: string
  readonly onSelectCategory: (category: ExpenseCategory) => void
}

const CHART_COLORS_LIGHT = [
  '#a8b8ffb3',
  '#9dddc5c5',
  '#ffd3a4b0',
  '#FFB9C2',
  '#A9D7FF',
  '#CDB9FF',
] as const

const CHART_COLORS_DARK = [
  '#a8b8ff9d',
  '#72c8d5c2',
  '#60a5fabf',
  '#a78bfaab',
  '#2dd4be71',
  '#818CF8',
] as const

function getChartColor(index: number, isDarkTheme: boolean): string {
  const chartColors = isDarkTheme ? CHART_COLORS_DARK : CHART_COLORS_LIGHT
  return chartColors[index % chartColors.length] ?? '#1D4ED8'
}

function hexToRgba(hexColor: string, alpha: number): string {
  const normalizedHex = hexColor.replace('#', '')

  if (normalizedHex.length !== 6) {
    return `rgb(37 99 235 / ${alpha})`
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16)
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16)
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16)

  return `rgb(${red} ${green} ${blue} / ${alpha})`
}

function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) {
    return label
  }

  return `${label.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

function toCompactCategoryLabel(label: string): string {
  const parts = label
    .split(/\s+|&|-/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  if (parts.length >= 2) {
    return parts
      .slice(0, 3)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  return truncateLabel(label, 10)
}

interface TreemapPoint extends SpendingBreakdownPoint {
  readonly name: string
  readonly fill: string
}

interface SpendingBreakdownTooltipProps {
  readonly active?: boolean
  readonly payload?: readonly {
    readonly payload?: TreemapPoint
  }[]
  readonly formatAmount: (value: number) => string
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

function SpendingBreakdownTooltip({
  active,
  payload,
  formatAmount,
}: SpendingBreakdownTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const firstPoint = payload[0]
  if (firstPoint === undefined) {
    return null
  }

  const point = firstPoint.payload

  if (!point) {
    return null
  }

  const categoryLabel = point.category
  const totalSpent = point.totalSpent
  const percentage = point.percentage

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/96 px-3 py-2 text-xs text-[var(--color-text-primary)] shadow-card backdrop-blur-xl">
      <p className="text-xs font-semibold text-[var(--color-text-muted)]">
        {categoryLabel}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
        {formatAmount(totalSpent)}
      </p>
      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
        {percentage.toFixed(1)}% of total expenses
      </p>
    </div>
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
  const { formatAmount } = useCurrency()
  const { theme } = useUI()
  const shouldReduceMotion = useReducedMotion()
  const hoverScale = shouldReduceMotion ? 1 : 1.01
  const isDarkTheme = theme === 'dark'

  if (isLoading) {
    return <SpendingBreakdownSkeleton />
  }

  if (data.length === 0) {
    return <SpendingBreakdownEmptyState />
  }

  return (
    <motion.article
      className="scroll-swipe-skip surface-card p-6"
      initial={shouldReduceMotion ? false : { opacity: 0, x: 56, y: 18 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Spending Breakdown
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Treemap blocks represent category spend proportion. Click a block to
        filter the transaction list by expense category.
      </p>

      {selectedCategory ? (
        <p
          className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            isDarkTheme
              ? 'border border-cyan-300/45 bg-cyan-400/15 text-cyan-100'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          Active category filter: {selectedCategory}
        </p>
      ) : null}

      {(() => {
        const treemapData = data.map((item, index) => ({
          ...item,
          name: item.category,
          fill: getChartColor(index, isDarkTheme),
        }))
        const fillByCategory = new Map(
          treemapData.map((item) => [item.category, item.fill]),
        )

        const onTreemapClick = (rawNode: unknown): void => {
          const node = rawNode as TreemapNode
          const category = treemapData.find(
            (item) => item.category === node.name,
          )?.category

          if (category !== undefined) {
            onSelectCategory(category)
          }
        }

        const renderTreemapNode = (rawNode: unknown): ReactElement => {
          const node = rawNode as TreemapNode
          const x = node.x
          const y = node.y
          const width = node.width
          const height = node.height
          const nodeName = node.name

          if (node.depth <= 0 || width <= 0 || height <= 0) {
            return <g />
          }

          const isSelected = selectedCategory === nodeName
          const canShowLabel = width > 44 && height > 20
          const labelText =
            width < 76
              ? toCompactCategoryLabel(nodeName)
              : truncateLabel(nodeName, 18)
          const labelFontSize = width < 76 ? 10 : 12
          const labelColor = isDarkTheme ? '#E6F0FF' : '#111827'
          const strokeColor = isSelected
            ? isDarkTheme
              ? '#22D3EE'
              : '#0F172A'
            : isDarkTheme
              ? 'rgb(2 6 23 / 0.72)'
              : '#FFFFFF'
          const fillColor =
            fillByCategory.get(nodeName as ExpenseCategory) ??
            getChartColor(node.index, isDarkTheme)

          return (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isSelected ? 2 : 1}
                rx={6}
              />
              {canShowLabel ? (
                <text
                  x={x + width / 2}
                  y={y + height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={labelColor}
                  fontSize={labelFontSize}
                  fontWeight={700}
                  pointerEvents="none"
                >
                  {labelText}
                </text>
              ) : null}
            </g>
          )
        }

        return (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:min-h-[20rem] lg:grid-cols-2 lg:items-stretch">
              <div
                className="overflow-hidden rounded-xl border bg-[var(--glass-surface)] p-3 lg:h-full"
                role="img"
                aria-label={ariaLabel}
                style={
                  {
                    borderColor: hexToRgba(treemapData[0]?.fill ?? '#A8B8FF', 0.35),
                    backgroundImage: `linear-gradient(150deg, ${hexToRgba(
                      treemapData[0]?.fill ?? '#A8B8FF',
                      isDarkTheme ? 0.3 : 0.2,
                    )}, ${isDarkTheme ? 'rgb(2 6 23 / 0.12)' : 'rgb(255 255 255 / 0)'} 62%)`,
                  } as CSSProperties
                }
              >
                <div className="h-full min-h-[16.25rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treemapData}
                      dataKey="totalSpent"
                      nameKey="name"
                      content={renderTreemapNode}
                      onClick={onTreemapClick}
                      isAnimationActive={!shouldReduceMotion}
                    >
                      <Tooltip
                        content={
                          <SpendingBreakdownTooltip formatAmount={formatAmount} />
                        }
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </div>

              <aside
                className="flex min-h-[16.25rem] flex-col rounded-xl border bg-[var(--glass-surface)] p-2.5 lg:h-full"
                style={
                  {
                    borderColor: hexToRgba(treemapData[1]?.fill ?? '#9DDDC4', 0.35),
                    backgroundImage: `linear-gradient(150deg, ${hexToRgba(
                      treemapData[1]?.fill ?? '#9DDDC4',
                      isDarkTheme ? 0.28 : 0.18,
                    )}, ${isDarkTheme ? 'rgb(2 6 23 / 0.12)' : 'rgb(255 255 255 / 0)'} 68%)`,
                  } as CSSProperties
                }
              >
                <p className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                  Categories
                </p>
                <ul className="mt-2 grid flex-1 grid-cols-2 grid-rows-3 gap-2">
                  {treemapData.map((item, index) => {
                    const isSelected = selectedCategory === item.category
                    const itemColor = getChartColor(index, isDarkTheme)

                    return (
                      <li key={item.category} className="h-full">
                        <button
                          type="button"
                          onClick={() => onSelectCategory(item.category)}
                          className={`h-full w-full rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                            isSelected
                              ? 'text-[var(--color-text-primary)]'
                              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-primary-soft)]'
                          }`}
                          style={
                            {
                              borderColor: hexToRgba(itemColor, isSelected ? 0.62 : 0.34),
                              backgroundImage: `linear-gradient(140deg, ${hexToRgba(
                                itemColor,
                                isSelected ? 0.24 : 0.16,
                              )}, ${hexToRgba(itemColor, 0.04)})`,
                            } as CSSProperties
                          }
                          aria-pressed={isSelected}
                          aria-label={`Filter transactions by ${item.category}`}
                        >
                          <span className="flex items-center justify-between gap-1.5">
                            <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold leading-4">
                              <span
                                className="h-2 w-2 flex-shrink-0 rounded-full"
                                style={{
                                  backgroundColor: getChartColor(index, isDarkTheme),
                                }}
                                aria-hidden="true"
                              />
                              <span className="break-words">{item.category}</span>
                            </span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </span>
                          <span className="mt-1 block text-[11px] font-semibold text-[var(--color-text-muted)]">
                            {formatAmount(item.totalSpent)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </aside>
            </div>
          </>
        )
      })()}
    </motion.article>
  )
}
