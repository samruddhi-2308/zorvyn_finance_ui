import type { ReactElement } from 'react'

function getPreferredScrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') {
    return 'auto'
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

export function WorkspaceQuickActions(): ReactElement {
  const jumpTo = (href: string): void => {
    const target = document.querySelector(href)
    if (!(target instanceof HTMLElement)) {
      return
    }

    target.scrollIntoView({
      behavior: getPreferredScrollBehavior(),
      block: 'start',
    })
  }

  const focusSearch = (): void => {
    const searchField = document.getElementById('transactions-search-input')
    if (!(searchField instanceof HTMLInputElement)) {
      return
    }

    searchField.focus()
    searchField.select()
  }

  return (
    <section
      className="surface-card section-reveal p-5 sm:p-6"
      aria-label="Workspace quick actions"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Quick Actions
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">
            Jump between sections and trigger high-use controls instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => jumpTo('#dashboard-overview')}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-semibold transition hover:bg-[var(--color-primary-soft)]"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={() => jumpTo('#transactions-overview')}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-semibold transition hover:bg-[var(--color-primary-soft)]"
          >
            Go to Transactions
          </button>
          <button
            type="button"
            onClick={focusSearch}
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Focus Search
          </button>
        </div>
      </div>
    </section>
  )
}
