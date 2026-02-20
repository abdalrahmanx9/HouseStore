import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useComparison } from '../context/ComparisonContext'
import { useCart } from '../context/CartContext'
import { Button } from './ui/Button'
import { toast } from 'sonner'

export default function ProductComparisonModal() {
  const { compareItems, removeFromCompare, clearCompare, isCompareModalOpen, setCompareModalOpen } = useComparison()
  const { addToCart } = useCart()

  if (!isCompareModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCompareModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-surface/50">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Compare Products</h2>
              <p className="text-sm text-foreground/50 mt-1">
                {compareItems.length} of 4 selected.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {compareItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCompare} className="hidden sm:flex">
                  Clear All
                </Button>
              )}
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-hover text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {compareItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4 border border-border/50">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Nothing to compare</h3>
                <p className="text-foreground/50 text-sm mt-1 max-w-sm">
                  Add products to compare their features, pricing, and availability side-by-side.
                </p>
                <Button className="mt-6" onClick={() => setCompareModalOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex min-w-max gap-6">
                  {/* Features Column */}
                  <div className="w-48 shrink-0 flex flex-col text-sm font-medium text-foreground/60 pt-48 hidden md:flex">
                    <div className="h-14 border-b border-border/50 flex items-center">Price</div>
                    <div className="h-14 border-b border-border/50 flex items-center">Category</div>
                    <div className="h-14 border-b border-border/50 flex items-center">Availability</div>
                    <div className="h-14 border-b border-border/50 flex items-center">Description</div>
                  </div>

                  {/* Product Columns */}
                  {compareItems.map(product => (
                    <div key={product.id} className="w-64 sm:w-72 shrink-0 flex flex-col relative bg-background rounded-2xl border border-border/50 p-4 shadow-sm">
                      <button 
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors z-10 backdrop-blur-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Product Header */}
                      <div className="h-40 relative rounded-xl overflow-hidden bg-surface-hover mb-4 group cursor-pointer" onClick={() => { window.location.href = `/products/${product.id}` }}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-4xl text-foreground/10">
                            {product.name[0]}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <h4 className="absolute bottom-3 left-3 right-3 font-bold text-white text-base leading-tight drop-shadow-md">
                          {product.name}
                        </h4>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-col text-sm text-foreground">
                        <div className="h-14 border-b border-border/50 flex items-center font-bold text-lg text-primary">
                          {product.price} EGP
                        </div>
                        <div className="h-14 border-b border-border/50 flex items-center">
                          <span className="md:hidden text-foreground/50 mr-2">Category:</span>
                          <span className="capitalize px-3 py-1 bg-surface-hover rounded-full text-xs font-semibold">{product.category}</span>
                        </div>
                        <div className="h-14 border-b border-border/50 flex items-center">
                          <span className="md:hidden text-foreground/50 mr-2">Status:</span>
                          {product.is_active ? (
                            <span className="flex items-center gap-1.5 text-success font-medium">
                              <Check className="w-4 h-4" /> Available
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-500 font-medium">
                              <X className="w-4 h-4" /> Sold Out
                            </span>
                          )}
                        </div>
                        <div className="h-20 pt-4 flex items-start text-xs text-foreground/60 line-clamp-3">
                          <span className="md:hidden font-medium text-foreground/50 mr-2">Desc:</span>
                          {product.description || 'No description provided.'}
                        </div>
                      </div>

                      <div className="mt-auto pt-6">
                        <Button 
                          className="w-full gap-2 rounded-xl"
                          disabled={!product.is_active}
                          onClick={() => {
                            addToCart(product)
                            toast.success(`Added ${product.name} to cart`)
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {compareItems.length < 4 && compareItems.length > 0 && (
                    <button 
                      onClick={() => setCompareModalOpen(false)}
                      className="w-64 sm:w-72 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl p-6 bg-surface/30 hover:bg-surface-hover/50 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-foreground/40 mb-3 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        +
                      </div>
                      <p className="text-sm font-medium text-foreground/50 text-center">Click here to continue shopping and add another product</p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
