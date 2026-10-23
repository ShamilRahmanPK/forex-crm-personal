import { Check } from '../icons'
import styles from './ChoiceList.module.css'

/**
 * Bordered list of radio or checkbox rows.
 *   type="radio":    value is a string
 *   type="checkbox": value is an array of strings
 * `renderExtra(option)` renders content under the selected row (e.g. a follow-up select).
 * `renderLabel(option)` lets callers render rich labels (links etc.).
 */
export default function ChoiceList({ name, type = 'radio', options, value, onChange, invalid = false, label, renderExtra, renderLabel }) {
  const isChecked = (v) => (type === 'checkbox' ? value.includes(v) : value === v)

  function toggle(v) {
    if (type === 'radio') onChange(v)
    else onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  return (
    <div
      role={type === 'radio' ? 'radiogroup' : 'group'}
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={`${styles.list} ${invalid ? styles.invalid : ''}`}
    >
      {options.map((opt) => {
        const checked = isChecked(opt.value)
        return (
          <div key={opt.value} className={`${styles.item} ${checked ? styles.checked : ''}`}>
            <label className={styles.row}>
              <input
                type={type}
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => toggle(opt.value)}
                className={styles.input}
              />
              <span className={type === 'radio' ? styles.radio : styles.checkbox} aria-hidden="true">
                {type === 'checkbox' && <Check size={14} strokeWidth="2.6" />}
              </span>
              <span className={styles.text}>
                <span>{renderLabel ? renderLabel(opt) : opt.label}</span>
                {opt.hint && <small>{opt.hint}</small>}
              </span>
            </label>
            {checked && renderExtra?.(opt)}
          </div>
        )
      })}
    </div>
  )
}
