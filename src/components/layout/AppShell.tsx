import { useEffect, type ReactElement } from 'react'
import { TransactionsSection } from '@/components/transactions'
import { DashboardOverviewSection } from '@/components/layout/DashboardOverviewSection'
import { Header } from '@/components/layout/Header'
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onCloseMobileNav={closeMobileSidebar}
        />

        <div className="min-h-screen">
          <Header
            onOpenMobileNav={openMobileSidebar}
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
          </main>
        </div>
      </div>
    </div>
  )
}
