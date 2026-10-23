import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Plus } from '../../components/icons'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { dateTime } from '../format'
import { deleteServer, listServers, saveServer, syncGroups, testServer } from '../settingsApi'
import { StatusBadge } from '../ui'
import a from '../admin.module.css'
import { Callout, Grid, SecretField, Section } from './fields'
import styles from './Settings.module.css'

const STATUS = {
  connected: ['approved', 'Connected'],
  failed: ['rejected', 'Connection failed'],
  'not-tested': ['none', 'Not tested'],
}
const EMPTY = { name: '', kind: 'real', host: '', port: 443, managerLogin: '', password: '', timeout: 10 }

function ServerDrawer({ server, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(server ?? EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === 'port' || k === 'timeout' ? Number(e.target.value) || '' : e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await saveServer(form)
      toast(server ? 'Server updated. Test the connection again.' : 'Server added. Test the connection next.')
      onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={server ? 'Edit MT5 server' : 'Add MT5 server'}
      subtitle="Manager API connection"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="server-form" disabled={saving}>
            {saving ? 'Saving…' : 'Save server'}
          </Button>
        </>
      }
    >
      <form id="server-form" className={a.stack} onSubmit={submit} noValidate>
        <TextField label="Display name" value={form.name} onChange={set('name')} placeholder="e.g. Live server 1" error={error} data-autofocus />
        <SelectField
          label="Server type"
          options={[
            { value: 'real', label: 'Live (real money)' },
            { value: 'demo', label: 'Demo' },
          ]}
          value={form.kind}
          onChange={set('kind')}
        />
        <Grid>
          <TextField label="Server address" value={form.host} onChange={set('host')} placeholder="mt5.yourbroker.com" hint="Host name or IP of the MT5 access server" />
          <TextField label="Port" inputMode="numeric" value={form.port} onChange={set('port')} />
        </Grid>
        <TextField label="Manager login" inputMode="numeric" value={form.managerLogin} onChange={set('managerLogin')} hint="Numeric login of a manager account with API access" />
        <SecretField label="Manager password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        <TextField label="Timeout (seconds)" inputMode="numeric" value={form.timeout} onChange={set('timeout')} />
        <Callout>
          Use a dedicated manager account with only the permissions the CRM needs (create accounts, read groups, balance operations), and allow
          your CRM server&apos;s IP on the MT5 side.
        </Callout>
      </form>
    </Drawer>
  )
}

function ServerCard({ server, onEdit, onChanged }) {
  const toast = useToast()
  const [busy, setBusy] = useState(null)
  const [open, setOpen] = useState(server.groups.length > 0)
  const [tone, label] = STATUS[server.status] ?? STATUS['not-tested']

  async function run(kind) {
    setBusy(kind)
    try {
      if (kind === 'test') {
        const r = await testServer(server.id)
        toast(r.status === 'connected' ? `${server.name}: connected` : `${server.name}: connection failed`, { tone: r.status === 'connected' ? 'success' : 'info' })
      } else if (kind === 'sync') {
        const groups = await syncGroups(server.id)
        setOpen(true)
        toast(`${groups.length} groups synced from ${server.name}`)
      } else {
        await deleteServer(server.id)
        toast(`${server.name} removed`)
      }
      onChanged()
    } catch (err) {
      toast(err.message, { tone: 'info' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <Section
      title={
        <span className={styles.serverHead}>
          <span className={styles.serverName}>{server.name}</span>
          <StatusBadge state={server.kind === 'demo' ? 'none' : 'open'} label={server.kind === 'demo' ? 'Demo' : 'Live'} />
          <StatusBadge state={tone} label={label} />
        </span>
      }
      description={
        <>
          <span className={styles.serverMeta}>{server.host ? `${server.host}:${server.port} · manager ${server.managerLogin || '—'}` : 'Not configured yet'}</span>
          {server.statusMessage && (
            <>
              <br />
              <span className={server.status === 'connected' ? styles.resultOk : styles.resultErr}>{server.statusMessage}</span>
            </>
          )}
        </>
      }
      actions={
        <div className={styles.serverActions}>
          <Button variant="secondary" className={a.small} onClick={onEdit}>
            Edit
          </Button>
          <Button variant="secondary" className={a.small} onClick={() => run('test')} disabled={Boolean(busy)}>
            {busy === 'test' ? 'Testing…' : 'Test connection'}
          </Button>
          <Button className={a.small} onClick={() => run('sync')} disabled={Boolean(busy) || server.status !== 'connected'}>
            {busy === 'sync' ? 'Syncing…' : 'Sync groups'}
          </Button>
          <Button variant="secondary" className={`${a.small} ${a.danger}`} onClick={() => run('delete')} disabled={Boolean(busy)}>
            Remove
          </Button>
        </div>
      }
    >
      {server.groups.length === 0 ? (
        <p className={a.muted}>
          {server.status === 'connected' ? 'Connected. Sync groups to load them from MT5.' : 'Enter the connection details, test the connection, then sync groups.'}
        </p>
      ) : (
        <>
          <button type="button" className={styles.textButton} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {server.groups.length} groups · synced {dateTime(server.syncedAt)}{' '}
            <ChevronDown size={14} style={{ verticalAlign: 'middle', transform: open ? 'rotate(180deg)' : undefined }} />
          </button>
          {open && (
            <div className={`${a.tableWrap} ${styles.groupsTable}`}>
              <table className={a.table}>
                <thead>
                  <tr>
                    <th scope="col">Group</th>
                    <th scope="col">Currency</th>
                    <th scope="col" className={a.num}>Max leverage</th>
                    <th scope="col" className={a.num}>Margin call</th>
                    <th scope="col" className={a.num}>Stop out</th>
                    <th scope="col" className={a.num}>Accounts</th>
                  </tr>
                </thead>
                <tbody>
                  {server.groups.map((g) => (
                    <tr key={g.path}>
                      <td>
                        <code>{g.path}</code>
                      </td>
                      <td>{g.currency}</td>
                      <td className={a.num}>1:{g.leverage}</td>
                      <td className={a.num}>{g.marginCall}%</td>
                      <td className={a.num}>{g.stopOut}%</td>
                      <td className={a.num}>{g.accounts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Section>
  )
}

export default function ServersSettings() {
  const [servers, setServers] = useState(null)
  const [editing, setEditing] = useState(null) // server object, 'new', or null

  const load = useCallback(() => {
    listServers().then(setServers)
  }, [])
  useEffect(load, [load])

  return (
    <>
      <Section
        title="MT5 servers"
        description="Connect your MetaTrader 5 servers through the Manager API. Synced groups are used when the CRM creates trading accounts."
        actions={
          <Button className={a.small} icon={<Plus />} onClick={() => setEditing('new')}>
            Add server
          </Button>
        }
      >
        <Callout>
          Connections are made by your CRM backend, never by the browser. Credentials are stored encrypted on the server. This screen is a mock:
          any valid-looking host, a numeric manager login and a password will connect (a host containing &quot;offline&quot; simulates a timeout).
        </Callout>
      </Section>

      {servers?.map((s) => (
        <ServerCard key={`${s.id}-${s.status}-${s.syncedAt}`} server={s} onEdit={() => setEditing(s)} onChanged={load} />
      ))}

      {editing && (
        <ServerDrawer
          server={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </>
  )
}
