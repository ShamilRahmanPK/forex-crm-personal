import { useId } from 'react'
import { ChevronDown } from '../icons'
import styles from './SelectField.module.css'

/**
 * Native <select> styled like TextField. `options` is an array of strings or
 * { value, label }. Pass `label={null}` when the field sits in a labelled group.
 */
export default function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  startAdornment,
  className = '',
  id: idProp,
  ...selectProps
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const msgId = `${id}-msg`

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        {startAdornment && <span className={styles.start}>{startAdornment}</span>}
        <select
          id={id}
          className={styles.select}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? msgId : undefined}
          {...selectProps}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const { value, label: text } = typeof opt === 'string' ? { value: opt, label: opt } : opt
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
        <ChevronDown size={20} className={styles.chevron} />
      </div>
      {(error || hint) && (
        <p id={msgId} className={error ? styles.error : styles.hint} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
