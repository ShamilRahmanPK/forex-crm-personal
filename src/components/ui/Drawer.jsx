import { useId } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, Close } from '../icons'
import styles from './Drawer.module.css'
import { useDialog } from './useDialog'

/** Right-hand side panel. Pass `onBack` to show a back arrow for nested views. */
export default function Drawer({ open, onClose, onBack, title, subtitle, children, footer }) {
  const panelRef = useDialog(open, onClose)
  const titleId = useId()

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.heading}>
            {onBack && (
              <button type="button" className={styles.iconButton} onClick={onBack} aria-label="Back">
                <ChevronLeft size={24} />
              </button>
            )}
            <div>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <Close size={26} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </aside>
    </div>,
    document.body,
  )
}
