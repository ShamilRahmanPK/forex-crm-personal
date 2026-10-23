import { useState } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import * as api from '../../services/api'
import { countryFlag } from '../../utils/format'
import styles from './Verification.module.css'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MIN_AGE = 18
const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 100 - MIN_AGE + 1 }, (_, i) => String(THIS_YEAR - MIN_AGE - i))
const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

const EMPTY = { firstName: '', lastName: '', day: '', month: '', year: '', countryOfBirth: '', gender: '', address: '' }

const daysIn = (month, year) => new Date(Number(year) || 2000, Number(month) || 1, 0).getDate()

function ageOn(today, { day, month, year }) {
  const birth = new Date(Number(year), Number(month) - 1, Number(day))
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age
}

function validate(f) {
  const e = {}
  if (!f.firstName.trim()) e.firstName = 'Please enter your first name as shown on your ID'
  if (!f.lastName.trim()) e.lastName = 'Please enter your last name as shown on your ID'
  if (!f.day || !f.month || !f.year) e.dob = 'Please enter your date of birth'
  else if (ageOn(new Date(), f) < MIN_AGE) e.dob = `You must be at least ${MIN_AGE} years old`
  if (!f.countryOfBirth) e.countryOfBirth = 'Please select your country of birth'
  if (!f.gender) e.gender = 'Please select an option'
  if (!f.address.trim()) e.address = 'Please enter your residential address'
  return e
}

export default function ProfileStep({ initial, onSaved, onLater, onClose }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value }
      // Keep the day valid when month/year change (e.g. 31 -> February).
      if (next.day && Number(next.day) > daysIn(next.month, next.year)) next.day = ''
      return next
    })
    setErrors((e) => ({ ...e, [key === 'day' || key === 'month' || key === 'year' ? 'dob' : key]: undefined }))
  }
  const bind = (key) => ({ value: form[key], onChange: (e) => set(key, e.target.value) })

  async function handleSubmit(e) {
    e.preventDefault()
    const next = validate(form)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      onSaved(await api.saveProfile(form))
    } finally {
      setSaving(false)
    }
  }

  const days = Array.from({ length: daysIn(form.month, form.year) }, (_, i) => String(i + 1))

  return (
    <Modal
      open
      onClose={onClose}
      title="Add profile information"
      showClose
      footer={
        <>
          <Button variant="secondary" onClick={onLater}>
            Do it later
          </Button>
          <Button type="submit" form="profile-form" disabled={saving}>
            {saving ? 'Saving…' : 'Continue'}
          </Button>
        </>
      }
    >
      <form id="profile-form" className={styles.profileForm} onSubmit={handleSubmit} noValidate>
        <TextField
          label="First name"
          autoComplete="given-name"
          hint="Your first name as shown on your ID"
          error={errors.firstName}
          data-autofocus
          {...bind('firstName')}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          hint="Your last name as shown on your ID"
          error={errors.lastName}
          {...bind('lastName')}
        />

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Date of birth</legend>
          <div className={`${styles.dob} ${errors.dob ? styles.dobInvalid : ''}`}>
            <SelectField aria-label="Day" placeholder="Day" options={days} {...bind('day')} />
            <SelectField
              aria-label="Month"
              placeholder="Month"
              options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
              {...bind('month')}
            />
            <SelectField aria-label="Year" placeholder="Year" options={YEARS} {...bind('year')} />
          </div>
          {errors.dob && (
            <p className={styles.fieldError} role="alert">
              {errors.dob}
            </p>
          )}
        </fieldset>

        <SelectField
          label="Country of birth"
          placeholder=""
          options={api.COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
          startAdornment={form.countryOfBirth ? countryFlag(form.countryOfBirth) : null}
          error={errors.countryOfBirth}
          {...bind('countryOfBirth')}
        />

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Your gender</legend>
          <div className={styles.inlineRadios} role="radiogroup">
            {GENDERS.map((g) => (
              <label key={g.value} className={styles.inlineRadio}>
                <input type="radio" name="gender" value={g.value} checked={form.gender === g.value} onChange={() => set('gender', g.value)} />
                <span className={styles.radioDot} aria-hidden="true" />
                {g.label}
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className={styles.fieldError} role="alert">
              {errors.gender}
            </p>
          )}
        </fieldset>

        <TextField
          label="Your residential address"
          autoComplete="street-address"
          placeholder="City, street, house (apartment)"
          hint="You will be asked to verify your address later"
          error={errors.address}
          {...bind('address')}
        />
      </form>
    </Modal>
  )
}
