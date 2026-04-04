import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { createPortal } from 'react-dom'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  TRANSACTION_STATUSES,
} from '@/constants'
import { useFocusTrap, useUI } from '@/hooks'
import type {
  Transaction,
  TransactionCategory,
  TransactionDraft,
  TransactionStatus,
  TransactionType,
} from '@/types'

interface TransactionModalProps {
  readonly isOpen: boolean
  readonly mode: 'create' | 'edit'
  readonly transaction: Transaction | null
  readonly onClose: () => void
  readonly onCreate: (draft: TransactionDraft) => boolean
  readonly onUpdate: (id: string, draft: TransactionDraft) => boolean
}

interface TransactionFormState {
  description: string
  amount: string
  type: TransactionType
  category: TransactionCategory
  date: string
  paymentMethod: TransactionDraft['paymentMethod']
  status: TransactionStatus
}

interface TransactionFormErrors {
  description?: string
  amount?: string
  category?: string
  date?: string
  form?: string
}

function isCategoryValidForType(
  type: TransactionType,
  category: TransactionCategory,
): boolean {
  const categoryOptions =
    type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (categoryOptions as readonly string[]).includes(category)
}

function getDefaultCategory(type: TransactionType): TransactionCategory {
  return type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
}

function buildInitialState(
  mode: 'create' | 'edit',
  transaction: Transaction | null,
): TransactionFormState {
  if (mode === 'edit' && transaction) {
    return {
      description: transaction.description,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
    }
  }

  return {
    description: '',
    amount: '',
    type: 'expense',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI',
    status: 'completed',
  }
}

function validateForm(state: TransactionFormState): TransactionFormErrors {
  const errors: TransactionFormErrors = {}

  if (state.description.trim().length === 0) {
    errors.description = 'Description is required.'
  }

  const numericAmount = Number(state.amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Amount must be greater than zero.'
  }

  if (state.category.trim().length === 0) {
    errors.category = 'Category is required.'
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(state.date)) {
    errors.date = 'Valid date is required.'
  }

  return errors
}

/**
 * Modal for creating and editing transactions (admin-only).
 */
export function TransactionModal({
  isOpen,
  mode,
  transaction,
  onClose,
  onCreate,
  onUpdate,
}: TransactionModalProps): ReactElement | null {
  const [formState, setFormState] = useState<TransactionFormState>(() =>
    buildInitialState(mode, transaction),
  )
  const [errors, setErrors] = useState<TransactionFormErrors>({})
  const { theme } = useUI()

  const modalPanelRef = useRef<HTMLDivElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)

  const descriptionErrorId = useId()
  const amountErrorId = useId()
  const categoryErrorId = useId()
  const dateErrorId = useId()
  const formErrorId = useId()

  useFocusTrap(modalPanelRef, isOpen, onClose)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    descriptionInputRef.current?.focus()
  }, [isOpen])

  const categoryOptions = useMemo<readonly TransactionCategory[]>(
    () =>
      formState.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES,
    [formState.type],
  )

  const fieldClassName =
    'theme-input mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)]/82 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-blue-300'

  if (!isOpen) {
    return null
  }

  if (typeof document === 'undefined') {
    return null
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const validationErrors = validateForm(formState)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const payload: TransactionDraft = {
      description: formState.description.trim(),
      amount: Number(formState.amount),
      type: formState.type,
      category: formState.category,
      date: formState.date,
      paymentMethod: formState.paymentMethod,
      status: formState.status,
    }

    const didSucceed =
      mode === 'create'
        ? onCreate(payload)
        : transaction
          ? onUpdate(transaction.id, payload)
          : false

    if (!didSucceed) {
      setErrors({
        form: 'Unable to save this transaction. Please review inputs and retry.',
      })
      return
    }

    onClose()
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4 backdrop-blur-md sm:p-6 ${
        theme === 'dark' ? 'bg-slate-950/55' : 'bg-slate-950/20'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
      aria-describedby="transaction-modal-description"
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close transaction modal backdrop"
      />

      <div
        ref={modalPanelRef}
        className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/96 shadow-card backdrop-blur-xl sm:max-h-[calc(100vh-4rem)]"
      >
        <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h4
              id="transaction-modal-title"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
            </h4>
            <p
              id="transaction-modal-description"
              className="mt-1 text-sm text-[var(--color-text-muted)]"
            >
              {mode === 'create'
                ? 'Provide details to add a new finance record.'
                : 'Update the transaction details and save changes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
            aria-label="Close transaction modal"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form
          className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Description
              </span>
              <input
                ref={descriptionInputRef}
                value={formState.description}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    description: event.target.value,
                  }))
                }
                className={fieldClassName}
                placeholder="Transaction description"
                aria-invalid={errors.description !== undefined}
                aria-describedby={
                  errors.description !== undefined
                    ? descriptionErrorId
                    : undefined
                }
                required
              />
              {errors.description ? (
                <p
                  id={descriptionErrorId}
                  className="mt-1 text-xs text-rose-700"
                >
                  {errors.description}
                </p>
              ) : null}
            </label>

            <label>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Amount
              </span>
              <input
                value={formState.amount}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    amount: event.target.value,
                  }))
                }
                type="number"
                min="0"
                step="0.01"
                className={fieldClassName}
                placeholder="0.00"
                aria-invalid={errors.amount !== undefined}
                aria-describedby={
                  errors.amount !== undefined ? amountErrorId : undefined
                }
                required
              />
              {errors.amount ? (
                <p id={amountErrorId} className="mt-1 text-xs text-rose-700">
                  {errors.amount}
                </p>
              ) : null}
            </label>

            <fieldset>
              <legend className="text-sm font-semibold text-[var(--color-text-primary)]">
                Type
              </legend>
              <div className="mt-1 inline-flex rounded-lg border border-[var(--color-border)] p-1">
                {(['income', 'expense'] as const).map((type) => {
                  const isSelected = formState.type === type

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormState((state) => ({
                          ...state,
                          type,
                          category: isCategoryValidForType(type, state.category)
                            ? state.category
                            : getDefaultCategory(type),
                        }))
                      }
                      className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)]'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <label>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Category
              </span>
              <select
                value={formState.category}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    category: event.target.value as TransactionCategory,
                  }))
                }
                className={`theme-select ${fieldClassName}`}
                aria-invalid={errors.category !== undefined}
                aria-describedby={
                  errors.category !== undefined ? categoryErrorId : undefined
                }
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p id={categoryErrorId} className="mt-1 text-xs text-rose-700">
                  {errors.category}
                </p>
              ) : null}
            </label>

            <label>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Date
              </span>
              <input
                value={formState.date}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    date: event.target.value,
                  }))
                }
                type="date"
                className={fieldClassName}
                aria-invalid={errors.date !== undefined}
                aria-describedby={
                  errors.date !== undefined ? dateErrorId : undefined
                }
              />
              {errors.date ? (
                <p id={dateErrorId} className="mt-1 text-xs text-rose-700">
                  {errors.date}
                </p>
              ) : null}
            </label>

            <label>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Payment Method
              </span>
              <select
                value={formState.paymentMethod}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    paymentMethod: event.target
                      .value as TransactionDraft['paymentMethod'],
                  }))
                }
                className={`theme-select ${fieldClassName}`}
              >
                {PAYMENT_METHODS.map((paymentMethod) => (
                  <option key={paymentMethod} value={paymentMethod}>
                    {paymentMethod}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Status
              </span>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    status: event.target.value as TransactionStatus,
                  }))
                }
                className={`theme-select ${fieldClassName}`}
              >
                {TRANSACTION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {errors.form ? (
            <p
              id={formErrorId}
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {errors.form}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-describedby={
                errors.form !== undefined ? formErrorId : undefined
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {mode === 'create' ? 'Add Transaction' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
