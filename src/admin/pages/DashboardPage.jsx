import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BarChart from '../../components/charts/BarChart'
import { useAdminAuth } from '../AdminAuth'
import { getDashboard } from '../api'
import { dateTime, DOC_LABELS, usd } from '../format'
import { Kpi } from '../ui'
import a from '../admin.module.css'
import styles from './Dashboard.module.css'

const compact = (v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}k` : String(Math.round(v)))

export default function DashboardPage() {
  const navigate = useNavigate()
  const { staff, can } = useAdminAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then(setData)
  }, [])

  if (!data) return <div className={a.page}><div className={a.skeleton} /></div>

  const net = data.deposits30d - data.withdrawals30d

  return (
    <div className={a.page}>
      <p className={a.muted}>Good to see you, {staff.name.split(' ')[0]}. Here&apos;s what needs attention today.</p>

      <div className={a.kpis}>
        <Kpi label="Total clients" value={data.totalClients} hint={`+${data.newClients7d} in the last 7 days`} />
        <Kpi label="Deposits · 30 days" value={usd(data.deposits30d)} />
        <Kpi label="Net deposits · 30 days" value={usd(net)} tone={net < 0 ? 'bad' : undefined} hint={`Withdrawals ${usd(data.withdrawals30d)}`} />
        <Kpi label="Pending withdrawals" value={data.pendingWithdrawals.count} tone={data.pendingWithdrawals.count ? 'warn' : undefined} hint={usd(data.pendingWithdrawals.amount)} />
        <Kpi label="ID checks waiting" value={data.pendingKyc} tone={data.pendingKyc ? 'warn' : undefined} />
        <Kpi label="Open tickets" value={data.openTickets} />
      </div>

      <section className={a.panel}>
        <div className={a.panelHead}>
          <h2 className={a.panelTitle}>Completed deposits · last 14 days</h2>
        </div>
        <div className={a.panelBody}>
          <BarChart title="Completed deposits per day" tooltipLabel="Deposits" data={data.depositsByDay} format={(v) => `${compact(v)} USD`} />
        </div>
      </section>

      <div className={styles.queues}>
        {can('kyc') && (
          <section className={a.panel}>
            <div className={a.panelHead}>
              <h2 className={a.panelTitle}>ID checks waiting</h2>
              <Link to="/admin/kyc" className={a.link}>
                Review all
              </Link>
            </div>
            {data.kycPreview.length === 0 ? (
              <p className={a.empty}>Nothing to review.</p>
            ) : (
              <ul className={styles.list}>
                {data.kycPreview.map((k) => (
                  <li key={k.id}>
                    <button type="button" onClick={() => navigate(`/admin/kyc?open=${encodeURIComponent(k.id)}`)}>
                      <span>
                        <strong>{k.clientName}</strong>
                        <small>
                          {k.kind === 'address' ? 'Proof of address' : DOC_LABELS[k.docType] ?? 'Identity document'} · {dateTime(k.submittedAt)}
                        </small>
                      </span>
                      <span className={a.link}>Review</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {can('transactions') && (
          <section className={a.panel}>
            <div className={a.panelHead}>
              <h2 className={a.panelTitle}>Withdrawals to approve</h2>
              <Link to="/admin/transactions?status=pending" className={a.link}>
                View queue
              </Link>
            </div>
            {data.withdrawalPreview.length === 0 ? (
              <p className={a.empty}>No pending withdrawals.</p>
            ) : (
              <ul className={styles.list}>
                {data.withdrawalPreview.map((t) => (
                  <li key={t.id}>
                    <button type="button" onClick={() => navigate('/admin/transactions?status=pending')}>
                      <span>
                        <strong>{t.clientName}</strong>
                        <small>
                          {t.method} · {dateTime(t.createdAt)}
                        </small>
                      </span>
                      <span className={styles.amount}>{usd(t.amount)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
