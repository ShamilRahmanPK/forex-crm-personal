import { Download } from '../../components/icons'
import Button from '../../components/ui/Button'
import CopyButton from '../../components/ui/CopyButton'
import Modal from '../../components/ui/Modal'
import { useBrand } from '../../context/BrandContext'
import styles from './Accounts.module.css'

/** Connection details for trading an account in the broker's platform app. */
export default function TradeDialog({ account, onClose }) {
  const { platform } = useBrand()

  return (
    <Modal
      open
      onClose={onClose}
      title={`Trade on ${platform.name}`}
      subtitle={`Sign in to ${platform.name} with these details to trade account #${account.id}.`}
      showClose
      width={540}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Download />} onClick={() => window.open(platform.downloadUrl, '_blank', 'noopener')}>
            Download {platform.name}
          </Button>
        </>
      }
    >
      <dl className={styles.tradeDetails}>
        <div>
          <dt>Server</dt>
          <dd>
            {account.server}
            <CopyButton value={account.server} label="server" />
          </dd>
        </div>
        <div>
          <dt>Login</dt>
          <dd>
            {account.id}
            <CopyButton value={account.id} label="login" />
          </dd>
        </div>
        <div>
          <dt>Password</dt>
          <dd className={styles.tradeHint}>Your trading password. You can change it in Account settings.</dd>
        </div>
      </dl>
    </Modal>
  )
}
