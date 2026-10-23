import { useEffect, useState } from 'react'
import { Check, Copy } from '../icons'
import styles from './CopyButton.module.css'

export default function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Clipboard blocked (insecure context); nothing useful to do.
    }
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${copied ? styles.copied : ''}`}
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? 'Copied' : 'Copy'}
    >
      {copied ? <Check size={20} /> : <Copy size={20} />}
    </button>
  )
}
