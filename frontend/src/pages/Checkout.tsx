import { useState, useEffect, type FormEvent } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CreditCard, ShieldCheck, CheckCircle, Sparkles, ArrowRight, Wallet, Shield, Truck, RefreshCw } from 'lucide-react'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { user, isLoading: loading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const coupon = location.state?.coupon as { code: string, discount_percent: number, max_discount_amount?: number } | undefined
  
  // total is already destructured from useCart()
  const calculatedDiscount = coupon ? (total * coupon.discount_percent / 100) : 0
  const discountAmount = coupon?.max_discount_amount
    ? Math.min(calculatedDiscount, coupon.max_discount_amount)
    : calculatedDiscount
  const finalTotal = total - discountAmount

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    paymentMethod: 'mock_card'
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
        navigate('/login')
    }
    // Automatically skip step 1 if user exists
    if (user && step === 1) {
        setStep(2)
    }
  }, [user, loading, navigate, step])

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            fullName: user.full_name || user.name || 'Customer',
            email: user.email || '',
        }))
    }
  }, [user])

  if (loading) return <div className="p-8 text-center dark:text-gray-300">Loading...</div>

  if (cart.length === 0) {
     return (
        <div className="container mx-auto px-4 py-8 pt-32 text-center">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Your cart is empty</h1>
            <button onClick={() => navigate('/')} className="text-primary hover:text-primary-hover font-medium">Go Shopping</button>
        </div>
     )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
        const data = new FormData()
        data.append('full_name', formData.fullName)
        data.append('email', formData.email)
        data.append('payment_method', formData.paymentMethod)
        
        // Items as JSON string
        const items = cart.map(item => ({ id: item.id, quantity: item.quantity }))
        data.append('items', JSON.stringify(items))

        if (coupon) {
            data.append('coupon_code', coupon.code)
        }

        if (file) {
            data.append('payment_proof', file)
        } else {
            toast.error('Please upload payment proof')
             setIsSubmitting(false)
             return
        }

        const response = await axios.post('/api/v1/orders/', data, {
            withCredentials: true
        })
        
        console.log('Order created:', response.data)
         clearCart()
         queryClient.invalidateQueries({ queryKey: ['my-orders'] })
         queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
         queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
         toast.success('Order placed successfully! 🎉')
         navigate('/order-success')
    } catch (error: unknown) {
        console.error("Order failed", error.response?.data || error)
         toast.error(error.response?.data?.detail || 'Failed to place order. Please try again.')
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28 max-w-5xl bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-foreground font-display uppercase tracking-tight">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main checkout flow */}
        <div className="flex-1 min-w-0">
          <div className="mb-12 w-full mx-auto relative px-2 md:px-6">
            <div className="absolute top-4 left-6 right-6 h-1 bg-surface-hover rounded-full z-0" />
            <motion.div 
              className="absolute top-4 left-6 h-1 bg-primary rounded-full z-0"
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex justify-between relative z-10 w-full">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center relative">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-md ${
                      s < step ? 'bg-primary text-white' : s === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface border-2 border-border/50 text-foreground/50'
                    }`}
                  >
                    {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className={`absolute top-10 whitespace-nowrap text-xs font-semibold ${s <= step ? 'text-foreground' : 'text-foreground/40'}`}>
                    {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border/50 rounded-3xl shadow-xl overflow-hidden relative min-h-[450px]">
        <AnimatePresence mode="wait">
          {step === 1 && !user && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 h-full flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Contact Details
              </h2>
              <div className="space-y-6 flex-grow">
                <div>
                  <label htmlFor="full-name" className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                  <input 
                      id="full-name" type="text" required placeholder="Enter your full name"
                      className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                  <input 
                      id="email" type="email" required placeholder="Enter your email"
                      className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-8 pt-4">
                <button 
                  onClick={() => {
                    if (formData.fullName && formData.email) setStep(2)
                    else toast.error('Please fill in your details')
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 h-full flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </h2>
              <div className="space-y-6 flex-grow">
                <div>
                  <label htmlFor="payment-method" className="block text-sm font-semibold text-gray-400 mb-2">Select Method</label>
                  <select 
                      id="payment-method"
                      className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all"
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                      <option value="mock_card">Bank Transfer / Manual Payment</option>
                      <option value="crypto" disabled>Cryptocurrency (Coming Soon)</option>
                  </select>
                </div>
                <div className="bg-background/50 border border-border/30 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <label htmlFor="payment-proof" className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" /> Upload Payment Proof
                  </label>
                  <p className="text-xs text-gray-400 mb-4 tracking-wide leading-relaxed">
                     Please attach a clear screenshot of your bank transfer receipt or payment confirmation.
                  </p>
                  <input 
                      id="payment-proof" type="file" accept="image/*" required
                      className="w-full text-sm text-gray-400
                         file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0
                         file:text-sm file:font-semibold file:tracking-wide file:bg-primary/20 file:text-primary
                         hover:file:bg-primary/30 cursor-pointer transition-colors"
                      onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) setFile(f)
                      }}
                  />
                  {file && <p className="mt-3 text-xs text-success font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> File attached: {file.name}</p>}
                </div>
              </div>
              <div className="mt-8 pt-4 flex gap-3">
                {!user && (
                  <button onClick={() => setStep(1)} className="px-5 py-3.5 rounded-xl border border-border/50 text-foreground hover:bg-surface-hover font-medium transition-colors">
                    Back
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (file) setStep(3)
                    else toast.error('Please upload your payment proof')
                  }}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 h-full flex flex-col"
            >
              <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Order Summary
              </h2>
              <div className="flex-grow">
                <div className="border-b border-border/50 pb-6 mb-6">
                    <p className="flex justify-between font-bold text-gray-400 mb-2">
                        <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                        <span className="text-foreground">{total.toFixed(2)} EGP</span>
                    </p>
                    {coupon && (
                        <p className="flex justify-between text-success font-bold mb-2">
                            <span>Discount ({coupon.code})</span>
                            <span>-{discountAmount.toFixed(2)} EGP</span>
                        </p>
                    )}
                    <p className="flex justify-between font-black text-2xl mt-4 text-primary">
                        <span>Total Cost</span>
                        <span>{finalTotal.toFixed(2)} EGP</span>
                    </p>
                </div>
                <div className="space-y-3 mb-6 bg-background rounded-xl p-4 border border-border/30 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Proof:</span>
                    <span className="font-medium text-success flex items-center gap-1">Attached <CheckCircle className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 flex gap-3">
                <button disabled={isSubmitting} onClick={() => setStep(2)} className="px-5 py-3.5 rounded-xl border border-border/50 text-foreground hover:bg-surface-hover font-medium transition-colors disabled:opacity-50">
                  Back
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-black py-3.5 px-4 rounded-xl shadow-[0_0_15px_-3px_var(--color-primary)] transition-all uppercase tracking-widest text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Processing...' : <><Wallet className="w-4 h-4" /> Confirm & Pay</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: Shield, label: 'Secure Payment', desc: 'Encrypted transfer' },
          { icon: Truck, label: 'Fast Delivery', desc: 'Instant or 24h' },
          { icon: RefreshCw, label: 'Support', desc: '24/7 assistance' },
        ].map(badge => (
          <div key={badge.label} className="flex flex-col items-center text-center p-3 bg-surface/50 border border-border/30 rounded-xl">
            <badge.icon className="w-5 h-5 text-primary mb-1.5" />
            <span className="text-xs font-semibold text-foreground">{badge.label}</span>
            <span className="text-[10px] text-gray-500">{badge.desc}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Sticky Order Summary Sidebar */}
    <div className="w-full lg:w-80 shrink-0">
      <div className="lg:sticky lg:top-28 space-y-4">
        <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground/70 truncate mr-2">
                  {item.name} <span className="text-gray-500">x{item.quantity}</span>
                </span>
                <span className="font-semibold text-foreground whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} EGP</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-foreground font-medium">{total.toFixed(2)} EGP</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-sm">
                <span className="text-success">Discount ({coupon.code})</span>
                <span className="text-success font-medium">-{discountAmount.toFixed(2)} EGP</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black pt-2 border-t border-border/30">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{finalTotal.toFixed(2)} EGP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-2">
          <Lock className="w-3 h-3" />
          <span>Secure checkout &middot; SSL encrypted</span>
        </div>
      </div>
    </div>
  </div>
    </div>
  )
}
