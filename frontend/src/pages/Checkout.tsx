import { useState, type FormEvent, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { user, isLoading: loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const coupon = location.state?.coupon as { code: string, discount_percent: number, max_discount_amount?: number } | undefined
  
  // total is already destructured from useCart()
  const calculatedDiscount = coupon ? (total * coupon.discount_percent / 100) : 0
  const discountAmount = coupon?.max_discount_amount
    ? Math.min(calculatedDiscount, coupon.max_discount_amount)
    : calculatedDiscount
  const finalTotal = total - discountAmount

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
  }, [user, loading, navigate])

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            email: user.email,
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
            alert("Please upload payment proof")
            setIsSubmitting(false)
            return
        }

        const response = await axios.post('/api/v1/orders/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        
        console.log('Order created:', response.data)
        clearCart()
        alert('Order placed successfully!')
        navigate('/')
    } catch (error) {
        console.error("Order failed", error)
        alert("Failed to place order. Check console.")
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28 max-w-2xl bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-foreground font-display uppercase tracking-tight">Checkout</h1>
      
      <div className="bg-surface border border-border/50 rounded-3xl shadow-xl p-8">
        <h2 className="text-xl font-black mb-6 text-foreground tracking-tight uppercase">Order Summary</h2>
        <div className="border-b border-border/50 pb-6 mb-8">
            <p className="flex justify-between font-bold text-gray-400 mb-2">
                <span>Total Items</span>
                <span className="text-foreground">{cart.reduce((sum, item) => sum + item.quantity, 0)} Units</span>
            </p>
            <p className="flex justify-between text-gray-400 font-bold mb-2">
                <span>Subtotal</span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="full-name" className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                <input 
                    id="full-name"
                    type="text" 
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
            </div>
            
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                <input 
                    id="email"
                    type="email" 
                    required
                    placeholder="Enter your email"
                    className="w-full bg-surface-hover border border-border/50 rounded-xl px-4 py-3 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-500"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div>
                <label htmlFor="payment-method" className="block text-sm font-semibold text-gray-400 mb-2">Payment Method</label>
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

            <div className="bg-background/50 border border-border/30 rounded-2xl p-6">
                <label htmlFor="payment-proof" className="block text-sm font-semibold text-foreground mb-2">Payment Proof</label>
                <p className="text-xs text-gray-400 mb-4 tracking-wide leading-relaxed">
                   Upload a clear screenshot of your bank transfer receipt or payment confirmation.
                </p>
                <input 
                    id="payment-proof"
                    type="file" 
                    accept="image/*"
                    required
                    className="w-full text-sm text-gray-400
                       file:mr-4 file:py-2.5 file:px-6
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold file:tracking-wide
                       file:bg-primary/20 file:text-primary
                       hover:file:bg-primary/30 cursor-pointer file:cursor-pointer file:transition-colors transition-colors"
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                            setFile(file)
                        }
                    }}
                />
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-black py-4 px-4 rounded-xl shadow-[0_0_15px_-3px_var(--color-primary)] transition-all uppercase tracking-widest text-sm active:scale-[0.98] mt-8 disabled:opacity-50"
            >
                {isSubmitting ? 'Transmitting...' : 'Confirm Order & Pay'}
            </button>
        </form>
      </div>
    </div>
  )
}
