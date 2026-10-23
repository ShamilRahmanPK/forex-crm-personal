import { NavLink, Navigate } from 'react-router-dom'
import ChatFab from '../../components/ChatFab'
import { Globe } from '../../components/icons'
import LegalFooter from '../../components/LegalFooter'
import Logo from '../../components/Logo'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import styles from './Auth.module.css'

const tabClass = ({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`

export default function AuthPage({ mode }) {
  const { user } = useAuth()
  const brand = useBrand()
  if (user) return <Navigate to="/pa/trading/accounts" replace />

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <button type="button" className={styles.iconButton} aria-label="Change language">
          <Globe size={22} />
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to {brand.name}</h1>

        <nav className={styles.tabs} aria-label="Authentication">
          <NavLink to="/accounts/sign-in" className={tabClass} replace>
            Sign in
          </NavLink>
          <NavLink to="/accounts/sign-up" className={tabClass} replace>
            Create an account
          </NavLink>
        </nav>

        {mode === 'sign-up' ? <SignUpForm /> : <SignInForm />}
      </main>

      {mode === 'sign-in' && (
        <div className={styles.footerWrap}>
          <LegalFooter links={brand.legalLinks.auth} />
        </div>
      )}

      <ChatFab />
    </div>
  )
}
