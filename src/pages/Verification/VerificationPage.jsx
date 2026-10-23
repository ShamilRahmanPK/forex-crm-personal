import { useState } from 'react'
import { ChevronDown, UserCircle } from '../../components/icons'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import { useVerification } from '../../features/verification/VerificationContext'
import { docState, personalDone, stepsComplete } from '../../features/verification/stages'
import { maskEmail } from '../../utils/format'
import page from '../../styles/page.module.css'
import styles from './Verification.module.css'

const RADIUS = 25
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const maskPhone = (p = '') => (p.length > 8 ? `${p.slice(0, 4)}${'*'.repeat(p.length - 8)}${p.slice(-4)}` : p)

const BADGES = {
  approved: { label: 'Verified', className: page.statusDone },
  pending: { label: 'Under review', className: page.statusPending },
  rejected: { label: 'Rejected', className: page.statusRejected },
}

function Step({ number, title, summary, state, disabled, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const badge = BADGES[state]
  const done = state === 'approved'
  const expandable = !done && !disabled

  return (
    <section className={`${styles.step} ${disabled ? styles.stepDisabled : ''}`}>
      <button
        type="button"
        className={styles.stepHead}
        onClick={() => expandable && setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        disabled={disabled}
      >
        <span className={`${styles.number} ${done ? styles.numberDone : ''}`}>{number}</span>
        <span className={styles.stepTitle}>
          {title}
          {summary && <small>{summary}</small>}
        </span>
        {badge && <span className={`${page.status} ${badge.className}`}>{badge.label}</span>}
        {expandable && <ChevronDown size={20} className={open ? styles.rotated : undefined} />}
      </button>
      {expandable && open && <div className={styles.stepBody}>{children}</div>}
    </section>
  )
}

export default function VerificationPage() {
  const brand = useBrand()
  const { user } = useAuth()
  const { status, startVerification, startIdentity, startAddress } = useVerification()

  const personal = personalDone(status)
  const identity = docState(status.identity)
  const address = docState(status.address)
  const complete = stepsComplete(status)
  const profile = typeof status.profile === 'object' ? status.profile : null
  const name = profile ? `${profile.firstName} ${profile.lastName}` : null

  const level = complete === 3 ? 'Fully verified' : complete === 0 ? 'Not verified' : 'Partially verified'
  const limit = address === 'approved' ? brand.depositLimits.full : identity === 'approved' ? brand.depositLimits.identity : brand.depositLimits.unverified
  const levelClass = complete === 3 ? page.positive : styles.partial

  return (
    <div className={page.page}>
      <h1 className={page.title}>Verification</h1>

      <h2 className={`${page.sectionTitle} ${styles.heading}`}>Account</h2>
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.ring}>
            <svg viewBox="0 0 56 56" aria-hidden="true" className={styles.ringSvg}>
              <circle cx="28" cy="28" r={RADIUS} className={styles.track} />
              <circle cx="28" cy="28" r={RADIUS} className={styles.progress} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - complete / 3)} />
            </svg>
            <UserCircle size={28} />
          </span>
          <div>
            <p className={styles.cardLabel}>Status</p>
            <p className={`${styles.cardValue} ${levelClass}`}>{level}</p>
            <p className={styles.cardHint}>{complete}/3 steps complete</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div>
            <p className={styles.cardLabel}>Deposit limit</p>
            <p className={styles.cardValue}>{limit === null ? 'Unlimited' : `${limit.toLocaleString('en-US')} USD`}</p>
            <p className={styles.cardHint}>{limit === null ? 'Your account is fully verified' : 'Verify your account to unlock higher limits'}</p>
          </div>
        </div>
      </div>

      <h2 className={`${page.sectionTitle} ${styles.heading}`}>Verification steps</h2>
      <div className={styles.steps}>
        <Step
          key={`1-${personal}`}
          number={1}
          title="Personal details"
          summary={personal ? [maskEmail(user.email), status.phone && maskPhone(String(status.phone))].filter(Boolean).join(', ') : 'Confirm your contact details and complete your profile'}
          state={personal ? 'approved' : undefined}
          defaultOpen={!personal}
        >
          <p className={styles.bodyText}>Confirm your email and phone number, then tell us a little about yourself.</p>
          <Button onClick={startVerification}>Continue</Button>
        </Step>

        <Step
          key={`2-${personal}-${identity}`}
          number={2}
          title="Identity verification"
          state={identity === 'none' ? undefined : identity}
          disabled={!personal}
          defaultOpen={personal && identity !== 'approved'}
        >
          {identity === 'pending' ? (
            <p className={styles.bodyText}>We&apos;re reviewing your document. This usually takes a few minutes.</p>
          ) : (
            <>
              <p className={styles.bodyLabel}>Provide a document verifying your name</p>
              <p className={styles.bodyValue}>{name}</p>
              <Button onClick={startIdentity}>{identity === 'rejected' ? 'Try again' : 'Verify now'}</Button>
            </>
          )}
        </Step>

        <Step
          key={`3-${identity}-${address}`}
          number={3}
          title="Residential address verification"
          state={address === 'none' ? undefined : address}
          disabled={identity !== 'approved'}
          defaultOpen={identity === 'approved' && address !== 'approved'}
        >
          {address === 'pending' ? (
            <p className={styles.bodyText}>We&apos;re reviewing your document. This usually takes a few minutes.</p>
          ) : (
            <>
              <p className={styles.bodyLabel}>Provide a document confirming your address</p>
              <p className={styles.bodyValue}>{profile?.address}</p>
              <Button onClick={startAddress}>Verify now</Button>
            </>
          )}
        </Step>
      </div>
    </div>
  )
}
