import { useEffect } from 'react'
import type { MutableRefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.hasAttribute('aria-hidden'))
}

/**
 * Traps keyboard focus within a container while active and restores focus on cleanup.
 */
export function useFocusTrap(
  containerRef: MutableRefObject<HTMLElement | null>,
  isActive: boolean,
  onEscape?: () => void,
): void {
  useEffect(() => {
    if (!isActive || containerRef.current === null) {
      return
    }

    const container = containerRef.current
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const focusableElements = getFocusableElements(container)
    const firstFocusable = focusableElements[0] ?? null
    firstFocusable?.focus()

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onEscape?.()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const currentFocusableElements = getFocusableElements(container)

      if (currentFocusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement =
        currentFocusableElements[currentFocusableElements.length - 1]

      if (!firstElement || !lastElement) {
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus()
      }
    }
  }, [containerRef, isActive, onEscape])
}
