import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle, Close } from './icons'
import styles from './Toast.module.css'

const ToastContext = createContext(() => {})

/** Lightweight success/info toasts: `const toast = useToast(); toast('Saved')`. */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), [])
  const show = useCallback(
    (message, { tone = 'success', duration = 4000 } = {}) => {
      const id = Math.random().toString(36).slice(2)
      setItems((list) => [...list, { id, message, tone }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tone]}`}>
            {t.tone === 'success' && <CheckCircle size={20} />}
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <Close size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
