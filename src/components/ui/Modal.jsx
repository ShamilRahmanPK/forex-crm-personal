import { useId } from 'react'
import { createPortal } from 'react-dom'
import { Close } from '../icons'
import styles from './Modal.module.css'
import { useDialog } from './useDialog'

/** `note` renders centred below the footer buttons (e.g. a security message). */
export default function Modal({ open, onClose, eyebrow, icon, title, subtitle, children, footer, note, showClose = false, width = 700 }) {
  const panelRef = useDialog(open, onClose)
  const titleId = useId()

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.panel}
        style={{ maxWidth: width }}
      >
        {showClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <Close size={24} />
          </button>
        )}
        {icon && <div className={styles.icon}>{icon}</div>}
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 id={titleId} className={`${styles.title} ${showClose ? styles.titleWithClose : ''}`}>
          {title}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
        {note && <div className={styles.note}>{note}</div>}
      </div>
    </div>,
    document.body,
  )
}
