import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from '../../components/icons'
import Button from '../../components/ui/Button'
import CopyButton from '../../components/ui/CopyButton'
import { formatMoney, splitAmount } from '../../utils/format'
import styles from './Accounts.module.css'
import TradeDialog from './TradeDialog'

/** One trading account. Collapsed: a single summary row. Expanded: stats + actions. */
export default function AccountCard({ account, expanded, onToggle, onOpenSettings }) {
  const navigate = useNavigate()
  const { whole, fraction } = splitAmount(account.balance)
  const payment = (path) => navigate(`/pa/payments-and-wallet/${path}?login=${account.id}`)
  const [trading, setTrading] = useState(false)
  const trade = () => setTrading(true)
  const detailsId = `account-${account.id}-details`
  const plClass = account.floatingPL > 0 ? styles.positive : account.floatingPL < 0 ? styles.negative : undefined

  return (
    <article className={`${styles.card} ${expanded ? styles.cardOpen : ''}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardName}>
          <span className={styles.name}>{account.nickname}</span>
          <span className={styles.meta}>
            #{account.id} · {account.platform}
            {account.type !== account.nickname && ` · ${account.type}`}
          </span>
        </div>
        {!expanded && <span className={styles.leverage}>1:{account.leverage}</span>}
        <p className={styles.balance}>
          {whole}
          <span>
            .{fraction} {account.currency}
          </span>
        </p>
        {!expanded && (
          <Button className={styles.compactButton} onClick={trade}>
            Trade
          </Button>
        )}
        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={detailsId}
          aria-label={expanded ? `Collapse ${account.nickname}` : `Expand ${account.nickname}`}
        >
          <ChevronDown size={18} className={expanded ? styles.rotated : undefined} />
        </button>
      </div>

      {expanded && (
        <div id={detailsId}>
          <dl className={styles.stats}>
            <div>
              <dt>Equity</dt>
              <dd>{formatMoney(account.equity, account.currency)}</dd>
            </div>
            <div>
              <dt>Floating P/L</dt>
              <dd className={plClass}>
                {account.floatingPL > 0 ? '+' : ''}
                {formatMoney(account.floatingPL, account.currency)}
              </dd>
            </div>
            <div>
              <dt>Free margin</dt>
              <dd>{formatMoney(account.freeMargin, account.currency)}</dd>
            </div>
            <div>
              <dt>Leverage</dt>
              <dd>1:{account.leverage}</dd>
            </div>
            <div>
              <dt>Server</dt>
              <dd className={styles.copyable}>
                {account.server}
                <CopyButton value={account.server} label="server" />
              </dd>
            </div>
          </dl>

          <div className={styles.cardActions}>
            <Button className={styles.compactButton} onClick={trade}>
              Trade
            </Button>
            <Button variant="secondary" className={styles.compactButton} onClick={() => payment('deposit')}>
              Deposit
            </Button>
            <Button variant="secondary" className={styles.compactButton} onClick={() => payment('withdrawal')}>
              Withdraw
            </Button>
            <Button variant="secondary" className={styles.compactButton} onClick={() => payment('transfer')}>
              Transfer
            </Button>
            <span className={styles.spacer} />
            <button type="button" className={styles.settingsLink} onClick={onOpenSettings}>
              Account settings
            </button>
          </div>
        </div>
      )}

      {trading && <TradeDialog account={account} onClose={() => setTrading(false)} />}
    </article>
  )
}
