import { useId, useState } from 'react'
import { Lock } from '../../components/icons'
import Button from '../../components/ui/Button'
import CopyButton from '../../components/ui/CopyButton'
import Toggle from '../../components/ui/Toggle'
import styles from './Settings.module.css'

/** Titled settings card with an optional sticky save bar. */
export function Section({ title, description, children, onSave, saving, dirty, actions }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {actions}
      </header>
      <div className={styles.sectionBody}>{children}</div>
      {onSave && (
        <footer className={styles.sectionFoot}>
          <span className={styles.dirtyNote}>{dirty ? 'You have unsaved changes' : ''}</span>
          <Button onClick={onSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </footer>
      )}
    </section>
  )
}

export const Grid = ({ children, cols = 2 }) => <div className={`${styles.grid} ${cols === 3 ? styles.grid3 : ''}`}>{children}</div>

export function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <p className={styles.toggleLabel}>{label}</p>
        {description && <p className={styles.toggleHint}>{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

/**
 * Write-only secret input. `value` is either a mask object from the API
 * ({ set, hint }) or a new string the user typed.
 */
export function SecretField({ label, value, onChange, placeholder, hint }) {
  const id = useId()
  const isMask = value && typeof value === 'object'
  const [editing, setEditing] = useState(!isMask || !value.set)

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {editing ? (
        <div className={styles.secretEdit}>
          <input
            id={id}
            type="password"
            autoComplete="new-password"
            className={styles.input}
            value={typeof value === 'string' ? value : ''}
            placeholder={placeholder ?? 'Enter value'}
            onChange={(e) => onChange(e.target.value)}
          />
          {isMask && value.set && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setEditing(false)
                onChange(value)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className={styles.secretSaved}>
          <Lock size={16} />
          <span>Saved {value.hint}</span>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              setEditing(true)
              onChange('')
            }}
          >
            Replace
          </button>
        </div>
      )}
      <small className={styles.hint}>{hint ?? 'Stored encrypted. It cannot be viewed again after saving.'}</small>
    </div>
  )
}

/** Read-only value with a copy button (webhook URLs, IDs). */
export function CopyValue({ label, value }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.copyValue}>
        <code>{value}</code>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  )
}

/** Chip-style multi-select for small option sets (leverages, documents). */
export function ChipSelect({ label, options, value, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <fieldset className={styles.chips}>
      <legend className={styles.label}>{label}</legend>
      <div>
        {options.map((o) => (
          <label key={o.value} className={`${styles.chip} ${value.includes(o.value) ? styles.chipOn : ''}`}>
            <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Callout({ children }) {
  return <p className={styles.callout}>{children}</p>
}
