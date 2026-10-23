import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from '../../components/icons'
import Button from '../../components/ui/Button'
import Segmented from '../../components/ui/Segmented'
import { getAccounts } from '../../services/api'
import AccountCard from './AccountCard'
import AccountSettingsDrawer from './AccountSettingsDrawer'
import styles from './Accounts.module.css'

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt)

export default function AccountsPage() {
  const [params, setParams] = useSearchParams()
  const [accounts, setAccounts] = useState(null)
  // Which card is expanded; undefined = default (the first one), null = none.
  const [expandedId, setExpandedId] = useState(undefined)
  // { id, view } of the account whose settings drawer is open.
  const [settings, setSettings] = useState(null)

  const mode = params.get('mode') === 'demo' ? 'demo' : 'real'
  const setMode = (m) => {
    setExpandedId(undefined)
    setParams(m === 'real' ? {} : { mode: m }, { replace: true })
  }

  useEffect(() => {
    let active = true
    getAccounts().then((data) => active && setAccounts(data))
    return () => {
      active = false
    }
  }, [])

  const visible = useMemo(() => (accounts ?? []).filter((a) => a.mode === mode).sort(newestFirst), [accounts, mode])
  const openId = expandedId === undefined ? visible[0]?.id : expandedId
  const settingsAccount = settings && accounts?.find((a) => a.id === settings.id)

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Accounts</h1>
        <div className={styles.actions}>
          <Segmented
            label="Account type"
            variant="outline"
            options={[
              { value: 'real', label: 'Live' },
              { value: 'demo', label: 'Demo' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Button variant="secondary" icon={<Plus />} to={`/pa/new-account?server=${mode}`}>
            Open account
          </Button>
        </div>
      </div>

      <div className={styles.list} aria-busy={!accounts}>
        {!accounts && <div className={styles.skeleton} />}
        {accounts && visible.length === 0 && (
          <div className={styles.empty}>
            <p>You don&apos;t have any {mode === 'real' ? 'live' : 'demo'} accounts yet.</p>
            <Button to={`/pa/new-account?server=${mode}`} icon={<Plus />}>
              Open {mode === 'real' ? 'live' : 'demo'} account
            </Button>
          </div>
        )}
        {visible.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            expanded={account.id === openId}
            onToggle={() => setExpandedId(account.id === openId ? null : account.id)}
            onOpenSettings={() => setSettings({ id: account.id, view: 'main' })}
          />
        ))}
      </div>

      {settingsAccount && (
        <AccountSettingsDrawer
          key={`${settings.id}-${settings.view}`}
          account={settingsAccount}
          initialView={settings.view}
          onClose={() => setSettings(null)}
          onUpdated={(updated) => setAccounts((list) => list.map((a) => (a.id === updated.id ? updated : a)))}
          onArchived={(id) => {
            setSettings(null)
            setAccounts((list) => list.filter((a) => a.id !== id))
          }}
        />
      )}
    </div>
  )
}
