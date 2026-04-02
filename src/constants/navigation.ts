import type { NavigationItem } from '@/types/navigation'

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '#dashboard-overview',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    href: '#transactions-overview',
  },
  {
    id: 'insights',
    label: 'Insights',
    href: '#insights-overview',
  },
] as const
