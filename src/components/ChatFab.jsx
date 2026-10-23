import { Chat } from './icons'
import styles from './ChatFab.module.css'

export default function ChatFab({ onClick }) {
  return (
    <button type="button" className={styles.fab} onClick={onClick} aria-label="Open live chat">
      <Chat size={26} />
    </button>
  )
}
