import type { BalanceTrendPoint, Transaction } from '@/types'

interface DayTotals {
  income: number
  expenses: number
  incomeTransactionCount: number
  expenseTransactionCount: number
  transactions: {
    id: string
    description: string
    type: 'income' | 'expense'
    amount: number
  }[]
}

const axisDayFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
})

const tooltipDayFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function padTwo(value: number): string {
  return String(value).padStart(2, '0')
}

function toIsoDateString(date: Date): string {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function parseIsoDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`)
}

/**
 * Builds a dense daily timeline for the last N days with a running total balance.
 */
export function computeDailyBalanceTrend(
  transactions: readonly Transaction[],
  dayCount = 730,
): BalanceTrendPoint[] {
  const normalizedDayCount = Math.max(1, Math.trunc(dayCount))
  const today = startOfDay(new Date())

  const latestTransactionDate = transactions.reduce<Date | null>(
    (latestDate, transaction) => {
      const parsedDate = parseIsoDate(transaction.date)

      if (Number.isNaN(parsedDate.getTime())) {
        return latestDate
      }

      if (latestDate === null || parsedDate > latestDate) {
        return parsedDate
      }

      return latestDate
    },
    null,
  )

  const rangeEndDate =
    latestTransactionDate !== null && latestTransactionDate > today
      ? startOfDay(latestTransactionDate)
      : today
  const rangeStartDate = addDays(rangeEndDate, -(normalizedDayCount - 1))

  const dayTotals = new Map<string, DayTotals>()
  let openingBalance = 0

  for (const transaction of transactions) {
    const parsedDate = parseIsoDate(transaction.date)

    if (Number.isNaN(parsedDate.getTime())) {
      continue
    }

    const signedAmount =
      transaction.type === 'income' ? transaction.amount : -transaction.amount

    if (parsedDate < rangeStartDate) {
      openingBalance += signedAmount
      continue
    }

    if (parsedDate > rangeEndDate) {
      continue
    }

    const dateKey = toIsoDateString(parsedDate)
    const totals = dayTotals.get(dateKey) ?? {
      income: 0,
      expenses: 0,
      incomeTransactionCount: 0,
      expenseTransactionCount: 0,
      transactions: [],
    }

    if (transaction.type === 'income') {
      totals.income += transaction.amount
      totals.incomeTransactionCount += 1
    } else {
      totals.expenses += transaction.amount
      totals.expenseTransactionCount += 1
    }

    totals.transactions.push({
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount,
    })

    dayTotals.set(dateKey, totals)
  }

  const points: BalanceTrendPoint[] = []
  let runningBalance = openingBalance

  for (let dayOffset = 0; dayOffset < normalizedDayCount; dayOffset += 1) {
    const date = addDays(rangeStartDate, dayOffset)
    const dateKey = toIsoDateString(date)
    const totals = dayTotals.get(dateKey) ?? {
      income: 0,
      expenses: 0,
      incomeTransactionCount: 0,
      expenseTransactionCount: 0,
      transactions: [],
    }
    const netAmount = totals.income - totals.expenses
    const transactionCount =
      totals.incomeTransactionCount + totals.expenseTransactionCount
    const sampleTransactions = [...totals.transactions]
      .sort((left, right) => Math.abs(right.amount) - Math.abs(left.amount))
      .slice(0, 3)

    runningBalance += netAmount

    points.push({
      monthKey: dateKey,
      monthLabel: axisDayFormatter.format(date),
      fullLabel: tooltipDayFormatter.format(date),
      income: totals.income,
      expenses: totals.expenses,
      net: netAmount,
      cumulativeBalance: runningBalance,
      transactionCount,
      incomeTransactionCount: totals.incomeTransactionCount,
      expenseTransactionCount: totals.expenseTransactionCount,
      sampleTransactions,
    })
  }

  return points
}
