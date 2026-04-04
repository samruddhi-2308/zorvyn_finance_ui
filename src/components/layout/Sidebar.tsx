import { useEffect, useState, type ReactElement } from 'react'
import { NAVIGATION_ITEMS } from '@/constants/navigation'

const NAV_ICON_PATHS = {
  dashboard: 'M3.5 9.5L10 4L16.5 9.5V16.5H12V12.1H8V16.5H3.5V9.5Z',
  transactions: 'M4 5.5H16V8.5H4V5.5ZM4 10.5H11V13.5H4V10.5ZM12.5 11.9L14.1 13.5L16.8 10.8',
  insights: 'M4 15.5V12.5M8 15.5V9.5M12 15.5V6.5M16 15.5V11.5',
} as const

type NavigationIconId = keyof typeof NAV_ICON_PATHS

function NavigationGlyph({
  id,
  className,
}: {
  readonly id: string
  readonly className?: string
}): ReactElement {
  const path =
    id in NAV_ICON_PATHS
      ? NAV_ICON_PATHS[id as NavigationIconId]
      : NAV_ICON_PATHS.dashboard

  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CommandPillLink({
  href,
  label,
  id,
  isActive,
  onNavigate,
  isMobile,
}: {
  readonly href: string
  readonly label: string
  readonly id: string
  readonly isActive: boolean
  readonly onNavigate: (href: string) => void
  readonly isMobile: boolean
}): ReactElement {
  return (
    <a
      href={href}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onNavigate(href)}
      className={`group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none ${
        isMobile ? 'min-w-0 flex-1 justify-center px-2.5 py-2.5 text-xs' : ''
      } ${
        isActive
          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]'
          : 'text-[var(--color-text-muted)] hover:bg-white/45 hover:text-[var(--color-text-primary)] dark:hover:bg-white/10'
      }`}
    >
      <NavigationGlyph
        id={id}
        className={isMobile ? 'h-4 w-4 flex-shrink-0' : 'h-4 w-4'}
      />
      <span className={isMobile ? 'truncate' : ''}>{label}</span>
    </a>
  )
}

export function FloatingCommandPill(): ReactElement {
  const [activeHref, setActiveHref] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return '#dashboard-overview'
    }

    return window.location.hash || '#dashboard-overview'
  })

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
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }

    const sectionTargets = NAVIGATION_ITEMS.map((item) => {
      const section = document.querySelector(item.href)
      if (!(section instanceof HTMLElement)) {
        return null
      }

      return {
        href: item.href,
        section,
      }
    }).filter((entry): entry is { href: string; section: HTMLElement } => entry !== null)

    if (sectionTargets.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const currentSection = visibleEntries.at(0)
        if (!currentSection) {
          return
        }

        const matchedSection = sectionTargets.find(
          (entry) => entry.section === currentSection.target,
        )

        if (matchedSection) {
          setActiveHref(matchedSection.href)
        }
      },
      {
        rootMargin: '-28% 0px -58% 0px',
        threshold: [0.2, 0.35, 0.5, 0.7],
      },
    )

    sectionTargets.forEach((entry) => {
      observer.observe(entry.section)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const onNavigate = (href: string): void => {
    setActiveHref(href)
  }

  return (
    <>
      <nav
        aria-label="Command navigation"
        className="pointer-events-none fixed left-4 top-4 z-[56] hidden sm:block"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/35 bg-[var(--glass-surface)]/70 p-1.5 shadow-[0_24px_46px_-26px_rgba(2,6,23,0.85)] ring-1 ring-white/20 backdrop-blur-2xl">
          {NAVIGATION_ITEMS.map((item) => (
            <CommandPillLink
              key={item.id}
              href={item.href}
              label={item.label}
              id={item.id}
              isActive={activeHref === item.href}
              onNavigate={onNavigate}
              isMobile={false}
            />
          ))}
        </div>
      </nav>

      <nav
        aria-label="Mobile command navigation"
        className="pointer-events-none fixed inset-x-0 bottom-3 z-[56] px-3 sm:hidden"
      >
        <div
          className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-1 rounded-[1.2rem] border border-white/35 bg-[var(--glass-surface)]/72 p-1.5 shadow-[0_20px_44px_-22px_rgba(2,6,23,0.88)] ring-1 ring-white/20 backdrop-blur-2xl"
          style={{
            paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom))',
          }}
        >
          {NAVIGATION_ITEMS.map((item) => (
            <CommandPillLink
              key={item.id}
              href={item.href}
              label={item.label}
              id={item.id}
              isActive={activeHref === item.href}
              onNavigate={onNavigate}
              isMobile
            />
          ))}
        </div>
      </nav>
    </>
  )
}
