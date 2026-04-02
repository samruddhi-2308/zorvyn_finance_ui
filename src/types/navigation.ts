export type NavigationItemId = 'dashboard' | 'transactions' | 'insights'

export interface NavigationItem {
  readonly id: NavigationItemId
  readonly label: string
  readonly href: string
}
