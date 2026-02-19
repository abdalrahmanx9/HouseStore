import { createContext, useContext, type ReactNode, useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  email: string
  name?: string
  full_name?: string
  picture?: string
  is_superuser?: boolean
}

interface AuthContextType {
  user: User | null
  login: () => void
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/v1/auth/me')
        console.log('AuthContext: User fetched', response.data)
        setUser(response.data)
      } catch (error) {
        console.error('AuthContext: Fetch failed', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = () => {
    // We must prompt the user to login with Google
    // We redirect to the backend endpoint directly
    window.location.assign('http://localhost:8000/api/v1/auth/login')
  }

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout')
      setUser(null)
    } finally {
       // Optional: clean up local state or redirect
       window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
