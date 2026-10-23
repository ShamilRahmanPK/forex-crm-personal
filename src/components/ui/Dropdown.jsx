import { useCallback, useId, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { ChevronDown } from '../icons'
import styles from './Dropdown.module.css'

/**
 * Single-select menu button.
 * variant: 'outline' (bordered, like a select) | 'pill' (rounded filter chip)
 * `active` renders the pill in its filled state (a non-default filter).
 */
export default function Dropdown({ label, icon, options, value, onChange, variant = 'outline', active = false, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const menuId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const current = options.find((o) => o.value === value)

  function onMenuKeyDown(e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...ref.current.querySelectorAll('[role=menuitemradio]')]
    const i = items.indexOf(document.activeElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${styles[variant]} ${active ? styles.active : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label ? `${label}: ${current?.label}` : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span>{current?.label ?? label}</span>
        <ChevronDown size={18} className={open ? styles.rotated : undefined} />
      </button>
      {open && (
        <div id={menuId} role="menu" className={`${styles.menu} ${styles[align]}`} onKeyDown={onMenuKeyDown}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              className={`${styles.item} ${o.value === value ? styles.itemActive : ''}`}
              onClick={() => {
                onChange(o.value)
                close()
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
