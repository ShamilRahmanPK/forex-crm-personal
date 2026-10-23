import { useCallback, useEffect, useState } from 'react'
import { AtSign } from '../../components/icons'
import Modal from '../../components/ui/Modal'
import OtpInput from '../../components/ui/OtpInput'
import * as api from '../../services/api'
import styles from './Verification.module.css'

const CODE_LENGTH = 6
const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** "Enter the code we sent to …" dialog with countdown and resend. */
export default function CodeStep({ title, subtitle, target, send, onVerified, onBack, onClose }) {
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const requestCode = useCallback(async () => {
    setError('')
    try {
      const { resendIn } = await send()
      setSecondsLeft(resendIn)
    } catch (err) {
      setError(err.message)
    }
  }, [send])

  // Send the first code when the dialog opens.
  useEffect(() => {
    let active = true
    send()
      .then(({ resendIn }) => active && setSecondsLeft(resendIn))
      .catch((err) => active && setError(err.message))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  async function handleChange(next) {
    setCode(next)
    setError('')
    if (next.length !== CODE_LENGTH) return
    setChecking(true)
    try {
      await api.verifyCode(next)
      onVerified()
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      setChecking(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={title} subtitle={subtitle} showClose>
      <div className={styles.target}>
        <AtSign size={28} />
        <p>
          Enter the code we sent to:
          <br />
          <strong>{target}</strong>
        </p>
      </div>

      <div className={styles.otp}>
        <OtpInput length={CODE_LENGTH} value={code} onChange={handleChange} invalid={Boolean(error)} disabled={checking} />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {checking && <p className={styles.muted}>Checking code…</p>}
      </div>

      <p className={styles.timer} aria-live="polite">
        {secondsLeft > 0 ? (
          <>
            Get a new code in <strong>{formatTimer(secondsLeft)}</strong>
          </>
        ) : (
          <button type="button" className={styles.linkButton} onClick={requestCode}>
            Send a new code
          </button>
        )}
      </p>

      <button type="button" className={styles.linkButton} onClick={() => setShowHelp((v) => !v)} aria-expanded={showHelp}>
        I didn&apos;t receive a code
      </button>
      {showHelp && (
        <ul className={styles.help}>
          <li>Check your spam or junk folder.</li>
          <li>Make sure {target} is correct.</li>
          <li>Wait for the timer to finish and request a new code.</li>
        </ul>
      )}

      {onBack && (
        <button type="button" className={`${styles.linkButton} ${styles.back}`} onClick={onBack}>
          Use a different number
        </button>
      )}
    </Modal>
  )
}
