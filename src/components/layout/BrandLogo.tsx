import type { ReactElement } from 'react'

interface BrandLogoProps {
  readonly className?: string
  readonly compact?: boolean
}

/**
 * Renders a lightweight portfolio brand lockup.
 */
export function BrandLogo({
  className = '',
  compact = false,
}: BrandLogoProps): ReactElement {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`${compact ? 'h-8 w-8 text-[0.62rem]' : 'h-10 w-10 text-xs'} inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-cyan-300 via-sky-300 to-indigo-300 font-bold uppercase tracking-[0.14em] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]`}
      >
        FD
      </div>

      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          FinDash
        </p>
        {!compact ? (
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Finance Intelligence Hub
          </p>
        ) : null}
      </div>
    </div>
  )
}