import type { ReactElement } from 'react'
import type { UserRole } from '@/types'

interface WorkspaceGreetingBannerProps {
  readonly currentRole: UserRole
}

function getGreeting(hour: number): string {
  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  if (hour < 22) {
    return 'Good evening'
  }

  return 'Good night'
}

export function WorkspaceGreetingBanner({
  currentRole,
}: WorkspaceGreetingBannerProps): ReactElement {
  const greeting = getGreeting(new Date().getHours())

  return (
    <section
      className="surface-card section-reveal relative overflow-hidden p-5 sm:p-6"
      aria-label="Workspace greeting"
    >
      <div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgb(37_99_235_/_0.18),transparent_72%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Daily check-in
        </p>
        <h2 className="daily-checkin-gradient mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          {greeting}, how is your finance runway today?
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          You are viewing the dashboard as {currentRole}. Review highlights and
          adjust filters to zoom into what matters now.
        </p>
      </div>
    </section>
  )
}
