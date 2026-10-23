import { Check } from '../icons'
import styles from './Checkbox.module.css'

export default function Checkbox({ checked, onChange, children, ...props }) {
  return (
    <label className={styles.wrapper}>
      <input
        type="checkbox"
        className={`${styles.input} visually-hidden`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
      />
      <span className={styles.box} aria-hidden="true">
        <Check size={16} strokeWidth="2.4" />
      </span>
      <span className={styles.text}>{children}</span>
    </label>
  )
}
