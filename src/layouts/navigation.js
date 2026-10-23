import {
  Analytics,
  ArrowDownCircle,
  ArrowUpRightCircle,
  Calendar,
  Coins,
  FileText,
  HelpCircle,
  List,
  Lock,
  ScanFace,
  Signal,
  Transfer,
  Wallet,
} from '../components/icons'

// Sidebar sections. `external` opens in a new tab; `badge` renders a pill.
// The breadcrumb in the header is derived from this list too.
export const NAV_SECTIONS = [
  {
    id: 'trading',
    label: 'Trading',
    items: [
      { label: 'Accounts', to: '/pa/trading/accounts', icon: Wallet },
      { label: 'Performance', to: '/pa/trading/performance', icon: Signal },
      { label: 'Order history', to: '/pa/trading/history', icon: FileText },
    ],
  },
  {
    id: 'money',
    label: 'Money',
    items: [
      { label: 'Deposit', to: '/pa/payments-and-wallet/deposit', icon: ArrowDownCircle },
      { label: 'Withdraw', to: '/pa/payments-and-wallet/withdrawal', icon: ArrowUpRightCircle },
      { label: 'Transfer', to: '/pa/payments-and-wallet/transfer', icon: Transfer, badge: 'New' },
      { label: 'Transactions', to: '/pa/payments-and-wallet/history', icon: List },
      { label: 'Wallets', to: '/pa/payments-and-wallet/funding-wallet', icon: Coins },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Trading signals', to: '/pa/insights/trading-signals', icon: Analytics },
      { label: 'Economic calendar', to: '/pa/insights/economic-calendar', icon: Calendar },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { label: 'Verification', to: '/pa/profile/verification', icon: ScanFace },
      { label: 'Security', to: '/pa/profile/security', icon: Lock },
      { label: 'Support', to: '/pa/support', icon: HelpCircle },
    ],
  },
]

/** { section, item } for the current path (longest matching prefix). */
export function findNavItem(pathname) {
  let best = null
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (!item.external && pathname.startsWith(item.to) && (!best || item.to.length > best.item.to.length)) {
        best = { section, item }
      }
    }
  }
  return best
}
