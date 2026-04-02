import type { ReactElement } from 'react'
import { NAVIGATION_ITEMS } from '@/constants/navigation'

interface SidebarProps {
  readonly isOpen: boolean
  readonly onCloseMobileNav: () => void
}

export function Sidebar({
  isOpen,
  onCloseMobileNav,
}: SidebarProps): ReactElement {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/45 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onCloseMobileNav}
      />

      <aside
        id="primary-sidebar"
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-12 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-3">
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Core Navigation
          </p>
        </div>

        <nav aria-label="Main navigation" className="mt-6 flex-1">
          <ul className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] focus-visible:outline-none"
                  onClick={onCloseMobileNav}
                >
                  <span
                    className="mr-3 inline-flex h-2 w-2 rounded-full bg-[var(--color-border)] transition group-hover:bg-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            System
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-primary)]">
            Phase 1 foundation ready
          </p>
        </div>
      </aside>
    </>
  )
}
