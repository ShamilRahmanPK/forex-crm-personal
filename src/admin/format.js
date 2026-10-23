// Formatting helpers for back-office screens.
export const usd = (v) => `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
export const dateTime = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—')
export const dateOnly = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—')
export const DOC_LABELS = {
  passport: 'Passport',
  'id-card': 'National ID card',
  'driving-licence': 'Driving licence',
  'utility-bill': 'Utility bill',
  'bank-statement': 'Bank statement',
  tax: 'Tax or government letter',
  tenancy: 'Tenancy agreement',
}
