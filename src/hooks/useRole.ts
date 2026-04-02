import { useShallow } from 'zustand/react/shallow'
import { useRoleStore } from '@/store'
import type { UserRole } from '@/types'

interface UseRoleResult {
  readonly currentRole: UserRole
  readonly setRole: (role: UserRole) => void
  readonly resetRole: () => void
}

/**
 * Exposes the active role state and role mutators.
 */
export function useRole(): UseRoleResult {
  return useRoleStore(
    useShallow((state) => ({
      currentRole: state.currentRole,
      setRole: state.setRole,
      resetRole: state.resetRole,
    })),
  )
}
