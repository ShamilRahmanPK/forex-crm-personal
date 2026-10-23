import { useLayoutEffect, useRef, useState } from 'react'
import styles from './BarChart.module.css'

const HEIGHT = 320
const PAD = { top: 16, right: 8, bottom: 32, left: 56 }

/** Rounds the axis maximum up to a 1/2/5 × 10^n step so ticks are readable. */
function niceStep(max) {
  if (max <= 0) return 1
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}

/** Top-rounded (or bottom-rounded for negatives) bar path anchored at the baseline. */
function barPath(x, w, yBase, yTip, r) {
  const h = Math.abs(yBase - yTip)
  const rr = Math.min(r, w / 2, h)
  if (yTip <= yBase) {
    return `M${x},${yBase}V${yTip + rr}Q${x},${yTip} ${x + rr},${yTip}H${x + w - rr}Q${x + w},${yTip} ${x + w},${yTip + rr}V${yBase}Z`
  }
  return `M${x},${yBase}V${yTip - rr}Q${x},${yTip} ${x + rr},${yTip}H${x + w - rr}Q${x + w},${yTip} ${x + w},${yTip - rr}V${yBase}Z`
}

/**
 * Single-series bar chart with a zero baseline and per-bar hover tooltip.
 * data: [{ label, value }]; format(value) renders tooltip/axis values.
 */
export default function BarChart({ data, format = String, title, tooltipLabel = 'Value' }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(800)
  const [hover, setHover] = useState(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const values = data.map((d) => d.value)
  const step = niceStep(Math.max(Math.abs(Math.min(0, ...values)), Math.max(0, ...values)) || 4)
  const maxV = Math.max(step * 4, Math.ceil(Math.max(0, ...values) / step) * step)
  const minV = Math.min(0, Math.floor(Math.min(0, ...values) / step) * step)

  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const y = (v) => PAD.top + ((maxV - v) / (maxV - minV)) * plotH
  const slot = plotW / Math.max(1, data.length)
  const barW = Math.max(2, Math.min(28, slot - 2))

  const ticks = []
  for (let v = minV; v <= maxV + 1e-9; v += step) ticks.push(v)
  // Show at most ~8 x labels.
  const labelEvery = Math.ceil(data.length / 8)

  return (
    <figure className={styles.figure}>
      <div ref={ref} className={styles.wrap} onMouseLeave={() => setHover(null)}>
        <svg width={width} height={HEIGHT} role="img" aria-label={title}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? styles.baseline : styles.grid} />
              <text x={PAD.left - 10} y={y(t)} className={styles.axis} textAnchor="end" dominantBaseline="middle">
                {format(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = PAD.left + slot * i + slot / 2
            const active = hover === i
            return (
              <g key={d.label}>
                {/* Hover column: larger than the mark so thin bars are easy to target */}
                <rect
                  x={PAD.left + slot * i}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  className={active ? styles.hoverCol : styles.hitCol}
                  onMouseEnter={() => setHover(i)}
                />
                {d.value !== 0 && (
                  <path d={barPath(cx - barW / 2, barW, y(0), y(d.value), 4)} className={styles.bar} pointerEvents="none" />
                )}
                {i % labelEvery === 0 && (
                  <text x={cx} y={HEIGHT - 8} className={styles.axis} textAnchor="middle">
                    {d.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {hover !== null && (
          <div
            className={styles.tooltip}
            style={{
              left: Math.min(width - 160, PAD.left + slot * hover + slot / 2 + 12),
              top: Math.max(0, y(Math.max(0, data[hover].value)) - 12),
            }}
          >
            <span className={styles.tipLabel}>{data[hover].label}</span>
            <span>
              {tooltipLabel} {format(data[hover].value)}
            </span>
          </div>
        )}
      </div>

      {/* Accessible table view of the same data */}
      <details className={styles.table}>
        <summary>Show data table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">{tooltipLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
