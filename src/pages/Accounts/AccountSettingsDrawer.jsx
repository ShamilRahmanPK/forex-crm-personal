import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  ChevronRight,
  Cube,
  Curve,
  Download,
  EyeClosed,
  Layers,
  Lock,
  Transfer,
  TypeIcon,
} from '../../components/icons'
import Button from '../../components/ui/Button'
import CopyButton from '../../components/ui/CopyButton'
import Drawer from '../../components/ui/Drawer'
import TextField from '../../components/ui/TextField'
import * as api from '../../services/api'
import { isPasswordValid } from '../../utils/validation'
import PasswordField from '../Auth/PasswordField'
import styles from './AccountSettings.module.css'

function Row({ icon: Icon, label, hint, value, tag, onClick }) {
  return (
    <li>
      <button type="button" className={styles.row} onClick={onClick}>
        <span className={styles.rowIcon}>
          <Icon size={24} />
        </span>
        <span className={styles.rowLabel}>
          {label}
          {hint && <small>{hint}</small>}
        </span>
        {tag && <span className={styles.tag}>{tag}</span>}
        {value && <span className={styles.rowValue}>{value}</span>}
        <ChevronRight size={20} />
      </button>
    </li>
  )
}

const TITLES = {
  password: 'Trading password',
  leverage: 'Max leverage',
  readOnly: 'Read-only access',
  nickname: 'Nickname',
  statements: 'Statements',
  type: 'Account type',
}

/**
 * Account settings side panel. `initialView` lets callers deep-link into a
 * sub-view (e.g. the card's "Change trading password" link).
 */
export default function AccountSettingsDrawer({ account, initialView = 'main', onClose, onUpdated, onArchived }) {
  const navigate = useNavigate()
  const [view, setView] = useState(initialView)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [password, setPassword] = useState('')
  const [leverage, setLeverage] = useState(account.leverage)
  const [nickname, setNickname] = useState(account.nickname)

  const go = (next) => {
    setError('')
    setNotice('')
    setView(next)
  }

  async function run(task, successMessage) {
    setSaving(true)
    setError('')
    try {
      await task()
      setNotice(successMessage)
      setView('main')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const save = (patch, message) =>
    run(async () => onUpdated(await api.updateAccount(account.id, patch)), message)

  async function archive() {
    setSaving(true)
    await api.archiveAccount(account.id)
    setSaving(false)
    onArchived(account.id)
  }

  const isMain = view === 'main'
  const modeLabel = account.mode === 'real' ? 'Real' : 'Demo'

  const footer = isMain ? (
    <>
      <Button variant="secondary" icon={<Archive />} onClick={archive} disabled={saving}>
        Archive
      </Button>
      <Button variant="secondary" icon={<Transfer />} onClick={() => navigate(`/pa/payments-and-wallet/transfer?login=${account.id}`)}>
        Transfer
      </Button>
    </>
  ) : null

  return (
    <Drawer
      open
      onClose={onClose}
      onBack={isMain ? undefined : () => go('main')}
      title={isMain ? 'Settings' : TITLES[view]}
      subtitle={`Account: #${account.id}`}
      footer={footer}
    >
      {notice && isMain && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {isMain && (
        <>
          <div className={styles.platformCard}>
            <div className={styles.platformHead}>
              <span className={styles.rowIcon}>
                <Layers size={24} />
              </span>
              <span className={styles.rowLabel}>Platform</span>
              <span>{account.platform}</span>
            </div>
            <dl className={styles.kv}>
              <div>
                <dt>Server</dt>
                <span className={styles.leader} aria-hidden="true" />
                <dd>
                  {account.server}
                  <CopyButton value={account.server} label="server" />
                </dd>
              </div>
              <div>
                <dt>{account.platform} login</dt>
                <span className={styles.leader} aria-hidden="true" />
                <dd>
                  {account.id}
                  <CopyButton value={account.id} label="login" />
                </dd>
              </div>
            </dl>
          </div>

          <ul className={styles.rows}>
            <Row icon={Cube} label={`${account.type} account`} tag={modeLabel} onClick={() => go('type')} />
            <Row icon={Lock} label="Trading password" onClick={() => go('password')} />
            <Row icon={Curve} label="Max leverage" value={`1:${account.leverage}`} onClick={() => go('leverage')} />
            <Row icon={EyeClosed} label="Read-only access" value={account.readOnlyAccess ? 'Active' : 'Inactive'} onClick={() => go('readOnly')} />
            <Row icon={TypeIcon} label="Nickname" hint="Optional" value={account.nickname} onClick={() => go('nickname')} />
          </ul>
          <ul className={`${styles.rows} ${styles.rowsSeparated}`}>
            <Row icon={Download} label="Statements" onClick={() => go('statements')} />
          </ul>
        </>
      )}

      {view === 'type' && (
        <dl className={styles.kvPlain}>
          <div>
            <dt>Account type</dt>
            <dd>{account.type}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{modeLabel}</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>{account.currency}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      )}

      {view === 'password' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            if (!isPasswordValid(password)) return setError('Password does not meet the requirements')
            run(() => api.changeTradingPassword(account.id, password), 'Trading password changed')
          }}
          noValidate
        >
          <p className={styles.help}>This password is used to sign in to the trading terminal for this account only.</p>
          <PasswordField value={password} onChange={setPassword} autoComplete="new-password" maxLength={15} showRules error={error} />
          <Button type="submit" block disabled={saving}>
            {saving ? 'Saving…' : 'Change password'}
          </Button>
        </form>
      )}

      {view === 'leverage' && (
        <div className={styles.form}>
          <p className={styles.help}>Higher leverage increases both potential profit and potential loss.</p>
          <div role="radiogroup" aria-label="Max leverage" className={styles.options}>
            {api.LEVERAGE_OPTIONS.map((opt) => (
              <label key={opt} className={`${styles.option} ${leverage === opt ? styles.optionActive : ''}`}>
                <input type="radio" name="leverage" value={opt} checked={leverage === opt} onChange={() => setLeverage(opt)} />
                1:{opt}
              </label>
            ))}
          </div>
          <Button block disabled={saving || leverage === account.leverage} onClick={() => save({ leverage }, 'Max leverage updated')}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}

      {view === 'readOnly' && (
        <div className={styles.form}>
          <p className={styles.help}>
            Read-only access lets someone view this account&apos;s trading activity with an investor password, without
            being able to place trades.
          </p>
          <Button
            block
            variant={account.readOnlyAccess ? 'secondary' : 'primary'}
            disabled={saving}
            onClick={() =>
              save(
                { readOnlyAccess: !account.readOnlyAccess },
                account.readOnlyAccess ? 'Read-only access turned off' : 'Read-only access turned on',
              )
            }
          >
            {account.readOnlyAccess ? 'Turn off read-only access' : 'Turn on read-only access'}
          </Button>
        </div>
      )}

      {view === 'nickname' && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            save({ nickname: nickname.trim() || account.type }, 'Nickname updated')
          }}
        >
          <TextField label="Nickname" value={nickname} maxLength={30} onChange={(e) => setNickname(e.target.value)} data-autofocus />
          <Button type="submit" block disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </form>
      )}

      {view === 'statements' && (
        <div className={styles.form}>
          <p className={styles.help}>Download a statement of all trades, deposits and withdrawals for a period.</p>
          {['Last 7 days', 'Last 30 days', 'Last 90 days'].map((period) => (
            <Button key={period} variant="secondary" block icon={<Download />}>
              {period}
            </Button>
          ))}
        </div>
      )}
    </Drawer>
  )
}
