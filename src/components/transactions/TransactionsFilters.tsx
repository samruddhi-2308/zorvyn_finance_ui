import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_CATEGORIES,
} from '@/constants'
import {
  formatDate,
  getDateRangeForPreset,
  resolveTemporalPreset,
  TEMPORAL_PRESET_OPTIONS,
  type TemporalPreset,
} from '@/utils'
import type {
  DateRangeFilter,
  TransactionCategory,
  TransactionType,
} from '@/types'

interface TransactionsFiltersProps {
  readonly searchQuery: string
  readonly activeTypes: readonly TransactionType[]
  readonly activeCategories: readonly TransactionCategory[]
  readonly dateRange: DateRangeFilter
  readonly onSearchChange: (query: string) => void
  readonly onTypeFilterChange: (types: readonly TransactionType[]) => void
  readonly onCategoryFilterChange: (
    categories: readonly TransactionCategory[],
  ) => void
  readonly onDateRangeChange: (dateRange: DateRangeFilter) => void
  readonly onResetFilters: () => void
}

function isTypeSelected(
  activeTypes: readonly TransactionType[],
  type: TransactionType | 'all',
): boolean {
  if (type === 'all') {
    return activeTypes.length === 0
  }

  return activeTypes.length === 1 && activeTypes[0] === type
}

function buildCategorySummary(
  categories: readonly TransactionCategory[],
): string {
  if (categories.length === 0) {
    return 'All Categories'
  }

  if (categories.length === 1) {
    return categories[0] ?? 'All Categories'
  }

  return `${categories.length} categories selected`
}

function describeActiveDateRange(dateRange: DateRangeFilter): string {
  if (dateRange.startDate === undefined && dateRange.endDate === undefined) {
    return 'All dates included'
  }

  try {
    if (dateRange.startDate !== undefined && dateRange.endDate !== undefined) {
      return `${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`
    }

    if (dateRange.startDate !== undefined) {
      return `From ${formatDate(dateRange.startDate)}`
    }

    if (dateRange.endDate !== undefined) {
      return `Until ${formatDate(dateRange.endDate)}`
    }
  } catch {
    if (dateRange.startDate !== undefined && dateRange.endDate !== undefined) {
      return `${dateRange.startDate} to ${dateRange.endDate}`
    }

    if (dateRange.startDate !== undefined) {
      return `From ${dateRange.startDate}`
    }

    if (dateRange.endDate !== undefined) {
      return `Until ${dateRange.endDate}`
    }
  }

  return 'All dates included'
}

/**
 * Search, type, category, and date filters for the transactions list.
 */
export function TransactionsFilters({
  searchQuery,
  activeTypes,
  activeCategories,
  dateRange,
  onSearchChange,
  onTypeFilterChange,
  onCategoryFilterChange,
  onDateRangeChange,
  onResetFilters,
}: TransactionsFiltersProps): ReactElement {
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false)
  const categoryPickerRef = useRef<HTMLDivElement | null>(null)
  const categoryToggleRef = useRef<HTMLButtonElement | null>(null)
  const categoryListboxId = useId()

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      if (!categoryPickerRef.current) {
        return
      }

      const target = event.target as Node

      if (!categoryPickerRef.current.contains(target)) {
        setIsCategoryPickerOpen(false)
      }
    }

    window.addEventListener('click', handleDocumentClick)
    return () => {
      window.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  useEffect(() => {
    if (!isCategoryPickerOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return
      }

      setIsCategoryPickerOpen(false)
      categoryToggleRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isCategoryPickerOpen])

  useEffect(() => {
    if (!isCategoryPickerOpen || !categoryPickerRef.current) {
      return
    }

    const firstOption =
      categoryPickerRef.current.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )

    firstOption?.focus()
  }, [isCategoryPickerOpen])

  const categorySummary = useMemo<string>(
    () => buildCategorySummary(activeCategories),
    [activeCategories],
  )

  const selectedTemporalPreset = useMemo(
    () => resolveTemporalPreset(dateRange),
    [dateRange],
  )

  const activeDateRangeLabel = useMemo(
    () => describeActiveDateRange(dateRange),
    [dateRange],
  )

  const visibleCategories = useMemo<readonly TransactionCategory[]>(() => {
    if (activeTypes.length !== 1) {
      return TRANSACTION_CATEGORIES
    }

    return activeTypes[0] === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  }, [activeTypes])

  useEffect(() => {
    const visibleCategorySet = new Set(visibleCategories)
    const normalizedCategories = activeCategories.filter((category) =>
      visibleCategorySet.has(category),
    )

    if (normalizedCategories.length !== activeCategories.length) {
      onCategoryFilterChange(normalizedCategories)
    }
  }, [activeCategories, onCategoryFilterChange, visibleCategories])

  const toggleCategory = (category: TransactionCategory): void => {
    const isSelected = activeCategories.includes(category)

    if (isSelected) {
      onCategoryFilterChange(
        activeCategories.filter((item) => item !== category),
      )
      return
    }

    onCategoryFilterChange([...activeCategories, category])
  }

  const onTemporalPresetChange = (preset: TemporalPreset): void => {
    onDateRangeChange(getDateRangeForPreset(preset))
  }

  return (
    <section
      className="surface-card p-6"
      aria-label="Transactions filters and search"
    >
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="block lg:min-w-0">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Search
          </span>
          <input
            id="transactions-search-input"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search description or category..."
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-300"
            aria-label="Search transactions"
          />
        </label>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Type
          </legend>
          <div className="mt-1 inline-flex w-full rounded-lg border border-[var(--color-border)] p-1 sm:w-auto">
            {(['all', 'income', 'expense'] as const).map((type) => {
              const isSelected = isTypeSelected(activeTypes, type)
              const label =
                type === 'all'
                  ? 'All'
                  : type === 'income'
                    ? 'Income'
                    : 'Expense'

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    onTypeFilterChange(type === 'all' ? [] : [type])
                  }
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)]'
                  }`}
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="relative" ref={categoryPickerRef}>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Category
          </span>
          <button
            ref={categoryToggleRef}
            type="button"
            onClick={() => setIsCategoryPickerOpen((value) => !value)}
            className="mt-1 flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm text-[var(--color-text-primary)]"
            aria-expanded={isCategoryPickerOpen}
            aria-haspopup="listbox"
            aria-controls={categoryListboxId}
          >
            <span className="truncate">{categorySummary}</span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className={`h-4 w-4 shrink-0 transition-transform ${
                isCategoryPickerOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <path
                d="M5 8L10 13L15 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isCategoryPickerOpen ? (
            <div
              id={categoryListboxId}
              className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/92 p-2 shadow-card backdrop-blur-xl"
              role="listbox"
              aria-label="Category multi-select options"
            >
              {visibleCategories.map((category) => {
                const isSelected = activeCategories.includes(category)

                return (
                  <label
                    key={category}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[var(--color-primary-soft)]"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded border-[var(--color-border)]"
                    />
                    <span>{category}</span>
                  </label>
                )
              })}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="h-fit rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)] lg:self-end"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Time Window
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">{activeDateRangeLabel}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPORAL_PRESET_OPTIONS.map((presetOption) => {
            const isSelected = selectedTemporalPreset === presetOption.id

            return (
              <button
                key={presetOption.id}
                type="button"
                onClick={() => onTemporalPresetChange(presetOption.id)}
                title={presetOption.description}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.04em] transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)]'
                }`}
                aria-pressed={isSelected}
              >
                {presetOption.label}
              </button>
            )
          })}
        </div>

        {selectedTemporalPreset === null ? (
          <p className="mt-3 text-xs text-amber-700">
            A custom date range from an earlier session is active. Select a
            quick filter or use Reset.
          </p>
        ) : null}
      </div>
    </section>
  )
}
