import { useMemo } from 'react'
import { useTransactionStore } from '@/store'
import type { InsightsSnapshot } from '@/types'
import { computeInsights } from '@/utils'

/**
 * Computes memoized insight snapshots from transaction store data.
 */
export function useInsights(): InsightsSnapshot {
  const transactions = useTransactionStore((state) => state.transactions)

  return useMemo<InsightsSnapshot>(
    () => computeInsights(transactions),
    [transactions],
  )
}
