import { useId, useState } from 'react'
import { Close, FileText, Upload } from '../icons'
import styles from './FileDrop.module.css'

const MAX = 10 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf']
const formatSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`)

/** Click-or-drop single file input with type/size validation. */
export default function FileDrop({ label, hint = 'JPG, PNG, HEIC or PDF up to 10 MB', file, onChange, error }) {
  const id = useId()
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  function accept(f) {
    if (!f) return
    if (!ACCEPT.includes(f.type)) return setLocalError('Unsupported file type')
    if (f.size > MAX) return setLocalError('File must be 10 MB or smaller')
    setLocalError('')
    onChange(f)
  }

  const message = localError || error

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {file ? (
        <div className={styles.file}>
          <FileText size={24} />
          <span className={styles.fileName}>
            {file.name}
            <small>{formatSize(file.size)}</small>
          </span>
          <button type="button" onClick={() => onChange(null)} aria-label={`Remove ${file.name}`}>
            <Close size={18} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`${styles.drop} ${dragging ? styles.dragging : ''} ${message ? styles.invalid : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            accept(e.dataTransfer.files[0])
          }}
        >
          <Upload size={24} />
          <span>
            <strong>Click to upload</strong> or drag and drop
          </span>
          <small>{hint}</small>
          <input id={id} type="file" accept={ACCEPT.join(',')} className="visually-hidden" onChange={(e) => accept(e.target.files[0])} />
        </label>
      )}
      {message && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
