import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  DateRangeFilter,
  SortDirection,
  TransactionCategory,
  TransactionSortKey,
  TransactionStatus,
  TransactionType,
} from '@/types'

interface FilterStoreState {
  readonly searchQuery: string
  readonly activeTypes: TransactionType[]
  readonly activeCategories: TransactionCategory[]
  readonly activeStatuses: TransactionStatus[]
  readonly dateRange: DateRangeFilter
  readonly sortBy: TransactionSortKey
  readonly sortDirection: SortDirection
  readonly currentPage: number
  readonly pageSize: number
  setSearchQuery: (query: string) => void
  setTypeFilter: (types: readonly TransactionType[]) => void
  setCategoryFilter: (categories: readonly TransactionCategory[]) => void
  setStatusFilter: (statuses: readonly TransactionStatus[]) => void
  setDateRange: (dateRange: DateRangeFilter) => void
  setSort: (sortBy: TransactionSortKey, sortDirection: SortDirection) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetFilters: () => void
}

const defaultFilterState = {
  searchQuery: '',
  activeTypes: [] as TransactionType[],
  activeCategories: [] as TransactionCategory[],
  activeStatuses: [] as TransactionStatus[],
  dateRange: {} as DateRangeFilter,
  sortBy: 'date' as TransactionSortKey,
  sortDirection: 'desc' as SortDirection,
  currentPage: 1,
  pageSize: 10,
}

function normalizeDateRange(dateRange: DateRangeFilter): DateRangeFilter {
  return {
    ...(dateRange.startDate !== undefined && dateRange.startDate !== ''
      ? { startDate: dateRange.startDate }
      : {}),
    ...(dateRange.endDate !== undefined && dateRange.endDate !== ''
      ? { endDate: dateRange.endDate }
      : {}),
  }
}

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set) => ({
      ...defaultFilterState,

      setSearchQuery(query: string): void {
        set({ searchQuery: query, currentPage: 1 })
      },

      setTypeFilter(types: readonly TransactionType[]): void {
        set({ activeTypes: [...types], currentPage: 1 })
      },

      setCategoryFilter(categories: readonly TransactionCategory[]): void {
        set({ activeCategories: [...categories], currentPage: 1 })
      },

      setStatusFilter(statuses: readonly TransactionStatus[]): void {
        set({ activeStatuses: [...statuses], currentPage: 1 })
      },

      setDateRange(dateRange: DateRangeFilter): void {
        set({
          dateRange: normalizeDateRange(dateRange),
          currentPage: 1,
        })
      },

      setSort(sortBy: TransactionSortKey, sortDirection: SortDirection): void {
        set({ sortBy, sortDirection, currentPage: 1 })
      },

      setPage(page: number): void {
        set({ currentPage: Math.max(1, Math.trunc(page)) })
      },

      setPageSize(pageSize: number): void {
        const normalizedPageSize = Math.max(1, Math.trunc(pageSize))

        set({
          pageSize: normalizedPageSize,
          currentPage: 1,
        })
      },

      resetFilters(): void {
        set({ ...defaultFilterState })
      },
    }),
    {
      name: 'zorvyn-filters',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        activeTypes: state.activeTypes,
        activeCategories: state.activeCategories,
        activeStatuses: state.activeStatuses,
        dateRange: state.dateRange,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
        pageSize: state.pageSize,
        currentPage: state.currentPage,
      }),
    },
  ),
)
