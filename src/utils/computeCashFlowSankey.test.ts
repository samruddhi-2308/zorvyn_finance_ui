import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { computeCashFlowSankey } from './computeCashFlowSankey'

const TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'income-1',
    date: '2026-02-01',
    description: 'Salary',
    amount: 100000,
    type: 'income',
    category: 'Salary',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
  },
  {
    id: 'expense-1',
    date: '2026-02-03',
    description: 'Electricity Bill',
    amount: 8000,
    type: 'expense',
    category: 'Utilities',
    paymentMethod: 'UPI',
    status: 'completed',
  },
  {
    id: 'expense-2',
    date: '2026-02-04',
    description: 'Weekend Grocery',
    amount: 6000,
    type: 'expense',
    category: 'Food & Groceries',
    paymentMethod: 'Card',
    status: 'completed',
  },
] as const

describe('computeCashFlowSankey', () => {
  it('builds root allocation nodes and links', () => {
    const result = computeCashFlowSankey(TRANSACTIONS)

    const nodeNames = result.nodes.map((node) => node.name)

    expect(nodeNames).toContain('Total Income')
    expect(nodeNames).toContain('Savings')
    expect(nodeNames).toContain('Fixed Expenses')
    expect(nodeNames).toContain('Variable Expenses')

    expect(result.links.length).toBeGreaterThan(0)
  })

  it('creates only category-level branches and limits total node count', () => {
    const result = computeCashFlowSankey(TRANSACTIONS)

    const utilitiesNode = result.nodes.find((node) => node.name === 'Utilities')
    const groceriesNode = result.nodes.find(
      (node) => node.name === 'Food & Groceries',
    )
    const transactionLikeNode = result.nodes.find(
      (node) => node.kind === 'transaction',
    )

    expect(utilitiesNode?.kind).toBe('category')
    expect(groceriesNode?.kind).toBe('category')
    expect(transactionLikeNode).toBeUndefined()
    expect(result.nodes.length).toBeLessThanOrEqual(20)
  })

  it('returns index links that reference valid nodes and remain acyclic', () => {
    const result = computeCashFlowSankey(TRANSACTIONS)

    for (const link of result.links) {
      expect(link.source).toBeGreaterThanOrEqual(0)
      expect(link.target).toBeGreaterThanOrEqual(0)
      expect(link.source).toBeLessThan(result.nodes.length)
      expect(link.target).toBeLessThan(result.nodes.length)
      expect(link.source).not.toBe(link.target)
    }

    const adjacency = new Map<number, number[]>()

    for (let index = 0; index < result.nodes.length; index += 1) {
      adjacency.set(index, [])
    }

    for (const link of result.links) {
      const neighbors = adjacency.get(link.source)
      if (neighbors) {
        neighbors.push(link.target)
      }
    }

    const state = new Map<number, 0 | 1 | 2>()
    for (let index = 0; index < result.nodes.length; index += 1) {
      state.set(index, 0)
    }

    const hasCycleFrom = (index: number): boolean => {
      const visitState = state.get(index)

      if (visitState === 1) {
        return true
      }

      if (visitState === 2) {
        return false
      }

      state.set(index, 1)

      const neighbors = adjacency.get(index) ?? []
      for (const neighbor of neighbors) {
        if (hasCycleFrom(neighbor)) {
          return true
        }
      }

      state.set(index, 2)
      return false
    }

    const hasAnyCycle = result.nodes.some((_, index) => hasCycleFrom(index))

    expect(hasAnyCycle).toBe(false)
  })

  it('filters out categories smaller than one percent of total expenses', () => {
    const result = computeCashFlowSankey([
      {
        id: 'income-2',
        date: '2026-02-01',
        description: 'Primary Salary',
        amount: 120000,
        type: 'income',
        category: 'Salary',
        paymentMethod: 'Bank Transfer',
        status: 'completed',
      },
      {
        id: 'expense-major',
        date: '2026-02-02',
        description: 'Apartment Utilities',
        amount: 9950,
        type: 'expense',
        category: 'Utilities',
        paymentMethod: 'UPI',
        status: 'completed',
      },
      {
        id: 'expense-micro',
        date: '2026-02-03',
        description: 'One-time Streaming Add-on',
        amount: 50,
        type: 'expense',
        category: 'Entertainment',
        paymentMethod: 'Card',
        status: 'completed',
      },
    ])

    const entertainmentNode = result.nodes.find(
      (node) => node.name === 'Entertainment',
    )
    const otherNode = result.nodes.find(
      (node) => node.name === 'Other Variable Expenses',
    )

    expect(entertainmentNode).toBeUndefined()
    expect(otherNode?.kind).toBe('aggregate')
  })
})
