import { useEffect, useState } from 'react'
import { Calendar, Download, Inbox } from '../../components/icons'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import EmptyState from '../../components/ui/EmptyState'
import Segmented from '../../components/ui/Segmented'
import SelectField from '../../components/ui/SelectField'
import { accountLabel, useAccounts } from '../../hooks/useAccounts'
import { getOrders } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './OrdersHistory.module.css'

const PERIODS = [
  { value: 0, label: 'All time' },
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
]

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const fmtMoney = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function downloadCsv(orders, accountId, status) {
  const header = ['Order', 'Symbol', 'Type', 'Volume', 'Open time', 'Open price', 'Close time', 'Close price', 'Commission', 'Swap', 'Profit']
  const rows = orders.map((o) => [
    o.id,
    o.symbol,
    o.side,
    o.volume,
    o.openTime,
    o.openPrice.toFixed(o.digits),
    o.closeTime ?? '',
    o.closePrice?.toFixed(o.digits) ?? '',
    o.commission,
    o.swap,
    o.profit,
  ])
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `orders-${accountId}-${status}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

export default function OrdersHistoryPage() {
  const { accounts } = useAccounts()
  const [selected, setSelected] = useState('')
  const [status, setStatus] = useState('closed')
  const [days, setDays] = useState(0)
  const [orders, setOrders] = useState(null)

  // Default to the first account once accounts have loaded.
  const accountId = selected || accounts?.[0]?.id || ''

  useEffect(() => {
    if (!accountId) return
    let active = true
    getOrders({ accountId, status, days }).then((data) => active && setOrders({ key: `${accountId}-${status}-${days}`, data }))
    return () => {
      active = false
    }
  }, [accountId, status, days])

  const current = orders?.key === `${accountId}-${status}-${days}` ? orders.data : null
  const isOpen = status === 'open'

  return (
    <div className={page.page}>
      <h1 className={page.title}>History of orders</h1>

      <SelectField
        label="Account"
        className={styles.accountSelect}
        options={(accounts ?? []).map((a) => ({ value: a.id, label: accountLabel(a) }))}
        value={accountId}
        onChange={(e) => setSelected(e.target.value)}
      />

      <div className={styles.toolbar}>
        <div className={page.toolbar}>
          <Segmented
            label="Order status"
            options={[
              { value: 'closed', label: 'Closed orders' },
              { value: 'open', label: 'Open orders' },
            ]}
            value={status}
            onChange={setStatus}
          />
          <Dropdown label="Period" icon={<Calendar size={18} />} options={PERIODS} value={days} onChange={setDays} />
        </div>
        <Button variant="secondary" className={styles.csv} icon={<Download />} disabled={!current?.length} onClick={() => downloadCsv(current, accountId, status)}>
          Download CSV
        </Button>
      </div>

      {!current ? (
        <div className={styles.skeleton} aria-busy="true" />
      ) : current.length === 0 ? (
        <EmptyState icon={<Inbox size={48} />} title={`You don't have ${status} orders in this account`} />
      ) : (
        <div className={`${page.tableWrap} ${styles.table}`}>
          <table className={page.table}>
            <thead>
              <tr>
                <th scope="col">Symbol</th>
                <th scope="col">Type</th>
                <th scope="col" className={page.num}>Volume, lots</th>
                <th scope="col">Open time</th>
                <th scope="col" className={page.num}>Open price</th>
                {!isOpen && <th scope="col">Close time</th>}
                {!isOpen && <th scope="col" className={page.num}>Close price</th>}
                <th scope="col" className={page.num}>{isOpen ? 'Floating P/L' : 'Profit'}, USD</th>
              </tr>
            </thead>
            <tbody>
              {current.map((o) => (
                <tr key={o.id}>
                  <td>{o.symbol}</td>
                  <td className={o.side === 'buy' ? page.positive : page.negative}>{o.side === 'buy' ? 'Buy' : 'Sell'}</td>
                  <td className={page.num}>{o.volume.toFixed(2)}</td>
                  <td>{fmtTime(o.openTime)}</td>
                  <td className={page.num}>{o.openPrice.toFixed(o.digits)}</td>
                  {!isOpen && <td>{fmtTime(o.closeTime)}</td>}
                  {!isOpen && <td className={page.num}>{o.closePrice.toFixed(o.digits)}</td>}
                  <td className={`${page.num} ${o.profit >= 0 ? page.positive : page.negative}`}>{fmtMoney(o.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
