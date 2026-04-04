import { useShallow } from 'zustand/react/shallow'
import { useUIStore } from '@/store'
import type { CurrencyMode, ThemeMode } from '@/types'

interface UseUIResult {
  readonly theme: ThemeMode
  readonly currency: CurrencyMode
  readonly isMobileSidebarOpen: boolean
  readonly isSidebarCollapsed: boolean
  readonly isHelpPanelOpen: boolean
  readonly setTheme: (theme: ThemeMode) => void
  readonly setCurrency: (currency: CurrencyMode) => void
  readonly toggleTheme: () => void
  readonly openMobileSidebar: () => void
  readonly closeMobileSidebar: () => void
  readonly toggleSidebarCollapsed: () => void
  readonly openHelpPanel: () => void
  readonly closeHelpPanel: () => void
  readonly toggleHelpPanel: () => void
}

/**
 * Provides UI state and actions from the UI store slice.
 */
export function useUI(): UseUIResult {
  return useUIStore(
    useShallow((state) => ({
      theme: state.theme,
      currency: state.currency,
      isMobileSidebarOpen: state.isMobileSidebarOpen,
      isSidebarCollapsed: state.isSidebarCollapsed,
      isHelpPanelOpen: state.isHelpPanelOpen,
      setTheme: state.setTheme,
      setCurrency: state.setCurrency,
      toggleTheme: state.toggleTheme,
      openMobileSidebar: state.openMobileSidebar,
      closeMobileSidebar: state.closeMobileSidebar,
      toggleSidebarCollapsed: state.toggleSidebarCollapsed,
      openHelpPanel: state.openHelpPanel,
      closeHelpPanel: state.closeHelpPanel,
      toggleHelpPanel: state.toggleHelpPanel,
    })),
  )
}
