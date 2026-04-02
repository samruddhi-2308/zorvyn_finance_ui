import { useShallow } from 'zustand/react/shallow'
import { useUIStore } from '@/store'
import type { ThemeMode } from '@/types'

interface UseUIResult {
  readonly theme: ThemeMode
  readonly isMobileSidebarOpen: boolean
  readonly isSidebarCollapsed: boolean
  readonly setTheme: (theme: ThemeMode) => void
  readonly toggleTheme: () => void
  readonly openMobileSidebar: () => void
  readonly closeMobileSidebar: () => void
  readonly toggleSidebarCollapsed: () => void
}

/**
 * Provides UI state and actions from the UI store slice.
 */
export function useUI(): UseUIResult {
  return useUIStore(
    useShallow((state) => ({
      theme: state.theme,
      isMobileSidebarOpen: state.isMobileSidebarOpen,
      isSidebarCollapsed: state.isSidebarCollapsed,
      setTheme: state.setTheme,
      toggleTheme: state.toggleTheme,
      openMobileSidebar: state.openMobileSidebar,
      closeMobileSidebar: state.closeMobileSidebar,
      toggleSidebarCollapsed: state.toggleSidebarCollapsed,
    })),
  )
}
