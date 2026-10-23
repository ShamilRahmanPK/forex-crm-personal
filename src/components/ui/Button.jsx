import { Link } from 'react-router-dom'
import styles from './Button.module.css'

/**
 * variant: 'primary' (yellow) | 'secondary' (grey) | 'ghost'
 * size:    'md' | 'lg'
 * Renders a router <Link> when `to` is given, otherwise a <button>.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  to,
  className = '',
  children,
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  )
}
