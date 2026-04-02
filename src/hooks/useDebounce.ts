import { useEffect, useState } from 'react'

/**
 * Returns a debounced version of a value.
 * @param value - Source value to debounce.
 * @param delayMs - Delay duration in milliseconds.
 * @returns Debounced value.
 */
export function useDebounce<TValue>(value: TValue, delayMs = 300): TValue {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [value, delayMs])

  return debouncedValue
}
