import { useEffect, type ReactElement } from 'react'
import { TransactionsSection } from '@/components/transactions'
import { DashboardOverviewSection } from '@/components/layout/DashboardOverviewSection'
import { Header } from '@/components/layout/Header'
import { InsightsSection } from '@/components/layout/InsightsSection'
import { Sidebar } from '@/components/layout/Sidebar'
import { useRole, useUI } from '@/hooks'

/**
 * Top-level application shell that composes layout and section containers.
 */
export function AppShell(): ReactElement {
  const { currentRole, setRole } = useRole()
  const {
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    openMobileSidebar,
    closeMobileSidebar,
  } = useUI()
  const onToggleMobileNav = (): void => {
    if (isMobileSidebarOpen) {
      closeMobileSidebar()
      return
    }

    openMobileSidebar()
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const syncWithViewport = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        closeMobileSidebar()
      }
    }

    mediaQuery.addEventListener('change', syncWithViewport)

    return () => {
      mediaQuery.removeEventListener('change', syncWithViewport)
    }
  }, [closeMobileSidebar])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[var(--color-primary)]/8 blur-3xl" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="relative lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onCloseMobileNav={closeMobileSidebar}
        />

        <div className="min-h-screen">
          <Header
            isMobileNavOpen={isMobileSidebarOpen}
            onToggleMobileNav={onToggleMobileNav}
            currentRole={currentRole}
            onRoleChange={setRole}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main
            id="main-content"
            className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 p-4 sm:p-6 lg:p-8"
          >
            <DashboardOverviewSection />
            <TransactionsSection />
            <InsightsSection />
          </main>
        </div>
      </div>
    </div>
  )
}
