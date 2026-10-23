import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Transfer } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { useAccounts } from '../../hooks/useAccounts'
import { transferBetweenAccounts } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './Transfer.module.css'

const money = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const optionFor = (a) => ({ value: a.id, label: `${a.platform}  ${a.id}  ·  ${a.nickname}  ·  ${money(a.balance)} ${a.currency}` })

export default function TransferPage() {
  const [params] = useSearchParams()
  const toast = useToast()
  const { accounts, reload } = useAccounts()
  const [fromId, setFromId] = useState(params.get('login') ?? '')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Transfers are between real accounts only.
  const real = (accounts ?? []).filter((a) => a.mode === 'real')
  const from = real.find((a) => a.id === fromId) ?? real[0]
  const targets = real.filter((a) => a.id !== from?.id)
  const value = Number(amount)
  const valid = from && toId && value > 0 && value <= from.freeMargin

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await transferBetweenAccounts({ fromId: from.id, toId, amount: value })
      toast(`Transferred ${money(value)} ${from.currency} to #${toId}`)
      setAmount('')
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={page.page}>
      <h1 className={page.title}>Transfer</h1>
      <Link to="/pa/payments-and-wallet/deposit" className={`${page.link} ${styles.allMethods}`}>
        See all payment methods
      </Link>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <SelectField
            label="Payment method"
            options={[{ value: 'internal', label: 'Between your accounts' }]}
            value="internal"
            onChange={() => {}}
            startAdornment={
              <span className={styles.methodIcon}>
                <Transfer size={16} />
              </span>
            }
          />
          <SelectField
            label="From account"
            options={real.map(optionFor)}
            value={from?.id ?? ''}
            onChange={(e) => {
              setFromId(e.target.value)
              if (e.target.value === toId) setToId('')
            }}
            hint={from ? `Available to transfer: ${money(from.freeMargin)} ${from.currency}` : undefined}
          />
          <SelectField
            label="To account"
            placeholder={targets.length ? 'Select an account' : 'No other real accounts'}
            options={targets.map(optionFor)}
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            hint={!targets.length && accounts ? <Link to="/pa/new-account?server=real" className={page.link}>Open another account</Link> : undefined}
            disabled={!targets.length}
          />
          <TextField
            label="Amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))}
            endAdornment={<span className={styles.currency}>{from?.currency ?? 'USD'}</span>}
            error={error || (from && value > from.freeMargin ? `The maximum is ${money(from.freeMargin)} ${from.currency}` : undefined)}
            className={styles.amount}
          />
          <div>
            <Button type="submit" variant={valid ? 'primary' : 'secondary'} className={valid ? undefined : styles.disabled} disabled={!valid || submitting}>
              {submitting ? 'Transferring…' : 'Continue'}
            </Button>
          </div>
        </form>

        <aside className={styles.terms}>
          <h2>Terms</h2>
          <dl>
            <dt>Average payment time</dt>
            <dd>Instant</dd>
            <dt>Fee</dt>
            <dd>0%</dd>
          </dl>
          <h2>FAQ</h2>
          <a href="#" className={page.link}>
            General transfer rules
          </a>
        </aside>
      </div>
    </div>
  )
}
