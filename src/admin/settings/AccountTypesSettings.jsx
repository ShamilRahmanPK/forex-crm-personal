import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import Toggle from '../../components/ui/Toggle'
import { LEVERAGE_CHOICES } from '../../services/platformConfig'
import { getSection, listGroups, saveListItem } from '../settingsApi'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import { Callout, ChipSelect, Grid, Section } from './fields'

const CATEGORIES = ['Standard accounts', 'Professional accounts']

function TypeDrawer({ type, groups, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(type)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const num = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value.replace(/\D/g, '')) || 0 }))
  const groupOptions = (kind) => [{ value: '', label: 'Not mapped' }, ...groups.filter((g) => g.kind === kind).map((g) => ({ value: g.path, label: `${g.path} · ${g.currency} · ${g.serverName}` }))]

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter a name')
    if (!form.leverages.length) return setError('Pick at least one leverage option')
    const defaultLeverage = form.leverages.includes(form.defaultLeverage) ? form.defaultLeverage : Math.min(...form.leverages)
    await saveListItem('accountTypes', { ...form, defaultLeverage })
    toast(`${form.name} saved`)
    onSaved()
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`Edit ${type.name}`}
      subtitle="Shown to clients on the Open account page"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="type-form">
            Save account type
          </Button>
        </>
      }
    >
      <form id="type-form" className={a.stack} onSubmit={submit} noValidate>
        <Grid>
          <TextField label="Name" value={form.name} onChange={set('name')} error={error} />
          <SelectField label="Category" options={CATEGORIES} value={form.category} onChange={set('category')} />
        </Grid>
        <TextField label="Description" value={form.description} onChange={set('description')} />
        <Grid>
          <TextField label="Badge (optional)" placeholder="e.g. Recommended" value={form.badge} onChange={set('badge')} />
          <TextField label="Minimum deposit (USD)" inputMode="numeric" value={form.minDeposit} onChange={num('minDeposit')} />
          <TextField label="Spread from" value={form.minSpread} onChange={set('minSpread')} />
          <TextField label="Commission" value={form.commission} onChange={set('commission')} />
        </Grid>

        <ChipSelect
          label="Leverage options clients can choose"
          options={LEVERAGE_CHOICES.map((l) => ({ value: l, label: `1:${l}` }))}
          value={form.leverages}
          onChange={(leverages) => setForm((f) => ({ ...f, leverages: leverages.sort((x, y) => x - y) }))}
        />
        <Grid>
          <SelectField
            label="Default leverage"
            options={form.leverages.map((l) => ({ value: String(l), label: `1:${l}` }))}
            value={String(form.defaultLeverage)}
            onChange={(e) => setForm((f) => ({ ...f, defaultLeverage: Number(e.target.value) }))}
          />
          <TextField label="Demo starting balance (USD)" inputMode="numeric" value={form.demoBalance} onChange={num('demoBalance')} />
        </Grid>

        <h3 className={a.panelTitle}>MT5 groups</h3>
        {groups.length === 0 && (
          <Callout>
            No groups synced yet. Connect a server and sync its groups in <Link to="../servers">MT5 servers</Link>.
          </Callout>
        )}
        <SelectField
          label="Live accounts are created in"
          options={groupOptions('real')}
          value={form.groups.real}
          onChange={(e) => setForm((f) => ({ ...f, groups: { ...f.groups, real: e.target.value } }))}
        />
        <SelectField
          label="Demo accounts are created in"
          options={groupOptions('demo')}
          value={form.groups.demo}
          onChange={(e) => setForm((f) => ({ ...f, groups: { ...f.groups, demo: e.target.value } }))}
        />
      </form>
    </Drawer>
  )
}

export default function AccountTypesSettings() {
  const toast = useToast()
  const [types, setTypes] = useState(null)
  const [groups, setGroups] = useState([])
  const [editing, setEditing] = useState(null)

  const load = useCallback(() => {
    getSection('accountTypes').then(setTypes)
    listGroups().then(setGroups)
  }, [])
  useEffect(load, [load])

  async function toggle(t) {
    if (t.enabled && types.filter((x) => x.enabled).length === 1) {
      toast('Keep at least one account type enabled', { tone: 'info' })
      return
    }
    await saveListItem('accountTypes', { ...t, enabled: !t.enabled })
    toast(`${t.name} ${t.enabled ? 'hidden from' : 'shown to'} clients`)
    load()
  }

  return (
    <Section title="Account types" description="What clients can open, and which MT5 group each new account goes into. Turned-off types disappear from the client portal.">
      {!types ? (
        <div className={a.skeleton} />
      ) : (
        <div className={a.tableWrap}>
          <table className={a.table}>
            <thead>
              <tr>
                <th scope="col">Shown</th>
                <th scope="col">Type</th>
                <th scope="col" className={a.num}>Min deposit</th>
                <th scope="col">Leverage</th>
                <th scope="col">Live group</th>
                <th scope="col">Demo group</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Toggle checked={t.enabled} onChange={() => toggle(t)} label={`Show ${t.name} to clients`} />
                  </td>
                  <td>
                    <span className={a.strong}>{t.name}</span>
                    <span className={a.sub}>{t.category}</span>
                  </td>
                  <td className={a.num}>{t.minDeposit.toLocaleString('en-US')} USD</td>
                  <td>
                    up to 1:{Math.max(...t.leverages)} <span className={a.sub}>default 1:{t.defaultLeverage}</span>
                  </td>
                  <td>{t.groups.real ? <code>{t.groups.real}</code> : <StatusBadge state="pending" label="Not mapped" />}</td>
                  <td>{t.groups.demo ? <code>{t.groups.demo}</code> : <StatusBadge state="pending" label="Not mapped" />}</td>
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
      {types?.some((t) => t.enabled && (!t.groups.real || !t.groups.demo)) && (
        <Callout>Account types without an MT5 group can&apos;t create accounts once a real server is connected. Map every enabled type before going live.</Callout>
      )}

      {editing && (
        <TypeDrawer
          key={editing.id}
          type={editing}
          groups={groups}
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
