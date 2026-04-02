import { useEffect, useRef, useState, type ReactElement } from 'react'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useFocusTrap } from '@/hooks'

interface SidebarProps {
  readonly isOpen: boolean
  readonly onCloseMobileNav: () => void
}

export function Sidebar({
  isOpen,
  onCloseMobileNav,
}: SidebarProps): ReactElement {
  const sidebarRef = useRef<HTMLElement | null>(null)
  const [activeHref, setActiveHref] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return '#dashboard-overview'
    }

    return window.location.hash || '#dashboard-overview'
  })

  useFocusTrap(sidebarRef, isOpen, onCloseMobileNav)

  useEffect(() => {
    const onHashChange = (): void => {
      setActiveHref(window.location.hash || '#dashboard-overview')
    }

    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const onNavigate = (href: string): void => {
    setActiveHref(href)
    onCloseMobileNav()
  }

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
        ref={sidebarRef}
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Navigation
          </p>
          <button
            type="button"
            onClick={onCloseMobileNav}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
            aria-label="Close navigation menu"
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
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none ${
                    activeHref === item.href
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]'
                  }`}
                  onClick={() => onNavigate(item.href)}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                >
                  <span
                    className={`mr-3 inline-flex h-2 w-2 rounded-full transition group-hover:bg-[var(--color-primary)] ${
                      activeHref === item.href
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-border)]'
                    }`}
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
            Accessibility and responsive polish enabled
          </p>
        </div>
      </aside>
    </>
  )
}
