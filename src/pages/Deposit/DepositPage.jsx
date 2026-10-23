import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bank, Coin, CreditCard, Diamond, Lock, Transfer } from '../../components/icons'
import Modal from '../../components/ui/Modal'
import { useVerification } from '../../features/verification/VerificationContext'
import { COUNTRIES, getDepositMethods } from '../../services/api'
import { countryFlag } from '../../utils/format'
import styles from './Deposit.module.css'

const METHOD_ICONS = { transfer: Transfer, coin: Coin, card: CreditCard, bank: Bank, diamond: Diamond }
const COUNTRY_KEY = 'crm.paymentCountry'
const flag = countryFlag

function readCountry() {
  try {
    return localStorage.getItem(COUNTRY_KEY) ?? 'AE'
  } catch {
    return 'AE'
  }
}

function MethodCard({ method, locked, onVerify, login }) {
  const Icon = METHOD_ICONS[method.icon] ?? Coin
  const body = (
    <>
      <span className={styles.methodIcon}>
        <Icon size={26} />
      </span>
      <div className={styles.methodText}>
        <div className={styles.methodHead}>
          <h3 className={styles.methodName}>{method.name}</h3>
          {locked && (
            <button type="button" className={styles.verifyBadge} onClick={onVerify}>
              <Lock size={16} />
              Verify profile
            </button>
          )}
        </div>
        <dl className={styles.methodMeta}>
          <div>
            <dt>Processing time</dt> <dd>{method.processing}</dd>
          </div>
          <div>
            <dt>Fee</dt> <dd>{method.fee}</dd>
          </div>
          <div>
            <dt>Limits</dt> <dd>{method.limits}</dd>
          </div>
        </dl>
      </div>
    </>
  )

  if (locked) {
    return (
      <article className={`${styles.method} ${styles.methodLocked}`}>{body}</article>
    )
  }

  const to = `/pa/payments-and-wallet/deposit/${method.id}${login ? `?login=${login}` : ''}`
  return (
    <Link to={to} className={styles.method}>
      {body}
    </Link>
  )
}

export default function DepositPage() {
  const [params] = useSearchParams()
  const login = params.get('login')
  const { isVerified, startVerification } = useVerification()
  const [country, setCountry] = useState(readCountry)
  const [methods, setMethods] = useState(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    let active = true
    getDepositMethods(country).then((data) => active && setMethods(data))
    return () => {
      active = false
    }
  }, [country])

  function chooseCountry(code) {
    setMethods(null)
    setCountry(code)
    setPicking(false)
    try {
      localStorage.setItem(COUNTRY_KEY, code)
    } catch {
      // ignore
    }
  }

  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country
  const transfer = methods?.filter((m) => m.section === 'transfer') ?? []
  const others = methods?.filter((m) => m.section !== 'transfer') ?? []

  const renderGrid = (list) => (
    <div className={styles.grid}>
      {list.map((m) => (
        <MethodCard key={m.id} method={m} locked={!isVerified} onVerify={startVerification} login={login} />
      ))}
    </div>
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Deposit</h1>
      <p className={styles.country}>
        Payment methods for
        <span className={styles.flag} aria-hidden="true">
          {flag(country)}
        </span>
        {countryName}
        <button type="button" className={styles.change} onClick={() => setPicking(true)}>
          Change
        </button>
      </p>

      {!methods ? (
        <div className={styles.grid} aria-busy="true">
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : (
        <>
          {transfer.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Transfer</h2>
              {renderGrid(transfer)}
            </section>
          )}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{isVerified ? 'All payment methods' : 'Verification required'}</h2>
            {renderGrid(others)}
          </section>
        </>
      )}

      <Modal open={picking} onClose={() => setPicking(false)} title="Select country" subtitle="Payment methods depend on your country of residence" showClose width={520}>
        <ul className={styles.countryList}>
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                className={`${styles.countryOption} ${c.code === country ? styles.countryActive : ''}`}
                onClick={() => chooseCountry(c.code)}
                aria-current={c.code === country}
              >
                <span aria-hidden="true">{flag(c.code)}</span>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}
