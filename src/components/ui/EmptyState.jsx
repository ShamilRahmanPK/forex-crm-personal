import styles from './EmptyState.module.css'

export default function EmptyState({ icon, title, text, action, size = 'md' }) {
  return (
    <div className={`${styles.empty} ${styles[size]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
