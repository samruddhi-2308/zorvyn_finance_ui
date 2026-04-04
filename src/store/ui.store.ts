import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CurrencyMode, ThemeMode } from '@/types'

interface UIStoreState {
  readonly theme: ThemeMode
  readonly currency: CurrencyMode
  readonly isMobileSidebarOpen: boolean
  readonly isSidebarCollapsed: boolean
  readonly isHelpPanelOpen: boolean
  setTheme: (theme: ThemeMode) => void
  setCurrency: (currency: CurrencyMode) => void
  toggleTheme: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleSidebarCollapsed: () => void
  openHelpPanel: () => void
  closeHelpPanel: () => void
  toggleHelpPanel: () => void
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      theme: 'light',
      currency: 'INR',
      isMobileSidebarOpen: false,
      isSidebarCollapsed: false,
      isHelpPanelOpen: false,

      setTheme(theme: ThemeMode): void {
        set({ theme })
      },

      setCurrency(currency: CurrencyMode): void {
        set({ currency })
      },

      toggleTheme(): void {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }))
      },

      openMobileSidebar(): void {
        set({ isMobileSidebarOpen: true })
      },

      closeMobileSidebar(): void {
        set({ isMobileSidebarOpen: false })
      },

      toggleSidebarCollapsed(): void {
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        }))
      },

      openHelpPanel(): void {
        set({ isHelpPanelOpen: true })
      },

      closeHelpPanel(): void {
        set({ isHelpPanelOpen: false })
      },

      toggleHelpPanel(): void {
        set((state) => ({
          isHelpPanelOpen: !state.isHelpPanelOpen,
        }))
      },
    }),
    {
      name: 'zorvyn-ui',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state =
          (persistedState as { readonly isSidebarCollapsed?: boolean } | undefined) ??
          undefined

        return {
          theme: 'light' as ThemeMode,
          currency: 'INR' as CurrencyMode,
          isSidebarCollapsed: state?.isSidebarCollapsed ?? false,
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
)
