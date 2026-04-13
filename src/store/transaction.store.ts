import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { TRANSACTIONS } from '@/data'
import type { Transaction, TransactionDraft, TransactionUpdate } from '@/types'
import { logger } from '@/utils'

interface TransactionStoreState {
  readonly transactions: Transaction[]
  setTransactions: (transactions: readonly Transaction[]) => void
  addTransaction: (draft: TransactionDraft) => Transaction | null
  updateTransaction: (id: string, updates: TransactionUpdate) => boolean
  deleteTransaction: (id: string) => boolean
  resetTransactions: () => void
}

function createTransactionId(): string {
  return `txn_${Date.now()}_${Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0')}`
}

function toValidStatus(
  status: TransactionDraft['status'],
): Transaction['status'] {
  return status ?? 'completed'
}

function isValidTransactionDraft(draft: TransactionDraft): boolean {
  return (
    draft.description.trim().length > 0 &&
    draft.amount > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.date)
  )
}

function isValidTransactionUpdate(update: TransactionUpdate): boolean {
  if (update.amount !== undefined && update.amount <= 0) {
    return false
  }

  if (update.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(update.date)) {
    return false
  }

  if (
    update.description !== undefined &&
    update.description.trim().length === 0
  ) {
    return false
  }

  return true
}

export const useTransactionStore = create<TransactionStoreState>()(
  persist(
    (set) => ({
      transactions: [...TRANSACTIONS],

      setTransactions(transactions: readonly Transaction[]): void {
        try {
          set({ transactions: [...transactions] })
        } catch (error) {
          logger.error('Failed to set transactions.', {
            error,
            transactionCount: transactions.length,
          })
        }
      },

      addTransaction(draft: TransactionDraft): Transaction | null {
        try {
          if (!isValidTransactionDraft(draft)) {
            return null
          }

          const newTransaction: Transaction = {
            id: createTransactionId(),
            date: draft.date,
            description: draft.description.trim(),
            amount: draft.amount,
            type: draft.type,
            category: draft.category,
            paymentMethod: draft.paymentMethod,
            status: toValidStatus(draft.status),
          }

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
          }))

          return newTransaction
        } catch (error) {
          logger.error('Failed to add transaction.', { error, draft })
          return null
        }
      },

      updateTransaction(id: string, updates: TransactionUpdate): boolean {
        try {
          if (!isValidTransactionUpdate(updates)) {
            return false
          }

          let didUpdate = false

          set((state) => ({
            transactions: state.transactions.map((transaction) => {
              if (transaction.id !== id) {
                return transaction
              }

              didUpdate = true

              return {
                ...transaction,
                ...updates,
                description:
                  updates.description !== undefined
                    ? updates.description.trim()
                    : transaction.description,
                status: updates.status ?? transaction.status,
              }
            }),
          }))

          return didUpdate
        } catch (error) {
          logger.error('Failed to update transaction.', { error, id, updates })
          return false
        }
      },

      deleteTransaction(id: string): boolean {
        try {
          let didDelete = false

          set((state) => {
            const nextTransactions = state.transactions.filter(
              (transaction) => {
                const shouldKeep = transaction.id !== id

                if (!shouldKeep) {
                  didDelete = true
                }

                return shouldKeep
              },
            )

            return { transactions: nextTransactions }
          })

          return didDelete
        } catch (error) {
          logger.error('Failed to delete transaction.', { error, id })
          return false
        }
      },

      resetTransactions(): void {
        try {
          set({ transactions: [...TRANSACTIONS] })
        } catch (error) {
          logger.error('Failed to reset transactions.', { error })
        }
      },
    }),
    {
      name: 'findash-transactions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    },
  ),
)
