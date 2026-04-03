import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { computeSummary } from './computeSummary'

const SAMPLE_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 't1',
    date: '2025-04-01',
    description: 'Salary credit',
    amount: 100000,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
  },
  {
    id: 't2',
    date: '2025-04-02',
    description: 'Freelance payment',
    amount: 20000,
    type: 'income',
    category: 'Freelance',
    paymentMethod: 'UPI',
    status: 'completed',
  },
  {
    id: 't3',
    date: '2025-04-03',
    description: 'Groceries',
    amount: 5000,
    type: 'expense',
    category: 'Food & Groceries',
    paymentMethod: 'Card',
    status: 'completed',
  },
  {
    id: 't4',
    date: '2025-04-04',
    description: 'Utilities bill',
    amount: 3000,
    type: 'expense',
    category: 'Utilities',
    paymentMethod: 'UPI',
    status: 'completed',
  },
] as const

describe('computeSummary', () => {
  it('computes totals and savings rate from mixed transactions', () => {
    const result = computeSummary(SAMPLE_TRANSACTIONS)

    expect(result.totalIncome).toBe(120000)
    expect(result.totalExpenses).toBe(8000)
    expect(result.totalBalance).toBe(112000)
    expect(result.savingsRate).toBeCloseTo(112000 / 120000)
  })

  it('returns zero savings rate when there is no income', () => {
    const expensesOnly = SAMPLE_TRANSACTIONS.filter(
      (transaction) => transaction.type === 'expense',
    )

    const result = computeSummary(expensesOnly)

    expect(result.totalIncome).toBe(0)
    expect(result.totalExpenses).toBe(8000)
    expect(result.totalBalance).toBe(-8000)
    expect(result.savingsRate).toBe(0)
  })
})
