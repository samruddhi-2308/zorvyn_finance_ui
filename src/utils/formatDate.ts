const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
})

function parseISODate(isoDate: string): Date {
  const parsedDate = new Date(`${isoDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid ISO date string: ${isoDate}`)
  }

  return parsedDate
}

/**
 * Formats an ISO date string into `DD Mon YYYY`.
 * @param isoDate - Date in `YYYY-MM-DD` format.
 * @returns Formatted date, for example `14 Jun 2025`.
 */
export function formatDate(isoDate: string): string {
  return shortDateFormatter.format(parseISODate(isoDate))
}

/**
 * Formats an ISO date string into `Mon YYYY`.
 * @param isoDate - Date in `YYYY-MM-DD` format.
 * @returns Formatted month label, for example `Jun 2025`.
 */
export function formatMonthLabel(isoDate: string): string {
  return monthYearFormatter.format(parseISODate(isoDate))
}

/**
 * Converts an ISO date string to a sortable month key (`YYYY-MM`).
 * @param isoDate - Date in `YYYY-MM-DD` format.
 * @returns Month key string.
 */
export function getMonthKey(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Invalid ISO date string: ${isoDate}`)
  }

  return isoDate.slice(0, 7)
}

/**
 * Converts a month key (`YYYY-MM`) into a readable label (`Mon YYYY`).
 * @param monthKey - Key in `YYYY-MM` format.
 * @returns Human-readable month label.
 */
export function formatMonthKey(monthKey: string): string {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    throw new Error(`Invalid month key: ${monthKey}`)
  }

  return monthYearFormatter.format(new Date(`${monthKey}-01T00:00:00`))
}

/**
 * Converts an ISO date string into a numeric timestamp for comparisons.
 * @param isoDate - Date in `YYYY-MM-DD` format.
 * @returns Milliseconds since epoch.
 */
export function toTimestamp(isoDate: string): number {
  return parseISODate(isoDate).getTime()
}
