import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import Segmented from '../../components/ui/Segmented'
import { TICKET_TOPICS } from '../../config/support'
import { useAdminAuth } from '../AdminAuth'
import { listAdminTickets, replyToTicket, setTicketStatus } from '../api'
import { dateTime } from '../format'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import styles from './Tickets.module.css'

const VIEWS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
]
const topicName = (id) => TICKET_TOPICS.find((t) => t.id === id)?.title ?? id

function TicketDrawer({ ticket, onClose, onChanged }) {
  const toast = useToast()
  const { staff } = useAdminAuth()
  const [current, setCurrent] = useState(ticket)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e) {
    e.preventDefault()
    if (!reply.trim()) return
    setBusy(true)
    const updated = await replyToTicket(current.id, reply, staff.name)
    setCurrent((c) => ({ ...c, ...updated }))
    setReply('')
    setBusy(false)
    toast('Reply sent to the client')
    onChanged()
  }

  async function toggleStatus() {
    const status = current.status === 'open' ? 'resolved' : 'open'
    await setTicketStatus(current.id, status)
    setCurrent((c) => ({ ...c, status }))
    toast(status === 'resolved' ? 'Ticket resolved' : 'Ticket reopened')
    onChanged()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={current.subject}
      subtitle={`#${current.id} · ${topicName(current.topic)}`}
      footer={
        <Button variant="secondary" onClick={toggleStatus}>
          {current.status === 'open' ? 'Mark as resolved' : 'Reopen ticket'}
        </Button>
      }
    >
      <div className={styles.meta}>
        <StatusBadge state={current.status} />
        <Link to={`/admin/clients/${current.clientId}`} className={a.link}>
          {current.clientName}
        </Link>
        <span className={a.muted}>{dateTime(current.createdAt)}</span>
      </div>

      <ol className={styles.thread}>
        {current.messages.map((m, i) => (
          <li key={i} className={m.from === 'staff' ? styles.staff : styles.client}>
            <p>{m.text}</p>
            <small>
              {m.from === 'staff' ? m.author ?? 'Staff' : current.clientName} · {dateTime(m.at)}
            </small>
          </li>
        ))}
      </ol>

      <form className={styles.reply} onSubmit={send}>
        <label htmlFor="ticket-reply" className={a.muted}>
          Reply to client
        </label>
        <textarea id="ticket-reply" rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Your reply is emailed to the client" />
        <Button type="submit" disabled={busy || !reply.trim()}>
          Send reply
        </Button>
      </form>
    </Drawer>
  )
}

export default function TicketsPage() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState(params.get('open') ? 'all' : 'open')
  const [tickets, setTickets] = useState(null)
  const openId = params.get('open')

  const load = useCallback(() => {
    listAdminTickets({ status: view }).then(setTickets)
  }, [view])

  useEffect(load, [load])

  const open = openId ? tickets?.find((t) => t.id === openId) : null

  return (
    <div className={a.page}>
      <div className={a.toolbar}>
        <Segmented label="Tickets" options={VIEWS} value={view} onChange={setView} />
      </div>

      <section className={a.panel}>
        {!tickets ? (
          <div className={a.skeleton} />
        ) : tickets.length === 0 ? (
          <p className={a.empty}>No tickets here.</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Client</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Last update</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className={a.rowLink} onClick={() => setParams({ open: t.id })}>
                    <td>
                      <button type="button" className={`${a.link} ${styles.subject}`} onClick={() => setParams({ open: t.id })}>
                        {t.subject}
                      </button>
                      <span className={a.sub}>
                        #{t.id} · {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>{t.clientName}</td>
                    <td>{topicName(t.topic)}</td>
                    <td>{dateTime(t.messages.at(-1)?.at ?? t.createdAt)}</td>
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

      {open && <TicketDrawer key={open.id} ticket={open} onClose={() => setParams({}, { replace: true })} onChanged={load} />}
    </div>
  )
}
