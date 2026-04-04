import { describe, expect, it } from 'vitest'
import type { DateRangeFilter } from '@/types'
import {
  getDateRangeForPreset,
  resolveTemporalPreset,
  type TemporalPreset,
} from './temporalFilters'

function getRangeFor(
  preset: TemporalPreset,
  referenceDate: string,
): DateRangeFilter {
  return getDateRangeForPreset(preset, new Date(`${referenceDate}T00:00:00`))
}

describe('temporalFilters', () => {
  it('builds month-to-date and year-to-date ranges', () => {
    expect(getRangeFor('month-to-date', '2026-04-04')).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-04',
    })

    expect(getRangeFor('year-to-date', '2026-04-04')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-04-04',
    })
  })

  it('builds rolling and quarter-based ranges', () => {
    expect(getRangeFor('last-30-days', '2026-04-04')).toEqual({
      startDate: '2026-03-06',
      endDate: '2026-04-04',
    })

    expect(getRangeFor('previous-quarter', '2026-04-04')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    })

    expect(getRangeFor('previous-quarter', '2026-01-10')).toEqual({
      startDate: '2025-10-01',
      endDate: '2025-12-31',
    })
  })

  it('resolves preset ids from a date range', () => {
    const referenceDate = new Date('2026-04-04T00:00:00')

    expect(resolveTemporalPreset({}, referenceDate)).toBe('all-time')
    expect(
      resolveTemporalPreset(
        {
          startDate: '2026-03-06',
          endDate: '2026-04-04',
        },
        referenceDate,
      ),
    ).toBe('last-30-days')
    expect(
      resolveTemporalPreset(
        {
          startDate: '2026-03-01',
          endDate: '2026-03-28',
        },
        referenceDate,
      ),
    ).toBeNull()
  })
})
