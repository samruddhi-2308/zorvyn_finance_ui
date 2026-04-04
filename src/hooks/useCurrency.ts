import { useMemo } from 'react'
import { useUIStore } from '@/store'
import type { CurrencyMode } from '@/types'
import { formatCompactCurrency, formatCurrency } from '@/utils'

interface UseCurrencyResult {
  readonly currency: CurrencyMode
  formatAmount: (value: number) => string
  formatCompactAmount: (value: number) => string
}

/**
 * Provides currency mode and memoized format helpers.
 */
export function useCurrency(): UseCurrencyResult {
  const currency = useUIStore((state) => state.currency)

  const formatAmount = useMemo(
    () => (value: number): string => formatCurrency(value, currency),
    [currency],
  )

  const formatCompactAmount = useMemo(
    () => (value: number): string => formatCompactCurrency(value, currency),
    [currency],
  )

  return {
    currency,
    formatAmount,
    formatCompactAmount,
  }
}
