import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  animate,
  motion,
  type MotionStyle,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import { useCurrency, useUI } from '@/hooks'
import type { SummaryCardModel } from '@/types'

interface SummaryCardProps {
  readonly title: string
  readonly value: number
  readonly valueKind: SummaryCardModel['valueKind']
  readonly trendDirection: SummaryCardModel['trendDirection']
  readonly trendValue: string
  readonly trendLabel: string
  readonly colorVariant: SummaryCardModel['colorVariant']
}

const variantStyles: Record<
  SummaryCardModel['colorVariant'],
  {
    readonly accent: string
    readonly iconBg: string
    readonly iconFg: string
  }
> = {
  indigo: {
    accent: 'from-blue-600/15 to-indigo-500/15 border-blue-200/70',
    iconBg: 'bg-blue-100',
    iconFg: 'text-blue-700',
  },
  green: {
    accent: 'from-emerald-600/15 to-green-500/15 border-emerald-200/80',
    iconBg: 'bg-emerald-100',
    iconFg: 'text-emerald-700',
  },
  red: {
    accent: 'from-rose-600/15 to-red-500/15 border-rose-200/80',
    iconBg: 'bg-rose-100',
    iconFg: 'text-rose-700',
  },
  blue: {
    accent: 'from-cyan-600/15 to-sky-500/15 border-cyan-200/80',
    iconBg: 'bg-cyan-100',
    iconFg: 'text-cyan-700',
  },
}

const lightCardToneStyles: Record<
  SummaryCardModel['colorVariant'],
  MotionStyle
> = {
  indigo: {
    borderColor: 'rgb(96 165 250 / 0.56)',
    backgroundImage:
      'linear-gradient(170deg, rgb(255 255 255 / 0.98), rgb(248 250 252 / 0.98))',
  },
  green: {
    borderColor: 'rgb(52 211 153 / 0.56)',
    backgroundImage:
      'linear-gradient(170deg, rgb(255 255 255 / 0.98), rgb(248 250 252 / 0.98))',
  },
  red: {
    borderColor: 'rgb(251 113 133 / 0.52)',
    backgroundImage:
      'linear-gradient(170deg, rgb(255 255 255 / 0.98), rgb(248 250 252 / 0.98))',
  },
  blue: {
    borderColor: 'rgb(56 189 248 / 0.56)',
    backgroundImage:
      'linear-gradient(170deg, rgb(255 255 255 / 0.98), rgb(248 250 252 / 0.98))',
  },
}

function renderTrendIcon(
  direction: SummaryCardModel['trendDirection'],
): ReactNode {
  if (direction === 'up') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          d="M4 13L10 7L16 13M10 7V17"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (direction === 'down') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          d="M4 7L10 13L16 7M10 13V3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M4 10H16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function getDirectionClass(
  direction: SummaryCardModel['trendDirection'],
): string {
  if (direction === 'up') {
    return 'text-emerald-700 bg-emerald-100'
  }

  if (direction === 'down') {
    return 'text-rose-700 bg-rose-100'
  }

  return 'text-slate-700 bg-slate-100'
}

function formatMetric(
  value: number,
  valueKind: SummaryCardModel['valueKind'],
  formatAmount: (value: number) => string,
): string {
  if (valueKind === 'percent') {
    return `${value.toFixed(1)}%`
  }

  return formatAmount(value)
}

/**
 * KPI summary card for dashboard overview metrics.
 */
export function SummaryCard({
  title,
  value,
  valueKind,
  trendDirection,
  trendValue,
  trendLabel,
  colorVariant,
}: SummaryCardProps): ReactElement {
  const { currency, formatAmount } = useCurrency()
  const { theme } = useUI()
  const shouldReduceMotion = useReducedMotion()
  const motionValue = useMotionValue(shouldReduceMotion ? value : 0)
  const [displayNumericValue, setDisplayNumericValue] = useState<number>(() =>
    shouldReduceMotion ? value : 0,
  )

  useMotionValueEvent(motionValue, 'change', (latestValue) => {
    setDisplayNumericValue(latestValue)
  })

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value)
      return
    }

    const controls = animate(motionValue, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    })

    return () => {
      controls.stop()
    }
  }, [formatAmount, motionValue, shouldReduceMotion, value, valueKind])

  const style = variantStyles[colorVariant]
  const cardStyleProps: { style?: MotionStyle } =
    theme === 'light' ? { style: lightCardToneStyles[colorVariant] } : {}
  const hoverScale = shouldReduceMotion ? 1 : 1.02
  const swipeOffsetX = shouldReduceMotion
    ? 0
    : colorVariant === 'green' || colorVariant === 'blue'
      ? 56
      : -56
  const displayValue = formatMetric(
    displayNumericValue,
    valueKind,
    formatAmount,
  )

  return (
    <motion.article
      className={`scroll-swipe-skip surface-card relative overflow-hidden border bg-gradient-to-br p-5 ${style.accent}`}
      {...cardStyleProps}
      aria-label={`${title}: ${displayValue}`}
      initial={shouldReduceMotion ? false : { opacity: 0, x: swipeOffsetX, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      whileHover={{ scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <div
        className={`absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg ${style.iconBg} ${style.iconFg}`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold uppercase">{currency}</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {title}
      </p>
      <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {displayValue}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getDirectionClass(trendDirection)}`}
        >
          {renderTrendIcon(trendDirection)}
          {trendValue}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {trendLabel}
        </span>
      </div>
    </motion.article>
  )
}
