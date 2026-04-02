import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'

interface UIStoreState {
  readonly theme: ThemeMode
  readonly isMobileSidebarOpen: boolean
  readonly isSidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleSidebarCollapsed: () => void
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      theme: 'light',
      isMobileSidebarOpen: false,
      isSidebarCollapsed: false,

      setTheme(theme: ThemeMode): void {
        set({ theme })
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
    }),
    {
      name: 'zorvyn-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
)
