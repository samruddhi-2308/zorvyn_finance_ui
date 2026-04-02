import {
  PAYMENT_METHODS,
  TRANSACTION_CATEGORIES,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from '@/constants/finance'
import type { Transaction } from '@/types/finance'

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isISODateString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
  )
}

/**
 * Runtime type guard for transaction records.
 * @param value - Unknown payload item.
 * @returns True if the payload matches the `Transaction` contract.
 */
export function isTransaction(value: unknown): value is Transaction {
  if (!isObjectRecord(value)) {
    return false
  }

  return (
    typeof value['id'] === 'string' &&
    value['id'].length > 0 &&
    isISODateString(value['date']) &&
    typeof value['description'] === 'string' &&
    value['description'].length > 0 &&
    typeof value['amount'] === 'number' &&
    Number.isFinite(value['amount']) &&
    value['amount'] > 0 &&
    typeof value['type'] === 'string' &&
    (TRANSACTION_TYPES as readonly string[]).includes(value['type']) &&
    typeof value['category'] === 'string' &&
    (TRANSACTION_CATEGORIES as readonly string[]).includes(value['category']) &&
    typeof value['paymentMethod'] === 'string' &&
    (PAYMENT_METHODS as readonly string[]).includes(value['paymentMethod']) &&
    typeof value['status'] === 'string' &&
    (TRANSACTION_STATUSES as readonly string[]).includes(value['status'])
  )
}

/**
 * Validates a transaction array payload and throws with precise context on failure.
 * @param payload - Unknown data payload (usually JSON data).
 * @returns Strongly typed transaction array.
 */
export function validateTransactions(payload: unknown): Transaction[] {
  if (!Array.isArray(payload)) {
    throw new Error('Transactions dataset must be an array.')
  }

  return payload.map((entry, index) => {
    if (!isTransaction(entry)) {
      throw new Error(`Invalid transaction at index ${index}.`)
    }

    return entry
  })
}
