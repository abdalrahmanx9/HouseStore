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
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Your cart is empty</h1>
            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline dark:text-blue-400">Go Shopping</button>
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
    <div className="container mx-auto px-4 py-8 max-w-2xl bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <p className="flex justify-between font-medium dark:text-gray-300">
                <span>Total Items:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </p>
            <p className="flex justify-between text-gray-600 dark:text-gray-400 mt-2">
                <span>Subtotal:</span>
                <span>EGP {total.toFixed(2)}</span>
            </p>
            {coupon && (
                <p className="flex justify-between text-green-600 dark:text-green-400 mt-1">
                    <span>Discount ({coupon.code}):</span>
                    <span>-EGP {discountAmount.toFixed(2)}</span>
                </p>
            )}
            <p className="flex justify-between font-bold text-lg mt-2 dark:text-white">
                <span>Total Cost:</span>
                <span>EGP {finalTotal.toFixed(2)}</span>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                    type="text" 
                    required
                    placeholder="Full Name"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    placeholder="Email Address"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                    <option value="mock_card">Bank Transfer / Manual Payment</option>
                    <option value="crypto">Cryptocurrency (Coming Soon)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Proof (Screenshot)</label>
                <input 
                    type="file" 
                    accept="image/*"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                            setFile(file)
                        }
                    }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please upload a screenshot of your payment receipt.</p>
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 transition-colors mt-6 cursor-pointer disabled:opacity-50"
            >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
        </form>
      </div>
    </div>
  )
}
