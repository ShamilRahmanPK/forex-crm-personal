import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Download } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import Modal from '../../components/ui/Modal'
import Segmented from '../../components/ui/Segmented'
import SelectField from '../../components/ui/SelectField'
import { decideTransaction, listAdminTransactions } from '../api'
import { dateTime, usd } from '../format'
import { SearchInput, StatusBadge } from '../ui'
import a from '../admin.module.css'

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]
const TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer', label: 'Transfers' },
]
const REASONS = ['Payment details do not match the client', 'Insufficient free margin', 'Verification incomplete', 'Suspected fraud', 'Duplicate request']

function exportCsv(rows) {
  const header = ['ID', 'Date', 'Client', 'Client ID', 'Type', 'Method', 'Account', 'Amount', 'Currency', 'Status']
  const lines = rows.map((t) => [t.id, t.createdAt, t.clientName, t.clientId, t.type, t.method, t.accountId, t.amount, t.currency, t.status])
  const csv = [header, ...lines].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  Object.assign(document.createElement('a'), { href: url, download: 'transactions.csv' }).click()
  URL.revokeObjectURL(url)
}

export default function TransactionsPage() {
  const toast = useToast()
  const [params] = useSearchParams()
  const [status, setStatus] = useState(params.get('status') ?? 'pending')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState(REASONS[0])

  const load = useCallback(() => {
    listAdminTransactions({ status, type, query }).then(setRows)
  }, [status, type, query])

  useEffect(() => {
    const t = setTimeout(load, 150)
    return () => clearTimeout(t)
  }, [load])

  async function approve(t) {
    await decideTransaction(t.id, 'approve')
    toast(`${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${usd(t.amount)} approved`)
    load()
  }

  async function reject() {
    await decideTransaction(rejecting.id, 'reject', reason)
    toast(`${rejecting.type === 'deposit' ? 'Deposit' : 'Withdrawal'} rejected`)
    setRejecting(null)
    load()
  }

  return (
    <div className={a.page}>
      <div className={a.toolbar}>
        <Segmented label="Status" options={STATUSES} value={status} onChange={setStatus} />
        <Dropdown variant="pill" active={type !== 'all'} label="Type" options={TYPES} value={type} onChange={setType} />
        <SearchInput value={query} onChange={setQuery} placeholder="Client, transaction or account" label="Search transactions" />
        <Button variant="secondary" className={`${a.small} ${a.toolbarEnd}`} icon={<Download />} disabled={!rows?.length} onClick={() => exportCsv(rows)}>
          Export CSV
        </Button>
      </div>

      <section className={a.panel}>
        {!rows ? (
          <div className={a.skeleton} />
        ) : rows.length === 0 ? (
          <p className={a.empty}>{status === 'pending' ? 'No transactions waiting for approval.' : 'No transactions match these filters.'}</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Client</th>
                  <th scope="col">Type</th>
                  <th scope="col">Method</th>
                  <th scope="col">Account</th>
                  <th scope="col" className={a.num}>Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {dateTime(t.createdAt)}
                      <span className={a.sub}>{t.id}</span>
                    </td>
                    <td>
                      <Link to={`/admin/clients/${t.clientId}`} className={a.link}>
                        {t.clientName}
                      </Link>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td>{t.method}</td>
                    <td>{t.type === 'transfer' ? `#${t.fromId} → #${t.toId}` : `#${t.accountId}`}</td>
                    <td className={`${a.num} ${a.strong}`}>{usd(t.amount)}</td>
                    <td>
                      <StatusBadge state={t.status} />
                    </td>
                    <td>
                      {t.status === 'pending' && t.type !== 'transfer' && (
                        <div className={a.actions}>
                          <Button variant="secondary" className={`${a.small} ${a.danger}`} onClick={() => setRejecting(t)}>
                            Reject
                          </Button>
                          <Button className={a.small} onClick={() => approve(t)}>
                            Approve
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title={`Reject ${rejecting?.type ?? ''}?`}
        subtitle={rejecting && `${usd(rejecting.amount)} · ${rejecting.clientName} · ${rejecting.method}`}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button onClick={reject}>Reject</Button>
          </>
        }
      >
        <SelectField label="Reason shown to the client" options={REASONS} value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </div>
  )
}
