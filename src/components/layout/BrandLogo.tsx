import { useState, type ReactElement } from 'react'

interface BrandLogoProps {
  readonly className?: string
  readonly compact?: boolean
}

/**
 * Renders the brand logo from a public asset with a graceful text fallback.
 */
export function BrandLogo({
  className = '',
  compact = false,
}: BrandLogoProps): ReactElement {
  const [hasLoadError, setHasLoadError] = useState(false)

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      {!hasLoadError ? (
        <img
          src="/branding/zorvyn-logo.png"
          alt="Zorvyn Fintech"
          className={`${compact ? 'h-8 w-auto' : 'h-10 w-auto'} object-contain`}
          loading="eager"
          onError={() => setHasLoadError(true)}
        />
      ) : (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-sm font-bold text-[var(--color-primary)]">
          Z
        </div>
      )}

      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          Zorvyn Fintech
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