/** Splits 1234.5 into { whole: '1,234', fraction: '50' } for the large/small balance display. */
export function splitAmount(amount) {
  const [whole, fraction] = amount
    .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .split('.')
  return { whole, fraction }
}

/** john.doe@mail.com -> j****e@mail.com */
export function maskEmail(email = '') {
  const [local, domain] = email.split('@')
  if (!domain) return email
  return `${local[0]}****${local.length > 1 ? local.at(-1) : ''}@${domain}`
}

/** ISO 3166 alpha-2 code -> flag emoji (regional indicator symbols). */
export const countryFlag = (code) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))

/** Renders "[text](href)" markup in config strings as links. */
export function linkify(text) {
  const parts = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index), { text: m[1], href: m[2] })
    last = m.index + m[0].length
  }
  parts.push(text.slice(last))
  return parts.filter((p) => p !== '')
}

export const formatMoney = (amount, currency) =>
  `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
