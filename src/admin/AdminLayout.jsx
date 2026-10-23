import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Close, ExternalLink, Menu } from '../components/icons'
import { useBrand } from '../context/BrandContext'
import { useDismiss } from '../hooks/useDismiss'
import { useAdminAuth } from './AdminAuth'
import { getDashboard, ROLES } from './api'
import { ADMIN_NAV, findAdminTitle } from './navigation'
import styles from './AdminLayout.module.css'

const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** Back-office shell: dark sidebar, title bar, scrolling content. */
export default function AdminLayout() {
  const brand = useBrand()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { staff, can, signOut } = useAdminAuth()
  const [counts, setCounts] = useState({})
  const [drawer, setDrawer] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const contentRef = useRef(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useDismiss(menuRef, menuOpen, closeMenu)

  // Queue badges in the sidebar; refreshed on every navigation.
  useEffect(() => {
    let active = true
    getDashboard().then((d) => active && setCounts({ pendingKyc: d.pendingKyc, pendingWithdrawals: d.pendingWithdrawals.count, openTickets: d.openTickets }))
    contentRef.current?.scrollTo(0, 0)
    return () => {
      active = false
    }
  }, [pathname])

  const items = ADMIN_NAV.filter((n) => can(n.area))

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${drawer ? styles.sidebarOpen : ''}`} aria-label="Admin navigation">
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.brandName}>{brand.logo.text ?? brand.name}</span>
          <span className={styles.adminPill}>Admin</span>
          <button type="button" className={styles.closeDrawer} onClick={() => setDrawer(false)} aria-label="Close menu">
            <Close size={20} />
          </button>
        </div>
        <nav className={styles.nav}>
          {items.map((item) =>
            item.heading ? (
              <p key={item.heading} className={styles.heading}>
                {item.heading}
              </p>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setDrawer(false)}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <item.icon size={19} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.countKey && counts[item.countKey] > 0 && <span className={styles.count}>{counts[item.countKey]}</span>}
              </NavLink>
            ),
          )}
        </nav>
        <a href="/pa/trading/accounts" target="_blank" rel="noreferrer" className={styles.portalLink}>
          Open client portal <ExternalLink size={16} />
        </a>
      </aside>
      {drawer && <div className={styles.backdrop} onClick={() => setDrawer(false)} />}

      <div className={styles.column}>
        <header className={styles.header}>
          <button type="button" className={styles.menuButton} onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <h1 className={styles.title}>{findAdminTitle(pathname)}</h1>
          <div className={styles.userMenu} ref={menuRef}>
            <button type="button" className={styles.userButton} onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <span className={styles.avatar}>{initials(staff.name)}</span>
              <span className={styles.userText}>
                <strong>{staff.name}</strong>
                <small>{ROLES[staff.role]?.label}</small>
              </span>
            </button>
            {menuOpen && (
              <div className={styles.popover} role="menu">
                <p className={styles.popoverEmail}>{staff.email}</p>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.popoverItem}
                  onClick={() => {
                    signOut()
                    navigate('/admin/login', { replace: true })
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className={styles.content} ref={contentRef}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
