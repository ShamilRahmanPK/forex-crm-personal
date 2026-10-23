import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import Toggle from '../../components/ui/Toggle'
import { useBrand } from '../../context/BrandContext'
import { dateTime } from '../format'
import { getSection, resetTemplate, saveTemplate, sendTestEmail } from '../settingsApi'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import { Callout, Grid, SecretField, Section } from './fields'
import styles from './Settings.module.css'
import { useSection } from './useSection'

const PROVIDERS = [
  { value: 'smtp', label: 'SMTP server' },
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'ses', label: 'Amazon SES' },
]
const ENCRYPTION = [
  { value: 'tls', label: 'STARTTLS (port 587)' },
  { value: 'ssl', label: 'SSL/TLS (port 465)' },
  { value: 'none', label: 'None (not recommended)' },
]
const VARIABLES = ['first_name', 'company', 'portal_link', 'code', 'reset_link', 'reason', 'account_type', 'server', 'login', 'amount', 'method']

function sample(brand) {
  return {
    first_name: 'Shamil',
    company: brand.name,
    portal_link: 'https://portal.yourbroker.com',
    code: '483 920',
    reset_link: 'https://portal.yourbroker.com/reset/••••',
    reason: 'the document has expired',
    account_type: 'Standard',
    server: 'TradeCRM-MT5Real01',
    login: '484035406',
    amount: '250.00 USD',
    method: 'Bank Transfer',
  }
}
const fill = (text, values) => text.replace(/\{\{(\w+)\}\}/g, (m, key) => values[key] ?? m)

function TemplateDrawer({ template, onClose, onSaved }) {
  const brand = useBrand()
  const toast = useToast()
  const [form, setForm] = useState(template)
  const [error, setError] = useState('')
  const bodyRef = useRef(null)
  const values = sample(brand)

  function insert(variable) {
    const el = bodyRef.current
    const token = `{{${variable}}}`
    const start = el?.selectionStart ?? form.body.length
    const end = el?.selectionEnd ?? form.body.length
    setForm((f) => ({ ...f, body: f.body.slice(0, start) + token + f.body.slice(end) }))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  async function submit(e) {
    e.preventDefault()
    try {
      await saveTemplate(form)
      toast(`"${form.name}" template saved`)
      onSaved()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={template.name}
      subtitle="Email template"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={async () => {
              await resetTemplate(template.id)
              toast('Template restored to the default text')
              onSaved()
            }}
          >
            Restore default
          </Button>
          <Button type="submit" form="template-form">
            Save template
          </Button>
        </>
      }
    >
      <form id="template-form" className={a.stack} onSubmit={submit} noValidate>
        <TextField label="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} error={error} />
        <div className={styles.field}>
          <label htmlFor="template-body" className={styles.label}>
            Message
          </label>
          <textarea id="template-body" ref={bodyRef} rows={9} className={styles.textarea} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <div className={styles.templateVars} aria-label="Insert variable">
            {VARIABLES.map((v) => (
              <button key={v} type="button" onClick={() => insert(v)}>{`{{${v}}}`}</button>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Preview with sample data</span>
          <div className={styles.preview}>
            <p className={styles.previewSubject}>{fill(form.subject, values)}</p>
            {fill(form.body, values)}
          </div>
        </div>
      </form>
    </Drawer>
  )
}

export default function EmailSettings() {
  const toast = useToast()
  const { form, set, save, saving, dirty, reload } = useSection('email', { successMessage: 'Email settings saved' })
  const [templates, setTemplates] = useState(null)
  const [editing, setEditing] = useState(null)
  const [testTo, setTestTo] = useState('')
  const [test, setTest] = useState(null)
  const [testing, setTesting] = useState(false)

  const loadTemplates = () => getSection('templates').then(setTemplates)
  useEffect(() => {
    loadTemplates()
  }, [])

  if (!form) return null
  const text = (key) => ({ value: form[key], onChange: (e) => set(key)(e.target.value) })

  async function runTest() {
    setTesting(true)
    setTest(null)
    try {
      if (dirty) await save()
      const r = await sendTestEmail(testTo)
      setTest({ ok: true, message: r.message })
      reload()
    } catch (err) {
      setTest({ ok: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <Section
        title="Email delivery"
        description="How the CRM sends verification codes, notifications and statements."
        onSave={save}
        saving={saving}
        dirty={dirty}
        actions={form.verifiedAt ? <StatusBadge state="approved" label={`Working · tested ${dateTime(form.verifiedAt)}`} /> : <StatusBadge state="pending" label="Not tested" />}
      >
        <SelectField label="Provider" options={PROVIDERS} {...text('provider')} />
        {form.provider === 'smtp' ? (
          <>
            <Grid>
              <TextField label="SMTP host" placeholder="smtp.yourdomain.com" {...text('host')} />
              <TextField label="Port" inputMode="numeric" value={form.port} onChange={(e) => set('port')(Number(e.target.value) || '')} />
              <TextField label="Username" autoComplete="off" {...text('username')} />
              <SecretField label="Password" value={form.password} onChange={set('password')} />
            </Grid>
            <SelectField label="Encryption" options={ENCRYPTION} {...text('encryption')} />
          </>
        ) : (
          <Grid>
            <SecretField label={`${PROVIDERS.find((p) => p.value === form.provider).label} API key`} value={form.apiKey} onChange={set('apiKey')} />
            {form.provider === 'mailgun' && <TextField label="Sending domain" placeholder="mg.yourdomain.com" {...text('domain')} />}
            {form.provider === 'ses' && (
              <SelectField label="AWS region" options={['us-east-1', 'eu-west-1', 'eu-central-1', 'me-central-1', 'ap-southeast-1']} {...text('region')} />
            )}
          </Grid>
        )}
      </Section>

      <Section title="Sender" description="What clients see in their inbox." onSave={save} saving={saving} dirty={dirty}>
        <Grid cols={3}>
          <TextField label="From name" {...text('fromName')} />
          <TextField label="From email" type="email" placeholder="no-reply@yourbroker.com" {...text('fromEmail')} />
          <TextField label="Reply-to (optional)" type="email" placeholder="support@yourbroker.com" {...text('replyTo')} />
        </Grid>
        <Callout>Add SPF, DKIM and DMARC records for the sender domain, or verification emails will land in spam.</Callout>
      </Section>

      <Section title="Send a test email" description="Saves your changes, then sends a sample message through the provider.">
        <div className={styles.inline}>
          <TextField label="Send to" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@yourbroker.com" />
          <Button onClick={runTest} disabled={testing || !testTo}>
            {testing ? 'Sending…' : 'Send test'}
          </Button>
        </div>
        {test && (
          <p className={`${styles.result} ${test.ok ? styles.resultOk : styles.resultErr}`} role="status">
            {test.message}
          </p>
        )}
      </Section>

      <Section title="Email templates" description="Text of each automatic email. Use {{variables}} for client-specific values.">
        {!templates ? (
          <div className={a.skeleton} />
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th scope="col">Sent</th>
                  <th scope="col">Template</th>
                  <th scope="col">Subject</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Toggle
                        checked={t.enabled}
                        label={`Send ${t.name}`}
                        onChange={async () => {
                          await saveTemplate({ ...t, enabled: !t.enabled })
                          toast(`${t.name} emails ${t.enabled ? 'turned off' : 'turned on'}`)
                          loadTemplates()
                        }}
                      />
                    </td>
                    <td className={a.strong}>{t.name}</td>
                    <td style={{ whiteSpace: 'normal' }}>{t.subject}</td>
                    <td className={a.num}>
                      <Button variant="secondary" className={a.small} onClick={() => setEditing(t)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {editing && (
        <TemplateDrawer
          key={editing.id}
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            loadTemplates()
          }}
        />
      )}
    </>
  )
}
