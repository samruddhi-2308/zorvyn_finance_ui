import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore } from '@/store'
import type {
  DateRangeFilter,
  SortDirection,
  TransactionCategory,
  TransactionFilterOptions,
  TransactionSortKey,
  TransactionStatus,
  TransactionType,
} from '@/types'
import { useDebounce } from './useDebounce'

interface UseFiltersResult {
  readonly searchQuery: string
  readonly debouncedSearchQuery: string
  readonly activeTypes: readonly TransactionType[]
  readonly activeCategories: readonly TransactionCategory[]
  readonly activeStatuses: readonly TransactionStatus[]
  readonly dateRange: DateRangeFilter
  readonly sortBy: TransactionSortKey
  readonly sortDirection: SortDirection
  readonly currentPage: number
  readonly pageSize: number
  readonly filterOptions: TransactionFilterOptions
  readonly setSearchQuery: (query: string) => void
  readonly setTypeFilter: (types: readonly TransactionType[]) => void
  readonly setCategoryFilter: (
    categories: readonly TransactionCategory[],
  ) => void
  readonly setStatusFilter: (statuses: readonly TransactionStatus[]) => void
  readonly setDateRange: (dateRange: DateRangeFilter) => void
  readonly setSort: (
    sortBy: TransactionSortKey,
    sortDirection: SortDirection,
  ) => void
  readonly setPage: (page: number) => void
  readonly setPageSize: (pageSize: number) => void
  readonly resetFilters: () => void
}

/**
 * Provides filter state with debounced search and normalized filter options.
 */
export function useFilters(): UseFiltersResult {
  const {
    searchQuery,
    activeTypes,
    activeCategories,
    activeStatuses,
    dateRange,
    sortBy,
    sortDirection,
    currentPage,
    pageSize,
    setSearchQuery,
    setTypeFilter,
    setCategoryFilter,
    setStatusFilter,
    setDateRange,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
  } = useFilterStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      activeTypes: state.activeTypes,
      activeCategories: state.activeCategories,
      activeStatuses: state.activeStatuses,
      dateRange: state.dateRange,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      setSearchQuery: state.setSearchQuery,
      setTypeFilter: state.setTypeFilter,
      setCategoryFilter: state.setCategoryFilter,
      setStatusFilter: state.setStatusFilter,
      setDateRange: state.setDateRange,
      setSort: state.setSort,
      setPage: state.setPage,
      setPageSize: state.setPageSize,
      resetFilters: state.resetFilters,
    })),
  )

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filterOptions = useMemo<TransactionFilterOptions>(
    () => ({
      ...(debouncedSearchQuery.length > 0
        ? { searchQuery: debouncedSearchQuery }
        : {}),
      ...(activeTypes.length > 0 ? { types: activeTypes } : {}),
      ...(activeCategories.length > 0 ? { categories: activeCategories } : {}),
      ...(activeStatuses.length > 0 ? { statuses: activeStatuses } : {}),
      ...(dateRange.startDate !== undefined || dateRange.endDate !== undefined
        ? { dateRange }
        : {}),
      sortBy,
      sortDirection,
    }),
    [
      activeCategories,
      activeStatuses,
      activeTypes,
      dateRange,
      debouncedSearchQuery,
      sortBy,
      sortDirection,
    ],
  )

  return {
    searchQuery,
    debouncedSearchQuery,
    activeTypes,
    activeCategories,
    activeStatuses,
    dateRange,
    sortBy,
    sortDirection,
    currentPage,
    pageSize,
    filterOptions,
    setSearchQuery,
    setTypeFilter,
    setCategoryFilter,
    setStatusFilter,
    setDateRange,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
  }
}
