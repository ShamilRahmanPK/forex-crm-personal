import { useId } from 'react'
import { Info } from '../icons'
import styles from './InfoTip.module.css'

/** Small (i) button that reveals a tooltip on hover or focus. */
export default function InfoTip({ text }) {
  const id = useId()
  return (
    <span className={styles.wrapper}>
      <button type="button" className={styles.button} aria-describedby={id} aria-label="More information">
        <Info size={16} />
      </button>
      <span role="tooltip" id={id} className={styles.tip}>
        {text}
      </span>
    </span>
  )
}
