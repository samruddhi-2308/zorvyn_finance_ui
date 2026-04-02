import type { ReactElement } from 'react'

interface HeaderProps {
  readonly onOpenMobileNav: () => void
}

export function Header({ onOpenMobileNav }: HeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)] lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            aria-controls="primary-sidebar"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
            >
              <path
                d="M3 5H17M3 10H17M3 15H17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              Zorvyn Finance
            </p>
            <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
              Finance Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <label
            htmlFor="role-preview"
            className="text-sm font-medium text-[var(--color-text-muted)]"
          >
            Role
          </label>
          <select
            id="role-preview"
            aria-label="Role selector preview, state hookup arrives in Phase 3"
            defaultValue="VIEWER"
            disabled
            className="cursor-not-allowed rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text-muted)] opacity-70"
          >
            <option value="VIEWER">Viewer (Phase 3)</option>
            <option value="ADMIN">Admin (Phase 3)</option>
          </select>
        </div>
      </div>
    </header>
  )
}
