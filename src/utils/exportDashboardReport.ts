import type {
  CurrencyMode,
  DateRangeFilter,
  SummaryMetrics,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '@/types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { formatCurrency } from './formatCurrency'
import { formatDate } from './formatDate'

export type ReportFormat = 'csv' | 'pdf'

export interface DashboardReportFilters {
  readonly searchQuery: string
  readonly activeTypes: readonly TransactionType[]
  readonly activeCategories: readonly TransactionCategory[]
  readonly dateRange: DateRangeFilter
}

export interface DashboardReportPayload {
  readonly transactions: readonly Transaction[]
  readonly summary: SummaryMetrics
  readonly filters: DashboardReportFilters
  readonly currency: CurrencyMode
  readonly generatedAt?: Date
  readonly dashboardSectionElement?: HTMLElement | null
}

const DASHBOARD_OVERVIEW_SECTION_ID = 'dashboard-overview'

function waitForBackgroundSlice(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0)
  })
}

function toFileDateToken(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toFriendlyDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function escapeCsvValue(value: string): string {
  const startsWithFormulaToken = /^[=+\-@]/.test(value)
  const normalizedValue = startsWithFormulaToken ? `'${value}` : value

  if (
    normalizedValue.includes('"') ||
    normalizedValue.includes(',') ||
    normalizedValue.includes('\n')
  ) {
    return `"${normalizedValue.replaceAll('"', '""')}"`
  }

  return normalizedValue
}

function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')

  downloadLink.href = url
  downloadLink.download = filename
  downloadLink.click()

  window.URL.revokeObjectURL(url)
}

function formatDateRange(dateRange: DateRangeFilter): string {
  if (dateRange.startDate === undefined && dateRange.endDate === undefined) {
    return 'All Time'
  }

  if (dateRange.startDate !== undefined && dateRange.endDate !== undefined) {
    return `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
  }

  if (dateRange.startDate !== undefined) {
    return `From ${formatDate(dateRange.startDate)}`
  }

  return `Until ${formatDate(dateRange.endDate ?? '')}`
}

function getFilterRows(filters: DashboardReportFilters): readonly [string, string][] {
  return [
    ['Search Query', filters.searchQuery.trim().length > 0 ? filters.searchQuery : 'All'],
    ['Types', filters.activeTypes.length > 0 ? filters.activeTypes.join(', ') : 'All'],
    [
      'Categories',
      filters.activeCategories.length > 0
        ? filters.activeCategories.join(', ')
        : 'All',
    ],
    ['Date Window', formatDateRange(filters.dateRange)],
  ]
}

function resolveDashboardOverviewSection(
  payload: DashboardReportPayload,
): HTMLElement | null {
  if (payload.dashboardSectionElement instanceof HTMLElement) {
    return payload.dashboardSectionElement
  }

  if (typeof document === 'undefined') {
    return null
  }

  const section = document.getElementById(DASHBOARD_OVERVIEW_SECTION_ID)

  return section instanceof HTMLElement ? section : null
}

async function captureDashboardOverviewSnapshot(
  payload: DashboardReportPayload,
): Promise<
  | {
      imageData: string
      width: number
      height: number
    }
  | null
> {
  const section = resolveDashboardOverviewSection(payload)

  if (section === null) {
    return null
  }

  const canvas = await html2canvas(section, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: document.documentElement.scrollWidth,
  })

  return {
    imageData: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  }
}

async function exportCsvReport(
  payload: DashboardReportPayload,
  generatedAt: Date,
  filenamePrefix: string,
): Promise<void> {
  const summaryRows: readonly [string, string][] = [
    ['Total Balance', formatCurrency(payload.summary.totalBalance, payload.currency)],
    ['Total Income', formatCurrency(payload.summary.totalIncome, payload.currency)],
    ['Total Expenses', formatCurrency(payload.summary.totalExpenses, payload.currency)],
    ['Savings Rate', `${(payload.summary.savingsRate * 100).toFixed(2)}%`],
  ]

  const transactionHeader = [
    'Date',
    'Description',
    'Type',
    'Category',
    'Amount',
    'Payment Method',
    'Status',
  ]

  const rows: string[] = [
    ['Report Name', 'FinDash Dashboard Report']
      .map((value) => escapeCsvValue(value))
      .join(','),
    ['Generated At', toFriendlyDateTime(generatedAt)]
      .map((value) => escapeCsvValue(value))
      .join(','),
    '',
    'Summary,Value',
    ...summaryRows.map(([key, value]) =>
      [key, value].map((item) => escapeCsvValue(item)).join(','),
    ),
    '',
    'Applied Filter,Value',
    ...getFilterRows(payload.filters).map(([key, value]) =>
      [key, value].map((item) => escapeCsvValue(item)).join(','),
    ),
    '',
    transactionHeader.map((value) => escapeCsvValue(value)).join(','),
  ]

  for (const [index, transaction] of payload.transactions.entries()) {
    rows.push(
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

    if (index % 100 === 0) {
      await waitForBackgroundSlice()
    }
  }

  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  downloadFile(blob, `${filenamePrefix}-${toFileDateToken(generatedAt)}.csv`)
}

async function exportPdfReport(
  payload: DashboardReportPayload,
  generatedAt: Date,
  filenamePrefix: string,
): Promise<void> {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 40
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - marginX * 2
  const contentHeight = pageHeight - marginX * 2
  const headerY = 48

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(13)
  pdf.text('FinDash Dashboard Snapshot', marginX, headerY)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text(`Generated At: ${toFriendlyDateTime(generatedAt)}`, marginX, headerY + 16)

  const snapshot = await captureDashboardOverviewSnapshot(payload)

  if (snapshot !== null) {
    const imageStartY = headerY + 28
    const scaledImageHeight = (snapshot.height * contentWidth) / snapshot.width
    let heightLeft = scaledImageHeight

    pdf.addImage(
      snapshot.imageData,
      'PNG',
      marginX,
      imageStartY,
      contentWidth,
      scaledImageHeight,
    )

    heightLeft -= pageHeight - imageStartY - marginX

    while (heightLeft > 0) {
      await waitForBackgroundSlice()

      pdf.addPage()
      const pageOffsetY = marginX - (scaledImageHeight - heightLeft)
      pdf.addImage(
        snapshot.imageData,
        'PNG',
        marginX,
        pageOffsetY,
        contentWidth,
        scaledImageHeight,
      )
      heightLeft -= contentHeight
    }
  } else {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.text(
      'DashboardOverviewSection was not found in the DOM for snapshot capture.',
      marginX,
      headerY + 42,
      { maxWidth: contentWidth },
    )
  }

  pdf.save(`${filenamePrefix}-${toFileDateToken(generatedAt)}.pdf`)
}

/**
 * Asynchronously exports the current dashboard state to CSV or PDF.
 */
export async function exportDashboardReport(
  payload: DashboardReportPayload,
  format: ReportFormat,
  filenamePrefix = 'findash-dashboard-report',
): Promise<void> {
  const generatedAt = payload.generatedAt ?? new Date()

  await waitForBackgroundSlice()

  if (format === 'csv') {
    await exportCsvReport(payload, generatedAt, filenamePrefix)
    return
  }

  await exportPdfReport(payload, generatedAt, filenamePrefix)
}
