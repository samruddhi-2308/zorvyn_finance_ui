import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { computeDailyBalanceTrend } from './computeDailyBalanceTrend'

const TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'income-1',
    date: '2030-01-05',
    description: 'Consulting Payment',
    amount: 5000,
    type: 'income',
    category: 'Freelance',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
  },
  {
    id: 'expense-1',
    date: '2030-01-03',
    description: 'Groceries',
    amount: 1200,
    type: 'expense',
    category: 'Food & Groceries',
    paymentMethod: 'UPI',
    status: 'completed',
  },
] as const

const TRANSACTIONS_WITH_OPENING_BALANCE: readonly Transaction[] = [
  {
    id: 'income-opening',
    date: '2029-12-28',
    description: 'Opening Income',
    amount: 1000,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
  },
  ...TRANSACTIONS,
] as const

describe('computeDailyBalanceTrend', () => {
  it('returns dense daily points for requested day count', () => {
    const result = computeDailyBalanceTrend(TRANSACTIONS, 7)

    expect(result).toHaveLength(7)
    expect(result[0]?.monthKey).toBe('2029-12-30')
    expect(result[6]?.monthKey).toBe('2030-01-05')
  })

  it('aggregates income/expense and net by exact day while tracking cumulative balance', () => {
    const result = computeDailyBalanceTrend(TRANSACTIONS, 7)

    const expenseDay = result.find((point) => point.monthKey === '2030-01-03')
    const incomeDay = result.find((point) => point.monthKey === '2030-01-05')

    expect(expenseDay?.income).toBe(0)
    expect(expenseDay?.expenses).toBe(1200)
    expect(expenseDay?.net).toBe(-1200)
    expect(expenseDay?.cumulativeBalance).toBe(-1200)
    expect(expenseDay?.transactionCount).toBe(1)
    expect(expenseDay?.incomeTransactionCount).toBe(0)
    expect(expenseDay?.expenseTransactionCount).toBe(1)
    expect(expenseDay?.sampleTransactions[0]?.description).toBe('Groceries')

    expect(incomeDay?.income).toBe(5000)
    expect(incomeDay?.expenses).toBe(0)
    expect(incomeDay?.net).toBe(5000)
    expect(incomeDay?.cumulativeBalance).toBe(3800)
    expect(incomeDay?.transactionCount).toBe(1)
    expect(incomeDay?.incomeTransactionCount).toBe(1)
    expect(incomeDay?.expenseTransactionCount).toBe(0)
    expect(incomeDay?.sampleTransactions[0]?.description).toBe(
      'Consulting Payment',
    )
  })

  it('carries forward opening balance from dates before the plotted range', () => {
    const result = computeDailyBalanceTrend(TRANSACTIONS_WITH_OPENING_BALANCE, 7)

    expect(result[0]?.monthKey).toBe('2029-12-30')
    expect(result[0]?.cumulativeBalance).toBe(1000)
    expect(result[6]?.monthKey).toBe('2030-01-05')
    expect(result[6]?.cumulativeBalance).toBe(4800)
  })
})
