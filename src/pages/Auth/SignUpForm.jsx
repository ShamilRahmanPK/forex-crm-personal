import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, GoogleLogo } from '../../components/icons'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import TextField from '../../components/ui/TextField'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import { isEmailValid, isPasswordValid } from '../../utils/validation'
import PasswordField from './PasswordField'
import styles from './Auth.module.css'

export default function SignUpForm() {
  const { signUp } = useAuth()
  const brand = useBrand()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [partnerCode, setPartnerCode] = useState('')
  const [declared, setDeclared] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!isEmailValid(email)) next.email = 'Enter a valid email address'
    if (!isPasswordValid(password)) next.password = 'Password does not meet the requirements'
    if (!declared) next.declared = 'You must confirm this declaration to register'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      await signUp({ email, password, partnerCode })
      navigate('/pa/trading/accounts', { replace: true })
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
        autoComplete="new-password"
        maxLength={15}
        showRules
        error={errors.password}
      />

      <div className={styles.partner}>
        <button
          type="button"
          className={styles.partnerToggle}
          onClick={() => setPartnerOpen((o) => !o)}
          aria-expanded={partnerOpen}
        >
          Partner code (optional)
          <ChevronDown size={20} className={partnerOpen ? styles.rotated : undefined} />
        </button>
        {partnerOpen && (
          <TextField
            label="Partner code"
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            className={styles.partnerField}
          />
        )}
      </div>

      <div>
        <Checkbox checked={declared} onChange={setDeclared}>
          {brand.copy.signUpDeclaration}
        </Checkbox>
        {errors.declared && (
          <p className={styles.formError} role="alert">
            {errors.declared}
          </p>
        )}
      </div>

      {errors.form && (
        <p className={styles.formError} role="alert">
          {errors.form}
        </p>
      )}

      <div className={`${styles.submitBlock} ${styles.submitBlockSpaced}`}>
        <Button type="submit" block disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </Button>
        <div className={styles.divider}>
          <span>Or create an account with</span>
        </div>
        <Button variant="secondary" block icon={<GoogleLogo />}>
          Google
        </Button>
      </div>

      <div className={styles.terms}>
        <p>You are registering with {brand.name}.</p>
        <p className={styles.termsStrong}>
          By clicking Register, you confirm that you have read, understood, and agree with all the
          terms and conditions listed in the following documents:{' '}
          {brand.legalLinks.signUp.map((link, i) => (
            <span key={link.label}>
              {i > 0 && ', '}
              <a href={link.href}>{link.label}</a>
            </span>
          ))}
          .
        </p>
      </div>
    </form>
  )
}
