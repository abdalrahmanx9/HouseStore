import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus, Store, Mail, Lock, User } from 'lucide-react'
import axios from 'axios'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Manual Login
        const params = new URLSearchParams()
        params.append('username', formData.email)
        params.append('password', formData.password)
        
        await axios.post('/api/v1/auth/manual-login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        // Refresh auth context so user state is populated
        const user = await refetchUser()
        if (user) {
          navigate(user.is_superuser ? '/admin' : '/dashboard')
        }
      } else {
        // Register
        await axios.post('/api/v1/auth/register', {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name
        })
        // Auto switch to login
        setIsLogin(true)
        setError('Account created! Please sign in.')
      }
    } catch (err: unknown) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding Side */}
      <div className="hidden md:flex w-1/2 bg-surface border-r border-border/50 p-12 flex-col justify-between relative overflow-hidden">
         {/* Abstract background elements */}
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 text-2xl font-black text-foreground hover:opacity-80 transition-opacity w-fit">
               <div className="p-2 bg-primary/10 rounded-xl">
                 <Store className="w-6 h-6 text-primary" /> 
               </div>
               House
            </Link>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-24 max-w-lg"
            >
               <h1 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight mb-6">
                  Your Gateway to <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Premium Digital Assets</span>
               </h1>
               <p className="text-lg text-gray-400">Join thousands of professionals accelerating their workflow with our curated tools.</p>
            </motion.div>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-gray-500">
            <span>© 2026 House</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>Secure Enterprise Login</span>
         </div>
      </div>
      
      {/* Right Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 md:hidden">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
               <div className="p-1.5 bg-primary/10 rounded-lg">
                 <Store className="w-5 h-5 text-primary" /> 
               </div>
               House
            </Link>
        </div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="w-full max-w-md space-y-8"
        >
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {isLogin ? 'Enter your details to sign in to your account' : 'Enter your details to create your account'}
            </p>
          </div>

          <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-4 rounded-xl text-sm font-semibold border ${error.includes('created') ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}
                >
                  {error}
                </motion.div>
              )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="sync">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative mt-2">
                       <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <Input
                         type="text"
                         required
                         placeholder="John Doe"
                         className="pl-10 h-12"
                         value={formData.full_name}
                         onChange={e => setFormData({...formData, full_name: e.target.value})}
                       />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
            
            <div>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input
                   type="email"
                   required
                   placeholder="m@example.com"
                   className="pl-10 h-12"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                 />
              </div>
            </div>

            <div>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <Input
                   type="password"
                   required
                   placeholder="••••••••"
                   className="pl-10 h-12"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                 />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 h-12 shadow-md gap-2"
              disabled={isLoading}
            >
              {isLogin ? (
                  <><LogIn className="w-4 h-4" /> {isLoading ? 'Signing In...' : 'Sign In'}</>
              ) : (
                  <><UserPlus className="w-4 h-4" /> {isLoading ? 'Creating Account...' : 'Sign Up'}</>
              )}
            </Button>
          </form>

          <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-gray-500 font-medium">Or continue with</span>
              </div>
          </div>

          <Button
              variant="outline"
              size="lg"
              className="w-full h-12 bg-surface text-foreground font-semibold hover:bg-surface-hover hover:text-foreground"
              onClick={login}
          >
              <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Sign in with Google
          </Button>

          <div className="text-center mt-8">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-sm text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
