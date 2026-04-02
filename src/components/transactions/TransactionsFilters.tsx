import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_CATEGORIES,
} from '@/constants'
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

  const categorySummary = useMemo<string>(
    () => buildCategorySummary(activeCategories),
    [activeCategories],
  )

  const visibleCategories = useMemo<readonly TransactionCategory[]>(() => {
    if (activeTypes.length !== 1) {
      return TRANSACTION_CATEGORIES
    }

    return activeTypes[0] === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  }, [activeTypes])

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

  const onStartDateChange = (value: string): void => {
    onDateRangeChange({
      ...(value.length > 0 ? { startDate: value } : {}),
      ...(dateRange.endDate !== undefined
        ? { endDate: dateRange.endDate }
        : {}),
    })
  }

  const onEndDateChange = (value: string): void => {
    onDateRangeChange({
      ...(dateRange.startDate !== undefined
        ? { startDate: dateRange.startDate }
        : {}),
      ...(value.length > 0 ? { endDate: value } : {}),
    })
  }

  return (
    <section
      className="surface-card p-4"
      aria-label="Transactions filters and search"
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Search
          </span>
          <input
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
          <div className="mt-1 inline-flex rounded-lg border border-[var(--color-border)] p-1">
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
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
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
            type="button"
            onClick={() => setIsCategoryPickerOpen((value) => !value)}
            className="mt-1 flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm text-[var(--color-text-primary)]"
            aria-expanded={isCategoryPickerOpen}
            aria-haspopup="listbox"
          >
            <span>{categorySummary}</span>
            <span aria-hidden="true">v</span>
          </button>

          {isCategoryPickerOpen ? (
            <div
              className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-card"
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
          className="h-fit self-end rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Start Date
          </span>
          <input
            type="date"
            value={dateRange.startDate ?? ''}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-300"
            aria-label="Filter start date"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            End Date
          </span>
          <input
            type="date"
            value={dateRange.endDate ?? ''}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-300"
            aria-label="Filter end date"
          />
        </label>
      </div>
    </section>
  )
}
