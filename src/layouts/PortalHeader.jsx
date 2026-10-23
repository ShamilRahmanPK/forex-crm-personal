import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu } from '../components/icons'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useDismiss } from '../hooks/useDismiss'
import { findNavItem } from './navigation'
import styles from './PortalLayout.module.css'
import WalletMenu from './WalletMenu'

const initials = (email = '') => email.slice(0, 2).toUpperCase()

export default function PortalHeader({ onOpenMenu }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useDismiss(menuRef, menuOpen, closeMenu)

  const crumb = findNavItem(pathname)
  const go = (path) => {
    closeMenu()
    navigate(path)
  }

  return (
    <header className={styles.header}>
      <button type="button" className={`${styles.iconButton} ${styles.menuButton}`} onClick={onOpenMenu} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <span className={styles.mobileLogo}>
        <Logo size="sm" to="/pa/trading/accounts" />
      </span>

      {crumb && (
        <p className={styles.breadcrumb}>
          {crumb.section.label} / <span>{crumb.item.label}</span>
        </p>
      )}

      <div className={styles.headerRight}>
        <WalletMenu />
        <Button className={styles.headerDeposit} to="/pa/payments-and-wallet/deposit">
          Deposit
        </Button>
        <button type="button" className={`${styles.iconButton} ${styles.hideMobile}`} aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.avatar}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {initials(user?.email)}
          </button>
          {menuOpen && (
            <div className={styles.popover} role="menu">
              <p className={styles.popoverEmail}>{user?.email}</p>
              <button type="button" role="menuitem" className={styles.popoverItem} onClick={() => go('/pa/profile/verification')}>
                Verification
              </button>
              <button type="button" role="menuitem" className={styles.popoverItem} onClick={() => go('/pa/profile/security')}>
                Security
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.popoverItem}
                onClick={() => {
                  signOut()
                  navigate('/', { replace: true })
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
