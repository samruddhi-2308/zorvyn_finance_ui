import type { DateRangeFilter } from '@/types'

export type TemporalPreset =
  | 'all-time'
  | 'month-to-date'
  | 'year-to-date'
  | 'last-30-days'
  | 'previous-quarter'

export interface TemporalPresetOption {
  readonly id: TemporalPreset
  readonly label: string
  readonly description: string
}

export const TEMPORAL_PRESET_OPTIONS: readonly TemporalPresetOption[] = [
  {
    id: 'all-time',
    label: 'All Time',
    description: 'Include all available transactions',
  },
  {
    id: 'month-to-date',
    label: 'Month-to-Date',
    description: 'From the first day of this month until today',
  },
  {
    id: 'year-to-date',
    label: 'Year-to-Date',
    description: 'From 1 Jan this year until today',
  },
  {
    id: 'last-30-days',
    label: 'Last 30 Days',
    description: 'Rolling 30-day window ending today',
  },
  {
    id: 'previous-quarter',
    label: 'Previous Quarter',
    description: 'The full quarter immediately before the current quarter',
  },
] as const

function padTwo(value: number): string {
  return String(value).padStart(2, '0')
}

function toIsoDateString(date: Date): string {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function buildDateRange(startDate: Date, endDate: Date): DateRangeFilter {
  return {
    startDate: toIsoDateString(startDate),
    endDate: toIsoDateString(endDate),
  }
}

function getDateRangeKey(dateRange: DateRangeFilter): string {
  return `${dateRange.startDate ?? ''}|${dateRange.endDate ?? ''}`
}

/**
 * Converts a temporal preset into an explicit date range.
 */
export function getDateRangeForPreset(
  preset: TemporalPreset,
  referenceDate = new Date(),
): DateRangeFilter {
  const today = startOfLocalDay(referenceDate)

  switch (preset) {
    case 'all-time':
      return {}

    case 'month-to-date': {
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      return buildDateRange(startDate, today)
    }

    case 'year-to-date': {
      const startDate = new Date(today.getFullYear(), 0, 1)
      return buildDateRange(startDate, today)
    }

    case 'last-30-days': {
      const startDate = addDays(today, -29)
      return buildDateRange(startDate, today)
    }

    case 'previous-quarter': {
      const currentQuarterStartMonth = Math.floor(today.getMonth() / 3) * 3
      let previousQuarterEndMonth = currentQuarterStartMonth - 1
      let year = today.getFullYear()

      if (previousQuarterEndMonth < 0) {
        previousQuarterEndMonth = 11
        year -= 1
      }

      const previousQuarterStartMonth = previousQuarterEndMonth - 2
      const startDate = new Date(year, previousQuarterStartMonth, 1)
      const endDate = new Date(year, previousQuarterEndMonth + 1, 0)

      return buildDateRange(startDate, endDate)
    }
  }
}

/**
 * Resolves the matching temporal preset from an explicit date range.
 */
export function resolveTemporalPreset(
  dateRange: DateRangeFilter,
  referenceDate = new Date(),
): TemporalPreset | null {
  if (dateRange.startDate === undefined && dateRange.endDate === undefined) {
    return 'all-time'
  }

  const targetKey = getDateRangeKey(dateRange)

  for (const preset of TEMPORAL_PRESET_OPTIONS) {
    if (preset.id === 'all-time') {
      continue
    }

    const presetKey = getDateRangeKey(
      getDateRangeForPreset(preset.id, referenceDate),
    )

    if (presetKey === targetKey) {
      return preset.id
    }
  }

  return null
}
