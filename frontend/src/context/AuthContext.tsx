import { createContext, useContext, type ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface User {
  id?: number
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
  refetchUser: () => Promise<User | null>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Axios global interceptor for 401 Unauthorized
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn("Session expired or unauthorized.")
          setUser(null)
          
          // Only redirect if they are on a protected route
          const protectedRoutes = ['/profile', '/dashboard', '/admin', '/checkout', '/wishlist']
          if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
             window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )

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

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  const refetchUser = async (): Promise<User | null> => {
    try {
      const response = await axios.get('/api/v1/auth/me')
      setUser(response.data)
      return response.data
    } catch {
      setUser(null)
      return null
    }
  }

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
       // Navigate to home without reloading page to preserve Theme State
       navigate('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refetchUser, isLoading }}>
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
