import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, SearchQuestion } from '../../components/icons'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import EmptyState from '../../components/ui/EmptyState'
import { useAccounts } from '../../hooks/useAccounts'
import { getTickets, getTransactions } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './Transactions.module.css'

const DEFAULTS = { days: 7, type: 'all', status: 'all', accountId: 'all' }

const PERIODS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 0, label: 'All time' },
]
const TYPES = [
  { value: 'all', label: 'All transaction types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer', label: 'Transfers' },
]
const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'done', label: 'Done' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]
const STATUS_CLASS = { done: page.statusDone, pending: page.statusPending, rejected: page.statusRejected }

export default function TransactionsPage() {
  const { accounts } = useAccounts()
  const [filters, setFilters] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [openTickets, setOpenTickets] = useState(0)
  const key = JSON.stringify(filters)

  useEffect(() => {
    let active = true
    getTransactions(filters).then((data) => active && setResult({ key, data }))
    return () => {
      active = false
    }
  }, [filters, key])

  useEffect(() => {
    getTickets().then((t) => setOpenTickets(t.filter((x) => x.status === 'open').length))
  }, [])

  const set = (name) => (value) => setFilters((f) => ({ ...f, [name]: value }))
  const rows = result?.key === key ? result.data : null
  const accountOptions = [{ value: 'all', label: 'All accounts' }, ...(accounts ?? []).filter((a) => a.mode === 'real').map((a) => ({ value: a.id, label: `#${a.id}` }))]

  return (
    <div className={page.page}>
      <div className={page.titleRow}>
        <h1 className={page.title}>Transaction history</h1>
        <p className={styles.support}>
          <Link to="/pa/support" className={page.link}>
            Get support
          </Link>
          <span aria-hidden="true">|</span>
          <Link to="/pa/support#tickets" className={page.link}>
            Support requests
          </Link>
          <span className={styles.count}>{openTickets}</span>
        </p>
      </div>

      <div className={`${page.toolbar} ${styles.filters}`}>
        <Dropdown variant="pill" active label="Period" icon={<Calendar size={18} />} options={PERIODS} value={filters.days} onChange={set('days')} />
        <Dropdown variant="pill" active={filters.type !== 'all'} label="Type" options={TYPES} value={filters.type} onChange={set('type')} />
        <Dropdown variant="pill" active={filters.status !== 'all'} label="Status" options={STATUSES} value={filters.status} onChange={set('status')} />
        <Dropdown variant="pill" active={filters.accountId !== 'all'} label="Account" options={accountOptions} value={filters.accountId} onChange={set('accountId')} />
      </div>

      {!rows ? (
        <div className={styles.skeleton} aria-busy="true" />
      ) : rows.length === 0 ? (
        <EmptyState
          size="lg"
          icon={<SearchQuestion size={64} strokeWidth="1.3" />}
          title="No transaction matches your filters"
          text="Try changing your search terms"
          action={<Button onClick={() => setFilters(DEFAULTS)}>Reset filters</Button>}
        />
      ) : (
        <div className={`${page.tableWrap} ${styles.table}`}>
          <table className={page.table}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Method</th>
                <th scope="col">Account</th>
                <th scope="col" className={page.num}>Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className={styles.capitalize}>{t.type}</td>
                  <td>{t.method}</td>
                  <td>{t.type === 'transfer' ? `#${t.fromId} → #${t.toId}` : `#${t.accountId}`}</td>
                  <td className={page.num}>
                    {t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t.currency}
                  </td>
                  <td>
                    <span className={`${page.status} ${STATUS_CLASS[t.status]} ${styles.capitalize}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
