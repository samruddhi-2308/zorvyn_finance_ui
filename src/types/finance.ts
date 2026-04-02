export type TransactionType = 'income' | 'expense'

export type TransactionStatus = 'completed' | 'pending'

export type PaymentMethod =
  | 'UPI'
  | 'Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Net Banking'
  | 'Wallet'

export type ExpenseCategory =
  | 'Food & Groceries'
  | 'Transport'
  | 'Entertainment'
  | 'Utilities'
  | 'Healthcare'
  | 'Shopping'

export type IncomeCategory = 'Salary' | 'Freelance' | 'Investments'

export type TransactionCategory = ExpenseCategory | IncomeCategory

export interface Transaction {
  readonly id: string
  readonly date: string
  readonly description: string
  readonly amount: number
  readonly type: TransactionType
  readonly category: TransactionCategory
  readonly paymentMethod: PaymentMethod
  readonly status: TransactionStatus
}

export interface TransactionDraft {
  readonly date: string
  readonly description: string
  readonly amount: number
  readonly type: TransactionType
  readonly category: TransactionCategory
  readonly paymentMethod: PaymentMethod
  readonly status?: TransactionStatus
}

export type TransactionUpdate = Partial<TransactionDraft>

export interface SummaryMetrics {
  readonly totalBalance: number
  readonly totalIncome: number
  readonly totalExpenses: number
  readonly savingsRate: number
}

export interface DateRangeFilter {
  readonly startDate?: string
  readonly endDate?: string
}

export type TransactionSortKey = 'date' | 'amount' | 'category'

export type SortDirection = 'asc' | 'desc'

export interface TransactionFilterOptions {
  readonly searchQuery?: string
  readonly types?: readonly TransactionType[]
  readonly categories?: readonly TransactionCategory[]
  readonly statuses?: readonly TransactionStatus[]
  readonly dateRange?: DateRangeFilter
  readonly sortBy?: TransactionSortKey
  readonly sortDirection?: SortDirection
}

export interface HighestSpendingCategoryInsight {
  readonly category: ExpenseCategory | null
  readonly totalSpent: number
  readonly percentageOfTotalExpenses: number
}

export interface MonthlyComparisonEntry {
  readonly monthKey: string
  readonly monthLabel: string
  readonly income: number
  readonly expenses: number
  readonly net: number
}

export interface SpendingTrendInsight {
  readonly direction: 'increase' | 'decrease' | 'neutral'
  readonly percentageChange: number
  readonly absoluteChange: number
  readonly previousMonthKey: string | null
  readonly currentMonthKey: string | null
  readonly summary: string
}

export interface TopExpenseCategoryInsight {
  readonly category: ExpenseCategory
  readonly totalSpent: number
  readonly percentageOfTotalExpenses: number
  readonly rank: number
}

export interface InsightsSnapshot {
  readonly highestSpendingCategory: HighestSpendingCategoryInsight
  readonly monthlyComparison: readonly MonthlyComparisonEntry[]
  readonly bestMonth: MonthlyComparisonEntry | null
  readonly worstMonth: MonthlyComparisonEntry | null
  readonly spendingTrend: SpendingTrendInsight
  readonly topExpenseCategories: readonly TopExpenseCategoryInsight[]
}
