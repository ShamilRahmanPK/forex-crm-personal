import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Apps, ChevronLeft, Coins, Gift, ScanFace, Server, Trading, UserCircle } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { TICKET_TOPICS } from '../../config/support'
import { createTicket } from '../../services/api'
import page from '../../styles/page.module.css'
import styles from './Support.module.css'

const ICONS = { coins: Coins, user: UserCircle, apps: Apps, scan: ScanFace, trading: Trading, gift: Gift, server: Server }
const MAX_FILE = 10 * 1024 * 1024

export default function NewTicketPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [topic, setTopic] = useState(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!subject.trim()) next.subject = 'Please enter a subject'
    if (description.trim().length < 10) next.description = 'Please describe your issue (at least 10 characters)'
    if (file && file.size > MAX_FILE) next.file = 'Attachments must be 10 MB or smaller'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)
    try {
      const ticket = await createTicket({ topic: topic.id, subject, description, attachment: file })
      toast(`Ticket #${ticket.id} created. We'll reply by email.`)
      navigate('/pa/support#tickets')
    } catch (err) {
      setErrors({ form: err.message })
      setSubmitting(false)
    }
  }

  if (!topic) {
    return (
      <div className={page.page}>
        <h1 className={page.title}>Open a ticket</h1>
        <p className={styles.intro}>Please select a topic for your inquiry so we can assist you better:</p>
        <div className={styles.topicGrid}>
          {TICKET_TOPICS.map((t) => {
            const Icon = ICONS[t.icon] ?? Apps
            return (
              <button key={t.id} type="button" className={styles.topic} onClick={() => setTopic(t)}>
                <Icon size={34} />
                <span className={styles.topicTitle}>{t.title}</span>
                <span className={styles.topicDesc}>{t.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={page.page}>
      <button type="button" className={styles.back} onClick={() => setTopic(null)}>
        <ChevronLeft size={20} /> Change topic
      </button>
      <h1 className={page.title}>{topic.title}</h1>
      <p className={styles.intro}>{topic.description}</p>

      <form className={styles.ticketForm} onSubmit={handleSubmit} noValidate>
        <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} error={errors.subject} maxLength={120} data-autofocus />
        <label className={styles.textareaField}>
          <span>Description</span>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={Boolean(errors.description)}
            placeholder="Tell us what happened, including any order or transaction numbers"
            maxLength={4000}
          />
          {errors.description && (
            <small className={styles.error} role="alert">
              {errors.description}
            </small>
          )}
        </label>
        <label className={styles.textareaField}>
          <span>Attachment (optional)</span>
          <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0] ?? null)} />
          <small className={errors.file ? styles.error : styles.muted}>{errors.file ?? 'JPG, PNG or PDF up to 10 MB'}</small>
        </label>
        {errors.form && (
          <p className={styles.error} role="alert">
            {errors.form}
          </p>
        )}
        <div className={styles.formActions}>
          <Button variant="secondary" onClick={() => navigate('/pa/support')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit ticket'}
          </Button>
        </div>
      </form>
    </div>
  )
}
