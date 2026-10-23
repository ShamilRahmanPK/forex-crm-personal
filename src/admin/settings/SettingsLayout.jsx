import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { SETTINGS_SECTIONS } from './sections'
import styles from './Settings.module.css'

const ALL = SETTINGS_SECTIONS.flatMap((g) => g.items)

/** Settings area: section menu on the left (a select on phones), page on the right. */
export default function SettingsLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = ALL.find((i) => pathname.endsWith(`/settings/${i.to}`))?.to ?? ''

  return (
    <div className={styles.layout}>
      <nav className={styles.menu} aria-label="Settings sections">
        {SETTINGS_SECTIONS.map((g) => (
          <div key={g.group} className={styles.menuGroup}>
            <p className={styles.menuHeading}>{g.group}</p>
            {g.items.map((i) => (
              <NavLink key={i.to} to={i.to} className={({ isActive }) => `${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}>
                {i.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <label className={styles.mobileMenu}>
        <span className="visually-hidden">Settings section</span>
        <select value={current} onChange={(e) => navigate(e.target.value)}>
          {SETTINGS_SECTIONS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((i) => (
                <option key={i.to} value={i.to}>
                  {i.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className={styles.page}>
        <Outlet />
      </div>
    </div>
  )
}
