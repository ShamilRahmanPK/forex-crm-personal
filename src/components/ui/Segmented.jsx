import styles from './Segmented.module.css'

/**
 * Tab-style segmented control. options: [{ value, label }]
 * variant: 'track' (grey track, white active tab) | 'outline' (separate bordered buttons)
 */
export default function Segmented({ label, options, value, onChange, variant = 'track' }) {
  return (
    <div className={`${styles.group} ${styles[variant]}`} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={`${styles.segment} ${o.value === value ? styles.active : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
