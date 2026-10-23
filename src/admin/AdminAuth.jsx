import { createContext, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { adminSignIn, ROLES } from './api'

const KEY = 'crm.adminSession'
const AdminAuthContext = createContext(null)

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

/** Staff session, kept separate from the client portal session. */
export function AdminAuthProvider({ children }) {
  const [staff, setStaff] = useState(read)

  const value = useMemo(
    () => ({
      staff,
      can: (area) => Boolean(staff && ROLES[staff.role]?.can.includes(area)),
      async signIn(credentials) {
        const member = await adminSignIn(credentials)
        try {
          localStorage.setItem(KEY, JSON.stringify(member))
        } catch {
          // ignore
        }
        setStaff(member)
      },
      signOut() {
        try {
          localStorage.removeItem(KEY)
        } catch {
          // ignore
        }
        setStaff(null)
      },
    }),
    [staff],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return ctx
}

/** Gate for /admin routes; `area` also checks the staff member's role. */
export function RequireAdmin({ area, children }) {
  const { staff, can } = useAdminAuth()
  const location = useLocation()
  if (!staff) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (area && !can(area)) return <Navigate to="/admin" replace />
  return children
}
