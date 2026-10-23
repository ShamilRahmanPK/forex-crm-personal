import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ChatFab from '../components/ChatFab'
import LegalFooter from '../components/LegalFooter'
import { useBrand } from '../context/BrandContext'
import { useVerification } from '../features/verification/VerificationContext'
import OnboardingBanner from './OnboardingBanner'
import PortalHeader from './PortalHeader'
import Sidebar from './Sidebar'
import styles from './PortalLayout.module.css'

const COLLAPSE_KEY = 'crm.sidebarCollapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

/** Authenticated shell: header, sidebar, onboarding banner and page outlet. */
export default function PortalLayout() {
  const brand = useBrand()
  const { isVerified, promptOnce } = useVerification()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const contentRef = useRef(null)

  // The content pane scrolls, not the window, so reset it on navigation.
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [collapsed])

  // Ask unverified users to verify once per session, shortly after landing.
  useEffect(() => {
    if (isVerified) return
    const t = setTimeout(promptOnce, 800)
    return () => clearTimeout(t)
  }, [isVerified, promptOnce])

  return (
    <div className={styles.shell}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNavigate={() => setMobileOpen(false)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}
      <div className={styles.column}>
        <PortalHeader onOpenMenu={() => setMobileOpen(true)} />
        <main className={styles.content} ref={contentRef}>
          <OnboardingBanner />
          <Outlet />
          <div className={styles.footer}>
            <LegalFooter links={brand.legalLinks.portal} />
          </div>
        </main>
      </div>
      <ChatFab />
    </div>
  )
}
