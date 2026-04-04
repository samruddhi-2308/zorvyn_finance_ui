import type { ExpenseCategory } from './finance'

export type TrendDirection = 'up' | 'down' | 'neutral'

export interface SummaryCardModel {
  readonly title: string
  readonly value: number
  readonly valueKind: 'currency' | 'percent'
  readonly trendDirection: TrendDirection
  readonly trendValue: string
  readonly trendLabel: string
  readonly colorVariant: 'indigo' | 'green' | 'red' | 'blue'
}

export interface BalanceTrendPoint {
  readonly monthKey: string
  readonly monthLabel: string
  readonly fullLabel: string
  readonly income: number
  readonly expenses: number
  readonly net: number
  readonly cumulativeBalance: number
  readonly transactionCount: number
  readonly incomeTransactionCount: number
  readonly expenseTransactionCount: number
  readonly sampleTransactions: readonly {
    readonly id: string
    readonly description: string
    readonly type: 'income' | 'expense'
    readonly amount: number
  }[]
}

export interface SpendingBreakdownPoint {
  readonly category: ExpenseCategory
  readonly totalSpent: number
  readonly percentage: number
}

export interface CashFlowSankeyNode {
  readonly id: string
  readonly name: string
  readonly kind: 'root' | 'allocation' | 'category' | 'transaction' | 'aggregate'
  readonly category?: ExpenseCategory
  readonly totalAmount?: number
  readonly transactionCount?: number
  readonly shareOfExpenses?: number
}

export interface CashFlowSankeyLink {
  readonly source: number
  readonly target: number
  readonly value: number
}

export interface CashFlowSankeyData {
  readonly nodes: readonly CashFlowSankeyNode[]
  readonly links: readonly CashFlowSankeyLink[]
}
