import type { Transaction } from '@/types'

function escapeCsvValue(value: string): string {
  if (!value.includes('"') && !value.includes(',') && !value.includes('\n')) {
    return value
  }

  return `"${value.replaceAll('"', '""')}"`
}

/**
 * Exports transactions to a CSV file in the browser.
 */
export function exportTransactionsToCsv(
  transactions: readonly Transaction[],
  filenamePrefix = 'transactions',
): void {
  if (transactions.length === 0) {
    return
  }

  const header = [
    'Date',
    'Description',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Status',
  ]

  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.description,
      transaction.type,
      transaction.category,
      transaction.amount.toFixed(2),
      transaction.paymentMethod,
      transaction.status,
    ]
      .map((value) => escapeCsvValue(String(value)))
      .join(','),
  )

  const csvContent = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')

  downloadLink.href = url
  downloadLink.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`
  downloadLink.click()

  window.URL.revokeObjectURL(url)
}
