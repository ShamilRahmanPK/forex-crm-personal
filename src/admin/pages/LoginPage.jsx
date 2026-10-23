import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { useBrand } from '../../context/BrandContext'
import PasswordField from '../../pages/Auth/PasswordField'
import { useAdminAuth } from '../AdminAuth'
import styles from './Login.module.css'

export default function AdminLoginPage() {
  const brand = useBrand()
  const navigate = useNavigate()
  const location = useLocation()
  const { staff, signIn } = useAdminAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (staff) return <Navigate to="/admin" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn({ email, password })
      navigate(location.state?.from ?? '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          {brand.logo.text ?? brand.name}
          <span className={styles.pill}>Admin</span>
        </div>
        <h1 className={styles.title}>Staff sign in</h1>
        <p className={styles.lead}>Back office for {brand.name}. Client accounts can&apos;t sign in here.</p>
        <TextField label="Work email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" error={error} />
        <Button type="submit" block disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className={styles.hint}>
          Demo roles: admin@, compliance@, finance@ or support@example.com with any password.
        </p>
      </form>
    </div>
  )
}
