import { useBrand } from '../context/BrandContext'
import styles from './LegalFooter.module.css'

/** Disclaimer paragraphs on the left, legal links on the right. */
export default function LegalFooter({ links, children }) {
  const brand = useBrand()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.text}>{children ?? brand.regulatoryFull.map((p) => <p key={p}>{p}</p>)}</div>
      <div className={styles.aside}>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
        <p className={styles.copyright}>
          © {brand.copyrightStart}-{year}. {brand.name}
        </p>
      </div>
    </footer>
  )
}
