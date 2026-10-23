import { NavLink } from 'react-router-dom'
import { ChevronsLeft, Close, ExternalLink } from '../components/icons'
import Logo from '../components/Logo'
import { NAV_SECTIONS } from './navigation'
import styles from './PortalLayout.module.css'

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  const content = (
    <>
      <Icon size={20} />
      <span className={styles.navLabel}>{item.label}</span>
      {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
      {item.external && <ExternalLink size={16} className={styles.navExternal} />}
    </>
  )

  if (item.external) {
    return (
      <a href={item.to} target="_blank" rel="noreferrer" className={styles.navItem} title={collapsed ? item.label : undefined}>
        {content}
      </a>
    )
  }

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
    >
      {content}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onNavigate, onCloseMobile }) {
  const classes = [styles.sidebar, collapsed && styles.sidebarCollapsed, mobileOpen && styles.sidebarMobileOpen]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={classes} aria-label="Main navigation">
      <div className={styles.sidebarHead}>
        <Logo size="sm" to="/pa/trading/accounts" />
        <button type="button" className={styles.closeDrawer} onClick={onCloseMobile} aria-label="Close menu">
          <Close size={22} />
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className={styles.navSection}>
            <p className={styles.navHeading}>{section.label}</p>
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <button
        type="button"
        className={styles.collapseButton}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronsLeft size={20} className={collapsed ? styles.flipped : undefined} />
      </button>
    </aside>
  )
}
