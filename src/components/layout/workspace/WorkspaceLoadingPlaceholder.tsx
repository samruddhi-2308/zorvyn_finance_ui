import type { ReactElement } from 'react'

export function WorkspaceLoadingPlaceholder(): ReactElement {
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
