import { useRef, type ReactElement } from 'react'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useFocusTrap } from '@/hooks'

interface HelpPanelProps {
  readonly isOpen: boolean
  readonly onToggle: () => void
  readonly onClose: () => void
}

/**
 * Contextual help panel with navigation guidance and keyboard tips.
 */
export function HelpPanel({
  isOpen,
  onToggle,
  onClose,
}: HelpPanelProps): ReactElement {
  const panelRef = useRef<HTMLElement | null>(null)

  useFocusTrap(panelRef, isOpen, onClose)

  const focusSearch = (): void => {
    const searchField = document.getElementById('transactions-search-input')
    if (!(searchField instanceof HTMLInputElement)) {
      return
    }

    searchField.focus()
    searchField.select()
    onClose()
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="help-tab-float fixed bottom-5 right-5 z-40 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] shadow-card transition hover:bg-[var(--color-primary-soft)]"
        aria-expanded={isOpen}
        aria-controls="help-panel"
      >
        {isOpen ? 'Close Help' : 'Help'}
      </button>

      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/25 sm:hidden"
          onClick={onClose}
          aria-label="Close help panel backdrop"
        />
      ) : null}

      <aside
        id="help-panel"
        ref={panelRef}
        aria-labelledby="help-panel-title"
        className={`fixed bottom-20 right-4 z-50 w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-card transition-all duration-300 ${
          isOpen
            ? 'help-panel-enter translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="help-panel-title" className="text-base font-semibold">
              Navigation and Workflow Guide
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Use this guide to move around faster and understand what each area is for.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
            aria-label="Close help panel"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Start Here
            </h3>
            <ol className="mt-2 space-y-1.5 text-sm text-[var(--color-text-primary)]">
              <li>1. Open Dashboard for KPIs and monthly visuals.</li>
              <li>2. Go to Transactions to search, filter, export, or add entries.</li>
              <li>3. Use Insights to track category trends and monthly momentum.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Section Shortcuts
            </h3>
            <ul className="mt-2 space-y-2.5">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm transition hover:bg-[var(--color-primary-soft)]"
                  >
                    <span>{item.label}</span>
                    <span
                      className="text-xs text-[var(--color-text-muted)]"
                      aria-hidden="true"
                    >
                      Jump
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Keyboard Tips
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-text-primary)]">
              <li>
                <strong className="font-semibold">/</strong> focuses transaction
                search.
              </li>
              <li>
                <strong className="font-semibold">Esc</strong> closes open menus
                and dialogs.
              </li>
              <li>Use the sidebar links to jump to each dashboard section.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Quick Actions
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={focusSearch}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--color-primary-soft)]"
              >
                Focus Search
              </button>
              <a
                href="#dashboard-overview"
                onClick={onClose}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold transition hover:bg-[var(--color-primary-soft)]"
              >
                Back to Dashboard
              </a>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}
