import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus } from 'lucide-react'
import axios from 'axios'

export default function LoginPage() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      if (isLogin) {
        // Manual Login
        const params = new URLSearchParams()
        params.append('username', formData.email)
        params.append('password', formData.password)
        
        await axios.post('/api/v1/auth/manual-login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        const meRes = await axios.get('/api/v1/auth/me')
        const user = meRes.data
        window.location.href = user.is_superuser ? '/admin' : '/dashboard' 
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className={`mb-4 p-3 rounded ${error.includes('created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLogin ? (
                <> <LogIn className="w-4 h-4 mr-2" /> Sign In </>
            ) : (
                <> <UserPlus className="w-4 h-4 mr-2" /> Sign Up </>
            )}
          </button>
        </form>

        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={login}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                    Sign in with Google
                </button>
            </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}
