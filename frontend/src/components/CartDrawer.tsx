import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Button } from './ui/Button'
import { useNavigate } from 'react-router-dom'

export function CartDrawer() {
  const { isCartOpen, closeCart, cart, total, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface border-l border-border shadow-2xl sm:max-w-md will-change-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Your Cart</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <ShoppingBag className="w-12 h-12 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Your cart is empty</h3>
                  <p className="text-sm text-gray-500">Looks like you haven't added anything yet.</p>
                  <Button onClick={closeCart} className="mt-4">Start Shopping</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 group"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface-hover flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-border-subtle" />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="flex justify-between w-full">
                          <div>
                            <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <p className="font-bold text-foreground ml-4 shrink-0">{item.price} EGP</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 border border-border rounded-lg bg-surface p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-surface-hover rounded text-gray-500 hover:text-foreground"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-surface-hover rounded text-gray-500 hover:text-foreground"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-danger transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-border/50 bg-surface p-6 space-y-4">
                <div className="flex justify-between text-base font-medium text-foreground">
                  <p>Subtotal</p>
                  <p>{total.toFixed(2)} EGP</p>
                </div>
                <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="grid gap-2">
                  <Button 
                    className="w-full h-12 text-base" 
                    onClick={() => {
                        closeCart()
                        navigate('/checkout')
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
