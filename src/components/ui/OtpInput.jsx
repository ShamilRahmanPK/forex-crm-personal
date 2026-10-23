import { useEffect, useRef } from 'react'
import styles from './OtpInput.module.css'

/** Segmented numeric code input. Supports typing, backspace, arrows and paste. */
export default function OtpInput({ length = 6, value, onChange, invalid = false, disabled = false }) {
  const refs = useRef([])
  const groupRef = useRef(null)

  // When the code is cleared (e.g. after a rejected attempt), put the caret
  // back in the first box. Disabling the inputs drops focus to <body>.
  useEffect(() => {
    if (value || disabled) return
    const active = document.activeElement
    if (active === document.body || groupRef.current?.contains(active)) refs.current[0]?.focus()
  }, [value, disabled])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  function setDigit(i, digit) {
    const next = digits.slice()
    next[i] = digit
    onChange(next.join('').slice(0, length))
  }

  function handleChange(i, e) {
    const input = e.target.value.replace(/\D/g, '')
    if (!input) return
    if (input.length > 1) {
      // Autofill or fast typing: spread across boxes from here.
      const next = (value.slice(0, i) + input).slice(0, length)
      onChange(next)
      focus(next.length)
      return
    }
    setDigit(i, input)
    focus(i + 1)
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) setDigit(i, '')
      else if (i > 0) {
        setDigit(i - 1, '')
        focus(i - 1)
      }
    } else if (e.key === 'ArrowLeft') focus(i - 1)
    else if (e.key === 'ArrowRight') focus(i + 1)
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    e.preventDefault()
    onChange(pasted)
    focus(pasted.length)
  }

  return (
    <div ref={groupRef} className={styles.group} role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`${styles.box} ${invalid ? styles.invalid : ''}`}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          data-autofocus={i === 0 ? '' : undefined}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}
