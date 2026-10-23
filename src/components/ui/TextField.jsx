import { forwardRef, useId } from 'react'
import styles from './TextField.module.css'

const TextField = forwardRef(function TextField(
  { label, error, hint, endAdornment, className = '', ...inputProps },
  ref,
) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        <input
          ref={ref}
          id={id}
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...inputProps}
        />
        {endAdornment && <div className={styles.adornment}>{endAdornment}</div>}
      </div>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  )
})

export default TextField
