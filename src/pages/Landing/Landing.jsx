import { Navigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import Button from '../../components/ui/Button'
import { fillCopy } from '../../config/brand'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import styles from './Landing.module.css'

export default function Landing() {
  const { user } = useAuth()
  const brand = useBrand()
  if (user) return <Navigate to="/pa/trading/accounts" replace />

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Logo size="md" />
        <p className={styles.lead}>{fillCopy(brand.copy.landingLead, brand)}</p>
        <div className={styles.actions}>
          <Button to="/accounts/sign-up" size="lg" block>
            Register
          </Button>
          <Button to="/accounts/sign-in" size="lg" variant="secondary" block>
            Sign in
          </Button>
        </div>
        <a className={styles.support} href={`mailto:${brand.supportEmail}`}>
          {brand.supportEmail}
        </a>
      </main>
      <footer className={styles.footer}>
        <p>{brand.regulatoryShort}</p>
      </footer>
    </div>
  )
}
