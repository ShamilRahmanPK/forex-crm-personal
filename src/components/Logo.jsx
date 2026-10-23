import { Link } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import styles from './Logo.module.css'

const SCALE = { sm: 0.8, md: 1, lg: 1.5 }

// Renders brand.logo.src as an image when set, otherwise the ring mark +
// text wordmark.
export default function Logo({ size = 'md', to = '/' }) {
  const { name, logo } = useBrand()

  return (
    <Link to={to} className={`${styles.logo} ${styles[size]}`} aria-label={`${name} home`}>
      {logo.src ? (
        <img src={logo.src} alt={logo.alt ?? name} style={{ height: logo.height * SCALE[size] }} className={styles.image} />
      ) : (
        <>
          {logo.mark && <span className={styles.mark} aria-hidden="true" />}
          {logo.text ?? name}
        </>
      )}
    </Link>
  )
}
