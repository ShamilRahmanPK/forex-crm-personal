import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/accounts/sign-in" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}
