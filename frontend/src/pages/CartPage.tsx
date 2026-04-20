import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Trash, Tag, X, ShoppingBag, Store } from 'lucide-react'
import { Button } from '../components/ui/Button'
import axios, { type AxiosError } from 'axios'

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
      } catch (err: unknown) {
          setAppliedCoupon(null)
          setCouponError((err as AxiosError<{ detail: string }>)?.response?.data?.detail || 'Invalid coupon')
      }
  }

  const removeCoupon = () => {
      setAppliedCoupon(null)
      setCouponCode('')
      setCouponError('')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pt-28 text-center bg-background min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="p-6 bg-primary/10 rounded-full mb-2">
          <ShoppingBag className="w-16 h-16 text-primary/40" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Your bag is feeling light!</h1>
        <p className="text-gray-400 max-w-sm">Browse our curated collection of premium digital assets and fill it up.</p>
        <Link to="/">
          <Button className="gap-2 rounded-full px-8 mt-2 shadow-lg shadow-primary/20">
            <Store className="w-4 h-4" /> Explore Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28 bg-background min-h-screen max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-foreground font-display uppercase tracking-tight">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-surface border border-border/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm" />}
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{item.name}</h3>
                  <p className="text-gray-400 font-medium">{item.price} EGP</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-surface-hover rounded-xl p-1 border border-border/30">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background text-foreground transition-colors font-bold"
                  >-</button>
                  <span className="w-8 text-center text-foreground font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background text-foreground transition-colors font-bold"
                  >+</button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors bg-surface-hover border border-border/30"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface border border-border/50 p-6 rounded-[2rem] shadow-xl sticky top-28">
            <h2 className="text-xl font-bold mb-6 text-foreground font-display uppercase tracking-tight">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400 font-medium">
                <span>Subtotal</span>
                <span className="text-foreground">{total.toFixed(2)} EGP</span>
              </div>
               {appliedCoupon && (
                  <div className="flex justify-between text-success font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-{discountAmount.toFixed(2)} EGP</span>
                  </div>
              )}
              <div className="border-t border-border/50 pt-4 flex justify-between font-black text-xl text-foreground">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Coupon Input */}
            <div className="mb-6">
                {!appliedCoupon ? (
                    <div className="flex space-x-2">
                        <input 
                            placeholder="Promo Code" 
                            className="flex-1 border-none bg-surface-hover rounded-xl px-4 py-3 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={!couponCode}
                            className="bg-primary/20 text-primary border border-primary/30 font-bold px-6 py-3 rounded-xl hover:bg-primary/30 disabled:opacity-50 text-sm uppercase tracking-wider"
                        >
                            Apply
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-success/10 p-3 rounded-xl border border-success/30">
                        <span className="text-success text-sm font-bold flex items-center">
                            <Tag className="w-4 h-4 mr-1.5"/> {appliedCoupon.code} applied
                        </span>
                        <button onClick={removeCoupon} className="text-success hover:text-success/70 transition-colors p-1 bg-success/10 rounded-full">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {couponError && <p className="text-danger font-medium text-xs mt-2 ml-1">{couponError}</p>}
            </div>

            <Link 
              to="/checkout" 
              state={{ coupon: appliedCoupon }} // Pass coupon to checkout
              className="block w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-center py-4 rounded-xl font-black transition-all uppercase tracking-widest text-sm shadow-[0_0_15px_-3px_var(--color-primary)] active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
