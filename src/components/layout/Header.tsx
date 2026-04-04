import { useEffect, useRef, useState, type ReactElement } from 'react'
import { CURRENCY_MODES, NAVIGATION_ITEMS, ROLES } from '@/constants'
import type { CurrencyMode, ThemeMode, UserRole } from '@/types'
import { BrandLogo } from './BrandLogo'

interface HeaderProps {
  readonly isHelpPanelOpen: boolean
  readonly onToggleHelpPanel: () => void
  readonly currentRole: UserRole
  readonly onRoleChange: (role: UserRole) => void
  readonly theme: ThemeMode
  readonly currency: CurrencyMode
  readonly onCurrencyChange: (currency: CurrencyMode) => void
  readonly onToggleTheme: () => void
}

function toUserRole(value: string): UserRole {
  return value === ROLES.ADMIN ? ROLES.ADMIN : ROLES.VIEWER
}

export function Header({
  isHelpPanelOpen,
  onToggleHelpPanel,
  currentRole,
  onRoleChange,
  theme,
  currency,
  onCurrencyChange,
  onToggleTheme,
}: HeaderProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const onWindowPointerDown = (event: PointerEvent): void => {
      if (!(event.target instanceof Node)) {
        return
      }

      if (menuContainerRef.current?.contains(event.target)) {
        return
      }

      setIsMenuOpen(false)
    }

    const onWindowKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', onWindowPointerDown)
    window.addEventListener('keydown', onWindowKeyDown)

    return () => {
      window.removeEventListener('pointerdown', onWindowPointerDown)
      window.removeEventListener('keydown', onWindowKeyDown)
    }
  }, [isMenuOpen])

  const jumpToSection = (href: string): void => {
    const target = document.querySelector(href)

    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setIsMenuOpen(false)
  }

  return (
    <header className="app-top-header fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/75 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 w-full max-w-screen-2xl items-center justify-between gap-3 px-5 py-3 sm:px-7 lg:px-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrandLogo compact className="min-w-0" />

          <div ref={menuContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls="header-nav-menu"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
            >
              Menu
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`h-4 w-4 transition ${isMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path
                  d="M5 8L10 13L15 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isMenuOpen ? (
              <div
                id="header-nav-menu"
                role="menu"
                aria-label="Primary sections"
                className="absolute left-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-card"
              >
                {NAVIGATION_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => jumpToSection(item.href)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-soft)]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleHelpPanel}
            aria-label={isHelpPanelOpen ? 'Close help panel' : 'Open help panel'}
            aria-pressed={isHelpPanelOpen}
            aria-controls="help-panel"
            className="hidden h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)] sm:inline-flex sm:items-center sm:justify-center"
          >
            Help
          </button>

          <button
            type="button"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)]"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>

          <label
            htmlFor="currency-switcher"
            className="sr-only text-sm font-medium text-[var(--color-text-muted)] xl:not-sr-only"
          >
            Currency
          </label>
          <select
            id="currency-switcher"
            aria-label="Switch currency mode"
            value={currency}
            onChange={(event) =>
              onCurrencyChange(event.target.value as CurrencyMode)
            }
            className="theme-select rounded-lg border px-2 py-1 text-sm backdrop-blur"
          >
            {CURRENCY_MODES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label
            htmlFor="role-switcher"
            className="sr-only text-sm font-medium text-[var(--color-text-muted)] xl:not-sr-only"
          >
            Role
          </label>
          <select
            id="role-switcher"
            aria-label="Switch active role"
            value={currentRole}
            onChange={(event) => onRoleChange(toUserRole(event.target.value))}
            className="theme-select rounded-lg border px-2 py-1 text-sm backdrop-blur"
          >
            <option value={ROLES.VIEWER}>Viewer</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      </div>
    </header>
  )
}
