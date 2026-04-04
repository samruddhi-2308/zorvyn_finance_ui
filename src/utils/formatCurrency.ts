import type { CurrencyMode } from '@/types'

const currencyLocaleMap: Record<CurrencyMode, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(
  currency: CurrencyMode,
  mode: 'standard' | 'compact',
): Intl.NumberFormat {
  const cacheKey = `${currency}-${mode}`
  const cachedFormatter = formatterCache.get(cacheKey)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.NumberFormat(currencyLocaleMap[currency], {
    style: 'currency',
    currency,
    notation: mode === 'compact' ? 'compact' : 'standard',
    minimumFractionDigits: mode === 'compact' ? 0 : 2,
    maximumFractionDigits: mode === 'compact' ? 1 : 2,
  })

  formatterCache.set(cacheKey, formatter)
  return formatter
}

/**
 * Formats a numeric amount in the active currency mode.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyMode = 'INR',
): string {
  const formatter = getFormatter(currency, 'standard')

  if (!Number.isFinite(amount)) {
    return formatter.format(0)
  }

  return formatter.format(amount)
}

/**
 * Formats a numeric amount in compact currency notation.
 */
export function formatCompactCurrency(
  amount: number,
  currency: CurrencyMode = 'INR',
): string {
  const formatter = getFormatter(currency, 'compact')

  if (!Number.isFinite(amount)) {
    return formatter.format(0)
  }

  return formatter.format(amount)
}

/**
 * Backward-compatible alias for INR formatting.
 */
export function formatINR(amount: number): string {
  return formatCurrency(amount, 'INR')
}
