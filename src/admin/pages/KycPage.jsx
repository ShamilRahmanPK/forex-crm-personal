import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FileText } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import Segmented from '../../components/ui/Segmented'
import SelectField from '../../components/ui/SelectField'
import { COUNTRIES } from '../../services/api'
import { decideKyc, getClient, listKyc, REJECT_REASONS } from '../api'
import { dateTime, DOC_LABELS } from '../format'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import styles from './Kyc.module.css'

const VIEWS = [
  { value: 'pending', label: 'Waiting' },
  { value: 'all', label: 'All submissions' },
]
const countryName = (code) => COUNTRIES.find((c) => c.code === code)?.name ?? code ?? '—'

function ReviewDrawer({ item, onClose, onDecided }) {
  const toast = useToast()
  const [client, setClient] = useState(null)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState(REJECT_REASONS[0])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getClient(item.clientId).then(setClient)
  }, [item.clientId])

  async function decide(decision) {
    setBusy(true)
    await decideKyc(item.id, decision, decision === 'reject' ? reason : null)
    toast(decision === 'approve' ? `${item.clientName}: ${item.kind === 'address' ? 'address' : 'identity'} approved` : `${item.clientName}: document rejected`)
    onDecided()
  }

  const pages = item.kind === 'address' || item.docType === 'passport' ? ['Document'] : ['Front side', 'Back side']
  const pending = item.state === 'pending'

  return (
    <Drawer
      open
      onClose={onClose}
      title={item.kind === 'address' ? 'Proof of address' : 'Identity document'}
      subtitle={item.clientName}
      footer={
        pending &&
        (rejecting ? (
          <>
            <Button variant="secondary" onClick={() => setRejecting(false)}>
              Back
            </Button>
            <Button className={styles.reject} onClick={() => decide('reject')} disabled={busy}>
              Reject document
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button onClick={() => decide('approve')} disabled={busy}>
              Approve
            </Button>
          </>
        ))
      }
    >
      <div className={styles.review}>
        <dl className={a.fields}>
          <div>
            <dt>Document</dt>
            <dd>{DOC_LABELS[item.docType] ?? '—'}</dd>
          </div>
          {item.kind === 'identity' && (
            <div>
              <dt>Issuing country</dt>
              <dd>{countryName(item.country)}</dd>
            </div>
          )}
          <div>
            <dt>Submitted</dt>
            <dd>{dateTime(item.submittedAt)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge state={item.state} />
            </dd>
          </div>
        </dl>

        <div className={styles.files}>
          {pages.map((p) => (
            <figure key={p} className={styles.file}>
              <div className={styles.preview} aria-hidden="true">
                <FileText size={32} />
              </div>
              <figcaption>{p}</figcaption>
            </figure>
          ))}
        </div>
        <p className={a.muted}>File previews load from your document storage once the backend is connected.</p>

        <section className={styles.compare}>
          <h3>Compare with profile</h3>
          {!client ? (
            <p className={a.muted}>Loading profile…</p>
          ) : (
            <dl className={a.fields}>
              <div>
                <dt>Name on profile</dt>
                <dd>{client.name}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{countryName(client.country)}</dd>
              </div>
              {client.dateOfBirth && (
                <div>
                  <dt>Date of birth</dt>
                  <dd>{client.dateOfBirth}</dd>
                </div>
              )}
              {item.kind === 'address' && (
                <div>
                  <dt>Address on profile</dt>
                  <dd>{client.address ?? '—'}</dd>
                </div>
              )}
            </dl>
          )}
          <Link to={`/admin/clients/${item.clientId}`} className={a.link}>
            Open client profile
          </Link>
        </section>

        {rejecting && (
          <SelectField label="Reason shown to the client" options={REJECT_REASONS} value={reason} onChange={(e) => setReason(e.target.value)} />
        )}
      </div>
    </Drawer>
  )
}

export default function KycPage() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState('pending')
  const [items, setItems] = useState(null)
  const openId = params.get('open')

  const load = useCallback(() => {
    listKyc({ status: view }).then(setItems)
  }, [view])

  useEffect(load, [load])

  // Deep links (?open=) may point at a submission not in the current view.
  const [linked, setLinked] = useState(null)
  useEffect(() => {
    if (!openId) return
    let active = true
    listKyc({ status: 'all' }).then((all) => active && setLinked(all.find((i) => i.id === openId) ?? null))
    return () => {
      active = false
    }
  }, [openId])

  const close = () => {
    setLinked(null)
    setParams({}, { replace: true })
  }
  const open = openId ? (items?.find((i) => i.id === openId) ?? linked) : null

  return (
    <div className={a.page}>
      <div className={a.toolbar}>
        <Segmented label="Queue" options={VIEWS} value={view} onChange={setView} />
        <p className={`${a.muted} ${a.toolbarEnd}`}>Oldest submissions first</p>
      </div>

      <section className={a.panel}>
        {!items ? (
          <div className={a.skeleton} />
        ) : items.length === 0 ? (
          <p className={a.empty}>{view === 'pending' ? 'All caught up. No documents waiting for review.' : 'No submissions yet.'}</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col">Check</th>
                  <th scope="col">Document</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <span className={a.strong}>{i.clientName}</span>
                      <span className={a.sub}>{i.clientId}</span>
                    </td>
                    <td>{i.kind === 'address' ? 'Proof of address' : 'Identity'}</td>
                    <td>{DOC_LABELS[i.docType] ?? '—'}</td>
                    <td>{dateTime(i.submittedAt)}</td>
                    <td>
                      <StatusBadge state={i.state} />
                    </td>
                    <td className={a.num}>
                      <Button variant={i.state === 'pending' ? 'primary' : 'secondary'} className={a.small} onClick={() => setParams({ open: i.id })}>
                        {i.state === 'pending' ? 'Review' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open && (
        <ReviewDrawer
          key={open.id}
          item={open}
          onClose={close}
          onDecided={() => {
            close()
            load()
          }}
        />
      )}
    </div>
  )
}
