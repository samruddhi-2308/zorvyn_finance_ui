import type {
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from '@/types/finance'

export const TRANSACTION_TYPES = [
  'income',
  'expense',
] as const satisfies readonly TransactionType[]

export const TRANSACTION_STATUSES = [
  'completed',
  'pending',
] as const satisfies readonly TransactionStatus[]

export const PAYMENT_METHODS = [
  'UPI',
  'Card',
  'Bank Transfer',
  'Cash',
  'Net Banking',
  'Wallet',
] as const satisfies readonly PaymentMethod[]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
] as const satisfies readonly IncomeCategory[]

export const EXPENSE_CATEGORIES = [
  'Food & Groceries',
  'Transport',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
] as const satisfies readonly ExpenseCategory[]

export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const satisfies readonly TransactionCategory[]
