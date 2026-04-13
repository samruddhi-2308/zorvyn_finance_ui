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
      currentRole: ROLES.ADMIN,

      setRole(role: UserRole): void {
        set({ currentRole: role })
      },

      resetRole(): void {
        set({ currentRole: ROLES.ADMIN })
      },
    }),
    {
      name: 'findash-role',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({
        currentRole: ROLES.ADMIN,
      }),
      partialize: (state) => ({
        currentRole: state.currentRole,
      }),
    },
  ),
)
