import { useEffect } from 'react'
import type { ThemeMode } from '@/types'

export function useThemeSync(theme: ThemeMode): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
