import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Shared dialog behaviour for Modal and Drawer: Escape to close, body scroll
 * lock, initial focus inside the panel, focus trap, and focus restore on close.
 */
export function useDialog(open, onClose) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const panel = panelRef.current
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    // Prefer an autofocus target, else the first focusable, else the panel.
    const initial = panel?.querySelector('[data-autofocus]') ?? panel?.querySelector(FOCUSABLE) ?? panel
    initial?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  return panelRef
}
