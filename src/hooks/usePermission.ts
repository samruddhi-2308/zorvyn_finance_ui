import { useMemo } from 'react'
import { useRole } from '@/hooks/useRole'
import type { UserRole } from '@/types'

export type PermissionAction = 'read' | 'create' | 'update' | 'delete'

const ROLE_PERMISSIONS: Record<UserRole, readonly PermissionAction[]> = {
  ADMIN: ['read', 'create', 'update', 'delete'],
  VIEWER: ['read'],
}

/**
 * Checks whether the active role is allowed to perform the given action.
 * @param action - Permission action to evaluate.
 * @returns True when allowed, otherwise false.
 */
export function usePermission(action: PermissionAction): boolean {
  const { currentRole } = useRole()

  return useMemo<boolean>(
    () => ROLE_PERMISSIONS[currentRole].includes(action),
    [action, currentRole],
  )
}
