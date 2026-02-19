import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Trash, Tag, X } from 'lucide-react'
import axios from 'axios'

export default function CartPage() {
  const { cart: items, removeFromCart, updateQuantity } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount_percent: number, max_discount_amount?: number } | null>(null)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const calculatedDiscount = appliedCoupon ? (total * appliedCoupon.discount_percent / 100) : 0
  const discountAmount = appliedCoupon?.max_discount_amount 
    ? Math.min(calculatedDiscount, appliedCoupon.max_discount_amount) 
    : calculatedDiscount
  const finalTotal = total - discountAmount

  const handleApplyCoupon = async () => {
      setCouponError('')
      if (!couponCode.trim()) return

      try {
          const res = await axios.post('/api/v1/coupons/validate', null, { params: { code: couponCode } })
          setAppliedCoupon(res.data)
          setCouponCode('')
      } catch (err: any) {
          setAppliedCoupon(null)
          setCouponError(err.response?.data?.detail || 'Invalid coupon')
      }
  }

  const removeCoupon = () => {
      setAppliedCoupon(null)
      setCouponCode('')
      setCouponError('')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Your Cart is Empty</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {item.image_url && <img src={`http://localhost:8000/${item.image_url}`} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">{item.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">EGP {item.price}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded dark:border-gray-600">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >-</button>
                  <span className="px-3 py-1 dark:text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                  >+</button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-4">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between dark:text-gray-300">
                <span>Subtotal</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
               {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-EGP {discountAmount.toFixed(2)}</span>
                  </div>
              )}
              <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold text-lg dark:text-white">
                <span>Total</span>
                <span>EGP {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Input */}
            <div className="mb-6">
                {!appliedCoupon ? (
                    <div className="flex space-x-2">
                        <input 
                            placeholder="Promo Code" 
                            className="flex-1 border dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={!couponCode}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                        >
                            Apply
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-800">
                        <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center">
                            <Tag className="w-4 h-4 mr-1"/> {appliedCoupon.code} applied
                        </span>
                        <button onClick={removeCoupon} className="text-gray-500 hover:text-red-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            <Link 
              to="/checkout" 
              state={{ coupon: appliedCoupon }} // Pass coupon to checkout
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
