import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { filterTransactions } from './filterTransactions'

const TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'txn-1',
    date: '2025-04-05',
    description: 'BigBasket groceries',
    amount: 3200,
    type: 'expense',
    category: 'Food & Groceries',
    paymentMethod: 'UPI',
    status: 'completed',
  },
  {
    id: 'txn-2',
    date: '2025-04-12',
    description: 'Salary April',
    amount: 85000,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
  },
  {
    id: 'txn-3',
    date: '2025-05-01',
    description: 'Metro commute',
    amount: 1200,
    type: 'expense',
    category: 'Transport',
    paymentMethod: 'Card',
    status: 'pending',
  },
  {
    id: 'txn-4',
    date: '2025-05-15',
    description: 'Healthcare consultation',
    amount: 2500,
    type: 'expense',
    category: 'Healthcare',
    paymentMethod: 'UPI',
    status: 'completed',
  },
] as const

describe('filterTransactions', () => {
  it('filters by search query across description and category', () => {
    const result = filterTransactions(TRANSACTIONS, {
      searchQuery: 'groceries',
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('txn-1')
  })

  it('applies composable filters and sorting', () => {
    const result = filterTransactions(TRANSACTIONS, {
      types: ['expense'],
      statuses: ['completed'],
      dateRange: {
        startDate: '2025-04-01',
        endDate: '2025-05-31',
      },
      sortBy: 'amount',
      sortDirection: 'desc',
    })

    expect(result.map((transaction) => transaction.id)).toEqual([
      'txn-1',
      'txn-4',
    ])
  })
})
