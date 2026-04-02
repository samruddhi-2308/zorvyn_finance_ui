import type { ReactElement } from 'react'
import { ROLES } from '@/constants'
import type { ThemeMode, UserRole } from '@/types'

interface HeaderProps {
  readonly isMobileNavOpen: boolean
  readonly onToggleMobileNav: () => void
  readonly currentRole: UserRole
  readonly onRoleChange: (role: UserRole) => void
  readonly theme: ThemeMode
  readonly onToggleTheme: () => void
}

function toUserRole(value: string): UserRole {
  return value === ROLES.ADMIN ? ROLES.ADMIN : ROLES.VIEWER
}

export function Header({
  isMobileNavOpen,
  onToggleMobileNav,
  currentRole,
  onRoleChange,
  theme,
  onToggleTheme,
}: HeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-soft)] lg:hidden"
            onClick={onToggleMobileNav}
            aria-label={
              isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-controls="primary-sidebar"
            aria-expanded={isMobileNavOpen}
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
            htmlFor="role-switcher"
            className="sr-only text-sm font-medium text-[var(--color-text-muted)] sm:not-sr-only"
          >
            Role
          </label>
          <select
            id="role-switcher"
            aria-label="Switch active role"
            value={currentRole}
            onChange={(event) => onRoleChange(toUserRole(event.target.value))}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text-primary)]"
          >
            <option value={ROLES.VIEWER}>Viewer</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      </div>
    </header>
  )
}
