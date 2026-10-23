import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import Toggle from '../../components/ui/Toggle'
import { COUNTRIES } from '../../services/api'
import { getSection, saveListItem } from '../settingsApi'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import { ChipSelect, CopyValue, Grid, SecretField, Section, ToggleRow } from './fields'

const PROVIDERS = {
  internal: 'Internal transfer',
  checkout: 'Checkout.com',
  stripe: 'Stripe',
  nowpayments: 'NOWPayments',
  coinspaid: 'CoinsPaid',
  manual: 'Manual (bank details)',
}
const WEBHOOK_BASE = 'https://api.yourbroker.com/webhooks/payments'

function MethodDrawer({ method, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(method)
  const [error, setError] = useState('')
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const num = (k) => (e) => set(k)(Number(e.target.value.replace(/[^\d.]/g, '')) || 0)
  const isInternal = form.provider === 'internal'

  async function submit(e) {
    e.preventDefault()
    if (form.min > form.max) return setError('Minimum must be lower than the maximum')
    await saveListItem('payments', form)
    toast(`${form.name} saved`)
    onSaved()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={method.name}
      subtitle={PROVIDERS[method.provider]}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="method-form">
            Save method
          </Button>
        </>
      }
    >
      <form id="method-form" className={a.stack} onSubmit={submit} noValidate>
        <TextField label="Name shown to clients" value={form.name} onChange={(e) => set('name')(e.target.value)} />
        {!isInternal && (
          <>
            <SelectField
              label="Provider"
              options={Object.entries(PROVIDERS)
                .filter(([k]) => k !== 'internal')
                .map(([value, label]) => ({ value, label }))}
              value={form.provider}
              onChange={(e) => set('provider')(e.target.value)}
            />
            {form.provider !== 'manual' && (
              <>
                <SecretField label="Provider API key" value={form.apiKey} onChange={set('apiKey')} />
                <CopyValue label="Webhook URL (add this in the provider dashboard)" value={`${WEBHOOK_BASE}/${form.provider}`} />
              </>
            )}
          </>
        )}
        <Grid cols={3}>
          <TextField label="Fee (%)" inputMode="decimal" value={form.feePct} onChange={num('feePct')} />
          <TextField label="Minimum (USD)" inputMode="numeric" value={form.min} onChange={num('min')} error={error} />
          <TextField label="Maximum (USD)" inputMode="numeric" value={form.max} onChange={num('max')} />
        </Grid>
        <TextField label="Processing time shown to clients" value={form.processing} onChange={(e) => set('processing')(e.target.value)} />
        <div>
          <ToggleRow label="Deposits" checked={form.deposits} onChange={set('deposits')} />
          {!isInternal && <ToggleRow label="Withdrawals" checked={form.withdrawals} onChange={set('withdrawals')} />}
        </div>
        <ChipSelect
          label={form.countries.length ? 'Available only in these countries' : 'Available in all countries (pick countries to restrict)'}
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
          value={form.countries}
          onChange={set('countries')}
        />
      </form>
    </Drawer>
  )
}

export default function PaymentsSettings() {
  const toast = useToast()
  const [methods, setMethods] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    getSection('payments').then(setMethods)
  }, [])
  useEffect(load, [load])

  async function toggle(m) {
    await saveListItem('payments', { ...m, enabled: !m.enabled })
    toast(`${m.name} ${m.enabled ? 'turned off' : 'turned on'}`)
    load()
  }

  return (
    <Section title="Payment methods" description="Gateways clients can deposit and withdraw with. Changes apply to the client portal's Deposit page straight away.">
      {!methods ? (
        <div className={a.skeleton} />
      ) : (
        <div className={a.tableWrap}>
          <table className={a.table}>
            <thead>
              <tr>
                <th scope="col">On</th>
                <th scope="col">Method</th>
                <th scope="col">Provider</th>
                <th scope="col">Use</th>
                <th scope="col" className={a.num}>Fee</th>
                <th scope="col" className={a.num}>Limits (USD)</th>
                <th scope="col">Countries</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Toggle checked={m.enabled} onChange={() => toggle(m)} label={`Enable ${m.name}`} />
                  </td>
                  <td>
                    <span className={a.strong}>{m.name}</span>
                    <span className={a.sub}>{m.processing}</span>
                  </td>
                  <td>
                    {PROVIDERS[m.provider]}
                    {m.provider !== 'internal' && m.provider !== 'manual' && !m.apiKey.set && (
                      <>
                        {' '}
                        <StatusBadge state="pending" label="No API key" />
                      </>
                    )}
                  </td>
                  <td>{[m.deposits && 'Deposits', m.withdrawals && 'Withdrawals'].filter(Boolean).join(', ') || '—'}</td>
                  <td className={a.num}>{m.feePct}%</td>
                  <td className={a.num}>
                    {m.min.toLocaleString('en-US')} – {m.max.toLocaleString('en-US')}
                  </td>
                  <td>{m.countries.length ? m.countries.join(', ') : 'All'}</td>
                  <td className={a.num}>
                    <Button variant="secondary" className={a.small} onClick={() => setEditing(m)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <MethodDrawer
          key={editing.id}
          method={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </Section>
  )
}
