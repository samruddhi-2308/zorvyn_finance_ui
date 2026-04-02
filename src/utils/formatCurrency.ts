const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats a numeric amount into Indian Rupee currency notation.
 * @param amount - Monetary value to format.
 * @returns Currency string, for example `₹1,42,650.00`.
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    return inrFormatter.format(0)
  }

  return inrFormatter.format(amount)
}
