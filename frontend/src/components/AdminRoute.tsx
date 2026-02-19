import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { type ReactNode } from 'react'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user || !user.is_superuser) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
