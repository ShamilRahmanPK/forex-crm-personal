import { useState } from 'react'
import { CheckCircle, Clipboard, Lock, Mail, Phone } from '../../components/icons'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TextField from '../../components/ui/TextField'
import { QUESTIONNAIRE } from '../../config/questionnaire'
import * as api from '../../services/api'
import { maskEmail } from '../../utils/format'
import CodeStep from './CodeStep'
import { AddressUpload, DocumentsSubmitted, IdentityConsent, IdentityIntro, IdentityUpload } from './DocumentSteps'
import ProfileStep from './ProfileStep'
import QuestionStep from './QuestionStep'
import { profileDone } from './stages'
import styles from './Verification.module.css'

const STEPS = [
  { id: 'email', icon: Mail, title: 'Confirm email address', action: 'Confirm email' },
  { id: 'phone', icon: Phone, title: 'Confirm phone number', hint: 'Make your account more secure', action: 'Confirm phone' },
  { id: 'profile', icon: Clipboard, title: 'Add profile information', hint: 'Get a more tailored experience', action: 'Add profile' },
]

const isStepDone = (status, id) => (id === 'profile' ? profileDone(status) : Boolean(status[id]))

/**
 * Controlled by VerificationProvider: `view` is null when closed, otherwise
 * 'overview' | 'email' | 'phone-number' | 'phone-code' | 'profile' | 'question' | 'complete'
 * | 'kyc-intro' | 'kyc-consent' | 'kyc-upload' | 'kyc-submitted' | 'address-upload' | 'address-submitted'.
 * Questionnaire answers and position live here so closing and reopening resumes.
 */
export default function VerificationFlow({ view, setView, status, onComplete, email }) {
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [sending, setSending] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const close = () => setView(null)

  function startStep(id) {
    if (id === 'email') setView('email')
    else if (id === 'phone') setView('phone-number')
    else setView(status.profile ? 'question' : 'profile')
  }

  async function submitPhone(e) {
    e.preventDefault()
    setSending(true)
    setPhoneError('')
    try {
      await api.sendPhoneCode(phone)
      setView('phone-code')
    } catch (err) {
      setPhoneError(err.message)
    } finally {
      setSending(false)
    }
  }

  async function nextQuestion() {
    if (questionIndex < QUESTIONNAIRE.length - 1) {
      setQuestionIndex((i) => i + 1)
      return
    }
    setSubmitting(true)
    try {
      onComplete('questionnaire', await api.submitQuestionnaire(answers))
      setView('complete')
    } finally {
      setSubmitting(false)
    }
  }

  function previousQuestion() {
    if (questionIndex === 0) setView('profile')
    else setQuestionIndex((i) => i - 1)
  }

  if (!view) return null

  if (view === 'email') {
    return (
      <CodeStep
        title="Confirm your email"
        subtitle="We've sent you an email with a verification code"
        target={maskEmail(email)}
        send={api.sendEmailCode}
        onVerified={() => {
          onComplete('email')
          setView('overview')
        }}
        onClose={close}
      />
    )
  }

  if (view === 'phone-number') {
    return (
      <Modal
        open
        onClose={close}
        title="Confirm your phone number"
        subtitle="We'll send a verification code by SMS"
        showClose
        footer={
          <>
            <Button variant="secondary" onClick={() => setView('overview')}>
              Back
            </Button>
            <Button type="submit" form="phone-form" disabled={sending}>
              {sending ? 'Sending…' : 'Send code'}
            </Button>
          </>
        }
      >
        <form id="phone-form" onSubmit={submitPhone} noValidate>
          <TextField
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+971 50 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={phoneError}
            data-autofocus
          />
        </form>
      </Modal>
    )
  }

  if (view === 'phone-code') {
    return (
      <CodeStep
        title="Confirm your phone"
        subtitle="We've sent you an SMS with a verification code"
        target={phone}
        send={() => api.sendPhoneCode(phone)}
        onVerified={() => {
          onComplete('phone', phone)
          setView(status.profile ? 'question' : 'profile')
        }}
        onBack={() => setView('phone-number')}
        onClose={close}
      />
    )
  }

  if (view === 'profile') {
    return (
      <ProfileStep
        initial={typeof status.profile === 'object' ? status.profile : undefined}
        onSaved={(profile) => {
          onComplete('profile', profile)
          setView('question')
        }}
        onLater={close}
        onClose={close}
      />
    )
  }

  if (view === 'question') {
    const question = QUESTIONNAIRE[questionIndex]
    return (
      <QuestionStep
        key={question.id}
        question={question}
        index={questionIndex}
        total={QUESTIONNAIRE.length}
        answer={answers[question.id]}
        onAnswer={(a) => setAnswers((prev) => ({ ...prev, [question.id]: a }))}
        onBack={previousQuestion}
        onNext={nextQuestion}
        onClose={close}
        submitting={submitting}
      />
    )
  }

  if (view === 'complete') {
    return (
      <Modal
        open
        onClose={close}
        icon={<CheckCircle size={64} strokeWidth="1.4" />}
        title="Profile details complete"
        subtitle="You're almost there. Verify your identity to start depositing and trading."
        showClose
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Do it later
            </Button>
            <Button onClick={() => setView('kyc-intro')}>Verify identity now</Button>
          </>
        }
      />
    )
  }

  const profile = typeof status.profile === 'object' ? status.profile : null

  if (view === 'kyc-intro') {
    return (
      <IdentityIntro
        profile={profile}
        onSaveName={(firstName, lastName) => onComplete('profile', { ...profile, firstName, lastName })}
        onContinue={() => setView('kyc-consent')}
        onClose={close}
      />
    )
  }

  if (view === 'kyc-consent') {
    return <IdentityConsent onContinue={() => setView('kyc-upload')} onClose={close} />
  }

  if (view === 'kyc-upload') {
    return (
      <IdentityUpload
        profile={profile}
        onSubmitted={(result) => {
          onComplete('identity', result)
          setView('kyc-submitted')
        }}
        onBack={() => setView('kyc-intro')}
        onClose={close}
      />
    )
  }

  if (view === 'kyc-submitted') {
    return <DocumentsSubmitted title="Documents submitted" onClose={close} />
  }

  if (view === 'address-upload') {
    return (
      <AddressUpload
        profile={profile}
        onSubmitted={(result) => {
          onComplete('address', result)
          setView('address-submitted')
        }}
        onClose={close}
      />
    )
  }

  if (view === 'address-submitted') {
    return <DocumentsSubmitted title="Proof of address submitted" onClose={close} />
  }

  // Overview
  const next = STEPS.find((s) => !isStepDone(status, s.id))
  const anyDone = STEPS.some((s) => isStepDone(status, s.id))
  const primaryLabel = !next ? 'Done' : anyDone ? next.action : 'Get started now'

  return (
    <Modal
      open
      onClose={close}
      title="Verify your contact details"
      subtitle="This process takes less than 5 minutes"
      note={
        <>
          <Lock size={18} /> All data is encrypted for security
        </>
      }
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Do it later
          </Button>
          <Button onClick={() => (next ? startStep(next.id) : setView('complete'))}>{primaryLabel}</Button>
        </>
      }
    >
      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const done = isStepDone(status, step.id)
          return (
            <li key={step.id} className={styles.step}>
              <span className={styles.stepIcon}>
                <Icon size={32} />
              </span>
              <button type="button" className={styles.stepText} onClick={() => !done && startStep(step.id)} disabled={done}>
                <span>
                  <span className={styles.stepTitle}>
                    {i + 1}. {step.title}
                  </span>
                  <span className={styles.stepHint}>{step.id === 'email' ? maskEmail(email) : step.hint}</span>
                </span>
                {done && (
                  <span className={styles.doneBadge} aria-label="Completed">
                    <CheckCircle size={30} strokeWidth="2" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </Modal>
  )
}
