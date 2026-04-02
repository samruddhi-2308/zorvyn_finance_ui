import type { SortDirection, Transaction, TransactionSortKey } from '@/types'

export type TransactionRowAction = 'toggle-menu' | 'edit' | 'delete'

export interface TransactionSortState {
  readonly sortBy: TransactionSortKey
  readonly sortDirection: SortDirection
}

export interface TransactionModalState {
  readonly isOpen: boolean
  readonly mode: 'create' | 'edit'
  readonly transaction: Transaction | null
}
