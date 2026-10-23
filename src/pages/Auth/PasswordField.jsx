import { useState } from 'react'
import { Eye, EyeClosed } from '../../components/icons'
import TextField from '../../components/ui/TextField'
import { PASSWORD_RULES } from '../../utils/validation'
import styles from './Auth.module.css'

export default function PasswordField({ value, onChange, showRules = false, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <TextField
        label="Password"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        endAdornment={
          <button
            type="button"
            className={styles.eye}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        }
        {...props}
      />

      {showRules && (
        <div className={styles.rulesWrap}>
          <ul className={styles.rules} aria-label="Password requirements">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(value)
              return (
                <li key={rule.id} className={met ? styles.ruleMet : undefined}>
                  <span className={styles.ruleDot} aria-hidden="true" />
                  {rule.label}
                  <span className="visually-hidden">{met ? ' (met)' : ' (not met)'}</span>
                </li>
              )
            })}
          </ul>
          <span className={styles.counter} aria-live="polite">
            {value.length}
          </span>
        </div>
      )}
    </div>
  )
}
