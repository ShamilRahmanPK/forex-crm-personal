import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertCircle, Chat, Phone2, Plus, Search } from '../../components/icons'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import EmptyState from '../../components/ui/EmptyState'
import { useBrand } from '../../context/BrandContext'
import { FAQ, TICKET_TOPICS } from '../../config/support'
import { getTickets } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './Support.module.css'

const STATUS_FILTERS = [
  { value: 'all', label: 'Active statuses: All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
]

export default function SupportHubPage() {
  const brand = useBrand()
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [tickets, setTickets] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [ticketSearch, setTicketSearch] = useState('')

  useEffect(() => {
    getTickets().then(setTickets)
  }, [])

  // Support "#tickets" deep links from other pages.
  useEffect(() => {
    if (hash === '#tickets' && tickets) document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, tickets])

  const faqResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? FAQ.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q)) : []
  }, [query])

  const visibleTickets = (tickets ?? [])
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => `${t.id} ${t.subject}`.toLowerCase().includes(ticketSearch.trim().toLowerCase()))

  const startChat = () => window.open(brand.liveChatUrl ?? `mailto:${brand.supportEmail}`, '_blank', 'noopener')

  return (
    <div className={page.page}>
      <h1 className={page.title}>Support hub</h1>

      <section className={styles.searchPanel}>
        <h2 className={styles.panelTitle}>How can we help you?</h2>
        <p>Find answers, troubleshoot issues and explore guides.</p>
        <form className={styles.searchBox} role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Please enter your question or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles"
          />
          <button type="submit" aria-label="Search">
            <Search size={20} />
          </button>
        </form>
        {query.trim() && (
          <div className={styles.faq} aria-live="polite">
            {faqResults.length === 0 ? (
              <p className={styles.muted}>No articles found. Try other keywords or open a ticket below.</p>
            ) : (
              faqResults.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))
            )}
          </div>
        )}
      </section>

      <h2 className={`${page.sectionTitle} ${styles.sectionGap}`}>Contact us</h2>
      <div className={styles.contactGrid}>
        <article className={styles.contactCard}>
          <div className={`${styles.art} ${styles.artTicket}`} aria-hidden="true" />
          <div className={styles.contactBody}>
            <h3>Need assistance?</h3>
            <p>Complete the form and we will get back to you shortly.</p>
            <Button to="/pa/support/tickets/new" block icon={<Plus />}>
              Open a ticket
            </Button>
          </div>
        </article>
        <article className={styles.contactCard}>
          <div className={`${styles.art} ${styles.artChat}`} aria-hidden="true" />
          <div className={styles.contactBody}>
            <h3>Live chat</h3>
            <p>Can&apos;t find what you&apos;re looking for? Chat with our support team.</p>
            <Button variant="secondary" block icon={<Chat />} onClick={startChat}>
              Start chat
            </Button>
          </div>
        </article>
        <article className={styles.contactCard}>
          <div className={`${styles.art} ${styles.artPhone}`} aria-hidden="true" />
          <div className={styles.contactBody}>
            <h3>Still need help?</h3>
            <p>To speak with our support team, call us at</p>
            <a href={`tel:${brand.supportPhone.replace(/\s/g, '')}`} className={styles.phone}>
              <Phone2 size={20} />
              {brand.supportPhone}
            </a>
          </div>
        </article>
      </div>

      <h2 id="tickets" className={`${page.sectionTitle} ${styles.sectionGap}`}>
        My tickets
      </h2>
      <section className={styles.ticketsPanel}>
        <div className={styles.ticketsToolbar}>
          <Dropdown variant="pill" label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
          <label className={styles.ticketSearch}>
            <Search size={18} />
            <input type="search" placeholder="Search…" value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} aria-label="Search tickets" />
          </label>
        </div>

        {tickets && visibleTickets.length === 0 ? (
          <EmptyState size="lg" icon={<AlertCircle size={56} strokeWidth="1.3" />} title={tickets.length ? 'No tickets match your search' : "You don't have any tickets"} />
        ) : (
          <ul className={styles.ticketList}>
            {visibleTickets.map((t) => (
              <li key={t.id}>
                <div>
                  <p className={styles.ticketSubject}>{t.subject}</p>
                  <p className={styles.muted}>
                    #{t.id} · {TICKET_TOPICS.find((x) => x.id === t.topic)?.title} · {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`${page.status} ${t.status === 'open' ? page.statusPending : page.statusDone}`}>{t.status === 'open' ? 'Open' : 'Resolved'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
