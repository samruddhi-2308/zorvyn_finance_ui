import type { UserRole } from '@/types/role'

export const ROLES: Record<UserRole, UserRole> = {
  VIEWER: 'VIEWER',
  ADMIN: 'ADMIN',
} as const
