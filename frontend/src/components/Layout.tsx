import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart, LogIn, Store, Moon, Sun } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Layout() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true // Default to dark
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
        root.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        root.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }
  }, [isDark])
  
  console.log('Layout Render:', { user })

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
            <Store className="w-6 h-6 text-blue-600" />
            <span>StoreWeb</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
              Products
            </Link>
            
            <Link to="/cart" className="relative group">
              <div className="p-2 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {user && user.is_superuser && (
                <Link to="/admin" className="text-red-600 hover:text-red-800 font-bold transition-colors">
                    Admin
                </Link>
            )}

            {user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                    <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">
                        Dashboard
                    </Link>
                    <button onClick={() => logout()} className="text-gray-600 dark:text-gray-300 hover:text-red-600 font-medium transition-colors cursor-pointer">
                        Logout
                    </button>
                </div>
            ) : (
                <Link 
                  to="/login"
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
