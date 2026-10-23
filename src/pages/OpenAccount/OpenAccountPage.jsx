import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ChatFab from '../../components/ChatFab'
import { Close, Coin, Cube, ExternalLink, Gauge, HalfCircle, Target } from '../../components/icons'
import Logo from '../../components/Logo'
import Button from '../../components/ui/Button'
import { createAccount, getAccountTypes } from '../../services/api'
import styles from './OpenAccount.module.css'

const TYPE_ICONS = { cube: Cube, coin: Coin, gauge: Gauge, half: HalfCircle, target: Target }
const COLUMNS = [
  { key: 'minDeposit', label: 'Min deposit' },
  { key: 'minSpread', label: 'Min spread' },
  { key: 'maxLeverage', label: 'Max leverage' },
  { key: 'commission', label: 'Commission' },
]

export default function OpenAccountPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const mode = params.get('server') === 'demo' ? 'demo' : 'real'
  const [groups, setGroups] = useState(null)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAccountTypes().then((data) => {
      if (!active) return
      setGroups(data)
      setSelected(data[0]?.types[0]?.id ?? null)
    })
    return () => {
      active = false
    }
  }, [])

  const backToAccounts = () => navigate(`/pa/trading/accounts${mode === 'demo' ? '?mode=demo' : ''}`)

  async function handleContinue() {
    setSubmitting(true)
    setError('')
    try {
      const type = groups.flatMap((g) => g.types).find((t) => t.id === selected)
      await createAccount({ typeName: type.name, mode })
      backToAccounts()
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo to="/pa/trading/accounts" />
        <button type="button" className={styles.close} onClick={backToAccounts} aria-label="Close">
          <Close size={26} />
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Open {mode === 'demo' ? 'demo ' : ''}account</h1>
          <a href="#" className={styles.specs}>
            Contract specifications <ExternalLink size={18} />
          </a>
        </div>

        {!groups ? (
          <div className={styles.skeleton} aria-busy="true" />
        ) : (
          <div role="radiogroup" aria-label="Account type">
            {groups.map((group) => (
              <section key={group.group} className={styles.group}>
                <div className={styles.groupHead} aria-hidden="true">
                  <h2 className={styles.groupTitle}>{group.group}</h2>
                  {COLUMNS.map((c) => (
                    <span key={c.key} className={styles.columnLabel}>
                      {c.label}
                    </span>
                  ))}
                </div>
                <h2 className="visually-hidden">{group.group}</h2>

                {group.types.map((type) => {
                  const Icon = TYPE_ICONS[type.icon] ?? Cube
                  const checked = selected === type.id
                  return (
                    <label key={type.id} className={`${styles.option} ${checked ? styles.optionActive : ''}`}>
                      <input
                        type="radio"
                        name="account-type"
                        value={type.id}
                        checked={checked}
                        onChange={() => setSelected(type.id)}
                        className={styles.radioInput}
                      />
                      <span className={styles.radio} aria-hidden="true" />
                      <span className={styles.typeIcon}>
                        <Icon size={24} />
                      </span>
                      <span className={styles.typeInfo}>
                        <span className={styles.typeName}>
                          {type.name}
                          {type.badge && <span className={styles.typeBadge}>{type.badge}</span>}
                        </span>
                        <span className={styles.typeDesc}>{type.description}</span>
                      </span>
                      {COLUMNS.map((c) => (
                        <span key={c.key} className={styles.cell}>
                          <span className={styles.cellLabel}>{c.label}</span>
                          {type[c.key]}
                        </span>
                      ))}
                    </label>
                  )
                })}
              </section>
            ))}
          </div>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={backToAccounts}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!selected || submitting}>
            {submitting ? 'Opening account…' : 'Continue'}
          </Button>
        </div>
      </main>

      <ChatFab />
    </div>
  )
}
