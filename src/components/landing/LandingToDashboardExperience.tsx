import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import { AppShell } from '@/components/layout/AppShell'

interface StarParticle {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
  twinkle: number
}

function createStarParticles(
  width: number,
  height: number,
  count: number,
): StarParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.9 + Math.random() * 1.7,
    speed: 0.08 + Math.random() * 0.28,
    alpha: 0.28 + Math.random() * 0.48,
    twinkle: 0.5 + Math.random() * 1.4,
  }))
}

function StarfieldCanvas(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!(canvas instanceof HTMLCanvasElement)) {
      return
    }

    const context = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })

    if (!context) {
      return
    }

    let frameId = 0
    let width = 0
    let height = 0
    let particles: StarParticle[] = []
    let dpr = 1

    const draw = (timestamp: number): void => {
      context.clearRect(0, 0, width, height)

      for (const particle of particles) {
        particle.y += particle.speed

        if (particle.y > height + particle.size) {
          particle.y = -particle.size
          particle.x = Math.random() * width
        }

        const twinkle =
          (Math.sin(timestamp * 0.0011 * particle.twinkle + particle.x * 0.011) +
            1) /
          2
        const opacity = Math.min(1, particle.alpha + twinkle * 0.35)

        context.fillStyle = `rgba(164, 203, 255, ${opacity.toFixed(3)})`
        context.fillRect(particle.x, particle.y, particle.size, particle.size)
      }
    }

    const resize = (): void => {
      const bounds = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(bounds.width))
      height = Math.max(1, Math.floor(bounds.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)

      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const starCount = Math.min(
        230,
        Math.max(96, Math.floor((width * height) / 12800)),
      )
      particles = createStarParticles(width, height, starCount)
    }

    const prefersReducedMotion = window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .matches

    const renderLoop = (timestamp: number): void => {
      draw(timestamp)
      frameId = window.requestAnimationFrame(renderLoop)
    }

    resize()

    if (prefersReducedMotion) {
      draw(0)
    } else {
      frameId = window.requestAnimationFrame(renderLoop)
    }

    window.addEventListener('resize', resize, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

function LandingHero({
  onEnterDashboard,
  isTransitioning,
}: {
  readonly onEnterDashboard: (source: 'button' | 'scroll') => void
  readonly isTransitioning: boolean
}): ReactElement {
  const shouldReduceMotion = useReducedMotion()
  const landingRef = useRef<HTMLDivElement | null>(null)
  const hasTriggeredScrollTransitionRef = useRef(false)
  const { scrollYProgress } = useScroll({
    target: landingRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(
    scrollYProgress,
    [0, 0.7],
    [0, shouldReduceMotion ? -22 : -140],
  )
  const heroOpacity = useTransform(scrollYProgress, [0, 0.56], [1, 0.34])
  const heroScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.94])
  const buttonMotionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: { y: -2, scale: 1.01 },
        whileTap: { scale: 0.985 },
      }

  useEffect(() => {
    if (isTransitioning) {
      return
    }

    const unsubscribe = scrollYProgress.on('change', (value) => {
      if (value < 0.16 || hasTriggeredScrollTransitionRef.current) {
        return
      }

      hasTriggeredScrollTransitionRef.current = true
      onEnterDashboard('scroll')
    })

    return () => {
      unsubscribe()
    }
  }, [isTransitioning, onEnterDashboard, scrollYProgress])

  return (
    <motion.div
      key="landing-stage"
      ref={landingRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[170vh] overflow-x-clip bg-slate-950 text-slate-100"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_78%_10%,rgba(30,64,175,0.24),transparent_30%),radial-gradient(circle_at_50%_115%,rgba(20,184,166,0.24),transparent_42%),linear-gradient(180deg,#02040d_0%,#020817_46%,#040f25_100%)]"
      />
      <StarfieldCanvas />

      <section className="sticky top-0 z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative w-full max-w-5xl"
        >
          <div className="relative mx-auto flex min-h-[360px] w-full flex-col items-center justify-center text-center">
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 220 220"
              className="absolute left-[8%] top-1/2 h-48 w-48 -translate-y-1/2 md:h-56 md:w-56"
              initial={{ x: shouldReduceMotion ? 0 : -340, opacity: 0, rotate: -26 }}
              animate={{
                x: shouldReduceMotion ? 0 : [0, 310],
                opacity: shouldReduceMotion ? 0.24 : [0, 1, 1, 0],
                rotate: shouldReduceMotion ? -9 : [-26, -12, 2],
              }}
              transition={
                shouldReduceMotion
                  ? {
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }
                  : {
                      duration: 1.48,
                      times: [0, 0.4, 0.72, 1],
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            >
              <defs>
                <linearGradient id="prism-gradient-left" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="48%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              <path
                d="M112 22L185 66V152L112 198L39 152V66L112 22Z"
                fill="url(#prism-gradient-left)"
                fillOpacity="0.72"
              />
              <path
                d="M112 44L166 77V141L112 174L58 141V77L112 44Z"
                stroke="#bae6fd"
                strokeOpacity="0.62"
                strokeWidth="3"
                fill="none"
              />
            </motion.svg>

            <motion.svg
              aria-hidden="true"
              viewBox="0 0 220 220"
              className="absolute right-[8%] top-1/2 h-48 w-48 -translate-y-1/2 md:h-56 md:w-56"
              initial={{ x: shouldReduceMotion ? 0 : 340, opacity: 0, rotate: 30 }}
              animate={{
                x: shouldReduceMotion ? 0 : [-1, -310],
                opacity: shouldReduceMotion ? 0.24 : [0, 1, 1, 0],
                rotate: shouldReduceMotion ? 9 : [30, 14, -4],
              }}
              transition={
                shouldReduceMotion
                  ? {
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }
                  : {
                      duration: 1.48,
                      times: [0, 0.4, 0.72, 1],
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            >
              <defs>
                <linearGradient id="ring-gradient-right" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="62%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <circle
                cx="110"
                cy="110"
                r="80"
                fill="none"
                stroke="url(#ring-gradient-right)"
                strokeWidth="24"
                strokeOpacity="0.74"
              />
              <path
                d="M110 38L128 87H182L138 118L154 170L110 137L66 170L82 118L38 87H92L110 38Z"
                fill="#e0f2fe"
                fillOpacity="0.22"
              />
            </motion.svg>

            <motion.h1
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0.05 : 1.04,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="daily-checkin-gradient relative text-balance text-6xl font-extrabold tracking-tight md:text-8xl"
            >
              FinDash
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: shouldReduceMotion ? 0.08 : 1.22,
                duration: 0.46,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-4 max-w-2xl text-balance text-sm font-medium tracking-[0.06em] text-slate-300 md:text-base"
            >
              Portfolio-grade finance intelligence for founders, operators, and teams
              that move with precision.
            </motion.p>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => onEnterDashboard('button')}
          {...buttonMotionProps}
          disabled={isTransitioning}
          className="group absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300 p-[1px] shadow-[0_22px_50px_-24px_rgba(34,211,238,0.95)] transition disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Enter dashboard"
        >
          <span className="relative block overflow-hidden rounded-[calc(1rem-1px)] bg-slate-950/90 px-2 py-2 backdrop-blur-lg">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/55" />
            <span className="pointer-events-none absolute -inset-x-12 -top-10 h-16 rotate-6 bg-white/10 opacity-0 blur-md transition group-hover:opacity-100" />
            <span className="relative flex items-center gap-3 rounded-xl px-4 py-2.5">
              <span className="text-left">
                <span className="block text-sm font-semibold tracking-[0.03em] text-slate-100">
                  Enter Dashboard
                </span>
                <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Scroll Or Tap
                </span>
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-200 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M5 8L10 13L15 8"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </span>
        </motion.button>
      </section>

      <div aria-hidden="true" className="h-[72vh]" />
    </motion.div>
  )
}

export function LandingToDashboardExperience(): ReactElement {
  const shouldReduceMotion = useReducedMotion()
  const [isDashboardVisible, setIsDashboardVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const beginDashboardTransition = useCallback(
    (source: 'button' | 'scroll'): void => {
      if (isTransitioning || isDashboardVisible) {
        return
      }

      if (source === 'button' && !shouldReduceMotion) {
        window.scrollTo({
          top: Math.max(window.innerHeight * 0.82, 260),
          behavior: 'smooth',
        })
      }

      setIsTransitioning(true)

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setIsDashboardVisible(true)
        window.scrollTo({ top: 0, behavior: 'auto' })
      }, shouldReduceMotion ? 120 : 620)
    },
    [isDashboardVisible, isTransitioning, shouldReduceMotion],
  )

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  if (isDashboardVisible) {
    return <AppShell />
  }

  return (
    <MotionConfig transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}>
      <motion.div
        animate={{
          opacity: isTransitioning ? 0 : 1,
          y: isTransitioning ? (shouldReduceMotion ? -10 : -96) : 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.16 : 0.62,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <LandingHero
          isTransitioning={isTransitioning}
          onEnterDashboard={beginDashboardTransition}
        />
      </motion.div>
    </MotionConfig>
  )
}
