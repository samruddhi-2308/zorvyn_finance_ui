import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ROLES } from '@/constants'
import type { UserRole } from '@/types'

interface RoleStoreState {
  readonly currentRole: UserRole
  setRole: (role: UserRole) => void
  resetRole: () => void
}

export const useRoleStore = create<RoleStoreState>()(
  persist(
    (set) => ({
      currentRole: ROLES.VIEWER,

      setRole(role: UserRole): void {
        set({ currentRole: role })
      },

      resetRole(): void {
        set({ currentRole: ROLES.VIEWER })
      },
    }),
    {
      name: 'zorvyn-role',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentRole: state.currentRole,
      }),
    },
  ),
)
