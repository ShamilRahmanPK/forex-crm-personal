import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../context/AuthContext'
import { useBrand } from '../../context/BrandContext'
import { readConfig } from '../../services/platformConfig'
import { docState, EMPTY_STATUS, entryView, VERIFICATION_EVENT } from './stages'
import VerificationFlow from './VerificationFlow'

const VerificationContext = createContext(null)

const storageKey = (userId) => `crm.verification.${userId}`
const PROMPTED_KEY = 'crm.verification.prompted'
// Mock only: how long the simulated compliance review takes when
// brand.kyc.mockAutoApprove is on. Normally staff review in the admin panel.
const MOCK_REVIEW_MS = 6000


function read(key) {
  try {
    return { ...EMPTY_STATUS, ...JSON.parse(localStorage.getItem(key)) }
  } catch {
    return EMPTY_STATUS
  }
}

export function VerificationProvider({ children }) {
  const { user } = useAuth()
  const brand = useBrand()
  const toast = useToast()
  const autoApprove = Boolean(brand.kyc.mockAutoApprove || readConfig().kyc.autoApprove)
  // In-memory updates keyed by user id; falls back to persisted status.
  const [byUser, setByUser] = useState({})
  // Which dialog is showing; null when the flow is closed.
  const [view, setView] = useState(null)
  const status = !user ? EMPTY_STATUS : (byUser[user.id] ?? read(storageKey(user.id)))

  const complete = useCallback(
    (step, data) => {
      setByUser((prev) => {
        const current = prev[user.id] ?? read(storageKey(user.id))
        const next = { ...current, [step]: data ?? true }
        try {
          localStorage.setItem(storageKey(user.id), JSON.stringify(next))
        } catch {
          // ignore
        }
        return { ...prev, [user.id]: next }
      })
    },
    [user],
  )

  // Staff decisions made in the admin panel: drop the cache and re-read storage.
  useEffect(() => {
    const refresh = (e) => {
      if (e.type === 'storage' && !e.key?.startsWith('crm.verification.')) return
      setByUser({})
    }
    window.addEventListener(VERIFICATION_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(VERIFICATION_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Mock reviewer (optional): approve pending documents after a short delay.
  const identityPending = autoApprove && docState(status.identity) === 'pending'
  const addressPending = autoApprove && docState(status.address) === 'pending'
  useEffect(() => {
    if (!identityPending) return
    const t = setTimeout(() => {
      complete('identity', { ...status.identity, status: 'approved' })
      toast('Your identity is verified. Deposits are now unlocked.')
    }, MOCK_REVIEW_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityPending])
  useEffect(() => {
    if (!addressPending) return
    const t = setTimeout(() => {
      complete('address', { ...status.address, status: 'approved' })
      toast('Your address is verified. Your account is fully verified.')
    }, MOCK_REVIEW_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressPending])

  // Deposits and trading unlock after identity verification.
  const isVerified = docState(status.identity) === 'approved'

  const value = useMemo(
    () => ({
      status,
      isVerified,
      startVerification: () => setView(entryView(status)),
      startIdentity: () => setView('kyc-intro'),
      startAddress: () => setView('address-upload'),
      // Opens the flow once per browser session for users still onboarding.
      promptOnce: () => {
        const entry = entryView(status)
        if (!entry || entry === 'complete' || entry.endsWith('submitted') || entry === 'address-upload') return
        try {
          if (sessionStorage.getItem(PROMPTED_KEY)) return
          sessionStorage.setItem(PROMPTED_KEY, '1')
        } catch {
          return
        }
        setView(entry)
      },
    }),
    [status, isVerified],
  )

  return (
    <VerificationContext.Provider value={value}>
      {children}
      {user && <VerificationFlow view={view} setView={setView} status={status} onComplete={complete} email={user.email} />}
    </VerificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVerification() {
  const ctx = useContext(VerificationContext)
  if (!ctx) throw new Error('useVerification must be used inside <VerificationProvider>')
  return ctx
}
