import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react'
import { DashboardOverviewSection } from '@/components/layout/DashboardOverviewSection'
import { Header } from '@/components/layout/Header'
import { HelpPanel } from '@/components/layout/HelpPanel'
import { Sidebar } from '@/components/layout/Sidebar'
import { useRole, useUI } from '@/hooks'

const TransactionsSection = lazy(async () => {
  const module = await import('@/components/transactions/TransactionsSection')
  return { default: module.TransactionsSection }
})

const InsightsSection = lazy(async () => {
  const module = await import('@/components/layout/InsightsSection')
  return { default: module.InsightsSection }
})

function SectionFallbackCard({
  title,
}: {
  readonly title: string
}): ReactElement {
  return (
    <article
      className="surface-card section-reveal loading-shimmer p-7"
      aria-live="polite"
    >
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        Loading {title}
      </h3>
      <div className="mt-4 h-4 w-40 rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-40 rounded-xl bg-[var(--color-border)]" />
    </article>
  )
}

function WorkspaceQuickActions(): ReactElement {
  const jumpTo = (href: string): void => {
    const target = document.querySelector(href)
    if (!(target instanceof HTMLElement)) {
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <section className="surface-card section-reveal p-5 sm:p-6" aria-label="Workspace quick actions">
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

function WorkspaceLoadingPlaceholder(): ReactElement {
  return (
    <div className="space-y-8" aria-live="polite">
      <article className="surface-card loading-shimmer p-6 sm:p-7">
        <div className="h-7 w-60 rounded bg-[var(--color-border)]" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-[var(--color-border)]" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={`workspace-loading-kpi-${index}`}
              className="h-28 rounded-xl bg-[var(--color-border)]"
            />
          ))}
        </div>
      </article>
      <article className="surface-card loading-shimmer p-6 sm:p-7">
        <div className="h-6 w-52 rounded bg-[var(--color-border)]" />
        <div className="mt-4 h-64 rounded-xl bg-[var(--color-border)]" />
      </article>
    </div>
  )
}

/**
 * Top-level application shell that composes layout and section containers.
 */
export function AppShell(): ReactElement {
  const { currentRole, setRole } = useRole()
  const {
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    isSidebarCollapsed,
    isHelpPanelOpen,
    openMobileSidebar,
    closeMobileSidebar,
    toggleSidebarCollapsed,
    toggleHelpPanel,
    closeHelpPanel,
  } = useUI()
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsBootstrapping(false)
    }, 380)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

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

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== '/') {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const activeElement = document.activeElement
      const isTextEntryFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)

      if (isTextEntryFocused) {
        return
      }

      const searchField = document.getElementById('transactions-search-input')
      if (!(searchField instanceof HTMLInputElement)) {
        return
      }

      event.preventDefault()
      searchField.focus()
      searchField.select()
    }

    window.addEventListener('keydown', onGlobalKeyDown)

    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown)
    }
  }, [])

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

      <div
        className={`relative lg:grid ${
          isSidebarCollapsed ? 'lg:grid-cols-[5rem_1fr]' : 'lg:grid-cols-[18rem_1fr]'
        }`}
      >
        <Sidebar
          isOpen={isMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCloseMobileNav={closeMobileSidebar}
          onToggleCollapsed={toggleSidebarCollapsed}
        />

        <div className="min-h-screen">
          <Header
            isMobileNavOpen={isMobileSidebarOpen}
            onToggleMobileNav={onToggleMobileNav}
            isHelpPanelOpen={isHelpPanelOpen}
            onToggleHelpPanel={toggleHelpPanel}
            currentRole={currentRole}
            onRoleChange={setRole}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <main
            id="main-content"
            className="mx-auto flex w-full max-w-screen-2xl flex-col gap-10 p-6 sm:p-9 lg:gap-12 lg:p-12"
          >
            {isBootstrapping ? (
              <WorkspaceLoadingPlaceholder />
            ) : (
              <>
                <WorkspaceQuickActions />
                <DashboardOverviewSection />
                <Suspense fallback={<SectionFallbackCard title="Transactions" />}>
                  <TransactionsSection />
                </Suspense>
                <Suspense fallback={<SectionFallbackCard title="Insights" />}>
                  <InsightsSection />
                </Suspense>
              </>
            )}
          </main>
        </div>
      </div>

      <HelpPanel
        isOpen={isHelpPanelOpen}
        onToggle={toggleHelpPanel}
        onClose={closeHelpPanel}
      />
    </div>
  )
}
