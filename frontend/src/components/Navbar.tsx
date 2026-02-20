import { Link } from 'react-router-dom'
import { ShoppingBag, LogIn, Moon, Sun, Store, Shield } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { cart, openCart } = useCart()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return true
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pt-4 px-4 pointer-events-none">
      <header 
        className={`pointer-events-auto transition-all duration-500 ease-out border overflow-hidden ${
          isScrolled 
            ? 'w-full max-w-4xl h-16 rounded-full backdrop-blur-xl bg-surface/80 border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
            : 'w-full max-w-7xl h-20 rounded-3xl bg-surface/30 backdrop-blur-sm border-border/30 shadow-sm'
        }`}
      >
        <div className={`w-full h-full flex items-center justify-between transition-all duration-500 ${isScrolled ? 'px-6' : 'px-6 md:px-8'}`}>
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity">
              <div className={`p-1.5 rounded-lg transition-colors ${isScrolled ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <Store className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display tracking-tight text-foreground">House</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-1 ml-4">
              <Link to="/"><Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">Home</Button></Link>
              <a href="/#trending"><Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">Trending</Button></a>
              <a href="/#categories"><Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground">Categories</Button></a>
            </div>
          </div>

          <nav className="flex items-center space-x-2 md:space-x-3">
            <a href="https://discord.gg/7ynMbDb9m7" target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-indigo-500/10 text-indigo-500 transition-colors hidden sm:block" title="Join our Discord">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
            </a>
            <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-surface text-foreground/70 hover:text-foreground transition-colors"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button onClick={openCart} className="relative p-2 rounded-full hover:bg-surface text-foreground/70 hover:text-foreground transition-colors">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0 -right-0"
                  >
                    <Badge variant="destructive" className="w-[18px] h-[18px] p-0 flex items-center justify-center text-[10px] ring-2 ring-background">
                      {cartCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {user ? (
                <div className="flex items-center space-x-2 md:space-x-3 ml-2 border-l border-border/50 pl-2">
                    <Link to="/profile">
                        <Button variant="ghost" size="sm" className="hidden md:inline-flex rounded-full">Profile</Button>
                    </Link>
                    {!user.is_superuser && (
                        <Link to="/dashboard">
                            <Button variant="ghost" size="sm" className="hidden md:inline-flex rounded-full">Orders</Button>
                        </Link>
                    )}
                    {user.is_superuser && (
                        <Link to="/admin">
                          <Button variant="secondary" size="sm" className="hidden md:inline-flex gap-2 rounded-full">
                            <Shield className="w-4 h-4" /> Admin
                          </Button>
                        </Link>
                    )}
                    <Button variant="outline" size="sm" onClick={() => logout()} className="rounded-full hidden sm:inline-flex">
                        Logout
                    </Button>
                </div>
            ) : (
                <Link to="/login" className="ml-2">
                    <Button size="sm" className="gap-2 rounded-full px-6 font-bold shadow-md shadow-primary/20 transition-transform active:scale-95">
                        <LogIn className="w-4 h-4" />
                        Login
                    </Button>
                </Link>
            )}
          </nav>
        </div>
      </header>
    </div>
  )
}
