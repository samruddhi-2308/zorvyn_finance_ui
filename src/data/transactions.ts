import transactionsJson from './transactions.json'
import type { Transaction } from '@/types/finance'
import { validateTransactions } from '@/utils/validateTransactions'

/**
 * Static mock transaction dataset validated once at module load.
 */
export const TRANSACTIONS: readonly Transaction[] =
  validateTransactions(transactionsJson)
