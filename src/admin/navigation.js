import { Analytics, HelpCircle, List, ScanFace, Settings, Users } from '../components/icons'

// `area` ties each item to a role permission in api.js ROLES.
export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: Analytics, area: 'dashboard', end: true },
  { label: 'Clients', to: '/admin/clients', icon: Users, area: 'clients' },
  { label: 'ID checks', to: '/admin/kyc', icon: ScanFace, area: 'kyc', countKey: 'pendingKyc' },
  { label: 'Transactions', to: '/admin/transactions', icon: List, area: 'transactions', countKey: 'pendingWithdrawals' },
  { label: 'Support tickets', to: '/admin/tickets', icon: HelpCircle, area: 'tickets', countKey: 'openTickets' },
  { heading: 'Configuration', area: 'settings' },
  { label: 'Settings', to: '/admin/settings', icon: Settings, area: 'settings' },
]

export function findAdminTitle(pathname) {
  const matches = ADMIN_NAV.filter((n) => n.to && (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  return matches.sort((a, b) => b.to.length - a.to.length)[0]?.label ?? 'Admin'
}
