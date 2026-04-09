import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react'
import { DashboardOverviewSection } from '@/components/layout/DashboardOverviewSection'
import { Header } from '@/components/layout/Header'
import { HelpPanel } from '@/components/layout/HelpPanel'
import {
  ScrollReveal,
  SectionFallbackCard,
  WorkspaceGreetingBanner,
  WorkspaceLoadingPlaceholder,
  WorkspaceQuickActions,
} from '@/components/layout/workspace'
import {
  useRole,
  useSearchShortcut,
  useSurfaceCardReveal,
  useThemeSync,
  useUI,
} from '@/hooks'

const TransactionsSection = lazy(async () => {
  const module = await import('@/components/transactions/TransactionsSection')
  return { default: module.TransactionsSection }
})

const InsightsSection = lazy(async () => {
  const module = await import('@/components/layout/InsightsSection')
  return { default: module.InsightsSection }
})

/**
 * Top-level application shell that composes layout and section containers.
 */
export function AppShell(): ReactElement {
  const { currentRole, setRole } = useRole()
  const {
    theme,
    currency,
    toggleTheme,
    setCurrency,
    isHelpPanelOpen,
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

  useThemeSync(theme)
  useSurfaceCardReveal({
    rootId: 'main-content',
    enabled: !isBootstrapping,
    maxAnimatedCards: 14,
  })
  useSearchShortcut({ searchInputId: 'transactions-search-input' })

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[var(--color-primary)]/12 blur-3xl" />
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="relative min-h-screen">
        <Header
          isHelpPanelOpen={isHelpPanelOpen}
          onToggleHelpPanel={toggleHelpPanel}
          currentRole={currentRole}
          onRoleChange={setRole}
          theme={theme}
          currency={currency}
          onCurrencyChange={setCurrency}
          onToggleTheme={toggleTheme}
        />

        <main
          id="main-content"
          className="app-main-scroll mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-10 pb-28 pt-28 sm:px-16 sm:pb-10 sm:pt-28 lg:gap-10 lg:px-24 lg:pt-28"
        >
          {isBootstrapping ? (
            <WorkspaceLoadingPlaceholder />
          ) : (
            <>
              <ScrollReveal className="section-viewport">
                <WorkspaceQuickActions />
              </ScrollReveal>
              <ScrollReveal className="section-viewport">
                <WorkspaceGreetingBanner currentRole={currentRole} />
              </ScrollReveal>
              <ScrollReveal className="section-viewport">
                <DashboardOverviewSection />
              </ScrollReveal>

              <ScrollReveal className="section-viewport border-t border-[var(--color-border)] pt-8 sm:pt-10">
                <Suspense
                  fallback={<SectionFallbackCard title="Transactions" />}
                >
                  <TransactionsSection />
                </Suspense>
              </ScrollReveal>

              <ScrollReveal className="section-viewport pt-12 sm:pt-16">
                <Suspense fallback={<SectionFallbackCard title="Insights" />}>
                  <InsightsSection />
                </Suspense>
              </ScrollReveal>
            </>
          )}
        </main>
      </div>

      <HelpPanel
        isOpen={isHelpPanelOpen}
        onToggle={toggleHelpPanel}
        onClose={closeHelpPanel}
      />
    </div>
  )
}
