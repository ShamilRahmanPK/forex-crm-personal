import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Trash } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Checkbox from '../../components/ui/Checkbox'
import ChoiceList from '../../components/ui/ChoiceList'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import { useVerification } from '../../features/verification/VerificationContext'
import * as api from '../../services/api'
import { maskEmail } from '../../utils/format'
import { isPasswordValid } from '../../utils/validation'
import PasswordField from '../Auth/PasswordField'
import page from '../../styles/page.module.css'
import styles from './Security.module.css'

const TWO_FA_KEY = 'crm.twoFactorMethod'

function readMethod() {
  try {
    return localStorage.getItem(TWO_FA_KEY) ?? 'email'
  } catch {
    return 'email'
  }
}

function ChangePasswordModal({ onClose, onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!isPasswordValid(next)) return setError('New password does not meet the requirements')
    setSaving(true)
    setError('')
    try {
      await api.changeLoginPassword({ current, next })
      onDone()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Change password"
      showClose
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" disabled={saving}>
            {saving ? 'Saving…' : 'Change password'}
          </Button>
        </>
      }
    >
      <form id="password-form" className={styles.form} onSubmit={submit} noValidate>
        <PasswordField value={current} onChange={setCurrent} autoComplete="current-password" label="Current password" data-autofocus />
        <PasswordField value={next} onChange={setNext} autoComplete="new-password" maxLength={15} showRules label="New password" error={error} />
      </form>
    </Modal>
  )
}

export default function SecurityPage() {
  const brand = useBrand()
  const toast = useToast()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { status } = useVerification()
  const [dialog, setDialog] = useState(null) // 'password' | '2fa' | 'logout' | 'terminate'
  const [method, setMethod] = useState(readMethod)
  const [pendingMethod, setPendingMethod] = useState(method)
  const [understood, setUnderstood] = useState(false)
  const [busy, setBusy] = useState(false)

  const phone = typeof status.phone === 'string' ? status.phone : null
  const methodLabel = method === 'sms' && phone ? `SMS to ${phone.slice(0, 4)}•••${phone.slice(-3)}` : maskEmail(user.email)
  const close = () => {
    setDialog(null)
    setUnderstood(false)
  }

  async function saveMethod() {
    setBusy(true)
    await api.setTwoFactorMethod(pendingMethod)
    try {
      localStorage.setItem(TWO_FA_KEY, pendingMethod)
    } catch {
      // ignore
    }
    setMethod(pendingMethod)
    setBusy(false)
    close()
    toast('Verification method updated')
  }

  async function logoutOthers() {
    setBusy(true)
    await api.logoutOtherDevices()
    setBusy(false)
    close()
    toast('You have been logged out from all other devices')
  }

  async function terminate() {
    setBusy(true)
    await api.terminateAccount()
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className={page.page}>
      <h1 className={page.title}>Security</h1>

      <section className={styles.section}>
        <h2 className={page.sectionTitle}>Login details</h2>
        <p className={styles.intro}>
          Information for signing in to {brand.name}.
          <br />
          Change your password whenever you think it might have been compromised.
        </p>
        <div className={page.card}>
          <div className={`${page.cardRow} ${styles.row}`}>
            <span>Login</span>
            <strong>{maskEmail(user.email)}</strong>
          </div>
          <div className={`${page.cardRow} ${styles.row}`}>
            <span>Password</span>
            <strong aria-label="Hidden">••••••••••••</strong>
            <Button variant="secondary" onClick={() => setDialog('password')}>
              Change
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={page.sectionTitle}>2-step verification</h2>
        <p className={styles.intro}>
          2-step verification makes sure sensitive actions are authorised by you.
          <br />
          We&apos;ll send a code to confirm them.
        </p>
        <div className={page.card}>
          <div className={`${page.cardRow} ${styles.row}`}>
            <span>Verification method</span>
            <strong>{methodLabel}</strong>
            <Button
              variant="secondary"
              onClick={() => {
                setPendingMethod(method)
                setDialog('2fa')
              }}
            >
              Change
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={page.sectionTitle}>Device & account security</h2>
        <div className={`${page.card} ${styles.dangerCard}`}>
          <div className={`${page.cardRow} ${styles.dangerRow}`}>
            <span>Log out from all other devices except this one to secure your account.</span>
            <Button variant="secondary" className={styles.danger} icon={<LogOut />} onClick={() => setDialog('logout')}>
              Log out from other devices
            </Button>
          </div>
          <div className={`${page.cardRow} ${styles.dangerRow}`}>
            <span>Permanently close your {brand.name} account. This action cannot be reversed.</span>
            <Button variant="secondary" className={styles.danger} icon={<Trash />} onClick={() => setDialog('terminate')}>
              Close {brand.name} account
            </Button>
          </div>
        </div>
      </section>

      {dialog === 'password' && (
        <ChangePasswordModal
          onClose={close}
          onDone={() => {
            close()
            toast('Password changed')
          }}
        />
      )}

      {dialog === '2fa' && (
        <Modal
          open
          onClose={close}
          title="Verification method"
          subtitle="Choose where we send your confirmation codes"
          showClose
          width={560}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={saveMethod} disabled={busy || pendingMethod === method}>
                Save
              </Button>
            </>
          }
        >
          <ChoiceList
            name="two-factor"
            label="Verification method"
            options={[
              { value: 'email', label: `Email: ${maskEmail(user.email)}` },
              { value: 'sms', label: phone ? `SMS: ${phone}` : 'SMS', hint: phone ? undefined : 'Confirm your phone number first' },
            ].filter((o) => o.value !== 'sms' || phone)}
            value={pendingMethod}
            onChange={setPendingMethod}
          />
        </Modal>
      )}

      {dialog === 'logout' && (
        <Modal
          open
          onClose={close}
          title="Log out from other devices?"
          subtitle="Everyone signed in to your account on other devices or browsers will be signed out."
          showClose
          width={560}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={logoutOthers} disabled={busy}>
                Log out other devices
              </Button>
            </>
          }
        />
      )}

      {dialog === 'terminate' && (
        <Modal
          open
          onClose={close}
          title={`Close your ${brand.name} account?`}
          subtitle="Withdraw your funds first. Your trading accounts will be archived and you won't be able to sign in again."
          showClose
          width={600}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Keep my account
              </Button>
              <Button className={styles.dangerSolid} onClick={terminate} disabled={!understood || busy}>
                Close account
              </Button>
            </>
          }
        >
          <Checkbox checked={understood} onChange={setUnderstood}>
            I understand this action is permanent and cannot be reversed.
          </Checkbox>
        </Modal>
      )}
    </div>
  )
}
