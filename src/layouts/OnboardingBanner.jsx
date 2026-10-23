import { useLocation } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import { useVerification } from '../features/verification/VerificationContext'
import { contactDone, docState, profileDone, progress } from '../features/verification/stages'
import styles from './OnboardingBanner.module.css'

// The verification page shows its own status, so the notice would be redundant.
const HIDDEN_ON = ['/pa/profile/verification']
const STEP_COUNT = 5

/** Picks the notice text for the user's next onboarding stage; null when done. */
function noticeFor(status, copy) {
  if (!status.email) return [copy.onboardingBanner]
  if (!profileDone(status)) return copy.bannerProfile
  if (!contactDone(status)) return copy.bannerPhone
  const identity = docState(status.identity)
  if (identity === 'pending') return copy.bannerIdentityPending
  if (identity !== 'approved') return copy.bannerIdentity
  const address = docState(status.address)
  if (address === 'pending') return copy.bannerAddressPending
  if (address !== 'approved') return copy.bannerAddress
  return null
}

/** Verification notice shown at the top of portal pages until fully verified. */
export default function OnboardingBanner() {
  const { copy } = useBrand()
  const { pathname } = useLocation()
  const { status, startVerification } = useVerification()

  const notice = noticeFor(status, copy)
  if (!notice || HIDDEN_ON.includes(pathname)) return null

  const [title, subtitle] = notice
  const done = Math.round(progress(status) * STEP_COUNT)

  return (
    <section className={styles.notice} aria-label="Account verification">
      <span className={styles.icon} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z" />
        </svg>
      </span>
      <p className={styles.text}>
        <strong>{title}</strong>
        {subtitle && <span> · {subtitle}</span>}
      </p>
      <div className={styles.steps} aria-label={`${done} of ${STEP_COUNT} steps complete`}>
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span key={i} className={i < done ? styles.stepDone : styles.step} />
        ))}
      </div>
      <button type="button" className={styles.cta} onClick={startVerification}>
        {done === 0 ? 'Start verification' : 'Continue'}
      </button>
    </section>
  )
}
