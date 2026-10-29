import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1015] text-white/50 text-sm">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />
  }

  return children
}

export default ProtectedRoute