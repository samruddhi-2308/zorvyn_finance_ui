import type { ExpenseCategory } from './finance'

export type TrendDirection = 'up' | 'down' | 'neutral'

export interface SummaryCardModel {
  readonly title: string
  readonly value: string
  readonly trendDirection: TrendDirection
  readonly trendValue: string
  readonly trendLabel: string
  readonly colorVariant: 'indigo' | 'green' | 'red' | 'blue'
}

export interface BalanceTrendPoint {
  readonly monthKey: string
  readonly monthLabel: string
  readonly income: number
  readonly expenses: number
}

export interface SpendingBreakdownPoint {
  readonly category: ExpenseCategory
  readonly totalSpent: number
  readonly percentage: number
}
