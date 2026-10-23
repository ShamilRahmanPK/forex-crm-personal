// Onboarding stages in order. `status` is the persisted per-user object:
// { email, phone, profile, questionnaire, identity, address }
// identity/address are false or { status: 'pending' | 'approved' | 'rejected', ... }.
// Fired by the admin panel after a staff decision (same tab); other tabs get
// the browser's 'storage' event.
export const VERIFICATION_EVENT = 'crm:verification-updated'
export const verificationKey = (userId) => `crm.verification.${userId}`

export const EMPTY_STATUS = { email: false, phone: false, profile: false, questionnaire: false, identity: false, address: false }

export const contactDone = (s) => Boolean(s.email && s.phone)
export const profileDone = (s) => Boolean(s.profile && s.questionnaire)
export const personalDone = (s) => contactDone(s) && profileDone(s)

/** 'none' | 'pending' | 'approved' | 'rejected' for a document check. */
export function docState(value) {
  if (!value) return 'none'
  if (value === true) return 'approved'
  return value.status ?? 'none'
}

/** Verification-page steps completed (personal details, identity, address). */
export function stepsComplete(s) {
  return [personalDone(s), docState(s.identity) === 'approved', docState(s.address) === 'approved'].filter(Boolean).length
}

/** Fraction of onboarding completed, 0..1, for the banner ring. */
export function progress(s) {
  const parts = [s.email, s.phone, profileDone(s), docState(s.identity) === 'approved', docState(s.address) === 'approved']
  return parts.filter(Boolean).length / parts.length
}

/** Which dialog to open when the user (re)starts verification. */
export function entryView(s) {
  if (!contactDone(s)) return 'overview'
  if (!s.profile) return 'profile'
  if (!s.questionnaire) return 'question'
  const identity = docState(s.identity)
  if (identity === 'none' || identity === 'rejected') return 'complete'
  if (identity === 'pending') return 'kyc-submitted'
  const address = docState(s.address)
  if (address === 'none' || address === 'rejected') return 'address-upload'
  if (address === 'pending') return 'address-submitted'
  return null
}
