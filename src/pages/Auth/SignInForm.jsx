import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GoogleLogo } from '../../components/icons'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { useAuth } from '../../context/AuthContext'
import { isEmailValid } from '../../utils/validation'
import PasswordField from './PasswordField'
import styles from './Auth.module.css'

export default function SignInForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!isEmailValid(email)) next.email = 'Enter a valid email address'
    if (!password) next.password = 'Enter your password'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      await signIn({ email, password })
      navigate(location.state?.from ?? '/pa/trading/accounts', { replace: true })
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Your email address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <PasswordField
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        error={errors.password}
      />

      {errors.form && (
        <p className={styles.formError} role="alert">
          {errors.form}
        </p>
      )}

      <div className={styles.submitBlock}>
        <Button type="submit" block disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <div className={styles.divider}>
          <span>Or sign in with</span>
        </div>
        <Button variant="secondary" block icon={<GoogleLogo />}>
          Google
        </Button>
        <a href="#" className={styles.forgot}>
          I forgot my password
        </a>
      </div>
    </form>
  )
}
