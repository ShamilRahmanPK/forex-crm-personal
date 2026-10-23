import { useEffect } from 'react'

/** Calls onDismiss on outside mousedown or Escape while `active`. */
export function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return
    const onMouseDown = (e) => !ref.current?.contains(e.target) && onDismiss()
    const onKeyDown = (e) => e.key === 'Escape' && onDismiss()
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, active, onDismiss])
}
