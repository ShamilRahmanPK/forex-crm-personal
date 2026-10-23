import { useState } from 'react'
import Button from '../../components/ui/Button'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { sendTestSms } from '../settingsApi'
import { Grid, SecretField, Section, ToggleRow } from './fields'
import styles from './Settings.module.css'
import { useSection } from './useSection'

const PROVIDERS = {
  twilio: { label: 'Twilio', id: 'Account SID', token: 'Auth token' },
  vonage: { label: 'Vonage', id: 'API key', token: 'API secret' },
  messagebird: { label: 'MessageBird', id: 'Workspace ID', token: 'Access key' },
  infobip: { label: 'Infobip', id: 'Base URL', token: 'API key' },
}

export default function SmsSettings() {
  const { form, set, save, saving, dirty } = useSection('sms', { successMessage: 'SMS settings saved' })
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [testing, setTesting] = useState(false)
  if (!form) return null
  const p = PROVIDERS[form.provider]

  async function runTest() {
    setTesting(true)
    setResult(null)
    try {
      if (dirty) await save()
      setResult({ ok: true, message: (await sendTestSms(phone)).message })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <Section title="SMS" description="Used for phone number verification codes and optional security alerts." onSave={save} saving={saving} dirty={dirty}>
        <ToggleRow
          label="Send SMS verification codes"
          description="When off, clients confirm their phone number without a code."
          checked={form.enabled}
          onChange={set('enabled')}
        />
        <SelectField
          label="Provider"
          options={Object.entries(PROVIDERS).map(([value, x]) => ({ value, label: x.label }))}
          value={form.provider}
          onChange={(e) => set('provider')(e.target.value)}
        />
        <Grid>
          <TextField label={p.id} value={form.accountId} onChange={(e) => set('accountId')(e.target.value)} />
          <SecretField label={p.token} value={form.authToken} onChange={set('authToken')} />
        </Grid>
        <TextField
          label="Sender"
          value={form.sender}
          onChange={(e) => set('sender')(e.target.value)}
          placeholder="+14155550100 or YourBrand"
          hint="Alphanumeric sender names need to be registered in some countries (e.g. UAE, Saudi Arabia, India)."
        />
      </Section>

      <Section title="Send a test SMS">
        <div className={styles.inline}>
          <TextField label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971501234567" />
          <Button onClick={runTest} disabled={testing || !phone}>
            {testing ? 'Sending…' : 'Send test'}
          </Button>
        </div>
        {result && (
          <p className={`${styles.result} ${result.ok ? styles.resultOk : styles.resultErr}`} role="status">
            {result.message}
          </p>
        )}
      </Section>
    </>
  )
}
