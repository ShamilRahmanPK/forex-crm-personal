import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../services/api'

const STORAGE_KEY = 'crm.session'
const AuthContext = createContext(null)

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function writeSession(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable (private mode); session lives in memory only.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const authenticate = useCallback(async (request, payload) => {
    const nextUser = await request(payload)
    writeSession(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const value = useMemo(
    () => ({
      user,
      signIn: (payload) => authenticate(api.signIn, payload),
      signUp: (payload) => authenticate(api.signUp, payload),
      signOut: () => {
        writeSession(null)
        setUser(null)
      },
    }),
    [user, authenticate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
