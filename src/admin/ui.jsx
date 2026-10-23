import { ChevronLeft, ChevronRight, Search } from '../components/icons'
import { countryFlag } from '../utils/format'
import styles from './admin.module.css'

const BADGES = {
  approved: ['Verified', 'good'],
  done: ['Completed', 'good'],
  active: ['Active', 'good'],
  resolved: ['Resolved', 'good'],
  pending: ['Pending', 'warn'],
  open: ['Open', 'warn'],
  rejected: ['Rejected', 'bad'],
  suspended: ['Suspended', 'bad'],
  none: ['Not started', 'neutral'],
}

/** Status pill; colour comes from the state, the label says it in words. */
export function StatusBadge({ state, label }) {
  const [text, tone] = BADGES[state] ?? [state, 'neutral']
  return <span className={`${styles.badge} ${styles[tone]}`}>{label ?? text}</span>
}

export function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <label className={styles.search}>
      <Search size={18} />
      <input type="search" value={value} placeholder={placeholder} aria-label={label ?? placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div className={styles.pagination}>
      <span>
        {from}–{to} of {total}
      </span>
      <div>
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={18} />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export function Kpi({ label, value, hint, tone }) {
  return (
    <div className={styles.kpi}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={`${styles.kpiValue} ${tone ? styles[tone] + 'Text' : ''}`}>{value}</p>
      {hint && <p className={styles.kpiHint}>{hint}</p>}
    </div>
  )
}

export const Country = ({ code }) => (
  <span className={styles.country}>
    <span aria-hidden="true">{countryFlag(code)}</span> {code}
  </span>
)
