import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Segmented from '../../components/ui/Segmented'
import SelectField from '../../components/ui/SelectField'
import { COUNTRIES } from '../../services/api'
import { useAdminAuth } from '../AdminAuth'
import { addClientNote, getClient, MANAGER_OPTIONS, setClientManager, setClientStatus } from '../api'
import { dateOnly, dateTime, DOC_LABELS, usd } from '../format'
import { Country, StatusBadge } from '../ui'
import a from '../admin.module.css'
import styles from './ClientDetail.module.css'

const TABS = [
  { value: 'accounts', label: 'Accounts' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'documents', label: 'Documents' },
  { value: 'tickets', label: 'Tickets' },
]

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { staff, can } = useAdminAuth()
  const [client, setClient] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('accounts')
  const [note, setNote] = useState('')
  const [confirm, setConfirm] = useState(false)

  const load = useCallback(() => {
    getClient(id)
      .then(setClient)
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(load, [load])

  if (error) {
    return (
      <div className={a.page}>
        <p className={a.empty}>
          {error}. <Link to="/admin/clients">Back to clients</Link>
        </p>
      </div>
    )
  }
  if (!client) return <div className={a.page}><div className={a.skeleton} /></div>

  const suspended = client.status === 'suspended'

  async function toggleStatus() {
    await setClientStatus(client.id, suspended ? 'active' : 'suspended')
    setConfirm(false)
    toast(suspended ? 'Client reactivated' : 'Client suspended')
    load()
  }

  async function saveNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    await addClientNote(client.id, note, staff.name)
    setNote('')
    load()
  }

  return (
    <div className={a.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/admin/clients')}>
        <ChevronLeft size={18} /> All clients
      </button>

      <section className={`${a.panel} ${styles.header}`}>
        <div className={styles.avatar} aria-hidden="true">
          {client.firstName[0]}
          {client.lastName[0] ?? ''}
        </div>
        <div className={styles.identity}>
          <h2 className={styles.name}>
            {client.name} {client.live && <StatusBadge state="open" label="Demo user" />}
          </h2>
          <p className={a.muted}>
            {client.id} · {client.email} · {client.phone}
          </p>
          <div className={styles.badges}>
            <StatusBadge state={client.status} />
            <StatusBadge state={client.kyc} label={`ID: ${client.kyc === 'approved' ? 'verified' : client.kyc === 'none' ? 'not started' : client.kyc}`} />
            <StatusBadge state={client.addressKyc} label={`Address: ${client.addressKyc === 'approved' ? 'verified' : client.addressKyc === 'none' ? 'not started' : client.addressKyc}`} />
          </div>
        </div>
        <div className={styles.headerStats}>
          <p className={a.muted}>Live balance</p>
          <p className={styles.balance}>{usd(client.balance)}</p>
        </div>
        <div className={styles.headerActions}>
          {can('kyc') && client.kyc === 'pending' && (
            <Button className={a.small} to={`/admin/kyc?open=${encodeURIComponent(`${client.id}:identity`)}`}>
              Review ID
            </Button>
          )}
          <Button variant="secondary" className={`${a.small} ${suspended ? '' : a.danger}`} onClick={() => setConfirm(true)}>
            {suspended ? 'Reactivate' : 'Suspend'}
          </Button>
        </div>
      </section>

      <div className={a.twoCol}>
        <div className={a.stack}>
          <Segmented label="Client sections" options={TABS} value={tab} onChange={setTab} />

          {tab === 'accounts' && (
            <section className={a.panel}>
              <div className={a.tableWrap}>
                <table className={a.table}>
                  <thead>
                    <tr>
                      <th scope="col">Account</th>
                      <th scope="col">Type</th>
                      <th scope="col">Mode</th>
                      <th scope="col">Leverage</th>
                      <th scope="col" className={a.num}>Balance</th>
                      <th scope="col" className={a.num}>Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.accounts.map((acc) => (
                      <tr key={acc.id}>
                        <td className={a.strong}>#{acc.id}</td>
                        <td>{acc.type}</td>
                        <td>{acc.mode === 'demo' ? 'Demo' : 'Live'}</td>
                        <td>1:{acc.leverage}</td>
                        <td className={a.num}>{usd(acc.balance)}</td>
                        <td className={a.num}>{usd(acc.equity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === 'transactions' && (
            <section className={a.panel}>
              {client.transactions.length === 0 ? (
                <p className={a.empty}>No transactions yet.</p>
              ) : (
                <div className={a.tableWrap}>
                  <table className={a.table}>
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Type</th>
                        <th scope="col">Method</th>
                        <th scope="col" className={a.num}>Amount</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{dateTime(t.createdAt)}</td>
                          <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                          <td>{t.method}</td>
                          <td className={a.num}>{usd(t.amount)}</td>
                          <td>
                            <StatusBadge state={t.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === 'documents' && (
            <section className={`${a.panel} ${a.panelBody}`}>
              <dl className={a.fields}>
                <div>
                  <dt>Identity</dt>
                  <dd>
                    <StatusBadge state={client.kyc} />
                    {client.kycSubmission && (
                      <span className={a.sub}>
                        {DOC_LABELS[client.kycSubmission.docType] ?? 'Document'} · submitted {dateTime(client.kycSubmission.submittedAt)}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Proof of address</dt>
                  <dd>
                    <StatusBadge state={client.addressKyc} />
                    {client.addressSubmission && (
                      <span className={a.sub}>
                        {DOC_LABELS[client.addressSubmission.docType] ?? 'Document'} · submitted {dateTime(client.addressSubmission.submittedAt)}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {tab === 'tickets' && (
            <section className={a.panel}>
              {client.tickets.length === 0 ? (
                <p className={a.empty}>No support tickets.</p>
              ) : (
                <ul className={styles.ticketList}>
                  {client.tickets.map((t) => (
                    <li key={t.id}>
                      <Link to={`/admin/tickets?open=${t.id}`}>
                        <span>
                          <strong>{t.subject}</strong>
                          <small>
                            #{t.id} · {dateTime(t.createdAt)}
                          </small>
                        </span>
                        <StatusBadge state={t.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <aside className={a.stack}>
          <section className={a.panel}>
            <div className={a.panelHead}>
              <h3 className={a.panelTitle}>Profile</h3>
            </div>
            <dl className={`${a.fields} ${a.panelBody} ${styles.profile}`}>
              <div>
                <dt>Country</dt>
                <dd>
                  <Country code={client.country} /> {COUNTRIES.find((c) => c.code === client.country)?.name}
                </dd>
              </div>
              {client.address && (
                <div>
                  <dt>Address</dt>
                  <dd>{client.address}</dd>
                </div>
              )}
              <div>
                <dt>Registered</dt>
                <dd>{dateOnly(client.registeredAt)}</dd>
              </div>
              <div>
                <dt>Last sign-in</dt>
                <dd>{dateTime(client.lastLogin)}</dd>
              </div>
              <div>
                <SelectField
                  label="Account manager"
                  options={MANAGER_OPTIONS}
                  value={client.manager}
                  onChange={async (e) => {
                    await setClientManager(client.id, e.target.value)
                    toast('Account manager updated')
                    load()
                  }}
                />
              </div>
            </dl>
          </section>

          <section className={a.panel}>
            <div className={a.panelHead}>
              <h3 className={a.panelTitle}>Internal notes</h3>
            </div>
            <form className={`${a.panelBody} ${styles.noteForm}`} onSubmit={saveNote}>
              <label htmlFor="client-note" className="visually-hidden">
                New note
              </label>
              <textarea id="client-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible to staff only" />
              <Button type="submit" variant="secondary" className={a.small} disabled={!note.trim()}>
                Add note
              </Button>
            </form>
            {client.notes.length > 0 && (
              <ul className={styles.notes}>
                {client.notes.map((n) => (
                  <li key={n.id}>
                    <p>{n.text}</p>
                    <small>
                      {n.author} · {dateTime(n.at)}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={suspended ? `Reactivate ${client.name}?` : `Suspend ${client.name}?`}
        subtitle={suspended ? 'They will be able to sign in, deposit and trade again.' : 'They will be signed out and blocked from signing in, depositing and withdrawing until reactivated.'}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={toggleStatus}>{suspended ? 'Reactivate client' : 'Suspend client'}</Button>
          </>
        }
      />
    </div>
  )
}
