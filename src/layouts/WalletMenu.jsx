import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet } from '../components/icons'
import Button from '../components/ui/Button'
import Toggle from '../components/ui/Toggle'
import { useAccounts } from '../hooks/useAccounts'
import { useDismiss } from '../hooks/useDismiss'
import styles from './PortalLayout.module.css'

const HIDE_KEY = 'crm.hideBalance'
const MASK = '••••'
const money = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function readHidden() {
  try {
    return localStorage.getItem(HIDE_KEY) === '1'
  } catch {
    return false
  }
}

/** Header balance button with a popover of real-account balances. */
export default function WalletMenu() {
  const navigate = useNavigate()
  const { accounts, reload } = useAccounts()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(readHidden)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const real = (accounts ?? []).filter((a) => a.mode === 'real')
  const total = real.reduce((t, a) => t + a.balance, 0)
  const currency = real[0]?.currency ?? 'USD'
  const show = (v) => (hidden ? MASK : money(v))

  function toggleHidden(next) {
    setHidden(next)
    try {
      localStorage.setItem(HIDE_KEY, next ? '1' : '0')
    } catch {
      // ignore
    }
  }

  const go = (path) => {
    close()
    navigate(path)
  }

  return (
    <div className={styles.userMenu} ref={ref}>
      <button
        type="button"
        className={`${styles.walletButton} ${open ? styles.walletOpen : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) reload()
          setOpen((o) => !o)
        }}
      >
        <Wallet size={18} className={styles.walletIcon} />
        <span className={styles.walletLabel}>Wallet</span>
        <strong>
          {show(total)} {currency}
        </strong>
      </button>

      {open && (
        <div className={`${styles.popover} ${styles.walletPopover}`} role="dialog" aria-label="Wallet">
          <div className={styles.walletRow}>
            <span>Hide balance</span>
            <Toggle checked={hidden} onChange={toggleHidden} label="Hide balance" />
          </div>
          {real.length === 0 ? (
            <p className={styles.popoverEmail}>No real accounts yet</p>
          ) : (
            real.map((a) => (
              <div key={a.id} className={styles.walletAccount}>
                <p className={styles.walletAmount}>
                  {show(a.balance)} {a.currency}
                </p>
                <p className={styles.walletMeta}>
                  Trading account
                  <br />#{a.id}
                </p>
              </div>
            ))
          )}
          {real[0] && (
            <div className={styles.walletActions}>
              <Button variant="secondary" onClick={() => go(`/pa/payments-and-wallet/transfer?login=${real[0].id}`)}>
                Transfer
              </Button>
              <Button variant="secondary" onClick={() => go(`/pa/payments-and-wallet/withdrawal?login=${real[0].id}`)}>
                Withdraw
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
