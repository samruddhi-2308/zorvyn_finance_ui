import { useEffect } from 'react'

interface UseSurfaceCardRevealOptions {
  readonly rootId: string
  readonly enabled: boolean
  readonly maxAnimatedCards?: number
}

export function useSurfaceCardReveal({
  rootId,
  enabled,
  maxAnimatedCards = 16,
}: UseSurfaceCardRevealOptions): void {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const rootElement = document.getElementById(rootId)
    if (!(rootElement instanceof HTMLElement)) {
      return
    }

    const shouldReduceMotion = window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .matches

    const observedCards = new WeakSet<HTMLElement>()
    let animatedCardIndex = 0

    const cardObserver = shouldReduceMotion
      ? null
      : new IntersectionObserver(
          (entries, observer) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) {
                continue
              }

              const cardElement = entry.target as HTMLElement
              cardElement.classList.add('is-visible')
              observer.unobserve(cardElement)
            }
          },
          {
            threshold: 0.18,
            rootMargin: '0px 0px -10% 0px',
          },
        )

    const registerCard = (cardElement: HTMLElement): void => {
      if (cardElement.classList.contains('scroll-swipe-skip')) {
        return
      }

      if (observedCards.has(cardElement)) {
        return
      }

      observedCards.add(cardElement)
      cardElement.classList.add('scroll-swipe-card')

      if (shouldReduceMotion || animatedCardIndex >= maxAnimatedCards) {
        cardElement.classList.add('is-visible')
        return
      }

      cardElement.dataset['swipeFrom'] =
        animatedCardIndex % 2 === 0 ? 'left' : 'right'
      cardElement.style.setProperty(
        '--scroll-swipe-delay',
        `${(animatedCardIndex % 6) * 32}ms`,
      )
      animatedCardIndex += 1
      cardObserver?.observe(cardElement)
    }

    const registerCardsInViewTree = (): void => {
      const cards = rootElement.querySelectorAll<HTMLElement>('.surface-card')
      cards.forEach((cardElement) => {
        registerCard(cardElement)
      })
    }

    registerCardsInViewTree()
    const earlyRefreshId = window.setTimeout(registerCardsInViewTree, 280)
    const lateRefreshId = window.setTimeout(registerCardsInViewTree, 760)

    return () => {
      window.clearTimeout(earlyRefreshId)
      window.clearTimeout(lateRefreshId)
      cardObserver?.disconnect()
    }
  }, [enabled, maxAnimatedCards, rootId])
}
