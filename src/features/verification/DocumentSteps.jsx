import { useState } from 'react'
import { CheckCircle, Pencil } from '../../components/icons'
import Button from '../../components/ui/Button'
import ChoiceList from '../../components/ui/ChoiceList'
import FileDrop from '../../components/ui/FileDrop'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import Checkbox from '../../components/ui/Checkbox'
import { useBrand } from '../../context/BrandContext'
import * as api from '../../services/api'
import { countryFlag } from '../../utils/format'
import styles from './Documents.module.css'

const ID_TYPES = [
  { value: 'passport', label: 'Passport', hint: 'Photo page only' },
  { value: 'id-card', label: 'National ID card', hint: 'Front and back' },
  { value: 'driving-licence', label: 'Driving licence', hint: 'Front and back' },
]

const ADDRESS_TYPES = [
  { value: 'utility-bill', label: 'Utility bill', hint: 'Electricity, water, gas, internet or landline' },
  { value: 'bank-statement', label: 'Bank statement' },
  { value: 'tax', label: 'Tax or government letter' },
  { value: 'tenancy', label: 'Tenancy agreement' },
]

/** Our own line illustration of an ID card under a magnifier. */
function IdIllustration() {
  return (
    <svg className={styles.illustration} viewBox="0 0 220 150" aria-hidden="true">
      <rect x="10" y="8" width="170" height="118" rx="8" className={styles.illBack} />
      <rect x="30" y="22" width="170" height="118" rx="8" className={styles.illCard} />
      <circle cx="72" cy="66" r="14" className={styles.illAvatar} />
      <path d="M46 112c4-16 14-24 26-24s22 8 26 24Z" className={styles.illAvatar} />
      <rect x="112" y="50" width="70" height="6" rx="3" className={styles.illLine} />
      <rect x="112" y="64" width="52" height="6" rx="3" className={styles.illLine} />
      <rect x="112" y="96" width="44" height="6" rx="3" className={styles.illLine} />
      <circle cx="176" cy="112" r="14" className={styles.illLens} />
      <path d="m186 122 12 12" className={styles.illHandle} />
    </svg>
  )
}

export function IdentityIntro({ profile, onSaveName, onContinue, onClose }) {
  const brand = useBrand()
  const [editing, setEditing] = useState(false)
  const [first, setFirst] = useState(profile?.firstName ?? '')
  const [last, setLast] = useState(profile?.lastName ?? '')
  const residence = profile?.residence ?? brand.defaultCountry
  const residenceName = api.COUNTRIES.find((c) => c.code === residence)?.name ?? residence
  const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()

  return (
    <Modal
      open
      onClose={onClose}
      icon={<IdIllustration />}
      title="Document verification"
      showClose
      footer={
        <Button onClick={onContinue} disabled={editing}>
          Upload documents
        </Button>
      }
    >
      <p className={styles.lead}>
        On the next screen you&apos;ll upload one or two documents that prove your name and country of residence. Your current
        country of residence is{' '}
        <span className={styles.nowrap}>
          {countryFlag(residence)} {residenceName}
        </span>
        .
      </p>

      <p className={styles.checkTitle}>Check your name:</p>
      {editing ? (
        <form
          className={styles.nameForm}
          onSubmit={(e) => {
            e.preventDefault()
            if (!first.trim() || !last.trim()) return
            onSaveName(first.trim(), last.trim())
            setEditing(false)
          }}
        >
          <TextField label="First name" value={first} onChange={(e) => setFirst(e.target.value)} data-autofocus />
          <TextField label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
          <Button type="submit" variant="secondary" disabled={!first.trim() || !last.trim()}>
            Save name
          </Button>
        </form>
      ) : (
        <div className={styles.nameRow}>
          <span>{fullName || '—'}</span>
          <button type="button" className={styles.edit} onClick={() => setEditing(true)}>
            <Pencil size={18} /> Edit
          </button>
        </div>
      )}
    </Modal>
  )
}

export function IdentityConsent({ onContinue, onClose }) {
  const brand = useBrand()
  const [agreed, setAgreed] = useState(false)
  return (
    <Modal
      open
      onClose={onClose}
      title="Data and privacy"
      showClose
      width={600}
      footer={
        <Button block onClick={onContinue} disabled={!agreed}>
          Continue
        </Button>
      }
    >
      <Checkbox checked={agreed} onChange={setAgreed}>
        I acknowledge that my personal data will be processed as described in the{' '}
        <a href={brand.kyc.privacyNoticeUrl} target="_blank" rel="noreferrer">
          Notice of Personal Data Processing
        </a>
        .
      </Checkbox>
    </Modal>
  )
}

export function IdentityUpload({ profile, onSubmitted, onBack, onClose }) {
  const brand = useBrand()
  const [docType, setDocType] = useState('passport')
  const [country, setCountry] = useState(profile?.residence ?? brand.defaultCountry)
  const [front, setFront] = useState(null)
  const [back, setBack] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const needsBack = docType !== 'passport'

  async function submit() {
    if (!front || (needsBack && !back)) return setError(needsBack ? 'Upload both sides of your document' : 'Upload your passport photo page')
    setSubmitting(true)
    setError('')
    try {
      onSubmitted(await api.submitIdentityDocuments({ docType, country, files: [front, back].filter(Boolean) }))
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Upload proof of identity"
      subtitle="Your document must be valid and show your full name, photo and date of birth."
      showClose
      footer={
        <>
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Uploading…' : 'Submit documents'}
          </Button>
        </>
      }
    >
      <div className={styles.stack}>
        <SelectField
          label="Issuing country"
          options={api.COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
          startAdornment={countryFlag(country)}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <ChoiceList
          name="id-type"
          label="Document type"
          options={ID_TYPES}
          value={docType}
          onChange={(v) => {
            setDocType(v)
            setBack(null)
          }}
        />
        <div className={needsBack ? styles.twoCol : undefined}>
          <FileDrop label={needsBack ? 'Front side' : 'Photo page'} file={front} onChange={setFront} />
          {needsBack && <FileDrop label="Back side" file={back} onChange={setBack} />}
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}

export function AddressUpload({ profile, onSubmitted, onClose }) {
  const [docType, setDocType] = useState('utility-bill')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!file) return setError('Upload your document')
    setSubmitting(true)
    try {
      onSubmitted(await api.submitAddressDocument({ docType, files: [file] }))
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Verify your residential address"
      subtitle="Upload a document issued in the last 3 months showing your name and address."
      showClose
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Do it later
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Uploading…' : 'Submit document'}
          </Button>
        </>
      }
    >
      <div className={styles.stack}>
        {profile?.address && (
          <p className={styles.lead}>
            Address on file: <strong>{profile.address}</strong>
          </p>
        )}
        <ChoiceList name="address-type" label="Document type" options={ADDRESS_TYPES} value={docType} onChange={setDocType} />
        <FileDrop label="Document" file={file} onChange={setFile} error={error} />
      </div>
    </Modal>
  )
}

export function DocumentsSubmitted({ title, onClose }) {
  return (
    <Modal
      open
      onClose={onClose}
      icon={<CheckCircle size={64} strokeWidth="1.4" />}
      title={title}
      subtitle="We're reviewing your documents. This usually takes a few minutes, and we'll notify you when it's done."
      showClose
      footer={<Button onClick={onClose}>Done</Button>}
    />
  )
}
